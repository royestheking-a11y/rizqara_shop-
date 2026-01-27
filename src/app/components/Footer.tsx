import React from 'react';
import { Link } from 'react-router';
import { useStore } from '@/app/context/StoreContext';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Package, ArrowUp, CheckCircle, Truck, Clock } from 'lucide-react';

export const Footer = () => {
  const [trackingNumber, setTrackingNumber] = React.useState('');
  const [showTrackingModal, setShowTrackingModal] = React.useState(false);


  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Use try-catch to handle cases where context might not be available during hot reload
  let t: (bn: string, en: string) => string;
  let orders: any[] = [];
  try {
    const store = useStore();
    t = store.t;
    orders = store.orders;
  } catch (error) {
    // Fallback for when context is not available
    t = (_bn: string, en: string) => en;
  }

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setShowTrackingModal(true);
    }
  };

  const trackedOrder = orders.find(
    o => o.id === trackingNumber || o.invoiceNo === trackingNumber
  );

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold mb-4 font-serif">{t('রিজকারা শপ', 'RizQara Shop')}</h2>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
              {t('প্রিমিয়াম কোয়ালিটি, বিশ্বাসযোগ্য সেবা। আপনার লাইফস্টাইলের সঙ্গী।', 'Premium quality, trusted service. Partner of your lifestyle.')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-pink-500 transition"><Facebook size={20} /></a>
              <a href="#" className="hover:text-pink-500 transition"><Instagram size={20} /></a>
              <a href="#" className="hover:text-pink-500 transition"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('প্রয়োজনীয় লিংক', 'Quick Links')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white transition">{t('আমাদের সম্পর্কে', 'About Us')}</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">{t('যোগাযোগ', 'Contact')}</Link></li>
              <li><Link to="/blog" className="hover:text-white transition">{t('ব্লগ', 'Blog')}</Link></li>
              <li><Link to="/careers" className="hover:text-white transition">{t('ক্যারিয়ার', 'Careers')}</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('নীতিমালা', 'Policies')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/return-policy" className="hover:text-white transition">{t('রিটার্ন পলিসি', 'Return Policy')}</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition">{t('প্রাইভেসি পলিসি', 'Privacy Policy')}</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">{t('টার্মস ও কন্ডিশন', 'Terms & Conditions')}</Link></li>
              <li><Link to="/delivery-info" className="hover:text-white transition">{t('ডেলিভারি তথ্য', 'Delivery Info')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('যোগাযোগ', 'Contact Us')}</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0" />
                <span>House 12, Road 5, Dhanmondi, Dhaka-1209</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} />
                <span>+880 1700 000000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} />
                <span>support@rizqara.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Track Order Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="max-w-xl mx-auto">

            <form onSubmit={handleTrackOrder} className="flex gap-3">
              <input
                type="text"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                placeholder={t('ইনভয়েস নম্বর দিন', 'Enter invoice number')}
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#D91976]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#D91976] text-white font-bold rounded-lg hover:bg-pink-700 transition"
              >
                {t('ট্র্যাক করুন', 'Track')}
              </button>
            </form>
          </div>
        </div>

        {/* Trust Badges & Payment Section */}
        <div className="border-t border-gray-800 mt-12 pt-12 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">

            {/* Payment Methods */}
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-6 font-serif">
                {t('আসন্ন পেমেন্ট মেথড', 'Incoming Payment Methods')}
              </h4>
              <div className="grid grid-cols-4 gap-3 max-w-[320px]">
                {[
                  { name: 'COD', img: 'https://cdn-icons-png.flaticon.com/512/1554/1554401.png', label: 'Cash on Delivery' },
                  { name: 'Visa', img: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg', label: 'Visa' },
                  { name: 'Mastercard', img: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg', label: 'Mastercard' },
                  { name: 'AMEX', img: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg', label: 'American Express' },
                  { name: 'EMI', img: 'https://cdn-icons-png.flaticon.com/512/825/825590.png', label: 'Easy Monthly Installments' },
                  { name: 'bKash', text: 'bKash', color: '#D12053' },
                  { name: 'Nagad', text: 'Nagad', color: '#F7941D' },
                  { name: 'Rocket', text: 'Rocket', color: '#8C3494' },
                ].map((pm) => (
                  <div key={pm.name} className="h-10 bg-white rounded flex items-center justify-center overflow-hidden transition duration-300 hover:scale-105">
                    {pm.img ? (
                      <img src={pm.img} alt={pm.name} className="h-6 w-auto object-contain" />
                    ) : (
                      <span className="font-bold text-xs tracking-tight" style={{ color: pm.color }}>{pm.text}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Verified by */}
            <div className="md:w-1/4">
              <h4 className="text-xl font-bold text-white mb-6 font-serif">
                {t('ভেরিফাইড বাই', 'Verified by')}
              </h4>
              <div className="h-14 w-auto flex items-center justify-center md:justify-start gap-4">
                <img
                  src="/e-cab-logo.png"
                  alt="E-CAB Member"
                  className="h-full object-contain bg-white rounded-md p-1 opacity-90 hover:opacity-100 transition"
                />
              </div>
            </div>

            {/* DBID Section */}
            <div className="md:w-1/4">
              <h4 className="text-xl font-bold text-white mb-6 font-serif">
                {t('ই-টিন আইডি', 'E-TIN ID')}
              </h4>
              <div className="text-gray-400">
                <p className="text-sm font-medium tracking-wide mb-1">{t('ই-টিন আইডি:', 'E-TIN ID:')}</p>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-white tracking-widest font-mono">{t('৩০৪৯০৩০৯৪', '304903094')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 order-2 md:order-1">&copy; {new Date().getFullYear()} RizQara Shop. All rights reserved.</p>

          <button
            onClick={scrollToTop}
            className="group relative px-6 py-3 rounded-full bg-gradient-to-r from-[#D91976] to-[#6B0F41] text-white shadow-xl hover:shadow-2xl hover:shadow-pink-500/30 transition-all duration-500 transform hover:-translate-y-1 border border-white/10 flex items-center gap-2 font-medium overflow-hidden order-1 md:order-2"
            aria-label="Scroll to top"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-full" />
            <span className="relative z-10 text-sm tracking-wide font-bold">{t('উপরে যান', 'Back to Top')}</span>
            <ArrowUp size={18} className="relative z-10 group-hover:-translate-y-1 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Tracking Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-500 animate-in fade-in" onClick={() => setShowTrackingModal(false)}>
          <div className="bg-white rounded-[2rem] max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 transform-gpu" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#D91976] to-[#6B0F41] p-8 text-white relative">
              <button
                onClick={() => setShowTrackingModal(false)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white text-xl"
              >
                ×
              </button>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                  <Package size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    {t('অর্ডার ট্র্যাকিং', 'Order Tracking')}
                  </h3>
                  <p className="text-white/70 text-sm font-medium">
                    {trackedOrder ? `${t('ইনভয়েস নং:', 'Invoice No:')} ${trackedOrder.invoiceNo}` : t('অর্ডার তথ্য খুঁজা হচ্ছে', 'Searching for order')}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 max-h-[75vh] overflow-y-auto">
              {trackedOrder ? (
                <div className="space-y-10">
                  {/* Status Steps - Pro Horizontal UI (No Overlap) */}
                  <div className="relative py-12 px-2 border-b border-gray-100 bg-gray-50/50 rounded-3xl">
                    <div className="flex justify-between items-center relative gap-4">
                      {/* Full-width track line BEHIND items */}
                      <div className="absolute top-[22px] left-[10%] right-[10%] h-[3px] bg-gray-100 z-0 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-pink-500 transition-all duration-1000 ease-out"
                          style={{
                            width: `${Math.min(100, (['pending', 'confirmed', 'processing', 'shipped', 'delivered'].indexOf(trackedOrder.status) / 4) * 100)}%`
                          }}
                        />
                      </div>

                      {[
                        { status: ['pending', 'confirmed'], label: t('নিশ্চিত', 'Confirmed'), icon: <CheckCircle size={20} /> },
                        { status: ['processing'], label: t('প্যাকেজিং', 'Packaging'), icon: <Package size={20} /> },
                        { status: ['shipped'], label: t('রাস্তায় আছে', 'Shipped'), icon: <Truck size={20} /> },
                        { status: ['delivered'], label: t('ডেলিভারি', 'Delivered'), icon: <CheckCircle size={20} /> },
                      ].map((step, idx) => {
                        const allStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
                        const currentIndex = allStatuses.indexOf(trackedOrder.status);
                        const stepIndexes = step.status.map(s => allStatuses.indexOf(s));
                        const isActive = stepIndexes.some(i => i <= currentIndex);
                        const isCurrent = stepIndexes.includes(currentIndex);

                        return (
                          <div key={idx} className="relative z-10 flex flex-col items-center flex-1">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 mb-3 shadow-md border-4 ${isActive
                              ? 'bg-pink-500 text-white border-pink-100'
                              : 'bg-white text-gray-300 border-gray-100'
                              } ${isCurrent ? 'ring-4 ring-pink-100/50 scale-110' : ''}`}>
                              {step.icon}
                            </div>
                            <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest text-center ${isActive ? 'text-pink-600' : 'text-gray-400'}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 max-w-xl mx-auto">
                    {/* History - Premium Vertical Timeline (Full Width) */}
                    <div className="space-y-8">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-black text-gray-900 flex items-center gap-3">
                          <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                            <Clock size={22} className="text-pink-600" />
                          </div>
                          {t('ট্র্যাকিং ইতিহাস', 'Tracking History')}
                        </h4>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                          {trackedOrder.trackingHistory?.length || 0} {t('আপডেট', 'Updates')}
                        </div>
                      </div>

                      <div className="space-y-0 px-2">
                        {trackedOrder.trackingHistory?.slice().reverse().map((history: any, idx: number, arr: any[]) => {
                          // Status Translation Library
                          const statusTranslations: Record<string, { bn: string, en: string }> = {
                            'pending': { bn: 'অপেক্ষমাণ', en: 'Pending' },
                            'Pending': { bn: 'অপেক্ষমাণ', en: 'Pending' },
                            'confirmed': { bn: 'নিশ্চিত', en: 'Confirmed' },
                            'Confirmed': { bn: 'নিশ্চিত', en: 'Confirmed' },
                            'processing': { bn: 'প্যাকেজিং', en: 'Packaging' },
                            'Processing': { bn: 'প্যাকেজিং', en: 'Packaging' },
                            'shipped': { bn: 'রাস্তায় আছে', en: 'Shipped' },
                            'Shipped': { bn: 'রাস্তায় আছে', en: 'Shipped' },
                            'delivered': { bn: 'ডেলিভারি সম্পন্ন', en: 'Delivered' },
                            'Delivered': { bn: 'ডেলিভারি সম্পন্ন', en: 'Delivered' },
                            'cancelled': { bn: 'বাতিল', en: 'Cancelled' },
                            'Cancelled': { bn: 'বাতিল', en: 'Cancelled' },
                            'Order placed': { bn: 'অর্ডার করা হয়েছে', en: 'Order placed' },
                            'Order confirmed': { bn: 'অর্ডার নিশ্চিত করা হয়েছে', en: 'Order confirmed' },
                            'Packaging started': { bn: 'প্যাকেজিং শুরু হয়েছে', en: 'Packaging started' },
                            'Pickup completed': { bn: 'পিকআপ সম্পন্ন', en: 'Pickup completed' },
                          };

                          const translation = statusTranslations[history.status] || { bn: history.status, en: history.status };
                          const displayStatus = t(translation.bn, translation.en);

                          return (
                            <div key={idx} className="flex gap-6 group">
                              <div className="flex flex-col items-center">
                                <div className={`w-5 h-5 rounded-full border-4 transition-all duration-500 scale-100 group-hover:scale-125 ${idx === 0
                                  ? 'bg-pink-500 border-pink-100 ring-8 ring-pink-50'
                                  : 'bg-white border-gray-200 group-hover:border-pink-200'
                                  }`} />
                                {idx !== arr.length - 1 && (
                                  <div className="w-1 grow bg-gray-100 my-2 rounded-full group-hover:bg-pink-100 transition-colors" />
                                )}
                              </div>
                              <div className="flex-1 pb-10">
                                <div className="flex flex-col mb-2">
                                  <span className={`text-base font-black uppercase tracking-tight ${idx === 0 ? 'text-pink-600' : 'text-gray-800'}`}>
                                    {displayStatus}
                                  </span>
                                  <span className="text-xs text-gray-400 font-bold tracking-wide">
                                    {new Date(history.date).toLocaleDateString()} at {new Date(history.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                {history.note && (
                                  <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-100 rounded-full" />
                                    <p className="text-sm text-gray-600 pl-4 py-1 leading-relaxed">
                                      {history.note}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="w-24 h-24 bg-gray-50 flex items-center justify-center rounded-ull mx-auto mb-6 text-gray-200 border-4 border-gray-50 animate-pulse">
                    <Package size={64} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {t('অর্ডার খুঁজে পাওয়া যায়নি', 'No order found')}
                  </h4>
                  <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
                    {t('অনুগ্রহ করে আপনার সঠিক ইনভয়েস নম্বর বা অর্ডার আইডি দিয়ে পুনরায় চেষ্টা করুন।', 'Please check your invoice number or order ID and try again.')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};