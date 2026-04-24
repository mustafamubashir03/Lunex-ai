"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  SendHorizontal,
  FileText,
  Paperclip,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  isLoading?: boolean;
}

const ChatInput = ({ isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        220
      )}px`;
    }
  }, [message]);

  const handleSend = () => {
    if ((!message.trim() && attachments.length === 0) || isLoading) return;
    setMessage("");
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full mb-4 bg-none">
  
      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2 px-4 py-3 rounded-2xl border border-red-500 bg-background/20 backdrop-blur-xl shadow-sm">
          {attachments.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 text-xs border"
            >
              <FileText size={14} className="opacity-70" />
              <span className="truncate max-w-[140px]">{file.name}</span>
              <button
                onClick={() => removeAttachment(i)}
                className="opacity-60 hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
  
      {/* MAIN CONTAINER */}
      <div
        className={cn(
          "rounded-3xl border bg-background/85 backdrop-blur-xl shadow-2xl",
          "transition-all duration-200",
          "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40"
        )}
      >
        <div className="px-5 pt-4 pb-2">
          <textarea
            ref={textareaRef}
            placeholder="Ask anything... share ideas, code, or files"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="w-full bg-transparent resize-none border-none outline-none text-[15px] leading-relaxed max-h-[220px] placeholder:text-muted-foreground/60"
          />
        </div>
  
        <div className="flex items-center justify-between px-3 py-3 border-t bg-background/50 rounded-b-3xl">
          <div className="flex items-center gap-1">
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
  
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={18} />
            </Button>
  
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <Plus size={18} />
            </Button>
          </div>
  
          <Button
            size="icon"
            className={cn(
              "h-11 w-11 rounded-2xl transition-all",
              "bg-primary text-primary-foreground shadow-lg",
              (!message.trim() && attachments.length === 0) &&
                "opacity-50 pointer-events-none"
            )}
            onClick={handleSend}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendHorizontal size={20} />
            )}
          </Button>
        </div>
      </div>
  
      <p className="mt-3 text-center text-xs text-muted-foreground/50">
        Enter to send • Shift + Enter for newline
      </p>
    </div>
  );
};

export default ChatInput;