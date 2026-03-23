export const maxDuration = 60;
import dbConnect from "@/config/configDB";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Chat from "@/models/Chat";

const KIMI_API_URL = "https://baseapi-sigma.vercel.app/api/openai/kimi";

function extractAssistantContent(payload) {
    if (typeof payload === "string") {
        return payload;
    }

    if (!payload || typeof payload !== "object") {
        return "";
    }

    return (
        payload.response ||
        payload.content ||
        payload.message ||
        payload.answer ||
        payload.result ||
        payload.output ||
        (typeof payload.data === "string" ? payload.data : "") ||
        payload?.data?.response ||
        payload?.data?.content ||
        payload?.data?.message ||
        payload?.choices?.[0]?.message?.content ||
        payload?.choices?.[0]?.text ||
        ""
    );
}

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { chatId, prompt } = await request.json();

        if (!userId) {
            return NextResponse.json({ success: false, message: "User not Authenticated" }, { status: 401 });
        }

        if (!chatId || !prompt) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();
        const data = await Chat.findOne({
            userId,
            _id: chatId
        });

        if (!data) {
            return NextResponse.json({ success: false, message: "Chat not found" }, { status: 404 });
        }

        const userPrompt = {
            role: "user",
            content: prompt.trim(),
            timestamp: Date.now(),
        };

        const isFirstMessage = data.messages.length === 0;
        data.messages.push(userPrompt);

        // https://github.com/MrAbhi2k3
        if (isFirstMessage && data.name === "New Chat") {
            const firstMessageWords = prompt.trim().split(/\s+/).slice(0, 4).join(" ");
            data.name = firstMessageWords || "New Chat";
        }

        const endpoint = `${KIMI_API_URL}?text=${encodeURIComponent(prompt.trim())}`;
        const apiResponse = await fetch(endpoint, {
            method: "GET",
            cache: "no-store",
        });

        if (!apiResponse.ok) {
            throw new Error(`Kimi API request failed with status ${apiResponse.status}`);
        }

        const contentType = apiResponse.headers.get("content-type") || "";
        const body = contentType.includes("application/json")
            ? await apiResponse.json()
            : await apiResponse.text();

        const assistantContent = extractAssistantContent(body);

        if (!assistantContent || !assistantContent.trim()) {
            throw new Error("Kimi API returned an empty response");
        }

        const response = {
            role: "assistant",
            content: assistantContent.trim(),
            timestamp: Date.now(),
        };

        data.messages.push(response);
        await data.save();

        return NextResponse.json({ 
            success: true, 
            data: response,
            apiUsed: "Kimi API",
            messageCount: data.messages.length
        }, { status: 200 });
    } catch (error) {
        console.error("API Error:", error);

        return NextResponse.json(
            { success: false, message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}