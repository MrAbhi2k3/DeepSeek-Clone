import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@clerk/nextjs';
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ChatBox = () => {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { selectedChat, chats, setChats, fetchUsersChats, refreshChatById } = useAppContext();
    const { getToken } = useAuth();

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (e.ctrlKey || e.metaKey) {
                // Ctrl+Enter or Cmd+Enter to send
                e.preventDefault();
                sendPrompt(e);
            } else if (!e.shiftKey) {
                // Enter without Shift to send (but allow Shift+Enter for new line)
                e.preventDefault();
                sendPrompt(e);
            }
        }
    };

    const sendPrompt = async (e) => {
        const promptCopy = prompt;
        const timeoutIds = []; // Store timeout IDs for cleanup

        try {
            e.preventDefault();
            
            // Validation checks
            if (!user) {
                toast.error("Please login to send a message");
                return;
            }
            
            if (!selectedChat) {
                toast.error("No chat selected");
                return;
            }
            
            if (isLoading) {
                toast.error("Please wait for the previous response to complete");
                return;
            }
            
            if (!prompt.trim()) {
                toast.error("Message cannot be empty");
                return;
            }

            setIsLoading(true);
            setPrompt("");

            // Create user message
            const userPrompt = {
                role: "user",
                content: prompt,
                timestamp: Date.now(),
            };

            // Update chats and selected chat
            const updatedChats = chats.map(chat => 
                chat._id === selectedChat._id 
                    ? { ...chat, messages: [...chat.messages, userPrompt] } 
                    : chat
            );
            
            setChats(updatedChats);
            setSelectedChat(prev => ({
                ...prev,
                messages: [...prev.messages, userPrompt],
            }));

            // Send to API
            const token = await getToken();
            
            if (!token) {
                throw new Error("Authentication token not available. Please try logging out and logging back in.");
            }
            
            let data;
            try {
                const response = await axios.post('/api/chat/ai', {
                    chatId: selectedChat._id,
                    prompt
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                data = response.data;
            } catch (axiosError) {
                console.error("Axios Error:", axiosError);
                
                // If it's a network error or server error, throw a more specific message
                if (axiosError.response?.data) {
                    data = axiosError.response.data;
                } else {
                    throw new Error(axiosError.message || "Network error occurred");
                }
            }

            if (!data?.success) {
                throw new Error(data?.message || data?.error || "Failed to process your message");
            }

            const message = data.data?.content || "";
            const messageTokens = message.split(" ");

            // Initialize assistant message
            const initialAssistantMessage = {
                role: "assistant",
                content: "",
                timestamp: Date.now(),
            };

            // Add empty assistant message
            setSelectedChat(prev => ({
                ...prev,
                messages: [...prev.messages, initialAssistantMessage],
            }));

            // Stream tokens with animation
            for (let i = 0; i < messageTokens.length; i++) {
                const timeoutId = setTimeout(() => {
                    const currentContent = messageTokens.slice(0, i + 1).join(" ");
                    setSelectedChat(prev => {
                        const updatedMessages = [
                            ...prev.messages.slice(0, -1),
                            { ...initialAssistantMessage, content: currentContent },
                        ];
                        return {
                            ...prev,
                            messages: updatedMessages,
                        };
                    });
                }, i * 100);
                timeoutIds.push(timeoutId);
            }

            // Final update after streaming completes
            const finalTimeoutId = setTimeout(async () => {
                setChats(prevChats => 
                    prevChats.map(chat => 
                        chat._id === selectedChat._id 
                            ? { ...chat, messages: [...chat.messages, { ...initialAssistantMessage, content: message }] } 
                            : chat
                    )
                );
                
                // Refresh the specific chat from database to ensure persistence
                try {
                    await refreshChatById(selectedChat._id);
                    console.log("Chat refreshed successfully after message");
                } catch (error) {
                    console.error("Error refreshing chat:", error);
                    // Fallback to full refresh if needed
                    await fetchUsersChats();
                }
            }, messageTokens.length * 100);
            timeoutIds.push(finalTimeoutId);

        } catch (error) {
            console.error("Error sending message:", error);
            toast.error(error.message || "An error occurred while sending your message");
            setPrompt(promptCopy);
        } finally {
            setIsLoading(false);
        }

        // Cleanup function
        return () => timeoutIds.forEach(clearTimeout);
    };

    // Cleanup timeouts when component unmounts
    useEffect(() => {
        return () => {
            // Clear any pending timeouts when component unmounts
            const allTimeouts = setTimeout(() => {}, 0);
            clearTimeout(allTimeouts);
        };
    }, []);

    return (
        <div className="w-full max-w-4xl">
            <form onSubmit={sendPrompt}
                className="relative bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl transition-all duration-300 hover:bg-white/10 hover:border-white/20 group">

                <div className="flex items-start gap-3">
                    <textarea 
                        onKeyDown={handleKeyDown}
                        className='flex-1 outline-none resize-none overflow-hidden break-words bg-transparent text-white placeholder-gray-400 text-base leading-relaxed min-h-[24px] max-h-32'
                        rows={1}
                        placeholder='Ask DeepSeek anything...' 
                        required
                        onChange={(e) => {
                            setPrompt(e.target.value);
                            // Auto-resize textarea
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                        }} 
                        value={prompt}
                        disabled={isLoading}
                        style={{ height: 'auto' }}
                    />
                    
                    <button 
                        type="submit" 
                        disabled={isLoading || !prompt.trim()}
                        className={`flex-shrink-0 transition-all duration-200 rounded-xl p-3 ${
                            prompt.trim() && !isLoading
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25 hover:scale-105" 
                                : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Image 
                                className='w-5 h-5' 
                                src={prompt.trim() ? assets.arrow_icon : assets.arrow_icon_dull} 
                                alt='Send message' 
                            />
                        )}
                    </button>
                </div>

                <div className='flex items-center justify-between mt-4 pt-3 border-t border-white/10'>
                    <div className='flex items-center gap-2'>
                        <button 
                            type="button"
                            className='flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 border border-white/20 px-3 py-2 rounded-full cursor-pointer transition-all duration-200 group/btn'
                        >
                            <Image src={assets.deepthink_icon} alt='DeepThink' width={16} height={16} className='opacity-70 group-hover/btn:opacity-100 transition-opacity'/>
                            <span className="text-gray-300 group-hover/btn:text-white transition-colors">DeepThink</span>
                        </button>
                        <button 
                            type="button"
                            className='flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 border border-white/20 px-3 py-2 rounded-full cursor-pointer transition-all duration-200 group/btn'
                        >
                            <Image src={assets.search_icon} alt='Search' width={16} height={16} className='opacity-70 group-hover/btn:opacity-100 transition-opacity'/>
                            <span className="text-gray-300 group-hover/btn:text-white transition-colors">Search</span>
                        </button>
                    </div>
                    
                    <div className='flex items-center gap-3 text-xs text-gray-400'>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>Online</span>
                        </div>
                        <span>•</span>
                        <span>Ctrl + Enter to send</span>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default ChatBox;