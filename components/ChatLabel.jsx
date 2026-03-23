import { assets } from '@/assets/assets'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useAppContext } from '@/context/AppContext'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'
import { FaShare } from 'react-icons/fa6'
import ShareModal from './ShareModal'
import ChatActionModal from './ChatActionModal'

const ChatLabel = ({openMenu, setOpenMenu, id , name}) => {

  const {fetchUsersChats, chats, setSelectedChat} = useAppContext();
  const { getToken } = useAuth();
  const menuRef = useRef(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [renameValue, setRenameValue] = useState(name || '');
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const selectChat = () => {
    const chatData = chats.find(chat => chat._id === id);
    setSelectedChat(chatData);
  }

  const renameHandler = async(newName) => {
    try {
      if (!newName || newName.trim() === '') return;

      setIsRenaming(true);
      
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
        await fetchUsersChats();
        setShowRenameModal(false);
        setOpenMenu({id: '0', open: false});
        toast.success(data.message || "Chat renamed successfully");
      }
      else {
        toast.error(data.message || "Failed to rename chat");
      }
    } catch (error) {
      console.error("Rename error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to rename chat");
    } finally {
      setIsRenaming(false);
    }
  }


  const deleteHandler = async () => {
    try {
      setIsDeleting(true);
      
      const token = await getToken();
      const {data} = await axios.post('/api/chat/delete', {
        chatId: id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (data.success) {
        setSelectedChat((prev) => (prev?._id === id ? null : prev));
        await fetchUsersChats();
        setShowDeleteModal(false);
        setOpenMenu({id: '0', open: false});
        toast.success(data.message || "Chat deleted successfully");
      }
      else {
        toast.error(data.message || "Failed to delete chat");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to delete chat");
    } finally {
      setIsDeleting(false);
    }
  }

  const shareHandler = () => {
    setShowShareModal(true);
    setOpenMenu({id: '0', open: false});
  }

  return (
    <div 
      onClick={selectChat} 
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
                shareHandler();
              }}
              className='flex items-center gap-3 hover:bg-blue-600/20 px-3 py-2 transition-colors cursor-pointer text-blue-400 hover:text-blue-300'
            >
              <FaShare className='h-4 w-4' />
              <span className='text-sm'>Share</span>
            </div>

            <div 
              onClick={(e) => {
                e.stopPropagation();
                setRenameValue(name || '');
                setShowRenameModal(true);
                setOpenMenu({id: '0', open: false});
              }}
              className='flex items-center gap-3 hover:bg-gray-700 px-3 py-2 transition-colors cursor-pointer'
            >
              <Image src={assets.pencil_icon} alt='Rename' className='w-4 h-4'/>
              <span className='text-sm text-white'>Rename</span>
            </div>
            
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
                setOpenMenu({id: '0', open: false});
              }}
              className='flex items-center gap-3 hover:bg-red-600/20 px-3 py-2 transition-colors cursor-pointer text-red-400 hover:text-red-300'
            >
              <Image src={assets.delete_icon} alt='Delete' className='w-4 h-4'/>
              <span className='text-sm'>Delete</span>
            </div>
          </div>
        )}
      </div>

      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        chatId={id}
        chatName={name}
      />

      <ChatActionModal
        isOpen={showRenameModal}
        mode='rename'
        title='Rename Chat'
        message='Enter a new name for this chat.'
        confirmText='Rename'
        value={renameValue}
        onChange={setRenameValue}
        onConfirm={renameHandler}
        onClose={() => setShowRenameModal(false)}
        isLoading={isRenaming}
      />

      <ChatActionModal
        isOpen={showDeleteModal}
        mode='delete'
        title='Delete Chat'
        message='This action cannot be undone. Do you want to permanently delete this chat?'
        confirmText='Delete'
        value=''
        onChange={() => {}}
        onConfirm={deleteHandler}
        onClose={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
      />
    </div>
  )
}

export default ChatLabel
