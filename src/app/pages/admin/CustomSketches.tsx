import { useState } from 'react';
import { useStore, Order, SketchPricing } from '@/app/context/StoreContext';
import { X, Truck, Printer, Eye, Trash2, CheckCircle, PenTool, Download, Settings, Save } from 'lucide-react';
import { toast } from 'sonner';
import { downloadAdminPackingSlip } from '@/app/utils/invoiceGenerator';

export const AdminCustomSketches = () => {
    const { orders, updateOrderStatus, deleteOrder, confirmOrder, sketchPricing, updateSketchPricing, verifyPayment } = useStore();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isEditingPrices, setIsEditingPrices] = useState(false);
    const [editingPricing, setEditingPricing] = useState<SketchPricing>(sketchPricing);

    const handlePriceChange = (size: keyof SketchPricing, field: keyof SketchPricing['A4'], value: string) => {
        setEditingPricing(prev => ({
            ...prev,
            [size]: {
                ...prev[size],
                [field]: parseInt(value) || 0
            }
        }));
    };

    const handleSavePrices = () => {
        updateSketchPricing(editingPricing);
        setIsEditingPrices(false);
    };

    // Filter orders that contain custom sketch items
    const customSketchOrders = orders.filter(order =>
        order.items.some(item => item.sketchType || item.id === 'custom-sketch-service')
    );

    const handleBookSteadfast = (order: Order) => {
        if (order.status === 'pending' || order.paymentStatus === 'failed') {
            toast.error('Please confirm order first!');
            return;
        }
        if (order.status !== 'confirmed' && order.status !== 'processing') {
            toast.error('Order must be confirmed before shipping!');
            return;
        }
        const tracking = 'SF' + Math.floor(100000 + Math.random() * 900000);
        updateOrderStatus(order.id, 'shipped', tracking);
        toast.success(`Booked with Steadfast! Tracking: ${tracking}`);
    };

    const printLabel = (order: Order) => {
        downloadAdminPackingSlip(order);
    };

    const handleConfirmOrder = (order: Order) => {
        confirmOrder(order.id);
        toast.success('Order confirmed!');
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
        toast.success('Image download started!');
    };

    const renderCustomDetails = (item: any, invoiceNo: string) => {
        if (item.sketchType || item.id === 'custom-sketch-service') {
            return (
                <div className="mt-4 bg-white rounded-xl border border-pink-100 shadow-sm overflow-hidden">
                    <div className="bg-pink-50 px-4 py-2 border-b border-pink-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#D91976]">
                            <PenTool size={16} />
                            <span className="font-bold uppercase text-[10px] tracking-wider">Custom Sketch Details</span>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Style / Type</p>
                                <p className="font-semibold text-gray-800 capitalize leading-tight">{item.sketchType || 'Custom'}</p>
                            </div>
                            {item.sketchSize && (
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Size / Dimensions</p>
                                    <p className="font-semibold text-gray-800 leading-tight">{item.sketchSize}</p>
                                </div>
                            )}
                            {item.sketchFrame && (
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Frame Selection</p>
                                    <p className="font-semibold text-gray-800 leading-tight">{item.sketchFrame}</p>
                                </div>
                            )}
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Combo Order</p>
                                <p className="font-semibold text-gray-800 leading-tight">{item.isCombo ? 'Yes (Combo)' : 'No (Single)'}</p>
                            </div>
                        </div>

                        {item.customDimensions && (
                            <div className="pt-2 border-t border-gray-50">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Custom Dimensions</p>
                                <p className="font-semibold text-gray-800">{item.customDimensions.width}x{item.customDimensions.height} cm</p>
                            </div>
                        )}

                        {item.customText && (
                            <div className="pt-2 border-t border-gray-50">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Text on Artwork</p>
                                <p className="font-medium text-pink-700 italic">"{item.customText}"</p>
                            </div>
                        )}

                        {item.customIdea && (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Customer Idea</p>
                                <p className="text-gray-700 leading-relaxed text-xs whitespace-pre-wrap">{item.customIdea}</p>
                            </div>
                        )}

                        <div className="pt-2 border-t border-gray-50">
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-2 tracking-widest">Photo List / References</p>
                            <div className="flex flex-wrap gap-4">
                                {item.customImage && (
                                    <div className="group relative">
                                        <img
                                            src={item.customImage}
                                            alt="Uploaded"
                                            className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                                        />
                                        <button
                                            onClick={() => handleDownloadImage(item.customImage, `sketch-${invoiceNo}-ref-1.jpg`)}
                                            className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full shadow-lg text-[#D91976] hover:bg-[#D91976] hover:text-white transition-all transform scale-100 group-hover:scale-110"
                                            title="Download"
                                        >
                                            <Download size={14} />
                                        </button>
                                    </div>
                                )}
                                {item.sketchReferenceImage && (
                                    <div className="group relative">
                                        <img
                                            src={item.sketchReferenceImage}
                                            alt="Sample"
                                            className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                                        />
                                        <button
                                            onClick={() => handleDownloadImage(item.sketchReferenceImage, `sketch-${invoiceNo}-ref-2.jpg`)}
                                            className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full shadow-lg text-[#D91976] hover:bg-[#D91976] hover:text-white transition-all transform scale-100 group-hover:scale-110"
                                            title="Download"
                                        >
                                            <Download size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return item.customNote ? <p className="text-sm italic text-gray-500 mt-1">{item.customNote}</p> : null;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#D91976] rounded-full flex items-center justify-center">
                        <PenTool className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">কাস্টম স্কেচ অর্ডার</h1>
                        <p className="text-sm text-gray-500">Custom Sketch Orders Management</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditingPrices(!isEditingPrices)}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-[#D91976] rounded-lg border border-pink-100 hover:bg-pink-100 transition font-medium"
                >
                    <Settings size={18} />
                    {isEditingPrices ? 'Cancel Editing' : 'Manage Prices'}
                </button>
            </div>

            {isEditingPrices && (
                <div className="mb-10 bg-white rounded-2xl shadow-xl border-2 border-pink-100 overflow-hidden animate-in slide-in-from-top duration-300">
                    <div className="bg-[#D91976] p-4 text-white flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Settings size={20} />
                            মূল্য তালিকা ম্যানেজমেন্ট (Price List)
                        </h2>
                        <button
                            onClick={handleSavePrices}
                            className="flex items-center gap-2 px-6 py-2 bg-white text-[#D91976] rounded-full font-bold hover:bg-pink-50 transition shadow-lg"
                        >
                            <Save size={18} />
                            Save Prices
                        </button>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {(['A5', 'A4', 'A3', 'A2'] as const).map((size) => (
                            <div key={size} className="space-y-4">
                                <h3 className="text-lg font-black text-gray-900 border-b-2 border-pink-100 pb-2 flex items-center justify-between">
                                    {size} Size
                                    <span className="text-xs bg-pink-100 text-[#D91976] px-2 py-0.5 rounded-full uppercase">Editable</span>
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">1pc (No Frame)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-400 font-bold">৳</span>
                                            <input
                                                type="number"
                                                value={editingPricing[size].onePieceNoFrame}
                                                onChange={(e) => handlePriceChange(size, 'onePieceNoFrame', e.target.value)}
                                                className="w-full pl-7 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D91976] font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">1pc (With Frame)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-400 font-bold">৳</span>
                                            <input
                                                type="number"
                                                value={editingPricing[size].onePieceWithFrame}
                                                onChange={(e) => handlePriceChange(size, 'onePieceWithFrame', e.target.value)}
                                                className="w-full pl-7 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D91976] font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-dashed border-gray-100 mt-2">
                                        <label className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block mb-1">2pcs Combo (No Frame)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-pink-400 font-bold">৳</span>
                                            <input
                                                type="number"
                                                value={editingPricing[size].twoPieceNoFrame}
                                                onChange={(e) => handlePriceChange(size, 'twoPieceNoFrame', e.target.value)}
                                                className="w-full pl-7 pr-4 py-2 bg-pink-50/30 border border-pink-100 rounded-lg focus:outline-none focus:border-[#D91976] font-bold text-pink-600"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block mb-1">2pcs Combo (With Frame)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-pink-400 font-bold">৳</span>
                                            <input
                                                type="number"
                                                value={editingPricing[size].twoPieceWithFrame}
                                                onChange={(e) => handlePriceChange(size, 'twoPieceWithFrame', e.target.value)}
                                                className="w-full pl-7 pr-4 py-2 bg-pink-50/30 border border-pink-100 rounded-lg focus:outline-none focus:border-[#D91976] font-bold text-pink-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {customSketchOrders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <PenTool size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No custom sketch orders found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                                <th className="p-4">Invoice</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Sketch Details</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Payment</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {customSketchOrders.map(order => {
                                const sketchItem = order.items.find(item => item.sketchType || item.id === 'custom-sketch-service');
                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-sm">{order.invoiceNo}</td>
                                        <td className="p-4 text-sm">
                                            <p className="font-bold">{order.userName}</p>
                                            <p className="text-gray-500">{order.userPhone}</p>
                                        </td>
                                        <td className="p-4 text-sm">
                                            {sketchItem && (
                                                <div className="space-y-1">
                                                    <p className="flex items-center gap-1 text-[#D91976] font-bold">
                                                        <PenTool size={14} />
                                                        {sketchItem.sketchType || 'Custom Sketch'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Size: {sketchItem.sketchSize}</p>
                                                    <p className="text-xs text-gray-500">Frame: {sketchItem.sketchFrame}</p>
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="text-[#D91976] text-xs hover:underline font-medium flex items-center gap-1 mt-1"
                                                    >
                                                        <Eye size={12} /> View Full Details
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 font-bold text-[#D91976]">৳{order.total}</td>
                                        <td className="p-4 text-sm">
                                            <p className="uppercase font-medium">{order.paymentMethod}</p>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {order.paymentTrxId}
                                                <div className="flex gap-2 mt-1">
                                                    {order.paymentStatus === 'pending' ? (
                                                        <>
                                                            <button onClick={() => verifyPayment(order.id, true)} className="text-pink-600">Verify</button>
                                                            <button onClick={() => verifyPayment(order.id, false)} className="text-red-600">Reject</button>
                                                        </>
                                                    ) : (
                                                        <span className={order.paymentStatus === 'verified' ? 'text-pink-600' : 'text-red-600'}>{order.paymentStatus}</span>
                                                    )}
                                                </div>
                                            </div>
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
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                {(order.status === 'pending' || order.status === 'processing') && (order.paymentStatus === 'verified' || order.paymentMethod === 'cod') && (
                                                    <button onClick={() => handleConfirmOrder(order)} className="p-2 text-purple-600 bg-purple-50 rounded hover:bg-purple-100" title="Confirm Order">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleBookSteadfast(order)} className="p-2"><Truck size={16} /></button>
                                                <button onClick={() => printLabel(order)} className="p-2"><Printer size={16} /></button>
                                                <button onClick={() => handleDeleteOrder(order)} className="p-2"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <div className="flex items-center gap-3">
                                <PenTool className="text-[#D91976]" size={24} />
                                <h3 className="text-xl font-bold">Order: {selectedOrder.invoiceNo}</h3>
                            </div>
                            <button onClick={() => setSelectedOrder(null)}><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Customer</p>
                                    <p className="font-bold">{selectedOrder.userName}</p>
                                    <p>{selectedOrder.userPhone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p>{selectedOrder.shippingAddress.details}</p>
                                </div>
                            </div>
                            <div>
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="border p-4 rounded-lg mb-4">
                                        <div className="flex justify-between">
                                            <h5 className="font-bold">{item.title_en}</h5>
                                            <p className="font-bold text-[#D91976]">৳{item.price * item.quantity}</p>
                                        </div>
                                        {renderCustomDetails(item, selectedOrder.invoiceNo)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};