import { useState } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router';
import { useStore } from '@/app/context/StoreContext';
import { LayoutDashboard, ShoppingBag, MessageSquare, Package, LogOut, Users, CreditCard, Tag, RotateCcw, Menu, X, Star, PenTool, Image } from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout, t } = useStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;

  const links = [
    { name: t('ড্যাশবোর্ড', 'Dashboard'), path: '/admin', icon: <LayoutDashboard size={20} />, exact: true },
    { name: t('অর্ডার সমূহ', 'Orders'), path: '/admin/orders', icon: <ShoppingBag size={20} /> },
    { name: t('কাস্টম স্কেচ', 'Custom Sketches'), path: '/admin/custom-sketches', icon: <PenTool size={20} /> },
    { name: t('কাস্টম ক্রাফট', 'Custom Crafts'), path: '/admin/custom-crafts', icon: <PenTool size={20} /> },
    { name: t('ক্যারোসেল', 'Carousel'), path: '/admin/carousel', icon: <Image size={20} /> },
    { name: t('পেমেন্ট', 'Payments'), path: '/admin/payments', icon: <CreditCard size={20} /> },
    { name: t('পণ্য সমূহ', 'Products'), path: '/admin/products', icon: <Package size={20} /> },
    { name: t('রিভিউ', 'Reviews'), path: '/admin/reviews', icon: <Star size={20} /> },
    { name: t('ভাউচার', 'Vouchers'), path: '/admin/vouchers', icon: <Tag size={20} /> },
    { name: t('রিফান্ড', 'Refunds'), path: '/admin/refunds', icon: <RotateCcw size={20} /> },
    { name: t('বার্তা', 'Messages'), path: '/admin/messages', icon: <MessageSquare size={20} /> },
    { name: t('কাস্টমার', 'Customers'), path: '/admin/customers', icon: <Users size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#6B0F41] text-white p-4 z-30 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold font-serif">{t('রিজকারা অ্যাডমিন', 'RizQara Admin')}</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#6B0F41] text-white flex flex-col z-30 transition-transform duration-300 transform
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:fixed lg:z-30 lg:bottom-0
      `}>
        <div className="p-6 border-b border-white/10 hidden lg:block">
          <h1 className="text-xl font-bold font-serif">{t('রিজকারা অ্যাডমিন', 'RizQara Admin')}</h1>
        </div>

        {/* Spacer for mobile header */}
        <div className="h-16 lg:hidden" />

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.exact}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${isActive ? 'bg-[#D91976] text-white shadow-lg' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-300 hover:bg-white/5 hover:text-red-200 transition"
          >
            <LogOut size={20} />
            {t('লগআউট', 'Logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 w-full overflow-hidden lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
};