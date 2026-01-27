import { useState } from 'react';
import { useStore, User } from '@/app/context/StoreContext';
import { Mail, Phone, Eye, Ban, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export const AdminCustomers = () => {
  const { users, orders, banUser, unbanUser, deleteUser, t } = useStore();
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');

  // Calculate user statistics
  const getUserStats = (userId: string) => {
    const userOrders = orders.filter(o => o.userId === userId);
    const totalSpent = userOrders.reduce((acc, o) => acc + o.total, 0);
    return {
      orders: userOrders.length,
      spent: totalSpent,
    };
  };

  const handleBanUser = (user: User) => {
    if (!banReason.trim()) {
      toast.error(t('ব্যান করার কারণ উল্লেখ করুন', 'Please provide a reason for banning'));
      return;
    }
    banUser(user.id, banReason);
    setViewingUser(null);
    setBanReason('');
  };

  const handleUnbanUser = (user: User) => {
    unbanUser(user.id);
    toast.success(t('ব্যবহারকারী আনব্যান হয়েছে', 'User unbanned successfully'));
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(t('আপনি কি এই ব্যবহারকারীকে মুছে ফেলতে চান?', 'Are you sure you want to delete this user?'))) {
      deleteUser(user.id);
      toast.success(t('ব্যবহারকারী মুছে ফেলা হয়েছে', 'User deleted successfully'));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{t('কাস্টমার ম্যানেজমেন্ট', 'Customer Management')}</h1>
        <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
          <p className="text-xs text-indigo-600 font-medium">{t('মোট কাস্টমার', 'Total Customers')}</p>
          <p className="text-2xl font-bold text-indigo-700">{users.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4">{t('কাস্টমার', 'Customer')}</th>
              <th className="p-4">{t('যোগাযোগ', 'Contact')}</th>
              <th className="p-4">{t('অর্ডার', 'Orders')}</th>
              <th className="p-4">{t('মোট খরচ', 'Total Spent')}</th>
              <th className="p-4">{t('স্ট্যাটাস', 'Status')}</th>
              <th className="p-4 text-right">{t('অ্যাকশন', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => {
              const stats = getUserStats(user.id);
              return (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-50 text-[#D91976] flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={12} /> {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={12} /> {user.phone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium">{stats.orders}</td>
                  <td className="p-4 text-sm font-bold text-[#D91976]">৳{stats.spent.toLocaleString()}</td>
                  <td className="p-4">
                    {user.isBanned ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        {t('ব্যানড', 'Banned')}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                        {t('এক্টিভ', 'Active')}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setViewingUser(user)}
                        className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        title={t('বিস্তারিত দেখুন', 'View Details')}
                      >
                        <Eye size={16} />
                      </button>
                      {user.isBanned ? (
                        <button
                          onClick={() => handleUnbanUser(user)}
                          className="p-2 bg-pink-50 text-pink-600 rounded hover:bg-pink-100"
                          title={t('আনব্যান করুন', 'Unban User')}
                        >
                          <CheckCircle size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setViewingUser(user)}
                          className="p-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100"
                          title={t('ব্যান করুন', 'Ban User')}
                        >
                          <Ban size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                        title={t('মুছে ফেলুন', 'Delete User')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <div className="p-8 text-center text-gray-500">{t('কোনো কাস্টমার পাওয়া যায়নি', 'No customers found.')}</div>}
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {viewingUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setViewingUser(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white rounded-2xl shadow-2xl z-[51] overflow-y-auto max-h-[90vh]"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{viewingUser.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{viewingUser.email}</p>
                  </div>
                  <button
                    onClick={() => setViewingUser(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 p-6 rounded-xl mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('ফোন', 'Phone')}</p>
                      <p className="font-medium text-gray-900">{viewingUser.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('রোল', 'Role')}</p>
                      <p className="font-medium text-gray-900 capitalize">{viewingUser.role}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('মোট অর্ডার', 'Total Orders')}</p>
                      <p className="text-xl font-bold text-[#D91976]">{getUserStats(viewingUser.id).orders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t('মোট খরচ', 'Total Spent')}</p>
                      <p className="text-xl font-bold text-[#D91976]">৳{getUserStats(viewingUser.id).spent.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                {viewingUser.addresses && viewingUser.addresses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-3">{t('সেভ করা ঠিকানা', 'Saved Addresses')}</h3>
                    <div className="space-y-3">
                      {viewingUser.addresses.map((addr, i) => (
                        <div key={i} className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-700">
                            {addr.details}, {addr.upazila}, {addr.district}, {addr.division}
                          </p>
                          {addr.isDefault && (
                            <span className="text-xs bg-[#D91976] text-white px-2 py-0.5 rounded mt-2 inline-block">
                              Default
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ban Section */}
                {viewingUser.isBanned ? (
                  <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                    <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                      <Ban size={20} />
                      {t('ব্যবহারকারী ব্যানড', 'User is Banned')}
                    </h3>
                    <p className="text-red-700 text-sm mb-4">
                      {t('কারণ:', 'Reason:')} {viewingUser.bannedReason || t('কোনো কারণ উল্লেখ করা হয়নি', 'No reason provided')}
                    </p>
                    <button
                      onClick={() => handleUnbanUser(viewingUser)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-medium"
                    >
                      <CheckCircle size={20} />
                      {t('আনব্যান করুন', 'Unban User')}
                    </button>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
                    <h3 className="font-bold text-yellow-900 mb-2">{t('ব্যবহারকারী ব্যান করুন', 'Ban User')}</h3>
                    <p className="text-yellow-700 text-sm mb-4">
                      {t('ব্যান করার কারণ লিখুন:', 'Provide a reason for banning this user:')}
                    </p>
                    <textarea
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder="Enter reason for ban..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D91976] mb-4"
                      rows={3}
                    />
                    <button
                      onClick={() => handleBanUser(viewingUser)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                    >
                      <Ban size={20} />
                      {t('ব্যান করুন', 'Ban User')}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
