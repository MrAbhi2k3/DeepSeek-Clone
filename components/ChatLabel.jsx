import { assets } from '@/assets/assets'
import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'

const ChatLabel = ({openMenu, setOpenMenu, id , name}) => {

  const {fetchUsersChats, chats, setSelectedChat} = useAppContext();
  const { getToken } = useAuth();
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu({id: '0', open: false});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setOpenMenu]);

  const selectedChat = () => {
    const chatData = chats.find(chat => chat._id === id);
    setSelectedChat(chatData);
    console.log(chatData);
  }

  const renameHandler = async() => {
    try {
      const newName = prompt("Enter new chat name", name);
      if (!newName || newName.trim() === '') return;
      
      const token = await getToken();
      const {data} = await axios.post('/api/chat/rename', {
        chatId: id,
        name: newName.trim(),
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (data.success) {
        // Update the chat name in the UI
        fetchUsersChats();
        setOpenMenu({id: '0', open: false});
        toast.success(data.message || "Chat renamed successfully");
      }
      else {
        toast.error(data.message || "Failed to rename chat");
      }
    } catch (error) {
      console.error("Rename error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to rename chat");
    }
  }


  const deleteHandler = async () => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this chat?");
      if (!confirmDelete) return;
      
      const token = await getToken();
      const {data} = await axios.post('/api/chat/delete', {
        chatId: id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (data.success) {
        fetchUsersChats();
        setSelectedChat(null); // Clear selected chat if it was deleted
        setOpenMenu({id: '0', open: false});
        toast.success(data.message || "Chat deleted successfully");
      }
      else {
        toast.error(data.message || "Failed to delete chat");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to delete chat");
    }
  }

  return (
    <div 
      onClick={selectedChat} 
      className='group flex items-center justify-between p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl text-sm cursor-pointer transition-all duration-200 border border-transparent hover:border-white/10'
    >
      <div className='flex items-center gap-3 flex-1 min-w-0'>
        <div className='w-2 h-2 bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'></div>
        <p className='truncate font-medium'>{name}</p>
      </div>
      
      <div 
        ref={menuRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenu({id, open: !openMenu.open});
        }}
        className='relative flex items-center justify-center h-8 w-8 hover:bg-white/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100'
      >
        <Image 
          src={assets.three_dots} 
          alt='Menu' 
          className='w-4 h-4' 
        />

        {/* Dropdown Menu */}
        {openMenu.id === id && openMenu.open && (
          <div className='absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded-lg w-36 py-1 shadow-xl z-50'>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                renameHandler();
              }}
              className='flex items-center gap-3 hover:bg-gray-700 px-3 py-2 transition-colors cursor-pointer'
            >
              <Image src={assets.pencil_icon} alt='Rename' className='w-4 h-4'/>
              <span className='text-sm text-white'>Rename</span>
            </div>
            
            <div 
              onClick={(e) => {
                e.stopPropagation();
                deleteHandler();
              }}
              className='flex items-center gap-3 hover:bg-red-600/20 px-3 py-2 transition-colors cursor-pointer text-red-400 hover:text-red-300'
            >
              <Image src={assets.delete_icon} alt='Delete' className='w-4 h-4'/>
              <span className='text-sm'>Delete</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatLabel
