import { useState } from 'react';
import { useStore } from '@/app/context/StoreContext';
import { Check, X, Eye, DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export const AdminPayments = () => {
  const { orders, verifyPayment, t } = useStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'cod'>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Calculate earnings
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

  const calculateEarnings = (timeFilter: 'today' | 'week' | 'month' | 'all') => {
    return orders
      .filter(order => {
        const orderDate = new Date(order.date);
        if (order.paymentStatus !== 'verified') return false;

        switch (timeFilter) {
          case 'today':
            return orderDate >= today;
          case 'week':
            return orderDate >= weekAgo;
          case 'month':
            return orderDate >= monthAgo;
          default:
            return true;
        }
      })
      .reduce((sum, order) => sum + order.total, 0);
  };

  const todayEarnings = calculateEarnings('today');
  const weekEarnings = calculateEarnings('week');
  const monthEarnings = calculateEarnings('month');
  const totalEarnings = calculateEarnings('all');

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.paymentStatus === 'pending' && order.paymentMethod !== 'cod';
    if (filter === 'verified') return order.paymentStatus === 'verified';
    if (filter === 'cod') return order.paymentMethod === 'cod';
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleVerify = (orderId: string, verified: boolean) => {
    verifyPayment(orderId, verified);
    toast.success(verified ? t('পেমেন্ট যাচাই করা হয়েছে!', 'Payment verified!') : t('পেমেন্ট বাতিল করা হয়েছে!', 'Payment rejected!'));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">{t('পেমেন্ট ম্যানেজমেন্ট', 'Payment Management')}</h1>
      </div>

      {/* Earnings Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <Calendar size={24} className="opacity-80" />
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">{t('আজ', 'Today')}</span>
          </div>
          <p className="text-2xl font-bold mb-1">৳{todayEarnings.toLocaleString()}</p>
          <p className="text-sm text-blue-100">{t('দৈনিক আয়', 'Daily Earnings')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={24} className="opacity-80" />
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">{t('৭ দিন', '7 Days')}</span>
          </div>
          <p className="text-2xl font-bold mb-1">৳{weekEarnings.toLocaleString()}</p>
          <p className="text-sm text-pink-100">{t('সাপ্তাহিক আয়', 'Weekly Earnings')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <Calendar size={24} className="opacity-80" />
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">{t('৩০ দিন', '30 Days')}</span>
          </div>
          <p className="text-2xl font-bold mb-1">৳{monthEarnings.toLocaleString()}</p>
          <p className="text-sm text-purple-100">{t('মাসিক আয়', 'Monthly Earnings')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#D91976] to-pink-700 text-white p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={24} className="opacity-80" />
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">{t('সর্বমোট', 'All Time')}</span>
          </div>
          <p className="text-2xl font-bold mb-1">৳{totalEarnings.toLocaleString()}</p>
          <p className="text-sm text-pink-100">{t('মোট আয়', 'Total Earnings')}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all'
              ? 'bg-[#D91976] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {t('সকল পেমেন্ট', 'All Payments')} ({orders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'pending'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {t('পেন্ডিং', 'Pending')} ({orders.filter(o => o.paymentStatus === 'pending' && o.paymentMethod !== 'cod').length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'verified'
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {t('ভেরিফাইড', 'Verified')} ({orders.filter(o => o.paymentStatus === 'verified').length})
          </button>
          <button
            onClick={() => setFilter('cod')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'cod'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            COD ({orders.filter(o => o.paymentMethod === 'cod').length})
          </button>
        </div>
      </div>

      {/* Payment Requests Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-4">{t('ইনভয়েস', 'Invoice')}</th>
                <th className="p-4">{t('কাস্টমার', 'Customer')}</th>
                <th className="p-4">{t('তারিখ', 'Date')}</th>
                <th className="p-4">{t('পরিমাণ', 'Amount')}</th>
                <th className="p-4">{t('মেথড', 'Method')}</th>
                <th className="p-4">{t('স্ট্যাটাস', 'Status')}</th>
                <th className="p-4 text-right">{t('অ্যাকশন', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <p className="font-medium text-sm">{order.invoiceNo}</p>
                    <p className="text-xs text-gray-500">{order.id ? order.id.substring(0, 8) : 'N/A'}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-sm">{order.userName}</p>
                    <p className="text-xs text-gray-500">{order.userPhone}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-[#D91976]">৳{order.total.toLocaleString()}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1.5 rounded ${order.paymentMethod === 'bkash' ? 'bg-pink-100 text-pink-600' :
                        order.paymentMethod === 'nagad' ? 'bg-orange-100 text-orange-600' :
                          order.paymentMethod === 'rocket' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                        <CreditCard size={14} />
                      </div>
                      <span className="uppercase font-bold text-xs tracking-wider">{order.paymentMethod}</span>
                    </div>
                    {order.paymentTrxId && (
                      <div className="bg-gray-100 px-2 py-1 rounded border border-gray-200 inline-block">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5 leading-none">Transaction ID</p>
                        <p className="text-xs font-mono font-bold text-gray-900">{order.paymentTrxId}</p>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase border ${order.paymentStatus === 'verified' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                      order.paymentStatus === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {order.paymentMethod !== 'cod' && (
                        <div className="flex gap-2">
                          {order.paymentScreenshot && (
                            <button
                              onClick={() => setSelectedImage(order.paymentScreenshot!)}
                              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition shadow-sm"
                              title={t('স্ক্রিনশট দেখুন', 'View Screenshot')}
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          {order.paymentStatus !== 'verified' && (
                            <>
                              <button
                                onClick={() => handleVerify(order.id, true)}
                                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition shadow-sm font-bold text-xs flex items-center gap-1"
                                title={t('পেমেন্ট যাচাই করুন', 'Verify Payment')}
                              >
                                <Check size={14} /> {t('কনফার্ম', 'Confirm')}
                              </button>
                              <button
                                onClick={() => handleVerify(order.id, false)}
                                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition shadow-sm font-bold text-xs flex items-center gap-1"
                                title={t('পেমেন্ট বাতিল করুন', 'Reject Payment')}
                              >
                                <X size={14} /> {t('রিজেক্ট', 'Reject')}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                      {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && (
                        <span className="text-xs text-gray-500 italic font-medium">{t('ডেলিভারি পেন্ডিং', 'Pending Delivery')}</span>
                      )}
                      {order.paymentStatus === 'verified' && (
                        <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 border border-green-100">
                          <Check size={14} /> {t('ভেরিফাইড', 'Verified')}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <CreditCard size={48} className="mx-auto mb-3 opacity-20" />
              <p>{t('কোনো পেমেন্ট অনুরোধ পাওয়া যায়নি', 'No payment requests found')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Screenshot Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-2xl w-full bg-white rounded-xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-lg mb-4">{t('পেমেন্ট স্ক্রিনশট', 'Payment Screenshot')}</h3>
            <img
              src={selectedImage}
              alt="Payment screenshot"
              className="w-full h-auto rounded-lg"
            />
          </motion.div>
        </div>
      )}
    </div>
  );
};
