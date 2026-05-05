import { useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getChatHistory, sendMessage } from "@/client-api/chat";
import { useChatStore } from "@/stores/chatStore";

export const useGetChatHistory = (userId: string, threadId: string) => {
  const { setMessages, setIsPending, clearChat } = useChatStore();

  return useQuery({
    queryKey: ["chat_history", userId, threadId],
    queryFn: async () => {
      clearChat();
      setIsPending(true);
      const history = await getChatHistory({ userId, threadId });
      setMessages(history);
      setIsPending(false);
      return history;
    },
    enabled: !!userId && !!threadId,
  });
};

export const useSendMessage = () => {
  const {
    addMessage,
    updateMessageById,
    setIsStreaming
  } = useChatStore();


  const contentQueueRef = useRef<string[]>([]);
  const thinkingQueueRef = useRef<string[]>([]);
  const currentContentRef = useRef("");
  const currentThinkingRef = useRef("");
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startTypingLoop = (messageId: string) => {
    if (typingTimerRef.current) return;

    const tick = () => {
      let updated = false;

      // 🧠 Process Thinking Queue
      if (thinkingQueueRef.current.length > 0) {
        const nextChar = thinkingQueueRef.current.shift();
        currentThinkingRef.current += nextChar;
        updated = true;
      }
      // 💬 Process Content Queue
      else if (contentQueueRef.current.length > 0) {
        const nextChar = contentQueueRef.current.shift();
        currentContentRef.current += nextChar;
        updated = true;
      }

      if (updated) {
        updateMessageById(messageId, {
          content: currentContentRef.current,
          thinking: currentThinkingRef.current
        });

        // Speed up if queue is backed up
        const queueSize = contentQueueRef.current.length + thinkingQueueRef.current.length;
        const delay = queueSize > 100 ? 1 : queueSize > 20 ? 5 : 15;
        typingTimerRef.current = setTimeout(tick, delay);
      } else {
        typingTimerRef.current = null;
        setIsStreaming(false); // ✅ Finalize streaming state when queue is empty
      }
    };

    tick();
  };

  return useMutation({
    mutationFn: async ({ userId, threadId, content }: { userId: string, threadId: string, content: string }) => {
      // Reset refs for new message
      contentQueueRef.current = [];
      thinkingQueueRef.current = [];
      currentContentRef.current = "";
      currentThinkingRef.current = "";
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;

      addMessage({ role: "user", content, userId, threadId });

      const aiMessageId = crypto.randomUUID();
      addMessage({ id: aiMessageId, role: "ai", content: "", thinking: "", userId, threadId });

      setIsStreaming(true);

      const response = await sendMessage({ userId, threadId, content });
      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let lineBuffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          lineBuffer += decoder.decode(value, { stream: true });

          const events = lineBuffer.split("\n\n");
          lineBuffer = events.pop() || "";

          for (const part of events) {
            if (!part.trim()) continue;

            const lines = part.split("\n");
            let event = "";
            let data: any = null;

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("event:")) {
                event = trimmed.replace("event:", "").trim();
              } else if (trimmed.startsWith("data:")) {
                const dataStr = trimmed.replace("data:", "").trim();
                try {
                  data = JSON.parse(dataStr);
                } catch (e) { }
              }
            }

            if (data) {
              if (event === "thinking" && data.thinking) {
                thinkingQueueRef.current.push(...data.thinking.split(""));
                startTypingLoop(aiMessageId);
              } else if (event === "message" && data.content) {
                contentQueueRef.current.push(...data.content.split(""));
                startTypingLoop(aiMessageId);
              } else if (event === "end") {
                // Ensure loop continues until queues are empty
              } else if (event === "error") {
                updateMessageById(aiMessageId, {
                  content: "⚠️ Something went wrong while streaming.",
                });
                setIsStreaming(false);
              }
            }
          }
        }
      } catch (error) {
        console.error("Streaming error:", error);
      } finally {
        // We don't set isStreaming to false immediately to allow typewriter to finish
        reader.releaseLock();
      }
    },
  });
};
