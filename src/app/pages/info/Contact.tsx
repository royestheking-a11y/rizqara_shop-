import React, { useState } from 'react';
import { PageHeader } from '@/app/components/PageHeader';
import { useStore } from '@/app/context/StoreContext';
import { Mail, Phone, MapPin, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

import SEO from '@/app/components/SEO';

export const Contact = () => {
    const { t } = useStore();
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    // ... (rest of logic)
    // Actually I should just import SEO and add it in JSX.

    const faqs = [
        {
            q: t('ডেলিভারি চার্জ কত?', 'What is the delivery charge?'),
            a: t('ঢাকার মধ্যে ৭০ টাকা এবং ঢাকার বাইরে ১৩০ টাকা।', '70 BDT inside Dhaka and 130 BDT outside Dhaka.')
        },
        {
            q: t('পণ্য রিটার্ন করা যাবে কি?', 'Can I return the product?'),
            a: t('হ্যাঁ, পণ্য পাওয়ার ৭ দিনের মধ্যে রিটার্ন করা যাবে। বিস্তারিত জানতে রিটার্ন পলিসি দেখুন।', 'Yes, you can return within 7 days. See Return Policy for details.')
        },
        {
            q: t('পেমেন্ট অপশন কি কি?', 'What are the payment options?'),
            a: t('বিকাশ, নগদ, রকেট এবং ক্যাশ অন ডেলিভারি সুবিধা আছে।', 'Bkash, Nagad, Rocket and Cash on Delivery are available.')
        }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success(t('আপনার বার্তা পাঠানো হয়েছে!', 'Your message has been sent!'));
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title={t('যোগাযোগ | রিজকারা শপ - হ্যান্ডমেড গিফট স্টোর ঠিকানা ও সাপোর্ট', 'Contact Us | Rizqara Shop - Handmade Gift Store Location & Support')}
                description={t('যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন। আমাদের ঠিকানা, ফোন নম্বর ও সোশ্যাল মিডিয়া লিংক।', 'Contact us for any needs. Our address, phone number and social media links.')}
                url="https://rizqarashop.vercel.app/contact"
            />
            <PageHeader
                title={t('যোগাযোগ', 'Contact Us')}
                subtitle={t('যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন', 'Get in touch with us for any query')}
                breadcrumbs={[{ label: t('যোগাযোগ', 'Contact'), path: '/contact' }]}
                backgroundImage="https://images.unsplash.com/photo-1423666639041-f14dcc0290ce?w=1200&q=80"
            />

            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Info Cards */}
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <div className="w-12 h-12 bg-pink-50 text-[#D91976] rounded-xl flex items-center justify-center mb-4">
                                    <Phone size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{t('ফোন', 'Phone')}</h3>
                                <p className="text-gray-600 mb-1">+880 1625691878</p>
                                <p className="text-gray-400 text-sm">{t('সকাল ১০টা - রাত ১০টা', '10AM - 10PM')}</p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                                    <Mail size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{t('ইমেইল', 'Email')}</h3>
                                <p className="text-gray-600">rizqarashops@gmail.com</p>
                                <p className="text-gray-600">rizqarashop@gmail.com</p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                    <MapPin size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{t('ঠিকানা', 'Address')}</h3>
                                <p className="text-gray-600">{t('বাড়ি-34, রোড-16, Nikunja 2, Dhaka', 'House-34, Road-16, Nikunja 2, Dhaka')}</p>
                            </div>
                        </div>

                        {/* Contact Form and Map */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-gray-50 p-8 md:p-12 rounded-2xl">
                                <h2 className="text-2xl font-bold mb-6 font-serif">{t('বার্তা পাঠান', 'Send a Message')}</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('নাম', 'Name')}</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D91976] focus:border-transparent outline-none bg-white"
                                                placeholder={t('আপনার নাম', 'Your Name')}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('ইমেইল', 'Email')}</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D91976] focus:border-transparent outline-none bg-white"
                                                placeholder="example@email.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('বার্তা', 'Message')}</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D91976] focus:border-transparent outline-none bg-white"
                                            placeholder={t('আপনার বার্তা লিখুন...', 'Write your message...')}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-[#D91976] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#A8145A] transition flex items-center gap-2"
                                    >
                                        <Send size={18} /> {t('পাঠান', 'Send Message')}
                                    </button>
                                </form>
                            </div>

                            {/* Map */}
                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-80 relative">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.9024424341434!2d90.37098197615053!3d23.75085817867694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8a07f0c1d1d%3A0x6b7de584e8a8b056!2sDhanmondi%20Road%20No.%205%2C%20Dhaka%201205!5e0!3m2!1sen!2sbd!4v1706173000000!5m2!1sen!2sbd"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Office Map"
                                ></iframe>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="max-w-3xl mx-auto mt-20">
                        <h2 className="text-2xl font-bold mb-8 text-center">{t('সচরাচর জিজ্ঞাসা', 'Frequently Asked Questions')}</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                        className="w-full flex justify-between items-center p-5 text-left bg-gray-50 hover:bg-gray-100 transition"
                                    >
                                        <span className="font-semibold text-gray-800">{faq.q}</span>
                                        {openFaq === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                    {openFaq === idx && (
                                        <div className="p-5 border-t border-gray-200 text-gray-600">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
