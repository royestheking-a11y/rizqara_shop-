import React from 'react';
import { useStore, CartItem } from '@/app/context/StoreContext';
import { Link, useNavigate } from 'react-router';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';

export const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity, t } = useStore();
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + (item.discount_price || item.price) * item.quantity, 0);
  const deliveryFee = 60; // Estimated
  const total = subtotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('আপনার কার্ট খালি', 'Your Cart is Empty')}</h2>
        <p className="text-gray-500 mb-8">{t('আপনি এখনও কোনো পণ্য যোগ করেননি।', 'You haven\'t added any products yet.')}</p>
        <Link to="/shop" className="inline-block px-8 py-3 bg-[#D91976] text-white rounded-lg hover:bg-[#A8145A] transition">
          {t('কেনাকাটা শুরু করুন', 'Start Shopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-serif font-bold mb-8">{t('শপিং কার্ট', 'Shopping Cart')} ({cart.length})</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
           {cart.map((item) => (
             <div key={item.cartId} className="bg-white p-4 rounded-xl border border-gray-100 flex gap-4 items-center">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.id}`} className="font-medium text-gray-900 truncate block hover:text-[#D91976]">
                        {t(item.title_bn, item.title_en)}
                    </Link>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    {item.customText && (
                        <p className="text-xs text-[#D91976] mt-1 bg-pink-50 inline-block px-2 py-0.5 rounded">
                            Custom: {item.customText}
                        </p>
                    )}
                    <div className="mt-2 font-bold text-gray-900">
                        ৳{item.discount_price || item.price}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                    <button 
                      onClick={() => removeFromCart(item.cartId)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                        <Trash2 size={18} />
                    </button>
                    
                    <div className="flex items-center border rounded-lg h-8">
                        <button 
                          onClick={() => updateCartQuantity(item.cartId, item.quantity - 1)}
                          className="px-2 h-full hover:bg-gray-100 border-r"
                        >
                            <Minus size={12} />
                        </button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.cartId, item.quantity + 1)}
                          className="px-2 h-full hover:bg-gray-100 border-l"
                        >
                            <Plus size={12} />
                        </button>
                    </div>
                </div>
             </div>
           ))}
        </div>

        {/* Summary */}
        <div className="lg:w-96 shrink-0">
            <div className="bg-white p-6 rounded-xl border border-gray-100 sticky top-24">
                <h3 className="font-bold text-lg mb-6">{t('অর্ডার সামারি', 'Order Summary')}</h3>
                
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>{t('সাবটোটাল', 'Subtotal')}</span>
                        <span>৳{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>{t('ডেলিভারি চার্জ (আনুমানিক)', 'Delivery (Est.)')}</span>
                        <span>৳{deliveryFee}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold text-lg">
                        <span>{t('সর্বমোট', 'Total')}</span>
                        <span className="text-[#D91976]">৳{total}</span>
                    </div>
                </div>

                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3.5 bg-[#D91976] text-white font-bold rounded-lg hover:bg-[#A8145A] transition shadow-lg shadow-pink-100 flex items-center justify-center gap-2"
                >
                    {t('চেকআউট করুন', 'Proceed to Checkout')}
                    <ArrowRight size={18} />
                </button>
                
                <p className="text-xs text-gray-400 text-center mt-4">
                   Secure Checkout powered by RizQara
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};