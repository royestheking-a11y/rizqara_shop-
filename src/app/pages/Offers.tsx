import { useMemo } from 'react';
import { useStore } from '@/app/context/StoreContext';
import { Link } from 'react-router';
import { Tag } from 'lucide-react';
import { ProductCard } from '@/app/components/ProductCard';

import SEO from '@/app/components/SEO';

export const Offers = () => {
    const { products, t } = useStore();


    // Filter only products with a discount price
    const offerProducts = useMemo(() => {
        return products.filter(p => p.discount_price && p.discount_price > 0 && p.discount_price < p.price);
    }, [products]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <SEO
                title={t('অফার ও ডিসকাউন্ট | হ্যান্ডমেড গিফট ও ক্রাফট | রিজকারা শপ', 'Offers & Discounts | Handmade Gifts & Crafts | Rizqara Shop')}
                description={t('রিজকারা শপে চলমান অফার ও ডিসকাউন্ট দেখুন। হ্যান্ডমেড গিফট, মাটির পণ্য ও কাস্টম পণ্যে বিশেষ ছাড়।', 'Check out ongoing offers and discounts at Rizqara Shop. Special discounts on handmade gifts, clay products and custom items.')}
                url="https://rizqarashop.vercel.app/offers"
            />
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#D91976] to-[#E84A9C] rounded-2xl p-8 mb-8 shadow-lg text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Tag className="text-pink-200" size={24} />
                                <span className="font-bold text-pink-100 uppercase tracking-widest text-xs">
                                    {t('স্পেশাল অফার', 'Special Offers')}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                                {t('আকর্ষণীয় সব ডিসকাউন্ট', 'Exclusive Flash Deals')}
                            </h1>
                            <p className="text-pink-100 max-w-lg">
                                {t('সীমিত সময়ের জন্য সেরা মূল্যে আপনার পছন্দের পণ্যটি কিনুন। স্টক শেষ হওয়ার আগেই অর্ডার করুন!', 'Grab your favorite products at the best prices for a limited time. Order before stock runs out!')}
                            </p>
                        </div>
                        <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                            <p className="text-2xl font-bold">{offerProducts.length}</p>
                            <p className="text-xs text-pink-100 uppercase tracking-wider">{t('টি অফার আইটেম', 'Items on Offer')}</p>
                        </div>
                    </div>

                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none" />
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Controls (Mobile & Desktop Combined for simpler layout since no categories) */}
                    {/* Product Grid */}
                    <div className="w-full">
                        {offerProducts.length === 0 ? (
                            <div className="bg-white rounded-2xl p-20 text-center shadow-sm border border-gray-100">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Tag size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {t('কোন অফার পাওয়া যায়নি', 'No offers found')}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {t('বর্তমানে কোন ডিসকাউন্ট অফার চলছে না। পরে আবার চেক করুন।', 'No discount offers running properly. Please check back later.')}
                                </p>
                                <Link
                                    to="/shop"
                                    className="px-6 py-3 bg-[#D91976] text-white rounded-lg font-medium hover:bg-[#A8145A] transition inline-block"
                                >
                                    {t('সব পণ্য দেখুন', 'View All Products')}
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {offerProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>


            </div>
        </div>
    );
};
