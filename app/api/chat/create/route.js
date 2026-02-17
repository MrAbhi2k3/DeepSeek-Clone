import dbConnect from "@/config/configDB";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function POST(request) {
    try {
        const { userId } = getAuth(request)

        if (!userId){
            return NextResponse.json({success: false, message: "User not Authenticated",})
        }

        const chatData = {
            userId,
            messages:[],
            name : "New Chat",
        };

        // Connect the Database to create new Chat
        await dbConnect();
        await Chat.create(chatData);

        return NextResponse.json({success: true, message: "New Chat Created"})
    } catch (error){
        return NextResponse.json({ success: false, error: error.message})
    }
}