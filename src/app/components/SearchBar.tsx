import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, X } from 'lucide-react';
import { useStore } from '@/app/context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';

export const SearchBar: React.FC = () => {
  // Safe context access with fallback
  let store;
  try {
    store = useStore();
  } catch (error) {
    // Fallback during hot reload
    return (
      <div className="relative flex-1 max-w-2xl">
        <input
          type="text"
          placeholder="Search products..."
          disabled
          className="w-full px-5 py-2.5 pl-12 pr-12 rounded-full border border-gray-200 bg-gray-50"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      </div>
    );
  }

  const { products, language, t } = store;
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<typeof products>([]);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length > 1) {
      const filtered = products.filter(
        (p) =>
          p.title_en.toLowerCase().includes(query.toLowerCase()) ||
          p.title_bn.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, products]);

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

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('পণ্য খুঁজুন...', 'Search products...')}
          className="w-full px-5 py-2.5 pl-12 pr-12 rounded-full border border-gray-200 focus:border-[#D91976] focus:outline-none focus:ring-2 focus:ring-[#D91976]/20 transition bg-gray-50 focus:bg-white"
        />
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </form>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[500px] overflow-y-auto"
          >
            <div className="p-3">
              <p className="text-xs text-gray-500 font-medium mb-2 px-3">
                {t('খোঁজার ফলাফল', 'Search Results')} ({results.length})
              </p>
              <div className="space-y-1">
                {results.slice(0, 8).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition text-left group"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={product.images[0]}
                        alt={product.title_en}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate group-hover:text-[#D91976] transition">
                        {language === 'bn' ? product.title_bn : product.title_en}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {product.category}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {product.discount_price ? (
                          <>
                            <span className="font-bold text-[#D91976] text-sm">
                              ৳{product.discount_price}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              ৳{product.price}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-[#D91976] text-sm">
                            ৳{product.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {results.length > 8 && (
                <button
                  onClick={() => {
                    navigate(`/shop?q=${encodeURIComponent(query)}`);
                    setQuery('');
                    setIsOpen(false);
                  }}
                  className="w-full mt-2 py-2.5 text-center text-[#D91976] font-medium hover:bg-pink-50 rounded-lg transition"
                >
                  {t('সব ফলাফল দেখুন', 'View all results')} ({results.length})
                </button>
              )}
            </div>
          </motion.div>
        )}
        {isOpen && query.trim().length > 1 && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 text-center z-50"
          >
            <p className="text-gray-500">
              {t('কোন পণ্য পাওয়া যায়নি', 'No products found')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};