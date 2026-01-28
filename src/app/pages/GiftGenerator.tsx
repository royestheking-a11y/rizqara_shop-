import { useState } from 'react';
import { useStore, Product } from '@/app/context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Heart, Sparkles, ArrowRight, ArrowLeft, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { OCCASIONS, PERSON_TYPES, BUDGETS, MOODS } from '@/app/utils/giftConstants';
// --- Configuration & Data ---
// Removed local constants as they are now imported from utils

// Message Templates containing {0} for occasion placeholder logic if needed, 
// though we usually map direct combos.
const MESSAGES: Record<string, string[]> = {
    'birthday_gf': ['শুভ জন্মদিন প্রিয়তমা! তোমার হাসিটা আমার দিনের আলো। ❤️', 'তোমার এই বিশেষ দিনে অনেক ভালোবাসা!'],
    'love_gf': ['তোমাকে পেয়ে আমি ধন্য, ভালোবাসা নিও।', 'তোমার জন্য ছোট্ট একটা উপহার, কিন্তু ভালোবাসা অনেক!'],
    'puja_mom': ['পূজার আনন্দ আরও সুন্দর হোক—মায়ের জন্য এই ছোট্ট উপহার ভালোবাসার প্রতীক। 🪔✨', 'মা, এই পূজায় তোমার জন্য রইল শ্রদ্ধা ও প্রণাম।'],
    'puja_wife': ['এই পূজায় তোমার হাসিই আমার সবচেয়ে বড় উপহার। এই ছোট্ট উপহারটা শুধু তোমার জন্য 🪔💖'],
    'puja_friend': ['পূজার শুভেচ্ছা! বন্ধুত্বের মিষ্টি স্মৃতির সাথে এই উপহারটা থাকুক 🎁🪔'],
    'eid_mom': ['ঈদের আনন্দ আরও সুন্দর হোক—মায়ের জন্য ভালোবাসা ও কৃতজ্ঞতার উপহার 🌙💖'],
    'default': ['আপনার প্রিয়জনের জন্য ভালোবাসার উপহার! 🎁', 'উপহারের সাথে রইল একরাশ ভালোবাসা।'],
};

import SEO from '@/app/components/SEO';

