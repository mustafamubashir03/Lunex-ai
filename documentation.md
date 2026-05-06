# Lunex AI Technical Documentation

## Current State Overview
Lunex AI is currently in the transition phase from a file-based prototype to a MongoDB-backed autonomous agent system. The project focuses on high-speed streaming interactions, hybrid memory retrieval, and structured thread management.

## Implemented Agents

### 1. Conversational Assistant (Primary Agent)
- **Role**: Handles direct user interaction, answering queries intelligently while maintaining context awareness.
- **Persona**: Calm, clear, composed, and professional.
- **Trigger**: Explicitly triggered by a `POST` request to the `/api/mongo/agent/streams`.
- **Implementation**: Uses `createAgent` with a custom `StateGraph` wrapper. Operates via the `model_request` node for clean conversational streaming.


## System Design and Flow

```mermaid
graph TD
    User([User]) <--> UI[Next.js Interface]
    UI <--> SSE[SSE Streaming Pipeline]
    SSE <--> Auth{Better-Auth}
    Auth <--> Agent[Memory Agent]
    
    subgraph "Execution Layer"
        Agent <--> Tools[Tool Registry]
        Agent <--> LLM[Cerebras / Fireworks]
    end
    
    subgraph "Memory & Retrieval"
        Agent <--> LTM[Multi-Vector LTM]
        Agent <--> Keyword[BM25 Hybrid Search]
        LTM <--> Pinecone[Pinecone Store]
        Keyword <--> Mongo
    end
    
    subgraph "Persistence Layer"
        Agent <--> Mongo[(MongoDB: Threads/History)]
    end
```

## Deep Dive: The AI Memory Pipeline

Lunex AI utilizes a sophisticated Retrieval-Augmented Generation (RAG) architecture that solves the "context fragmentation" problem common in basic vector stores.

### 1. Stage 1: Fact Ingestion (The Ingestion Loop)
This stage ensures that high-density facts are stored with both high-level context and granular searchability.

```mermaid
graph LR
    Input[Raw Fact/Conversation] --> Splitter[Recursive Splitter]
    
    subgraph "Parent-Child Generation"
        Splitter --> Parent[Parent Doc: 2000 tokens]
        Splitter --> Child[Child Chunks: 400 tokens]
    end
    
    Parent --> ID[UUID Linkage]
    Child --> ID
    
    ID --> Embed[Cohere Embed-v3]
    Embed --> Pinecone[(Pinecone Vector DB)]
    
    style Parent fill:#f96,stroke:#333
    style Child fill:#9f6,stroke:#333
    style Pinecone fill:#69f,stroke:#333
```

**Key Innovations:**
- **UUID Linkage**: Every Child chunk carries a `parentId` metadata field.
- **Trial-Key Optimization**: Ingestion is sequentially throttled to `maxConcurrency: 1` to prevent Cohere 429 errors.

### 2. Stage 2: Hybrid Retrieval (The Search Pipeline)
When a search is triggered, the system operates in two modes to ensure perfect recall.

```mermaid
graph TD
    Query[User Query] --> EmbedQ[Query Embedding]
    Query --> Keyword[Keyword Extraction]
    
    subgraph "Parallel Search"
        EmbedQ --> Vector[Pinecone: Semantic Match]
        Keyword --> BM25[BM25: Exact Match]
    end
    
    Vector --> Results[Top 6 Child Chunks]
    BM25 --> Results
    
    Results --> Mapping{Parent ID Mapping}
    Mapping --> FullDoc[Retrieve Full Parent Documents]
    
    style Vector fill:#69f,stroke:#333
    style BM25 fill:#f66,stroke:#333
    style Mapping fill:#ff9,stroke:#333
```

**Key Innovations:**
- **Hybrid Scoring**: Combines the "meaning" of the sentence (Vector) with specific "identifiers" (BM25).
- **Expansion**: Instead of feeding small snippets to the AI, we use the snippets to find the **full context** (Parent Docs), ensuring the AI sees the "whole picture."

### 3. Stage 3 & 4: Contextual Compression & Generation
The final stage before the LLM generates a response, ensuring only the "signal" reaches the model, not the "noise."

```mermaid
graph LR
    Docs[Full Parent Docs] --> LLM_Comp[Llama 3.1 Extractor]
    Query[User Query] --> LLM_Comp
    
    LLM_Comp --> Summary[Extracted Relevant Sentences]
    Summary --> Prompt[Final AI Prompt]
    
    style LLM_Comp fill:#b3f,stroke:#333
    style Summary fill:#fff,stroke:#333
```

**Key Innovations:**
- **Noise Reduction**: If a 2000-token document only contains 2 relevant sentences, the **ContextualCompressionRetriever** discards the other 1900+ tokens.
- **Latency Optimization**: Performed via Cerebras to ensure this extra processing step adds <100ms to the total response time.

