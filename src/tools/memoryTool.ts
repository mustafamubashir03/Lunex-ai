import { tool, ToolMessage, type ToolRuntime } from "langchain";
import { Command } from "@langchain/langgraph";
import * as z from "zod";
import { AgentState } from "@/lib/agent/state";
import { ChatHistory } from "@/models/chatHistorySchema";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb/mongodb";
import { queryMultiVector, docEmbeddingMultiVector } from "@/memo/stores/multi-vector";
import { Document } from "@langchain/core/documents";

export const getUserInfo = tool(
    async (_, config: ToolRuntime<typeof AgentState.State>) => {
        const userName = config.state.userName;
        return userName ? `User is known as ${userName}` : "User is currently unknown.";
    },
    {
        name: "get_user_info",
        description: "Retrieve the current user's name and information from persistent memory.",
        schema: z.object({}),
    }
);

export const updateUserInfo = tool(
    async ({ name }, config: ToolRuntime<typeof AgentState.State>) => {
        return new Command({
            update: {
                userName: name,
                messages: [
                    new ToolMessage({
                        content: `User name updated to: ${name}`,
                        tool_call_id: config.toolCall?.id ?? "",
                    }),
                ],
            },
        });
    },
    {
        name: "update_user_info",
        description: "Update the user's name or identity in persistent memory.",
        schema: z.object({
            name: z.string().describe("The name to save for the user"),
        }),
    }
);

export const greet = tool(
    async (_, config: ToolRuntime<typeof AgentState.State>) => {
        const userName = config.state.userName || "friend";
        return `Hello ${userName}!`;
    },
    {
        name: "greet",
        description: "Greet the user personally using their name from memory.",
        schema: z.object({}),
    }
);

export const writeMemory = tool(
    async ({ info }, config: ToolRuntime<typeof AgentState.State>) => {
        const userId = config.state.userId || "anonymous";
        const currentMemories = config.state.memories || [];
        
        try {
            // 1. Write to LTM (Existing pipeline)
            await docEmbeddingMultiVector({
                allDocs: [new Document({ pageContent: info, metadata: { source: "agent_write", type: "fact" } })],
                userId
            });

            return new Command({
                update: {
                    memories: [...currentMemories, info],
                    messages: [
                        new ToolMessage({
                            content: `Memory saved and indexed in LTM: ${info}`,
                            tool_call_id: config.toolCall?.id ?? "",
                        }),
                    ],
                },
            });
        } catch (error) {
            console.error("LTM Write Error:", error);
            return "Failed to save to long-term memory.";
        }
    },
    {
        name: "write_memory",
        description: "Save important information about the user or conversation to persistent memory.",
        schema: z.object({
            info: z.string().describe("The information to remember"),
        }),
    }
);

export const searchLongTermMemory = tool(
    async ({ query }, config: ToolRuntime<typeof AgentState.State>) => {
        const userId = config.state.userId || "anonymous";
        try {
            // Use existing multi-vector retrieval logic
            const { retrievedDocs } = await queryMultiVector({ userId, query });
            
            const memoryText = retrievedDocs.map(d => d.pageContent).join("\n---\n");
            return memoryText || "No relevant long-term memories found.";
        } catch (error) {
            console.error("Search LTM error:", error);
            return "Failed to search long-term memory.";
        }
    },
    {
        name: "search_long_term_memory",
        description: "Search for relevant information and summaries from past conversations using semantic search.",
        schema: z.object({
            query: z.string().describe("The semantic query to search for in past memories"),
        }),
    }
);

export const readThreadHistory = tool(
    async ({ threadId }, config: ToolRuntime<typeof AgentState.State>) => {
        try {
            await connectDB();
            if (!mongoose.Types.ObjectId.isValid(threadId)) {
                return "Invalid thread ID.";
            }

            const messages = await ChatHistory.find({ 
                threadId: new mongoose.Types.ObjectId(threadId) 
            }).sort({ createdAt: 1 }).limit(50);
            
            const historyText = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
            return historyText || "No history found for this thread.";
        } catch (error) {
            console.error("Read history error:", error);
            return "Failed to read thread history.";
        }
    },
    {
        name: "read_thread_history",
        description: "Read the raw chat history for a specific thread from the database.",
        schema: z.object({
            threadId: z.string().describe("The MongoDB ObjectId of the thread to read"),
        }),
    }
);
