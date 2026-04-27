import { Thread } from "@/stores/threadStore";
import { tool } from "@langchain/core/tools";
import fs from "fs";
import path from "path"
import { v4 as uuidv4 } from "uuid";

import { z } from "zod";


const ROOT = process.cwd();
const CHAT_HISTORY_DIR = path.join(ROOT, "public", "threads")

if (!fs.existsSync(CHAT_HISTORY_DIR)) {
    fs.mkdirSync(CHAT_HISTORY_DIR, { recursive: true })
}

const CHAT_HISTORY_FILE = path.join(CHAT_HISTORY_DIR, "threads.json")

export const threadSchema = z.object({
    userId: z.string(),
    threadId: z.string(),
    title: z.string(),
    active: z.boolean(),
    createdAt: z.string()
})


export const createThreadHistoryTool = tool(
    async ({ userId, title }: { userId: string, title: string }) => {
        try {
            let threads: any[] = []
            if (fs.existsSync(CHAT_HISTORY_FILE)) {
                const data = fs.readFileSync(CHAT_HISTORY_FILE, 'utf-8')
                threads = JSON.parse(data)
            }
            threads = threads.map((t) => {
                if (t.userId === userId && t.active === true) {
                    return { ...t, active: false }
                }
                return t
            })
            const newThread = {
                userId,
                title: title || "New Thread",
                threadId: uuidv4(),
                active: true,
                createdAt: new Date().toISOString()
            }
            threads.push(newThread)
            fs.writeFileSync(CHAT_HISTORY_FILE, JSON.stringify(threads, null, 2), 'utf-8')
            return JSON.stringify(newThread)
        } catch (error) {
            console.log("Error while creating thread", error)
            return "Failed to create thread"
        }
    }, {
    name: "create_thread",
    description: "Create a new thread. If an active thread exists, deactivate it and create a new active thread",
    schema: z.object({
        userId: z.string(),
        title: z.string().optional()
    })
}
)

export const readThreadTool = tool(async ({ threadId, userId }: { threadId: string, userId: string }) => {
    try {
        if (!fs.existsSync(CHAT_HISTORY_FILE)) {
            return "[]"

        }
        const data = fs.readFileSync(CHAT_HISTORY_FILE, "utf-8")
        const threads = JSON.parse(data)
        let threadFound = false
        const updatedThreads = threads.map((t: any) => {
            if (t.userId === userId) {
                if (t.threadId === threadId) {
                    threadFound = true
                    return { ...t, active: true }
                }
                return { ...t, active: false }
            }
            return t
        })
        if (!threadFound) {
            return "Thread not found"
        }
        fs.writeFileSync(CHAT_HISTORY_FILE, JSON.stringify(updatedThreads, null, 2), "utf-8")
        const userThread = updatedThreads.filter((t: Thread) => t.userId === userId)
        return JSON.stringify(userThread)



    } catch (error) {
        console.error("Read thread error", error)
        return "[]"

    }
}, {
    name: "read_threads",
    description: "Retrieve all threads for a user and activate a specific thread",
    schema: z.object({
        threadId: z.string(),
        userId: z.string()
    })
})


export const updateThreadTool = tool(({ threadId, userId, title }: { threadId: string, userId: string, title: string }) => {
    try {
        if (!fs.existsSync(CHAT_HISTORY_FILE)) {
            return "Thread file not found"
        }
        const data = fs.readFileSync(CHAT_HISTORY_FILE, "utf-8")
        const threads = JSON.parse(data)
        const threadIndex = threads.findIndex((t: any) =>
            t.userId === userId && t.threadId === threadId)
        if (threadIndex === -1) {
            return "Thread not found."
        }
        threads[threadIndex].title = title
        fs.writeFileSync(CHAT_HISTORY_FILE, JSON.stringify(threads, null, 2), "utf-8")
        return "Thread title updated successfully."

    } catch (error) {
        console.error("thread not found", error)
        return "Failed to update thread title."
    }

}, {
    name: "update_thread_title",
    description: "Update the title of a specific thread using userId and threadId",
    schema: z.object({
        threadId: z.string(),
        userId: z.string(),
        title: z.string()
    })
})

export const getAllThreadsByUserId = tool(({ userId }: { userId: string }) => {
    try {
        let threads: any[] = []
        if (fs.existsSync(CHAT_HISTORY_FILE)) {
            const data = fs.readFileSync(CHAT_HISTORY_FILE, "utf-8")
            threads = JSON.parse(data)
        }
        let userThreads = threads.filter((t: Thread) =>
            t.userId === userId
        )
        if (userThreads.length === 0) {
            const newThread = {
                userId,
                title: "New Thread",
                threadId: uuidv4(),
                active: true,
                createdAt: new Date().toISOString()
            }
            threads.push(newThread)
            fs.writeFileSync(CHAT_HISTORY_FILE, JSON.stringify(threads, null, 2), "utf-8")
            userThreads = [newThread]
        }
        let activeThread = userThreads.find((t: Thread) => t.active)
        if (!activeThread) {
            activeThread = userThreads[0]
            activeThread.active = true
            const index = threads.findIndex((t: Thread) => t.threadId === activeThread.threadId)
            if (index >= 0) {
                threads[index] = activeThread
            }
            fs.writeFileSync(CHAT_HISTORY_FILE, JSON.stringify(threads, null, 2), "utf-8")
        }
        return {
            threads: userThreads,
            redirectThreadId: activeThread.threadId
        }
    } catch (error) {
        console.error("Couldn't get all threads by userId", error)
        return "Failed to get all threads by userId"
    }
}, {
    name: "get_all_user_threads",
    description: "Returns all threads belonging to the user using userId",
    schema: z.object({
        userId: z.string()
    })
})

