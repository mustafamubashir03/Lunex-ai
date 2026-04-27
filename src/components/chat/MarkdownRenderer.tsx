"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

/**
 * NOTE: If your local project requires GitHub Flavored Markdown (tables, strikethrough),
 * ensure you have 'remark-gfm' installed and uncomment the import and plugin line below.
 * npm install remark-gfm
 */
// import remarkGfm from "remark-gfm";

interface Props {
  content: string;
  className?: string;
}

/**
 * MarkdownRenderer
 * Handles the rendering of AI responses. 
 * Fixes the hydration error by ensuring block-level elements (divs)
 * are not nested inside paragraphs (p tags).
 */
export const MarkdownRenderer = ({ content, className }: Props) => {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none wrap-break-word", className)}>
      <ReactMarkdown
        // remarkPlugins={[remarkGfm]} // Uncomment this locally if remark-gfm is installed
        components={{
          // FIX: Change 'p' to 'div' to prevent <div> (code blocks) inside <p> errors.
          // React-markdown wraps standard text in this component.
          p: ({ children }) => (
            <div className="mb-3 last:mb-0 leading-relaxed text-foreground/90">
              {children}
            </div>
          ),
          
          // Bold text
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
          
          // Code Blocks and Inline Code
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            
            // Block Code
            if (!inline) {
              return (
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
              );
            }

            // Inline Code
            return (
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
          
          // Blockquotes (often used for 'thinking' or citations)
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/30 pl-4 italic text-muted-foreground my-4">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};