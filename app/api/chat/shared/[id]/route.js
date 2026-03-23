import dbConnect from "@/config/configDB";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Chat ID is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        const chat = await Chat.findById(id).lean();

        if (!chat) {
            return NextResponse.json(
                { success: false, message: "Chat not found" },
                { status: 404 }
            );
        }

        // https://github.com/MrAbhi2k3
        return NextResponse.json(
            {
                success: true,
                data: chat
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Shared chat fetch error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch shared chat",
                error: error.message
            },
            { status: 500 }
        );
    }
}
