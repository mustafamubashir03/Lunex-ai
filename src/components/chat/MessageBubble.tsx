"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageProps {
  userId?: string;
  projectId?: string;
  content: string;
  thinking?: string;
  role: "user" | "ai";
}

const MessageBubble = React.memo(({
  userId,
  projectId = "Lunex AI",
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
        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground border border-border">
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

          {isAi && (
            <span className="text-xs opacity-70">• {projectId}</span>
          )}
        </div>

        {/* THINKING PANEL */}
        {isAi && thinking && (
          <div className="w-full overflow-hidden rounded-xl border border-border bg-secondary">
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
              <div className="px-3 pb-3 pt-2 text-sm text-foreground border-t border-border animate-in fade-in">
                <MarkdownRenderer content={thinking} />
              </div>
            )}
          </div>
        )}

        {/* MESSAGE BUBBLE */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-lg leading-relaxed transition-all",

            // AI
            isAi &&
            "bg-muted text-muted-foreground border border-border rounded-tl-sm",

            // USER
            !isAi &&
            "bg-accent text-primary-foreground  rounded-tr-sm shadow-sm"
          )}
        >
          <MarkdownRenderer
            content={content}
            className={cn(!isAi && "prose-invert")}
          />
        </div>
      </div>
    </div>
  );
});

export default MessageBubble;
