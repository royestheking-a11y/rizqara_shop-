import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/app/context/StoreContext';
import { Send, Image as ImageIcon, MessageSquare, Package, LifeBuoy, X, CheckCheck, Check } from 'lucide-react';
import { toast } from 'sonner';

export const Messages = () => {
  const { user, messages, sendMessage, markMessagesAsRead, t, uploadFile } = useStore();
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasMarkedRead = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combine all messages relevant to the user (sent or received)
  const allMessages = messages.filter(m =>
    m.senderId === user?.id || m.receiverId === user?.id
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Mark all unread messages as read on mount
  useEffect(() => {
    if (user && !hasMarkedRead.current) {
      markMessagesAsRead('admin_1');
      hasMarkedRead.current = true;
    }
  }, [user, allMessages.length]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [allMessages.length]);

  const handleSend = async () => {
    if (!inputText.trim() && !selectedImage) return;

    let imageUrl = selectedImage;

    if (selectedFile) {
      const toastId = toast.loading('Uploading image...');
      try {
        imageUrl = await uploadFile(selectedFile, 'chats');
        toast.dismiss(toastId);
      } catch (err) {
        toast.dismiss(toastId);
        return; // Stop if upload fails
      }
    }

    const messageText = selectedFile ? 'Image Sent' : (imageUrl ? (inputText || 'Image') : inputText);

    sendMessage(messageText, imageUrl || undefined, undefined, undefined, 'support');

    setInputText('');
    setSelectedImage(null);
    setSelectedFile(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 h-[calc(100vh-12rem)] md:h-[600px] flex flex-col shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center shadow-sm z-10 bg-white">
        <div className="flex items-center gap-2">
          <LifeBuoy size={20} className="text-[#D91976]" />
          <span className="font-bold text-gray-800">{t('মেসেজ', 'Messages')}</span>
        </div>
        <span className="text-xs text-pink-600 bg-pink-50 px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
          {t('অনলাইন', 'Online')}
        </span>
      </div>

      {/* Messages List */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F0F2F5]"
      >
        {allMessages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <MessageSquare size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">{t('এখনো কোনো বার্তা নেই', 'No messages yet')}</p>
            <p className="text-sm mt-1">{t('আমাদের সাথে কথা বলুন!', 'Start talking to us!')}</p>
          </div>
        )}

        {allMessages.map(msg => {
          const isMe = msg.senderId === user?.id;
          const isImage = msg.image || msg.text?.startsWith('data:image');

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}>
              <div className={`max-w-[75%] md:max-w-[65%] ${isMe ? 'order-2' : 'order-1'}`}>
                <div className={`rounded-2xl p-3 shadow-sm ${isMe
                  ? 'bg-[#D91976] text-white rounded-tr-none'
                  : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none'
                  }`}>
                  {isImage ? (
                    <div className="mb-2">
                      <img
                        src={msg.image || msg.text}
                        alt="Attachment"
                        className="rounded-lg max-w-full h-auto max-h-64 object-cover"
                      />
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                  )}

                  {msg.orderId && (
                    <div className={`mt-2 pt-2 border-t ${isMe ? 'border-pink-700/30' : 'border-gray-200'} flex items-center gap-1 text-xs ${isMe ? 'text-pink-100' : 'text-gray-500'}`}>
                      <Package size={12} />
                      <span>{t('অর্ডার', 'Order')} #{msg.orderId.slice(0, 8)}</span>
                    </div>
                  )}

                  <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-pink-100' : 'text-gray-400'}`}>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && (
                      msg.read ? <CheckCheck size={14} className="text-blue-300" /> : <Check size={14} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <img src={selectedImage} alt="Preview" className="h-20 rounded-lg border-2 border-[#D91976]" />
            <button
              onClick={() => {
                setSelectedImage(null);
                setSelectedFile(null);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-[#D91976] focus-within:ring-2 focus-within:ring-[#D91976]/20 transition">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-gray-500 hover:text-[#D91976] transition rounded-lg hover:bg-pink-50"
                title={t('ছবি আপলোড করুন', 'Upload image')}
              >
                <ImageIcon size={20} />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={t('একটি বার্তা লিখুন...', 'Type a message...')}
                className="flex-1 bg-transparent py-1 text-sm focus:outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={!inputText.trim() && !selectedImage}
            className="p-3 bg-[#D91976] text-white rounded-full hover:bg-pink-800 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md disabled:shadow-none"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
