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


        await dbConnect();
        const result = await Chat.deleteOne({
            _id: chatId, userId
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ success: false, message: "Chat not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Chat Deleted Successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message });
    }
}