import { useState } from 'react';
import { useStore, Order } from '@/app/context/StoreContext';
import { X, Eye, Trash2, CheckCircle, Package, Download } from 'lucide-react';
import { toast } from 'sonner';

export const AdminCustomCrafts = () => {
    const { orders, deleteOrder, updateOrderTotal } = useStore();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [priceInput, setPriceInput] = useState<{ [key: string]: string }>({});

    // Filter orders for Custom Craft
    const craftOrders = orders.filter(order =>
        order.items.some(item =>
            item.price === 0 ||
            item.category === 'Custom' ||
            item.id === 'custom-craft-service' ||
            item.craftType ||
            item.customNote?.includes('Custom Craft')
        )
    );

    const handleDeleteOrder = (order: Order) => {
        if (confirm(`Are you sure you want to delete order ${order.invoiceNo}?`)) {
            deleteOrder(order.id);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const colors: any = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-purple-100 text-purple-800',
            'shipped': 'bg-blue-100 text-blue-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'refund-requested': 'bg-orange-100 text-orange-800',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${colors[status] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    };

    const handlePriceSubmit = (order: Order) => {
        const price = parseInt(priceInput[order.id]);
        if (!price || price <= 0) {
            toast.error('Please enter a valid price');
            return;
        }
        updateOrderTotal(order.id, price);
        toast.success('Price set and user notified!');
        setPriceInput({ ...priceInput, [order.id]: '' });
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
        return (
            <div className="mt-4 bg-white rounded-xl border border-pink-100 shadow-sm overflow-hidden">
                <div className="bg-pink-50 px-4 py-2 border-b border-pink-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#D91976]">
                        <Package size={16} />
                        <span className="font-bold uppercase text-[10px] tracking-wider">Custom Request Details</span>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Style / Type</p>
                            <p className="font-semibold text-gray-800 capitalize leading-tight">{item.craftType || 'Custom'}</p>
                        </div>
                        {item.craftSize && (
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Size / Dimensions</p>
                                <p className="font-semibold text-gray-800 leading-tight">{item.craftSize}</p>
                            </div>
                        )}
                        {item.craftFinishing && (
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Finishing</p>
                                <p className="font-semibold text-gray-800 leading-tight">{item.craftFinishing}</p>
                            </div>
                        )}
                        <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Quantity</p>
                            <p className="font-semibold text-gray-800 leading-tight">{item.quantity} pcs</p>
                        </div>
                    </div>

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

                    {item.customImage && (
                        <div className="pt-2 border-t border-gray-50">
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-2 tracking-widest">Photo List / References</p>
                            <div className="group relative w-48">
                                <img
                                    src={item.customImage}
                                    alt="Reference"
                                    className="w-48 h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                                />
                                <button
                                    onClick={() => handleDownloadImage(item.customImage, `craft-${invoiceNo}-ref.jpg`)}
                                    className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full shadow-lg text-[#D91976] hover:bg-[#D91976] hover:text-white transition-all transform scale-100 group-hover:scale-110"
                                >
                                    <Download size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#D91976] rounded-full flex items-center justify-center">
                        <Package className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">কাস্টম ক্রাফট অর্ডার</h1>
                        <p className="text-sm text-gray-500">Custom Craft Orders Management</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 text-gray-600 text-sm">
                        <tr>
                            <th className="p-4">Invoice</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Craft Details</th>
                            <th className="p-4">Price Status</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {craftOrders.map(order => {
                            const isPricePending = order.total === 0;

                            return (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 font-bold text-gray-700">{order.invoiceNo}</td>
                                    <td className="p-4 text-sm">
                                        <p className="font-bold">{order.userName}</p>
                                        <p className="text-gray-500">{order.userPhone}</p>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <div className="space-y-3">
                                            {order.items.map((item, idx) => (
                                                (item.price === 0 || item.category === 'Custom' || item.craftType) && (
                                                    <div key={idx} className="flex flex-col gap-1 border-b border-gray-50 last:border-0 pb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-[#D91976] capitalize text-xs">{item.craftType || 'Custom'}</span>
                                                            <span className="text-[10px] bg-pink-50 text-pink-700 px-1.5 rounded-full font-medium">{item.craftFinishing || 'Standard'}</span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 font-medium">Size: {item.craftSize || 'Standard'}</p>
                                                        {item.customIdea && (
                                                            <p className="text-[10px] italic text-gray-400 line-clamp-1">Idea: {item.customIdea}</p>
                                                        )}
                                                        <button
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="text-[10px] text-[#D91976] font-bold hover:underline flex items-center gap-1 w-fit mt-1"
                                                        >
                                                            <Eye size={10} /> View All Details
                                                        </button>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {isPricePending ? (
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1.5 text-gray-400 font-bold text-xs">৳</span>
                                                    <input
                                                        type="number"
                                                        placeholder="Set Price"
                                                        value={priceInput[order.id] || ''}
                                                        onChange={(e) => setPriceInput({ ...priceInput, [order.id]: e.target.value })}
                                                        className="w-24 pl-5 p-1 text-sm border rounded focus:border-[#D91976] outline-none"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handlePriceSubmit(order)}
                                                    className="bg-[#D91976] text-white p-1.5 rounded hover:bg-pink-800"
                                                >
                                                    <CheckCircle size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="font-bold text-[#D91976]">৳{order.total}</div>
                                        )}
                                    </td>
                                    <td className="p-4"><StatusBadge status={order.status} /></td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {(order.status === 'pending' || order.status === 'processing') && (order.paymentStatus === 'verified' || order.paymentMethod === 'cod') && (
                                                <button
                                                    onClick={() => useStore().confirmOrder(order.id)}
                                                    className="p-2 text-purple-600 bg-purple-50 rounded hover:bg-purple-100 transition-colors"
                                                    title="Confirm Order"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                            <button onClick={() => setSelectedOrder(order)} className="p-2 text-[#D91976] bg-pink-50 rounded hover:bg-pink-100 transition-colors">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteOrder(order)} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {craftOrders.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-400">
                                    {orders.length === 0 ? 'No orders found in system.' : 'No custom craft requests found.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b flex justify-between items-center bg-pink-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 leading-tight">Request Details: {selectedOrder.invoiceNo}</h3>
                                <p className="text-sm text-gray-500 mt-1">Customer: {selectedOrder.userName} ({selectedOrder.userPhone})</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {selectedOrder.items.map((item, i) => (
                                (item.craftType || item.id === 'custom-craft-service') && (
                                    <div key={i} className="mb-6 last:mb-0">
                                        {renderCustomDetails(item, selectedOrder.invoiceNo)}
                                    </div>
                                )
                            ))}
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex justify-end">
                            <button onClick={() => setSelectedOrder(null)} className="px-6 py-2 bg-[#D91976] text-white rounded-xl font-bold hover:bg-pink-800 transition-all shadow-lg shadow-pink-200">
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
