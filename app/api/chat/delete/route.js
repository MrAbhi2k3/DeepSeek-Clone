import dbConnect from "@/config/configDB";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { chatId } = await request.json();

        if (!userId) {
            return NextResponse.json({ success: false, message: "User not Authenticated" });
        }


        // Connect the Database to update the Chat name
        await dbConnect();
        await Chat.deleteOne({
            _id: chatId, userId
        })

        return NextResponse.json({ success: true, message: "Chat Deleted Successfully" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message });
    }
}