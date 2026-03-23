import dbConnect from "@/config/configDB";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);

        if (!userId){
            return NextResponse.json({
                success:false,
                message: "User Not Authenticated",
            });
        }

        const { chatId, name } = await request.json();

        await dbConnect();
        const updatedChat = await Chat.findOneAndUpdate(
            { _id: chatId, userId },
            { name },
            { new: true }
        );

        if (!updatedChat) {
            return NextResponse.json({
                success: false,
                message: "Chat not found or unauthorized"
            }, { status: 404 });
        }

    return NextResponse.json({ success: true, message: "Chat Renamed", data: updatedChat }, { status: 200 });
        
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        });
        
    }
    
}