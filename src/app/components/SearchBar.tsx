import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, Camera, Loader2, ChevronRight, Tag } from 'lucide-react';
import { useStore } from '@/app/context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';

export const SearchBar: React.FC = () => {
  // Safe context access with fallback
  let store;
  try {
    store = useStore();
  } catch (error) {
    return (
      <div className="relative flex-1 max-w-2xl">
        <input type="text" disabled className="w-full px-5 py-2.5 rounded-full border border-gray-200 bg-gray-50" />
      </div>
    );
  }

  const { products, language, t } = store;
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [groupedResults, setGroupedResults] = useState<{ [key: string]: typeof products }>({});
  const [matchedCategories, setMatchedCategories] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Smart Search Logic
  useEffect(() => {
    if (query.trim().length > 1) {
      const lowerQuery = query.toLowerCase();

      // 1. Find matched categories first
      const allCategories = Array.from(new Set(products.map(p => p.category)));
      const matchedCats = allCategories.filter(c => c.toLowerCase().includes(lowerQuery));
      setMatchedCategories(matchedCats);

      // 2. Filter products
      const filtered = products.filter(
        (p) =>
          p.title_en.toLowerCase().includes(lowerQuery) ||
          p.title_bn.toLowerCase().includes(lowerQuery) ||
          p.category.toLowerCase().includes(lowerQuery)
      );

      // 3. Group by Category
      const grouped: { [key: string]: typeof products } = {};
      filtered.forEach(p => {
        if (!grouped[p.category]) grouped[p.category] = [];
        grouped[p.category].push(p);
      });

      setGroupedResults(grouped);
      setIsOpen(true);
    } else {
      setGroupedResults({});
      setMatchedCategories([]);
      setIsOpen(false);
    }
  }, [query, products]);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query)}`);
      setQuery('');
      setIsOpen(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Show Preview
    const previewUrl = URL.createObjectURL(file);
    setUploadedImagePreview(previewUrl);

    setIsUploading(true);
    setIsOpen(true);
    setGroupedResults({});
    setMatchedCategories([]);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const api_url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${api_url}/products/search-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();

      // Group Visual Matches Results
      const grouped: { [key: string]: typeof products } = {
        'Visual Matches': data
      };
      setGroupedResults(grouped);

    } catch (error) {
      console.error("Visual search error:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setQuery('');
    setIsOpen(false);
    setUploadedImagePreview(null);
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
    setQuery('');
    setIsOpen(false);
  };

  const hasResults = Object.keys(groupedResults).length > 0;

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl z-50">
      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('পণ্য খুঁজুন বা ছবি আপলোড করুন...', 'Search for products or brands...')}
          className="w-full px-5 py-3 pl-12 pr-24 rounded-full border border-gray-200 focus:border-[#D91976] focus:outline-none focus:ring-4 focus:ring-[#D91976]/10 transition-all bg-stone-50 focus:bg-white shadow-sm hover:shadow-md"
        />
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D91976] transition-colors"
          size={20}
        />

        {/* Right Action Buttons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white pl-2 rounded-l-full">
          {/* Image Preview Tiny */}
          {uploadedImagePreview && (
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#D91976]">
              <img src={uploadedImagePreview} className="w-full h-full object-cover" alt="Preview" />
              <button
                type="button"
                onClick={() => { setUploadedImagePreview(null); setGroupedResults({}); }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          )}

          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setIsOpen(false); }}
              className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition"
            >
              <X size={18} />
            </button>
          )}

          <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`text-gray-400 hover:text-[#D91976] transition-all p-1.5 hover:bg-pink-50 rounded-full ${isUploading ? 'animate-pulse bg-pink-50 text-[#D91976]' : ''}`}
            title="Search by Lens"
          >
            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
      </form>

      {/* Smart Search Dropdown */}
      <AnimatePresence>
        {isOpen && (hasResults || matchedCategories.length > 0 || isUploading) && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-3 w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 ring-1 ring-black/5 overflow-hidden flex flex-col max-h-[70vh]"
          >
            {/* 1. Analyzying State */}
            {isUploading && (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full animate-pulse"></div>
                  <Loader2 className="w-10 h-10 text-[#D91976] animate-spin relative z-10" />
                </div>
                <h3 className="text-stone-800 font-bold">{t('ছবি বিশ্লেষণ করা হচ্ছে...', 'Analyzing Image...')}</h3>
                <p className="text-xs text-stone-500">{t('আমরা ভিজ্যুয়াল প্যাটার্ন খুঁজছি', 'Searching for visual matches')}</p>
              </div>
            )}

            {/* 2. Matched Categories Section */}
            {!isUploading && matchedCategories.length > 0 && (
              <div className="px-2 pt-2">
                <div className="flex flex-wrap gap-2 p-2">
                  {matchedCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-[#D91976] hover:text-white rounded-full text-xs font-semibold text-stone-600 transition-all border border-stone-200 hover:border-[#D91976]"
                    >
                      <Tag size={12} />
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="h-[1px] bg-stone-100 mx-4"></div>
              </div>
            )}

            {/* 3. Grouped Products Section */}
            {!isUploading && (
              <div className="overflow-y-auto custom-scrollbar p-2">
                {Object.entries(groupedResults).map(([category, items]) => (
                  <div key={category} className="mb-4 last:mb-0">
                    <div className="flex items-center justify-between px-3 py-1.5 mb-1">
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">{category}</h4>
                      <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-md">{items.length}</span>
                    </div>

                    <div className="grid gap-1">
                      {items.slice(0, 3).map(product => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product.id)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition group border border-transparent hover:border-stone-100"
                        >
                          <div className="w-12 h-12 rounded-lg bg-white overflow-hidden border border-stone-100 shadow-sm shrink-0">
                            <img
                              src={product.images[0]}
                              alt={product.title_en}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <h5 className="text-sm font-semibold text-stone-700 truncate group-hover:text-[#D91976] transition">
                              {language === 'bn' ? product.title_bn : product.title_en}
                            </h5>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-bold text-[#D91976]">
                                ৳{product.discount_price || product.price}
                              </span>
                              {product.discount_price && (
                                <span className="text-[10px] text-stone-400 line-through">
                                  ৳{product.price}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-stone-300 group-hover:translate-x-1 transition" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* View All Button */}
                <button
                  onClick={() => navigate(`/shop?q=${encodeURIComponent(query)}`)}
                  className="w-full mt-2 py-3 bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                >
                  {t('সব ফলাফল দেখুন', 'View All Results')}
                  <ChevronRight size={12} />
                </button>
              </div>
            )}

            {/* No Results */}
            {!isUploading && !hasResults && matchedCategories.length === 0 && (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-stone-50 rounded-full mb-3">
                  <Search className="text-stone-300" size={24} />
                </div>
                <p className="text-stone-500 text-sm font-medium">{t('কোন পণ্য পাওয়া যায়নি', 'No products found')}</p>
                <p className="text-xs text-stone-400 mt-1">{t('ভিন্ন শব্দ বা বিভাগ চেষ্টা করুন', 'Try different keywords')}</p>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};