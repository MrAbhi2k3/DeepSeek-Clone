import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaCopy } from 'react-icons/fa';
import { FaShare } from 'react-icons/fa6';
import { FaFacebook, FaLinkedin, FaRedditAlien, FaTelegramPlane, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';

const ShareModal = ({ isOpen, onClose, chatId, chatName }) => {
  const [copiedField, setCopiedField] = useState('');

  if (!isOpen) return null;

  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/chat/${chatId}`;
  const encodedUrl = encodeURIComponent(shareLink);
  const encodedText = encodeURIComponent(`Check this chat: ${chatName || 'Shared Chat'}`);

  const socialLinks = [
    { name: 'WhatsApp', icon: FaWhatsapp, href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { name: 'Telegram', icon: FaTelegramPlane, href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
    { name: 'X', icon: FaXTwitter, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}` },
    { name: 'Facebook', icon: FaFacebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: 'LinkedIn', icon: FaLinkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { name: 'Reddit', icon: FaRedditAlien, href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}` },
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedField(text === chatId ? 'id' : 'url');
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedField(''), 1500);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 border border-gray-700 rounded-2xl w-[min(95vw,640px)] shadow-2xl p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <FaShare className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-bold">Share Chat</h2>
          </div>
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
            <label className="text-sm text-gray-400 block mb-2">Share URL</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-sm truncate break-all">
                {shareLink}
              </div>
              <button 
                onClick={() => copyToClipboard(shareLink)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0"
              >
                <FaCopy className="h-4 w-4" />
                {copiedField === 'url' ? 'Copied' : 'Copy'}
              </button>
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
                <FaCopy className="h-4 w-4" />
                {copiedField === 'id' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Share To Social Media</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {socialLinks.map(({ name, icon: Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
                >
                  <Icon className="h-4 w-4 text-blue-300" />
                  {name}
                </a>
              ))}
            </div>
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
