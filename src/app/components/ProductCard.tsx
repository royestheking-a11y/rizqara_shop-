import React from 'react';
import { Link, useNavigate } from 'react-router';
import { ShoppingCart, Heart, Gift } from 'lucide-react';
import { Product, useStore } from '@/app/context/StoreContext';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  disableHoverEffect?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, disableHoverEffect = false }) => {
  const { language, addToCart, t, toggleWishlist, isInWishlist } = useStore();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    navigate('/cart');
  };

  const hasDiscount = !!product.discount_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price!) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`group relative bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-500 ${!disableHoverEffect ? 'hover:shadow-2xl' : ''
        }`}
    >
      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
          <img
            src={product.images[0]}
            alt={language === 'bn' ? product.title_bn : product.title_en}
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-cover object-center transition-transform duration-700 ${!disableHoverEffect ? 'group-hover:scale-110' : ''
              }`}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                -{discountPercent}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-[#D91976] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                {t('নতুন', 'NEW')}
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                {t('বেস্ট সেলার', 'BEST SELLER')}
              </span>
            )}
            {product.isGiftFeatured && (
              <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                <Gift size={12} />
                {t('গিফট', 'GIFT')}
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg overlay-btn 
              ${isInWishlist(product.id)
                ? 'bg-[#D91976] text-white opacity-100'
                : 'bg-white/90 backdrop-blur-sm hover:bg-white hover:text-red-500 opacity-0 group-hover:opacity-100'
              }`}
          >
            <Heart size={18} className={isInWishlist(product.id) ? 'fill-current' : ''} />
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider font-medium">
          {product.category}
        </p>
        <Link to={`/product/${product.id}`} className="block mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-[#D91976] transition line-clamp-2 leading-snug text-sm">
            {language === 'bn' ? product.title_bn : product.title_en}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${i < Math.floor(product.rating!)
                    ? 'text-orange-500'
                    : 'text-gray-300'
                    }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-orange-500">
              ({product.reviews || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <p className="text-lg font-bold text-[#D91976]">
                  ৳{product.discount_price}
                </p>
                <p className="text-xs text-gray-400 line-through">
                  ৳{product.price}
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-[#D91976]">৳{product.price}</p>
            )}
          </div>
          {product.stock < 10 && product.stock > 0 && (
            <span className="text-xs text-orange-600 font-medium">
              {t('মাত্র', 'Only')} {product.stock} {t('টি বাকি', 'left')}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            className="py-2 px-3 border-2 border-[#D91976] text-[#D91976] font-bold rounded-lg hover:bg-pink-50 transition text-sm flex items-center justify-center gap-1.5"
          >
            <ShoppingCart size={16} />
            <span>{t('কার্ট', 'Cart')}</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="py-2 px-3 bg-[#D91976] text-white font-bold rounded-lg hover:bg-[#A8145A] transition text-sm shadow-md"
          >
            {t('কিনুন', 'Buy Now')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};