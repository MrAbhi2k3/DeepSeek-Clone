import { assets } from '@/assets/assets'
import React, { useContext, useState } from 'react'
import Image from 'next/image'
import { useClerk, UserButton } from '@clerk/nextjs'
import { useAppContext } from '@/context/AppContext'
import ChatLabel from './ChatLabel'

const SideBar = ({expand, setExpand}) => {

  const { openSignIn } = useClerk();
  const { user, chats, createNewChat } = useAppContext();
  const [openMenu, setOpenMenu] = useState({id: 0, open: false})

  return (
    <div className={`flex flex-col justify-between bg-gradient-to-b from-[#0f0f10] to-[#1a1a1c] border-r border-white/10 backdrop-blur-md pt-6 transition-all duration-300 ease-out z-50 max-md:absolute max-md:h-screen max-md:shadow-2xl ${expand ? 'p-6 w-72' : 'md:w-20 w-0 max-md:overflow-hidden'}`}>
      <div className={`flex flex-col ${expand ? "gap-6" : "items-center gap-6"}`}>
        
        {/* Header */}
        <div className={`flex ${expand ? "flex-row justify-between items-center" : "flex-col items-center gap-6"}`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/30 rounded-lg blur-md animate-pulse"></div>
              <Image 
                className={`relative z-10 ${expand ? "w-8 h-8" : "w-10 h-10"}`} 
                src={assets.logo_icon} 
                alt='DeepSeek'
              />
            </div>
            {expand && (
              <div>
                <h1 className="text-white font-bold text-xl">DeepSeek</h1>
                <p className="text-xs text-gray-400">AI Assistant</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setExpand(!expand)}
            className='group relative flex items-center justify-center hover:bg-white/10 transition-all duration-300 h-10 w-10 rounded-xl cursor-pointer border border-white/10'
          >
            <Image src={assets.menu_icon} alt='' className='md:hidden w-5 h-5'/>
            <Image 
              src={expand ? assets.sidebar_close_icon : assets.sidebar_icon} 
              alt='' 
              className='hidden md:block w-5 h-5'
            />
            <div className={`absolute w-max ${expand ? "left-1/2 -translate-x-1/2 top-12" : "-top-12 left-0"} opacity-0 group-hover:opacity-100 transition bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none border border-white/20`}>
              {expand ? 'Close sidebar' : 'Open sidebar'}
              <div className={`w-2 h-2 absolute bg-black rotate-45 ${expand ? "left-1/2 -top-1 -translate-x-1/2" : "left-4 bottom-1"}`}></div>
            </div>
          </button>
        </div>

        {/* New Chat Button */}
        <button onClick={createNewChat}
          className={`group flex items-center justify-center cursor-pointer transition-all duration-200 ${
            expand
              ? "bg-gray-700 hover:bg-gray-600 rounded-xl gap-3 p-3 w-full border border-gray-600 hover:border-gray-500 hover:shadow-lg"
              : "relative h-12 w-12 mx-auto hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20"
          }`}
        >
          {expand ? (
            <>
              {/* Small circular + icon */}
              <div className="w-6 h-6 bg-gray-600 group-hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-white font-medium">New Chat</span>
            </>
          ) : (
            <>
              {/* Small circular + icon for collapsed */}
              <div className="w-8 h-8 bg-gray-700 group-hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors border border-gray-600">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="absolute w-max -top-12 -right-16 opacity-0 group-hover:opacity-100 transition bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none border border-white/20">
                New chat
                <div className="w-2 h-2 absolute bg-black rotate-45 left-4 -bottom-1"></div>
              </div>
            </>
          )}
        </button>


        {/* Chat History */}
        <div className={`flex-1 ${expand ? "block" : "hidden"}`}>
          <div className="text-gray-400 text-sm mb-4">
            <h3 className='font-medium text-white mb-3'>Recent Chats</h3>
            <div className="space-y-2">
              {chats.length > 0 ? (
                chats.map((chat, index) => (
                  <ChatLabel 
                    key={index}
                    id={chat._id} 
                    name={chat.name} 
                    openMenu={openMenu} 
                    setOpenMenu={setOpenMenu}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  {/* Chat history icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border border-gray-600">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-white mb-1">No chat history</p>
                  <p className="text-xs text-gray-500">Start a new conversation to begin</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className='space-y-3'>
        {/* Get App Button */}
        <div className={`group relative flex items-center cursor-pointer transition-all duration-200 ${
          expand 
            ? "gap-3 text-gray-300 hover:text-white text-sm p-3 border border-white/10 hover:border-white/20 rounded-xl hover:bg-white/5 w-full" 
            : "h-12 w-12 hover:bg-white/10 rounded-xl mx-auto border border-white/10 hover:border-white/20"
        }`}>
          <Image 
            className={`${expand ? "w-5 h-5" : "w-6 h-6 mx-auto"} transition-transform group-hover:scale-110`} 
            src={expand ? assets.phone_icon : assets.phone_icon_dull} 
            alt='Get App'
          />
          
          {/* QR Code Tooltip */}
          <div className={`absolute ${expand ? "-top-64 left-0" : "-top-64 -right-48"} pb-8 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50`}>
            <div className='relative w-max bg-black/90 backdrop-blur-sm border border-white/20 text-sm p-4 rounded-xl shadow-2xl'>
              <Image src={assets.qrcode} alt='QR Code' className='w-40 mb-3 rounded-lg' />
              <p className="text-center text-white">Scan to get DeepSeek App</p>
              <div className={`w-3 h-3 absolute bg-black rotate-45 ${expand ? "left-6 -bottom-1.5" : "left-6 -bottom-1.5"}`}></div>
            </div>
          </div>
          
          {expand && (
            <>
              <span className="flex-1">Get Mobile App</span>
              <Image alt='New' src={assets.new_icon} className="w-4 h-4"/>
            </>
          )}
        </div>

        {/* Profile Section */}
        <div onClick={user ? null : openSignIn}
          className={`group flex items-center cursor-pointer transition-all duration-200 ${
            expand 
              ? "gap-3 hover:bg-white/10 rounded-xl p-3 border border-white/10 hover:border-white/20" 
              : "justify-center h-12 w-12 hover:bg-white/10 rounded-xl mx-auto border border-white/10 hover:border-white/20"
          }`}>
          
          <div className="flex-shrink-0">
            {user ? (
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-full border-2 border-white/10 hover:border-white/20 transition-colors"
                  }
                }}
              />
            ) : (
              <Image src={assets.profile_icon} alt='Profile' className='w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity' />
            )}
          </div>
          
          {expand && (
            <div className="flex-1 min-w-0">
              <span className="text-gray-300 group-hover:text-white text-sm transition-colors">
                {user ? 'My Profile' : 'Sign In'}
              </span>
              {user && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {user.emailAddresses?.[0]?.emailAddress}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SideBar;