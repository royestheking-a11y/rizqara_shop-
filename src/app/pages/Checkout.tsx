import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useStore } from '@/app/context/StoreContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Truck, CreditCard, Banknote, Tag, X, ChevronDown, Check, MapPin, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BANGLADESH_LOCATIONS, LOW_CHARGE_DISTRICTS, LOW_DELIVERY_FEE, HIGH_DELIVERY_FEE } from '@/app/constants/locations';

type CheckoutForm = {
  name: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  address: string;
  note?: string;
};

export const Checkout = () => {
  const { cart, user, placeOrder, clearCart, t, language, applyVoucher } = useStore();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CheckoutForm>({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      division: user?.addresses?.[0]?.division || '',
      district: user?.addresses?.[0]?.district || '',
      upazila: user?.addresses?.[0]?.upazila || '',
      address: user?.addresses?.[0]?.details || ''
    }
  });

  const [paymentType, setPaymentType] = useState<'cod' | 'online'>('cod');
  const [onlineMethod, setOnlineMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [trxId, setTrxId] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const selectedDivision = watch('division');
  const selectedDistrict = watch('district');

  const handleSelectAddress = (address: any) => {
    setSelectedAddressId(address.id);
    setValue('name', user?.name || '');
    setValue('phone', user?.phone || '');
    setValue('division', address.division);
    setValue('district', address.district);
    setValue('upazila', address.upazila);
    setValue('address', address.details);
    toast.success('Address selected');
  };

  const handleNewAddress = () => {
    setSelectedAddressId('new');
    setValue('division', '');
    setValue('district', '');
    setValue('upazila', '');
    setValue('address', '');
  };

  // Fraud Protection: Check failed deliveries
  const isHighRiskUser = (user?.failedDeliveries || 0) >= 3;

  useEffect(() => {
    if (isHighRiskUser) {
      setPaymentType('online');
    }
  }, [isHighRiskUser]);

  const isQuoteRequest = cart.length > 0 && cart.every(item => item.price === 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.discount_price || item.price) * item.quantity, 0);

  // Dynamic Delivery Fee based on District
  const deliveryFee = isQuoteRequest ? 0 : (
    LOW_CHARGE_DISTRICTS.includes(selectedDistrict) ? LOW_DELIVERY_FEE : HIGH_DELIVERY_FEE
  );
  const voucherDiscount = appliedVoucher?.discount || 0;
  const total = subtotal + deliveryFee - voucherDiscount;

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      setVoucherError(t('ভাউচার কোড লিখুন', 'Enter voucher code'));
      return;
    }

    const result = applyVoucher(voucherCode, subtotal);

    if (result.error) {
      setVoucherError(result.error);
      setAppliedVoucher(null);
    } else {
      setAppliedVoucher({ code: voucherCode, discount: result.discount });
      setVoucherError('');
      toast.success(t('ভাউচার যুক্ত হয়েছে!', 'Voucher applied!'));
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherError('');
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: CheckoutForm) => {
    if (isSubmitting) return;

    if (!user) {
      toast.error(t('অর্ডার করতে লগইন বা রেজিস্ট্রেশন করুন', 'Please login or register to place order'));
      sessionStorage.setItem('returnPath', '/checkout');
      navigate('/login');
      return;
    }

    if (!isQuoteRequest && paymentType === 'online' && !trxId) {
      toast.error(t('অনুগ্রহ করে ট্রানজেকশন আইডি প্রদান করুন', 'Please provide Transaction ID'));
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = await placeOrder({
        userName: data.name,
        userPhone: data.phone,
        items: cart,
        total: total,
        paymentStatus: 'pending',
        paymentMethod: paymentType === 'cod' ? 'cod' : onlineMethod,
        paymentTrxId: trxId,
        deliveryFee: deliveryFee,
        voucherCode: appliedVoucher?.code,
        voucherDiscount: voucherDiscount,
        shippingAddress: {
          id: 'addr_' + Date.now(),
          division: data.division,
          district: data.district,
          upazila: data.upazila,
          details: data.address
        }
      });

      toast.success(language === 'bn' ? 'অর্ডার সফল হয়েছে! আপনার অর্ডার নম্বর: ' + orderId : 'Order placed successfully! Your order ID: ' + orderId);

      // Clear cart after successful checkout
      clearCart();

      // Navigate to order confirmation page
      setTimeout(() => {
        navigate(`/order-confirmation?invoice=${orderId}`);
      }, 1000);
    } catch (e) {
      console.error('Order placement error:', e);
      toast.error(t('কিছু সমস্যা হয়েছে', 'Something went wrong. Please try again.'));
      setIsSubmitting(false);
    }
  };

  // Redirect to cart if empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart.length, navigate]);

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-serif font-bold mb-8 text-center">{t('চেকআউট', 'Checkout')}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
        {/* Section 1: Delivery Info (Mobile: 1st, Desktop: Column 1-2, Row 1) */}
        <div className="order-1 lg:col-start-1 lg:col-span-2 lg:row-start-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Truck size={20} className="text-[#D91976]" />
              {t('ডেলিভারি তথ্য', 'Shipping Information')}
            </h2>

            {/* Saved Addresses Selection */}
            {user?.addresses && user.addresses.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">{t('সেভ করা ঠিকানা', 'Saved Addresses')}:</p>
                <div className="grid grid-cols-1 gap-3">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${selectedAddressId === addr.id ? 'border-[#D91976] bg-pink-50' : 'border-gray-200 hover:border-pink-200'}`}
                    >
                      <MapPin size={18} className={selectedAddressId === addr.id ? 'text-[#D91976]' : 'text-gray-400'} />
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-gray-900">{addr.details}</p>
                        <p className="text-gray-500 text-xs">{addr.upazila}, {addr.district}</p>
                      </div>
                      {selectedAddressId === addr.id && <Check size={16} className="text-[#D91976]" />}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleNewAddress}
                    className={`p-3 border border-dashed rounded-lg flex items-center justify-center gap-2 text-sm font-medium ${selectedAddressId === 'new' ? 'border-[#D91976] text-[#D91976] bg-pink-50' : 'border-gray-300 text-gray-500 hover:border-gray-400'}`}
                  >
                    <Plus size={16} />
                    {t('নতুন ঠিকানা ব্যবহার করুন', 'Use New Address')}
                  </button>
                </div>
                <div className="my-4 border-b border-gray-100"></div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('নাম', 'Name')}*</label>
                <input
                  {...register('name', { required: true })}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:border-[#D91976] outline-none transition-all"
                />
                {errors.name && <span className="text-red-500 text-xs">Required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('ফোন', 'Phone')}*</label>
                <input
                  {...register('phone', { required: true })}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:border-[#D91976] outline-none transition-all"
                />
                {errors.phone && <span className="text-red-500 text-xs">Required</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('বিভাগ', 'Division')}*</label>
                <select
                  {...register('division', { required: true })}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50 outline-none focus:border-[#D91976]"
                  onChange={(e) => {
                    setValue('division', e.target.value);
                    setValue('district', ''); // Reset district when division changes
                  }}
                >
                  <option value="">Select</option>
                  {Object.keys(BANGLADESH_LOCATIONS).map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('জেলা', 'District')}*</label>
                <select
                  {...register('district', { required: true })}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50 outline-none focus:border-[#D91976]"
                  disabled={!selectedDivision}
                >
                  <option value="">Select</option>
                  {selectedDivision && BANGLADESH_LOCATIONS[selectedDivision]?.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
                {errors.district && <span className="text-red-500 text-xs">Required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('উপজেলা/থানা', 'Upazila/Thana')}*</label>
                <input {...register('upazila', { required: true })} className="w-full border rounded-lg px-3 py-2 bg-gray-50 outline-none" />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">{t('বিস্তারিত ঠিকানা', 'Full Address')}*</label>
              <textarea
                {...register('address', { required: true })}
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:border-[#D91976] outline-none h-20 resize-none transition-all"
                placeholder="House no, Road no, Area..."
              ></textarea>
              {errors.address && <span className="text-red-500 text-xs">Required</span>}
            </div>
          </div>
        </div>

        {/* Section 2: Order Summary (Mobile: 2nd, Desktop: Column 3, Row 1 Sticky) */}
        <div className="order-2 lg:order-3 lg:col-start-3 lg:col-span-1 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Tag size={18} className="text-[#D91976]" />
              {t('অর্ডার বিস্তারিত', 'Order Details')}
            </h3>

            <div className="space-y-4 max-h-60 overflow-y-auto mb-6 custom-scrollbar pr-2">
              {cart.map(item => (
                <div key={item.cartId} className="flex gap-3 text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="w-14 h-14 bg-gray-100 rounded shrink-0 overflow-hidden">
                    <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{item.title_en}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.quantity} x ৳{item.discount_price || item.price}</p>
                  </div>
                  <div className="font-bold text-[#D91976]">
                    ৳{(item.discount_price || item.price) * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Voucher Section */}
            <div className="border-t pt-4 mb-6">
              {!appliedVoucher ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => {
                        setVoucherCode(e.target.value.toUpperCase());
                        setVoucherError('');
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyVoucher())}
                      placeholder={t('ভাউচার কোড', 'Voucher Code')}
                      className="flex-1 border rounded-lg px-3 py-2 text-sm uppercase focus:border-[#D91976] outline-none bg-gray-50 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      className="px-4 py-2 bg-[#D91976] text-white rounded-lg hover:bg-[#A8145A] transition shadow-md shadow-pink-100 text-sm font-bold"
                    >
                      {t('প্রয়োগ', 'Apply')}
                    </button>
                  </div>
                  {voucherError && <p className="text-xs text-red-600 ml-1">{voucherError}</p>}
                </div>
              ) : (
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                      <Tag size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-pink-800 uppercase tracking-wide">{appliedVoucher.code}</p>
                      <p className="text-xs text-pink-500 font-medium">-৳{appliedVoucher.discount} {t('ছাড়', 'discount')}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="p-1.5 hover:bg-white rounded-full transition text-pink-400 hover:text-pink-600"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            <div className="border-t pt-4 space-y-3 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>{t('সাবটোটাল', 'Subtotal')}</span>
                <span className="font-medium text-gray-900">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>{t('ডেলিভারি', 'Delivery')}</span>
                <span className="font-medium text-gray-900">৳{deliveryFee}</span>
              </div>
              {voucherDiscount > 0 && (
                <div className="flex justify-between items-center text-pink-600">
                  <span>{t('ভাউচার ছাড়', 'Voucher Discount')}</span>
                  <span className="font-bold">-৳{voucherDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold text-lg pt-3 border-t mt-3">
                <span className="text-gray-900">{t('মোট', 'Total')}</span>
                <span className="text-[#D91976]">৳{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Desktop Confirm Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`hidden lg:block w-full mt-6 py-4 font-bold rounded-xl transition shadow-lg text-lg uppercase tracking-wide ${isSubmitting
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-[#D91976] text-white hover:bg-[#A8145A] shadow-pink-200'
                }`}
            >
              {isSubmitting ? t('অপেক্ষা করুন...', 'Processing...') : (isQuoteRequest ? t('অনুরোধ পাঠান', 'Send Request') : t('অর্ডার কনফার্ম করুন', 'Confirm Order'))}
            </button>
          </div>
        </div>

        {/* Section 3: Payment Method (Mobile: 3rd, Desktop: Column 1-2, Row 2) */}
        <div className="order-3 lg:order-2 lg:col-start-1 lg:col-span-2 lg:row-start-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CreditCard size={20} className="text-[#D91976]" />
              {t('পেমেন্ট মেথড', 'Payment Method')}
            </h2>

            {isHighRiskUser && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {t('অতিরিক্ত ডেলিভারি ব্যর্থতার কারণে আপনার জন্য ক্যাশ অন ডেলিভারি বন্ধ করা হয়েছে। অনুগ্রহ করে অনলাইনে পেমেন্ট করুন।', 'Cash on Delivery is disabled for you due to excessive failed deliveries. Please pay online.')}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div
                onClick={() => !isHighRiskUser && setPaymentType('cod')}
                className={`cursor-pointer border-2 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 relative ${paymentType === 'cod' ? 'border-[#D91976] bg-pink-50/50 shadow-md' : 'border-gray-100 hover:border-gray-200'} ${isHighRiskUser ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${paymentType === 'cod' ? 'bg-[#D91976] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Banknote size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 leading-tight">{t('ক্যাশ অন ডেলিভারি', 'Cash on Delivery')}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('পণ্য হাতে পেয়ে টাকা দিন', 'Pay when you receive')}</p>
                </div>
                {paymentType === 'cod' && (
                  <div className="absolute top-3 right-3 text-[#D91976]">
                    <div className="bg-[#D91976] text-white rounded-full p-0.5">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  </div>
                )}
              </div>

              <div
                onClick={() => setPaymentType('online')}
                className={`cursor-pointer border-2 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 relative ${paymentType === 'online' ? 'border-[#D91976] bg-pink-50/50 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${paymentType === 'online' ? 'bg-[#D91976] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <CreditCard size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 leading-tight">{t('অনলাইন পেমেন্ট', 'Online Payment')}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('বিকাশ, নগদ বা রকেট', 'bKash, Nagad or Rocket')}</p>
                </div>
                {paymentType === 'online' && (
                  <div className="absolute top-3 right-3 text-[#D91976]">
                    <div className="bg-[#D91976] text-white rounded-full p-0.5">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <AnimatePresence>
              {paymentType === 'online' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="p-1.5 bg-gray-50 rounded-2xl flex gap-1.5 border border-gray-100">
                    {[
                      { id: 'bkash', name: 'bKash', color: 'bg-[#E2136E]', logo: '/Bkash.jpg' },
                      { id: 'nagad', name: 'Nagad', color: 'bg-[#F7941D]', logo: '/Nagad.jpg' },
                      { id: 'rocket', name: 'Rocket', color: 'bg-[#8C3494]', logo: '/Rocket.png' }
                    ].map(method => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setOnlineMethod(method.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all duration-300 font-bold text-sm ${onlineMethod === method.id
                          ? `${method.color} text-white shadow-lg shadow-${method.id}-200 scale-[1.02]`
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg overflow-hidden border border-white/20 bg-white`}>
                          <img src={method.logo} alt={method.name} className="w-full h-full object-cover" />
                        </div>
                        {method.name}
                      </button>
                    ))}
                  </div>

                  <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="text-center mb-6">
                      <p className="text-sm text-gray-500 mb-1">{t('নিচের নম্বরে টাকা পাঠান', 'Send Money to the number below')}</p>
                      <h3 className="text-2xl font-bold text-gray-900 tracking-wider">
                        {onlineMethod === 'bkash' && '01625691878'}
                        {onlineMethod === 'nagad' && '01625691878'}
                        {onlineMethod === 'rocket' && '01625691878'}
                      </h3>
                      <div className="inline-block mt-2 px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {t('পার্সোনাল নম্বর', 'Personal Number')}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">{t('ট্রানজেকশন আইডি', 'Transaction ID')}</label>
                        <div className="relative">
                          <input
                            value={trxId}
                            onChange={e => setTrxId(e.target.value.toUpperCase())}
                            placeholder="Example: 8N7A6S5D4"
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-[#D91976] focus:bg-white outline-none transition-all"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
                            <ChevronDown size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Confirm Button (Shown at the very end of left column content which is 3rd in mobile order) */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`lg:hidden w-full mt-6 py-4 font-bold rounded-xl transition shadow-lg text-lg uppercase tracking-wide ${isSubmitting
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-[#D91976] text-white hover:bg-[#A8145A] shadow-pink-200'
              }`}
          >
            {isSubmitting ? t('অপেক্ষা করুন...', 'Processing...') : (isQuoteRequest ? t('অনুরোধ পাঠান', 'Send Request') : t('অর্ডার কনফার্ম করুন', 'Confirm Order'))}
          </button>
        </div>
      </form>
    </div>
  );
};