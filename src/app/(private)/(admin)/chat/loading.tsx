import React from "react";

/**
 * Loading UI for the Chat route.
 * This prevents the "blank screen" lag while the server identifies the active thread.
 */
export default function ChatLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Finding your active session...
        </p>
      </div>
    </div>
  );
}