export const GiftGenerator = () => {
    const { t, products, addToCart } = useStore();

    // State
    const [step, setStep] = useState(0);
    const [selections, setSelections] = useState({
        occasion: '',
        person: '',
        budget: '',
        mood: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<Product[]>([]);
    const [generatedMessage, setGeneratedMessage] = useState('');

    // Handlers
    const handleSelect = (key: string, value: string) => {
        setSelections(prev => ({ ...prev, [key]: value }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const generateGift = () => {
        setIsGenerating(true);
        setStep(5); // Show loading/result view

        // Simulate AI thinking time
        setTimeout(() => {
            // 1. Filter Products
            const occasionTags = OCCASIONS.find(o => o.id === selections.occasion)?.tags || [];
            const personTags = PERSON_TYPES.find(p => p.id === selections.person)?.tags || [];
            const moodTags = MOODS.find(m => m.id === selections.mood)?.tags || [];
            const budget = BUDGETS.find(b => b.id === selections.budget);

            const allTags = [...occasionTags, ...personTags, ...moodTags];

            let filtered = products.filter(p => {
                // Price Match
                if (budget && (p.discount_price || p.price) > budget.max) return false;
                if (budget && (p.discount_price || p.price) < budget.min) return false;

                // Tag Match Logic (Simple: Match at least one tag, prioritize more matches)
                const productTags = p.tags || [];
                const hasMatch = productTags.some(tag => allTags.includes(tag));

                // Also match category as fallback
                const categoryMatch = personTags.some(t => t.toLowerCase() === p.category.toLowerCase());

                return hasMatch || categoryMatch;
            });

            // Simple ranking by relevance (number of matched tags)
            filtered.sort((a, b) => {
                const aTags = a.tags || [];
                const bTags = b.tags || [];
                const aScore = aTags.filter(t => allTags.includes(t)).length;
                const bScore = bTags.filter(t => allTags.includes(t)).length;
                return bScore - aScore;
            });

            // If no results, fallback to best sellers
            if (filtered.length === 0) {
                filtered = products.filter(p => p.isBestSeller).slice(0, 3);
            } else {
                filtered = filtered.slice(0, 3);
            }

            setResults(filtered);

            // 2. Generate Message
            const key = `${selections.occasion}_${selections.person}`;
            const templates = MESSAGES[key] || MESSAGES['default'];
            const msg = templates[Math.floor(Math.random() * templates.length)];
            setGeneratedMessage(msg);

            setIsGenerating(false);
        }, 2000);
    };

    const copyMessage = () => {
        navigator.clipboard.writeText(generatedMessage);
        toast.success('Message copied!');
    };

    // --- Render Steps ---

    const renderStep0 = () => (
        <div className="text-center py-10">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 text-[#D91976] animate-bounce">
                <Gift size={48} />
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
                {t('১ মিনিটে সেরা গিফট', 'Best Gift in 1 Minute')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
                {t('আপনার প্রিয়জনের জন্য পারফেক্ট উপহার খুঁজে নিন আমাদের স্মার্ট সাজেস্টরের মাধ্যমে।', 'Find the perfect gift for your loved ones using our smart suggester.')}
            </p>
            <button
                onClick={nextStep}
                className="px-10 py-4 bg-[#D91976] text-white text-xl font-bold rounded-full hover:bg-[#A8145A] transition shadow-xl hover:shadow-2xl shadow-pink-200 transform hover:-translate-y-1"
            >
                {t('শুরু করুন', 'Get Started')}
            </button>
        </div>
    );

    const renderStep1 = () => (
        <div>
            <h2 className="text-2xl font-bold mb-2 text-center">{t('উপলক্ষ কি?', 'What is the Occasion?')}</h2>
            <p className="text-gray-500 text-center mb-8 text-sm">{t('সঠিক উপলক্ষে সেরা সাজেশান পেতে সাহায্য করে', 'Helps get accurate suggestions')}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {OCCASIONS.map(occ => (
                    <button
                        key={occ.id}
                        onClick={() => { handleSelect('occasion', occ.id); nextStep(); }}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${selections.occasion === occ.id ? 'border-[#D91976] bg-pink-50' : 'border-gray-100 hover:border-pink-200 hover:bg-white bg-gray-50'}`}
                    >
                        <span className="text-gray-700 group-hover:text-[#D91976] transition-colors"><occ.Icon size={32} /></span>
                        <span className="font-bold text-gray-800">{occ.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div>
            <h2 className="text-2xl font-bold mb-8 text-center">{t('কাকে দেবেন?', 'Who is it for?')}</h2>
            <div className="flex flex-wrap justify-center gap-3">
                {PERSON_TYPES.map(p => (
                    <button
                        key={p.id}
                        onClick={() => { handleSelect('person', p.id); nextStep(); }}
                        className={`px-6 py-3 rounded-full border-2 transition-all font-medium ${selections.person === p.id ? 'bg-[#D91976] text-white border-[#D91976]' : 'border-gray-200 text-gray-700 hover:border-[#D91976] hover:text-[#D91976]'}`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div>
            <h2 className="text-2xl font-bold mb-8 text-center">{t('বাজেট কত?', 'What is your budget?')}</h2>
            <div className="space-y-3 max-w-md mx-auto">
                {BUDGETS.map(b => (
                    <button
                        key={b.id}
                        onClick={() => { handleSelect('budget', b.id); nextStep(); }}
                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${selections.budget === b.id ? 'border-[#D91976] bg-pink-50' : 'border-gray-100 hover:border-pink-200 bg-white'}`}
                    >
                        <span className="font-medium text-gray-800">{b.label}</span>
                        <ArrowRight className={`text-gray-300 group-hover:text-[#D91976] transition-colors`} size={20} />
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div>
            <h2 className="text-2xl font-bold mb-2 text-center">{t('গিফটের ধরন?', 'Gift Mood?')}</h2>
            <p className="text-gray-500 text-center mb-8 text-sm">{t('ঐচ্ছিক - বেছে নিতে পারেন', 'Optional - You can choose')}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {MOODS.map(m => (
                    <button
                        key={m.id}
                        onClick={() => handleSelect('mood', m.id)}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selections.mood === m.id ? 'border-[#D91976] bg-pink-50' : 'border-gray-100 hover:border-pink-200 bg-white'}`}
                    >
                        <span className="text-gray-700"><m.Icon size={24} /></span>
                        <span className="font-medium text-sm">{m.label}</span>
                    </button>
                ))}
            </div>

            <button
                onClick={generateGift}
                className="w-full py-4 bg-[#D91976] text-white text-lg font-bold rounded-xl hover:bg-[#A8145A] transition shadow-lg shadow-pink-200 flex items-center justify-center gap-2"
            >
                <Sparkles size={20} />
                {t('উপহার সাজেস্ট করুন', 'Generate Ideas')}
            </button>
        </div>
    );

    const renderLoading = () => (
        <div className="text-center py-20">
            <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#D91976] border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-[#D91976] animate-pulse"><Gift size={32} /></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('সেরা গিফট খুঁজছি...', 'Finding best gifts...')}</h2>
            <p className="text-gray-500">{t('আপনার অনুভূতিগুলো বিশ্লেষণ করা হচ্ছে', 'Analyzing your emotions')}</p>
        </div>
    );

    const renderResult = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-serif font-bold text-[#D91976] mb-2">{t('আপনার জন্য সেরা ৩টি উপহার', 'Top 3 Gifts for You')}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                    {selections.occasion && OCCASIONS.find(o => o.id === selections.occasion)?.label} + {selections.person && PERSON_TYPES.find(p => p.id === selections.person)?.label}
                </div>
            </div>

            {/* Recommended Products */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {results.map((product, idx) => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 group">
                        <div className="relative h-48 overflow-hidden">
                            <img src={product.images[0]} alt={product.title_en} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-3 left-3 bg-[#D91976] text-white text-xs font-bold px-2 py-1 rounded shadow">
                                #{idx + 1} Best Match
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-gray-900 mb-1">{t(product.title_bn, product.title_en)}</h3>
                            <p className="text-[#D91976] font-bold text-lg mb-4">৳{product.discount_price || product.price}</p>

                            <button
                                onClick={() => {
                                    addToCart(product, 1, undefined, undefined, undefined, generatedMessage);
                                    toast.success('Added to cart with your message!');
                                }}
                                className="w-full py-2.5 bg-[#D91976] text-white rounded-lg font-medium hover:bg-[#A8145A] transition flex items-center justify-center gap-2"
                            >
                                <Gift size={16} />
                                {t('কিনুন', 'Buy')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Generated Message */}
            <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto text-center relative">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-white border border-pink-200 rounded-full flex items-center justify-center text-pink-500 shadow-sm">
                    <Heart size={20} fill="currentColor" />
                </div>
                <h3 className="font-bold text-gray-900 mb-4 mt-2">{t('সাজেস্টেড গিফট মেসেজ', 'Suggested Gift Message')}</h3>
                <p className="text-xl font-serif text-gray-800 leading-relaxed italic mb-6">
                    "{generatedMessage}"
                </p>
                <button
                    onClick={copyMessage}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-[#D91976] hover:text-[#D91976] transition shadow-sm"
                >
                    <Copy size={16} />
                    {t('কপি করুন', 'Copy Message')}
                </button>
            </div>

            <div className="text-center mt-12">
                <button onClick={() => window.location.reload()} className="text-gray-500 hover:text-gray-900 underline">
                    {t('আবার শুরু করুন', 'Start Over')}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <SEO
                title={t('গিফট ফাইন্ডার | আবেগ অনুযায়ী সেরা উপহার খুঁজুন | রিজকারা শপ', 'Gift Finder Tool | Find Perfect Gift by Emotion | Rizqara Shop')}
                description={t('উপলক্ষ ও প্রিয়জন অনুযায়ী সেরা উপহার খুঁজুন রিজকারা শপের গিফট জেনারেটর দিয়ে। জন্মদিন, ঈদ, ভালোবাসা – সব কিছুর জন্য।', 'Find the perfect gift by occasion and loved one with Rizqara Shop\'s Gift Generator. For birthdays, Eid, love - everything.')}
                url="https://rizqarashop.vercel.app/gift-generator"
            />
            <div className="max-w-4xl mx-auto">
                {step > 0 && step < 5 && (
                    <button
                        onClick={prevStep}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        {t('পেছনের ধাপ', 'Back')}
                    </button>
                )}

                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-12 min-h-[500px] flex flex-col justify-center relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -ml-20 -mb-20 pointer-events-none"></div>

                    <div className="relative z-10 w-full max-w-2xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {step === 0 && renderStep0()}
                                {step === 1 && renderStep1()}
                                {step === 2 && renderStep2()}
                                {step === 3 && renderStep3()}
                                {step === 4 && renderStep4()}
                                {step === 5 && (isGenerating ? renderLoading() : renderResult())}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};
