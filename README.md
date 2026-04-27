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

### 3. End-to-End Thread Management
- **MongoDB Integration**: Permanent storage for chat history and thread metadata.
- **Seamless Navigation**: Smart routing that automatically redirects to the most recent thread while allowing instant switching via the sidebar.
- **Sidebar Controls**: Easy access to historical threads with the ability to rename, delete, and organize conversations.

### 4. Advanced Technical Stack
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **AI Orchestration**: [LangChain](https://js.langchain.com/) & [LangGraph](https://langchain-ai.github.io/langgraphjs/)
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

Built with ❤️ by the Mustafa Mubashir.
