import dbConnect from "@/config/configDB";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Chat from "@/models/Chat";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { chatId, messageIndex } = await request.json();

        if (!userId) {
            return NextResponse.json({ success: false, message: "User not authenticated" });
        }

        if (!chatId || messageIndex === undefined) {
            return NextResponse.json({ success: false, message: "Missing required fields" });
        }

        // Connect to database
        await dbConnect();
        
        // Find the chat
        const chat = await Chat.findOne({
            userId,
            _id: chatId
        });

        if (!chat) {
            return NextResponse.json({ success: false, message: "Chat not found" });
        }

        // Check if message index is valid
        if (messageIndex < 0 || messageIndex >= chat.messages.length) {
            return NextResponse.json({ success: false, message: "Invalid message index" });
        }

        // Remove the message at the specified index
        chat.messages.splice(messageIndex, 1);

        // Save the updated chat
        await chat.save();

        return NextResponse.json({ 
            success: true, 
            message: "Message deleted successfully",
            data: { remainingMessages: chat.messages.length }
        });

    } catch (error) {
        console.error("Delete message error:", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || "Failed to delete message" 
        });
    }
}
