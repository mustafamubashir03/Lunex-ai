import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatHistory } from "@/models/chatHistorySchema";
import { connectDB } from "@/lib/mongodb/mongodb";

export const messageSchema = z.object({
    userId: z.string(),
    threadId: z.string(),
    role: z.enum(["user", "ai"]),
    content: z.string(),
    thinking: z.string().optional()
});

export const writeToMongoChatHistoryTool = tool(async ({ messages }: { messages: z.infer<typeof messageSchema>[] }) => {
    try {
        await connectDB();
        await ChatHistory.insertMany(messages);
        return "Messages written to chat history";
    } catch (error) {
        console.error("Error while writing to mongo chat history", error);
        return "Failed to write messages to chat history";
    }
}, {
    name: "write_to_mongo_chat_history",
    description: "Write messages to chat history in MongoDB",
    schema: z.object({ messages: z.array(messageSchema) })
});

export const readMongoChatHistoryTool = tool(async ({ userId, threadId }: { userId: string, threadId: string }) => {
    try {
        await connectDB();
        const chatHistory = await ChatHistory.find({ userId, threadId }).sort({ createdAt: 1 });
        
        const formattedHistory = chatHistory.map(m => ({
            userId: m.userId.toString(),
            threadId: m.threadId.toString(),
            role: m.role,
            content: m.content,
            thinking: m.thinking,
            createdAt: m.createdAt
        }));
        
        return JSON.stringify(formattedHistory);
    } catch (error) {
        console.error("Error while reading mongo chat history", error);
        return "Failed to read chat history";
    }
}, {
    name: "read_mongo_chat_history",
    description: "Read chat history for a user and thread from MongoDB",
    schema: z.object({ userId: z.string(), threadId: z.string() })
});
