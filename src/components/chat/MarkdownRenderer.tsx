"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface Props {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ content, className }: Props) => {
  return (

    // because the newer version removed the className prop from the root component.
    <div className={cn("prose prose-sm dark:prose-invert max-w-none wrap-break-word", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Paragraphs
          p: ({ children }) => (
            <p className="mb-3 last:mb-0 leading-relaxed text-foreground/90">
              {children}
            </p>
          ),
          // Bold
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="mb-4 ml-4 list-disc space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-4 list-decimal space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground/90 leading-snug">{children}</li>
          ),
          // Code Blocks
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline ? (
              <div className="relative my-4 overflow-hidden rounded-md border bg-muted/50">
                {match && (
                  <div className="flex items-center justify-between bg-muted px-4 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b">
                    {match[1]}
                  </div>
                )}
                <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code
                className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] font-medium text-foreground"
                {...props}
              >
                {children}
              </code>
            );
          },
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};