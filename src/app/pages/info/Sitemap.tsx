import React from 'react';
import { Link } from 'react-router';
import { useStore } from '@/app/context/StoreContext';
import SEO from '@/app/components/SEO';
import { motion } from 'motion/react';
import { Map, Info, Shield, Gift, User } from 'lucide-react';

export const Sitemap = () => {
    const { t } = useStore();

    const sections = [
        {
            title: t('প্রধান পাতা', 'Main Pages'),
            icon: <Map className="text-[#D91976]" />,
            links: [
                { name: t('হোম', 'Home'), url: '/' },
                { name: t('শপ', 'Shop'), url: '/shop' },
                { name: t('অফার', 'Offers'), url: '/offers' },
                { name: t('গিফট জেনারেটর', 'Gift Generator'), url: '/gift-generator' },
            ]
        },
        {
            title: t('অ্যাকাউন্ট', 'Account'),
            icon: <User className="text-[#D91976]" />,
            links: [
                { name: t('লগইন', 'Login'), url: '/login' },
                { name: t('সাইন আপ', 'Sign Up'), url: '/signup' },
                { name: t('উইশলিস্ট', 'Wishlist'), url: '/wishlist' },
                { name: t('কার্ট', 'Cart'), url: '/cart' },
            ]
        },
        {
            title: t('তথ্য', 'Information'),
            icon: <Info className="text-[#D91976]" />,
            links: [
                { name: t('আমাদের সম্পর্কে', 'About Us'), url: '/about' },
                { name: t('যোগাযোগ', 'Contact Us'), url: '/contact' },
                { name: t('ব্লগ', 'Blog'), url: '/blog' },
                { name: t('ক্যারিয়ার', 'Careers'), url: '/careers' },
            ]
        },
        {
            title: t('গোপনীয়তা ও শর্তাবলী', 'Policies'),
            icon: <Shield className="text-[#D91976]" />,
            links: [
                { name: t('রিটার্ন পলিসি', 'Return Policy'), url: '/return-policy' },
                { name: t('প্রাইভেসি পলিসি', 'Privacy Policy'), url: '/privacy-policy' },
                { name: t('টার্মস ও কন্ডিশন', 'Terms & Conditions'), url: '/terms' },
                { name: t('ডেলিভারি তথ্য', 'Delivery Info'), url: '/delivery-info' },
            ]
        },
        {
            title: t('সেবা', 'Services'),
            icon: <Gift className="text-[#D91976]" />,
            links: [
                { name: t('কাস্টম স্কেচ', 'Custom Sketch'), url: '/custom-sketch' },
                { name: t('কাস্টম ক্রাফট', 'Custom Craft'), url: '/custom-craft' },
                { name: t('রিভিউ', 'Reviews'), url: '/reviews' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
            <SEO
                title={t('সাইটম্যাপ | রিজকারা শপ', 'Sitemap | Rizqara Shop')}
                description={t('রিজকারা শপের সকল পেজের তালিকা।', 'List of all pages on Rizqara Shop.')}
                url="https://rizqarashop.vercel.app/sitemap"
            />

            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-serif font-bold text-[#D91976] mb-4">
                        {t('সাইটম্যাপ', 'Sitemap')}
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {t('আমাদের ওয়েবসাইটের সকল গুরুত্বপূর্ণ পেজগুলো একনজরে দেখুন এবং সহজে নেভিগেট করুন।', 'Browse all important pages of our website at a glance and navigate easily.')}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100"
                        >
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="p-2 bg-pink-50 rounded-lg">
                                    {section.icon}
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">{section.title}</h2>
                            </div>
                            <ul className="space-y-3">
                                {section.links.map((link, idx) => (
                                    <li key={idx}>
                                        <Link
                                            to={link.url}
                                            className="flex items-center gap-2 text-gray-600 hover:text-[#D91976] transition group"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#D91976] transition" />
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
