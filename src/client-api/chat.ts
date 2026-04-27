import { Message } from "@/stores/chatStore";


export const getChatHistory = async ({
  userId,
  threadId,
}: {
  userId: string;
  threadId: string;
}): Promise<Message[]> => {
  try {
    const res = await fetch(`/api/agent/chat-history?userId=${userId}&threadId=${threadId}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch chat history (${res.status})`);
    }

    const data = await res.json();
    return Array.isArray(data?.messages) ? data.messages : [];
  } catch (error) {
    console.error("getChatHistory:", error);
    return [];
  }
};

export const sendMessage = async ({
  userId,
  threadId,
  content,
}: {
  userId: string;
  threadId: string;
  content: string;
}): Promise<Response> => {
  const res = await fetch(`/api/agent/streams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, threadId, content }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send message (${res.status})`);
  }

  return res;
};
