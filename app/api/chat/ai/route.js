// Please install OpenAI SDK first: `npm install openai`

export const maxDuration = 60;
import dbConnect from "@/config/configDB";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import Chat from "@/models/Chat"; 

const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API
});

export async function POST(request) {
    try {
        const { userId } = getAuth(request);

        const { chatId, prompt } = await request.json();

        if (!userId) {
            return NextResponse.json({ success: false, message: "User not Authenticated" });
        }

        // Connect Db and Find the Chat
        await dbConnect();
        const data = await Chat.findOne({
            userId,
            _id: chatId
        });
        const userPrompt = {
            role: "user",
            content: prompt,
            timestamp: Date.now(),
        };

        data.messages.push(userPrompt);

        //  Calling Deepseek Api
          const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "deepseek-chat",
                store: true,
          });
        const response = completion.choices[0].message;
        response.timestamp = Date.now();
        data.messages.push(response);
        // Save the updated chat
        await data.save();

        return NextResponse.json({ success: true, data: response });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message });
    }
}