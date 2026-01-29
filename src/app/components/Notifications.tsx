import { useRef, useEffect } from 'react';
import { useStore } from '@/app/context/StoreContext';
import { Bell, Check } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';

export const Notifications = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { notifications, markNotificationAsRead, language } = useStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Backend returns only this user's notifications, just sort them
  const myNotifications = notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const unreadCount = myNotifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed md:absolute right-2 md:right-0 top-16 md:top-full md:mt-3 w-[calc(100vw-1rem)] md:w-96 max-w-[380px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-right"
    >
      <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-800">{language === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}</h3>
        {unreadCount > 0 && (
          <span className="bg-[#D91976] text-white text-xs px-2 py-0.5 rounded-full">{unreadCount} new</span>
        )}
      </div>

      <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto custom-scrollbar">
        {myNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Bell size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">{language === 'bn' ? 'কোনো নোটিফিকেশন নেই' : 'No notifications yet'}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {myNotifications.map(notif => (
              <li key={notif.id} className={`p-4 hover:bg-gray-50 transition relative ${!notif.read ? 'bg-pink-50/30' : ''}`}>
                <Link
                  to={notif.link || '#'}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    onClose();
                  }}
                  className="block"
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className={`text-sm flex-1 ${!notif.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {language === 'bn' ? notif.title_bn : notif.title_en}
                    </h4>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 pr-6">
                    {language === 'bn' ? notif.body_bn : notif.body_en}
                  </p>
                </Link>
                {!notif.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationAsRead(notif.id);
                    }}
                    className="absolute right-2 bottom-2 text-gray-300 hover:text-[#D91976]"
                    title="Mark as read"
                  >
                    <Check size={12} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-2 border-t border-gray-50 text-center">
        <Link to="/account/notifications" onClick={onClose} className="text-xs text-[#D91976] font-medium hover:underline">
          {language === 'bn' ? 'সব দেখুন' : 'View All'}
        </Link>
      </div>
    </motion.div>
  );
};