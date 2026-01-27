import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useStore, Product } from '@/app/context/StoreContext';
import { Minus, Plus, ShoppingBag, MessageCircle, Share2, Heart, Upload, Check, PenTool, Truck, Package, Star, CheckCircle2, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ProductCard } from '@/app/components/ProductCard';

const COLOR_MAP: Record<string, string> = {
  'Red': '#EF4444',
  'Blue': '#3B82F6',
  'Green': '#10B981',
  'Yellow': '#EAB308',
  'Black': '#000000',
  'White': '#FFFFFF',
  'Gold': '#FFD700',
  'Silver': '#C0C0C0',
  'Brown': '#8B4513',
  'Purple': '#A855F7',
  'Pink': '#EC4899',
  'Orange': '#F97316',
  'Gray': '#6B7280',
};

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, t, addToCart, sendMessage, user, reviews, addReview, toggleWishlist, isInWishlist, language } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');

  // Customization State
  const [customText, setCustomText] = useState('');
  const [customFile, setCustomFile] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState('');

  // Review State
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewText, setNewReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Tab State
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  useEffect(() => {
    const found = products.find(p => p.id === id);
    if (found) {
      setProduct(found);
      setSelectedImage(0);
      if (found.colors && found.colors.length > 0) {
        setSelectedColor(found.colors[0]);
      }
    }
  }, [id, products]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D91976] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('লোডিং...', 'Loading...')}</p>
        </div>
      </div>
    );
  }


  const handleReviewSubmit = () => {
    if (!user) {
      toast.error(t('রিভিউ দিতে লগইন করুন', 'Please login to review'));
      navigate('/login');
      return;
    }
    if (newReviewRating === 0) {
      toast.error(t('রেটিং দিন', 'Please select a rating'));
      return;
    }
    if (!newReviewText.trim()) {
      toast.error(t('রিভিউ লিখুন', 'Please write a review'));
      return;
    }

    setIsSubmittingReview(true);
    // Simulate delay
    setTimeout(() => {
      addReview({
        productId: product.id,
        userId: user.id,
        userName: user.name,
        rating: newReviewRating,
        comment: newReviewText,
      });
      setNewReviewRating(0);
      setNewReviewText('');
      setIsSubmittingReview(false);
    }, 500);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, customText, customFile || undefined, customNote);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor, customText, customFile || undefined, customNote);
    navigate('/cart');
  };

  const handleChat = () => {
    if (!user) {
      toast.error(t('অনুগ্রহ করে লগইন করুন', 'Please login to chat'));
      navigate('/login');
      return;
    }
    sendMessage(`${t('হ্যালো, আমি এই পণ্য সম্পর্কে জানতে চাই', 'Hi, I have a question about')} ${t(product.title_bn, product.title_en)} (ID: ${product.id})`, undefined, undefined, undefined, 'support');
    toast.success(t('বার্তা পাঠানো হয়েছে! ইনবক্স দেখুন।', 'Message sent! Check your inbox.'));
    navigate(user.role === 'admin' ? '/admin/messages' : '/account/messages');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t(product.title_bn, product.title_en),
          text: t(product.desc_bn, product.desc_en),
          url: window.location.href,
        });
      } catch (err) {
        // ignore
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('লিঙ্ক কপি করা হয়েছে', 'Link copied'));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !product) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && selectedImage < product.images.length - 1) {
      setSelectedImage(prev => prev + 1);
    }
    if (isRightSwipe && selectedImage > 0) {
      setSelectedImage(prev => prev - 1);
    }
  };

  // Related products
  const relatedProducts = products
    .filter(p => p.category?.toLowerCase() === product.category?.toLowerCase() && p.id !== product.id)
    .slice(0, 4);

  const productReviews = reviews.filter(r => r.productId === product.id);

  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-24 lg:pb-0">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6 flex items-center gap-2">
          <a href="/" className="hover:text-[#D91976]">{t('হোম', 'Home')}</a>
          <span>/</span>
          <a href="/shop" className="hover:text-[#D91976]">{t('শপ', 'Shop')}</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.category}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
          {/* Gallery */}
          <div className="space-y-4">
            <div
              className="aspect-square bg-white rounded-3xl overflow-hidden relative shadow-lg border border-gray-100 touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={product.images[selectedImage]}
                alt={product.title_en}
                className="w-full h-full object-cover transition-all duration-300"
                key={selectedImage} // Force re-render for transition if needed
              />
              {product.discount_price && (
                <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl">
                  - {discountPercent}% OFF
                </div>
              )}
              {product.isNew && (
                <div className="absolute top-6 right-6 bg-[#D91976] text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl">
                  {t('নতুন', 'NEW')}
                </div>
              )}
              <button
                className={`absolute bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${isInWishlist(product.id)
                  ? 'bg-[#D91976] text-white'
                  : 'bg-white hover:bg-red-50 hover:text-red-500'
                  }`}
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart size={20} className={isInWishlist(product.id) ? 'fill-current' : ''} />
              </button>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-24 h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${selectedImage === idx ? 'border-[#D91976] shadow-md' : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide">{product.category}</p>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
                  {t(product.title_bn, product.title_en)}
                </h1>
              </div>
              {/* Removed duplicate wishlist button from here */}
            </div>

            {/* Price */}
            <div className="flex items-end gap-4 mb-2">
              {product.discount_price ? (
                <>
                  <span className="text-3xl font-bold text-[#D91976]">৳{product.discount_price}</span>
                  <span className="text-xl text-gray-400 line-through mb-1">৳{product.price}</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-[#D91976]">৳{product.price}</span>
              )}
            </div>

            {/* Save Amount */}
            {product.discount_price && (
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                  {t('সাশ্রয় হচ্ছে', 'Save')} ৳{product.price - product.discount_price}
                </div>
                <div className="text-sm text-gray-500">
                  ({discountPercent}% {t('ছাড়', 'off')})
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              {product.stock > 0 ? (
                <>
                  <CheckCircle2 size={18} className="text-pink-600" />
                  <span className="text-pink-600 font-medium">
                    {t('স্টকে আছে', 'In Stock')} ({product.stock} {t('টি বাকি', 'left')})
                  </span>
                </>
              ) : (
                <>
                  <Package size={18} className="text-red-600" />
                  <span className="text-red-600 font-medium">{t('স্টক শেষ', 'Out of Stock')}</span>
                </>
              )}
            </div>

            {/* Color Selection (Dynamic) */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-medium mb-3">{t('রং নির্বাচন করুন', 'Select Color')}</label>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition relative flex items-center justify-center ${selectedColor === color ? 'border-[#D91976] scale-110 shadow-md' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      style={{
                        backgroundColor: COLOR_MAP[color] || '#ddd',
                        ...(color.toLowerCase() === 'white' && { boxShadow: 'inset 0 0 0 1px #e5e7eb' })
                      }}
                      title={color}
                    >
                      {selectedColor === color && (
                        <Check size={16} className={`${color.toLowerCase() === 'white' || color.toLowerCase() === 'yellow' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description - Short Summary */}
            <div className="prose prose-sm text-gray-600 mb-8 whitespace-pre-line">
              <p>{t(product.desc_bn || product.desc_en, product.desc_en)}</p>
            </div>

            {/* Customization Options */}
            {product.isCustomizable && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8 space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <PenTool className="w-4 h-4" />
                  {t('কাস্টমাইজেশন অপশন', 'Customization Options')}
                </h3>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('আপনার নাম/টেক্সট', 'Your Name/Text')}</label>
                  <input
                    type="text"
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:border-[#D91976] focus:outline-none"
                    placeholder="Ex: Rizwan & Qara"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('ছবি আপলোড করুন', 'Upload Image')}</label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-white transition cursor-pointer">
                    <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    {customFile ? (
                      <div className="flex items-center justify-center text-pink-600 gap-2">
                        <Check size={16} /> <span>{t('ফাইল আপলোড হয়েছে', 'File Uploaded')}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <Upload size={20} className="mb-2" />
                        <span className="text-xs">{t('এখানে ক্লিক করুন', 'Click to upload')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">{t('নোট (ঐচ্ছিক)', 'Note (Optional)')}</label>
                  <textarea
                    value={customNote}
                    onChange={e => setCustomNote(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:border-[#D91976] focus:outline-none h-20 resize-none"
                    placeholder={t('অন্য কোনো নির্দেশাবলী...', 'Any other instructions...')}
                  />
                </div>
              </div>
            )}

            {/* Actions: Quantity above Buttons */}
            <div className="mb-8 border-t border-b border-gray-100 py-6">
              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('পরিমাণ', 'Quantity')}</label>
                <div className="flex items-center border border-gray-300 rounded-lg h-12 w-32 shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-full flex items-center justify-center hover:bg-gray-100"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="flex-1 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-full flex items-center justify-center hover:bg-gray-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-white border-2 border-[#D91976] text-[#D91976] font-bold h-14 rounded-full hover:bg-pink-50 transition flex items-center justify-center gap-2 text-lg shadow-sm"
                >
                  <ShoppingBag size={22} />
                  {t('কার্টে যোগ করুন', 'Add to Cart')}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full bg-[#D91976] text-white font-bold h-14 rounded-full hover:bg-pink-700 transition shadow-lg shadow-pink-200 text-lg"
                >
                  {t('এখনই কিনুন', 'Buy Now')}
                </button>
              </div>
            </div>

            {/* Additional Features - Inside Info Column */}
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
              <button onClick={handleChat} className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-[#D91976] py-2 transition">
                <MessageCircle size={18} />
                <span>{t('এই পণ্য সম্পর্কে প্রশ্ন আছে? চ্যাট করুন', 'Questions about this product? Chat with us')}</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Truck size={16} />
                  <span>{t('২-৩ দিনে ডেলিভারি', '2-3 days delivery')}</span>
                </div>
                <button onClick={handleShare} className="flex items-center gap-2 hover:text-[#D91976] text-left transition">
                  <Share2 size={16} />
                  <span>{t('শেয়ার করুন', 'Share with friends')}</span>
                </button>
              </div>
            </div>
          </div> {/* End of Info Column */}
        </div> {/* End of Main Grid */}

        {/* Product Tabs: Description & Reviews */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-16">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'description' ? 'text-[#D91976] border-b-2 border-[#D91976]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {language === 'bn' ? 'পণ্যের বিবরণ' : 'Description'}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'reviews' ? 'text-[#D91976] border-b-2 border-[#D91976]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {language === 'bn' ? 'রিভিউ এবং রেটিং' : 'Reviews & Ratings'} ({product.reviews || 0})
            </button>
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'description' ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="prose max-w-none text-gray-600 space-y-4">
                  <p className="whitespace-pre-line leading-relaxed">
                    {language === 'bn' ? (product.desc_bn || product.desc_en) : product.desc_en}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-100">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">{language === 'bn' ? 'বৈশিষ্ট্য' : 'Features'}</h4>
                      <ul className="list-disc list-inside space-y-2 text-sm">
                        {product.isCustomizable && <li>{language === 'bn' ? 'কাস্টমাইজেবল ডিজাইন' : 'Customizable Design'}</li>}
                        {product.itemType && <li>{t('টাইপ', 'Type')}: {product.itemType}</li>}
                        {product.colors && product.colors.length > 0 && <li>{t('রঙ', 'Colors')}: {product.colors.join(', ')}</li>}
                        {product.subCategory && <li>{t('ম্যাটেরিয়াল', 'Material')}: {product.subCategory}</li>}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">{t('ডেলিভারি ও রিটার্ন', 'Delivery & Returns')}</h4>
                      <ul className="list-disc list-inside space-y-2 text-sm">
                        <li>{t('সারা বাংলাদেশে হোম ডেলিভারি', 'Home delivery across Bangladesh')}</li>
                        <li>{t('৩-৫ দিনের মধ্যে ডেলিভারি', 'Delivery within 3-5 days')}</li>
                        <li>{t('৭ দিনের সহজ রিটার্ন পলিসি', '7 days easy return policy')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Star className="text-yellow-400 fill-yellow-400" />
                  {t('রিভিউ এবং রেটিং', 'Reviews & Ratings')}
                </h2>

                {/* Rating Summary */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="text-5xl font-bold text-gray-900">{(product.rating || 0).toFixed(1)}</div>
                  <div>
                    <div className="flex text-yellow-400 text-lg">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} className={i < Math.round(product.rating || 0) ? 'fill-current' : 'text-gray-200'} />
                      ))}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{product.reviews || 0} reviews</p>
                  </div>
                </div>

                {/* Write Review Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                  <h3 className="font-bold text-lg mb-4">{t('একটি রিভিউ লিখুন', 'Write a Review')}</h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">{t('রেটিং', 'Rating')}</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewReviewRating(star)}
                          className="focus:outline-none transition transform hover:scale-110"
                        >
                          <Star
                            size={24}
                            className={`${star <= newReviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">{t('আপনার রিভিউ', 'Your Review')}</label>
                    <textarea
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-[#D91976] focus:outline-none h-32 resize-none transition"
                      placeholder={t('এই পণ্য সম্পর্কে আপনার অভিজ্ঞতা শেয়ার করুন...', 'Share your experience with this product...')}
                    />
                  </div>

                  <button
                    onClick={handleReviewSubmit}
                    disabled={isSubmittingReview}
                    className="bg-[#D91976] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#A8145A] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingReview ? t('জমা দেওয়া হচ্ছে...', 'Submitting...') : t('রিভিউ জমা দিন', 'Submit Review')}
                  </button>
                </div>

                {productReviews.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {productReviews.map((review) => (
                      <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                            <UserIcon size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{review.userName}</p>
                            <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex text-yellow-400 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < review.rating ? 'fill-current' : 'text-gray-200'} />
                          ))}
                        </div>
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <p className="text-gray-500">{t('কোনো রিভিউ নেই', 'No reviews yet')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingBag className="text-[#D91976]" size={20} />
              {t('অনুরূপ পণ্য', 'Similar Products')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-3 lg:hidden z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
        <div className="flex gap-3 items-center max-w-lg mx-auto">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-white border-2 border-[#D91976] text-[#D91976] font-bold h-12 rounded-full hover:bg-pink-50 active:scale-95 transition flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <ShoppingBag size={18} />
            <span>{t('কার্ট', 'Add to Cart')}</span>
          </button>

          <button
            onClick={handleBuyNow}
            className="flex-2 bg-[#D91976] text-white font-bold h-12 rounded-full hover:bg-pink-700 active:scale-95 transition shadow-lg shadow-pink-200 text-sm"
          >
            {t('এখনই কিনুন', 'Buy Now')}
          </button>
        </div>
      </div>
    </div >
  );
};