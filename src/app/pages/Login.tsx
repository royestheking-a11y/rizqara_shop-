import React, { useState } from 'react';
import { useStore } from '@/app/context/StoreContext';
import { useNavigate, Link, useLocation } from 'react-router';
import { Mail, Lock, Eye, EyeOff, ShoppingBag, Shield, Truck, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { OtpInput } from '../components/OtpInput';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';

import SEO from '@/app/components/SEO';

export const Login = () => {
  const { login, loginWithGoogle, loginWithFacebook, signup, sendOTP, verifyOTP, resetPassword, otpState, t } = useStore();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('Google login success:', tokenResponse);
      const success = await loginWithGoogle(tokenResponse.access_token);
      if (success) {
        navigate('/');
      }
    },
    onError: (error) => console.log('Google login failed:', error)
  });

  const navigate = useNavigate();
  const location = useLocation();

  type ViewState = 'login' | 'signup' | 'otp' | 'forgot-password' | 'reset-password';
  const [view, setView] = useState<ViewState>(location.pathname === '/signup' ? 'signup' : 'login');

  React.useEffect(() => {
    if (location.pathname === '/signup' && view !== 'signup') setView('signup');
    if (location.pathname === '/login' && view !== 'login') setView('login');
  }, [location.pathname]);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [timer, setTimer] = useState(120); // 2 minutes string

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (view === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view, timer]);

  const handleResend = () => {
    sendOTP(email, otpState?.type || 'signup');
    setTimer(120); // Reset timer
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;

    if (view === 'login') {
      success = await login(email, password, rememberMe);
      if (success) {
        const returnPath = sessionStorage.getItem('returnPath');
        if (returnPath) {
          sessionStorage.removeItem('returnPath');
          navigate(returnPath);
        } else {
          navigate(email === 'admin@zrizqara.com' ? '/admin' : '/');
        }
      }
    } else if (view === 'signup') {
      // Signup now initiates OTP
      success = await signup(name, email, password, phone);
      if (success) {
        setView('otp');
      }
    } else if (view === 'forgot-password') {
      success = await sendOTP(email, 'reset');
      if (success) {
        setView('otp');
      }
    } else if (view === 'otp') {
      success = verifyOTP(otp);
      if (success) {
        if (otpState?.type === 'signup') {
          // Signup complete & logged in (handled in finalizeSignup inside verifyOTP? No, finalizeSignup creates user, but we need to login manually or auto)
          // finalizeSignup in StoreContext does setUser, so we are effectively logged in.
          // We just need to redirect.
          navigate('/');
        } else if (otpState?.type === 'reset') {
          setView('reset-password');
        }
      }
    } else if (view === 'reset-password') {
      success = resetPassword(email, newPassword);
      if (success) {
        setView('login');
        navigate('/login');
      }
    }
  };

  const handleTabChange = (newView: 'login' | 'signup') => {
    setView(newView);
    navigate(newView === 'login' ? '/login' : '/signup');
  };

  // SEO Logic
  const seoData = view === 'signup' ? {
    title: t('অ্যাকাউন্ট তৈরি করুন | রিজকারা শপ হ্যান্ডমেড গিফট স্টোর', 'Create Account | Rizqara Shop Handmade Gift Store'),
    description: t('রিজকারা শপে অ্যাকাউন্ট খুলুন এবং হ্যান্ডমেড পণ্য, কাস্টম স্কেচ ও গিফট অর্ডার করুন সহজে।', 'Create an account at Rizqara Shop and order handmade products, custom sketches and gifts easily.'),
    url: 'https://rizqarashop.vercel.app/signup'
  } : {
    title: t('লগইন | রিজকারা শপ', 'Login | Rizqara Shop'),
    description: t('আপনার অ্যাকাউন্টে লগইন করুন।', 'Login to your account.'),
    url: 'https://rizqarashop.vercel.app/login'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 flex items-center justify-center py-12 px-4">
      <SEO {...seoData} />
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Left Side - Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-3xl font-serif font-bold text-[#D91976] mb-2">{t('রিজকারা শপ', 'RizQara Shop')}</h1>
            </Link>
            <p className="text-gray-600">
              {view === 'login' && t('আপনার অ্যাকাউন্টে লগইন করুন', 'Login to your account')}
              {view === 'signup' && t('নতুন অ্যাকাউন্ট তৈরি করুন', 'Create a new account')}
              {view === 'otp' && t('ওটিপি যাচাই করুন', 'Verify OTP')}
              {view === 'forgot-password' && t('পাসওয়ার্ড রিসেট করুন', 'Reset Password')}
              {view === 'reset-password' && t('নতুন পাসওয়ার্ড সেট করুন', 'Set New Password')}
            </p>
          </div>

          {/* Tab Toggle - Only show for Login/Signup */}
          {(view === 'login' || view === 'signup') && (
            <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => handleTabChange('login')}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${view === 'login'
                  ? 'bg-white text-[#D91976] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {t('লগইন', 'Login')}
              </button>
              <button
                onClick={() => handleTabChange('signup')}
                className={`flex-1 py-3 rounded-lg font-semibold transition ${view === 'signup'
                  ? 'bg-white text-[#D91976] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {t('সাইন আপ', 'Sign Up')}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name Field (Signup) */}
            {view === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('পূর্ণ নাম', 'Full Name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#D91976] focus:ring-2 focus:ring-pink-100 focus:outline-none transition"
                  placeholder={t('আপনার নাম লিখুন', 'Enter your name')}
                  required
                />
              </div>
            )}

            {/* Phone Field (Signup) */}
            {view === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ফোন নম্বর', 'Phone Number')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#D91976] focus:ring-2 focus:ring-pink-100 focus:outline-none transition"
                  placeholder={t('আপনার ফোন নম্বর', 'Enter your phone number')}
                />
              </div>
            )}

            {/* Email Field (Login, Signup, Forgot Password) */}
            {(view === 'login' || view === 'signup' || view === 'forgot-password') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ইমেইল', 'Email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#D91976] focus:ring-2 focus:ring-pink-100 focus:outline-none transition"
                    placeholder={t('আপনার ইমেইল', 'your@email.com')}
                    required
                  />
                </div>
              </div>
            )}

            {/* Password Field (Login, Signup) */}
            {(view === 'login' || view === 'signup') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('পাসওয়ার্ড', 'Password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:border-[#D91976] focus:ring-2 focus:ring-pink-100 focus:outline-none transition"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {view === 'signup' && (
                  <p className="text-[10px] text-gray-500 mt-1.5 ml-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    {t('পাসওয়ার্ড কমপক্ষে ৬ ডিজিটের হতে হবে', 'Password must be at least 6 digits')}
                  </p>
                )}
              </div>
            )}

            {/* OTP Field */}
            {view === 'otp' && (
              <div>
                <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-100 text-sm text-pink-800 text-center">
                  <p className="font-semibold mb-1">{t('ওটিপি পাঠানো হয়েছে', 'OTP Verify')}</p>
                  <p>{t(`আপনার ইমেইলে (${email}) ৬ ডিজিটের কোড পাঠানো হয়েছে`, `We've sent a 6-digit code to ${email}`)}</p>
                </div>

                <div className="mb-8">
                  <OtpInput
                    length={6}
                    onComplete={(code) => setOtp(code)}
                  />
                </div>

                <div className="text-center text-sm text-gray-500">
                  {timer > 0 ? (
                    <p className="font-medium text-gray-600">
                      {t('কোড পাননি? অপেক্ষা করুন', "Didn't receive code? Wait")} <span className="text-[#D91976] font-bold">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span>
                    </p>
                  ) : (
                    <p>
                      {t('কোড পাননি?', "Didn't receive code?")} <button type="button" onClick={handleResend} className="text-[#D91976] font-bold hover:underline">{t('আবার পাঠান', 'Resend')}</button>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* New Password Field (Reset Password) */}
            {view === 'reset-password' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('নতুন পাসওয়ার্ড', 'New Password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:border-[#D91976] focus:ring-2 focus:ring-pink-100 focus:outline-none transition"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              {view === 'login' && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300 text-[#D91976] focus:ring-pink-100"
                    />
                    <span className="text-gray-600">{t('মনে রাখুন', 'Remember me')}</span>
                  </label>
                  <button type="button" onClick={() => setView('forgot-password')} className="text-[#D91976] hover:underline font-medium">
                    {t('পাসওয়ার্ড ভুলে গেছেন?', 'Forgot password?')}
                  </button>
                </div>
              )}

              {view === 'forgot-password' && (
                <button type="button" onClick={() => setView('login')} className="text-sm text-gray-500 hover:text-gray-700 block mx-auto">
                  {t('লগইন এ ফিরে যান', 'Back to Login')}
                </button>
              )}

              <button
                type="submit"
                className="w-full bg-[#D91976] text-white py-3.5 rounded-xl font-bold hover:bg-[#A8145A] transition shadow-lg shadow-pink-200 hover:shadow-xl"
              >
                {view === 'login' && t('লগইন করুন', 'Login')}
                {view === 'signup' && t('অ্যাকাউন্ট তৈরি করুন', 'Create Account')}
                {view === 'otp' && t('যাচাই করুন', 'Verify')}
                {view === 'forgot-password' && t('ওটিপি পাঠান', 'Send OTP')}
                {view === 'reset-password' && t('পাসওয়ার্ড রিসেট করুন', 'Reset Password')}
              </button>

              {/* Google Login Divider */}
              {(view === 'login' || view === 'signup') && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">{t('অথবা', 'Or')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => googleLogin()}
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm text-sm"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                      </svg>
                      {t('গুগল', 'Google')}
                    </button>

                    {/* 
                      IMPORTANT: 
                      1. In developers.facebook.com -> Facebook Login -> Settings, toggle 'Login with the JavaScript SDK' to YES.
                      2. Add your domain (e.g. http://localhost:5173, https://rizqarashop.vercel.app) to 'Allowed Domains for the JavaScript SDK'.
                    */}
                    <FacebookLogin
                      appId={import.meta.env.VITE_FACEBOOK_APP_ID}
                      onSuccess={(response) => {
                        console.log('Facebook Login Success:', response);
                        loginWithFacebook(response.accessToken, response.userID);
                      }}
                      onFail={(error) => {
                        console.log('Facebook Login Failed:', error);
                      }}
                      onProfileSuccess={(response) => {
                        console.log('Get Profile Success:', response);
                      }}
                      render={({ onClick }) => (
                        <button
                          type="button"
                          onClick={onClick}
                          className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm text-sm"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23.9981 12C23.9981 5.37258 18.6255 0 11.9981 0C5.37067 0 0.0000213155 5.37258 0.0000213155 12C0.0000213155 17.9895 4.38822 22.954 10.1231 23.8542V15.4688H7.07812V12H10.1231V9.35625C10.1231 6.34875 11.9163 4.6875 14.6568 4.6875C15.9686 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.3398 7.875 13.8749 8.8 13.8749 9.75V12H17.2013L16.6698 15.4688H13.8749V23.8542C19.6101 22.954 23.9981 17.9895 23.9981 12Z" fill="#1877F2" />
                            <path d="M16.6698 15.4688L17.2013 12H13.8749V9.75C13.8749 8.8 14.3398 7.875 15.8306 7.875H17.3438V4.92188C17.3438 4.92188 15.9686 4.6875 14.6568 4.6875C11.9163 4.6875 10.1231 6.34875 10.1231 9.35625V12H7.07812V15.4688H10.1231V23.8542C11.1627 24.0175 12.2272 24.0175 13.2668 23.8542V15.4688H16.6698Z" fill="white" />
                          </svg>
                          {t('ফেসবুক', 'Facebook')}
                        </button>
                      )}
                    />
                  </div>
                </>
              )}
            </div>

          </form>


        </div>

        {/* Right Side - Visual */}
        <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-[#D91976] via-[#A8145A] to-[#8B1149] p-12 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-4xl font-serif font-bold mb-4">
                {t('প্রিমিয়াম শপিং অভিজ্ঞতা', 'Premium Shopping Experience')}
              </h2>
              <p className="text-pink-100 text-lg">
                {t('বাংলাদেশের সেরা হস্তশিল্প এবং ঐতিহ্যবাহী পণ্য', 'Bangladesh\'s finest handicrafts and traditional products')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{t('বিস্তৃত পণ্য সংগ্রহ', 'Wide Product Collection')}</h3>
                  <p className="text-sm text-pink-100">{t('মাটির জিনিস থেকে শুরু করে শাড়ি, সবকিছু এক জায়গায়', 'From clay items to sarees, everything in one place')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{t('দ্রুত ডেলিভারি', 'Fast Delivery')}</h3>
                  <p className="text-sm text-pink-100">{t('ঢাকার মধ্যে ১-২ দিন, সারাদেশে ৩-৪ দিন', '1-2 days in Dhaka, 3-4 days nationwide')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{t('নিরাপদ পেমেন্ট', 'Secure Payment')}</h3>
                  <p className="text-sm text-pink-100">{t('bKash ও ক্যাশ অন ডেলিভারি সুবিধা', 'bKash & Cash on Delivery available')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{t('গুণমান নিশ্চয়তা', 'Quality Guarantee')}</h3>
                  <p className="text-sm text-pink-100">{t('১০০% খাঁটি হস্তনির্মিত পণ্য', '100% authentic handmade products')}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <p className="text-sm text-pink-100 italic">
                "{t('অসাধারণ সেবা এবং মানসম্পন্ন পণ্য। রিজকারা শপ আমার প্রথম পছন্দ!', 'Excellent service and quality products. RizQara Shop is my first choice!')}"
              </p>
              <p className="mt-2 font-semibold">— {t('নুসরাত জাহান_ক্রেতা', 'Nusrat Jahan_customer')}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};