---

## Production Streaming Infrastructure

The streaming architecture is designed to handle high-concurrency loops where the agent may call multiple tools before speaking.

### Token-by-Token Delivery
- **Node Filtering**: The stream handler specifically listens for the `model_request` node in the LangGraph execution. This ensures that internal tool reasoning and background logs are NOT sent to the client, keeping the UI clean.
- **SSE Protocol**: Uses standard Server-Sent Events with custom `thinking`, `status`, and `message` channels.
- **Heartbeat Mechanism**: A 15-second heartbeat prevents browser timeouts during long-running background tasks (like complex web browsing or code execution).

### Rate-Limit Management
To support **Cohere Trial Keys**, the system implements:
- **Global Singleton Embeddings**: All memory tasks share a single throttled embedding instance.
- **Exponential Backoff**: Automatic retries (up to 10 attempts) when hitting API rate limits.
- **Batch Throttling**: Documents are sent in groups of 32 to ensure stable processing.

### Detailed Execution Flow
1. **Request**: User prompt sent via Next.js to `/api/mongo/agent/streams`.
2. **Auth**: Session validated via Better-Auth.
3. **Retrieval**: System performs semantic search in Pinecone + Keyword search (BM25). Child-to-Parent mapping ensures the LLM receives expanded context.
4. **Inference**: Primary Agent processes input. If a tool is required (e.g., updating thread title), it is executed before final response generation.
5. **Streaming**: SSE delivers tokens for both "thinking" and "message" channels.

## API Endpoints

### MongoDB Operations (Current Standard)
- **POST `/api/mongo/agent/streams`**: Streams AI response using MongoDB history.
- **GET `/api/mongo/agent/chat-history`**: Retrieves all messages for a specific thread.
- **POST `/api/mongo/threads`**: Creates a new thread.
- **GET `/api/mongo/threads`**: Lists all threads for a user.
- **PATCH `/api/mongo/threads`**: Renames a specific thread.
- **DELETE `/api/mongo/threads`**: Deletes a specific thread.


## Tool Registry

### Thread & History (MongoDB)
- **create_mongo_thread**: Initializes threads and manages activation state.
- **read_mongo_threads**: Syncs and retrieves thread lists.
- **write_to_mongo_chat_history**: Saves user/AI message pairs with optional reasoning blocks.

### Memory & Retrieval
- **write_memory**: Encapsulates the multi-vector storage pipeline (Parent splitting + Child embedding) for long-term fact storage in Pinecone.
- **search_long_term_memory**: Triggers semantic retrieval with contextual compression, allowing the agent to "remember" details from previous conversations.
- **update_user_info**: Directly modifies the persistent session state to track identity (e.g., name, role).
- **read_thread_history**: Direct MongoDB access for retrieving full conversation context of a specific thread.

## Design FAQs

### Why MongoDB over File-Based Storage?
- **Problem Solved**: Concurrent access and data reliability. File-based storage is prone to race conditions and corruption when multiple write operations occur.
- **Impact of Absence**: Data loss becomes frequent, and the system cannot scale to multiple simultaneous users.

### Why Parent-Child Retrieval?
- **Problem Solved**: Context fragmentation. Standard vector search retrieves small snippets that lack surrounding detail.
- **Impact of Absence**: The agent often receives incomplete information, increasing the likelihood of hallucinations.

### Why Cerebras for Primary Inference?
- **Problem Solved**: Agentic loop latency. Multiple sequential LLM calls are required for delegation tasks; high-speed inference (Cerebras) is critical to keeping the interaction fluid.
- **Impact of Absence**: The "delegation" experience feels sluggish, with long gaps between actions and results.

### Why implementation of Memory Compression?
- **Problem Solved**: Context window saturation. Raw logs contain "thinking" noise and redundant metadata that consume token space.
- **Impact of Absence**: Long-term performance degrades as the agent attempts to process thousands of lines of irrelevant historical reasoning.

### Why NPM Overrides for Zod?
- **Problem Solved**: Versioning deadlock between Better-Auth and LangChain.
- **Impact of Absence**: The project fails to build or suffers from persistent runtime type errors.

## Future Tasks (Roadmap)
- **Autonomous Tooling**: Implementation of Browser and Coding tools (currently in development).
- **Automated Memory Triggers**: Dynamic logic to trigger memory "consolidation" based on token usage or thread completion.
- **Refining Retrieval Accuracy**: Improving the "Parent-Child" similarity thresholds to reduce noise in extremely large memory stores.
- **Multi-Agent Orchestration**: Expanding from a single memory-enabled agent to a swarm of specialized executors.
