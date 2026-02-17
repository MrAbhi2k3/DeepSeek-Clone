import dbConnect from "@/config/configDB";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Chat from "@/models/Chat";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { chatId, messageIndex, newContent } = await request.json();

        if (!userId) {
            return NextResponse.json({ success: false, message: "User not authenticated" });
        }

        if (!chatId || messageIndex === undefined || !newContent?.trim()) {
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

        // Update the message content
        chat.messages[messageIndex].content = newContent.trim();
        chat.messages[messageIndex].timestamp = Date.now();

        // Save the updated chat
        await chat.save();

        return NextResponse.json({ 
            success: true, 
            message: "Message updated successfully",
            data: chat.messages[messageIndex]
        });

    } catch (error) {
        console.error("Edit message error:", error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || "Failed to update message" 
        });
    }
}
