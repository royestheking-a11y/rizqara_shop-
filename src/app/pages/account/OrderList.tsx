import React, { useState } from 'react';
import { useStore, Order } from '@/app/context/StoreContext';
import { downloadCustomerInvoice } from '@/app/utils/invoiceGenerator';
import { Download, Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp, MessageCircle, RotateCcw, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export const OrderList = () => {
    const { orders, user, sendMessage, requestRefund, addReview, reviews, updateOrderStatus, verifyPayment, cancelOrder, t } = useStore();
    const [expandedOrder, setExpandedOrder] = React.useState<string | null>(null);
    const [refundOrder, setRefundOrder] = useState<string | null>(null);
    const [refundReason, setRefundReason] = useState('');
    const [refundPaymentNumber, setRefundPaymentNumber] = useState('');

    // Review State
    const [reviewModal, setReviewModal] = useState<{ productId: string, orderId: string, itemTitle: string } | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const navigate = useNavigate();

    // Payment State
    const [paymentModal, setPaymentModal] = useState<Order | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('bkash');
    const [trxId, setTrxId] = useState('');

    const myOrders = orders.filter(o => o.userId === user?.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const downloadInvoice = (order: Order) => {
        downloadCustomerInvoice(order);
    };

    const handleOrderChat = (order: Order) => {
        if (!user) {
            toast.error(t('অনুগ্রহ করে লগইন করুন', 'Please login'));
            return;
        }
        sendMessage(
            `${t('অর্ডার নিয়ে কথা বলতে চাই', 'I have a question about my order')} ${order.invoiceNo}`,
            undefined,
            order.id,
            undefined,
            'order'
        );
        toast.success(t('বার্তা পাঠানো হয়েছে!', 'Message sent!'));
        navigate('/account/messages');
    };

    const handleRequestRefund = (order: Order) => {
        if (!refundReason.trim()) {
            toast.error(t('রিফান্ডের কারণ লিখুন', 'Please provide a reason'));
            return;
        }
        if (!refundPaymentNumber.trim()) {
            toast.error(t('রিফান্ডের জন্য পেমেন্ট নম্বর দিন', 'Please provide payment number for refund'));
            return;
        }
        requestRefund(order.id, refundReason, refundPaymentNumber);
        toast.success(t('রিফান্ড অনুরোধ পাঠানো হয়েছে', 'Refund request submitted'));
        setRefundOrder(null);
        setRefundReason('');
        setRefundPaymentNumber('');
    };

    const handleSubmitReview = () => {
        if (!user || !reviewModal) return;

        addReview({
            productId: reviewModal.productId,
            userId: user.id,
            userName: user.name,
            rating,
            comment,
        });
        setReviewModal(null);
        setRating(5);
        setComment('');
    };

    const hasReviewed = (productId: string) => {
        return reviews.some(r => r.productId === productId && r.userId === user?.id);
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'delivered': return 'bg-pink-100 text-pink-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'refund-requested': return 'bg-orange-100 text-orange-700';
            case 'refunded': return 'bg-purple-100 text-purple-700';
            case 'shipped': return 'bg-blue-100 text-blue-700';
            case 'confirmed': return 'bg-teal-100 text-teal-700';
            case 'processing': return 'bg-indigo-100 text-indigo-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const renderCustomDetails = (item: any) => {
        if (item.sketchType) {
            return (
                <div className="mt-3 p-3 bg-gray-50 rounded border text-xs space-y-1">
                    <p><span className="font-semibold text-gray-700">{t('স্কেচ টাইপ', 'Sketch Type')}:</span> {item.sketchType}</p>
                    <p><span className="font-semibold text-gray-700">{t('সাইজ', 'Size')}:</span> {item.sketchSize}</p>
                    <p><span className="font-semibold text-gray-700">{t('ফ্রেম', 'Frame')}:</span> {item.sketchFrame}</p>
                    {item.customText && <p><span className="font-semibold text-gray-700">{t('স্কেচে লেখা', 'Text on Sketch')}:</span> {item.customText}</p>}
                    {item.customNote && <p><span className="font-semibold text-gray-700">{t('নোট', 'Note')}:</span> {item.customNote}</p>}

                    <div className="flex gap-3 mt-2">
                        {item.customImage && (
                            <div>
                                <p className="font-semibold text-[10px] text-gray-500 mb-1">{t('আপনার ছবি', 'Your Photo')}</p>
                                <img src={item.customImage} alt="Uploaded" className="w-16 h-16 object-cover rounded border" />
                            </div>
                        )}
                        {item.sketchReferenceImage && (
                            <div>
                                <p className="font-semibold text-[10px] text-gray-500 mb-1">{t('স্যাম্পল', 'Sample')}</p>
                                <img src={item.sketchReferenceImage} alt="Reference" className="w-16 h-16 object-cover rounded border" />
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Legacy support for JSON in customNote
        if (item.customNote && item.customNote.startsWith('{')) {
            try {
                const note = JSON.parse(item.customNote);
                return (
                    <div className="mt-3 p-3 bg-gray-50 rounded border text-xs space-y-1">
                        <p><span className="font-semibold">{t('আইডিয়া', 'Idea')}:</span> {note.idea}</p>
                        {note.sketchType && <p><span className="font-semibold">{t('টাইপ', 'Type')}:</span> {note.sketchType}</p>}
                        {note.size && <p><span className="font-semibold">{t('সাইজ', 'Size')}:</span> {note.size}</p>}
                        {note.frameOption && <p><span className="font-semibold">{t('ফ্রেম', 'Frame')}:</span> {note.frameOption}</p>}
                        {note.images && note.images.length > 0 && (
                            <div className="flex gap-2 mt-2">
                                {note.images.map((img: string, i: number) => (
                                    <img key={i} src={img} alt="Ref" className="w-16 h-16 object-cover rounded border" />
                                ))}
                            </div>
                        )}
                    </div>
                );
            } catch (e) { return item.customNote ? <p className="text-xs italic text-gray-500 mt-1">{item.customNote}</p> : null; }
        }

        return item.customNote ? <p className="text-xs italic text-gray-500 mt-1">{t('নোট', 'Note')}: {item.customNote}</p> : null;
    };

    if (myOrders.length === 0) {
        return (
            <div className="bg-white p-12 rounded-xl border border-gray-100 text-center shadow-sm">
                <Package size={64} className="mx-auto text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">{t('কোনো অর্ডার নেই', 'No orders found')}</h3>
                <p className="text-gray-500 mb-6">{t('এখনও কোনো অর্ডার করা হয়নি', 'Looks like you haven\'t placed any orders yet.')}</p>
                <button
                    onClick={() => navigate('/shop')}
                    className="px-6 py-2 bg-[#D91976] text-white rounded-lg hover:bg-pink-800 transition"
                >
                    {t('কেনাকাটা শুরু করুন', 'Start Shopping')}
                </button>
            </div>
        );
    }

    const handlePayNow = (order: Order) => {
        setPaymentModal(order);
    };

    const confirmPayment = () => {
        if (!paymentModal || !trxId) return;

        verifyPayment(paymentModal.id, true);
        updateOrderStatus(paymentModal.id, 'processing');

        toast.success(t('পেমেন্ট সফল হয়েছে!', 'Payment Successful!'));
        setPaymentModal(null);
        setTrxId('');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">My Orders</h2>
            {Array.from(new Map(myOrders.map(item => [item.id, item])).values()).map((order, idx) => (
                <div key={order.id || `order-${idx}`} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition duration-300">
                    {/* Order Header */}
                    <div className="p-6 cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-bold text-lg text-gray-900">{order.invoiceNo}</span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(order.date).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{order.items.length} items</span>
                                    <span>•</span>
                                    <span className="font-bold text-gray-900">৳{order.total}</span>
                                    {order.trxId && (
                                        <>
                                            <span>•</span>
                                            <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Trx: {order.trxId}</span>
                                        </>
                                    )}
                                    {order.total === 0 && (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold animate-pulse">
                                            {t('মূল্য নির্ধারণ চলছে', 'Quote Pending')}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {order.total > 0 &&
                                    order.paymentStatus === 'pending' &&
                                    !order.trxId && // Hide if TrxID exists (already paid/attempted)
                                    !['processing', 'confirmed', 'shipped', 'delivered'].includes(order.status) && // Hide if order is underway
                                    order.status !== 'cancelled' &&
                                    order.paymentMethod !== 'cod' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handlePayNow(order); }}
                                            className="px-4 py-2 bg-[#D91976] text-white rounded-lg hover:bg-pink-800 transition text-sm font-bold shadow-lg animate-pulse"
                                        >
                                            👉 {t('পেমেন্ট করুন', 'Pay Now')}
                                        </button>
                                    )}
                                {order.paymentStatus === 'verified' && (
                                    <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                                        <CheckCircle size={16} />
                                        <span className="text-xs font-bold uppercase">{t('পেমেন্ট সফল', 'Payment Successful')}</span>
                                    </div>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); downloadInvoice(order); }}
                                    className="flex items-center gap-2 text-sm text-[#D91976] border border-[#D91976] px-4 py-2 rounded-lg hover:bg-pink-50 transition font-medium"
                                >
                                    <Download size={16} /> {t('ইনভয়েস', 'Invoice')}
                                </button>
                                <button className="text-gray-400 hover:text-gray-600">
                                    {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {expandedOrder === order.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-50 bg-gray-50/30"
                            >
                                <div className="p-6">
                                    {/* Items */}
                                    <div className="space-y-3 mb-6">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex flex-col sm:flex-row gap-4 p-3 bg-white rounded-lg border border-gray-100">
                                                <div className="flex gap-4 flex-1">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                                        <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-sm text-gray-900">{t(item.title_bn, item.title_en)}</h4>
                                                        {item.selectedVariant && <p className="text-xs text-gray-500">Color: {item.selectedVariant}</p>}
                                                        <div className="flex justify-between items-center mt-2">
                                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Qty: {item.quantity}</span>
                                                            <span className="font-bold text-sm">৳{(item.discount_price || item.price) * item.quantity}</span>
                                                        </div>
                                                        {renderCustomDetails(item)}
                                                    </div>
                                                </div>

                                                {/* Review Button */}
                                                {order.status === 'delivered' && (
                                                    <div className="flex items-center sm:justify-end">
                                                        {hasReviewed(item.id) ? (
                                                            <span className="text-xs font-medium text-pink-600 flex items-center gap-1">
                                                                <CheckCircle size={14} /> Reviewed
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => setReviewModal({ productId: item.id, orderId: order.id, itemTitle: t(item.title_bn, item.title_en) })}
                                                                className="text-xs font-medium text-[#D91976] border border-[#D91976] px-3 py-1.5 rounded hover:bg-pink-50 transition"
                                                            >
                                                                Write Review
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Timeline */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-100">
                                        <h4 className="font-bold text-gray-800 mb-6">Order Timeline</h4>
                                        <div className="relative pl-8 border-l-2 border-gray-100 space-y-8">
                                            {(order.trackingHistory || [{ status: 'pending', date: order.date, note: 'Order placed' }]).map((event, idx) => (
                                                <div key={idx} className="relative">
                                                    <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${idx === 0 ? 'border-[#D91976] text-[#D91976]' : 'border-gray-300 text-gray-300'
                                                        }`}>
                                                        {event.status === 'delivered' ? <CheckCircle size={14} /> :
                                                            event.status === 'shipped' ? <Truck size={14} /> :
                                                                event.status === 'cancelled' ? <XCircle size={14} /> :
                                                                    <Clock size={14} />}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-sm text-gray-900 capitalize">{event.status}</h5>
                                                        <p className="text-xs text-gray-500">{new Date(event.date).toLocaleString()}</p>
                                                        {event.note && <p className="text-xs text-gray-400 mt-1">{event.note}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {order.trackingCode && (
                                            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                                                <span className="text-sm text-gray-500">Steadfast Tracking ID:</span>
                                                <span className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">{order.trackingCode}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Actions */}
                                    <div className="flex flex-col gap-3 mt-6">
                                        {/* Talk Button */}
                                        <button
                                            onClick={() => handleOrderChat(order)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#D91976] text-[#D91976] rounded-lg hover:bg-pink-50 transition font-medium"
                                        >
                                            <MessageCircle size={18} />
                                            <span>{t('অর্ডার নিয়ে কথা বলুন', 'Talk about this order')}</span>
                                        </button>

                                        {/* Cancel Button (Only for Pending) */}
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => {
                                                    const reason = window.prompt(t('অর্ডার বাতিলের কারণ লিখুন', 'Reason for cancellation'));
                                                    if (reason) cancelOrder(order.id, reason);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition font-medium"
                                            >
                                                <XCircle size={18} />
                                                <span>{t('অর্ডার বাতিল করুন', 'Cancel Order')}</span>
                                            </button>
                                        )}

                                        {/* Refund Request (For non-pending, non-delivered, non-cancelled) */}
                                        {order.status !== 'pending' && order.status !== 'delivered' && order.status !== 'cancelled' && (
                                            <>
                                                <button
                                                    onClick={() => setRefundOrder(order.id)}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#D91976] text-[#D91976] rounded-lg hover:bg-pink-50 transition font-medium"
                                                >
                                                    <RotateCcw size={18} />
                                                    <span>{t('রিফান্ড অনুরোধ করুন', 'Request Refund')}</span>
                                                </button>
                                                {refundOrder === order.id && (
                                                    <div className="mt-4 p-4 bg-pink-50 rounded-xl border border-pink-100">
                                                        <textarea
                                                            value={refundReason}
                                                            onChange={(e) => setRefundReason(e.target.value)}
                                                            placeholder={t('রিফান্ডের কারণ লিখুন', 'Enter refund reason')}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D91976]"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={refundPaymentNumber}
                                                            onChange={(e) => setRefundPaymentNumber(e.target.value)}
                                                            placeholder={t('রিফান্ডের জন্য পেমেন্ট নম্বর দিন', 'Enter payment number for refund')}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D91976] mt-2"
                                                        />
                                                        <button
                                                            onClick={() => handleRequestRefund(order)}
                                                            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-[#D91976] text-white rounded-lg hover:bg-pink-800 transition font-medium"
                                                        >
                                                            <RotateCcw size={18} />
                                                            <span>{t('রিফান্ড অনুরোধ পাঠানো হয়েছে', 'Submit Refund Request')}</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}

            {/* Review Modal */}
            {reviewModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setReviewModal(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold mb-4">Write Review</h3>
                        <p className="text-gray-500 text-sm mb-6">{reviewModal.itemTitle}</p>

                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setRating(s)}
                                    className={`p-1 transition ${rating >= s ? 'text-yellow-400 scale-110' : 'text-gray-300'}`}
                                >
                                    <Star size={32} fill={rating >= s ? 'currentColor' : 'none'} />
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:outline-none focus:border-[#D91976] mb-6 resize-none"
                        />

                        <button
                            onClick={handleSubmitReview}
                            disabled={!comment.trim()}
                            className="w-full bg-[#D91976] text-white py-3 rounded-lg font-bold hover:bg-pink-800 transition disabled:opacity-50"
                        >
                            Submit Review
                        </button>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {paymentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-50 duration-200">
                        <button onClick={() => setPaymentModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        <h3 className="text-xl font-bold mb-2">{t('পেমেন্ট কমপ্লিট করুন', 'Complete Payment')}</h3>
                        <p className="text-gray-500 mb-6">Total Amount: <span className="font-bold text-[#D91976]">৳{paymentModal.total}</span></p>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {['bkash', 'nagad', 'rocket'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setPaymentMethod(m)}
                                    className={`p-3 border rounded-lg uppercase font-bold text-sm ${paymentMethod === m ? 'border-[#D91976] bg-pink-50 text-[#D91976]' : 'border-gray-200 text-gray-500'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <p className="text-xs text-gray-500 mb-1">Send money to this number:</p>
                            <p className="text-lg font-mono font-bold text-gray-800">01700000000</p>
                        </div>

                        <input
                            type="text"
                            placeholder="Enter Transaction ID"
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:border-[#D91976] outline-none"
                        />

                        <button
                            onClick={confirmPayment}
                            className="w-full py-3 bg-[#D91976] text-white font-bold rounded-lg hover:bg-pink-800 transition"
                        >
                            Confirm Payment
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
