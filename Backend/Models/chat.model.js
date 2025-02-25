import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        type: { type: String, enum: ["text", "image", "document"], default: "text" },
        fileUrl: { type: String, default: null },
        seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    },
    { timestamps: true }
);

const chatSchema = new mongoose.Schema(
    {
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        isGroupChat: { type: Boolean, default: false },
        groupName: { type: String, default: null },
        messages: [messageSchema],
    },
    { timestamps: true }
);

export const Chat= mongoose.model("Chat", chatSchema);
