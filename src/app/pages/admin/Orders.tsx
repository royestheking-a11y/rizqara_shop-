import { useState } from 'react';
import { useStore, Order } from '@/app/context/StoreContext';
import { X, Truck, Printer, Eye, Trash2, CheckCircle, Download, PenTool } from 'lucide-react';
import { toast } from 'sonner';
import { downloadAdminPackingSlip } from '@/app/utils/invoiceGenerator';

export const AdminOrders = () => {
    const { orders, users, verifyPayment, deleteOrder, confirmOrder, updateOrderConsigneeInfo, bookSteadfast, cancelOrder, t } = useStore();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [consigneeNote, setConsigneeNote] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Steadfast Booking Modal State
    const [isSteadfastModalOpen, setSteadfastModalOpen] = useState(false);
    const [steadfastOrder, setSteadfastOrder] = useState<Order | null>(null);
    const [steadfastNote, setSteadfastNote] = useState('');

    // Initial state for modal
    const openOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setConsigneeNote(order.consigneeNote || '');
        setIsConfirmed(order.consigneeConfirmation || false);
    };

    const handleSaveConsigneeInfo = () => {
        if (selectedOrder) {
            updateOrderConsigneeInfo(selectedOrder.id, isConfirmed, consigneeNote);
        }
    };

    const handleBookSteadfast = (order: Order) => {
        console.log('Clicked Book Steadfast', order.id, order.status);
        if (order.status === 'pending' || order.paymentStatus === 'failed') {
            toast.error(t('অনুগ্রহ করে অর্ডার নিশ্চিত করুন!', 'Please confirm order first!'));
            return;
        }
        if (order.status !== 'confirmed' && order.status !== 'processing') {
            toast.error(t('শিপিংয়ের আগে অর্ডার নিশ্চিত করতে হবে!', 'Order must be confirmed before shipping!'));
            return;
        }
        console.log('Opening Steadfast Modal');
        setSteadfastOrder(order);
        setSteadfastNote('Premium Product'); // Default note
        setSteadfastModalOpen(true);
    };

    const confirmSteadfastBooking = async () => {
        if (!steadfastOrder) return;

        const bookingData = {
            invoice: steadfastOrder.invoiceNo,
            recipient_name: steadfastOrder.userName,
            recipient_phone: steadfastOrder.userPhone,
            recipient_address: steadfastOrder.shippingAddress.details + ', ' + steadfastOrder.shippingAddress.upazila + ', ' + steadfastOrder.shippingAddress.district,
            cod_amount: steadfastOrder.paymentMethod === 'cod' ? steadfastOrder.total : 0,
            note: steadfastNote
        };

        try {
            await bookSteadfast(steadfastOrder.id, bookingData);
            setSteadfastModalOpen(false);
            setSteadfastOrder(null);
        } catch (e) {
            // Error handling done in StoreContext
        }
    };

    const handleCancelOrder = (order: Order) => {
        const reason = prompt("Enter reason for cancellation:");
        if (reason) {
            cancelOrder(order.id, reason);
        }
    };

    const printLabel = (order: Order) => {
        downloadAdminPackingSlip(order);
    };

    const handleConfirmOrder = (order: Order) => {
        confirmOrder(order.id);
        toast.success(t('অর্ডার নিশ্চিত করা হয়েছে!', 'Order confirmed!'));
    };

    const handleDeleteOrder = (order: Order) => {
        if (confirm(`Are you sure you want to delete order ${order.invoiceNo}?`)) {
            deleteOrder(order.id);
        }
    };

    const handleDownloadImage = (imageUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(t('ছবি ডাউনলোড শুরু হয়েছে', 'Image download started!'));
    };

    const renderCustomDetails = (item: any, invoiceNo: string) => {
        const isCustom = item.sketchType || item.craftType || item.customIdea || (item.customNote && item.customNote.startsWith('{'));

        if (!isCustom) {
            return item.customNote ? <p className="text-sm italic text-gray-500 mt-1">{item.customNote}</p> : null;
        }

        // Try to parse legacy JSON if needed
        let details = { ...item };
        if (item.customNote && item.customNote.startsWith('{')) {
            try {
                const parsed = JSON.parse(item.customNote);
                details = { ...details, ...parsed };
            } catch (e) { /* ignore */ }
        }

        return (
            <div className="mt-4 bg-white rounded-xl border border-pink-100 shadow-sm overflow-hidden">
                {/* Header Section */}
                <div className="bg-pink-50 px-4 py-2 border-b border-pink-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#D91976]">
                        <PenTool size={16} />
                        <span className="font-bold uppercase text-[10px] tracking-wider">{t('কাস্টম রিকোয়েস্ট ডিটেইলস', 'Custom Request Details')}</span>
                    </div>
                    <div className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-pink-200 text-pink-600 font-bold uppercase">
                        {details.sketchType ? t('স্কেচ', 'Sketch') : t('ক্র্যাফট', 'Craft')}
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {/* Primary Grid: Size, Style, Frame, Finishing */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{t('ধরণ', 'Style / Type')}</p>
                            <p className="font-semibold text-gray-800 capitalize leading-tight">{details.sketchType || details.craftType || 'Custom'}</p>
                        </div>

                        {(details.sketchSize || details.craftSize || details.size) && (
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{t('সাইজ', 'Size / Dimensions')}</p>
                                <p className="font-semibold text-gray-800 leading-tight">{details.sketchSize || details.craftSize || details.size}</p>
                            </div>
                        )}

                        {(details.sketchFrame || details.frameOption) && (details.sketchType || details.sketchFrame) && (
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{t('ফ্রেম', 'Frame Selection')}</p>
                                <p className="font-semibold text-gray-800 leading-tight">{details.sketchFrame || details.frameOption}</p>
                            </div>
                        )}

                        {(details.craftFinishing) && (
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{t('ফিনিশিং', 'Finishing')}</p>
                                <p className="font-semibold text-gray-800 leading-tight">{details.craftFinishing}</p>
                            </div>
                        )}
                    </div>

                    {/* Secondary Details: Custom Text & Combo */}
                    {(details.customText || details.isCombo !== undefined) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                            {details.customText && (
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{t('কাস্টম লেখা', 'Text on Artwork')}</p>
                                    <p className="font-medium text-pink-700 italic">"{details.customText}"</p>
                                </div>
                            )}
                            {details.isCombo !== undefined && (
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{t('অর্ডার ধরণ', 'Combo Order')}</p>
                                    <p className="font-semibold text-gray-800">{details.isCombo ? t('হ্যাঁ (কম্বো)', 'Yes (Combo)') : t('না (সিঙ্গেল)', 'No (Single)')}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Idea Section */}
                    {(details.customIdea || details.idea) && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">{t('কাস্টমার আইডিয়া', 'Customer Idea')}</p>
                            <p className="text-gray-700 leading-relaxed text-xs whitespace-pre-wrap">{details.customIdea || details.idea}</p>
                        </div>
                    )}

                    {/* Photo List Section */}
                    <div className="pt-2 border-t border-gray-50">
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-2 tracking-widest">{t('ফটো লিস্ট / রেফারেন্স', 'Photo List / References')}</p>
                        <div className="flex flex-wrap gap-4">
                            {/* Main Reference Photo */}
                            {(details.customImage || (details.images && details.images[0])) && (
                                <div className="group relative">
                                    <img
                                        src={details.customImage || details.images[0]}
                                        alt="Reference"
                                        className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                                    />
                                    <button
                                        onClick={() => handleDownloadImage(details.customImage || details.images[0], `order-${invoiceNo}-ref-1.jpg`)}
                                        className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full shadow-lg text-[#D91976] hover:bg-[#D91976] hover:text-white transition-all transform scale-100 group-hover:scale-110"
                                        title={t('ডাউনলোড করুন', 'Download')}
                                    >
                                        <Download size={14} />
                                    </button>
                                </div>
                            )}

                            {/* Additional Reference Photo (Sketch specific) */}
                            {details.sketchReferenceImage && (
                                <div className="group relative">
                                    <img
                                        src={details.sketchReferenceImage}
                                        alt="Sample"
                                        className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                                    />
                                    <button
                                        onClick={() => handleDownloadImage(details.sketchReferenceImage, `order-${invoiceNo}-ref-2.jpg`)}
                                        className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full shadow-lg text-[#D91976] hover:bg-[#D91976] hover:text-white transition-all transform scale-100 group-hover:scale-110"
                                        title={t('ডাউনলোড করুন', 'Download')}
                                    >
                                        <Download size={14} />
                                    </button>
                                </div>
                            )}

                            {/* Additional images if any from legacy array */}
                            {details.images && details.images.length > 1 && details.images.slice(1).map((img: string, idx: number) => (
                                <div key={idx} className="group relative">
                                    <img
                                        src={img}
                                        alt={`Reference ${idx + 2}`}
                                        className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                                    />
                                    <button
                                        onClick={() => handleDownloadImage(img, `order-${invoiceNo}-ref-${idx + 3}.jpg`)}
                                        className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full shadow-lg text-[#D91976] hover:bg-[#D91976] hover:text-white transition-all transform scale-100 group-hover:scale-110"
                                        title={t('ডাউনলোড করুন', 'Download')}
                                    >
                                        <Download size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Internal Notes (Legacy/Fallback) */}
                    {details.customNote && !details.customNote.startsWith('{') && (
                        <div className="text-[10px] text-gray-400 italic bg-gray-50 p-2 rounded">
                            {t('অন্যান্য নোট:', 'Additional Note:')} {details.customNote}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8">{t('অর্ডার ম্যানেজমেন্ট', 'Order Management')}</h1>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                                <th className="p-4">{t('ইনভয়েস', 'Invoice')}</th>
                                <th className="p-4">{t('কাস্টমার', 'Customer')}</th>
                                <th className="p-4">{t('আইটেম', 'Items')}</th>
                                <th className="p-4">{t('মোট', 'Total')}</th>
                                <th className="p-4">{t('পেমেন্ট', 'Payment')}</th>
                                <th className="p-4">{t('স্ট্যাটাস', 'Status')}</th>
                                <th className="p-4 text-right min-w-[180px]">{t('অ্যাকশন', 'Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* Deduplicate orders to prevent key warnings */}
                            {Array.from(new Map(orders.map(item => [item.id, item])).values())
                                .map((order, idx) => (
                                    <tr key={order.id || `order-${idx}`} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-sm">{order.invoiceNo}</td>
                                        <td className="p-4 text-sm">
                                            <p className="font-bold">{order.userName}</p>
                                            <p className="text-gray-500">{order.userPhone}</p>
                                            {users.find(u => u.id === order.userId) && (
                                                <div className="mt-1 text-xs">
                                                    <span className="text-red-500 font-semibold bg-red-50 px-1 rounded">Fail: {users.find(u => u.id === order.userId)?.failedDeliveries || 0}</span>
                                                    <span className="text-orange-500 font-semibold bg-orange-50 px-1 rounded ml-1">Ret: {users.find(u => u.id === order.userId)?.returnedParcels || 0}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="space-y-1">
                                                {order.items.slice(0, 2).map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <span className="text-gray-500">{item.quantity}x</span>
                                                        <span className="truncate max-w-[150px]" title={item.title_en}>{item.title_en}</span>
                                                    </div>
                                                ))}
                                                {order.items.length > 2 && (
                                                    <p className="text-xs text-gray-400">+{order.items.length - 2} more</p>
                                                )}
                                                <button
                                                    onClick={() => openOrderDetails(order)}
                                                    className="text-[#D91976] text-xs hover:underline font-medium flex items-center gap-1 mt-1"
                                                >
                                                    <Eye size={12} /> {t('বিস্তারিত', 'View Details')}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-[#D91976]">৳{order.total}</td>
                                        <td className="p-4 text-sm">
                                            <p className="uppercase font-medium">{order.paymentMethod}</p>
                                            {['bkash', 'nagad', 'rocket'].includes(order.paymentMethod) && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Trx: {order.trxId || order.paymentTrxId || 'N/A'}
                                                    {order.paymentScreenshot && (
                                                        <div className="mt-1">
                                                            <a href={order.paymentScreenshot} target="_blank" rel="noreferrer" className="text-[#D91976] hover:underline">View Proof</a>
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2 mt-1">
                                                        {order.paymentStatus === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => verifyPayment(order.id, true)}
                                                                    className="text-pink-600 hover:underline"
                                                                >
                                                                    {t('যাচাই করুন', 'Verify')}
                                                                </button>
                                                                <button
                                                                    onClick={() => verifyPayment(order.id, false)}
                                                                    className="text-red-600 hover:underline"
                                                                >
                                                                    {t('বাতিল করুন', 'Reject')}
                                                                </button>
                                                            </>
                                                        )}
                                                        {order.paymentStatus !== 'pending' && (
                                                            <span className={`px-2 py-0.5 rounded ${order.paymentStatus === 'verified' ? 'bg-pink-100 text-pink-700' : 'bg-red-100 text-red-700'}`}>
                                                                {order.paymentStatus}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${order.status === 'delivered' ? 'bg-pink-100 text-pink-700' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'confirmed' ? 'bg-purple-100 text-purple-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                            {order.trackingCode && <p className="text-[10px] mt-1 text-gray-500">Trk: {order.trackingCode}</p>}
                                        </td>
                                        <td className="p-4 min-w-[180px]">
                                            <div className="flex items-center gap-2 justify-end">
                                                {(order.status === 'pending' || order.status === 'processing') && (order.paymentStatus === 'verified' || order.paymentMethod === 'cod') && (
                                                    <button
                                                        onClick={() => handleConfirmOrder(order)}
                                                        className="p-2 bg-pink-50 text-pink-600 rounded hover:bg-pink-100 shrink-0"
                                                        title="Confirm Order"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleBookSteadfast(order)}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 shrink-0"
                                                    title="Book Delivery"
                                                    disabled={order.status === 'shipped' || order.status === 'delivered'}
                                                >
                                                    <Truck size={16} />
                                                </button>
                                                <button
                                                    onClick={() => printLabel(order)}
                                                    className="p-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 shrink-0"
                                                    title="Print Label"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOrder(order)}
                                                    className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 shrink-0"
                                                    title="Delete Order"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                {/* Cancel Button */}
                                                {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order)}
                                                        className="p-2 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 shrink-0"
                                                        title="Cancel Order"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                {orders.length === 0 && <div className="p-8 text-center text-gray-500">{t('কোনো অর্ডার পাওয়া যায়নি', 'No orders found.')}</div>}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-xl font-bold">{t('অর্ডার বিস্তারিত:', 'Order Details:')} {selectedOrder.invoiceNo}</h3>
                            <button onClick={() => setSelectedOrder(null)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Customer</p>
                                    <p className="font-bold">{selectedOrder.userName}</p>
                                    <p>{selectedOrder.userPhone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{t('ঠিকানা', 'Address')}</p>
                                    <p className="font-medium">{selectedOrder.shippingAddress.details}</p>
                                    <p>{selectedOrder.shippingAddress.upazila}, {selectedOrder.shippingAddress.district}</p>
                                </div>
                            </div>

                            {/* Fraud Protection / Consignee Confirmation */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h4 className="font-bold text-blue-800 mb-2">{t('কনসাইনি কনফার্মেশন', 'Consignee Confirmation')}</h4>
                                <div className="flex items-center gap-3 mb-2">
                                    <input
                                        type="checkbox"
                                        id="consigneeConfirmed"
                                        checked={isConfirmed}
                                        onChange={(e) => setIsConfirmed(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="consigneeConfirmed" className="text-sm font-medium text-blue-900">
                                        {t('কাস্টমার কনফার্ম করা হয়েছে', 'Customer Confirmed')}
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={consigneeNote}
                                        onChange={(e) => setConsigneeNote(e.target.value)}
                                        placeholder={t('নোট লিখুন...', 'Add validation note...')}
                                        className="flex-1 px-3 py-2 border border-blue-200 rounded text-sm focus:outline-none focus:border-blue-400"
                                    />
                                    <button
                                        onClick={handleSaveConsigneeInfo}
                                        className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                    >
                                        {t('সেভ', 'Save')}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold mb-3 border-b pb-2">Items</h4>
                                <div className="space-y-4">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="border rounded-lg p-4">
                                            <div className="flex gap-4">
                                                <img src={item.images[0]} alt="" className="w-16 h-16 object-cover rounded bg-gray-100" />
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-gray-900">{item.title_en}</h5>
                                                    <p className="text-sm text-gray-500">{item.quantity} x ৳{item.price}</p>
                                                    {renderCustomDetails(item, selectedOrder.invoiceNo)}
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">৳{item.price * item.quantity}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="pt-4 border-t space-y-2">
                                {(() => {
                                    // Calculate price breakdown
                                    const originalTotal = selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                    const discountedSubtotal = selectedOrder.items.reduce((sum, item) => sum + ((item.discount_price || item.price) * item.quantity), 0);
                                    const productDiscount = originalTotal - discountedSubtotal;

                                    // Calculate voucher discount from difference if not stored
                                    let voucherDiscount = selectedOrder.voucherDiscount || 0;
                                    if (voucherDiscount === 0) {
                                        const expectedTotal = discountedSubtotal + selectedOrder.deliveryFee;
                                        const actualVoucherDiscount = expectedTotal - selectedOrder.total;
                                        if (actualVoucherDiscount > 0) {
                                            voucherDiscount = actualVoucherDiscount;
                                        }
                                    }

                                    return (
                                        <>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Original Price:</span>
                                                <span className={productDiscount > 0 ? 'line-through text-gray-400' : ''}>৳{originalTotal.toLocaleString()}</span>
                                            </div>
                                            {productDiscount > 0 && (
                                                <div className="flex justify-between text-sm text-green-600">
                                                    <span>Product Discount:</span>
                                                    <span>-৳{productDiscount.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Subtotal:</span>
                                                <span>৳{discountedSubtotal.toLocaleString()}</span>
                                            </div>
                                            {voucherDiscount > 0 && (
                                                <div className="flex justify-between text-sm text-pink-600">
                                                    <span>Voucher Discount{selectedOrder.voucherCode ? ` (${selectedOrder.voucherCode})` : ''}:</span>
                                                    <span>-৳{voucherDiscount.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Delivery Fee:</span>
                                                <span>৳{selectedOrder.deliveryFee.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t mt-2">
                                                <span className="font-bold text-lg">Grand Total:</span>
                                                <span className="font-bold text-xl text-[#D91976]">৳{selectedOrder.total.toLocaleString()}</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 border rounded hover:bg-gray-100">{t('বন্ধ করুন', 'Close')}</button>
                            <button onClick={() => printLabel(selectedOrder)} className="px-4 py-2 bg-[#D91976] text-white rounded hover:bg-[#A8145A]">{t('ইনভয়েস প্রিন্ট করুন', 'Print Invoice')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Steadfast Booking Modal */}
            {isSteadfastModalOpen && steadfastOrder && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80" onClick={() => setSteadfastModalOpen(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold">Book with Steadfast</h3>
                            <button onClick={() => setSteadfastModalOpen(false)}><X size={24} className="text-gray-400" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Invoice</label>
                                <input type="text" value={steadfastOrder.invoiceNo} disabled className="w-full p-2 border rounded bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">COD Amount</label>
                                <input type="text" value={steadfastOrder.paymentMethod === 'cod' ? steadfastOrder.total : 0} disabled className="w-full p-2 border rounded bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Note</label>
                                <input type="text" value={steadfastNote} onChange={e => setSteadfastNote(e.target.value)} className="w-full p-2 border rounded" />
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <button onClick={() => setSteadfastModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                                <button onClick={confirmSteadfastBooking} className="px-4 py-2 bg-[#D91976] text-white rounded hover:bg-pink-800">Confirm Booking</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};