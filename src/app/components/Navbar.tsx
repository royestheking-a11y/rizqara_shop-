import { useState } from 'react';
import { useStore } from '@/app/context/StoreContext';
import { NavLink, Link, useNavigate } from 'react-router';
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

  const unreadMessages = messages.filter(m => !m.read && m.receiverId === (user?.id || 'guest')).length;
  const unreadNotifs = notifications.filter(n => !n.read && n.userId === user?.id).length;

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
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
        <div className="container mx-auto flex items-center justify-between">
          <p className="flex-1 text-center">{t('প্রথম অর্ডারে ১০% ছাড়! কোড: WELCOME10', '10% OFF on first order! Use Code: WELCOME10')}</p>
          <button
            onClick={toggleLanguage}
            className="text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition px-3 py-1 rounded ml-4 shrink-0"
          >
            {language === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4 relative">
        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-gray-700" onClick={() => setIsMenuOpen(true)}>
          <Menu size={24} />
        </button>

        {/* Logo - Full Name */}
        <Link to="/" className="text-2xl md:text-3xl font-bold font-serif tracking-tight text-[#D91976] shrink-0 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          {language === 'bn' ? 'রিজকারা শপ' : 'RizQara Shop'}
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:block flex-1 max-w-xl">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Wishlist - Desktop Only */}
          <Link to="/wishlist" className="hidden md:block text-gray-600 hover:text-[#D91976] transition p-1">
            <Heart size={22} />
          </Link>

          {/* Cart */}
          <Link to="/cart" className="text-gray-600 hover:text-[#D91976] transition relative p-1">
            <ShoppingCart size={22} />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-[#D91976] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
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
              <NavLink to="/" className={({ isActive }) => `text-sm font-semibold uppercase tracking-wide hover:text-[#D91976] transition flex items-center gap-1.5 ${isActive ? 'text-[#D91976]' : 'text-gray-600'}`}>
                <Home size={16} />
                <span>{t('হোম', 'Home')}</span>
              </NavLink>
            </li>
            {navLinks.map((link, idx) => (
              <li key={idx}>
                <NavLink to={link.path} className={({ isActive }) => `text-sm font-semibold uppercase tracking-wide hover:text-[#D91976] transition flex items-center gap-1.5 ${isActive ? 'text-[#D91976]' : 'text-gray-600'}`}>
                  {link.icon}
                  <span>{language === 'bn' ? link.name_bn : link.name_en}</span>
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink to="/offers" className={({ isActive }) => `text-sm font-semibold uppercase tracking-wide hover:text-orange-500 transition flex items-center gap-1.5 ${isActive ? 'text-orange-500' : 'text-gray-600'}`}>
                <Tag size={16} />
                <span>{t('অফার', 'Offers')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/reviews" className={({ isActive }) => `text-sm font-semibold uppercase tracking-wide hover:text-orange-500 transition flex items-center gap-1.5 ${isActive ? 'text-orange-500' : 'text-orange-500'}`}>
                <Star size={16} />
                <span>{t('রিভিউ', 'Reviews')}</span>
              </NavLink>
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
                  <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-lg font-medium text-gray-800">
                    <Home size={20} />
                    <span>{t('হোম', 'Home')}</span>
                  </Link>
                </li>
                {navLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.path} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-lg font-medium text-gray-800">
                      <span className="w-5 h-5 flex items-center justify-center">{link.icon}</span>
                      <span>{language === 'bn' ? link.name_bn : link.name_en}</span>
                    </Link>
                  </li>
                ))}
                <li className="pt-4 border-t border-gray-100">
                  <Link to="/offers" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-lg font-medium text-[#D91976]">
                    <Tag size={20} />
                    <span>{t('অফার', 'Offers')}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/reviews" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-lg font-medium text-orange-500">
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
