import { DurableChat } from './durable-chat';

interface Env {
  CHAT: DurableObjectNamespace;
  AI: any;
  VECTORIZE: VectorizeIndex;
}

// Sample Cloudflare documentation to ingest
const CLOUDFLARE_DOCS = [
  {
    url: 'https://developers.cloudflare.com/workers/',
    title: 'Cloudflare Workers Overview',
    content: 'Cloudflare Workers provides a serverless execution environment that allows you to create entirely new applications or augment existing ones without configuring or maintaining infrastructure. Workers run on Cloudflare\'s global network in hundreds of cities worldwide, offering both free and paid plans.'
  },
  {
    url: 'https://developers.cloudflare.com/workers-ai/',
    title: 'Workers AI',
    content: 'Run machine learning models on Cloudflare\'s global network. Workers AI provides access to popular AI models for tasks like text generation, image classification, embeddings, and more. Models are optimized for serverless execution with pay-per-use pricing.'
  },
  {
    url: 'https://developers.cloudflare.com/vectorize/',
    title: 'Vectorize',
    content: 'Vectorize is Cloudflare\'s vector database for storing and querying embeddings. It enables semantic search and RAG applications. Create indexes, insert vectors with metadata, and query by similarity. Integrates seamlessly with Workers AI for embeddings.'
  },
  {
    url: 'https://developers.cloudflare.com/durable-objects/',
    title: 'Durable Objects',
    content: 'Durable Objects provide low-latency coordination and consistent storage for Workers. Each Object is a single instance with private state, enabling real-time collaboration, game servers, IoT coordination, and more. Objects are automatically migrated close to users.'
  },
  {
    url: 'https://developers.cloudflare.com/r2/',
    title: 'Cloudflare R2',
    content: 'R2 is S3-compatible object storage without egress fees. Store large amounts of unstructured data like images, videos, and backups. Access from Workers, S3-compatible tools, or the API.'
  },
  {
    url: 'https://developers.cloudflare.com/pages/',
    title: 'Cloudflare Pages',
    content: 'Pages is a JAMstack platform for deploying static sites and full-stack applications. Connect your Git repository for automatic deployments. Supports frameworks like Next.js, Astro, SvelteKit, and more.'
  },
  {
    url: 'https://developers.cloudflare.com/d1/',
    title: 'Cloudflare D1',
    content: 'D1 is Cloudflare\'s serverless SQL database built on SQLite. Create databases, run SQL queries, and migrate schemas. Designed for low-latency reads and writes from Workers.'
  },
  {
    url: 'https://developers.cloudflare.com/queues/',
    title: 'Cloudflare Queues',
    content: 'Queues enable asynchronous message passing between Workers. Use for job processing, event streaming, and decoupling services. Supports batch consumption, dead letter queues, and automatic retries.'
  },
  {
    url: 'https://developers.cloudflare.com/workers/wrangler/',
    title: 'Wrangler CLI',
    content: 'Wrangler is the official CLI for Cloudflare Workers. Use it to develop, test, and deploy Workers. Commands include dev for local development, deploy for publishing, tail for live logs, and more.'
  },
  {
    url: 'https://developers.cloudflare.com/workers/configuration/bindings/',
    title: 'Workers Bindings',
    content: 'Bindings allow Workers to interact with Cloudflare resources. Types include KV namespaces, Durable Objects, R2 buckets, D1 databases, AI models, and Queues. Configure in wrangler.toml and access via env parameter.'
  }
];

