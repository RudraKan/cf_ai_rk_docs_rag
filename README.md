# CF AI RK Docs RAG

**Intelligent Cloudflare Documentation Assistant powered by RAG**

**Author**: Rudra Kanani (RK)  
**Live Demo**: https://cf-ai-rk-docs-rag.kananirudra.workers.dev  
**Repository**: https://github.com/rudrakanani/cf_ai_rk_docs_rag

---
## Deployed Link
###https://cf-ai-rk-docs-rag.kananirudra.workers.dev/
## DEMO VIDEO:
#https://drive.google.com/file/d/1xpeqXD6o119kWRlJgf4T3AP12QfFi9Zr/view?usp=sharing

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Performance](#performance)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

CF AI RK Docs RAG is a production-ready Retrieval Augmented Generation (RAG) system built entirely on Cloudflare's developer platform. This intelligent assistant helps developers find accurate answers to Cloudflare development questions by performing semantic search over documentation and generating AI-powered responses with verifiable source citations.

The system implements a complete RAG pipeline using:
- **Workers AI** for embeddings and text generation
- **Vectorize** for vector similarity search
- **Durable Objects** for stateful conversation management
- **Cloudflare Workers** for serverless compute

Unlike traditional chatbots that may hallucinate answers, this system grounds all responses in actual Cloudflare documentation, providing citations and relevance scores for every answer.

## Features

- **RAG-Powered Q&A**: Semantic search over Cloudflare documentation using Vectorize
- **AI Response Generation**: Uses Mistral 7B Instruct via Workers AI for natural language answers
- **Source Citations**: Every answer includes links to relevant documentation with relevance scores
- **Stateful Conversations**: Maintains chat history using Durable Objects
- **Responsive UI**: Clean, modern interface that works on desktop and mobile
- **Real-time Interaction**: Instant message sending and receiving with typing indicators
- **Conversation History**: Full chat history preserved across sessions
- **Edge Deployment**: Runs on Cloudflare's global network for low latency
- **Type-Safe**: Built with TypeScript for robust development
- **Modular Architecture**: Clean separation of concerns for maintainability

## Screenshots

### Application Interface
<img width="1750" height="1682" alt="image" src="https://github.com/user-attachments/assets/10cc75a7-39ee-4c55-aabe-7d6719b5772f" />

### Cloudflare Dashboard Configuration

<img width="2034" height="1188" alt="image" src="https://github.com/user-attachments/assets/007567be-3d80-45f5-9ec8-e70ec9847c93" />


## Architecture

### System Design

The application follows a modern RAG (Retrieval Augmented Generation) architecture with three main components:

1. **Query Processing Layer**
   - Receives user questions through the web interface
   - Converts questions to embeddings using BGE model
   - Queries Vectorize for relevant documentation

2. **Retrieval Layer**
   - Stores 768-dimensional embeddings in Vectorize
   - Performs cosine similarity search
   - Returns top 5 most relevant documentation chunks

3. **Generation Layer**
   - Combines retrieved context with user question
   - Sends to Mistral 7B Instruct model
   - Generates natural language answer with citations

4. **State Management Layer**
   - Durable Objects maintain conversation history
   - SQLite-backed persistent storage
   - Session management per user

### Data Flow

```
User Question
    ↓
[Workers AI: BGE Embeddings]
    ↓
[Vectorize: Similarity Search] → Top 5 Docs
    ↓
[Build Context + History]
    ↓
[Workers AI: Mistral 7B]
    ↓
[Durable Object: Save State]
    ↓
Response with Citations
```

## Technology Stack

### Cloudflare Services
- **Workers**: Serverless compute platform running JavaScript/TypeScript at the edge
- **Workers AI**: 
  - Mistral 7B Instruct (`@cf/mistral/mistral-7b-instruct-v0.1`) - Text generation
  - BGE Base EN v1.5 (`@cf/baai/bge-base-en-v1.5`) - Embeddings (768 dimensions)
- **Vectorize**: Serverless vector database with cosine similarity search
- **Durable Objects**: Stateful objects with SQLite storage for conversation persistence

### Development Stack
- **TypeScript**: Type-safe development
- **Wrangler**: Cloudflare's CLI tool for development and deployment
- **Node.js**: Runtime for local development and build tools

### AI Models
- **Mistral 7B Instruct**: 7 billion parameter model optimized for instruction following
- **BGE Embeddings**: BAAI General Embedding model for semantic search

## Prerequisites

- Node.js 16+ and npm
- Cloudflare account with access to:
  - Workers
  - Pages
  - AI (Workers AI enabled)
- Wrangler CLI installed: `npm install -g wrangler`

## Local Development

### Step-by-Step Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/rudrakanani/cf_ai_rk_docs_rag.git
cd cf_ai_rk_docs_rag
```

#### 2. Install Dependencies

```bash
npm install
```

This installs:
- `@cloudflare/workers-types` - TypeScript definitions for Workers API
- `@cloudflare/ai` - Workers AI SDK (deprecated but used for reference)
- Development tools and type definitions

#### 3. Authenticate with Cloudflare

```bash
wrangler login
```

This opens a browser window for OAuth authentication. Ensure you have:
- A Cloudflare account
- Workers AI access enabled (free tier available)
- Permissions to create Workers, Vectorize indexes, and Durable Objects

#### 4. Create Vectorize Index

```bash
wrangler vectorize create cloudflare-docs --dimensions=768 --metric=cosine
```

This creates a vector database index with:
- **Name**: `cloudflare-docs`
- **Dimensions**: 768 (matching BGE embeddings model output)
- **Metric**: Cosine similarity for semantic search

Expected output:
```
Successfully created a new Vectorize index: 'cloudflare-docs'
```

#### 5. Start Development Server

```bash
wrangler dev
```

Or use the npm script:
```bash
npm run dev
```

The development server will:
- Start on `http://localhost:8787`
- Hot-reload on file changes
- Connect to your Cloudflare account for AI and Vectorize access
- Create a local Durable Object instance

#### 6. Populate the Vector Database

In a separate terminal, run the ingestion endpoint:

```bash
curl -X POST http://localhost:8787/admin/ingest
```

Expected response:
```json
{"success":true,"message":"Ingested 10 documents"}
```

This process:
1. Loads 10 pre-defined Cloudflare documentation snippets
2. Generates embeddings for each using BGE model
3. Stores embeddings with metadata in Vectorize
4. Takes approximately 10-15 seconds to complete

#### 7. Test the Application

Open your browser to `http://localhost:8787`

Try these example questions:
- "What are Durable Objects?"
- "How does Vectorize work?"
- "What is Workers AI?"
- "Explain the difference between R2 and D1"

### Local Development Tips

- **Logs**: View real-time logs in the terminal running `wrangler dev`
- **Errors**: Check the browser console for client-side errors
- **Vectorize**: Verify embeddings with `wrangler vectorize list`
- **Reset State**: Clear Durable Object state by restarting the dev server

## Deployment

### Production Deployment to Cloudflare Workers

#### Prerequisites for Deployment

Ensure you have:
- Wrangler CLI authenticated (`wrangler login`)
- Node.js 20+ for optimal Wrangler compatibility
- Production Cloudflare account

#### Deployment Steps

##### 1. Create Production Vectorize Index

```bash
wrangler vectorize create cloudflare-docs --dimensions=768 --metric=cosine
```

Note: If you already created this for local dev, skip this step as the index is shared across environments.

##### 2. Deploy the Worker

```bash
wrangler deploy
```

Or use the npm script:
```bash
npm run deploy
```

This will:
- Build the TypeScript code
- Upload the Worker to Cloudflare
- Configure Durable Objects bindings
- Set up Vectorize binding
- Enable Workers AI binding
- Deploy to your workers.dev subdomain

Expected output:
```
Uploaded cf-ai-rk-docs-rag (X.XX sec)
Deployed cf-ai-rk-docs-rag triggers (X.XX sec)
  https://cf-ai-rk-docs-rag.YOUR-SUBDOMAIN.workers.dev
Current Version ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

##### 3. Populate Production Vector Database

```bash
curl -X POST https://cf-ai-rk-docs-rag.YOUR-SUBDOMAIN.workers.dev/admin/ingest
```

Replace `YOUR-SUBDOMAIN` with your actual Cloudflare Workers subdomain (e.g., `kananirudra`).

Expected response:
```json
{"success":true,"message":"Ingested 10 documents"}
```

##### 4. Verify Production Deployment

1. Visit your Worker URL: `https://cf-ai-rk-docs-rag.YOUR-SUBDOMAIN.workers.dev`
2. Test with a question: "What are Durable Objects?"
3. Verify the response includes:
   - AI-generated answer
   - Source citations with URLs
   - Relevance scores
   - Clickable documentation links

##### 5. Monitor Deployment

Access the Cloudflare dashboard:
1. Navigate to Workers & Pages
2. Click on `cf-ai-rk-docs-rag`
3. View:
   - **Metrics**: Request count, CPU time, errors
   - **Logs**: Real-time request logs
   - **Settings**: Bindings configuration
   - **Triggers**: Custom domains and routes

#### Custom Domain (Optional)

To add a custom domain:

1. Go to Workers & Pages → cf-ai-rk-docs-rag → Triggers
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `docs-ai.yourdomain.com`)
4. Cloudflare automatically configures DNS

