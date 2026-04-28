import { readMongoChatHistoryTool } from "@/tools/mongoChatHistoryTool";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get("userId")
        const threadId = searchParams.get("threadId")
        if (!userId || !threadId) {
            return NextResponse.json({ error: "userId and threadId are required" }, { status: 400 })
        }
        const result = await readMongoChatHistoryTool.invoke({ userId, threadId })
        return NextResponse.json({ messages: JSON.parse(result) })
    } catch (error) {
        console.error("Error while getting chat history", error)
        return NextResponse.json({ error: "Failed to get chat history" }, { status: 500 })
    }
}
