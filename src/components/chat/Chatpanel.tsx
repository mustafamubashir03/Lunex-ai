"use client";

import { useState, useRef, useEffect } from "react";

import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";


interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  thinking?: string;
  userId?: string;
  projectId: string;
}

const ChatPanel = () => {
    const [messages] = useState<Message[]>([
        {
          id: "1",
          role: "ai",
          projectId: "next-gen-ai",
          content: "### Environment Synced\nI've indexed your repository and am ready to assist with your **Next.js** and **FastAPI** integration. \n\nI can help you with:\n* RAG Pipeline setup\n* Multi-agent orchestration\n* Database schema optimization",
          thinking: "Scanning directory structure... found `/app` and `/api/v1`. Configuring RAG context with `langchain-core`."
        },
        {
          id: "2",
          role: "user",
          content: "The Turbopack build is failing with a `MODULE_UNPARSABLE` error for my proxy file. Why?",
          projectId: "next-gen-ai",
          userId: "dev_01"
        },
        {
          id: "3",
          role: "ai",
          projectId: "next-gen-ai",
          content: "This usually happens if you've transitioned to the **Next.js 16** `proxy.ts` convention. \n\n**Common Fixes:**\n1. Delete the cache: `rm -rf .next` \n2. Check for named vs default exports.\n3. Restart the dev server with `npm run dev`.",
          thinking: "Analyzing build logs... mapping Next.js 16 proxy implementation requirements."
        },
        {
          id: "4",
          role: "user",
          content: "I did that, but now I'm getting `adapterFn is not a function` in the terminal.",
          projectId: "next-gen-ai",
          userId: "dev_01"
        },
        {
          id: "5",
          role: "ai",
          projectId: "next-gen-ai",
          content: "Next.js 16 expects a **default export** for the proxy function. Ensure your `src/proxy.ts` looks like this"},
        {
          id: "6",
          role: "user",
          content: "Fixed. Now, about my Prisma schema—how should I handle the many-to-many relationship for the booking service?",
          projectId: "next-gen-ai",
          userId: "dev_01"
        },
        {
          id: "7",
          role: "ai",
          projectId: "next-gen-ai",
          content: "For a booking service, I recommend an explicit join table in Prisma. This allows you to store metadata like `bookingStatus` or `timestamp` directly on the relation.",
          thinking: "Reviewing Prisma best practices for relational integrity in MERN apps."
        },
        {
          id: "8",
          role: "user",
          content: "Can I use FastAPI as a microservice for the heavy background processing while keeping the frontend in Next.js?",
          projectId: "next-gen-ai",
          userId: "dev_01"
        },
        {
          id: "9",
          role: "ai",
          projectId: "next-gen-ai",
          content: "Absolutely. You can route long-running tasks from your Next.js API routes to FastAPI via a message queue like RabbitMQ or a direct HTTP internal proxy for faster sync operations.",
          thinking: "Calculating latency overhead for internal service-to-service communication."
        },
        {
          id: "10",
          role: "user",
          content: "Generate the Python pydantic model for the booking request.",
          projectId: "next-gen-ai",
          userId: "dev_01"
        }
      ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Smooth scroll behavior
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  return (

<div className="h-dvh bg-background flex flex-col">

{/* SCROLL AREA */}
<div className="flex-1 overflow-y-auto">
  <div className="mx-auto w-full max-w-5xl px-4 pt-10 pb-28 flex flex-col gap-6">
    
    {messages.map((msg) => (
      <MessageBubble
        key={msg.id}
        role={msg.role}
        content={msg.content}
        thinking={msg.thinking}
        projectId={msg.projectId}
        userId={msg.userId}
      />
    ))}

    <div ref={bottomRef} />
  </div>
</div>

{/* FLOATING INPUT */}
<div className="relative">
  <div className="mx-auto w-full max-w-5xl px-4">
    <ChatInput isLoading={true} />
  </div>
</div>
</div>
  );
};

export default ChatPanel;