### Alternative: Deploy to Cloudflare Pages

For static hosting with Workers Functions:

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Link Repository in Dashboard**
   - Go to Workers & Pages → Create → Pages
   - Connect your GitHub repository
   - Select `cf_ai_rk_docs_rag`

3. **Configure Build Settings**
   - Build command: Leave empty (no build needed)
   - Build output directory: `/`
   - Root directory: `/`

4. **Add Bindings**
   - Go to Settings → Functions
   - Add the same bindings from `wrangler.toml`:
     - Workers AI: `AI`
     - Vectorize: `VECTORIZE` → `cloudflare-docs`
     - Durable Objects: `CHAT` → `DurableChat`

5. **Deploy**
   - Click "Save and Deploy"
   - Pages will build and deploy automatically

## Usage Guide

### Asking Questions

The assistant is optimized for questions about Cloudflare's developer platform. Best results come from:

**Good Questions:**
- "What are Durable Objects and how do they work?"
- "How do I set up Vectorize for semantic search?"
- "What's the difference between Workers and Pages?"
- "How do I use Workers AI with embeddings?"

**Less Optimal:**
- Very broad questions: "Tell me everything about Cloudflare"
- Questions outside the documentation: "How do I use AWS S3?"
- Questions requiring real-time data: "What's the current status?"

