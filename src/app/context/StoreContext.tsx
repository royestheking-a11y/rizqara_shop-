import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import emailjs from '@emailjs/browser';
import { PushService } from '../services/PushService';

// --- Types ---

export type Language = 'bn' | 'en';

export type UserRole = 'guest' | 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  isBanned?: boolean;
  bannedReason?: string;
  failedDeliveries?: number;
  returnedParcels?: number;
  password?: string; // In real app, this should be hashed. For demo, plain text in localStorage.
  isDeleted?: boolean;
  reminders?: Reminder[];
  cart?: CartItem[];
}

export interface Reminder {
  id: string;
  title: string;
  date: string; // ISO date string
  type: 'birthday' | 'anniversary' | 'other';
}

export interface Address {
  id: string;
  division: string;
  district: string;
  upazila: string;
  details: string;
  isDefault?: boolean;
}

export interface Product {
  id: string;
  title_bn: string;
  title_en: string;
  desc_bn: string;
  desc_en: string;
  price: number;
  discount_price?: number;
  category: string;
  subCategory?: string;
  itemType?: string;
  images: string[];
  stock: number;
  isCustomizable?: boolean;
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  colors?: string[]; // Added colors field
  tags?: string[]; // For Gift Generator
  isGiftFeatured?: boolean; // Prioritized in Gift Generator
  createdAt?: string;
}

export interface CartItem extends Product {
  cartId: string;
  quantity: number;
  selectedVariant?: string;
  customText?: string;
  customImage?: string; // base64 or url
  customNote?: string;
  // Custom Sketch Fields
  sketchType?: 'handmade' | 'pencil' | 'digital';
  sketchFrame?: 'with-frame' | 'without-frame';
  sketchSize?: 'A5' | 'A4' | 'A3' | 'A2' | 'custom';
  sketchDimensions?: { width: number; height: number };
  sketchReferenceImage?: string;
  isCombo?: boolean;
  customIdea?: string;
  // Custom Craft Fields
  craftType?: 'clay' | 'jewelry' | 'frame' | 'decor' | 'gift' | 'nameplate' | 'other';
  craftFinishing?: 'normal' | 'hand-painted' | 'wooden-border' | 'premium' | 'with-frame' | 'without-frame';
  craftSize?: string;
  craftDimensions?: { width: string; height: string };
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refund-requested' | 'refunded';
  paymentStatus: 'pending' | 'verified' | 'failed';
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket';
  paymentTrxId?: string;
  paymentScreenshot?: string;
  date: string;
  deliveryFee: number;
  trackingCode?: string;
  trackingHistory: { status: string; date: string; note?: string }[];
  invoiceNo: string;
  invoiceStatus: 'proforma' | 'final';
  shippingAddress: Address;
  refundReason?: string;
  refundRequestDate?: string;
  refundPaymentNumber?: string; // Payment number for refund
  refundTime?: string; // Time when refund was processed
  consigneeConfirmation?: boolean;
  consigneeNote?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  image?: string;
  timestamp: string;
  orderId?: string; // Links message to specific order
  type: 'support' | 'order' | 'custom'; // Context type
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title_bn: string;
  title_en: string;
  body_bn: string;
  body_en: string;
  type: 'order' | 'payment' | 'delivery' | 'message';
  link?: string;
  read: boolean;
  timestamp: string;
}

