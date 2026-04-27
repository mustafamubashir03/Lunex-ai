"use client";

import { useState, useRef, useEffect } from "react";

import { Sparkles } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { useChatStore } from "@/stores/chatStore";
import { useGetChatHistory } from "@/hooks/chat";
import { authClient } from "@/lib/auth-client";
import { useParams } from "next/navigation";


interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  thinking?: string;
  userId?: string;
  projectId: string;
}

const ChatPanel = () => {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id || "";
  const params = useParams();
  const threadId = params.redirectThreadId as string;

  const { messages, isPending } = useChatStore();


  useGetChatHistory(userId, threadId);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bottom = bottomRef.current;
    if (bottom) {
      bottom.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
    }
  }, [messages]);

  return (
    <div className="h-dvh bg-background flex flex-col">
      {/* SCROLL AREA */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 pt-10 pb-28 flex flex-col gap-6">
          {messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              role={msg.role}
              content={msg.content}
              thinking={msg.thinking}
              userId={msg.userId}
            />
          ))}

          {/* Empty State */}
          {!isPending && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="h-20 w-20 rounded-3xl bg-linear-to-br from-primary/20 to-chart-2/20 flex items-center justify-center mb-6 shadow-xl shadow-primary/5 border border-primary/10">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                How can I help you today?
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto text-base leading-relaxed">
                Start a new conversation by typing a message below. I can help with coding, analysis, or just a friendly chat.
              </p>
            </div>
          )}

          {isPending && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
              <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <p className="text-sm font-medium animate-pulse">Retrieving conversation...</p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* FLOATING INPUT */}
      <div className="relative">
        <div className="mx-auto w-full max-w-5xl px-4">
          <ChatInput />
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
