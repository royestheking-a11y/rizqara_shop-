import { useState, useRef, useEffect } from 'react';
import { useStore, Message } from '@/app/context/StoreContext';
import { Send, Search, MessageSquare, Package, LifeBuoy, FileText, CreditCard, CheckCircle, Truck, DollarSign, X, Info, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export const AdminMessages = () => {
  const { messages, sendMessage, orders, language, t, updateOrderStatus, verifyPayment, deleteThread, uploadFile, markMessagesAsRead } = useStore();
  const [selectedThread, setSelectedThread] = useState<{ userId: string, context: 'support' | string } | null>(null);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'order'>('all');
  const [search, setSearch] = useState('');

  const [showContextDrawer, setShowContextDrawer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Saved reply templates (Bangla & English)
  const savedReplies = [
    {
      id: 'payment_request',
      label_bn: 'পেমেন্ট তথ্য চাই',
      label_en: 'Request Payment Info',
      text_bn: 'আপনার পেমেন্ট যাচাই করার জন্য অনুগ্রহ করে bKash লেনদেন আইডি এবং স্ক্রিনশট পাঠান।',
      text_en: 'Please send your bKash transaction ID and screenshot for payment verification.'
    },
    {
      id: 'order_confirmed',
      label_bn: 'অর্ডার কনফার্ম হয়েছে',
      label_en: 'Order Confirmed',
      text_bn: 'আপনার অর্ডার কনফার্ম হয়েছে। শীঘ্রই ডেলিভারি বুক করা হবে।',
      text_en: 'Your order has been confirmed. We will book delivery soon.'
    },
    {
      id: 'delivery_eta',
      label_bn: 'ডেলিভারি সময়',
      label_en: 'Delivery ETA',
      text_bn: 'আপনার পণ্য ২-৩ কার্যদিবসের মধ্যে পৌঁছাবে।',
      text_en: 'Your product will arrive within 2-3 business days.'
    },
    {
      id: 'stock_check',
      label_bn: 'স্টক চেক করা হচ্ছে',
      label_en: 'Checking Stock',
      text_bn: 'আমরা স্টক চেক করছি। শীঘ্রই জানাবো।',
      text_en: 'We are checking stock availability. Will update you soon.'
    },
    {
      id: 'custom_order',
      label_bn: 'কাস্টম অর্ডার প্রয়োজনীয়তা',
      label_en: 'Custom Order Requirements',
      text_bn: 'আপনার কাস্টম অর্ডারের জন্য অনুগ্রহ করে ডিজাইন/টেক্সট পাঠান।',
      text_en: 'Please send your design/text requirements for the custom order.'
    },
    {
      id: 'return_policy',
      label_bn: 'রিটার্ন পলিসি',
      label_en: 'Return Policy',
      text_bn: 'পণ্য প্রাপ্তির ৭ দিনের মধ্যে রিটার্ন করতে পারবেন (শর্ত প্রযোজ্য)।',
      text_en: 'Returns accepted within 7 days of delivery (conditions apply).'
    },
    {
      id: 'thank_you',
      label_bn: 'ধন্যবাদ',
      label_en: 'Thank You',
      text_bn: 'RizQara Shop এ কেনাকাটার জন্য ধন্যবাদ! আরো কিছু জানার থাকলে জানান।',
      text_en: 'Thank you for shopping with RizQara Shop! Let us know if you need anything else.'
    }
  ];

  // Helper function to get user info from orders
  const getUserInfo = (userId: string) => {
    const userOrder = orders.find(o => o.userId === userId);
    return {
      name: userOrder?.userName || userId,
      phone: userOrder?.userPhone || ''
    };
  };

  // Group messages by User AND Context
  const threads = messages.reduce((acc: Record<string, { userId: string, context: string, messages: Message[], unreadCount: number, lastMessage: Message }>, msg) => {
    // Determine the thread owner (the user being talked to)
    let threadUserId = msg.senderId;

    // If Admin sent it, the thread owner is the receiver
    if (msg.senderId === 'admin' || msg.senderId === 'admin_1') {
      threadUserId = msg.receiverId;
    }

    // Skip if threadUserId is 'admin' (shouldn't happen unless admin talks to admin)
    if (threadUserId === 'admin' || threadUserId === 'admin_1') return acc;

    const userId = threadUserId;
    const context = msg.type === 'order' && msg.orderId ? msg.orderId : 'support';
    const key = `${userId}-${context}`;

    if (!acc[key]) {
      acc[key] = {
        userId,
        context,
        messages: [],
        unreadCount: 0,
        lastMessage: msg
      };
    }

    acc[key].messages.push(msg);
    // Only count unread if User sent it and it's not read
    if (!msg.read && msg.senderId !== 'admin' && msg.senderId !== 'admin_1') acc[key].unreadCount++;

    if (new Date(msg.timestamp) > new Date(acc[key].lastMessage.timestamp)) {
      acc[key].lastMessage = msg;
    }

    return acc;
  }, {} as Record<string, { userId: string, context: string, messages: Message[], unreadCount: number, lastMessage: Message }>);

  const allThreads = Object.values(threads).sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());

  const filteredThreads = allThreads.filter(t => {
    const userInfo = getUserInfo(t.userId);
    if (filter === 'unread' && t.unreadCount === 0) return false;
    if (filter === 'order' && t.context === 'support') return false;
    if (search && !userInfo.name.toLowerCase().includes(search.toLowerCase()) &&
      !userInfo.phone.includes(search) &&
      !t.context.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeMessages = selectedThread
    ? messages.filter(m => {
      // Check if message belongs to this user (either sent by them or sent to them)
      const isUserMatch = m.senderId === selectedThread.userId || m.receiverId === selectedThread.userId;
      if (!isUserMatch) return false;

      // Check context match using same logic as thread grouping
      const msgContext = m.type === 'order' && m.orderId ? m.orderId : 'support';
      return msgContext === selectedThread.context;
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];

  useEffect(() => {
    if (selectedThread && activeMessages.length > 0) {
      const hasUnread = activeMessages.some(m => !m.read && m.senderId === selectedThread.userId);
      if (hasUnread) {
        markMessagesAsRead(selectedThread.userId);
      }
    }
  }, [selectedThread, activeMessages, markMessagesAsRead]);

  const userOrders = selectedThread
    ? orders.filter(o => o.userId === selectedThread.userId)
    : [];

  const selectedUserInfo = selectedThread ? getUserInfo(selectedThread.userId) : null;

  const handleSend = () => {
    if (!inputText.trim() || !selectedThread) return;
    sendMessage(
      inputText,
      undefined,
      selectedThread.context === 'support' ? undefined : selectedThread.context,
      selectedThread.userId,
      selectedThread.context === 'support' ? 'support' : 'order'
    );
    setInputText('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedThread) {
      const toastId = toast.loading('Uploading image...');
      try {
        const url = await uploadFile(file, 'chats');
        sendMessage(
          'Image Sent', // Fallback text
          url,
          selectedThread.context === 'support' ? undefined : selectedThread.context,
          selectedThread.userId,
          selectedThread.context === 'support' ? 'support' : 'order'
        );
        toast.dismiss(toastId);
        toast.success('Image sent');
      } catch (err) {
        toast.dismiss(toastId);
        toast.error('Failed to send image');
      }
    }
  };

  const handleQuickReply = (template: typeof savedReplies[0]) => {
    const text = language === 'bn' ? template.text_bn : template.text_en;
    setInputText(text);
  };

  const handleQuickAction = (action: string) => {
    if (!selectedThread) return;

    const userOrder = userOrders.find(o => o.id === selectedThread.context);

    switch (action) {
      case 'send_invoice':
        if (userOrder) {
          const text = language === 'bn'
            ? `আপনার চালান ${userOrder.invoiceNo} রেডি। ডাউনলোড লিংক শীঘ্রই পাঠানো হবে।`
            : `Your invoice ${userOrder.invoiceNo} is ready. Download link will be sent soon.`;
          sendMessage(text, undefined, userOrder.id, selectedThread.userId, 'order');
          toast.success('Invoice message sent');
        }
        break;

      case 'request_payment':
        handleQuickReply(savedReplies[0]);
        break;

      case 'confirm_order':
        if (userOrder) {
          verifyPayment(userOrder.id, true);
          const text = language === 'bn'
            ? 'আপনার অর্ডার কনফার্ম করা হয়েছে!'
            : 'Your order has been confirmed!';
          sendMessage(text, undefined, userOrder.id, selectedThread.userId, 'order');
          toast.success('Order confirmed');
        }
        break;

      case 'book_steadfast':
        if (userOrder && userOrder.paymentStatus === 'verified') {
          const tracking = 'SF' + Math.floor(100000 + Math.random() * 900000);
          updateOrderStatus(userOrder.id, 'shipped', tracking);
          const text = language === 'bn'
            ? `আপনার পণ্য ডেলিভারির জন্য বুক করা হয়েছে। ট্র্যাকিং: ${tracking}`
            : `Your order has been booked for delivery. Tracking: ${tracking}`;
          sendMessage(text, undefined, userOrder.id, selectedThread.userId, 'order');
          toast.success('Delivery booked');
        } else {
          toast.error('Verify payment first');
        }
        break;

      case 'send_tracking':
        if (userOrder && userOrder.trackingCode) {
          const text = language === 'bn'
            ? `আপনার ট্র্যাকিং কোড: ${userOrder.trackingCode}`
            : `Your tracking code: ${userOrder.trackingCode}`;
          sendMessage(text, undefined, userOrder.id, selectedThread.userId, 'order');
        }
        break;

      case 'custom_quote':
        handleQuickReply(savedReplies[4]);
        break;
    }
  };

  const toggleDrawer = () => {
    setShowContextDrawer(!showContextDrawer);
  };

  return (
    <div className="relative flex h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Left Sidebar - Thread List */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-white shrink-0">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-800 text-lg">{t('ইনবক্স', 'Inbox')}</h2>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{filteredThreads.length}</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#D91976]"
              placeholder={t('ইউজার বা অর্ডার খুঁজুন...', 'Search user or order...')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full border transition ${filter === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {t('সব', 'All')}
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-full border transition ${filter === 'unread' ? 'bg-[#D91976] text-white border-[#D91976]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {t('না পড়া', 'Unread')}
            </button>
            <button
              onClick={() => setFilter('order')}
              className={`px-3 py-1.5 rounded-full border transition ${filter === 'order' ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {t('অর্ডার', 'Orders')}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredThreads.map(thread => {
            const userInfo = getUserInfo(thread.userId);
            return (
              <div
                key={`${thread.userId}-${thread.context}`}
                onClick={() => {
                  setSelectedThread({ userId: thread.userId, context: thread.context });
                  setShowContextDrawer(false);
                }}
                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition relative ${selectedThread?.userId === thread.userId && selectedThread?.context === thread.context
                  ? 'bg-pink-50/50 border-l-4 border-l-[#D91976]'
                  : 'border-l-4 border-l-transparent'
                  }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {thread.context === 'support' ? (
                      <LifeBuoy size={14} className="text-blue-500 shrink-0" />
                    ) : (
                      <Package size={14} className="text-orange-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-sm text-gray-900 block truncate">{userInfo.name}</span>
                      {userInfo.phone && <span className="text-[10px] text-gray-500">{userInfo.phone}</span>}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0 ml-2">{new Date(thread.lastMessage.timestamp).toLocaleDateString()}</span>
                </div>

                <div className="flex justify-between items-end gap-2">
                  <div className="flex-1 min-w-0">
                    {thread.context !== 'support' && (
                      <p className="text-[10px] font-mono text-gray-500 bg-gray-100 inline-block px-1.5 py-0.5 rounded mb-1">
                        {t('অর্ডার', 'Order')} #{thread.context.slice(0, 8)}
                      </p>
                    )}
                    <p className={`text-xs truncate ${thread.unreadCount > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                      {thread.lastMessage.senderId === 'admin' || thread.lastMessage.senderId === 'admin_1' ? t('আপনি: ', 'You: ') : ''}
                      {thread.lastMessage.text}
                    </p>
                  </div>
                  {thread.unreadCount > 0 && (
                    <span className="bg-[#D91976] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shrink-0">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
          {filteredThreads.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare size={48} className="mx-auto mb-2 opacity-20" />
              <p>{t('কোনো মেসেজ পাওয়া যায়নি', 'No messages found')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Center - Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/30 min-w-0 relative">
        {selectedThread ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm relative z-20">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-800 truncate">{selectedUserInfo?.name || selectedThread.userId}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${selectedThread.context === 'support' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {selectedThread.context === 'support' ? t('সাপোর্ট', 'Support') : t('অর্ডার', 'Order')}
                  </span>
                </div>
                {selectedUserInfo?.phone && (
                  <p className="text-xs text-gray-500">{selectedUserInfo.phone}</p>
                )}
                {selectedThread.context !== 'support' && (
                  <p className="text-xs text-gray-500">{t('রেফ: অর্ডার', 'Ref: Order')} #{selectedThread.context.slice(0, 10)}</p>
                )}
              </div>

              <button
                onClick={toggleDrawer}
                className="p-2 hover:bg-gray-100 rounded-lg transition flex items-center gap-2 shrink-0"
                title={showContextDrawer ? t('তথ্য লুকান', 'Hide Info') : t('তথ্য দেখান', 'Show Info')}
              >
                <Info size={18} className="text-[#D91976]" />
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {showContextDrawer ? t('লুকান', 'Hide') : t('তথ্য', 'Info')}
                </span>
              </button>

              <button
                onClick={() => {
                  if (confirm(t('আপনি কি নিশ্চিত যে আপনি এই কথোপকথনটি মুছে ফেলতে চান?', 'Are you sure you want to delete this conversation?'))) {
                    deleteThread(selectedThread.userId);
                    setSelectedThread(null);
                  }
                }}
                className="p-2 ml-2 hover:bg-red-50 text-red-500 rounded-lg transition shrink-0"
                title={t('মুছে ফেলুন', 'Delete')}
              >
                <Trash2 size={18} />
              </button>


            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {activeMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <MessageSquare size={48} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">{t('কোনো মেসেজ নেই', 'No messages yet')}</p>
                  </div>
                </div>
              ) : (
                activeMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderId === 'admin' || msg.senderId === 'admin_1' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] sm:max-w-[60%] p-3 rounded-2xl text-sm shadow-sm ${msg.senderId === 'admin' || msg.senderId === 'admin_1'
                      ? 'bg-[#D91976] text-white rounded-br-none'
                      : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                      }`}>
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      <p className={`text-[10px] mt-1 text-right ${msg.senderId === 'admin' || msg.senderId === 'admin_1' ? 'text-pink-200' : 'text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white relative z-20">
              <div className="flex gap-2 mb-3 items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
                  title="Upload Image"
                >
                  <ImageIcon size={20} />
                </button>
                <input
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#D91976] focus:ring-1 focus:ring-[#D91976] transition"
                  placeholder={t('উত্তর লিখুন...', 'Type a reply...')}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="bg-[#D91976] text-white p-2 rounded-full hover:bg-pink-800 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <Send size={18} />
                </button>
              </div>

              {/* Quick Reply Templates */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {savedReplies.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleQuickReply(template)}
                    className="text-xs border border-gray-200 px-3 py-1.5 rounded-full text-gray-600 hover:bg-gray-50 hover:border-[#D91976] hover:text-[#D91976] whitespace-nowrap transition"
                  >
                    {language === 'bn' ? template.label_bn : template.label_en}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={64} className="mb-4 opacity-10" />
            <p>{t('একটি কথোপকথন নির্বাচন করুন', 'Select a conversation to start chatting')}</p>
          </div>
        )}

        {/* Right Sidebar - Context Drawer (Overlay on mobile/tablet, can be closed) */}
        {selectedThread && showContextDrawer && (
          <>
            {/* Backdrop overlay */}
            <div
              className="absolute inset-0 bg-black/30 z-30 transition-opacity"
              onClick={toggleDrawer}
            />

            {/* Drawer */}
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white border-l border-gray-100 shadow-2xl z-40 flex flex-col animate-slide-in-right">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                <h3 className="font-bold text-gray-800">{t('ব্যবহারকারীর তথ্য', 'User Info')}</h3>
                <button
                  onClick={toggleDrawer}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* User Details */}
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#D91976] to-pink-700 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                    {(selectedUserInfo?.name || selectedThread.userId).charAt(0).toUpperCase()}
                  </div>
                  <p className="text-center font-bold text-gray-800">{selectedUserInfo?.name || selectedThread.userId}</p>
                  {selectedUserInfo?.phone && (
                    <p className="text-center text-sm text-gray-600 mt-1">{selectedUserInfo.phone}</p>
                  )}
                  <p className="text-center text-xs text-gray-500 mt-1">{userOrders.length} {t('অর্ডার', 'orders')}</p>
                </div>

                {/* Quick Actions */}
                <div>
                  <h4 className="font-bold text-sm text-gray-700 mb-3">{t('দ্রুত কাজ', 'Quick Actions')}</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => { handleQuickAction('send_invoice'); }}
                      className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition text-sm font-medium"
                    >
                      <FileText size={18} />
                      <span>{t('ইনভয়েস পাঠান', 'Send Invoice')}</span>
                    </button>

                    <button
                      onClick={() => { handleQuickAction('request_payment'); }}
                      className="w-full flex items-center gap-3 p-3 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg transition text-sm font-medium"
                    >
                      <CreditCard size={18} />
                      <span>{t('পেমেন্ট তথ্য চাই', 'Request Payment')}</span>
                    </button>

                    <button
                      onClick={() => { handleQuickAction('confirm_order'); }}
                      className="w-full flex items-center gap-3 p-3 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg transition text-sm font-medium"
                    >
                      <CheckCircle size={18} />
                      <span>{t('অর্ডার কনফার্ম করুন', 'Confirm Order')}</span>
                    </button>

                    <button
                      onClick={() => { handleQuickAction('book_steadfast'); }}
                      className="w-full flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition text-sm font-medium"
                    >
                      <Truck size={18} />
                      <span>{t('Steadfast বুক করুন', 'Book Steadfast')}</span>
                    </button>

                    <button
                      onClick={() => { handleQuickAction('send_tracking'); }}
                      className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition text-sm font-medium"
                    >
                      <Package size={18} />
                      <span>{t('Tracking পাঠান', 'Send Tracking')}</span>
                    </button>

                    <button
                      onClick={() => { handleQuickAction('custom_quote'); }}
                      className="w-full flex items-center gap-3 p-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition text-sm font-medium"
                    >
                      <DollarSign size={18} />
                      <span>{t('কাস্টম কোট পাঠান', 'Send Custom Quote')}</span>
                    </button>
                  </div>
                </div>

                {/* User Orders */}
                <div>
                  <h4 className="font-bold text-sm text-gray-700 mb-3">{t('অর্ডারের তালিকা', 'Order List')}</h4>
                  {userOrders.length > 0 ? (
                    <div className="space-y-2">
                      {userOrders.map(order => (
                        <div key={order.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-mono font-bold text-gray-700">{order.invoiceNo}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${order.status === 'delivered' ? 'bg-pink-100 text-pink-700' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{order.items.length} items • ৳{order.total}</p>
                          {order.trackingCode && (
                            <p className="text-[10px] text-gray-400 mt-1">Tracking: {order.trackingCode}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">{t('কোনো অর্ডার নেই', 'No orders')}</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div >
  );
};
