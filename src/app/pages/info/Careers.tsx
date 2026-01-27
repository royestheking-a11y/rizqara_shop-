
import { PageHeader } from '@/app/components/PageHeader';
import { useStore } from '@/app/context/StoreContext';
import { Briefcase, MapPin, Clock, Coffee, Laptop, Heart, Zap } from 'lucide-react';

export const Careers = () => {
    const { t } = useStore();

    const perks = [
        { icon: <Coffee />, title: t('ফ্রি কফি ও স্ন্যাকস', 'Free Coffee & Snacks') },
        { icon: <Laptop />, title: t('ম্যাকবুক ও এক্সেসরিজ', 'Macbook & Accessories') },
        { icon: <Heart />, title: t('হেলথ ইন্স্যুরেন্স', 'Health Insurance') },
        { icon: <Zap />, title: t('উৎসবে বোনাস', 'Festival Bonus') }
    ];

    const jobs = [
        {
            id: 1,
            title: 'Senior React Developer',
            department: 'Technology',
            type: 'Full-time',
            location: 'Dhaka',
        },
        {
            id: 2,
            title: 'Digital Marketing Specialist',
            department: 'Marketing',
            type: 'Full-time',
            location: 'Remote',
        },
        {
            id: 3,
            title: 'Customer Support Executive',
            department: 'Support',
            type: 'Part-time',
            location: 'Dhaka',
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <PageHeader
                title={t('ক্যারিয়ার', 'Careers')}
                subtitle={t('রিজকারা টিমে জয়েন করুন এবং নিজের ক্যারিয়ার গড়ুন', 'Join RizQara team and build your career')}
                breadcrumbs={[{ label: t('ক্যারিয়ার', 'Careers'), path: '/careers' }]}
                backgroundImage="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80"
            />

            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">

                        {/* Perks Section */}
                        <div className="mb-20 text-center">
                            <h2 className="text-3xl font-bold mb-12">{t('রিজকারা লাইফ', 'Life at RizQara')}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {perks.map((perk, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition text-center group">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#D91976] group-hover:scale-110 transition">
                                            {perk.icon}
                                        </div>
                                        <p className="font-medium">{perk.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold mb-8 text-center">{t('ওপেন পজিশন', 'Open Positions')}</h2>

                        <div className="space-y-4">
                            {jobs.map(job => (
                                <div key={job.id} className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-pink-100 transition flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#D91976] transition">{job.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                                            <span className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full"><Briefcase size={14} /> {job.department}</span>
                                            <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                            <span className="flex items-center gap-1"><Clock size={14} /> {job.type}</span>
                                        </div>
                                    </div>
                                    <button className="bg-gray-900 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-[#D91976] transition shrink-0">
                                        {t('আবেদন করুন', 'Apply Now')}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-12 bg-pink-50 p-8 rounded-2xl">
                            <h3 className="text-xl font-bold mb-2">{t('আপনার পছন্দমতো জব পাচ্ছেন না?', 'Can\'t find your desired role?')}</h3>
                            <p className="text-gray-600 mb-4">{t('আপনার সিভি পাঠিয়ে রাখুন, আমরা যোগাযোগ করব।', 'Drop your CV, we will contact you.')}</p>
                            <a href="mailto:careers@rizqara.com" className="text-[#D91976] font-bold hover:underline">careers@rizqara.com</a>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