export interface Voucher {
  id: string;
  code: string;
  discount: number; // Percentage
  description_bn: string;
  description_en: string;
  minPurchase: number;
  maxDiscount: number;
  validUntil: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

export interface PremiumReview {
  id: string;
  title: string;
  imageUrl: string;
  date: string;
}

export interface CarouselSlide {
  id: string;
  image: string;
  link: string;
  isActive: boolean;
  order: number; // For sorting slides
}

export interface SketchPriceOptions {
  onePieceNoFrame: number;
  onePieceWithFrame: number;
  twoPieceNoFrame: number;
  twoPieceWithFrame: number;
}

export interface SketchPricing {
  A5: SketchPriceOptions;
  A4: SketchPriceOptions;
  A3: SketchPriceOptions;
  A2: SketchPriceOptions;
}

const DEFAULT_SKETCH_PRICING: SketchPricing = {
  A5: { onePieceNoFrame: 500, onePieceWithFrame: 700, twoPieceNoFrame: 900, twoPieceWithFrame: 1300 },
  A4: { onePieceNoFrame: 800, onePieceWithFrame: 1200, twoPieceNoFrame: 1400, twoPieceWithFrame: 2100 },
  A3: { onePieceNoFrame: 1600, onePieceWithFrame: 2200, twoPieceNoFrame: 3000, twoPieceWithFrame: 4000 },
  A2: { onePieceNoFrame: 2800, onePieceWithFrame: 3800, twoPieceNoFrame: 5000, twoPieceWithFrame: 7000 },
};

export interface OTPState {
  code: string;
  email: string;
  type: 'signup' | 'reset';
  expiration: number;
  pendingData?: any; // To store name/password during signup flow
}


// Order Email Config
const EMAILJS_ORDER_SERVICE_ID = import.meta.env.VITE_EMAILJS_ORDER_SERVICE_ID;
const EMAILJS_ORDER_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_ORDER_PUBLIC_KEY;
const EMAILJS_TEMPLATE_ORDER_CONFIRM = import.meta.env.VITE_EMAILJS_TEMPLATE_ORDER_CONFIRM;
const EMAILJS_TEMPLATE_ORDER_DELIVERED = import.meta.env.VITE_EMAILJS_TEMPLATE_ORDER_DELIVERED;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper for API calls
const apiCall = async (endpoint: string, method: string = 'GET', body?: any, token?: string) => {
  const headers: any = {};
  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config: any = {
    method,
    headers,
  };

  if (body) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// Upload Helper (folder must be sent FIRST)
const uploadFile = async (file: File | Blob, folder: string = 'general') => {
  const formData = new FormData();
  formData.append('folder', folder);
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Upload failed');
  }
  return data.url;
};

// Mock Data Removed - Now fetching from DB



// --- Context ---

interface StoreContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  users: User[]; // All users for admin
  login: (email: string, password?: string, rememberMe?: boolean) => Promise<boolean>;
  signup: (name: string, email: string, password?: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  banUser: (userId: string, reason: string) => void;
  unbanUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  isLoading: boolean;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: string, customText?: string, customImage?: string, customNote?: string) => void;
  addCustomItemToCart: (product: Product, quantity: number, customOptions: Partial<CartItem>) => void;
  removeFromCart: (cartId: string) => void;
  updateCartQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  orders: Order[]; // All orders (for admin) or User orders (for customer)
  placeOrder: (orderData: Omit<Order, 'id' | 'date' | 'invoiceNo' | 'status' | 'userId' | 'trackingHistory' | 'invoiceStatus'>) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Order['status'], trackingCode?: string) => void;
  updateOrderConsigneeInfo: (orderId: string, confirmation: boolean, note: string) => void;
  verifyPayment: (orderId: string, verified: boolean) => void;
  deleteOrder: (orderId: string) => void;
  confirmOrder: (orderId: string) => void;
  requestRefund: (orderId: string, reason: string, paymentNumber?: string) => void;
  processRefund: (orderId: string, approved: boolean, refundPaymentNumber?: string) => void;
  updateUserAddress: (address: Address) => void;
  updateUser: (data: Partial<User>) => void; // Added updateUser
  updateOrderTotal: (orderId: string, total: number) => void;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  deleteReminder: (id: string) => void;
  messages: Message[];
  sendMessage: (text: string, image?: string, orderId?: string, receiverId?: string, type?: 'support' | 'order' | 'custom') => void;
  getMessagesForUser: (userId: string) => Message[];
  markMessagesAsRead: (userId: string) => void;
  deleteMessage: (messageId: string) => void;
  uploadFile: (file: File | Blob, folder?: string) => Promise<string>;
  bookSteadfast: (orderId: string, data: any) => Promise<any>;
  cancelOrder: (orderId: string, reason: string) => Promise<void>;
  //yz: Sketch Pricing
  sketchPricing: SketchPricing;
  updateSketchPricing: (pricing: SketchPricing) => void;
  //Yz: Reviews
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  deleteUserReview: (id: string) => void;
  // Premium Reviews
  premiumReviews: PremiumReview[];
  addPremiumReview: (review: Omit<PremiumReview, 'id' | 'date'>) => void;
  deletePremiumReview: (id: string) => void;
  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  // Vouchers
  vouchers: Voucher[];
  addVoucher: (voucher: Omit<Voucher, 'id' | 'usedCount'>) => void;
  updateVoucher: (voucher: Voucher) => void;
  deleteVoucher: (voucherId: string) => void;
  applyVoucher: (code: string, cartTotal: number) => { discount: number; error?: string };
  // Carousel Slides
  carouselSlides: CarouselSlide[];
  addCarouselSlide: (slide: Omit<CarouselSlide, 'id'>) => void;
  updateCarouselSlide: (slide: CarouselSlide) => void;
  deleteCarouselSlide: (slideId: string) => void;
  toggleCarouselSlide: (slideId: string) => void;
  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  // Helpers
  t: (bn: string, en: string) => string;
  // OTP
  otpState: OTPState | null;
  sendOTP: (email: string, type: 'signup' | 'reset', name?: string) => Promise<boolean>;
  verifyOTP: (code: string) => boolean;
  resetPassword: (email: string, newPassword: string) => boolean;
  loginWithGoogle: (credential: string) => Promise<boolean>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  // State with lazy initialization to prevent data loss on refresh/tab open
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('rizqara_lang') as Language) || 'bn');
  // --- Auth & User State ---
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('rizqara_user') || sessionStorage.getItem('rizqara_user');
    return stored ? JSON.parse(stored) : null;
  });

  // Push Notification Registration
  useEffect(() => {
    if (user) {
      PushService.register(user.id);
    }
  }, [user]);

  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem('rizqara_users');
    return stored ? JSON.parse(stored) : [];
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem('rizqara_cart');
    return stored ? JSON.parse(stored) : [];
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [prodData, carouselData, voucherData, reviewData] = await Promise.all([
          apiCall('/products'),
          apiCall('/carousels'),
          apiCall('/vouchers'),
          apiCall('/reviews')
        ]);

        setProducts(prodData);
        setCarouselSlides(carouselData);
        setVouchers(voucherData);
        setReviews(reviewData);

        // Fetch users only if admin
        const storedUser = localStorage.getItem('rizqara_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          if (u.role === 'admin') {
            const userData = await apiCall('/users', 'GET', undefined, u.token);
            setUsers(userData);

            // Also fetch all orders for admin
            const orderData = await apiCall('/orders', 'GET', undefined, u.token);
            setOrders(orderData);
          }
        }

      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      } finally {
        setIsLoading(false);
      }

      // Fetch user specific orders if logged in
      const storedUser = localStorage.getItem('rizqara_user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.role !== 'admin') {
          try {
            const myOrders = await apiCall(`/orders/myorders?userId=${u.id}`, 'GET', undefined, u.token);
            setOrders(myOrders);
          } catch (e) {
            console.error('Failed to fetch my orders', e);
          }
        }
      }
    };
    fetchData();
  }, []);
  const [messages, setMessages] = useState<Message[]>(() => {
    const stored = localStorage.getItem('rizqara_messages');
    return stored ? JSON.parse(stored) : [];
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = localStorage.getItem('rizqara_notifications');
    return stored ? JSON.parse(stored) : [];
  });
  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    const stored = localStorage.getItem('rizqara_vouchers');
    return stored ? JSON.parse(stored) : [];
  });
  const [reviews, setReviews] = useState<Review[]>(() => {
    const stored = localStorage.getItem('rizqara_reviews');
    return stored ? JSON.parse(stored) : [];
  });
  const [premiumReviews, setPremiumReviews] = useState<PremiumReview[]>(() => {
    const stored = localStorage.getItem('rizqara_premium_reviews');
    return stored ? JSON.parse(stored) : [];
  });
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>(() => {
    const stored = localStorage.getItem('rizqara_carousel_slides');
    return stored ? JSON.parse(stored) : [];
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const stored = localStorage.getItem('rizqara_wishlist');
    return stored ? JSON.parse(stored) : [];
  });
  const [sketchPricing, setSketchPricing] = useState<SketchPricing>(() => {
    const stored = localStorage.getItem('rizqara_sketch_pricing');
    return stored ? JSON.parse(stored) : DEFAULT_SKETCH_PRICING;
  });

  const [otpState, setOtpState] = useState<OTPState | null>(null);

  // Socket Ref
  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5001');

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
      console.log('EMAILJS CONFIG:', {
        SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
        PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      });
      if (user) {
        socketRef.current.emit('join_room', user.id);
      }
    });

    socketRef.current.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      toast.info('New message received');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  // Mount logic only for language and socket. Data loading handled in initial state.
  useEffect(() => {
    const storedLang = localStorage.getItem('rizqara_lang');
    if (storedLang) setLanguage(storedLang as Language);
  }, []);

  // Synchronize state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rizqara_orders' && e.newValue) {
        setOrders(JSON.parse(e.newValue));
      }
      if (e.key === 'rizqara_cart' && e.newValue) {
        setCart(JSON.parse(e.newValue));
      }
      if (e.key === 'rizqara_notifications' && e.newValue) {
        setNotifications(JSON.parse(e.newValue));
      }
      if (e.key === 'rizqara_user' && !e.newValue) {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateOrderTotal = (orderId: string, total: number) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        // Also update notification
        const notification: Notification = {
          id: Date.now().toString(),
          userId: o.userId,
          title_bn: 'কাস্টম ক্রাফট এর মূল্য আপডেট',
          title_en: 'Custom Craft Price Updated',
          body_bn: `আপনার কাস্টম ক্রাফটের মূল্য নির্ধারণ করা হয়েছে: ৳${total}`,
          body_en: `Your custom craft request price has been set to: ৳${total}`,
          type: 'order',
          read: false,
          timestamp: new Date().toISOString(),
          link: '/account/profile'
        };
        setNotifications(n => [notification, ...n]);

        // Sync with backend
        const token = localStorage.getItem('rizqara_token');
        apiCall(`/orders/${orderId}/price`, 'PUT', { total }, token || undefined)
          .catch(err => console.error('Failed to sync price:', err));

        return { ...o, total };
      }
      return o;
    }));
  };

  //Kv: Save to local storage on change
  // No automatic user save here, handled in login/logout and update
  useEffect(() => {
    if (user) {
      const serializedUser = JSON.stringify(user);
      // Update whatever storage it's already in
      if (localStorage.getItem('rizqara_user')) {
        localStorage.setItem('rizqara_user', serializedUser);
      } else if (sessionStorage.getItem('rizqara_user')) {
        sessionStorage.setItem('rizqara_user', serializedUser);
      }
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('rizqara_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('rizqara_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('rizqara_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('rizqara_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('rizqara_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('rizqara_vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  useEffect(() => {
    localStorage.setItem('rizqara_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('rizqara_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('rizqara_premium_reviews', JSON.stringify(premiumReviews));
  }, [premiumReviews]);

  useEffect(() => {
    localStorage.setItem('rizqara_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('rizqara_sketch_pricing', JSON.stringify(sketchPricing));
  }, [sketchPricing]);

  useEffect(() => {
    localStorage.setItem('rizqara_carousel_slides', JSON.stringify(carouselSlides));
  }, [carouselSlides]);

  useEffect(() => {
    localStorage.setItem('rizqara_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Helper
  const t = (bn: string, en: string) => (language === 'bn' ? bn : en);

  // Auth
  const login = async (email: string, password?: string, rememberMe: boolean = true) => {
    try {
      setIsLoading(true);
      const data = await apiCall('/auth/login', 'POST', { email, password });

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('rizqara_token', data.token);
      storage.setItem('rizqara_user', JSON.stringify(data));
      setUser(data);

      toast.success(t('স্বাগতম!', 'Welcome back!'));
      return true;
    } catch (error: any) {
      toast.error(error.message || t('লগইন ব্যর্থ হয়েছে', 'Login failed'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      setIsLoading(true);
      const data = await apiCall('/auth/google', 'POST', { token: credential });

      localStorage.setItem('rizqara_token', data.token);
      localStorage.setItem('rizqara_user', JSON.stringify(data));
      setUser(data);

      toast.success(t('গুগল লগইন সফল!', 'Google Login Successful!'));
      return true;
    } catch (error: any) {
      toast.error(error.message || t('গুগল লগইন ব্যর্থ হয়েছে', 'Google Login failed'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };








  const sendOTP = async (email: string, type: 'signup' | 'reset', name?: string, extraData?: { password?: string, phone?: string }) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = Date.now() + 5 * 60 * 1000; // 5 minutes

    const templateId = type === 'signup'
      ? import.meta.env.VITE_EMAILJS_TEMPLATE_REGISTRATION
      : import.meta.env.VITE_EMAILJS_TEMPLATE_RESET;

    // If reset, try to find user name from local list if not provided
    let targetName = name;
    if (type === 'reset' && !targetName) {
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        targetName = existingUser.name;
      }
    }

    const templateParams = {
      to_email: email,
      email: email,
      user_email: email,
      reply_to: email,
      to_name: targetName || 'User',
      name: targetName || 'User',
      recipient_name: targetName || 'User',
      user_name: targetName || 'User', // Added as per user request
      otp: code,
      code: code,
      message: `Your verification code is ${code}`,
      expiration: '5 minutes'
    };

    console.log('Sending OTP via EmailJS:', { serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID, templateId, params: templateParams });

    try {
      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        templateId,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      console.log('EmailJS Response:', response);

      setOtpState({
        code,
        email,
        type,
        expiration,
        pendingData: type === 'signup' ? { name, email, password: extraData?.password, phone: extraData?.phone } : undefined
      });

      toast.success(t('ওটিপি পাঠানো হয়েছে', 'OTP has been sent to your email'));
      return true;
    } catch (error) {
      console.error('EmailJS Error:', error);
      toast.error(t('ওটিপি পাঠাতে ব্যর্থ হয়েছে', 'Failed to send OTP'));
      return false;
    }
  };

  const verifyOTP = (code: string): boolean => {
    if (!otpState) return false;

    if (Date.now() > otpState.expiration) {
      toast.error(t('ওটিপি মেয়াদোত্তীর্ণ', 'OTP has expired'));
      return false;
    }

    if (otpState.code !== code) {
      toast.error(t('ভুল ওটিপি', 'Invalid OTP'));
      return false;
    }

    // OTP Verified
    if (otpState.type === 'signup') {
      finalizeSignup();
      return true;
    } else {
      return true;
    }
  };

  const finalizeSignup = async () => {
    if (!otpState || !otpState.pendingData) return;

    const { name, email, password, phone } = otpState.pendingData;

    try {
      setIsLoading(true);
      const data = await apiCall('/auth/signup', 'POST', { name, email, password, phone });

      localStorage.setItem('rizqara_token', data.token);
      localStorage.setItem('rizqara_user', JSON.stringify(data));
      setUser(data);

      toast.success(t('অ্যাকাউন্ট তৈরি সফল হয়েছে', 'Account created successfully'));
      setOtpState(null);
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = (email: string, newPassword: string): boolean => {
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
      toast.error(t('ব্যবহারকারী পাওয়া যায়নি', 'User not found'));
      return false;
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: newPassword };
    setUsers(updatedUsers);
    localStorage.setItem('rizqara_users', JSON.stringify(updatedUsers));

    toast.success(t('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে', 'Password reset successfully'));
    setOtpState(null);
    return true;
  };

  const signup = async (name: string, email: string, password?: string, phone?: string) => {
    // Initiate OTP instead of API call
    return await sendOTP(email, 'signup', name, { password, phone });
  };

  const logout = () => {
    // Persist cart to user object in mock DB
    if (user) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, cart: cart } : u));
    }
    setUser(null);
    setCart([]);
    localStorage.removeItem('rizqara_user');
    sessionStorage.removeItem('rizqara_user');
    toast.info(t('লগআউট হয়েছে', 'Logged out'));
  };

  const banUser = (userId: string, reason: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, isBanned: true, bannedReason: reason } : u));
    toast.success('User banned');
  };

  const unbanUser = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, isBanned: false, bannedReason: undefined } : u));
    toast.success('User unbanned');
  };

  const deleteUser = (userId: string) => {
    // Soft delete
    setUsers(users.map(u => u.id === userId ? { ...u, isDeleted: true } : u));
    toast.success('User account deleted');
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      if (!user) return;
      setIsLoading(true);

      const token = localStorage.getItem('rizqara_token');
      // Pass data directly. If profileImage is a File, component should have uploaded it first via /api/upload
      // and passed the URL here.

      const updatedData = await apiCall('/auth/profile', 'PUT', data, token || undefined);

      setUser(updatedData);
      setUsers(users.map(u => u.id === user.id ? updatedData : u));

      // Update local storage
      localStorage.setItem('rizqara_user', JSON.stringify(updatedData));

      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Product Management
  const addProduct = async (product: Product) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('rizqara_token');
      const formData = new FormData();

      formData.append('title_en', product.title_en);
      formData.append('title_bn', product.title_bn || '');
      formData.append('price', String(product.price));
      formData.append('category', product.category);
      formData.append('stock', String(product.stock));
      formData.append('desc_en', product.desc_en);
      formData.append('desc_bn', product.desc_bn);
      if (product.discount_price) formData.append('discount_price', String(product.discount_price));
      if (product.isCustomizable) formData.append('isCustomizable', 'true');
      if (product.isNew) formData.append('isNew', 'true');
      if (product.isBestSeller) formData.append('isBestSeller', 'true');
      if (product.isGiftFeatured) formData.append('isGiftFeatured', 'true');

      if (product.colors) {
        product.colors.forEach((c: string) => formData.append('colors', c));
      }
      if (product.tags) {
        product.tags.forEach((t: string) => formData.append('tags', t));
      }

      if (product.images) {
        for (const img of product.images) {
          if (img.startsWith('data:image')) {
            const res = await fetch(img);
            const blob = await res.blob();
            formData.append('images', blob, 'image.jpg');
          } else {
            formData.append('images', img);
          }
        }
      }

      const newProd = await apiCall('/products', 'POST', formData, token || undefined);
      setProducts(prev => [...prev, newProd]);
      toast.success(t('পণ্য সফলভাবে যোগ করা হয়েছে', 'Product added successfully'));
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || t('পণ্য যোগ করতে ব্যর্থ হয়েছে', 'Failed to add product'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      setIsLoading(true);
      // Remove File object if present in images (should handle upload separately if needed, 
      // but assuming images are already URLs here or handled by separate upload logic)
      const data = await apiCall(`/products/${updatedProduct.id}`, 'PUT', updatedProduct);
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? data : p));
      toast.success(t('পণ্য আপডেট করা হয়েছে', 'Product updated successfully'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      await apiCall(`/products/${productId}`, 'DELETE');
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success(t('পণ্য মুছে ফেলা হয়েছে', 'Product deleted successfully'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setIsLoading(false);
    }
  };

  // Cart
  const addToCart = (product: Product, quantity = 1, variant?: string, customText?: string, customImage?: string, customNote?: string) => {
    const cartId = `${product.id}_${Date.now()}_${Math.random()}`;
    const item: CartItem = { ...product, cartId, quantity, selectedVariant: variant, customText, customImage, customNote };
    setCart([...cart, item]);
    toast.success(t('কার্টে যোগ হয়েছে', 'Added to cart'));
  };

  const addCustomItemToCart = (product: Product, quantity: number, customOptions: Partial<CartItem>) => {
    const cartId = `${product.id}_${Date.now()}_${Math.random()}`;
    const item: CartItem = {
      ...product,
      ...customOptions,
      cartId,
      quantity
    };
    setCart([...cart, item]);
    toast.success(t('কার্টে যোগ হয়েছে', 'Added to cart'));
  };

  const removeFromCart = (cartId: string) => {
    setCart(cart.filter(item => item.cartId !== cartId));
    toast.info(t('কার্ট থেকে সরানো হয়েছে', 'Removed from cart'));
  };

  const updateCartQuantity = (cartId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(cartId);
      return;
    }
    setCart(cart.map(item => (item.cartId === cartId ? { ...item, quantity } : item)));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Helper to generate notifications
  const addNotification = (userId: string, type: Notification['type'], titleEn: string, titleBn: string, bodyEn: string, bodyBn: string, link?: string) => {
    const notif: Notification = {
      id: `notif_${Date.now()}_${Math.random()}`,
      userId,
      title_en: titleEn,
      title_bn: titleBn,
      body_en: bodyEn,
      body_bn: bodyBn,
      type,
      link,
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Send Order Email
  const sendOrderEmail = async (order: Order, type: 'confirm' | 'delivered') => {
    // Get user email - try to find from user list based on userId if current user is not the target
    const targetUser = users.find(u => u.id === order.userId);
    const userEmail = targetUser?.email || user?.email; // Fallback

    if (!userEmail) {
      console.error('User email not found for order email');
      return;
    }

    if (!EMAILJS_ORDER_SERVICE_ID || !EMAILJS_ORDER_PUBLIC_KEY) {
      console.error('EmailJS Configuration Missing!', {
        serviceId: EMAILJS_ORDER_SERVICE_ID,
        publicKey: EMAILJS_ORDER_PUBLIC_KEY
      });
      toast.error('System Error: Email Config Missing. Please restart server.');
      return;
    }

    const templateId = type === 'confirm' ? EMAILJS_TEMPLATE_ORDER_CONFIRM : EMAILJS_TEMPLATE_ORDER_DELIVERED;

    // Calculate subtotal and discount (approximate for display if not stored directly)
    const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discount = subtotal + order.deliveryFee - order.total; // Re-calculate based on total

    const formattedDate = new Date(order.date).toLocaleDateString();

    // Format items for email
    const itemsList = order.items.map(item =>
      `${item.title_en} x ${item.quantity} - ৳${item.price * item.quantity}`
    ).join('\n');

    const templateParams = {
      // Common
      to_email: userEmail,
      email: userEmail,
      user_email: userEmail,
      reply_to: userEmail,
      recipient_email: userEmail,
      user_name: order.userName,
      order_id: order.invoiceNo, // Use Invoice No as visible ID
      total: order.total,
      order_items: itemsList,

      // Confirm Specific
      order_date: formattedDate,
      order_status: order.status,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      phone: order.userPhone,
      subtotal: subtotal,
      discount: discount > 0 ? discount : 0,
      delivery_fee: order.deliveryFee,
      shipping_address: `${order.shippingAddress.details}, ${order.shippingAddress.upazila}, ${order.shippingAddress.district}`,

      // Delivered Specific
      delivered_date: new Date().toLocaleDateString(),
      tracking_code: order.trackingCode || 'N/A',
    };

    console.log(`Sending Order ${type} email to ${userEmail}`, templateParams);

    try {
      await emailjs.send(EMAILJS_ORDER_SERVICE_ID, templateId, templateParams, EMAILJS_ORDER_PUBLIC_KEY);
      console.log(`Order ${type} email sent successfully`);
    } catch (error) {
      console.error(`Failed to send order ${type} email`, error);
    }
  };

  // Orders
  const placeOrder = async (orderData: Omit<Order, 'id' | 'date' | 'invoiceNo' | 'status' | 'userId' | 'trackingHistory' | 'invoiceStatus'>): Promise<string> => {
    try {
      if (!user) throw new Error('Must be logged in');
      setIsLoading(true);

      const token = localStorage.getItem('rizqara_token');
      const response = await apiCall('/orders', 'POST', { ...orderData, userId: user.id }, token || undefined);

      setOrders(prev => [...prev, response]);

      // Update local cart if needed (or backend handles it)
      // If order successful, clear cart
      setCart([]);
      localStorage.removeItem('rizqara_cart'); // or just rely on state sync

      toast.success(t('অর্ডার সফল হয়েছে!', 'Order placed successfully!'));
      return response.invoiceNo;
    } catch (error: any) {
      toast.error(error.message || t('অর্ডার করতে ব্যর্থ হয়েছে', 'Failed to place order'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };



  const updateOrderStatus = (orderId: string, status: Order['status'], trackingCode?: string) => {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        let history = [...o.trackingHistory, { status, date: new Date().toISOString(), note: trackingCode ? `Tracking: ${trackingCode}` : undefined }];
        let paymentStatus = o.paymentStatus;

        // Automation: If delivered and COD, verify payment automatically
        if (status === 'delivered' && o.paymentMethod === 'cod') {
          paymentStatus = 'verified';
          history.push({ status: 'verified', date: new Date().toISOString(), note: 'Payment collected via COD' });
        }

        // Notify user about status change
        addNotification(o.userId, 'delivery', 'Order Status Updated', 'অর্ডার স্ট্যাটাস আপডেট', `Your order ${o.invoiceNo} is now ${status}`, `আপনার অর্ডার ${o.invoiceNo} এখন ${status}`, '/account/orders');

        // Fraud Protection Logic
        if (status === 'cancelled') {
          const uId = o.userId;
          setUsers(currentUsers => currentUsers.map(u => {
            if (u.id === uId) {
              const newFailedCount = (u.failedDeliveries || 0) + 1;
              const shouldBan = newFailedCount >= 5;
              // If we are currently logged in as this user (unlikely if admin action, but possible)
              if (shouldBan && u.id === user?.id) {
                setUser({ ...u, failedDeliveries: newFailedCount, isBanned: true, bannedReason: 'Excessive failed deliveries' });
              }
              return {
                ...u,
                failedDeliveries: newFailedCount,
                isBanned: shouldBan ? true : u.isBanned,
                bannedReason: shouldBan ? 'Excessive failed deliveries' : u.bannedReason
              };
            }
            return u;
          }));
        }

        return { ...o, status, paymentStatus, trackingHistory: history, ...(trackingCode && { trackingCode }) };
      }
      return o;
    }));

    // Send emails based on status
    if (status === 'delivered' || status === 'confirmed') {
      const targetOrder = orders.find(o => o.id === orderId);
      if (targetOrder) {
        // Use updated values for the email
        const updatedOrdr = { ...targetOrder, status, trackingCode: trackingCode || targetOrder.trackingCode };
        sendOrderEmail(updatedOrdr, status === 'confirmed' ? 'confirm' : 'delivered');
      }
    }

    toast.success(`Order status updated to ${status}`);
  };

  const updateOrderConsigneeInfo = (orderId: string, confirmation: boolean, note: string) => {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        return { ...o, consigneeConfirmation: confirmation, consigneeNote: note };
      }
      return o;
    }));
    toast.success('Consignee info updated');
  };

  const verifyPayment = (orderId: string, verified: boolean) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const newPaymentStatus = verified ? 'verified' : 'failed';
        let status = o.status;
        let history = [...o.trackingHistory, { status: newPaymentStatus, date: new Date().toISOString() }];

        // Automation: If payment verified, set order status to processing
        if (verified && status === 'pending') {
          status = 'processing';
          history.push({ status: 'processing', date: new Date().toISOString(), note: 'Payment verified, moved to processing' });
        }

        // Notify user
        addNotification(o.userId, 'payment', verified ? 'Payment Verified' : 'Payment Failed', verified ? 'পেমেন্ট যাচাই' : 'পেমেন্ট ব্যর্থ', verified ? `Payment for order ${o.invoiceNo} has been verified.` : `Payment for order ${o.invoiceNo} failed.`, verified ? `অর্ডার ${o.invoiceNo} এর পেমেন্ট যাচাই হয়েছে।` : `অর্ডার ${o.invoiceNo} এর পেমেন্ট ব্যর্থ হয়েছে।`, '/account/orders');

        return { ...o, paymentStatus: newPaymentStatus, status, trackingHistory: history };
      }
      return o;
    }));
    toast.success(verified ? 'Payment verified' : 'Payment rejected');
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    toast.success('Order deleted');
  };

  const confirmOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'confirmed');
  };

  const requestRefund = (orderId: string, reason: string, paymentNumber?: string) => {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        const history = [...o.trackingHistory, { status: 'refund-requested', date: new Date().toISOString(), note: `Refund requested: ${reason}` }];

        // Notify Admin
        addNotification('admin_1', 'order', 'Refund Requested', 'রিফান্ড অনুরোধ', `Refund requested for order ${o.invoiceNo}: ${reason}`, `রিফান্ড অনুরোধ করা হয়েছে অর্ডারের জন্য ${o.invoiceNo}: ${reason}`, `/admin/refunds`);
        // Notify User
        addNotification(o.userId, 'order', 'Refund Requested', 'রিফান্ড অনুরোধ', `Refund requested for your order ${o.invoiceNo}`, `আপনার অর্ডার ${o.invoiceNo} এর রিফান্ড অনুরোধ করা হয়েছে`, `/account/orders`);

        return { ...o, status: 'refund-requested', trackingHistory: history, refundReason: reason, refundRequestDate: new Date().toISOString(), refundPaymentNumber: paymentNumber };
      }
      return o;
    }));
  };

  const processRefund = (orderId: string, approved: boolean, refundPaymentNumber?: string) => {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        const newStatus = approved ? 'refunded' : 'cancelled';
        const history = [...o.trackingHistory, { status: newStatus, date: new Date().toISOString(), note: approved ? 'Refund Approved' : 'Refund Rejected' }];

        // Notify User
        addNotification(o.userId, 'order', approved ? 'Refund Approved' : 'Refund Rejected', approved ? 'রিফান্ড অনুমোদিত' : 'রিফান্ড বাতিল', approved ? `Your refund for order ${o.invoiceNo} has been approved.` : `Your refund request for order ${o.invoiceNo} has been rejected.`, approved ? `আপনার অর্ডার ${o.invoiceNo} এর রিফান্ড অনুমোদিত হয়েছে।` : `আপনার অর্ডার ${o.invoiceNo} এর রিফান্ড অনুরোধ বাতিল হয়েছে।`, `/account/orders`);

        return { ...o, status: newStatus, trackingHistory: history, refundTime: approved ? new Date().toISOString() : undefined, refundPaymentNumber: approved && refundPaymentNumber ? refundPaymentNumber : o.refundPaymentNumber };
      }
      return o;
    }));
    toast.success(approved ? 'Refund approved' : 'Refund rejected');
  };

  const updateUserAddress = (address: Address) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return prev;
      const existingIndex = prev.addresses.findIndex(a => a.id === address.id);
      let newAddresses;
      if (existingIndex >= 0) {
        newAddresses = prev.addresses.map(a => a.id === address.id ? address : a);
      } else {
        newAddresses = [...prev.addresses, address];
      }
      // If this is set as default, unset others
      if (address.isDefault) {
        newAddresses = newAddresses.map(a => ({ ...a, isDefault: a.id === address.id }));
      }
      return { ...prev, addresses: newAddresses };
    });
  };

  // Messages
  const sendMessage = (text: string, image?: string, orderId?: string, receiverId?: string, type: Message['type'] = 'support') => {
    if (!user) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      receiverId: receiverId || 'admin_1', // Default to admin
      text,
      image,
      timestamp: new Date().toISOString(),
      orderId,
      type,
      read: false,
    };

    // Optimistic UI Update
    setMessages([...messages, newMessage]);

    // Send to Socket Server
    if (socketRef.current) {
      socketRef.current.emit('send_message', newMessage);
    }

    // Notify receiver (Local notification logic kept as fallback/local mock)
    // addNotification(newMessage.receiverId, 'message', 'New Message', 'নতুন বার্তা', `New message from ${user.name}`, `${user.name} থেকে নতুন বর্তা`, user.role === 'admin' ? '/account/messages' : '/admin/messages');
  };

  const updateSketchPricing = (pricing: SketchPricing) => {
    setSketchPricing(pricing);
    toast.success('Sketch pricing updated successfully');
  };

  const getMessagesForUser = (userId: string) => {
    return messages.filter(m => m.senderId === userId || m.receiverId === userId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const markMessagesAsRead = (userId: string) => {
    setMessages(messages.map(m => {
      if (m.receiverId === userId && !m.read) {
        return { ...m, read: true };
      }
      return m;
    }));
  };

  const deleteMessage = (messageId: string) => {
    setMessages(messages.filter(m => m.id !== messageId));
    toast.success('Message deleted');
  };

  // Reviews
  // --- Reviews ---
  const addReview = async (review: Omit<Review, 'id' | 'date'>) => {
    try {
      const newReview = await apiCall('/reviews', 'POST', {
        ...review,
        date: new Date().toISOString().split('T')[0]
      });
      setReviews(prev => [newReview, ...prev]);
      toast.success(t('রিভিউ যোগ করা হয়েছে', 'Review added successfully'));
    } catch (error) {
      toast.error('Failed to add review');
    }
  };

  const deleteUserReview = async (id: string) => {
    try {
      await apiCall(`/reviews/${id}`, 'DELETE');
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Review deleted');
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const addPremiumReview = (reviewData: Omit<PremiumReview, 'id' | 'date'>) => {
    const newReview: PremiumReview = {
      ...reviewData,
      id: `prev_${Date.now()}`,
      date: new Date().toISOString(),
    };
    setPremiumReviews(prev => [newReview, ...prev]);
    toast.success('Premium review added');
  };

  const deletePremiumReview = (id: string) => {
    setPremiumReviews(prev => prev.filter(r => r.id !== id));
    toast.success('Premium review deleted');
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  // --- Vouchers ---
  const addVoucher = async (voucher: Omit<Voucher, 'id' | 'usedCount'>) => {
    try {
      const newVoucher = await apiCall('/vouchers', 'POST', {
        ...voucher,
        usedCount: 0
      });
      setVouchers(prev => [...prev, newVoucher]);
      toast.success('Voucher added');
    } catch (error) {
      toast.error('Failed to add voucher');
    }
  };

  const updateVoucher = async (voucher: Voucher) => {
    try {
      const updated = await apiCall(`/vouchers/${voucher.id}`, 'PUT', voucher);
      setVouchers(prev => prev.map(v => v.id === voucher.id ? updated : v));
      toast.success('Voucher updated');
    } catch (error) {
      toast.error('Failed to update voucher');
    }
  };

  const deleteVoucher = async (voucherId: string) => {
    try {
      await apiCall(`/vouchers/${voucherId}`, 'DELETE');
      setVouchers(prev => prev.filter(v => v.id !== voucherId));
      toast.success('Voucher deleted');
    } catch (error) {
      toast.error('Failed to delete voucher');
    }
  };

  const applyVoucher = (code: string, cartTotal: number): { discount: number; error?: string } => {
    const voucher = vouchers.find(v => v.code.toUpperCase() === code.toUpperCase() && v.isActive);

    if (!voucher) {
      return { discount: 0, error: t('ভাউচার কোড সঠিক নয়', 'Invalid voucher code') };
    }

    const now = new Date();
    const validUntil = new Date(voucher.validUntil);
    if (now > validUntil) {
      return { discount: 0, error: t('ভাউচার মেয়াদ শেষ', 'Voucher expired') };
    }

    if (cartTotal < voucher.minPurchase) {
      return { discount: 0, error: t(`নযূনতম ৳${voucher.minPurchase} কেনাকাটা প্রয়োজন`, `Minimum purchase ৳${voucher.minPurchase} required`) };
    }

    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return { discount: 0, error: t('ভাউচার লিমিট শেষ', 'Voucher usage limit reached') };
    }

    const discountAmount = Math.min((cartTotal * voucher.discount) / 100, voucher.maxDiscount);

    // Increment usage count
    setVouchers(vouchers.map(v => v.id === voucher.id ? { ...v, usedCount: v.usedCount + 1 } : v));

    return { discount: discountAmount };
  };

  // --- Carousel Slides ---
  const addCarouselSlide = async (slide: Omit<CarouselSlide, 'id'>) => {
    try {
      const newSlide = await apiCall('/carousels', 'POST', slide);
      setCarouselSlides(prev => [...prev, newSlide]);
      toast.success('Slide added');
    } catch (error) {
      toast.error('Failed to add slide');
    }
  };

  const updateCarouselSlide = async (slide: CarouselSlide) => {
    try {
      const updated = await apiCall(`/carousels/${slide.id}`, 'PUT', slide);
      setCarouselSlides(prev => prev.map(s => s.id === slide.id ? updated : s));
      toast.success('Slide updated');
    } catch (error) {
      toast.error('Failed to update slide');
    }
  };

  const deleteCarouselSlide = async (slideId: string) => {
    try {
      await apiCall(`/carousels/${slideId}`, 'DELETE');
      setCarouselSlides(prev => prev.filter(s => s.id !== slideId));
      toast.success('Slide deleted');
    } catch (error) {
      toast.error('Failed to delete slide');
    }
  };

  const toggleCarouselSlide = async (slideId: string) => {
    const slide = carouselSlides.find(s => s.id === slideId);
    if (slide) {
      try {
        const updated = await apiCall(`/carousels/${slideId}`, 'PUT', { ...slide, isActive: !slide.isActive });
        setCarouselSlides(prev => prev.map(s => s.id === slideId ? updated : s));
        toast.success('Carousel slide toggled');
      } catch (error) {
        toast.error('Failed to toggle carousel slide');
      }
    }
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        toast.info(t('উইশলিস্ট থেকে সরানো হয়েছে', 'Removed from wishlist'));
        return prev.filter(id => id !== productId);
      } else {
        toast.success(t('উইশলিস্টে যোগ হয়েছে', 'Added to wishlist'));
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const addReminder = (reminderData: Omit<Reminder, 'id'>) => {
    if (!user) return;
    const newReminder: Reminder = {
      id: Math.random().toString(36).substr(2, 9),
      ...reminderData
    };
    const updatedUser = {
      ...user,
      reminders: [...(user.reminders || []), newReminder]
    };
    setUser(updatedUser);
    toast.success(t('রিমাইন্ডার যোগ করা হয়েছে', 'Reminder added successfully'));
  };

  const deleteReminder = (id: string) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      reminders: (user.reminders || []).filter(r => r.id !== id)
    };
    setUser(updatedUser);
    toast.success(t('রিমাইন্ডার মুছে ফেলা হয়েছে', 'Reminder deleted'));
  };

  const bookSteadfast = async (orderId: string, data: any) => {
    try {
      console.log('bookSteadfast called', orderId, data);
      if (!user) return;
      setIsLoading(true);
      const token = localStorage.getItem('rizqara_token');

      const response = await apiCall('/steadfast/create_order', 'POST', data, token || undefined);
      console.log('Steadfast response', response);

      // Update order with tracking code
      if (response && response.consignment_id) { // Adjust based on actual API response
        updateOrderStatus(orderId, 'shipped', response.tracking_code || response.consignment_id);
      } else if (response && response.tracking_code) {
        updateOrderStatus(orderId, 'shipped', response.tracking_code);
      }

      toast.success(t('স্টেডফাস্টে বুকিং সফল হয়েছে!', 'Steadfast booking successful!'));
      return response;
    } catch (error: any) {
      toast.error(error.message || t('বুকিং ব্যর্থ হয়েছে', 'Booking failed'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId: string, reason: string) => {
    try {
      const token = localStorage.getItem('rizqara_token');
      await apiCall(`/orders/${orderId}/status`, 'PUT', { status: 'cancelled', trackingHistory: [{ status: 'cancelled', date: new Date().toISOString(), note: `Cancelled: ${reason}` }] }, token || undefined);

      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          const history = [...o.trackingHistory, {
            status: 'cancelled',
            date: new Date().toISOString(),
            note: `Cancelled: ${reason}`
          }];
          return { ...o, status: 'cancelled', trackingHistory: history };
        }
        return o;
      }));

      toast.success(t('অর্ডার বাতিল করা হয়েছে', 'Order cancelled'));
    } catch (err) {
      console.error('Failed to cancel order:', err);
      toast.error(t('অর্ডার বাতিল করতে সমস্যা হয়েছে', 'Failed to cancel order'));
    }
  };

  const value: StoreContextType = {
    language, setLanguage,
    user, users, login, loginWithGoogle, signup, logout, banUser, unbanUser, deleteUser,
    products, addProduct, updateProduct, deleteProduct, isLoading,
    cart, addToCart, addCustomItemToCart, removeFromCart, updateCartQuantity, clearCart,
    orders, placeOrder, updateOrderStatus, updateOrderConsigneeInfo, updateOrderTotal, verifyPayment, deleteOrder, confirmOrder, requestRefund, processRefund, updateUserAddress, updateUser,
    messages, sendMessage, getMessagesForUser, markMessagesAsRead,
    deleteMessage,
    sketchPricing,
    updateSketchPricing,
    reviews, addReview, deleteUserReview,
    premiumReviews, addPremiumReview, deletePremiumReview,
    notifications, markNotificationAsRead,
    vouchers, addVoucher, updateVoucher, deleteVoucher, applyVoucher,
    carouselSlides, addCarouselSlide, updateCarouselSlide, deleteCarouselSlide, toggleCarouselSlide,
    wishlist, toggleWishlist, isInWishlist,
    addReminder, deleteReminder,
    otpState,
    sendOTP,
    verifyOTP,
    resetPassword,
    uploadFile,
    bookSteadfast, // Exported
    cancelOrder,   // Exported
    t,
  };

  return <StoreContext.Provider value={value} > {children}</StoreContext.Provider >;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};