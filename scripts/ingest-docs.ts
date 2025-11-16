/**
 * Documentation Ingestion Script
 * 
 * This script fetches Cloudflare documentation, chunks it, generates embeddings,
 * and uploads to Vectorize for semantic search.
 * 
 * Run with: wrangler vectorize insert cloudflare-docs --file=./embeddings.ndjson
 */

// Sample Cloudflare documentation URLs to ingest
// In production, you'd scrape the entire docs site or use an API
const CLOUDFLARE_DOCS = [
  {
    url: 'https://developers.cloudflare.com/workers/',
    title: 'Cloudflare Workers Overview',
    content: `Cloudflare Workers provides a serverless execution environment that allows you to create entirely new applications or augment existing ones without configuring or maintaining infrastructure. Workers run on Cloudflare's global network in hundreds of cities worldwide, offering both free and paid plans.`
  },
  {
    url: 'https://developers.cloudflare.com/workers/runtime-apis/',
    title: 'Workers Runtime APIs',
    content: `Workers use the Service Worker API, implementing a subset of the standard. Workers are written in JavaScript and can be deployed from a CLI or Dashboard. The runtime includes Fetch API, Web Crypto, Streams API, and more.`
  },
  {
    url: 'https://developers.cloudflare.com/workers-ai/',
    title: 'Workers AI',
    content: `Run machine learning models on Cloudflare's global network. Workers AI provides access to popular AI models for tasks like text generation, image classification, embeddings, and more. Models are optimized for serverless execution with pay-per-use pricing.`
  },
  {
    url: 'https://developers.cloudflare.com/vectorize/',
    title: 'Vectorize',
    content: `Vectorize is Cloudflare's vector database for storing and querying embeddings. It enables semantic search and RAG applications. Create indexes, insert vectors with metadata, and query by similarity. Integrates seamlessly with Workers AI for embeddings.`
  },
  {
    url: 'https://developers.cloudflare.com/durable-objects/',
    title: 'Durable Objects',
    content: `Durable Objects provide low-latency coordination and consistent storage for Workers. Each Object is a single instance with private state, enabling real-time collaboration, game servers, IoT coordination, and more. Objects are automatically migrated close to users.`
  },
  {
    url: 'https://developers.cloudflare.com/r2/',
    title: 'Cloudflare R2',
    content: `R2 is S3-compatible object storage without egress fees. Store large amounts of unstructured data like images, videos, and backups. Access from Workers, S3-compatible tools, or the API. Offers both standard and infrequent access storage classes.`
  },
  {
    url: 'https://developers.cloudflare.com/pages/',
    title: 'Cloudflare Pages',
    content: `Pages is a JAMstack platform for deploying static sites and full-stack applications. Connect your Git repository for automatic deployments. Supports frameworks like Next.js, Astro, SvelteKit, and more. Includes preview deployments and rollbacks.`
  },
  {
    url: 'https://developers.cloudflare.com/d1/',
    title: 'Cloudflare D1',
    content: `D1 is Cloudflare's serverless SQL database built on SQLite. Create databases, run SQL queries, and migrate schemas. Designed for low-latency reads and writes from Workers. Supports time travel queries and point-in-time recovery.`
  },
  {
    url: 'https://developers.cloudflare.com/queues/',
    title: 'Cloudflare Queues',
    content: `Queues enable asynchronous message passing between Workers. Use for job processing, event streaming, and decoupling services. Supports batch consumption, dead letter queues, and automatic retries. Messages are durable and guaranteed delivery.`
  },
  {
    url: 'https://developers.cloudflare.com/workers/wrangler/',
    title: 'Wrangler CLI',
    content: `Wrangler is the official CLI for Cloudflare Workers. Use it to develop, test, and deploy Workers. Commands include dev for local development, deploy for publishing, tail for live logs, and more. Supports TypeScript and multiple environments.`
  },
  {
    url: 'https://developers.cloudflare.com/workers/configuration/bindings/',
    title: 'Workers Bindings',
    content: `Bindings allow Workers to interact with Cloudflare resources. Types include KV namespaces, Durable Objects, R2 buckets, D1 databases, AI models, and Queues. Configure in wrangler.toml and access via env parameter in fetch handler.`
  },
  {
    url: 'https://developers.cloudflare.com/workers/examples/',
    title: 'Workers Examples',
    content: `Example Workers for common use cases: API gateways, authentication, caching, image optimization, A/B testing, redirects, rate limiting, and more. Each example includes full source code and deployment instructions.`
  },
  {
    url: 'https://developers.cloudflare.com/workers-ai/models/',
    title: 'Workers AI Models',
    content: `Available models include Llama 3.3 for text generation, BERT for embeddings, Stable Diffusion for images, Whisper for speech recognition, and more. Each model has specific input/output formats and token limits. See model catalog for full list.`
  },
  {
    url: 'https://developers.cloudflare.com/vectorize/get-started/',
    title: 'Vectorize Getting Started',
    content: `Create a Vectorize index with specified dimensions and distance metric. Insert vectors with metadata using the REST API or Workers binding. Query by vector similarity with optional metadata filters. Indexes support up to 100,000 vectors on free plan.`
  },
  {
    url: 'https://developers.cloudflare.com/workers/runtime-apis/durable-objects/',
    title: 'Durable Objects API',
    content: `Durable Objects API includes methods for state management: get, put, delete, list. Objects receive requests via fetch() method. Use blockConcurrencyWhile() for initialization. Access WebSocket hibernation API for long-lived connections.`
  }
];

// Chunk text into smaller pieces for better retrieval
function chunkText(text: string, maxLength: number = 500): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Generate embeddings.ndjson file for Vectorize
export function generateEmbeddingsFile() {
  const embeddings = [];
  let id = 0;
  
  for (const doc of CLOUDFLARE_DOCS) {
    const chunks = chunkText(doc.content);
    
    for (const chunk of chunks) {
      embeddings.push({
        id: `doc-${id++}`,
        metadata: {
          url: doc.url,
          title: doc.title,
          content: chunk
        },
        // Note: Actual embeddings will be generated by Workers AI
        // This is a placeholder structure
        needsEmbedding: true,
        text: chunk
      });
    }
  }
  
  return embeddings;
}

// Main function to print instructions
console.log('=== Cloudflare Documentation Ingestion ===\n');
console.log('To ingest documentation into Vectorize:\n');
console.log('1. Create the Vectorize index:');
console.log('   wrangler vectorize create cloudflare-docs --dimensions=768 --metric=cosine\n');
console.log('2. Use the /admin/ingest endpoint in the Worker to populate the index');
console.log('   This will fetch docs, generate embeddings, and upload to Vectorize\n');
console.log('3. Or run this script to generate sample data:\n');

const embeddings = generateEmbeddingsFile();
console.log(`Generated ${embeddings.length} document chunks for ingestion\n`);
console.log('Sample entry:', JSON.stringify(embeddings[0], null, 2));
