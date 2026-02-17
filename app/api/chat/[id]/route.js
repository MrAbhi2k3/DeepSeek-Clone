import dbConnect from "@/config/configDB";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        // Authentication check
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Database connection
        await dbConnect();

        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Chat ID is required" },
                { status: 400 }
            );
        }

        // Fetch specific chat
        const chat = await Chat.findOne({ 
            _id: id, 
            userId 
        }).lean();

        if (!chat) {
            return NextResponse.json(
                { success: false, message: "Chat not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { 
                success: true, 
                data: chat
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("GET /api/chat/[id] Error:", error);
        return NextResponse.json(
            { 
                success: false, 
                message: "Internal Server Error",
                error: error.message 
            },
            { status: 500 }
        );
    }
}
