import { PageHeader } from '@/app/components/PageHeader';
import { useStore } from '@/app/context/StoreContext';
import { Calendar, User, ArrowRight } from 'lucide-react';

export const Blog = () => {
    const { t } = useStore();

    const posts = [
        {
            id: 1,
            title: t('ঈদের স্পেশাল কালেকশন ২০২৬', 'Eid Special Collection 2026'),
            excerpt: t('এবারের ঈদে রিজকারা নিয়ে এসেছে এক্সক্লুসিভ ডিজাইনার পোশাক...', 'This Eid, RizQara brings exclusive designer wear...'),
            image: '/blog_eid_collection.png',
            date: 'Jan 25, 2026',
            author: 'Admin'
        },
        {
            id: 2,
            title: t('শীতকালীন ফ্যাশন ট্রেন্ডস', 'Winter Fashion Trends'),
            excerpt: t('শীতের ফ্যাশনে আরাম এবং স্টাইলের পারফেক্ট কম্বিনেশন...', 'Perfect combination of comfort and style in winter fashion...'),
            image: '/blog_winter_fashion.png',
            date: 'Jan 20, 2026',
            author: 'Editor'
        },
        {
            id: 3,
            title: t('কিভাবে সঠিক পারফিউম বেছে নেবেন?', 'How to choose the perfect perfume?'),
            excerpt: t('পারফিউম নোটস এবং সিজন অনুযায়ী পারফিউম গাইড...', 'Perfume guide according to notes and seasons...'),
            image: '/blog_perfume.png',
            date: 'Jan 15, 2026',
            author: 'Expert'
        },
        {
            id: 4,
            title: t('স্কিনকেয়ার রুটিন গাইড', 'Skincare Routine Guide'),
            excerpt: t('স্বাস্থ্যোজ্জ্বল ত্বকের জন্য ৫টি সহজ ধাপ...', '5 simple steps for glowing skin...'),
            image: '/blog_skincare.png',
            date: 'Jan 10, 2026',
            author: 'Dermatologist'
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <PageHeader
                title={t('ব্লগ', 'Our Blog')}
                subtitle={t('লাইফস্টাইল, ফ্যাশন এবং ট্রেন্ডস নিয়ে আমাদের নিয়মিত আয়োজন', 'Our regular updates on lifestyle, fashion and trends')}
                breadcrumbs={[{ label: t('ব্লগ', 'Blog'), path: '/blog' }]}
                backgroundImage="https://images.unsplash.com/photo-1499750310159-5b5f38121a43?w=1200&q=80"
            />

            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map(post => (
                            <div key={post.id} className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition">
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                                        <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-[#D91976] transition">{post.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                                    <button className="text-[#D91976] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                                        {t('আরও পড়ুন', 'Read More')} <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
