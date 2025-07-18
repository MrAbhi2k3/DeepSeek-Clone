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

        //  Connect Db
        await dbConnect();
        await Chat.findOneAndUpdate({
            _id: chatId,
            userId
        },
        {name}
    )

    return NextResponse.json({
        success: true, message: "Chat Renamed"
    });
        
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        });
        
    }
    
}