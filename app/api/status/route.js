import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY
});

export async function GET() {
    const apiStatus = {
        deepseek: { available: false, status: "not configured" },
        pythonApi: { available: false, status: "not configured" }
    };

    // Check DeepSeek API
    if (process.env.DEEPSEEK_API_KEY) {
        try {
            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: "Hello" }],
                model: "deepseek-chat",
                max_tokens: 10
            });
            apiStatus.deepseek = { 
                available: true, 
                status: "connected",
                model: "deepseek-chat"
            };
        } catch (error) {
            let errorMessage = "Unknown error";
            if (error.status === 401) errorMessage = "Invalid API key";
            else if (error.status === 429) errorMessage = "Rate limit exceeded";
            else if (error.status === 402) errorMessage = "Insufficient credits";
            else if (error.message) errorMessage = error.message;
            
            apiStatus.deepseek = { 
                available: false, 
                status: "error",
                error: errorMessage,
                errorCode: error.status || 500
            };
        }
    }

    // Check Python API
    if (process.env.PYTHON_API_URL) {
        try {
            const response = await fetch(`${process.env.PYTHON_API_URL}/health`, {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                apiStatus.pythonApi = { 
                    available: true, 
                    status: "connected",
                    url: process.env.PYTHON_API_URL
                };
            } else {
                apiStatus.pythonApi = { 
                    available: false, 
                    status: "error",
                    error: `HTTP ${response.status}`
                };
            }
        } catch (error) {
            apiStatus.pythonApi = { 
                available: false, 
                status: "error",
                error: error.message || "Connection failed"
            };
        }
    }

    const hasAnyAPI = apiStatus.deepseek.available || apiStatus.pythonApi.available;
    const primaryAPI = apiStatus.deepseek.available ? "DeepSeek" : 
                      apiStatus.pythonApi.available ? "Python API" : "None";

    return NextResponse.json({ 
        success: hasAnyAPI,
        message: hasAnyAPI ? 
            `${primaryAPI} API is working correctly` : 
            "No working API found",
        status: hasAnyAPI ? "connected" : "error",
        apis: apiStatus,
        primaryAPI: primaryAPI,
        fallbackAPI: apiStatus.deepseek.available && apiStatus.pythonApi.available ? "Python API" : "None"
    });
}
