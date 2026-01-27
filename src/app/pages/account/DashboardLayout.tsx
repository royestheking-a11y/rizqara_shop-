import { NavLink, Outlet, Navigate, useNavigate } from 'react-router';
import { useStore } from '@/app/context/StoreContext';
import { ShoppingBag, MessageSquare, User, LogOut } from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout, t } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;

  const links = [
    { name: t('আমার অর্ডার', 'My Orders'), path: '/account/orders', icon: <ShoppingBag size={20} /> },
    { name: t('বার্তা', 'Messages'), path: '/account/messages', icon: <MessageSquare size={20} /> },
    { name: t('প্রোফাইল', 'Profile'), path: '/account/profile', icon: <User size={20} /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-pink-50/50">
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-3 overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${user.name}`} alt="Avatar" />
              </div>
              <h2 className="font-bold text-gray-900">{user.name}</h2>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <nav className="p-2">
              {links.map(link => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${isActive ? 'bg-[#D91976] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >
                <LogOut size={20} />
                {t('লগআউট', 'Logout')}
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-[500px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};