// Handle documentation ingestion into Vectorize
async function handleDocIngestion(env: Env): Promise<Response> {
  try {
    const vectors = [];
    
    for (let i = 0; i < CLOUDFLARE_DOCS.length; i++) {
      const doc = CLOUDFLARE_DOCS[i];
      
      // Generate embedding for the document content
      const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: doc.content
      });
      
      vectors.push({
        id: `doc-${i}`,
        values: embedding.data[0],
        metadata: {
          url: doc.url,
          title: doc.title,
          content: doc.content
        }
      });
    }
    
    // Insert vectors into Vectorize
    await env.VECTORIZE.upsert(vectors);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Ingested ${vectors.length} documents` 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Admin endpoint to ingest documentation
    if (url.pathname === '/admin/ingest' && request.method === 'POST') {
      return handleDocIngestion(env);
    }
    
    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      const id = env.CHAT.idFromName("default");
      const obj = env.CHAT.get(id);
      const newUrl = new URL(request.url);
      newUrl.pathname = url.pathname.replace('/api', '');
      const forwarded = new Request(newUrl.toString(), request);
      return obj.fetch(forwarded);
    }
    
    // Serve static files from the public directory
    if (request.method === 'GET') {
      try {
        // In production, this will be handled by Pages
        // For local development, we'll serve a simple HTML page
        if (url.pathname === '/' || url.pathname === '') {
          const html = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>CF Docs RAG - AI Documentation Assistant</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  max-width: 900px;
                  margin: 0 auto;
                  padding: 30px 20px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  min-height: 100vh;
                }
                .header {
                  background: white;
                  padding: 30px;
                  border-radius: 12px 12px 0 0;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                  margin-bottom: 0;
                }
                .chat-container {
                  background: white;
                  border-radius: 0 0 12px 12px;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                  overflow: hidden;
                  margin-bottom: 20px;
                }
                .messages {
                  height: 60vh;
                  overflow-y: auto;
                  padding: 20px;
                }
                .message {
                  margin-bottom: 15px;
                  padding: 10px 15px;
                  border-radius: 18px;
                  max-width: 70%;
                  word-wrap: break-word;
                }
                .user-message {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  margin-left: auto;
                  border-bottom-right-radius: 4px;
                  box-shadow: 0 2px 5px rgba(102, 126, 234, 0.3);
                }
                .assistant-message {
                  background: #e9ecef;
                  color: #212529;
                  margin-right: auto;
                  border-bottom-left-radius: 4px;
                }
                .input-area {
                  display: flex;
                  padding: 15px;
                  background: #f8f9fa;
                  border-top: 1px solid #dee2e6;
                }
                #message-input {
                  flex: 1;
                  padding: 10px 15px;
                  border: 1px solid #ced4da;
                  border-radius: 20px;
                  margin-right: 10px;
                  font-size: 16px;
                }
                button {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  border: none;
                  border-radius: 20px;
                  padding: 10px 25px;
                  cursor: pointer;
                  font-weight: 600;
                  transition: transform 0.2s, box-shadow 0.2s;
                  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                }
                button:hover {
                  transform: translateY(-1px);
                  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }
                button:disabled {
                  background: #6c757d;
                  cursor: not-allowed;
                }
                .typing-indicator {
                  display: none;
                  color: #6c757d;
                  font-style: italic;
                  margin: 10px 0;
                }
                .citations {
                  margin-top: 10px;
                  padding-top: 10px;
                  border-top: 1px solid #dee2e6;
                  font-size: 0.85em;
                }
                .citation {
                  margin: 5px 0;
                  padding: 5px;
                  background: #f8f9fa;
                  border-radius: 4px;
                }
                .citation a {
                  color: #007bff;
                  text-decoration: none;
                  font-weight: 500;
                }
                .citation a:hover {
                  text-decoration: underline;
                }
                .citation-score {
                  color: #6c757d;
                  font-size: 0.9em;
                  margin-left: 5px;
                }
                h1 {
                  color: #1a202c;
                  text-align: center;
                  font-size: 2em;
                  margin-bottom: 10px;
                  font-weight: 700;
                }
                .subtitle {
                  text-align: center;
                  color: #4a5568;
                  font-size: 1.1em;
                  margin-bottom: 10px;
                }
                .tech-stack {
                  display: flex;
                  justify-content: center;
                  gap: 15px;
                  flex-wrap: wrap;
                  margin-top: 15px;
                }
                .badge {
                  background: #f7fafc;
                  border: 1px solid #e2e8f0;
                  padding: 6px 12px;
                  border-radius: 20px;
                  font-size: 0.85em;
                  color: #4a5568;
                  font-weight: 500;
                }
                .footer {
                  text-align: center;
                  color: white;
                  padding: 15px;
                  font-size: 0.9em;
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: 8px;
                  backdrop-filter: blur(10px);
                }
                .footer a {
                  color: white;
                  text-decoration: none;
                  font-weight: 600;
                  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
                }
                .footer a:hover {
                  border-bottom-color: white;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>CF Docs RAG Assistant</h1>
                <p class="subtitle">Intelligent Documentation Search with RAG Pipeline</p>
                <div class="tech-stack">
                  <span class="badge">Workers AI</span>
                  <span class="badge">Vectorize</span>
                  <span class="badge">Durable Objects</span>
                  <span class="badge">Mistral 7B</span>
                </div>
              </div>
              <div class="chat-container">
                <div class="messages" id="messages"></div>
                <div class="input-area">
                  <input type="text" id="message-input" placeholder="Ask about Workers, AI, Vectorize, D1, R2, Pages..." autofocus>
                  <button id="send-button">Send</button>
                </div>
                <div class="typing-indicator" id="typing">AI is thinking...</div>
              </div>

              <script>
                const messagesEl = document.getElementById('messages');
                const inputEl = document.getElementById('message-input');
                const buttonEl = document.getElementById('send-button');
                const typingEl = document.getElementById('typing');
                
                // Load previous messages
                async function loadMessages() {
                  try {
                    const response = await fetch('/api/messages');
                    const data = await response.json();
                    
                    messagesEl.innerHTML = '';
                    data.messages.forEach(msg => {
                      addMessage(msg.role, msg.content, msg.citations);
                    });
                    scrollToBottom();
                  } catch (error) {
                    console.error('Error loading messages:', error);
                  }
                }
                
                // Add a new message to the chat
                function addMessage(role, content, citations) {
                  const messageEl = document.createElement('div');
                  messageEl.className = 'message ' + role + '-message';
                  
                  const contentEl = document.createElement('div');
                  contentEl.textContent = content;
                  messageEl.appendChild(contentEl);
                  
                  // Add citations for assistant messages
                  if (role === 'assistant' && citations && citations.length > 0) {
                    const citationsEl = document.createElement('div');
                    citationsEl.className = 'citations';
                    citationsEl.innerHTML = '<strong>Sources:</strong>';
                    
                    citations.forEach((citation, idx) => {
                      const citationEl = document.createElement('div');
                      citationEl.className = 'citation';
                      citationEl.innerHTML = '[' + (idx + 1) + '] <a href="' + citation.url + '" target="_blank">' + citation.title + '</a>' +
                        '<span class="citation-score">(relevance: ' + (citation.score * 100).toFixed(0) + '%)</span>';
                      citationsEl.appendChild(citationEl);
                    });
                    
                    messageEl.appendChild(citationsEl);
                  }
                  
                  messagesEl.appendChild(messageEl);
                  scrollToBottom();
                }
                
                // Scroll to bottom of messages
                function scrollToBottom() {
                  messagesEl.scrollTop = messagesEl.scrollHeight;
                }
                
                // Send a message to the server
                async function sendMessage() {
                  const message = inputEl.value.trim();
                  if (!message) return;
                  
                  // Add user message to UI
                  addMessage('user', message);
                  inputEl.value = '';
                  
                  // Show typing indicator
                  typingEl.style.display = 'block';
                  scrollToBottom();
                  
                  try {
                    const response = await fetch('/api/chat', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ message })
                    });
                    
                    if (!response.ok) throw new Error('Failed to get response');
                    
                    const data = await response.json();
                    addMessage('assistant', data.content, data.citations);
                  } catch (error) {
                    console.error('Error:', error);
                    addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
                  } finally {
                    typingEl.style.display = 'none';
                    inputEl.focus();
                  }
                }
                
                // Event listeners
                buttonEl.addEventListener('click', sendMessage);
                inputEl.addEventListener('keypress', (e) => {
                  if (e.key === 'Enter') {
                    sendMessage();
                  }
                });
                
                // Load initial messages
                loadMessages();
              </script>
              
              <div class="footer">
                Built by <a href="https://github.com/rudrakanani" target="_blank">Rudra Kanani</a> | Powered by Cloudflare
              </div>
            </body>
            </html>
          `;
          return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        // For other static files (CSS, JS, etc.)
        return new Response('Not found', { status: 404 });
        
      } catch (error) {
        return new Response('Error serving file', { status: 500 });
      }
    }
    
    return new Response('Method not allowed', { status: 405 });
  }
};

// Export the Durable Chat class
export { DurableChat };
