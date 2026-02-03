import { useStore } from '@/app/context/StoreContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ShoppingBag, DollarSign, Users, Package, TrendingUp, RotateCcw, MessageCircle, Box, Zap } from 'lucide-react';
import { Link } from 'react-router';
import { LiveOrderMap } from './components/LiveOrderMap';
import { DemandForecasting } from './components/DemandForecasting';

export const AdminDashboard = () => {
  const { orders, products, messages, users, t } = useStore();

  const totalSales = orders.filter(o => o.paymentStatus === 'verified').reduce((acc, o) => acc + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const refundRequests = orders.filter(o => o.status === 'refund-requested').length;
  const unreadMessages = messages.filter(m => !m.read && m.receiverId === 'admin_1').length;

  // Calculate today's sales
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySales = orders.filter(o => {
    const orderDate = new Date(o.date);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime() && o.paymentStatus === 'verified';
  }).reduce((acc, o) => acc + o.total, 0);

  // Order Status Distribution for Pie Chart
  // Debug: Check if orders exist
  console.log('Dashboard Orders:', orders);

  const orderStats = [
    { name: t('অপেক্ষমান', 'Pending'), value: orders.filter(o => o.status === 'pending').length },
    { name: t('প্রক্রিয়াধীন', 'Processing'), value: orders.filter(o => o.status === 'processing').length },
    { name: t('শিপড', 'Shipped'), value: orders.filter(o => o.status === 'shipped').length },
    { name: t('ডেলিভারড', 'Delivered'), value: orders.filter(o => o.status === 'delivered').length },
    { name: t('রিফান্ড করা হয়েছে', 'Refunded'), value: orders.filter(o => o.status === 'refunded' || o.status === 'refund-requested').length },
  ];

  // If we have orders but stats are 0, maybe status mismatch?
  // Let's not filter > 0 for debugging purposes, or use a default
  const pieData = orderStats.filter(item => item.value > 0);

  const COLORS = ['#D91976', '#BE185D', '#9D174D', '#F472B6', '#FBCFE8'];

  // Mock Data for Revenue Bar Chart
  const revenueData = [
    { name: 'Sat', amount: 4000 },
    { name: 'Sun', amount: 3000 },
    { name: 'Mon', amount: 2000 },
    { name: 'Tue', amount: 2780 },
    { name: 'Wed', amount: 1890 },
    { name: 'Thu', amount: 2390 },
    { name: 'Fri', amount: 3490 },
  ];

  const stats = [
    { title: t('মোট আয়', 'Total Revenue'), value: `৳${totalSales.toLocaleString()}`, icon: <DollarSign size={24} className="text-white" />, bg: 'bg-gradient-to-br from-[#D91976] to-pink-700', link: '/admin/payments' },
    { title: t('আজকের বিক্রয়', "Today's Sales"), value: `৳${todaySales.toLocaleString()}`, icon: <TrendingUp size={24} className="text-white" />, bg: 'bg-gradient-to-br from-blue-500 to-blue-600', link: '/admin/payments' },
    { title: t('মোট অর্ডার', 'Total Orders'), value: orders.length, icon: <ShoppingBag size={24} className="text-white" />, bg: 'bg-gradient-to-br from-purple-500 to-purple-600', link: '/admin/orders' },
    { title: t('পেন্ডিং অর্ডার', 'Pending Orders'), value: pendingOrders, icon: <Package size={24} className="text-white" />, bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600', link: '/admin/orders' },
    { title: t('মোট পণ্য', 'Total Products'), value: products.length, icon: <Box size={24} className="text-white" />, bg: 'bg-gradient-to-br from-teal-500 to-teal-600', link: '/admin/products' },
    { title: t('মোট ব্যবহারকারী', 'Total Users'), value: users.length, icon: <Users size={24} className="text-white" />, bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600', link: '/admin/customers' },
    { title: t('রিফান্ড অনুরোধ', 'Refund Requests'), value: refundRequests, icon: <RotateCcw size={24} className="text-white" />, bg: 'bg-gradient-to-br from-orange-500 to-orange-600', link: '/admin/refunds' },
    { title: t('নতুন বার্তা', 'Unread Messages'), value: unreadMessages, icon: <MessageCircle size={24} className="text-white" />, bg: 'bg-gradient-to-br from-pink-500 to-pink-600', link: '/admin/messages' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8 text-gray-800">{t('ড্যাশবোর্ড ওভারভিউ', 'Dashboard Overview')}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <Link key={i} to={stat.link} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group">
            <div className="p-6 flex items-center gap-4">
              <div className={`${stat.bg} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <span className="p-2 bg-amber-50 rounded-lg border border-amber-100 shadow-sm">
            <Zap className="text-amber-500 w-5 h-5" fill="currentColor" />
          </span>
          Live Insights & Forecasting
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LiveOrderMap />
          <DemandForecasting />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm min-h-[500px] flex flex-col">
          <h3 className="font-bold mb-4 text-xl text-gray-800">{t('মোট ব্যবসায়িক পেমেন্ট', 'Total Business Payments')}</h3>
          <div className="flex-1 min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `৳${value}`} />
                <Bar dataKey="amount" fill="#D91976" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm min-h-[500px] flex flex-col">
          <h3 className="font-bold mb-4 text-xl text-gray-800">{t('অর্ডার স্ট্যাটাস ডিস্ট্রিবিউশন', 'Order Status Distribution')}</h3>
          <div className="flex-1 min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              {pieData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => value.toLocaleString()} />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ paddingLeft: "20px" }}
                  />
                </PieChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No data available to display chart.
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
