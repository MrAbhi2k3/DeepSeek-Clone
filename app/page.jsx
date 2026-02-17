"use client";

import { assets } from "@/assets/assets";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import SideBar from "@/components/SideBar"
import ChatBox from "@/components/ChatBox";
import Message from "@/components/Message";
import { useAppContext } from "@/context/AppContext";

export default function Home() {

  const [expand, setExpand] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedChat } = useAppContext();
  const containerRef = useRef(null);

  useEffect(() => {
    if(containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [selectedChat?.messages]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0b] via-[#1a1a1c] to-[#0f0f10]">
      <div className="flex h-screen">
        {/* Sidebar */}
        <SideBar expand={expand} setExpand={setExpand}/>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 text-white relative overflow-hidden">
          
          {/* Mobile Header */}
          <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full z-10">
            <button 
              onClick={() => setExpand(!expand)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Image className="rotate-180 w-5 h-5" src={assets.menu_icon} alt="Menu"/>
            </button>
            <div className="flex items-center gap-2">
              <Image className="opacity-70 w-5 h-5" src={assets.chat_icon} alt="Chat"/>
              <span className="text-sm font-medium">DeepSeek</span>
            </div>
          </div>

          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>

          {/* Chat Content */}
          {!selectedChat || selectedChat?.messages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 space-y-8 relative z-10">
              {/* Welcome Section */}
              <div className="text-center space-y-6 animate-fade-in">
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-pulse"></div>
                    <Image src={assets.logo_icon} alt="DeepSeek" className="h-20 w-20 relative z-10"/>
                  </div>
                </div>
                <div className="space-y-3">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                    Hi, I'm DeepSeek
                  </h1>
                  <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                    Your advanced AI assistant powered by cutting-edge reasoning capabilities. 
                    Ask me anything, and I'll provide thoughtful, detailed responses.
                  </p>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl px-4">
                {[
                  {
                    icon: "🧠",
                    title: "Advanced Reasoning",
                    description: "Deep thinking and analysis for complex problems"
                  },
                  {
                    icon: "⚡",
                    title: "Fast Responses",
                    description: "Quick and efficient AI-powered conversations"
                  },
                  {
                    icon: "🔒",
                    title: "Secure & Private",
                    description: "Your conversations are protected and confidential"
                  }
                ].map((feature, index) => (
                  <div key={index} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{feature.icon}</div>
                    <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div ref={containerRef}
              className="relative flex flex-col items-center justify-start w-full mt-20 md:mt-8 flex-1 overflow-y-auto scroll-smooth"
            >
              {/* Chat Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-b from-[#0a0a0b] to-transparent backdrop-blur-sm py-4 w-full flex justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-200">
                    {selectedChat.name}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="w-full max-w-4xl px-4 space-y-6 pb-8">
                {selectedChat.messages.map((message, index) => (
                  <Message 
                    key={index} 
                    role={message.role} 
                    content={message.content} 
                    messageIndex={index}
                    chatId={selectedChat._id}
                  />
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex gap-4 w-full py-6 animate-fade-in">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-md animate-pulse"></div>
                        <Image className="h-10 w-10 p-2 border border-white/20 rounded-full relative z-10"
                          src={assets.logo_icon} alt="DeepSeek"/>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center gap-1 px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
                        </div>
                        <span className="text-sm text-gray-400 ml-2">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="w-full max-w-4xl px-4 relative z-10">
            <ChatBox 
              isLoading={isLoading} 
              setIsLoading={setIsLoading}
              messages={selectedChat?.messages || []}
            />
            <p className="text-xs text-center mt-3 text-gray-500">
              AI-generated content for reference only • Made by 
              <span className="text-blue-400 font-medium"> @MrAbhi2k3</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

