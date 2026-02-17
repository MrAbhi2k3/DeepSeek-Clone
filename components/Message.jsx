import { assets } from '@/assets/assets'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import Prism from 'prismjs'
import toast from 'react-hot-toast'
import { useAppContext } from '@/context/AppContext'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'

const Message = ({role, content, messageIndex, chatId}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);
    const { selectedChat, setSelectedChat, chats, setChats } = useAppContext();
    const { getToken } = useAuth();

    // This function is used to highlight code blocks in the markdown content
    useEffect(() => {
        Prism.highlightAll();
    }, [content]);

    const copyMessage = () => {
        navigator.clipboard.writeText(content);
        toast.success("Message copied to clipboard");
    }

    const editMessage = () => {
        setIsEditing(true);
        setEditedContent(content);
    }

    const saveEdit = async () => {
        if (!editedContent.trim()) {
            toast.error("Message cannot be empty");
            return;
        }

        try {
            const token = await getToken();
            
            const response = await axios.post('/api/chat/edit', {
                chatId: chatId,
                messageIndex: messageIndex,
                newContent: editedContent.trim()
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                // Update local state
                const updatedMessages = [...selectedChat.messages];
                updatedMessages[messageIndex].content = editedContent.trim();
                
                setSelectedChat({
                    ...selectedChat,
                    messages: updatedMessages
                });

                // Update chats array
                const updatedChats = chats.map(chat => 
                    chat._id === chatId 
                        ? { ...chat, messages: updatedMessages }
                        : chat
                );
                setChats(updatedChats);

                setIsEditing(false);
                toast.success("Message updated successfully");
            } else {
                toast.error(response.data.message || "Failed to update message");
            }
        } catch (error) {
            console.error("Edit error:", error);
            toast.error("Failed to update message");
        }
    }

    const cancelEdit = () => {
        setIsEditing(false);
        setEditedContent(content);
    }

    const deleteMessage = async () => {
        if (!confirm("Are you sure you want to delete this message?")) {
            return;
        }

        try {
            const token = await getToken();
            
            const response = await axios.post('/api/chat/delete-message', {
                chatId: chatId,
                messageIndex: messageIndex
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                // Update local state
                const updatedMessages = selectedChat.messages.filter((_, index) => index !== messageIndex);
                
                setSelectedChat({
                    ...selectedChat,
                    messages: updatedMessages
                });

                // Update chats array
                const updatedChats = chats.map(chat => 
                    chat._id === chatId 
                        ? { ...chat, messages: updatedMessages }
                        : chat
                );
                setChats(updatedChats);

                toast.success("Message deleted successfully");
            } else {
                toast.error(response.data.message || "Failed to delete message");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete message");
        }
    }

    const regenerateResponse = async () => {
        if (role !== 'assistant' || messageIndex === 0) return;

        try {
            const token = await getToken();
            const userMessage = selectedChat.messages[messageIndex - 1];
            
            if (!userMessage || userMessage.role !== 'user') {
                toast.error("Cannot regenerate without user message");
                return;
            }

            const response = await axios.post('/api/chat/ai', {
                chatId: chatId,
                prompt: userMessage.content
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                // Update the current message with new response
                const updatedMessages = [...selectedChat.messages];
                updatedMessages[messageIndex] = {
                    ...updatedMessages[messageIndex],
                    content: response.data.data.content,
                    timestamp: Date.now()
                };
                
                setSelectedChat({
                    ...selectedChat,
                    messages: updatedMessages
                });

                // Update chats array
                const updatedChats = chats.map(chat => 
                    chat._id === chatId 
                        ? { ...chat, messages: updatedMessages }
                        : chat
                );
                setChats(updatedChats);

                toast.success("Response regenerated successfully");
            } else {
                toast.error(response.data.message || "Failed to regenerate response");
            }
        } catch (error) {
            console.error("Regenerate error:", error);
            toast.error("Failed to regenerate response");
        }
    }

  return (
    <div className='w-full animate-fade-in'>
      <div className={`flex flex-col w-full mb-6 ${role === 'user' ? 'items-end' : 'items-start'}`}>
        <div className={`group relative flex max-w-4xl w-full ${
          role === 'user' ? 'justify-end' : 'justify-start'
        }`}>
          
          {/* Message Content */}
          <div className={`relative flex ${
            role === 'user' 
              ? 'bg-blue-600/90 backdrop-blur-sm text-white px-6 py-4 rounded-2xl rounded-br-md max-w-2xl' 
              : 'gap-4 w-full'
          }`}>
            
            {/* Action Buttons */}
            <div className={`opacity-0 group-hover:opacity-100 absolute transition-all duration-200 z-10 ${
              role === 'user' 
                ? '-left-20 top-3' 
                : '-left-12 -bottom-8'
            }`}>
              <div className='flex items-center gap-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10'>
                {role === 'user' ? (
                  <>
                    <button 
                      onClick={copyMessage}
                      className='p-1 hover:bg-white/20 rounded transition-colors'
                      title="Copy message"
                    >
                      <Image src={assets.copy_icon} alt='Copy' className='w-4 h-4 opacity-70 hover:opacity-100'/>
                    </button>
                    <button 
                      onClick={editMessage}
                      className='p-1 hover:bg-white/20 rounded transition-colors'
                      title="Edit message"
                    >
                      <Image src={assets.pencil_icon} alt='Edit' className='w-4 h-4 opacity-70 hover:opacity-100'/>
                    </button>
                    <button 
                      onClick={deleteMessage}
                      className='p-1 hover:bg-red-500/20 rounded transition-colors'
                      title="Delete message"
                    >
                      <Image src={assets.delete_icon} alt='Delete' className='w-4 h-4 opacity-70 hover:opacity-100'/>
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={copyMessage}
                      className='p-1 hover:bg-white/20 rounded transition-colors'
                      title="Copy response"
                    >
                      <Image src={assets.copy_icon} alt='Copy' className='w-4 h-4 opacity-70 hover:opacity-100'/>
                    </button>
                    <button 
                      onClick={regenerateResponse}
                      className='p-1 hover:bg-white/20 rounded transition-colors'
                      title="Regenerate response"
                    >
                      <Image src={assets.regenerate_icon} alt='Regenerate' className='w-4 h-4 opacity-70 hover:opacity-100'/>
                    </button>
                    <button 
                      onClick={deleteMessage}
                      className='p-1 hover:bg-red-500/20 rounded transition-colors'
                      title="Delete message"
                    >
                      <Image src={assets.delete_icon} alt='Delete' className='w-4 h-4 opacity-70 hover:opacity-100'/>
                    </button>
                  </>
                )}
              </div>
            </div>

            {role === 'user' ? (
              <div className='text-white leading-relaxed whitespace-pre-wrap break-words'>
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full bg-black/20 border border-white/20 rounded-lg p-3 text-white resize-none focus:outline-none focus:border-blue-400"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  content
                )}
              </div>
            ) : (
              <>
                {/* AI Avatar */}
                <div className='flex-shrink-0 mt-1'>
                  <div className='relative'>
                    <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-md animate-pulse"></div>
                    <Image 
                      src={assets.logo_icon} 
                      alt='DeepSeek' 
                      className='h-10 w-10 p-2 border border-white/20 rounded-full relative z-10 bg-white/5 backdrop-blur-sm'
                    />
                  </div>
                </div>
                
                {/* AI Response */}
                <div className='flex-1 min-w-0'>
                  <div className='bg-white/5 border border-white/10 rounded-2xl rounded-tl-md p-6 backdrop-blur-sm'>
                    <div className='message-content text-gray-100 leading-relaxed'>
                      <Markdown 
                        components={{
                          code: ({node, inline, className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-x-auto my-4">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code className="bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                                {children}
                              </code>
                            );
                          },
                          p: ({children}) => <p className="mb-4 last:mb-0">{children}</p>,
                          ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                          li: ({children}) => <li className="leading-relaxed">{children}</li>,
                          h1: ({children}) => <h1 className="text-xl font-bold mb-3 mt-6 first:mt-0 text-white">{children}</h1>,
                          h2: ({children}) => <h2 className="text-lg font-bold mb-3 mt-6 first:mt-0 text-white">{children}</h2>,
                          h3: ({children}) => <h3 className="text-base font-bold mb-3 mt-6 first:mt-0 text-white">{children}</h3>,
                          blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-300">{children}</blockquote>,
                        }}
                      >
                        {content}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Message
