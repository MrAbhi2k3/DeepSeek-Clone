import React, { useState } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import toast from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, chatId, chatName }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/chat/${chatId}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Chat ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 border border-gray-700 rounded-2xl w-96 shadow-2xl p-6 space-y-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Share Chat</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Chat Name</label>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-white truncate">
              {chatName || 'New Chat'}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Chat ID</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-sm font-mono truncate">
                {chatId}
              </div>
              <button 
                onClick={() => copyToClipboard(chatId)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <Image src={assets.copy_icon} alt='Copy' className='w-4 h-4'/>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Share Link</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-sm truncate break-all">
                {shareLink}
              </div>
              <button 
                onClick={() => copyToClipboard(shareLink)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <Image src={assets.copy_icon} alt='Copy' className='w-4 h-4'/>
                Copy
              </button>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-400">
              💡 Share your chat ID or link with others to let them view this conversation.
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