### Understanding Responses

Each AI response includes:

1. **Answer**: Natural language response synthesized from documentation
2. **Citations**: Numbered references like [1], [2] corresponding to sources
3. **Source Cards**: Detailed information for each citation:
   - Documentation title
   - Relevant content snippet
   - Direct URL to official docs
   - Relevance score (0-100%)

### Conversation History

- Conversations persist across page refreshes
- The last 6 messages (3 exchanges) are used as context
- Clear history by starting a new session or restarting the Worker

## API Documentation

### REST Endpoints

#### GET /

**Description**: Serves the web-based chat interface

**Response**: HTML page with embedded JavaScript for the chat application

**Status Codes:**
- `200`: Success

---

#### GET /api/messages

**Description**: Retrieves all messages in the current conversation

**Request:**
```bash
curl https://cf-ai-rk-docs-rag.kananirudra.workers.dev/api/messages
```

**Response:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What are Durable Objects?",
      "timestamp": 1700000000000
    },
    {
      "role": "assistant",
      "content": "Durable Objects provide...",
      "timestamp": 1700000001000,
      "citations": [
        {
          "url": "https://developers.cloudflare.com/durable-objects/",
          "title": "Durable Objects",
          "snippet": "Durable Objects provide low-latency...",
          "score": 0.85
        }
      ]
    }
  ]
}
```

**Status Codes:**
- `200`: Success

---

#### POST /api/chat

**Description**: Send a message and receive an AI-generated response with citations

**Request:**
```bash
curl -X POST https://cf-ai-rk-docs-rag.kananirudra.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are Durable Objects?"}'
```

**Request Body:**
```json
{
  "message": "string (required) - The user's question"
}
```

**Response:**
```json
{
  "role": "assistant",
  "content": "Durable Objects provide low-latency coordination...",
  "timestamp": 1700000001000,
  "citations": [
    {
      "url": "https://developers.cloudflare.com/durable-objects/",
      "title": "Durable Objects",
      "snippet": "Durable Objects provide low-latency coordination...",
      "score": 0.85
    }
  ]
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error (check logs for details)

---

#### POST /admin/ingest

**Description**: Populate the Vectorize index with Cloudflare documentation embeddings

**Security**: In production, this endpoint should be protected with authentication

**Request:**
```bash
curl -X POST https://cf-ai-rk-docs-rag.kananirudra.workers.dev/admin/ingest
```

**Response:**
```json
{
  "success": true,
  "message": "Ingested 10 documents"
}
```

**Status Codes:**
- `200`: Success
- `500`: Error during ingestion

**Note**: This process takes 10-15 seconds and should only be run once per deployment.

## Project Structure

```
cf_ai_rk_docs_rag/
├── src/
│   ├── index.ts              # Main Worker entry point, HTTP routing, UI
│   └── durable-chat.ts       # Durable Object for conversation state & RAG
├── scripts/
│   └── ingest-docs.ts        # Helper script for documentation ingestion
├── wrangler.toml             # Cloudflare Worker configuration
├── package.json              # Node.js dependencies and scripts
├── tsconfig.json             # TypeScript compiler configuration
├── README.md                 # This file
└── PROMPTS.md                # AI prompt engineering documentation
```

### Key Files

**`src/index.ts`**
- HTTP request routing
- Static HTML/CSS/JS for chat UI
- Documentation ingestion endpoint
- Durable Object stub creation

**`src/durable-chat.ts`**
- DurableChat class implementation
- RAG pipeline logic:
  - Query embedding generation
  - Vectorize similarity search
  - Context building
  - AI response generation
- Conversation state management
- Citation tracking

**`wrangler.toml`**
- Worker name and configuration
- Durable Objects migration
- Bindings for AI, Vectorize, and Durable Objects
- Compatibility date

## Configuration

### wrangler.toml

```toml
name = "cf-ai-rk-docs-rag"
main = "src/index.ts"
compatibility_date = "2023-12-18"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["DurableChat"]

[ai]
binding = "AI"

[durable_objects]
bindings = [
  { name = "CHAT", class_name = "DurableChat" }
]

[[vectorize]]
binding = "VECTORIZE"
index_name = "cloudflare-docs"
```

### Environment Bindings

All bindings are configured in `wrangler.toml` and accessible via the `env` parameter:

- `env.AI` - Workers AI binding for running models
- `env.CHAT` - Durable Objects namespace
- `env.VECTORIZE` - Vectorize index binding

### Customization Options

**Adjust number of retrieved documents:**

In `src/durable-chat.ts`, modify the `topK` parameter:
```typescript
const matches = await this.env.VECTORIZE.query(queryEmbedding.data[0], {
  topK: 10,  // Default is 5, increase for more context
  returnMetadata: true
});
```

**Change conversation history length:**

In `src/durable-chat.ts`:
```typescript
const conversationHistory = this.messages
  .slice(-10)  // Default is -6 (last 3 exchanges)
  .map(m => `${m.role}: ${m.content}`)
  .join('\n');
```

**Modify system prompt:**

In `src/durable-chat.ts`, edit the `systemPrompt` variable to change AI behavior.

## Troubleshooting

### Common Issues

#### "No such model" Error

**Error**: `AiError: 5007: No such model @cf/mistral/mistral-7b-instruct-v0.1`

**Solution**: 
- Ensure Workers AI is enabled for your account
- Check available models: https://developers.cloudflare.com/workers-ai/models/
- Verify model name spelling in `src/durable-chat.ts`

#### Vectorize Index Not Found

**Error**: `Vectorize index 'cloudflare-docs' not found`

**Solution**:
```bash
wrangler vectorize create cloudflare-docs --dimensions=768 --metric=cosine
```

#### Empty Responses

**Symptom**: AI returns no answer or citations

**Solutions**:
1. Check if index was populated: `curl -X POST .../admin/ingest`
2. Verify embeddings exist: `wrangler vectorize list`
3. Check Worker logs: `wrangler tail`

#### Durable Objects Migration Error

**Error**: `A request to the Cloudflare API failed`

**Solution**: Ensure `new_sqlite_classes` is used instead of `new_classes` in `wrangler.toml` for free tier.

#### Node Version Error

**Error**: `Wrangler requires at least Node.js v20.0.0`

**Solution**:
```bash
nvm install 20
nvm use 20
```

### Debug Mode

Enable detailed logs:
```bash
wrangler dev --log-level debug
```

View production logs:
```bash
wrangler tail cf-ai-rk-docs-rag
```

## Performance

### Benchmarks

- **Cold Start**: ~200-300ms
- **Warm Request**: ~50-100ms
- **Query Embedding**: ~100-200ms
- **Vectorize Search**: ~50-100ms
- **LLM Generation**: ~1-3 seconds (depends on response length)
- **Total Request Time**: ~1.5-4 seconds

### Optimization Tips

1. **Reduce Context Size**: Lower `topK` to 3 for faster responses
2. **Shorter Conversations**: Limit conversation history to last 2-4 messages
3. **Cache Responses**: Implement KV cache for common questions
4. **Edge Locations**: Deploy to multiple regions for lower latency

### Resource Limits

- **Free Tier**:
  - 100,000 requests/day
  - 10ms CPU time/request
  - Vectorize: 100,000 vectors, 30M queries/month
  - Workers AI: 10,000 requests/day

## Security

### Best Practices

1. **Admin Endpoint Protection**: Add authentication to `/admin/ingest`
   ```typescript
   if (url.pathname === '/admin/ingest') {
     const authHeader = request.headers.get('Authorization');
     if (authHeader !== `Bearer ${env.ADMIN_TOKEN}`) {
       return new Response('Unauthorized', { status: 401 });
     }
   }
   ```

2. **Rate Limiting**: Implement per-IP rate limiting using Durable Objects

3. **Input Validation**: Sanitize user input to prevent injection attacks

4. **CORS**: Configure appropriate CORS headers for your domain

5. **API Keys**: Never commit API keys or secrets to the repository

### Data Privacy

- Conversation data is stored in Durable Objects
- No user data is sent to third-party services
- All AI processing happens within Cloudflare's network
- Chat history can be cleared by the user

## Contributing

Contributions to improve the documentation coverage, add new features, or enhance the RAG pipeline are welcome!

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/rudrakanani/cf_ai_rk_docs_rag.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test locally**
   ```bash
   wrangler dev
   ```

5. **Commit and push**
   ```bash
   git commit -m "Add: your feature description"
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Include screenshots for UI changes

### Areas for Contribution

- Expanding documentation coverage (more Cloudflare products)
- Improving UI/UX design
- Adding authentication and user management
- Implementing response caching with KV
- Adding more sophisticated RAG techniques
- Writing unit tests
- Performance optimizations

## License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2025 Rudra Kanani

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Author

**Rudra Kanani (RK)**

- GitHub: [@rudrakanani](https://github.com/rudrakanani)
- Project: CF AI RK Docs RAG
- Email: [Contact via GitHub]

Built as part of the Cloudflare AI assignment to demonstrate:
- RAG implementation with Vectorize
- Workers AI integration
- Durable Objects for state management
- Full-stack development on Cloudflare's platform

## Acknowledgements

This project leverages several Cloudflare technologies and open-source models:

- **[Cloudflare Workers](https://workers.cloudflare.com/)** - Serverless compute platform
- **[Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)** - AI model inference at the edge
- **[Cloudflare Vectorize](https://developers.cloudflare.com/vectorize/)** - Vector database for semantic search
- **[Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)** - Stateful objects with SQLite storage
- **[Mistral AI](https://mistral.ai/)** - Mistral 7B Instruct language model
- **[BAAI](https://github.com/FlagOpen/FlagEmbedding)** - BGE embeddings model

Special thanks to the Cloudflare developer community and documentation team for comprehensive resources.

## Related Documentation

- [Workers AI Models Catalog](https://developers.cloudflare.com/workers-ai/models/)
- [Vectorize Getting Started](https://developers.cloudflare.com/vectorize/get-started/)
- [Durable Objects Best Practices](https://developers.cloudflare.com/durable-objects/best-practices/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)

## Repository Information

**Repository Name**: `cf_ai_rk_docs_rag`

This naming follows the assignment requirements:
- `cf_ai_` - Required prefix for Cloudflare AI projects
- `rk` - Creator's initials (Rudra Kanani)
- `docs_rag` - Descriptive suffix indicating RAG over documentation

---

**Last Updated**: November 2025  
**Version**: 1.0.0  
**Status**: Production Ready
