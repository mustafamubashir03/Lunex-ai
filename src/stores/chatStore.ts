import { create } from "zustand";

export interface Message {
  id?: string;
  role: "user" | "ai";
  content: string;
  thinking?: string;
  userId?: string;
  threadId?: string;
  projectId?: string;
  createdAt?: string;
}

interface ChatState {
  messages: Message[];
  isPending: boolean;
  isStreaming: boolean;
  currentThinking: string;
  currentContent: string;
  
  // Actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastAiMessage: (update: Partial<Message>) => void;
  updateMessageById: (id: string, update: Partial<Message>) => void;
  setIsPending: (isPending: boolean) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setCurrentThinking: (thinking: string) => void;
  setCurrentContent: (content: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isPending: false,
  isStreaming: false,
  currentThinking: "",
  currentContent: "",

  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateLastAiMessage: (update) => set((state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage && lastMessage.role === "ai") {
      const newMessages = [...state.messages];
      newMessages[newMessages.length - 1] = { ...lastMessage, ...update };
      return { messages: newMessages };
    }
    return state;
  }),
  updateMessageById: (id, update) => set((state) => ({
    messages: state.messages.map((m) => (m.id === id ? { ...m, ...update } : m)),
  })),
  setIsPending: (isPending) => set({ isPending }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setCurrentThinking: (currentThinking) => set({ currentThinking }),
  setCurrentContent: (currentContent) => set({ currentContent }),
  clearChat: () => set({ messages: [], currentThinking: "", currentContent: "", isStreaming: false }),
}));
