import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useStore } from '@/app/context/StoreContext';
import { CheckCircle, Package, Truck, MessageCircle, ArrowRight } from 'lucide-react';

export const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { orders, t, language } = useStore();

  const invoiceNo = searchParams.get('invoice');
  const order = orders.find(o => o.invoiceNo === invoiceNo);

  useEffect(() => {
    // If no invoice parameter or order not found, redirect to home
    if (!invoiceNo || !order) {
      navigate('/');
    }
  }, [invoiceNo, order, navigate]);

  if (!order) {
    return null;
  }

  const steps = [
    {
      icon: <CheckCircle className="text-pink-500" size={24} />,
      title_bn: 'অর্ডার নিশ্চিত',
      title_en: 'Order Confirmed',
      desc_bn: 'আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে',
      desc_en: 'Your order has been received successfully',
      active: true
    },
    {
      icon: <Package className="text-gray-400" size={24} />,
      title_bn: 'প্যাকেজিং',
      title_en: 'Packaging',
      desc_bn: 'আমরা আপনার পণ্য প্যাকেজ করছি',
      desc_en: 'We are packaging your products',
      active: false
    },
    {
      icon: <Truck className="text-gray-400" size={24} />,
      title_bn: 'ডেলিভারি',
      title_en: 'Delivery',
      desc_bn: 'শীঘ্রই আপনার কাছে পৌঁছে যাবে',
      desc_en: 'Will be delivered to you soon',
      active: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-500 rounded-full mb-6 shadow-lg shadow-pink-200">
            <CheckCircle className="text-white" size={48} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {t('অর্ডার সফল হয়েছে!', 'Order Successful!')}
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            {t('আপনার অর্ডার নম্বর', 'Your Order Number')}
          </p>
          <div className="inline-flex items-center gap-2 bg-[#D91976] text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg">
            {order.invoiceNo}
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            {t('অর্ডার প্রসেসিং', 'Order Processing')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className={`flex flex-col items-center text-center transition-all duration-300 ${step.active ? 'scale-105' : ''}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all ${step.active ? 'bg-pink-100 ring-4 ring-pink-200' : 'bg-gray-100'}`}>
                    {step.icon}
                  </div>
                  <h3 className={`font-bold mb-1 ${step.active ? 'text-pink-600' : 'text-gray-500'}`}>
                    {language === 'bn' ? step.title_bn : step.title_en}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {language === 'bn' ? step.desc_bn : step.desc_en}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 -ml-[50%]">
                    <div className={`h-full bg-pink-500 transition-all duration-500 ${step.active ? 'w-0' : 'w-0'}`}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-in fade-in slide-in-from-bottom-12 duration-900">
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-3">
            {t('অর্ডার বিস্তারিত', 'Order Details')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('গ্রাহকের নাম', 'Customer Name')}</p>
              <p className="font-bold text-gray-800">{order.userName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('ফোন নম্বর', 'Phone Number')}</p>
              <p className="font-bold text-gray-800">{order.userPhone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('পেমেন্ট মেথড', 'Payment Method')}</p>
              <p className="font-bold text-gray-800 uppercase">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('ডেলিভারি ঠিকানা', 'Delivery Address')}</p>
              <p className="font-bold text-gray-800">
                {order.shippingAddress.details}, {order.shippingAddress.upazila}, {order.shippingAddress.district}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold mb-3 text-gray-800">{t('পণ্যসমূহ', 'Items')}</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                  <img src={item.images[0]} alt="" className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{language === 'bn' ? item.title_bn : item.title_en}</p>
                    <p className="text-sm text-gray-500">{t('পরিমাণ', 'Quantity')}: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#D91976]">৳{((item.discount_price || item.price) * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>{t('সাবটোটাল', 'Subtotal')}</span>
              <span>৳{(order.total - order.deliveryFee).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t('ডেলিভারি চার্জ', 'Delivery Fee')}</span>
              <span>৳{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
              <span>{t('মোট', 'Total')}</span>
              <span className="text-[#D91976]">৳{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
          <button
            onClick={() => navigate('/account/orders')}
            className="flex items-center justify-center gap-2 bg-[#D91976] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#A8145A] transition shadow-lg hover:shadow-xl"
          >
            <Package size={20} />
            {t('আমার অর্ডার', 'My Orders')}
          </button>

          <button
            onClick={() => navigate('/account/messages')}
            className="flex items-center justify-center gap-2 bg-white border-2 border-[#D91976] text-[#D91976] px-6 py-4 rounded-xl font-bold hover:bg-pink-50 transition shadow-lg hover:shadow-xl"
          >
            <MessageCircle size={20} />
            {t('সহায়তা', 'Support')}
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-200 transition shadow-lg hover:shadow-xl"
          >
            {t('হোম পেইজ', 'Home Page')}
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center animate-in fade-in duration-1000">
          <p className="text-blue-800 font-medium mb-2">
            {t('আপনার অর্ডার কনফার্মেশন SMS পাঠানো হয়েছে', '📱 Order confirmation SMS has been sent')}
          </p>
          <p className="text-sm text-blue-600">
            {t('আরও তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন', 'Contact us for more information')}
          </p>
        </div>
      </div>
    </div>
  );
};