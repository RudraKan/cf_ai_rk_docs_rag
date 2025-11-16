export interface Env {
  AI: any;
  CHAT: DurableObjectNamespace;
  VECTORIZE: VectorizeIndex;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  citations?: Citation[];
}

interface Citation {
  url: string;
  title: string;
  snippet: string;
  score: number;
}

export class DurableChat implements DurableObject {
  private messages: Message[] = [];
  private state: DurableObjectState;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    
    // Load messages from storage
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage?.get<Message[]>('messages');
      if (stored) this.messages = stored;
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    switch (url.pathname) {
      case '/messages':
        return new Response(JSON.stringify({ messages: this.messages }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      case '/chat':
        if (request.method === 'POST') {
          return this.handleChat(request);
        }
        return new Response('Method not allowed', { status: 405 });
        
      default:
        return new Response('Not found', { status: 404 });
    }
  }

  private async handleChat(request: Request): Promise<Response> {
    try {
      const { message } = await request.json<{ message: string }>();
      
      // Add user message to history
      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: Date.now()
      };
      this.messages.push(userMessage);
      
      // Generate embedding for the user query
      const queryEmbedding = await this.env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: message
      });
      
      // Search Vectorize for relevant documentation
      const matches = await this.env.VECTORIZE.query(queryEmbedding.data[0], {
        topK: 5,
        returnMetadata: true
      });
      
      // Build context from search results
      const citations: Citation[] = matches.matches.map((match: any) => ({
        url: match.metadata.url,
        title: match.metadata.title,
        snippet: match.metadata.content,
        score: match.score
      }));
      
      const context = matches.matches
        .map((match: any, idx: number) => 
          `[${idx + 1}] ${match.metadata.title}\n${match.metadata.content}\nSource: ${match.metadata.url}`
        )
        .join('\n\n');
      
      // Build conversation history for context
      const conversationHistory = this.messages
        .slice(-6) // Last 3 exchanges
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');
      
      // Get AI response using Llama with RAG context
      const systemPrompt = `You are a helpful AI assistant specialized in Cloudflare development documentation. 
You answer questions based on the provided documentation context. Always cite your sources using [1], [2], etc. when referencing specific documentation.
If the answer isn't in the provided context, say so clearly.

RELEVANT DOCUMENTATION:
${context}

CONVERSATION HISTORY:
${conversationHistory}`;
      
      const response = await this.env.AI.run('@cf/mistral/mistral-7b-instruct-v0.1', {
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ]
      });
      
      // Add AI response to history with citations
      const aiMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: Date.now(),
        citations: citations
      };
      this.messages.push(aiMessage);
      
      // Save to storage
      await this.state.storage?.put('messages', this.messages);
      
      return new Response(JSON.stringify(aiMessage), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Chat error:', error);
      return new Response(JSON.stringify({ error: 'Failed to process chat' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}
