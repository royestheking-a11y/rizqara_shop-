import { useState } from 'react';
import { useStore, Order } from '@/app/context/StoreContext';
import { RotateCcw, Check, X, Eye, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export const AdminRefunds = () => {
  const { orders, processRefund } = useStore();
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [refundPaymentNumber, setRefundPaymentNumber] = useState('');

  const refundOrders = orders.filter(o => o.status === 'refund-requested');
  const processedRefunds = orders.filter(o => o.status === 'refunded' || (o.status === 'cancelled' && o.refundRequestDate));

  const handleApproveRefund = (order: Order) => {
    if (!refundPaymentNumber.trim()) {
      toast.error('Please provide refund payment number');
      return;
    }
    processRefund(order.id, true, refundPaymentNumber);
    toast.success('Refund approved and processed');
    setViewingOrder(null);
    setRefundPaymentNumber('');
  };

  const handleRejectRefund = (order: Order) => {
    if (confirm(`Are you sure you want to reject refund for ${order.invoiceNo}?`)) {
      processRefund(order.id, false);
      toast.success('Refund rejected');
      setViewingOrder(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Refund Management</h1>
        <div className="flex gap-4">
          <div className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-100">
            <p className="text-xs text-orange-600 font-medium">Pending Refunds</p>
            <p className="text-2xl font-bold text-orange-700">{refundOrders.length}</p>
          </div>
          <div className="bg-purple-50 px-4 py-2 rounded-lg border border-purple-100">
            <p className="text-xs text-purple-600 font-medium">Processed</p>
            <p className="text-2xl font-bold text-purple-700">{processedRefunds.length}</p>
          </div>
        </div>
      </div>

      {/* Pending Refunds */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-orange-50 px-6 py-4 border-b border-orange-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Clock size={20} className="text-orange-600" />
            Pending Refund Requests
          </h2>
        </div>

        {refundOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <RotateCcw size={48} className="mx-auto mb-4 opacity-50" />
            <p>No pending refund requests</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-4">Invoice</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Request Date</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Payment Info</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {refundOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-sm">{order.invoiceNo}</td>
                  <td className="p-4 text-sm">
                    <p className="font-bold">{order.userName}</p>
                    <p className="text-gray-500">{order.userPhone}</p>
                  </td>
                  <td className="p-4 font-bold text-[#D91976]">৳{order.total}</td>
                  <td className="p-4 text-xs text-gray-500">
                    {order.refundRequestDate ? new Date(order.refundRequestDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 text-sm max-w-xs">
                    <p className="text-gray-600 truncate">{order.refundReason || 'No reason provided'}</p>
                  </td>
                  <td className="p-4 text-sm">
                    <p className="text-xs text-gray-500">Method: {order.paymentMethod.toUpperCase()}</p>
                    {order.refundPaymentNumber && (
                      <p className="text-xs font-mono text-gray-700 mt-1">
                        {order.refundPaymentNumber}
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setViewingOrder(order)}
                        className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Processed Refunds */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <DollarSign size={20} className="text-purple-600" />
            Processed Refunds
          </h2>
        </div>

        {processedRefunds.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <RotateCcw size={48} className="mx-auto mb-4 opacity-50" />
            <p>No processed refunds yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-sm">
                <tr>
                  <th className="p-4">Invoice</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Processed Date</th>
                  <th className="p-4">Refund Payment Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {processedRefunds.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-sm">{order.invoiceNo}</td>
                    <td className="p-4 text-sm">
                      <p className="font-bold">{order.userName}</p>
                      <p className="text-gray-500">{order.userPhone}</p>
                    </td>
                    <td className="p-4 font-bold text-[#D91976]">৳{order.total}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${order.status === 'refunded' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {order.status === 'refunded' ? 'Refunded' : 'Rejected'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      {order.refundTime ? new Date(order.refundTime).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-sm">
                      {order.refundPaymentNumber && order.status === 'refunded' ? (
                        <div>
                          <p className="text-xs text-gray-500">Refunded to:</p>
                          <p className="text-xs font-mono font-bold text-gray-700">{order.refundPaymentNumber}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Order Modal */}
      <AnimatePresence>
        {viewingOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setViewingOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl bg-white rounded-2xl shadow-2xl z-[51] overflow-y-auto max-h-[90vh]"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Refund Request Details</h2>
                    <p className="text-sm text-gray-500 mt-1">{viewingOrder.invoiceNo}</p>
                  </div>
                  <button
                    onClick={() => setViewingOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Order Info */}
                <div className="bg-gray-50 p-6 rounded-xl mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Customer</p>
                      <p className="font-bold text-gray-900">{viewingOrder.userName}</p>
                      <p className="text-sm text-gray-600">{viewingOrder.userPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Order Total</p>
                      <p className="text-2xl font-bold text-[#D91976]">৳{viewingOrder.total}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                      <p className="font-medium text-gray-900 uppercase">{viewingOrder.paymentMethod}</p>
                      {viewingOrder.paymentTrxId && (
                        <p className="text-xs text-gray-600 font-mono">{viewingOrder.paymentTrxId}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Customer Payment Number</p>
                      <p className="font-mono font-bold text-gray-900">
                        {viewingOrder.refundPaymentNumber || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Refund Reason */}
                <div className="bg-orange-50 p-6 rounded-xl mb-6 border border-orange-100">
                  <h3 className="font-bold text-gray-900 mb-2">Refund Reason</h3>
                  <p className="text-gray-700">{viewingOrder.refundReason || 'No reason provided'}</p>
                  <p className="text-xs text-gray-500 mt-3">
                    Requested on: {viewingOrder.refundRequestDate ? new Date(viewingOrder.refundRequestDate).toLocaleString() : 'N/A'}
                  </p>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {viewingOrder.items.map((item, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-white rounded-md overflow-hidden shrink-0">
                          <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900">{item.title_en}</h4>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs bg-white px-2 py-1 rounded">Qty: {item.quantity}</span>
                            <span className="font-bold">৳{(item.discount_price || item.price) * item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Refund Action */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      Enter refund payment number (bKash/Nagad/Rocket):
                    </p>
                    <input
                      type="text"
                      value={refundPaymentNumber}
                      onChange={(e) => setRefundPaymentNumber(e.target.value)}
                      placeholder="e.g., 01XXXXXXXXX"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D91976]"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleApproveRefund(viewingOrder)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#D91976] text-white rounded-lg hover:bg-pink-800 transition font-medium"
                    >
                      <Check size={20} />
                      Approve & Process Refund
                    </button>
                    <button
                      onClick={() => handleRejectRefund(viewingOrder)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                    >
                      <X size={20} />
                      Reject Refund
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
