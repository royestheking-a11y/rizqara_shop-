import React from 'react';
import { useStore } from '@/app/context/StoreContext';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';

export const NotificationList = () => {
  const { notifications, markNotificationAsRead, user, t } = useStore();

  const myNotifications = notifications
    .filter(n => n.userId === user?.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const unreadCount = myNotifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    myNotifications.forEach(n => {
      if (!n.read) markNotificationAsRead(n.id);
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('নোটিফিকেশন', 'Notifications')}
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} {t('টি নতুন নোটিফিকেশন', 'new notifications')}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm text-[#D91976] hover:underline font-medium"
          >
            <CheckCheck size={16} />
            {t('সব পড়া হয়েছে চিহ্নিত করুন', 'Mark all as read')}
          </button>
        )}
      </div>

      {myNotifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Bell size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {t('কোনো নোটিফিকেশন নেই', 'No notifications yet')}
          </h2>
          <p className="text-gray-600">
            {t('আপনার সব আপডেট এখানে দেখা যাবে', 'All your updates will appear here')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {myNotifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden ${
                !notif.read ? 'ring-2 ring-pink-100' : ''
              }`}
            >
              <Link
                to={notif.link || '#'}
                onClick={() => markNotificationAsRead(notif.id)}
                className="block p-6"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      !notif.read
                        ? 'bg-pink-100 text-[#D91976]'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Bell size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3
                        className={`font-semibold ${
                          !notif.read ? 'text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        {t(notif.title_bn, notif.title_en)}
                      </h3>
                      {!notif.read && (
                        <span className="w-2 h-2 bg-[#D91976] rounded-full shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {t(notif.body_bn, notif.body_en)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(notif.timestamp).toLocaleString(t('bn-BD', 'en-US'), {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
