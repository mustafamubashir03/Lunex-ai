import { tool, ToolRuntime } from "@langchain/core/tools";
import * as z from "zod";
import { AgentState } from "@/lib/agent/state";
import { docEmbeddingMultiVector, queryMultiVector } from "@/memo/stores/multi-vector";
import { Document } from "@langchain/core/documents";
import { connectDB } from "@/lib/mongodb/mongodb";
import { ChatHistory } from "@/models/chatHistorySchema";
import mongoose from "mongoose";

export const writeLTM = tool(
    async ({ info }, config: ToolRuntime<typeof AgentState.State>) => {
        const userId = config.state.userId || "anonymous";

        try {
            console.log(`[LTM WRITE] User: ${userId} | Info: ${info}`);

            await docEmbeddingMultiVector({
                allDocs: [new Document({ pageContent: info, metadata: { source: "agent_write", type: "fact" } })],
                userId
            });

            console.log(`[LTM WRITE SUCCESS] Saved to Pinecone for ${userId}`);

            return `Memory saved and indexed in LTM: ${info}`;
        } catch (error) {
            console.error("LTM Write Error:", error);
            return "Failed to save to long-term memory.";
        }
    },
    {
        name: "writeLTM",
        description: "Save structured, concise summaries into long-term memory.",
        schema: z.object({
            info: z.string().describe("The information to remember"),
        }),
    }
);

export const searchLTM = tool(
    async ({ query }, config: ToolRuntime<typeof AgentState.State>) => {
        const userId = config.state.userId || "anonymous";
        try {
            const { retrievedDocs } = await queryMultiVector({ userId, query });
            const memoryText = retrievedDocs.map(d => d.pageContent).join("\n---\n");
            return memoryText || "No relevant long-term memories found.";
        } catch (error) {
            console.error("Search LTM error:", error);
            return "Failed to search long-term memory.";
        }
    },
    {
        name: "searchLTM",
        description: "Search for relevant information and summaries from past conversations using semantic search.",
        schema: z.object({
            query: z.string().describe("The semantic query to search for in past memories"),
        }),
    }
);

export const readHistory = tool(
    async ({ threadId }) => {
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
        name: "readHistory",
        description: "Read the conversation history of a specific thread from MongoDB.",
        schema: z.object({
            threadId: z.string().describe("The ID of the thread to read"),
        }),
    }
);
