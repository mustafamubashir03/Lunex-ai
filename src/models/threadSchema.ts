
import mongoose from "mongoose"

const threadSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    lastCompressedAt: {
        type: Date,
        default: null
    }

}, { timestamps: true, strict: false })

export const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema)
