# Lunex AI

> **Stop prompting. Start delegating.**

Lunex AI is not just another chatbot; it's an autonomous AI agent designed to take over real tasks so you can focus on what matters. Whether it's browsing the web, writing and shipping code, or conducting deep research, Lunex acts on its own—from start to finish.

**The work gets done. You just decide what's next.**

## Overview

Lunex AI is built on the principle of **delegation over conversation**. It leverages advanced LLMs (Cerebras, Fireworks) and autonomous orchestration (LangGraph) to bridge the gap between "asking for help" and "getting work done."

- **Autonomous Browsing**: Navigates, clicks, and extracts information across any site just like a human would.
- **End-to-End Coding**: Writes code, runs it in secure environments, and ships the final result without manual copy-pasting.
- **Deep Research**: Aggregates data from dozens of sources to deliver one clean, actionable summary.
- **Proactive Execution**: Once a task is assigned, Lunex manages the loop of action, observation, and refinement until the goal is achieved.

---

## Why Lunex AI?

Traditional chatbots wait for you to tell them every step. **Lunex AI thinks three steps ahead.** 

By combining **Cerebras' ultra-low-latency inference** with **LangGraph's stateful orchestration**, Lunex doesn't just talk about work—it performs it. The system is backed by a professional-grade infrastructure that ensures your data is persistent, your agent remembers your preferences, and your experience is fluid.

---

## Key Technical Features

### 1. High-Performance Real-Time Streaming
- **Token-by-Token Delivery**: Uses a custom **Typewriter Buffer** system (`useRef` based character queues) to ensure a fluid, character-at-a-time rendering experience.
- **Stable SSE Pipeline**: Robust Server-Sent Events (SSE) implementation with heartbeat signals (`keep-alive`) and advanced error handling.
- **Smart Throttling**: Automatically adjusts typing speed if the backend generates tokens faster than the display can keep up, ensuring zero lag.

### 2. Sophisticated Chat Interface
- **Thinking Panel**: Dedicated UI section for displaying the AI's reasoning and tool-calling process in real-time.
- **Markdown Excellence**: Full support for markdown rendering, including code blocks with syntax highlighting, tables, and mathematical expressions.
- **Premium Aesthetics**: Built with a curated **OKLCH color palette**, glassmorphism effects, and smooth micro-animations.
- **Dynamic Empty States**: Beautiful "How can I help you?" welcome screens for new threads with suggested prompts.

### 3. Production-Grade Storage
- **MongoDB Persistence**: Full transition from file-based storage to MongoDB (Mongoose) for all threads and chat history.
- **Thread Lifecycle**: Complete CRUD support (Create, Read, Update, Delete) for chat threads with instant UI synchronization.
- **Seamless Migration**: Built-in logic to handle user sessions and multi-thread switching via a dynamic Sidebar.

### 4. Hybrid Multi-Vector Memory
- **Semantic & Keyword Search**: Integrates **Pinecone** for deep semantic understanding and **BM25** for high-precision keyword matching.
- **Contextual Compression**: Automatically distills hundreds of lines of historical context into a few relevant sentences before the AI processes it.
- **Persistent Persona**: The agent recognizes user identity, project tech stacks, and previous preferences across any new thread.
- **Trial-Key Optimized**: Built-in global rate-limiting and 10x retry logic to ensure 100% reliability on free-tier embedding APIs.

### 5. Autonomous Memory Management
- **Memory Agent**: A dedicated agentic turn that decides when to store new facts and when to search the long-term vault.
- **Persistent Persona**: The agent recognizes user identity (e.g., your name, tech stack, and projects) across different sessions and threads.

## Technical Stack
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **AI Orchestration**: [LangChain](https://js.langchain.com/) & [LangGraph](https://langchain-ai.github.io/langgraphjs/)
- **Database**: **MongoDB** (Mongoose) for permanent thread and history storage.
- **Vector Stores**: [Pinecone](https://www.pinecone.io/) for long-term semantic memory.
- **Embeddings**: [Cohere](https://cohere.com/) (embed-english-v3.0) with custom rate-limiting middleware.
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)
- **Authentication**: [Better-Auth](https://www.better-auth.com/) for secure session management.
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) for global UI state and [TanStack Query](https://tanstack.com/query/latest) for server state.

---


## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Instance
- API Keys for Cerebras and/or Fireworks AI

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/mustafamubashir03/Lunex-ai.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (`.env`):
   ```env
   CEREBRAS_API_KEY=your_key
   FIREWORKS_API_KEY=your_key
   MONGODB_URI=your_mongodb_uri
   BETTER_AUTH_SECRET=your_secret
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

---

## Design System
Lunex AI uses a modern design system based on **Tailwind CSS 4** and **OKLCH colors**. This allows for high-dynamic-range colors that look stunning in both light and dark modes.

- **Primary Accent**: `oklch(0.6802 0.1902 32.0008)` (A vibrant, premium berry-pink)
- **Backgrounds**: Carefully balanced grays that reduce eye strain and highlight code blocks.

---

Built with ❤️ by Mustafa Mubashir.
