

import mongoose from "mongoose"

const chatHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    threadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Thread",
        required: true
    },
    role: {
        type: String,
        enum: ["user", "ai"],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    thinking: {
        type: String,
        required: false
    }

}, { timestamps: true, strict: false })

export const ChatHistory = mongoose.models.ChatHistory || mongoose.model("ChatHistory", chatHistorySchema)
