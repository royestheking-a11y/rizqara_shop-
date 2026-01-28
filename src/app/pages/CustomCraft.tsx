import React, { useState } from 'react';
import { useStore } from '@/app/context/StoreContext';
import { useNavigate } from 'react-router';
import { Upload, Minus, Palette, Package, Gift, Ruler, Gem, Frame, Home, PenTool, Hash, Sparkles, Paintbrush, Square, X } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/app/components/SEO';

export const CustomCraft = () => {
    const { t, addCustomItemToCart, uploadFile } = useStore();
    const navigate = useNavigate();

    // Wizard State
    const [step, setStep] = useState(1);

    // Form Data
    const [images, setImages] = useState<string[]>([]);
    const [idea, setIdea] = useState('');
    const [craftType, setCraftType] = useState('clay');

    const [customSize, setCustomSize] = useState(''); // Text input
    const [finishing, setFinishing] = useState('normal');
    const [customText, setCustomText] = useState('');
    const [quantity, setQuantity] = useState(1);

    // Handlers
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages: string[] = [];
            Array.from(e.target.files).forEach(file => {
                if (file.size > 5 * 1024 * 1024) {
                    toast.error('File size too large. Max 5MB');
                    return;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                    newImages.push(reader.result as string);
                    if (newImages.length === e.target.files?.length) {
                        setImages(prev => [...prev, ...newImages]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (images.length === 0 && !idea.trim()) {
            toast.error(t('অনুগ্রহ করে ছবি দিন অথবা আইডিয়া লিখুন', 'Please upload a photo or describe your idea'));
            return;
        }

        const uploadToast = toast.loading(t('ছবি আপলোড হচ্ছে...', 'Uploading images...'));

        try {
            // Upload images in parallel
            const uploadPromises = images.map(async (img) => {
                if (img.startsWith('data:')) {
                    const res = await fetch(img);
                    const blob = await res.blob();
                    return await uploadFile(blob, 'custom_crafts');
                }
                return img;
            });

            const uploadedImageUrls = await Promise.all(uploadPromises);
            toast.dismiss(uploadToast);

            const mainImage = uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600';

            const product = {
                id: 'custom-craft-service',
                title_bn: 'কাস্টম ক্রাফট রিকোয়েস্ট',
                title_en: 'Custom Craft Request',
                desc_bn: `টাইপ: ${craftType}, সাইজ: ${customSize || 'Standard'}`,
                desc_en: `Type: ${craftType}, Size: ${customSize || 'Standard'}`,
                price: 0, // Price will be set by admin
                category: 'Custom',
                images: [mainImage],
                stock: 100,
            };

            addCustomItemToCart(product, quantity, {
                customImage: mainImage,
                customIdea: idea,
                craftType: craftType as any,
                craftSize: customSize || 'Standard',
                craftFinishing: finishing as any,
                customText: customText,
                customNote: `Requested Custom Craft.\nType: ${craftType}\nSize: ${customSize}\nFinishing: ${finishing}\nIdea: ${idea}`
            });

            // Special flow: The cart will treat 0 price items as "Request Quote"
            toast.success(t('রিকোয়েস্ট কার্টে যোগ হয়েছে! চেকআউট সম্পন্ন করুন।', 'Request added to cart! Please complete checkout.'));
            navigate('/checkout');

        } catch (error) {
            toast.dismiss(uploadToast);
            console.error(error);
            toast.error(t('ছবি আপলোড করতে সমস্যা হয়েছে', 'Failed to upload images'));
        }
    };

    // Steps Rendering
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#D91976] text-white flex items-center justify-center text-sm">1</div>
                                {t('আপনার আইডিয়া দিন', 'Share Your Idea')}
                            </h3>

                            {/* Image Upload */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('ছবি আপলোড করুন (রেফারেন্স)', 'Upload Photo (Reference)')}</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleImageUpload}
                                    />
                                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                                    <p className="text-primary font-medium">{t('ছবি নির্বাচন করুন', 'Choose Images')}</p>
                                </div>
                                {images.length > 0 && (
                                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shrink-0 group">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Idea Text */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('আইডিয়া লিখুন', 'Describe Idea')}</label>
                                <textarea
                                    value={idea}
                                    onChange={(e) => setIdea(e.target.value)}
                                    placeholder={t('যেমন: এই ছবিটা দিয়ে মাটির ফ্রেম বানাতে চাই...', 'Example: I want a clay frame like this...')}
                                    className="w-full h-32 p-4 rounded-xl border border-gray-300 focus:outline-none focus:border-[#D91976] resize-none"
                                />
                            </div>
                        </div>
                        <button onClick={() => setStep(2)} className="w-full py-4 bg-[#D91976] text-white font-bold rounded-xl shadow-lg hover:bg-pink-800 transition">
                            {t('পরবর্তী ধাপ', 'Next Step')}
                        </button>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#D91976] text-white flex items-center justify-center text-sm">2</div>
                                {t('কোন ধরণের ক্রাফট চান?', 'Which Craft Type?')}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'clay', label: 'মাটির ক্রাফট', sub: 'Clay Craft', icon: PenTool },
                                    { id: 'jewelry', label: 'জুয়েলারি', sub: 'Jewelry', icon: Gem },
                                    { id: 'frame', label: 'ফটো ফ্রেম', sub: 'Photo Frame', icon: Frame },
                                    { id: 'decor', label: 'হোম ডেকোর', sub: 'Home Decor', icon: Home },
                                    { id: 'gift', label: 'গিফট আইটেম', sub: 'Gift Item', icon: Gift },
                                    { id: 'nameplate', label: 'নাম প্লেট', sub: 'Name Plate', icon: Hash },
                                    { id: 'other', label: 'অন্যান্য', sub: 'Other', icon: Package },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setCraftType(type.id)}
                                        className={`p-4 rounded-xl border-2 text-left transition relative overflow-hidden group ${craftType === type.id ? 'border-[#D91976] bg-pink-50' : 'border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <div className={`p-3 rounded-full w-12 h-12 flex items-center justify-center mb-3 ${craftType === type.id ? 'bg-[#D91976] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-[#D91976] group-hover:text-white transition'}`}>
                                            <type.icon size={24} />
                                        </div>
                                        <div className="font-bold text-gray-800">{type.label}</div>
                                        <div className="text-xs text-gray-500">{type.sub}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="flex-1 py-4 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">
                                {t('পেছনে', 'Back')}
                            </button>
                            <button onClick={() => setStep(3)} className="flex-1 py-4 bg-[#D91976] text-white font-bold rounded-xl shadow-lg hover:bg-pink-800 transition">
                                {t('পরবর্তী ধাপ', 'Next Step')}
                            </button>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#D91976] text-white flex items-center justify-center text-sm">3</div>
                                {t('সাইজ নির্বাচন', 'Select Size')}
                            </h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('কাস্টম সাইজ লিখুন', 'Enter Custom Size')}</label>
                                <input
                                    type="text"
                                    value={customSize}
                                    onChange={(e) => setCustomSize(e.target.value)}
                                    placeholder="Example: 12 inch x 10 inch"
                                    className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:border-[#D91976]"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setStep(2)} className="flex-1 py-4 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">
                                {t('পেছনে', 'Back')}
                            </button>
                            <button onClick={() => setStep(4)} className="flex-1 py-4 bg-[#D91976] text-white font-bold rounded-xl shadow-lg hover:bg-pink-800 transition">
                                {t('পরবর্তী ধাপ', 'Next Step')}
                            </button>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#D91976] text-white flex items-center justify-center text-sm">4</div>
                                {t('ফিনিশিং নির্বাচন', 'Select Finishing')}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'normal', label: 'নরমাল', icon: Sparkles },
                                    { id: 'hand-painted', label: 'হ্যান্ড পেইন্টেড', icon: Paintbrush },
                                    { id: 'wooden-border', label: 'উডেন বর্ডার', icon: Frame },
                                    { id: 'premium', label: 'প্রিমিয়াম', icon: Gem },
                                    { id: 'with-frame', label: 'ফ্রেম সহ', icon: Square },
                                    { id: 'without-frame', label: 'ফ্রেম ছাড়া', icon: X },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setFinishing(type.id)}
                                        className={`p-4 rounded-xl border-2 text-center transition group ${finishing === type.id ? 'border-[#D91976] bg-pink-50' : 'border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${finishing === type.id ? 'bg-[#D91976] text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-[#D91976] group-hover:text-white transition'}`}>
                                            <type.icon size={24} />
                                        </div>
                                        <div className="font-bold text-gray-800">{type.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setStep(3)} className="flex-1 py-4 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">
                                {t('পেছনে', 'Back')}
                            </button>
                            <button onClick={() => setStep(5)} className="flex-1 py-4 bg-[#D91976] text-white font-bold rounded-xl shadow-lg hover:bg-pink-800 transition">
                                {t('পরবর্তী ধাপ', 'Next Step')}
                            </button>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#D91976] text-white flex items-center justify-center text-sm">5</div>
                                {t('টেক্সট যোগ করবেন?', 'Add Text?')}
                            </h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('কি লিখতে চান? (অপশনাল)', 'What to write? (Optional)')}</label>
                                <input
                                    type="text"
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    placeholder={t('যেমন: শুভ জন্মদিন মা', 'Example: Happy Birthday Mom')}
                                    className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:border-[#D91976]"
                                />
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <h4 className="font-bold text-gray-800 mb-4">{t('পরিমাণ', 'Quantity')}</h4>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"><Minus size={18} /></button>
                                    <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800"><div className="text-xl">+</div></button>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setStep(4)} className="flex-1 py-4 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">
                                {t('পেছনে', 'Back')}
                            </button>
                            <button onClick={handleSubmit} className="flex-1 py-4 bg-[#D91976] text-white font-bold rounded-xl shadow-lg hover:bg-pink-800 transition">
                                {t('রিকোয়েস্ট পাঠান', 'Request Quote')}
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <SEO
                title={t('Custom Craft Order | Handmade Personalized Craft in Bangladesh | Rizqara Shop', 'Custom Craft Order | Handmade Personalized Craft in Bangladesh | Rizqara Shop')}
                description={t('আপনার ছবি বা আইডিয়া আপলোড করুন—আমরা বানাবো হ্যান্ডমেড কাস্টম ক্রাফট। কাস্টম সাইজ, ফিনিশিং, নাম/মেসেজ যোগ করে অর্ডার করুন।', 'Upload your photo or idea - we will make handmade custom crafts. Order with custom size, finishing, name/message.')}
                url="https://rizqarashop.vercel.app/custom-craft"
            />
            {/* Hero */}
            <div className="bg-[#D91976] text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                        {t('কাস্টম ক্রাফট', 'Custom Craft')}
                    </h1>
                    <p className="text-xl opacity-90 mb-8">
                        {t('আপনার ডিজাইন, আমাদের সৃষ্টি', 'Your Design, Our Creation')}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm font-bold opacity-80">
                        <span className="flex items-center gap-2"><Palette size={16} /> {t('হ্যান্ডমেড', 'Handmade')}</span>
                        <span>•</span>
                        <span className="flex items-center gap-2"><Ruler size={16} /> {t('কাস্টম সাইজ', 'Custom Size')}</span>
                        <span>•</span>
                        <span className="flex items-center gap-2"><Gift size={16} /> {t('গিফট রেডি', 'Gift Ready')}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 max-w-2xl">
                {renderStep()}
            </div>
        </div>
    );
};
