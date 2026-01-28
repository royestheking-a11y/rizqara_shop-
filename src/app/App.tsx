import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import '@/styles/theme.css';
import { ScrollToTop } from '@/app/components/ScrollToTop';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router';
import { StoreProvider } from '@/app/context/StoreContext';
import { Layout } from '@/app/components/Layout';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { SplashScreen } from '@/app/components/SplashScreen';
import { Home } from '@/app/pages/Home';
import { Shop } from '@/app/pages/Shop';
import { Offers } from './pages/Offers';
import { ProductDetails } from '@/app/pages/ProductDetails';
import { Cart } from '@/app/pages/Cart';
import { Checkout } from '@/app/pages/Checkout';
import { Login } from '@/app/pages/Login';
import { Wishlist } from '@/app/pages/Wishlist';
import { DashboardLayout } from '@/app/pages/account/DashboardLayout';
import { OrderList } from '@/app/pages/account/OrderList';
import { Messages } from '@/app/pages/account/Messages';
import { ProfileEnhanced } from '@/app/pages/account/ProfileEnhanced';
import { NotificationList } from '@/app/pages/account/NotificationList';
import { AdminLayout } from '@/app/pages/admin/AdminLayout';
import { AdminDashboard } from '@/app/pages/admin/Dashboard';
import { AdminOrders } from '@/app/pages/admin/Orders';
import { AdminMessages } from '@/app/pages/admin/Messages';
import { AdminProducts } from '@/app/pages/admin/Products';
import { AdminCustomers } from '@/app/pages/admin/Customers';
import { AdminPayments } from '@/app/pages/admin/Payments';
import { AdminVouchers } from '@/app/pages/admin/Vouchers';
import { AdminRefunds } from '@/app/pages/admin/Refunds';
import { AdminReviews } from '@/app/pages/admin/Reviews';
import { AdminCustomSketches } from '@/app/pages/admin/CustomSketches';
import { AdminCustomCrafts } from '@/app/pages/admin/CustomCrafts';
import { AdminCarousel } from '@/app/pages/admin/Carousel';
import { Reviews } from '@/app/pages/Reviews';
import { CustomSketch } from '@/app/pages/CustomSketch';
import { CustomCraft } from '@/app/pages/CustomCraft';
import { OrderConfirmation } from '@/app/pages/OrderConfirmation';
import { About } from '@/app/pages/info/About';
import { Contact } from '@/app/pages/info/Contact';
import { Blog } from '@/app/pages/info/Blog';
import { Careers } from '@/app/pages/info/Careers';
import { PolicyPage } from '@/app/pages/info/Policy';
import { GiftGenerator } from '@/app/pages/GiftGenerator';
import { Sitemap } from '@/app/pages/info/Sitemap';

const PublicLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

const App = () => {
  const [showSplash, setShowSplash] = React.useState(true);
  const [isFirstLoad, setIsFirstLoad] = React.useState(true);

  React.useEffect(() => {
    // Check if user has seen splash in this session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
      setIsFirstLoad(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasSeenSplash', 'true');
  };

  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#D91976] mb-4 font-serif">RizQara Shop</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      {showSplash && isFirstLoad && <SplashScreen onComplete={handleSplashComplete} />}

      <GoogleOAuthProvider clientId="567047519860-hr54h659cjj8pd200dn0rh31u56ehhhn.apps.googleusercontent.com">
        <StoreProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Routes with Layout */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/custom-sketch" element={<CustomSketch />} />
                <Route path="/custom-craft" element={<CustomCraft />} />
                <Route path="/gift-generator" element={<GiftGenerator />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Login />} />
                <Route path="/wishlist" element={<Wishlist />} />

                {/* Static Info Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/return-policy" element={<PolicyPage type="return" />} />
                <Route path="/privacy-policy" element={<PolicyPage type="privacy" />} />
                <Route path="/terms" element={<PolicyPage type="terms" />} />
                <Route path="/delivery-info" element={<PolicyPage type="delivery" />} />
                <Route path="/sitemap" element={<Sitemap />} />
              </Route>

              {/* Account Routes */}
              <Route path="/account" element={<Layout><DashboardLayout /></Layout>}>
                <Route index element={<Navigate to="orders" replace />} />
                <Route path="orders" element={<OrderList />} />
                <Route path="messages" element={<Messages />} />
                <Route path="profile" element={<ProfileEnhanced />} />
                <Route path="notifications" element={<NotificationList />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="vouchers" element={<AdminVouchers />} />
                <Route path="refunds" element={<AdminRefunds />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="custom-sketches" element={<AdminCustomSketches />} />
                <Route path="custom-crafts" element={<AdminCustomCrafts />} />
                <Route path="carousel" element={<AdminCarousel />} />
              </Route>

            </Routes>
          </BrowserRouter>
        </StoreProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
};

export default App;