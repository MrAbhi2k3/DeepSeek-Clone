// DeepSeek API Integration with Python API Fallback

export const maxDuration = 60;
import dbConnect from "@/config/configDB";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import Chat from "@/models/Chat";

// Primary DeepSeek API
const deepseekClient = new OpenAI({
        baseURL: 'https://api.deepseek.com/v1',
        apiKey: process.env.DEEPSEEK_API_KEY
});

// Function to call Python API fallback
async function callPythonAPI(messages) {
    if (!process.env.PYTHON_API_URL) {
        throw new Error("Python API URL not configured");
    }

    const response = await fetch(process.env.PYTHON_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages: messages,
            model: "deepseek-chat",
            stream: false,
            temperature: 0.7,
            max_tokens: 4000
        })
    });

    if (!response.ok) {
        throw new Error(`Python API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return {
        choices: [{
            message: {
                role: "assistant",
                content: data.response || data.content || data.message || "No response from Python API"
            }
        }]
    };
}

export async function POST(request) {
    try {
        // Check for required environment variables
        if (!process.env.DEEPSEEK_API_KEY && !process.env.PYTHON_API_URL) {
            return NextResponse.json({ 
                success: false, 
                message: "Please set DEEPSEEK_API_KEY or PYTHON_API_URL" 
            });
        }

        const { userId } = getAuth(request);
        const { chatId, prompt } = await request.json();

        if (!userId) {
            return NextResponse.json({ success: false, message: "User not Authenticated" });
        }

        if (!chatId || !prompt) {
            return NextResponse.json({ success: false, message: "Missing required fields" });
        }

        // Connect Db and Find the Chat
        await dbConnect();
        const data = await Chat.findOne({
            userId,
            _id: chatId
        });

        if (!data) {
            return NextResponse.json({ success: false, message: "Chat not found" });
        }
        // Add user message to the chat
        const userPrompt = {
            role: "user",
            content: prompt,
            timestamp: Date.now(),
        };

        data.messages.push(userPrompt);
        console.log(`Added user message to chat ${chatId}. Total messages: ${data.messages.length}`);

        // Build conversation history for better context
        const conversationMessages = [
            { role: "system", content: "You are DeepSeek, a helpful AI assistant. Provide accurate, helpful, and detailed responses." },
            ...data.messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        ];

        let completion;
        let apiUsed = "unknown";

        // Try DeepSeek API first
        if (process.env.DEEPSEEK_API_KEY) {
            try {
                completion = await deepseekClient.chat.completions.create({
                    messages: conversationMessages,
                    model: "deepseek-chat",
                    stream: false,
                    temperature: 0.7,
                    max_tokens: 4000
                });
                apiUsed = "DeepSeek";
            } catch (deepseekError) {
                console.log("DeepSeek API failed, trying Python API fallback:", deepseekError.message);
                
                // If DeepSeek fails (insufficient credits, rate limit, etc.), try Python API
                if (process.env.PYTHON_API_URL) {
                    try {
                        completion = await callPythonAPI(conversationMessages);
                        apiUsed = "Python API (fallback)";
                    } catch (pythonError) {
                        throw new Error(`Both APIs failed. DeepSeek: ${deepseekError.message}, Python API: ${pythonError.message}`);
                    }
                } else {
                    throw deepseekError;
                }
            }
        } else if (process.env.PYTHON_API_URL) {
            // If no DeepSeek key, use Python API directly
            completion = await callPythonAPI(conversationMessages);
            apiUsed = "Python API";
        } else {
            throw new Error("No API configured");
        }
        const response = completion.choices[0].message;
        response.timestamp = Date.now();
        data.messages.push(response);
        
        // Save the updated chat with error handling
        try {
            await data.save();
            console.log(`Chat ${chatId} updated successfully with ${data.messages.length} messages`);
        } catch (saveError) {
            console.error("Error saving chat:", saveError);
            throw new Error("Failed to save chat history");
        }

        return NextResponse.json({ 
            success: true, 
            data: response,
            apiUsed: apiUsed,
            messageCount: data.messages.length
        });
    } catch (error) {
        console.error("API Error:", error);
        
        // Handle specific DeepSeek API errors
        if (error.status === 429) {
            return NextResponse.json({ 
                success: false, 
                message: "Rate limit exceeded on DeepSeek API. Please try again in a moment." 
            });
        }
        
        if (error.status === 401) {
            return NextResponse.json({ 
                success: false, 
                message: "Invalid DeepSeek API key. Please check your API key configuration." 
            });
        }

        if (error.status === 402) {
            return NextResponse.json({ 
                success: false, 
                message: "Insufficient credits. Please check your DeepSeek account balance." 
            });
        }
        
        return NextResponse.json({ success: false, message: error.message });
    }
}