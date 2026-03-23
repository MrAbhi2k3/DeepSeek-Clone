import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@clerk/nextjs';
import Image from 'next/image'
import React, { useState } from 'react'
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ChatBox = () => {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { user, isLoaded, selectedChat, setSelectedChat, chats, setChats, fetchUsersChats, refreshChatById } = useAppContext();
    const { getToken } = useAuth();

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                sendPrompt(e);
            } else if (!e.shiftKey) {
                e.preventDefault();
                sendPrompt(e);
            }
        }
    };

    const appendMessageToActiveChat = (chatId, message) => {
        setSelectedChat(prev => {
            if (!prev || prev._id !== chatId) {
                return prev;
            }

            return {
                ...prev,
                messages: [...(prev.messages || []), message],
            };
        });
    };

    const sendPrompt = async (e) => {
        const promptCopy = prompt;

        try {
            e?.preventDefault?.();

            if (!isLoaded || !user) {
                toast.error("Please wait for login to complete or login to send a message");
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

            const activeChatId = selectedChat._id;
            const promptText = prompt.trim();
            const userPrompt = {
                role: "user",
                content: promptText,
                timestamp: Date.now(),
            };

            const updatedChats = chats.map(chat =>
                chat._id === activeChatId
                    ? { ...chat, messages: [...chat.messages, userPrompt] } 
                    : chat
            );

            setChats(updatedChats);
            appendMessageToActiveChat(activeChatId, userPrompt);

            const token = await getToken();

            if (!token) {
                throw new Error("Authentication token not available. Please try logging out and logging back in.");
            }

            // https://github.com/MrAbhi2k3
            const { data } = await axios.post('/api/chat/ai', {
                chatId: activeChatId,
                prompt: promptText
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!data?.success) {
                throw new Error(data?.message || data?.error || "Failed to process your message");
            }

            const message = data.data?.content || "";
            const messageTokens = message.split(/\s+/).filter(Boolean);

            const initialAssistantMessage = {
                role: "assistant",
                content: "",
                timestamp: Date.now(),
            };

            appendMessageToActiveChat(activeChatId, initialAssistantMessage);

            for (let i = 0; i < messageTokens.length; i++) {
                const currentContent = messageTokens.slice(0, i + 1).join(" ");
                setSelectedChat(prev => {
                    if (!prev || prev._id !== activeChatId || !prev.messages?.length) {
                        return prev;
                    }

                    const updatedMessages = [
                        ...prev.messages.slice(0, -1),
                        { ...initialAssistantMessage, content: currentContent },
                    ];

                    return {
                        ...prev,
                        messages: updatedMessages,
                    };
                });

                await new Promise(resolve => setTimeout(resolve, 35));
            }

            const finalAssistantMessage = {
                ...initialAssistantMessage,
                content: message,
            };

            setSelectedChat(prev => {
                if (!prev || prev._id !== activeChatId || !prev.messages?.length) {
                    return prev;
                }

                const updatedMessages = [
                    ...prev.messages.slice(0, -1),
                    finalAssistantMessage,
                ];

                return {
                    ...prev,
                    messages: updatedMessages,
                };
            });

            setChats(prevChats =>
                prevChats.map(chat => {
                    if (chat._id !== activeChatId) {
                        return chat;
                    }

                    const existingMessages = chat.messages || [];
                    return {
                        ...chat,
                        messages: [...existingMessages, finalAssistantMessage],
                    };
                })
            );

            try {
                await refreshChatById(activeChatId);
            } catch {
                await fetchUsersChats();
            }

        } catch (error) {
            console.error("Error sending message:", error);
            toast.error(error.message || "An error occurred while sending your message");
            setPrompt(promptCopy);
        } finally {
            setIsLoading(false);
        }
    };

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
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                        }} 
                        value={prompt}
                        disabled={isLoading}
                        style={{ height: 'auto' }}
                    />
                    
                    <button 
                        type="submit" 
                        disabled={isLoading || !prompt.trim() || !isLoaded || !user}
                        className={`flex-shrink-0 transition-all duration-200 rounded-xl p-3 ${
                            prompt.trim() && !isLoading && isLoaded && user
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