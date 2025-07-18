import dbConnect from "@/config/configDB";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
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

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 20;
        const page = parseInt(searchParams.get('page')) || 1;
        const sort = searchParams.get('sort') || '-createdAt';

        // Fetch chats with pagination and sorting
        const chats = await Chat.find({ userId })
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(); // Convert to plain JS objects for better performance

        // Get total count for pagination info
        const total = await Chat.countDocuments({ userId });

        return NextResponse.json(
            { 
                success: true, 
                data: chats,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("GET /api/chats Error:", error);
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