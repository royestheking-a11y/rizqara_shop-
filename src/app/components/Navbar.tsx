import { useState } from 'react';
import { useStore } from '@/app/context/StoreContext';
import { Link, useNavigate, useLocation } from 'react-router';
import { ShoppingCart, User as UserIcon, Heart, Menu, X, Bell, Home, Palette, Gift, Frame, PenTool, Tag, Star, ShoppingBag, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Notifications } from './Notifications';
import { SearchBar } from './SearchBar';

export const Navbar = () => {
  // Safe context access with fallback
  let store;
  try {
    store = useStore();
  } catch (error) {
    // Fallback during hot reload - return early with minimal UI
    return (
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 h-20 flex items-center justify-center">
          <Link to="/" className="text-2xl font-bold font-serif text-[#D91976]">
            RizQara
          </Link>
        </div>
      </header>
    );
  }

  const { language, setLanguage, user, cart, t, messages, notifications } = store;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadMessages = messages.filter(m => !m.read && m.receiverId === (user?.id || 'guest')).length;
  const unreadNotifs = notifications.filter(n => !n.read && n.userId === user?.id).length;


  const isLinkActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path.includes('?')) {
      const [basePath, search] = path.split('?');
      const params = new URLSearchParams(search);
      const currentParams = new URLSearchParams(location.search);

      if (location.pathname !== basePath) return false;

      for (const [key, value] of params.entries()) {
        if (currentParams.get(key) !== value) return false;
      }
      return true;
    }
    return location.pathname === path;
  };

  const navLinks = [
    { name_bn: 'ক্লে', name_en: 'Clay', path: '/shop?cat=Clay', icon: <Palette size={16} /> },
    { name_bn: 'উইমেন', name_en: 'Women', path: '/shop?cat=Women', icon: <ShoppingBag size={16} /> },
    { name_bn: 'গিফট', name_en: 'Gifts', path: '/shop?cat=Gifts', icon: <Gift size={16} /> },
    { name_bn: 'আর্ট', name_en: 'Art', path: '/shop?cat=Art', icon: <Frame size={16} /> },
    { name_bn: 'কাস্টম', name_en: 'Custom', path: '/shop?cat=Custom', icon: <PenTool size={16} /> },
    { name_bn: 'প্ল্যান্টস', name_en: 'Plants', path: '/shop?cat=Plants', icon: <Leaf size={16} /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 font-sans">
      {/* Top Bar with Language Toggle */}
      <div className="bg-[#D91976] text-white text-xs py-1.5 px-4">
        <div className="container mx-auto flex flex-row items-center justify-between gap-2">
          <p className="flex-1 text-left md:text-center text-[10px] md:text-xs leading-tight line-clamp-2 md:line-clamp-1">
            {t('প্রথম অর্ডারে ১০% ছাড়! কোড: WELCOME10', '10% OFF on first order! Use Code: WELCOME10')}
          </p>
          <select
            value={language}
            onChange={(e) => {
              const lang = e.target.value;
              setLanguage(lang);
              
              // Trigger Google Translate
              const gtCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
              if (gtCombo) {
                gtCombo.value = lang === 'bn' ? 'bn' : lang;
                gtCombo.dispatchEvent(new Event('change'));
              }
            }}
            className="notranslate text-[10px] md:text-xs font-bold uppercase tracking-wider bg-transparent text-white border border-white/40 hover:bg-white/20 transition px-1.5 md:px-2 py-1 rounded ml-auto shrink-0 focus:outline-none cursor-pointer max-w-[110px] md:max-w-none text-ellipsis overflow-hidden"
          >
            <option value="bn" className="text-black">বাংলা (BDT)</option>
            <option value="en" className="text-black">English (USD)</option>
            <option value="af" className="text-black">Afrikaans (USD)</option>
            <option value="sq" className="text-black">Albanian (USD)</option>
            <option value="ar" className="text-black">العربية (USD)</option>
            <option value="hy" className="text-black">Armenian (USD)</option>
            <option value="az" className="text-black">Azerbaijani (USD)</option>
            <option value="eu" className="text-black">Basque (USD)</option>
            <option value="be" className="text-black">Belarusian (USD)</option>
            <option value="bg" className="text-black">Bulgarian (USD)</option>
            <option value="ca" className="text-black">Catalan (USD)</option>
            <option value="zh-CN" className="text-black">Chinese (Simplified) (USD)</option>
            <option value="zh-TW" className="text-black">Chinese (Traditional) (USD)</option>
            <option value="hr" className="text-black">Croatian (USD)</option>
            <option value="cs" className="text-black">Czech (USD)</option>
            <option value="da" className="text-black">Danish (USD)</option>
            <option value="nl" className="text-black">Dutch (USD)</option>
            <option value="et" className="text-black">Estonian (USD)</option>
            <option value="tl" className="text-black">Filipino (USD)</option>
            <option value="fi" className="text-black">Finnish (USD)</option>
            <option value="fr" className="text-black">Français (USD)</option>
            <option value="gl" className="text-black">Galician (USD)</option>
            <option value="ka" className="text-black">Georgian (USD)</option>
            <option value="de" className="text-black">German (USD)</option>
            <option value="el" className="text-black">Greek (USD)</option>
            <option value="gu" className="text-black">Gujarati (USD)</option>
            <option value="ht" className="text-black">Haitian Creole (USD)</option>
            <option value="iw" className="text-black">Hebrew (USD)</option>
            <option value="hi" className="text-black">हिन्दी (USD)</option>
            <option value="hu" className="text-black">Hungarian (USD)</option>
            <option value="is" className="text-black">Icelandic (USD)</option>
            <option value="id" className="text-black">Indonesian (USD)</option>
            <option value="ga" className="text-black">Irish (USD)</option>
            <option value="it" className="text-black">Italian (USD)</option>
            <option value="ja" className="text-black">Japanese (USD)</option>
            <option value="kn" className="text-black">Kannada (USD)</option>
            <option value="ko" className="text-black">Korean (USD)</option>
            <option value="la" className="text-black">Latin (USD)</option>
            <option value="lv" className="text-black">Latvian (USD)</option>
            <option value="lt" className="text-black">Lithuanian (USD)</option>
            <option value="mk" className="text-black">Macedonian (USD)</option>
            <option value="ms" className="text-black">Malay (USD)</option>
            <option value="mt" className="text-black">Maltese (USD)</option>
            <option value="no" className="text-black">Norwegian (USD)</option>
            <option value="fa" className="text-black">Persian (USD)</option>
            <option value="pl" className="text-black">Polish (USD)</option>
            <option value="pt" className="text-black">Portuguese (USD)</option>
            <option value="ro" className="text-black">Romanian (USD)</option>
            <option value="ru" className="text-black">Russian (USD)</option>
            <option value="sr" className="text-black">Serbian (USD)</option>
            <option value="sk" className="text-black">Slovak (USD)</option>
            <option value="sl" className="text-black">Slovenian (USD)</option>
            <option value="es" className="text-black">Español (USD)</option>
            <option value="sw" className="text-black">Swahili (USD)</option>
            <option value="sv" className="text-black">Swedish (USD)</option>
            <option value="ta" className="text-black">Tamil (USD)</option>
            <option value="te" className="text-black">Telugu (USD)</option>
            <option value="th" className="text-black">Thai (USD)</option>
            <option value="tr" className="text-black">Turkish (USD)</option>
            <option value="uk" className="text-black">Ukrainian (USD)</option>
            <option value="ur" className="text-black">اردو (USD)</option>
            <option value="vi" className="text-black">Vietnamese (USD)</option>
            <option value="cy" className="text-black">Welsh (USD)</option>
            <option value="yi" className="text-black">Yiddish (USD)</option>
          </select>
          <a
            href="https://m.me/107858308889263"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-white hover:bg-white/20 transition rounded-full p-1.5 ml-2"
            title="Messenger"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="fill-current"
            >
              <path d="M12 2C6.48 2 2 6.19 2 11.35C2 14.34 3.73 17 6.36 18.67V22L9.81 20.12C10.52 20.31 11.25 20.41 12 20.41C17.52 20.41 22 16.22 22 11.06C22 5.9 17.52 2 12 2ZM12.98 14.28L10.42 11.52L5.87 14.1L10.95 8.72L13.51 11.48L18.06 8.9L12.98 14.28Z" />
            </svg>
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4 relative">
        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-gray-700 hover:text-[#D91976] transition" onClick={() => setIsMenuOpen(true)}>
          <Menu size={24} />
        </button>

        {/* Logo - Full Name */}
        <Link to="/" className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-[#D91976] shrink-0">
          {language === 'bn' ? 'রিজকারা শপ' : 'RizQara Shop'}
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:block flex-1 max-w-xl">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          {/* Wishlist - Desktop Only */}
          <Link to="/wishlist" className="hidden md:block text-gray-600 hover:text-[#D91976] transition p-1">
            <Heart size={22} />
          </Link>

          {/* Cart - Explicitly Visible on Mobile */}
          <Link to="/cart" className="text-gray-600 hover:text-[#D91976] transition relative p-1 block">
            <ShoppingCart size={22} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D91976] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white font-bold">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Notifications - Only show when logged in */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="text-gray-600 hover:text-[#D91976] transition relative block p-1"
              >
                <Bell size={22} />
                {unreadNotifs > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadNotifs}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {isNotifOpen && <Notifications isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />}
              </AnimatePresence>
            </div>
          )}

          {/* Profile / Account */}
          <div className="relative z-40">
            <button
              onClick={() => {
                if (user) {
                  navigate(user.role === 'admin' ? '/admin' : '/account');
                } else {
                  navigate('/login');
                }
              }}
              className="text-gray-600 hover:text-[#D91976] transition relative block p-1"
            >
              <UserIcon size={22} />
              {unreadMessages > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadMessages}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Mega Menu */}
      <nav className="hidden md:block border-t border-gray-100 bg-white">
        <div className="container mx-auto px-4">
          <ul className="flex justify-center gap-10 py-3.5">
            <li>
              <Link to="/" className={`text-sm font-semibold uppercase tracking-wide hover:text-[#D91976] transition flex items-center gap-1.5 ${isLinkActive('/') ? 'text-[#D91976]' : 'text-gray-600'}`}>
                <Home size={16} />
                <span>{t('হোম', 'Home')}</span>
              </Link>
            </li>
            {navLinks.map((link, idx) => (
              <li key={idx}>
                <Link to={link.path} className={`text-sm font-semibold uppercase tracking-wide hover:text-[#D91976] transition flex items-center gap-1.5 ${isLinkActive(link.path) ? 'text-[#D91976]' : 'text-gray-600'}`}>
                  {link.icon}
                  <span>{language === 'bn' ? link.name_bn : link.name_en}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link to="/offers" className={`text-sm font-semibold uppercase tracking-wide hover:text-orange-500 transition flex items-center gap-1.5 ${isLinkActive('/offers') ? 'text-orange-500' : 'text-gray-600'}`}>
                <Tag size={16} />
                <span>{t('অফার', 'Offers')}</span>
              </Link>
            </li>
            <li>
              <Link to="/reviews" className={`text-sm font-semibold uppercase tracking-wide hover:text-orange-500 transition flex items-center gap-1.5 ${isLinkActive('/reviews') ? 'text-orange-500' : 'text-orange-500'}`}>
                <Star size={16} />
                <span>{t('রিভিউ', 'Reviews')}</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>


      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black z-50 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-white z-[51] shadow-2xl p-6 md:hidden overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold font-serif text-[#D91976]">
                  {language === 'bn' ? 'রিজকারা শপ' : 'RizQara Shop'}
                </span>
                <button onClick={() => setIsMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <ul className="space-y-4">
                <li>
                  <Link to="/" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 text-lg font-medium ${isLinkActive('/') ? 'text-[#D91976]' : 'text-gray-800'}`}>
                    <Home size={20} />
                    <span>{t('হোম', 'Home')}</span>
                  </Link>
                </li>
                {navLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.path} onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 text-lg font-medium ${isLinkActive(link.path) ? 'text-[#D91976]' : 'text-gray-800'}`}>
                      <span className="w-5 h-5 flex items-center justify-center">{link.icon}</span>
                      <span>{language === 'bn' ? link.name_bn : link.name_en}</span>
                    </Link>
                  </li>
                ))}
                <li className="pt-4 border-t border-gray-100">
                  <Link to="/offers" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 text-lg font-medium ${isLinkActive('/offers') ? 'text-[#D91976]' : 'text-[#D91976]'}`}>
                    <Tag size={20} />
                    <span>{t('অফার', 'Offers')}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/reviews" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 text-lg font-medium ${isLinkActive('/reviews') ? 'text-orange-500' : 'text-orange-500'}`}>
                    <Star size={20} />
                    <span>{t('রিভিউ', 'Reviews')}</span>
                  </Link>
                </li>
              </ul>

              {!user && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-3 bg-[#D91976] text-white rounded-lg font-medium mb-3">
                    {t('লগইন / রেজিস্টার', 'Login / Register')}
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header >
  );
};
