import mongoose from "mongoose";

const memorySchema = new mongoose.Schema({
    threadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Thread",
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    keyFacts: {
        type: [String],
        default: []
    },
    sourceMessageCount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false,
    strict: true
});

// Enforce append-only logic by preventing updates at the model level if needed, 
// but we'll primarily handle this in the service layer.

export const Memory = mongoose.models.Memory || mongoose.model("Memory", memorySchema);
