import React from 'react';
import { useStore } from '@/app/context/StoreContext';
import { Link } from 'react-router';
import { ArrowRight, PenTool, Gift, Palette, Tag, Copy, Check, ShoppingBag, Leaf } from 'lucide-react';
import { HeroCarousel } from '@/app/components/HeroCarousel';
import { ProductCard } from '@/app/components/ProductCard';
import { SearchBar } from '@/app/components/SearchBar';
import { ProductCardSkeleton } from '@/app/components/Skeleton';
import bdCustomCraftImg from '@/assets/bd_custom_craft.png';

export const Home = () => {
  const { t, products, vouchers, isLoading } = useStore();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const bestSellers = products.filter(p => p.isBestSeller || (p.rating && p.rating > 4.5));
  const newArrivals = products.filter(p => p.isNew);
  const dealProducts = products.filter(p => p.discount_price);

  // Get active vouchers that haven't expired
  const activeVouchers = vouchers.filter(v => {
    if (!v.isActive) return false;
    const now = new Date();
    const validUntil = new Date(v.validUntil);
    const isLimitReached = v.usageLimit && v.usedCount >= v.usageLimit;
    return now <= validUntil && !isLimitReached;
  }).slice(0, 3);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const categories = [
    {
      id: 'Clay',
      name_bn: 'মাটির শিল্প',
      name_en: 'Clay Art',
      img: '/categories/clay.png',
      icon: <Palette />,
      count: products.filter(p => p.category === 'Clay').length
    },
    {
      id: 'Women',
      name_bn: 'উইমেন প্রোডাক্ট',
      name_en: 'Women',
      img: '/categories/women.png',
      icon: <ShoppingBag />,
      count: products.filter(p => p.category === 'Women').length
    },
    {
      id: 'Gifts',
      name_bn: 'গিফট বক্স',
      name_en: 'Gift Box',
      img: '/categories/gift.png',
      icon: <Gift />,
      count: products.filter(p => p.category === 'Gifts').length
    },
    {
      id: 'Art',
      name_bn: 'ওয়াল আর্ট',
      name_en: 'Wall Art',
      img: '/categories/art_sketch.png',
      icon: <Palette />,
      count: products.filter(p => p.category === 'Art').length
    },
    {
      id: 'Custom',
      name_bn: 'কাস্টমাইজড',
      name_en: 'Customized',
      img: '/categories/custom_product.png',
      icon: <PenTool />,
      count: products.filter(p => p.category === 'Custom').length
    },
    {
      id: 'Plants',
      name_bn: 'ইনডোর প্ল্যান্টস',
      name_en: 'Plants',
      img: '/categories/indoor_plants.png',
      icon: <Leaf />,
      count: products.filter(p => p.category === 'Plants').length
    },
  ];

  const renderCategorySection = (id: string, name_bn: string, name_en: string, desc: string, isGray: boolean) => {
    const catProducts = products.filter(p => p.category === id).slice(0, 12);
    return (
      <section key={id} className={`py-16 ${isGray ? 'bg-gray-50' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-gray-900">
                {t(name_bn, name_en)}
              </h2>
              <p className="text-gray-600">{t(desc, desc)}</p>
            </div>
            <Link to={`/shop?cat=${id}`} className="text-[#D91976] font-bold hover:underline flex items-center gap-2">
              {t('আরো দেখুন', 'View More')} <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {catProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="font-sans bg-gray-50">
      {/* Mobile Search Bar */}
      <div className="md:hidden bg-white px-4 py-3 border-b border-gray-100 sticky top-20 z-30 shadow-sm">
        <SearchBar />
      </div>

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Gift Generator Mini Banner */}
      <section className="py-8 bg-pink-50 border-y border-pink-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white rounded-2xl p-6 shadow-sm border border-pink-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-[#D91976] animate-pulse">
                <Gift size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-[#D91976]">{t('অনুভূতি দিয়ে প্রিয়জনের জন্য সেরা উপহার বাছাই করুন', 'Select the best gift for loved ones with emotion')}</h3>
                <p className="text-sm text-gray-500">{t('১ মিনিটেই সেরা উপহার খুঁজুন।', 'Find the best gift in just 1 minute.')}</p>
              </div>
            </div>

            <Link
              to="/gift-generator"
              className="px-8 py-3 bg-[#D91976] text-white font-bold rounded-full hover:bg-[#A8145A] transition shadow-lg hover:shadow-xl shadow-pink-200 flex items-center gap-2 whitespace-nowrap"
            >
              <Gift size={20} />
              {t('উপহার দিন', 'Give a Gift')}
            </Link>
          </div>
        </div>
      </section>
      {dealProducts.length > 0 && (
        <section className="py-12 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <Tag className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-bold text-gray-900">{t('ফ্ল্যাশ ডিল', 'Flash Deals')}</h2>
                  <p className="text-sm text-gray-600">{t('সীমিত সময়ের অফার', 'Limited time offers')}</p>
                </div>
              </div>
              <Link to="/shop" className="text-[#D91976] font-bold hover:underline flex items-center gap-2">
                {t('সব দেখুন', 'View All')} <ArrowRight size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {dealProducts.slice(0, 12).map(product => (
                <ProductCard key={product.id} product={product} disableHoverEffect={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-gray-900">
              {t('জনপ্রিয় ক্যাটাগরি', 'Shop by Category')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('আপনার পছন্দের পণ্য খুঁজে নিন', 'Find your favorite products')}
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {categories.map((cat) => (
              <Link
                to={`/shop?cat=${cat.id}`}
                key={cat.id}
                className="group relative rounded-xl overflow-hidden aspect-square shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <img
                  src={cat.img}
                  alt={cat.name_en}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-3 md:p-4 text-white">
                  <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="mb-1 opacity-80 scale-90 origin-left">{cat.icon}</div>
                    <h2 className="text-sm md:text-base font-bold font-serif mb-0.5">
                      {t(cat.name_bn, cat.name_en)}
                    </h2>
                    <p className="text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-1">
                      {cat.count} {t('টি পণ্য', 'Products')} <ArrowRight size={10} />
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-gray-900">
                {t('নতুন কালেকশন', 'New Arrivals')}
              </h2>
              <p className="text-gray-600">{t('এই সিজনের ট্রেন্ডি পণ্য', 'Trendy products this season')}</p>
            </div>
            <Link to="/shop" className="text-[#D91976] font-bold hover:underline flex items-center gap-2">
              {t('আরো দেখুন', 'View More')} <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoading ? (
              // Show Skeletons while loading
              [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
            ) : newArrivals.length > 0 ? (
              newArrivals.slice(0, 12).map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              products.slice(0, 12).map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Custom Sketch Section (New Service) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-[#6B0F41] via-[#9C1461] to-[#D91976] rounded-2xl overflow-hidden shadow-lg relative text-white max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[280px] md:min-h-[380px]">
              <div className="p-6 md:p-8 flex flex-col justify-center relative z-10 order-2 md:order-1">
                <div className="flex items-center gap-2 mb-3 text-pink-300">
                  <PenTool size={20} />
                  <span className="font-bold uppercase tracking-widest text-xs">
                    {t('নতুন সেবা', 'New Service')}
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3 leading-tight">
                  {t('কাস্টম স্কেচ — আপনার আইডিয়া, আমাদের সৃষ্টি', 'Custom Sketch — Your Idea, Our Creation')}
                </h2>

                <p className="text-gray-200 text-sm md:text-base mb-6 leading-relaxed">
                  {t('নিজের ছবি বা ডিজাইন আইডিয়া আপলোড করুন, আমরা তা বাস্তবায়ন করব হাতে আঁকা পেন্সিল স্কেচ অথবা ডিজিটাল স্কেচের মাধ্যমে। আপনার প্রিয় মানুষ অথবা নিজের জন্য একটি অনন্য উপহার তৈরি করুন।', 'Upload your photo or design idea, and we will bring it to life through hand-drawn pencil sketches or digital sketches. Create a unique gift for your loved ones or yourself.')}
                </p>

                <Link
                  to="/custom-sketch"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#6B0F41] font-bold rounded-lg text-sm md:text-base shadow-lg hover:bg-gray-100 transition-all hover:-translate-y-1 w-fit"
                >
                  {t('শুরু করুন', 'Start Now')}
                  <ArrowRight size={18} />
                </Link>
              </div>

              <div className="relative h-56 md:h-full order-1 md:order-2">
                <img
                  src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800"
                  alt="Custom Sketch Art"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent via-[#9C1461]/20 to-[#6B0F41] md:to-[#9C1461]" />
              </div>
            </div>

            {/* Background decoration */}

          </div>
        </div>
      </section>

      {/* Women Product Section */}
      {renderCategorySection('Women', 'উইমেন প্রোডাক্ট', 'Women Collection', 'মেয়েদের জন্য বিশেষ কালেকশন', true)}

      {/* Best Sellers Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-gray-900">
                {t('সেরা বিক্রীত পণ্য', 'Best Sellers')}
              </h2>
              <p className="text-gray-600">{t('গ্রাহকদের পছন্দের শীর্ষে', 'Top picked by customers')}</p>
            </div>
            <Link to="/shop" className="text-[#D91976] font-bold hover:underline flex items-center gap-2">
              {t('সব দেখুন', 'View All')} <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.slice(0, 12).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Clay Art Section */}
      {renderCategorySection('Clay', 'মাটির শিল্প', 'Clay Art', 'ঐতিহ্যবাহী মাটির শিল্প', true)}

      {/* Indoor Plants Section */}
      {renderCategorySection('Plants', 'ইনডোর প্ল্যান্টস', 'Plants Collection', 'আপনার ঘরের জন্য সতেজতা', false)}



      {/* Vouchers and Custom Design Combined */}
      <section className="py-16 bg-gradient-to-br from-[#D91976]/5 via-pink-50 to-pink-100/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D91976] text-white rounded-full mb-4">
              <Tag size={32} />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-gray-900">
              {t('বাউচার ও অফার', 'Vouchers & Offers')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('আপনার জন্য বিশেষ অফার এবং কাস্টমাইজেশন', 'Special offers and customization for you')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Vouchers */}
            {activeVouchers.map(voucher => (
              <div
                key={voucher.code}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#D91976]/10 flex flex-col"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#D91976] to-[#E84A9C] p-3 text-white text-center">
                  <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-3 py-0.5 mb-1.5">
                    <p className="text-lg font-bold">{voucher.discount}% OFF</p>
                  </div>
                  <p className="text-[10px] opacity-90">
                    {t('সর্বোচ্চ', 'Up to')} ৳{voucher.maxDiscount.toLocaleString()}
                  </p>
                </div>

                {/* Body */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] text-gray-600 mb-2.5 text-center line-clamp-2 min-h-[2.5em]">
                      {t(voucher.description_bn, voucher.description_en)}
                    </p>

                    {/* Min Purchase */}
                    <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 mb-3">
                      <span>{t('ন্যূনতম', 'Min')}:</span>
                      <span className="font-bold text-gray-700">৳{voucher.minPurchase.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Voucher Code */}
                  <div className="relative mt-auto">
                    <div className="flex items-center gap-1 bg-gray-50 border border-dashed border-[#D91976] rounded-lg p-2">
                      <Tag className="text-[#D91976] shrink-0" size={14} />
                      <span className="flex-1 font-mono font-bold text-gray-900 text-center text-sm truncate">
                        {voucher.code}
                      </span>
                      <button
                        onClick={() => copyToClipboard(voucher.code)}
                        className="p-1.5 bg-[#D91976] text-white rounded hover:bg-[#A8145A] transition shrink-0"
                        title={t('কপি করুন', 'Copy code')}
                      >
                        {copiedCode === voucher.code ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                    {copiedCode === voucher.code && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                        {t('কপি হয়েছে!', 'Copied!')}
                      </div>
                    )}
                  </div>

                  {/* Valid Until */}
                  <p className="text-[10px] text-center text-gray-400 mt-2">
                    {new Date(voucher.validUntil).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Design Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-[#6B0F41] via-[#9C1461] to-[#D91976] rounded-2xl overflow-hidden shadow-lg relative text-white max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[280px] md:min-h-[380px]">
              <div className="p-6 md:p-8 flex flex-col justify-center relative z-10 order-2 md:order-1">
                <div className="flex items-center gap-2 mb-3 text-pink-300">
                  <PenTool size={20} />
                  <span className="font-bold uppercase tracking-widest text-xs">
                    {t('কাস্টম ডিজাইন', 'Custom Design')}
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3 leading-tight">
                  {t('আপনার ডিজাইন, আমাদের সৃষ্টি', 'Your Vision, Our Craft')}
                </h2>

                <p className="text-gray-200 text-sm md:text-base mb-6 leading-relaxed">
                  {t('নিজের ছবি বা ডিজাইন আপলোড করুন এবং আমরা তা বাস্তবায়িত করব। অনন্য উপহার বা নিজের জন্য সেরা পছন্দ।', 'Upload your photo or design and we will bring it to life. Perfect for unique gifts or personal treats.')}
                </p>

                <Link
                  to="/custom-craft"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#6B0F41] font-bold rounded-lg text-sm md:text-base shadow-lg hover:bg-gray-100 transition-all hover:-translate-y-1 w-fit"
                >
                  {t('শুরু করুন', 'Start Customizing')}
                  <ArrowRight size={18} />
                </Link>
              </div>

              <div className="relative h-56 md:h-full order-1 md:order-2">
                <img
                  src={bdCustomCraftImg}
                  alt="Custom Design Art"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent via-[#9C1461]/20 to-[#6B0F41] md:to-[#9C1461]" />
              </div>
            </div>

            {/* Background decoration */}

          </div>
        </div>
      </section>
    </div>
  );
};