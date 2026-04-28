import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { Thread } from "@/models/threadSchema";
import { connectDB } from "@/lib/mongodb/mongodb";

export const createMongoThreadTool = tool(
    async ({ userId, title }: { userId: string, title: string }) => {
        try {
            await connectDB();
            
            // Deactivate all existing active threads for this user
            await Thread.updateMany({ userId, active: true }, { $set: { active: false } });
            
            const newThread = await Thread.create({
                userId,
                title: title || "New Thread",
                active: true,
            });
            
            return JSON.stringify({
                userId: newThread.userId,
                title: newThread.title,
                threadId: newThread._id.toString(),
                active: newThread.active,
                createdAt: newThread.createdAt
            });
        } catch (error) {
            console.log("Error while creating mongo thread", error);
            return "Failed to create thread";
        }
    }, {
    name: "create_mongo_thread",
    description: "Create a new thread in MongoDB. If an active thread exists, deactivate it and create a new active thread",
    schema: z.object({
        userId: z.string(),
        title: z.string().optional().default("New Thread")
    })
});

export const readMongoThreadTool = tool(async ({ threadId, userId }: { threadId: string, userId: string }) => {
    try {
        await connectDB();
        
        // Deactivate all threads for user
        await Thread.updateMany({ userId }, { $set: { active: false } });
        
        // Activate the specific thread
        await Thread.findOneAndUpdate({ _id: threadId, userId }, { $set: { active: true } });
        
        const threads = await Thread.find({ userId }).sort({ createdAt: 1 });
        
        const formattedThreads = threads.map(t => ({
            userId: t.userId,
            title: t.title,
            threadId: t._id.toString(),
            active: t.active,
            createdAt: t.createdAt
        }));
        
        return JSON.stringify(formattedThreads);

    } catch (error) {
        console.error("Read mongo thread error", error);
        return "[]";
    }
}, {
    name: "read_mongo_threads",
    description: "Retrieve all threads for a user and activate a specific thread from MongoDB",
    schema: z.object({
        threadId: z.string(),
        userId: z.string()
    })
});

export const updateMongoThreadTool = tool(async ({ threadId, userId, title }: { threadId: string, userId: string, title: string }) => {
    try {
        await connectDB();
        
        const updated = await Thread.findOneAndUpdate(
            { _id: threadId, userId },
            { $set: { title } }
        );
        
        if (!updated) {
            return "Thread not found.";
        }
        
        return "Thread title updated successfully.";

    } catch (error) {
        console.error("Update mongo thread error", error);
        return "Failed to update thread title.";
    }
}, {
    name: "update_mongo_thread_title",
    description: "Update the title of a specific thread using userId and threadId in MongoDB",
    schema: z.object({
        threadId: z.string(),
        userId: z.string(),
        title: z.string()
    })
});

export const getAllMongoThreadsByUserId = tool(async ({ userId }: { userId: string }) => {
    try {
        await connectDB();
        
        let threads = await Thread.find({ userId }).sort({ createdAt: 1 });
        
        if (threads.length === 0) {
            const newThread = await Thread.create({
                userId,
                title: "New Thread",
                active: true,
            });
            threads = [newThread];
        }
        
        let activeThread = threads.find(t => t.active);
        
        if (!activeThread) {
            activeThread = threads[0];
            activeThread.active = true;
            await Thread.updateOne({ _id: activeThread._id }, { $set: { active: true } });
        }
        
        const formattedThreads = threads.map(t => ({
            userId: t.userId,
            title: t.title,
            threadId: t._id.toString(),
            active: t.active,
            createdAt: t.createdAt
        }));

        return {
            threads: formattedThreads,
            redirectThreadId: activeThread._id.toString()
        };
    } catch (error) {
        console.error("Couldn't get all mongo threads by userId", error);
        return "Failed to get all threads by userId";
    }
}, {
    name: "get_all_mongo_user_threads",
    description: "Returns all threads belonging to the user using userId from MongoDB",
    schema: z.object({
        userId: z.string()
    })
});

export const deleteMongoThreadTool = tool(async ({ threadId, userId }: { threadId: string, userId: string }) => {
    try {
        await connectDB();
        
        const deleted = await Thread.findOneAndDelete({ _id: threadId, userId });
        if (!deleted) {
            return "Thread not found or already deleted.";
        }
        
        return "Thread deleted successfully.";
    } catch (error) {
        console.error("Delete mongo thread error", error);
        return "Failed to delete thread.";
    }
}, {
    name: "delete_mongo_thread",
    description: "Delete a specific thread using userId and threadId in MongoDB",
    schema: z.object({
        threadId: z.string(),
        userId: z.string()
    })
});
