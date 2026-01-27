
import { PageHeader } from '@/app/components/PageHeader';
import { useStore } from '@/app/context/StoreContext';
import { Target, Shield, Heart, Sparkles, TrendingUp } from 'lucide-react';

export const About = () => {
    const { t } = useStore();

    const features = [
        {
            icon: <Sparkles size={24} />,
            title: t('প্রিমিয়াম কোয়ালিটি', 'Premium Quality'),
            desc: t('আমরা প্রতিটি পণ্যের গুণমান নিশ্চিত করতে কঠোর মান নিয়ন্ত্রণ প্রক্রিয়া অনুসরণ করি।', 'We follow strict quality control processes to ensure the quality of every product.')
        },
        {
            icon: <TrendingUp size={24} />,
            title: t('ট্রেন্ডি কালেকশন', 'Trendy Collection'),
            desc: t('ফ্যাশন দুনিয়ার সর্বশেষ ট্রেন্ড অনুযায়ী আমাদের কালেকশন নিয়মিত আপডেট করা হয়।', 'Our collection is regularly updated according to the latest trends in the fashion world.')
        },
        {
            icon: <Heart size={24} />,
            title: t('গ্রাহক সন্তুষ্টি', 'Customer Satisfaction'),
            desc: t('আমাদের গ্রাহকদের সন্তুষ্টিই আমাদের প্রধান অগ্রাধিকার। ২৪/৭ সাপোর্ট।', 'Customer satisfaction is our main priority. 24/7 Support.')
        }
    ];

    const stats = [
        { label: t('সন্তুষ্ট গ্রাহক', 'Happy Customers'), value: '50k+' },
        { label: t('প্রোডাক্ট কালেকশন', 'Products'), value: '2k+' },
        { label: t('ডেলিভারি সম্পন্ন', 'Deliveries'), value: '100k+' },
        { label: t('বছর অভিজ্ঞতা', 'Years Experience'), value: '5+' },
    ];

    return (
        <div className="min-h-screen bg-white">
            <PageHeader
                title={t('আমাদের সম্পর্কে', 'About Us')}
                subtitle={t('রিজকারা শপ - আপনার লাইফস্টাইলের বিশ্বস্ত সঙ্গী', 'RizQara Shop - Trusted partner of your lifestyle')}
                breadcrumbs={[{ label: t('আমাদের সম্পর্কে', 'About'), path: '/about' }]}
                backgroundImage="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80"
            />

            {/* Mission Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold font-serif text-gray-900">
                                {t('আমাদের লক্ষ্য ও উদ্দেশ্য', 'Our Mission & Vision')}
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                {t(
                                    'রিজকারা শপ একটি প্রিমিয়াম লাইফস্টাইল ব্র্যান্ড যা গ্রাহকদের সেরা মানের পণ্য এবং সেবা প্রদানে প্রতিশ্রুতিবদ্ধ। আমাদের লক্ষ্য হলো কেনাকাটার অভিজ্ঞতাকে সহজ, নিরাপদ এবং আনন্দদায়ক করা।',
                                    'RizQara Shop is a premium lifestyle brand committed to providing the best quality products and services to customers. Our goal is to make the shopping experience simple, safe, and enjoyable.'
                                )}
                            </p>
                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <div className="flex gap-4">
                                    <div className="bg-pink-50 p-3 rounded-lg text-[#D91976] h-fit"><Target size={24} /></div>
                                    <div>
                                        <h4 className="font-bold mb-1">{t('মিশন', 'Mission')}</h4>
                                        <p className="text-sm text-gray-500">{t('সেরা মানের পণ্য সরবরাহ করা', 'Providing best quality products')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-purple-50 p-3 rounded-lg text-purple-600 h-fit"><Shield size={24} /></div>
                                    <div>
                                        <h4 className="font-bold mb-1">{t('বিশ্বাস', 'Trust')}</h4>
                                        <p className="text-sm text-gray-500">{t('১০০% খাঁটি পণ্যের নিশ্চয়তা', '100% authentic product guarantee')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#D91976] transform rotate-3 rounded-2xl opacity-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1556740758-90de2742e1e2?w=800&q=80"
                                alt="Team"
                                className="relative rounded-2xl shadow-xl w-full hover:scale-[1.02] transition duration-500"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold font-serif mb-4">{t('কেন আমাদের বেছে নেবেন?', 'Why Choose Us?')}</h2>
                        <p className="text-gray-600">{t('আমরা শুধু পণ্য বিক্রি করি না, আমরা একটি লাইফস্টাইল অফার করি।', 'We don\'t just sell products, we offer a lifestyle.')}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition group">
                                <div className="w-14 h-14 bg-pink-50 text-[#D91976] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gray-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, index) => (
                            <div key={index} className="space-y-2">
                                <p className="text-4xl font-bold text-[#D91976]">{stat.value}</p>
                                <p className="text-gray-400 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
