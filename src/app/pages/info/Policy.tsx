import { PageHeader } from '@/app/components/PageHeader';
import { useStore } from '@/app/context/StoreContext';

interface PolicyPageProps {
    type: 'return' | 'privacy' | 'terms' | 'delivery';
}

export const PolicyPage = ({ type }: PolicyPageProps) => {
    const { t } = useStore();

    const content = {
        return: {
            title: t('রিটার্ন ও রিফান্ড পলিসি', 'Return & Refund Policy'),
            subtitle: t('আমাদের সহজ এবং স্বচ্ছ রিটার্ন প্রক্রিয়া', 'Our simple and transparent return process'),
            body: (
                <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('১. সাধারণ নীতিমালা', '1. General Policy')}</h3>
                        <p className="mb-4">
                            {t(
                                'রিজকারা শপ থেকে কেনাকাটা করার জন্য ধন্যবাদ। আমরা সর্বদা আমাদের গ্রাহকদের সর্বোচ্চ মানের পণ্য এবং সেবা প্রদান নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ। তবুও, যদি আপনি আপনার কেনাকাটায় পুরোপুরি সন্তুষ্ট না হন, আমরা সাহায্য করতে এখানে আছি।',
                                'Thank you for shopping at RizQara Shop. We are always committed to ensuring the highest quality products and services for our customers. However, if you are not completely satisfied with your purchase, we are here to help.'
                            )}
                        </p>
                        <p>
                            {t(
                                'আপনি পণ্যটি গ্রহণ করার ৭ দিনের মধ্যে রিটার্ন বা এক্সচেঞ্জের জন্য আবেদন করতে পারবেন।',
                                'You can request a return or exchange within 7 days of receiving the product.'
                            )}
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('২. রিটার্নের শর্তাবলী', '2. Conditions for Return')}</h3>
                        <ul className="list-disc pl-6 space-y-3">
                            <li>{t('পণ্যটি অব্যবহৃত এবং অরিজিনাল কন্ডিশনে থাকতে হবে।', 'The product must be unused and in original condition.')}</li>
                            <li>{t('পণ্যের সাথে থাকা সকল ট্যাগ, লেবেল এবং প্যাকেজিং অক্ষত থাকতে হবে।', 'All tags, labels, and packaging accompanying the product must remain intact.')}</li>
                            <li>{t('ইনভয়েস বা ক্রয়ের প্রমাণপত্র সাথে রাখতে হবে।', 'Invoice or proof of purchase must be kept.')}</li>
                            <li>{t('কাস্টমাইজড বা পার্সোনালাইজড পণ্য রিটার্নযোগ্য নয়, যদি না তাতে কোনো ম্যানুফ্যাকচারিং ত্রুটি থাকে।', 'Customized or personalized products are not returnable unless there is a manufacturing defect.')}</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('৩. রিফান্ড প্রক্রিয়া', '3. Refund Process')}</h3>
                        <p className="mb-4">
                            {t(
                                'আপনার রিটার্নকৃত পণ্যটি আমাদের ওয়ারহাউজে পৌঁছানোর পর, আমাদের টিম এটি ইন্সপেক্ট করবে। পণ্যটি শর্তাবলী পূরণ করলে, আমরা রিফান্ড প্রসেস শুরু করব।',
                                'Once your returned product reaches our warehouse, our team will inspect it. If the product meets the conditions, we will initiate the refund process.'
                            )}
                        </p>
                        <p>
                            {t(
                                'রিফান্ড আপনার অরিজিনাল পেমেন্ট মেথডে (যেমন: বিকাশ, কার্ড) ৫-৭ কর্মদিবসের মধ্যে প্রদান করা হবে।',
                                'Refunds will be issued to your original payment method (e.g., bKash, Card) within 5-7 working days.'
                            )}
                        </p>
                    </section>
                </div>
            )
        },
        privacy: {
            title: t('প্রাইভেসি পলিসি', 'Privacy Policy'),
            subtitle: t('আমরা আপনার তথ্যের সুরক্ষা এবং গোপনীয়তা নিশ্চিত করি', 'We ensure the security and privacy of your data'),
            body: (
                <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('১. তথ্য সংগ্রহ', '1. Information Collection')}</h3>
                        <p className="mb-4">
                            {t(
                                'আমরা আপনার ব্যক্তিগত তথ্য শুধুমাত্র আপনাকে উন্নত সেবা প্রদানের লক্ষ্যে সংগ্রহ করি। আমরা যখন আপনি আমাদের সাইটে রেজিস্ট্রেশন করেন, অর্ডার করেন বা নিউজলেটারে সাবস্ক্রাইব করেন তখন তথ্য সংগ্রহ করি।',
                                'We collect your personal information solely to provide you with better service. We collect information when you register on our site, place an order, or subscribe to our newsletter.'
                            )}
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>{t('নাম এবং যোগাযোগের তথ্য (ফোন, ইমেইল)', 'Name and contact information (Phone, Email)')}</li>
                            <li>{t(' শিপিং এবং বিলিং ঠিকানা', 'Shipping and billing address')}</li>
                            <li>{t('পেমেন্ট তথ্যাদি (এনক্রিপ্টেড)', 'Payment details (Encrypted)')}</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('২. তথ্যের ব্যবহার', '2. Use of Information')}</h3>
                        <p>
                            {t(
                                'আপনার তথ্য আমরা অর্ডার প্রসেসিং, ডেলিভারি আপডেট, এবং কাস্টমার সাপোর্টের জন্য ব্যবহার করি। আমরা কখনোই আপনার ব্যক্তিগত তথ্য তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করি না, তবে আইনি বাধ্যবাধকতা থাকলে তা ভিন্ন।',
                                'We use your information for order processing, delivery updates, and customer support. We never sell or share your personal information with third parties unless required by law.'
                            )}
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('৩. কুকিজ (Cookies)', '3. Cookies')}</h3>
                        <p>
                            {t(
                                'আমাদের ওয়েবসাইট ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে "কুকিজ" ব্যবহার করে। আপনি ব্রাউজার সেটিংস থেকে এটি নিয়ন্ত্রণ করতে পারেন।',
                                'Our website uses "cookies" to enhance user experience. You can control this from your browser settings.'
                            )}
                        </p>
                    </section>
                </div>
            )
        },
        terms: {
            title: t('টার্মস ও কন্ডিশন', 'Terms & Conditions'),
            subtitle: t('রিজকারা শপ ব্যবহারের আইনি শর্তাবলী', 'Legal terms of using RizQara Shop'),
            body: (
                <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
                    <p className="text-sm text-gray-500 italic">
                        {t('সর্বশেষ আপডেট: ২৫ জানুয়ারি, ২০২৬', 'Last Updated: January 25, 2026')}
                    </p>
                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('১. ভূমিকা', '1. Introduction')}</h3>
                        <p>
                            {t(
                                'রিজকারা শপে স্বাগতম। এই ওয়েবসাইটটি ব্যবহার করার মাধ্যমে আপনি আমাদের শর্তাবলী মেনে চলতে সম্মত হচ্ছেন। যদি আপনি এই শর্তাবলীতে সম্মত না হন, তবে অনুগ্রহ করে আমাদের সাইট ব্যবহার থেকে বিরত থাকুন।',
                                'Welcome to RizQara Shop. By using this website, you agree to comply with our terms and conditions. If you do not agree with these terms, please refrain from using our site.'
                            )}
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('২. অ্যাকাউন্ট এবং নিরাপত্তা', '2. Account and Security')}</h3>
                        <p>
                            {t(
                                'আপনার অ্যাকাউন্টের গোপনীয়তা রক্ষা করা আপনার দায়িত্ব। আপনার অ্যাকাউন্ট থেকে করা সমস্ত কার্যকলাপের জন্য আপনি দায়ী থাকবেন। আমরা সন্দেহভাজন কার্যকলাপ দেখলে অ্যাকাউন্ট বাতিল করার অধিকার রাখি।',
                                'Protecting the confidentiality of your account is your responsibility. You are responsible for all activities that occur under your account. We reserve the right to terminate accounts if suspicious activity is detected.'
                            )}
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('৩. পণ্যের তথ্য ও মূল্য', '3. Product Info & Pricing')}</h3>
                        <p>
                            {t(
                                'আমরা পণ্যের সঠিক বর্ণনা এবং ছবি প্রদর্শনের সর্বোচ্চ চেষ্টা করি। তবে, স্ক্রিন রেজোলিউশনের কারণে রঙ সামান্য ভিন্ন হতে পারে। আমরা পূর্ব নোটিশ ছাড়াই পণ্যের মূল্য পরিবর্তনের অধিকার রাখি।',
                                'We strive to display accurate product descriptions and images. However, colors may vary slightly due to screen resolution. We reserve the right to change product prices without prior notice.'
                            )}
                        </p>
                    </section>
                </div>
            )
        },
        delivery: {
            title: t('ডেলিভারি তথ্য', 'Delivery Information'),
            subtitle: t('দ্রুত, নিরাপদ এবং বিশ্বস্ত ডেলিভারি সেবা', 'Fast, secure, and reliable delivery service'),
            body: (
                <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                            <h4 className="font-bold text-xl mb-4 text-[#D91976]">{t('ঢাকা সিটি', 'Dhaka City')}</h4>
                            <ul className="space-y-3">
                                <li className="flex justify-between">
                                    <span>{t('ডেলিভারি সময়', 'Delivery Time')}</span>
                                    <span className="font-semibold">{t('২৪-৪৮ ঘণ্টা', '24-48 hours')}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>{t('ডেলিভারি চার্জ', 'Delivery Charge')}</span>
                                    <span className="font-semibold">৳৭০</span>
                                </li>
                                <li className="text-sm text-gray-500 mt-2">
                                    {t('* শর্ত প্রযোজ্য। জরুরি ডেলিভারির জন্য অতিরিক্ত চার্জ প্রযোজ্য হতে পারে।', '* Conditions apply. Extra charges may apply for urgent delivery.')}
                                </li>
                            </ul>
                        </div>
                        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                            <h4 className="font-bold text-xl mb-4 text-[#D91976]">{t('সারা বাংলাদেশ', 'All Over Bangladesh')}</h4>
                            <ul className="space-y-3">
                                <li className="flex justify-between">
                                    <span>{t('ডেলিভারি সময়', 'Delivery Time')}</span>
                                    <span className="font-semibold">{t('৩-৫ দিন', '3-5 days')}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>{t('ডেলিভারি চার্জ', 'Delivery Charge')}</span>
                                    <span className="font-semibold">৳১৩০</span>
                                </li>
                                <li className="text-sm text-gray-500 mt-2">
                                    {t('* প্রত্যন্ত এলাকায় সময় কিছুটা বেশি লাগতে পারে।', '* Delivery may take longer in remote areas.')}
                                </li>
                            </ul>
                        </div>
                    </div>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('ডেলিভারি ট্র্যাকিং', 'Delivery Tracking')}</h3>
                        <p>
                            {t(
                                'আপনার অর্ডার কনফার্ম হওয়ার পর আপনি একটি ট্র্যাকিং নাম্বার পাবেন। আমাদের ওয়েবসাইটের "Track Order" অপশন থেকে আপনি যেকোনো সময় আপনার পার্সেলের অবস্থান জানতে পারবেন।',
                                'You will receive a tracking number after your order is confirmed. You can check the status of your parcel anytime from the "Track Order" option on our website.'
                            )}
                        </p>
                    </section>
                </div>
            )
        }
    };

    const data = content[type];

    const getBackgroundImage = (type: string) => {
        switch (type) {
            case 'return': return 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=1200&q=80'; // Refund/Return box
            case 'privacy': return 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=1200&q=80'; // Security lock
            case 'terms': return 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80'; // Contract signing
            case 'delivery': return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80'; // Delivery truck/box
            default: return undefined;
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <PageHeader
                title={data.title}
                subtitle={data.subtitle}
                breadcrumbs={[{ label: data.title, path: `/info/${type}` }]}
                backgroundImage={getBackgroundImage(type)}
            />
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
                    {data.body}
                </div>
            </div>
        </div>
    );
};
