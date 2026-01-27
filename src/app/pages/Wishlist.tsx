
import { useStore } from '@/app/context/StoreContext';
import { Heart } from 'lucide-react';
import { ProductCard } from '@/app/components/ProductCard';
import { Link } from 'react-router';

export const Wishlist = () => {
  const { t, products, wishlist } = useStore();

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
            {t('আমার উইশলিস্ট', 'My Wishlist')}
          </h1>
          <p className="text-gray-600">
            {t('আপনার পছন্দের পণ্যগুলি সংরক্ষণ করুন', 'Save your favorite products')}
          </p>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('আপনার উইশলিস্ট খালি', 'Your wishlist is empty')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('আপনার পছন্দের পণ্য যোগ করুন', 'Start adding your favorite products')}
            </p>
            <Link
              to="/shop"
              className="inline-block bg-[#D91976] text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-800 transition"
            >
              {t('শপিং শুরু করুন', 'Start Shopping')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlistProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};