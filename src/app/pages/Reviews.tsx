
import { useStore } from '@/app/context/StoreContext';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

import SEO from '@/app/components/SEO';

export const Reviews = () => {
  const { premiumReviews, t } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <SEO
        title={t('গ্রাহক মতামত | রিজকারা শপ হ্যান্ডমেড গিফট স্টোর', 'Customer Reviews | Rizqara Shop Handmade & Gift Store')}
        description={t('রিজকারা শপের গ্রাহকদের রিভিউ দেখুন। হ্যান্ডমেড পণ্য, কাস্টম স্কেচ ও গিফট সার্ভিস সম্পর্কে আসল অভিজ্ঞতা।', 'See customer reviews of Rizqara Shop. Real experiences about handmade products, custom sketches and gift services.')}
        url="https://rizqarashop.vercel.app/reviews"
      />
      {/* Hero Section */}
      <div className="bg-[#D91976] text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            {t('আমাদের গ্রাহকদের ভালোবাসা', 'Our Happy Customers')}
          </h1>
          <p className="text-lg md:text-xl text-pink-100 max-w-2xl mx-auto">
            {t('আপনার বিশ্বাসই আমাদের অনুপ্রেরণা। দেখুন আমাদের সম্মানিত গ্রাহকরা কী বলছেন।', 'Your trust is our inspiration. See what our valued customers are saying.')}
          </p>
        </motion.div>
      </div>

      {/* Reviews Grid */}
      <div className="container mx-auto px-4 relative z-20 py-16">
        {premiumReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {premiumReviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 group flex flex-col h-full"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden aspect-video">
                  <img
                    src={review.imageUrl}
                    alt={review.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <p className="text-white font-medium">{new Date(review.date).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 relative flex-1 flex flex-col">
                  <div className="absolute -top-6 right-6 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center shadow-lg text-white">
                    <Quote size={24} fill="currentColor" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2 font-serif pr-8">
                    {review.title}
                  </h3>

                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={16} className="text-orange-500 fill-current" />
                    ))}
                  </div>

                  <div className="mt-auto pt-4">
                    <div className="h-1 w-20 bg-gradient-to-r from-[#D91976] to-pink-500 rounded-full"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl text-center shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-2">শীঘ্রই আসছে</h3>
            <p className="text-gray-500">আমাদের প্রিয় গ্রাহকদের কাছ থেকে রিভিউ সংগ্রহ চলছে। খুব শীঘ্রই এখানে প্রকাশ করা হবে..</p>
          </div>
        )}
      </div>
    </div>
  );
};