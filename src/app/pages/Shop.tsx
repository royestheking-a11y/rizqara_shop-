import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/app/context/StoreContext';
import { useSearchParams, Link } from 'react-router';
import { Filter, X, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '@/app/components/ProductCard';
import SEO from '@/app/components/SEO';

export const Shop = () => {
  const { products, t, language } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('cat');
  const searchParam = searchParams.get('q');

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const allCategories = [
    { id: 'All', bn: 'সব পণ্য', en: 'All' },
    { id: 'Clay', bn: 'ক্লে', en: 'Clay' },
    { id: 'Women', bn: 'উইমেন', en: 'Women' },
    { id: 'Gifts', bn: 'গিফট', en: 'Gifts' },
    { id: 'Art', bn: 'আর্ট', en: 'Art' },
    { id: 'Custom', bn: 'কাস্টম', en: 'Custom' },
    { id: 'Jewelry', bn: 'জুয়েলারি & অ্যাক্সেসরিজ', en: 'Jewelry', mapTo: 'Women' },
    { id: 'Organic', bn: 'অর্গানিক প্রোডাক্ট', en: 'Organic', mapTo: 'Custom' },
    { id: 'Handmade', bn: 'হ্যান্ডমেড & ক্রাফট', en: 'Handmade', mapTo: 'Gifts' },
    { id: 'Plants', bn: 'প্ল্যান্টস', en: 'Plants' },
  ];

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by Category
    if (selectedCategory !== 'All') {
      const catObj = allCategories.find(c =>
        c.id.toLowerCase() === selectedCategory.toLowerCase() ||
        c.bn === selectedCategory ||
        c.en.toLowerCase() === selectedCategory.toLowerCase()
      );
      const targetCat = catObj ? (catObj.mapTo || catObj.id) : selectedCategory;
      filtered = filtered.filter(p => p.category === targetCat);
    }

    // Filter by Search
    if (searchParam) {
      const q = searchParam.toLowerCase();
      filtered = filtered.filter(p =>
        (p.title_en?.toLowerCase() || '').includes(q) ||
        (p.title_bn?.toLowerCase() || '').includes(q) ||
        (p.category?.toLowerCase() || '').includes(q) ||
        (p.desc_en?.toLowerCase() || '').includes(q) ||
        (p.desc_bn?.toLowerCase() || '').includes(q)
      );
    }

    // Filter by Price
    filtered = filtered.filter(p => {
      const price = p.discount_price || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    if (sortBy === 'price_asc') {
      filtered = [...filtered].sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
    } else if (sortBy === 'price_desc') {
      filtered = [...filtered].sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
    } else if (sortBy === 'newest') {
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return filtered;
  }, [products, selectedCategory, searchParam, priceRange, sortBy, allCategories]);

  const getSeoData = () => {
    const category = selectedCategory.toLowerCase();

    if (category === 'women') {
      return {
        title: t('Women’s Items | Saree, Jewelry & Accessories in Bangladesh | Rizqara Shop', 'Women’s Items | Saree, Jewelry & Accessories in Bangladesh | Rizqara Shop'),
        description: t('নারীদের শাড়ি, গহনা ও ফ্যাশন অ্যাক্সেসরিজ কিনুন রিজকারা শপ থেকে। প্রিমিয়াম ও ট্রেন্ডি কালেকশন—গিফট বা নিজের জন্য সেরা পছন্দ।', 'Buy women\'s sarees, jewelry, and fashion accessories from Rizqara Shop. Premium and trendy collection - best choice for gifts or yourself.'),
        url: `https://rizqarashop.vercel.app/shop?cat=Women`
      };
    }
    if (category === 'gifts') {
      return {
        title: t('Gift Collection | Custom Gift Boxes & Surprise Gifts | Rizqara Shop', 'Gift Collection | Custom Gift Boxes & Surprise Gifts | Rizqara Shop'),
        description: t('জন্মদিন, ঈদ, পূজা, ভালোবাসা দিবস—সব উপলক্ষের জন্য গিফট বক্স, কাস্টম গিফট ও সারপ্রাইজ গিফট কিনুন রিজকারা শপ থেকে।', 'Buy gift boxes, custom gifts, and surprise gifts for birthdays, Eid, Puja, Valentine\'s Day - for all occasions from Rizqara Shop.'),
        url: `https://rizqarashop.vercel.app/shop?cat=Gifts`
      };
    }
    if (category === 'art') {
      return {
        title: t('Art & Sketch | Wall Art, Portrait & Creative Gifts | Rizqara Shop', 'Art & Sketch | Wall Art, Portrait & Creative Gifts | Rizqara Shop'),
        description: t('আর্ট, স্কেচ ও ওয়াল আর্ট কালেকশন দেখুন রিজকারা শপে। কাস্টম পোর্ট্রেট, ফ্রেম আর্ট ও ইউনিক গিফট—সব একসাথে।', 'Explore art, sketch, and wall art collections at Rizqara Shop. Custom portraits, framed art, and unique gifts - all in one place.'),
        url: `https://rizqarashop.vercel.app/shop?cat=Art`
      };
    }
    if (category === 'custom') {
      return {
        title: t('Custom Products | Personalized Gifts & Handmade Orders | Rizqara Shop', 'Custom Products | Personalized Gifts & Handmade Orders | Rizqara Shop'),
        description: t('আপনার পছন্দমতো কাস্টম পণ্য অর্ডার করুন—নাম লেখা গিফট, কাস্টম ফ্রেম, কাস্টম বক্স ও আরও অনেক কিছু। রিজকারা শপ—আপনার আইডিয়া, আমাদের সৃষ্টি।', 'Order custom products as you like - personalized gifts, custom frames, custom boxes, and more. Rizqara Shop - Your Idea, Our Creation.'),
        url: `https://rizqarashop.vercel.app/shop?cat=Custom`
      };
    }
    if (category === 'plants') {
      return {
        title: t('Plants & Home Greenery | Pots, Decor & Gifts | Rizqara Shop', 'Plants & Home Greenery | Pots, Decor & Gifts | Rizqara Shop'),
        description: t('গাছপালা, টব, প্ল্যান্ট ডেকোর ও হোম গ্রীনারি কালেকশন কিনুন রিজকারা শপ থেকে। ঘর সাজাতে বা গিফট দিতে পারফেক্ট।', 'Buy plants, pots, plant decor, and home greenery collections from Rizqara Shop. Perfect for home decoration or gifting.'),
        url: `https://rizqarashop.vercel.app/shop?cat=Plants`
      };
    }
    if (category === 'clay') {
      return {
        title: t('মাটির পণ্য | হ্যান্ডমেড মৃৎশিল্প ও ক্রাফট বাংলাদেশ', 'Clay Products | Handmade Pottery & Clay Crafts in Bangladesh'),
        description: t('মাটির তৈরি ফুলদানি, কাপ, ডেকোর ও কিচেন আইটেম কিনুন রিজকারা শপ থেকে। খাঁটি হ্যান্ডমেড ক্লে প্রোডাক্ট।', 'Buy clay vases, cups, decor and kitchen items from Rizqara Shop. Authentic handmade clay products.'),
        url: `https://rizqarashop.vercel.app/shop?cat=Clay`
      };
    }
    return {
      title: t('সব পণ্য | রিজকারা শপ', 'Shop All Products | Handmade & Custom Gifts | Rizqara Shop'),
      description: t('আমাদের সম্পূর্ণ কালেকশন দেখুন। রিজকারা শপ - হ্যান্ডমেড ক্রাফট এবং গিফটের জন্য সেরা ঠিকানা।', 'Explore our complete collection. Rizqara Shop - The best destination for handmade crafts and gifts.'),
      url: `https://rizqarashop.vercel.app/shop`
    };
  };

  const seoData = getSeoData();

  return (
    <div className="bg-gray-50 min-h-screen">
      <SEO
        title={seoData.title}
        description={seoData.description}
        url={seoData.url}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                {selectedCategory !== 'All'
                  ? selectedCategory
                  : t('সব পণ্য', 'All Products')
                }
              </h1>
              <p className="text-gray-600">
                {filteredProducts.length} {t('টি পণ্য পাওয়া গেছে', 'products found')}
              </p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="md:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex-1"
              >
                <Filter size={18} /> {t('ফিল্টার', 'Filter')}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#D91976] focus:ring-2 focus:ring-[#D91976]/20 transition flex-1 md:flex-initial"
              >
                <option value="newest">{t('নতুন', 'Newest')}</option>
                <option value="price_asc">{t('দাম কম থেকে বেশি', 'Price: Low to High')}</option>
                <option value="price_desc">{t('দাম বেশি থেকে কম', 'Price: High to Low')}</option>
                <option value="rating">{t('রেটিং', 'Rating')}</option>
              </select>

              <Link
                to="/gift-generator"
                className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition font-medium text-sm whitespace-nowrap"
              >
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <Gift size={12} fill="currentColor" />
                </div>
                {t('উপহার খুঁজছেন?', 'Need Gift Help?')}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden md:block w-72 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-bold mb-4 text-lg">{t('ক্যাটাগরি', 'Categories')}</h3>
                <ul className="space-y-2">
                  {allCategories.map(cat => (
                    <li key={cat.id}>
                      <button
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setSearchParams({ cat: cat.id === 'All' ? '' : cat.id });
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg transition font-medium ${selectedCategory === cat.id
                          ? 'bg-[#D91976] text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {language === 'bn' ? cat.bn : cat.en}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="font-bold mb-4 text-lg">{t('দাম', 'Price Range')}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                  <span className="font-medium">৳{priceRange[0]}</span>
                  <span>-</span>
                  <span className="font-medium">৳{priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20000"
                  step="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full accent-[#D91976] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>৳0</span>
                  <span>৳20,000</span>
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setPriceRange([0, 10000]);
                  setSortBy('newest');
                  setSearchParams({});
                }}
                className="w-full py-2.5 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition"
              >
                {t('ফিল্টার রিসেট করুন', 'Reset Filters')}
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-20 text-center shadow-sm border border-gray-100">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Filter size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('কোন পণ্য পাওয়া যায়নি', 'No products found')}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t('অন্য ফিল্টার ব্যবহার করে দেখুন', 'Try different filters or search terms')}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setPriceRange([0, 10000]);
                      setSearchParams({});
                    }}
                    className="px-6 py-3 bg-[#D91976] text-white rounded-lg font-medium hover:bg-[#A8145A] transition"
                  >
                    {t('সব ফিল্টার মুছুন', 'Clear all filters')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Sheet */}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFilterOpen(false)}
                className="fixed inset-0 bg-black z-50 md:hidden"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed inset-x-0 bottom-0 bg-white z-[51] rounded-t-2xl p-6 md:hidden h-[80vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">{t('ফিল্টার', 'Filters')}</h3>
                  <button onClick={() => setIsFilterOpen(false)}><X /></button>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="font-semibold mb-3">{t('ক্য��টাগরি', 'Category')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {allCategories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-4 py-2 rounded-full text-sm border ${selectedCategory === cat.id ? 'bg-[#D91976] text-white border-[#D91976]' : 'border-gray-200 text-gray-600'}`}
                        >
                          {language === 'bn' ? cat.bn : cat.en}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">{t('দাম', 'Price Range')} (Max: ৳{priceRange[1]})</h4>
                    <input
                      type="range"
                      min="0"
                      max="20000"
                      step="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full accent-[#D91976]"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full bg-[#D91976] text-white py-3 rounded-lg font-bold"
                  >
                    {t('প্রয়োগ করুন', 'Apply')}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};