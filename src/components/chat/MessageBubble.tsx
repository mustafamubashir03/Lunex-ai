"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageProps {
  userId?: string;
  projectId: string;
  content: string;
  thinking?: string;
  role: "user" | "ai";
}

const MessageBubble = ({
  userId,
  projectId,
  content,
  thinking,
  role,
}: MessageProps) => {
  const [open, setOpen] = useState(false);
  const isAi = role === "ai";

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        isAi ? "justify-start" : "justify-end"
      )}
    >

      {/* AI ICON */}
      {isAi && (
        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-black shadow-sm">
          <Sparkles size={18} />
        </div>
      )}

      {/* CONTENT */}
      <div
        className={cn(
          "flex flex-col gap-2 max-w-[min(85%,680px)]",
          !isAi && "items-end"
        )}
      >

        {/* HEADER */}
        <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {isAi ? "AI Assistant" : userId || "You"}
          </span>

          {isAi && (
            <span className="text-xs opacity-60">• {projectId}</span>
          )}
        </div>

        {/* THINKING PANEL (clean + subtle) */}
        {isAi && thinking && (
          <div className="w-full overflow-hidden rounded-xl border border-border bg-secondary shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(!open)}
              className="flex w-full items-center justify-between px-3 py-2 text-sm text-secondary-foreground hover:bg-muted"
            >
              <div className="flex items-center gap-2">
                <Bot size={16} />
                <span>
                  {open ? "Hide reasoning" : "View reasoning"}
                </span>
              </div>

              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>

            {open && (
              <div className="px-3 pb-3 pt-2 text-sm text-secondary-foreground border-t animate-in fade-in">
                <MarkdownRenderer content={thinking} />
              </div>
            )}
          </div>
        )}

        {/* MESSAGE BUBBLE */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-[15.5px] leading-relaxed shadow-sm transition-all",


            isAi &&
              "bg-muted text-foreground border border-border rounded-tl-sm",

            // USER = BRAND PRIMARY (IMPORTANT FIX)
            !isAi &&
              "bg-primary text-primary-foreground rounded-tr-sm shadow-md"
          )}
        >
          <MarkdownRenderer
            content={content}
            className={cn(!isAi && "prose-invert")}
          />
        </div>
      </div>

      {/* USER ICON */}
      {!isAi && (
        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-black shadow-sm">
          <User size={18} />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;