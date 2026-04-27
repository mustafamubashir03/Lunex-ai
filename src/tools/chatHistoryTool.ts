import fs from "fs"
import path from "path"
import { tool } from "@langchain/core/tools"
import { z } from "zod"


const ROOT = process.cwd()
const CHAT_HISTORY_DIR = path.join(ROOT, "public", "chat-history")

if (!fs.existsSync(CHAT_HISTORY_DIR)) {
    fs.mkdirSync(CHAT_HISTORY_DIR, { recursive: true })
}

const CHAT_HISTORY_FILE = path.join(CHAT_HISTORY_DIR, "chatHistory.json")

export const messageSchema = z.object({
    userId: z.string(),
    threadId: z.string(),
    role: z.enum(["user", "ai"]),
    content: z.string(),
    thinking: z.string().optional()
})

export const writeToChatHistoryTool = tool(async ({ messages }: { messages: z.infer<typeof messageSchema>[] }) => {
    try {
        if (!fs.existsSync(CHAT_HISTORY_FILE)) {
            return "File not found"
        }
        const data = fs.readFileSync(CHAT_HISTORY_FILE, "utf-8")
        const chatHistory = JSON.parse(data)
        chatHistory.push(...messages)
        fs.writeFileSync(CHAT_HISTORY_FILE, JSON.stringify(chatHistory, null, 2), "utf-8")
        return "Messages written to chat history"
    } catch (error) {
        console.error("Error while writing to chat history", error)
        return "Failed to write messages to chat history"
    }
}, {
    name: "write_to_chat_history",
    description: "Write messages to chat history",
    schema: z.object({ messages: z.array(messageSchema) })
})



export const readChatHistoryTool = tool(async ({ userId, threadId }: { userId: string, threadId: string }) => {
    try {
        if (!fs.existsSync(CHAT_HISTORY_FILE)) {
            return "File not found"
        }
        const data = fs.readFileSync(CHAT_HISTORY_FILE, "utf-8")
        const chatHistory = JSON.parse(data)
        const userChatHistory = chatHistory.filter((m: z.infer<typeof messageSchema>) => m.userId === userId && m.threadId === threadId)
        return JSON.stringify(userChatHistory)
    } catch (error) {
        console.error("Error while reading chat history", error)
        return "Failed to read chat history"
    }
}, {
    name: "read_chat_history",
    description: "Read chat history for a user and thread",
    schema: z.object({ userId: z.string(), threadId: z.string() })
})