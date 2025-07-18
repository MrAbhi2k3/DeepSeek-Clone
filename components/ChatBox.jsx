import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ChatBox = ({ setIsLoading, isLoading }) => {
    const [prompt, setPrompt] = useState('');
    const { user, chats, selectedChat, setSelectedChat, setChats } = useAppContext();

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendPrompt(e);
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
            const { data } = await axios.post('/api/chat/ai', {
                chatId: selectedChat._id,
                prompt
            });

            if (!data?.success) {
                throw new Error(data?.message || "Failed to process your message");
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
            const finalTimeoutId = setTimeout(() => {
                setChats(prevChats => 
                    prevChats.map(chat => 
                        chat._id === selectedChat._id 
                            ? { ...chat, messages: [...chat.messages, { ...initialAssistantMessage, content: message }] } 
                            : chat
                    )
                );
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
        <form onSubmit={sendPrompt}
            className={`w-full ${selectedChat?.messages?.length > 0 ? "max-w-3xl" : "max-w-2xl"}
            bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}>

            <textarea 
                onKeyDown={handleKeyDown}
                className='outline-none w-full resize-none overflow-hidden break-words bg-transparent'
                rows={2}
                placeholder='Message DeepSeek' 
                required
                onChange={(e) => setPrompt(e.target.value)} 
                value={prompt}
                disabled={isLoading}
            />

            <div className='flex items-center justify-between text-sm'>
                <div className='flex items-center gap-2'>
                    <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition'>
                        <Image src={assets.deepthink_icon} alt='send icon' width={20} height={20} className='h-5'/>
                        Deepthink (R1)
                    </p>
                    <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition'>
                        <Image src={assets.search_icon} alt='send icon' width={20} height={20} className='h-5'/>
                        Search 
                    </p>
                </div>
                
                <div className='flex items-center gap-2'>
                    <Image className='w-4 cursor-pointer' src={assets.pin_icon} alt='search icon' />
                    <button 
                        type="submit" 
                        disabled={isLoading || !prompt.trim()}
                        className={`${prompt.trim() ? "bg-primary" : "bg-[#71717a]"} rounded-full p-2 cursor-pointer disabled:opacity-50`}
                    >
                        <Image 
                            className='w-3.5 aspect-square' 
                            src={prompt.trim() ? assets.arrow_icon : assets.arrow_icon_dull} 
                            alt='search icon' 
                        />
                    </button>
                </div>
            </div>
        </form>
    )
}

export default ChatBox;