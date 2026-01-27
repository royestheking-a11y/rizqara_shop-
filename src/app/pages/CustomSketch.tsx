import React, { useState, useEffect } from 'react';
import { useStore } from '@/app/context/StoreContext';
import { useNavigate } from 'react-router';
import { Upload, PenTool, Image as ImageIcon, Frame, Maximize, FileText, ArrowRight, Minus, Gift } from 'lucide-react';
import { toast } from 'sonner';

export const CustomSketch = () => {
  const { t, addCustomItemToCart, sketchPricing, uploadFile } = useStore();
  const navigate = useNavigate();

  // Form State
  const [images, setImages] = useState<string[]>([]);
  const [idea, setIdea] = useState('');
  const [sketchType, setSketchType] = useState('pencil'); // handmade, pencil, digital
  const [frameOption, setFrameOption] = useState('with-frame'); // with-frame, without-frame
  const [size, setSize] = useState('A4');
  const [customDimensions, setCustomDimensions] = useState({ width: '', height: '' });
  const [quantity, setQuantity] = useState('1'); // 1, 2 (combo)
  const [customText, setCustomText] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  // Price State
  const [price, setPrice] = useState(0);

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

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Pricing Logic
  useEffect(() => {
    const isCombo = quantity === '2';
    const isFrame = frameOption === 'with-frame';

    // Safety check for size mapping
    const sketchSize = size as keyof typeof sketchPricing;
    const currentPricing = sketchPricing[sketchSize];

    if (currentPricing) {
      if (isCombo) {
        setPrice(isFrame ? currentPricing.twoPieceWithFrame : currentPricing.twoPieceNoFrame);
      } else {
        setPrice(isFrame ? currentPricing.onePieceWithFrame : currentPricing.onePieceNoFrame);
      }
    } else {
      // Custom size - placeholder logic
      let basePrice = 1000;
      if (isFrame) basePrice += 500;
      if (isCombo) basePrice *= 1.8;
      setPrice(basePrice);
    }
  }, [size, frameOption, quantity, sketchPricing]);

  const handleOrder = async () => {
    if (images.length === 0) {
      toast.error(t('অনুগ্রহ করে ছবি আপলোড করুন', 'Please upload a photo'));
      return;
    }
    if (!idea.trim()) {
      toast.error(t('অনুগ্রহ করে আপনার আইডিয়া লিখুন', 'Please describe your idea'));
      return;
    }

    const uploadToast = toast.loading(t('ছবি আপলোড হচ্ছে...', 'Uploading images...'));

    try {
      // Parallelize main image uploads
      const uploadPromises = images.map(async (img) => {
        if (img.startsWith('data:')) {
          const res = await fetch(img);
          const blob = await res.blob();
          return await uploadFile(blob, 'custom_sketches');
        }
        return img;
      });

      // Special handling for reference image
      const referencePromise = (async () => {
        if (referenceImage && referenceImage.startsWith('data:')) {
          const res = await fetch(referenceImage);
          const blob = await res.blob();
          return await uploadFile(blob, 'custom_sketches');
        }
        return referenceImage;
      })();

      const [uploadedImageUrls, referenceUrl] = await Promise.all([
        Promise.all(uploadPromises),
        referencePromise
      ]);

      toast.dismiss(uploadToast);

      const mainImage = uploadedImageUrls[0];

      // Create a product object
      const product = {
        id: 'custom-sketch-service',
        title_bn: 'কাস্টম স্কেচ',
        title_en: 'Custom Sketch Service',
        desc_bn: `টাইপ: ${sketchType}, সাইজ: ${size}`,
        desc_en: `Type: ${sketchType}, Size: ${size}`,
        price: price / (quantity === '2' ? 2 : 1), // Unit price approximation
        category: 'Custom',
        images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600'],
        stock: 100,
      };

      // Re-creating product with correct total price
      const finalProduct = {
        ...product,
        price: price
      };

      addCustomItemToCart(finalProduct, 1, {
        customImage: mainImage,
        customNote: `Idea: ${idea}\nType: ${sketchType}\nSize: ${size}\nFrame: ${frameOption}\nText: ${customText}`,
        sketchType: sketchType as any,
        sketchSize: size as any,
        sketchFrame: frameOption as any,
        isCombo: quantity === '2',
        customText: customText,
        customIdea: idea,
        sketchReferenceImage: referenceUrl || undefined
      });

      navigate('/checkout');
    } catch (error) {
      toast.dismiss(uploadToast);
      console.error(error);
      toast.error('Failed to upload images');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#D91976] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            {t('কাস্টম স্কেচ', 'Custom Sketch')}
          </h1>
          <p className="text-xl opacity-90">
            {t('আপনার আইডিয়া, আমাদের সৃষ্টি', 'Your Idea, Our Creation')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Form Section */}
          <div className="lg:col-span-2 space-y-6">

            {/* Intro Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 text-gray-900 border-b pb-4">
                {t('কিভাবে অর্ডার করবেন?', 'How to Order?')}
              </h3>
              <ul className="space-y-4">
                {[
                  'আপনার প্রিয় মানুষের ছবি দিন',
                  'আইডিয়া শেয়ার করুন',
                  'স্কেচ টাইপ ও সাইজ বেছে নিন',
                  'আমরা বানিয়ে ডেলিভারি করব'
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <div className="w-6 h-6 rounded-full bg-pink-100 text-[#D91976] flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    {t(step, step === 'আপনার প্রিয় মানুষের ছবি দিন' ? 'Upload your photo' :
                      step === 'আইডিয়া শেয়ার করুন' ? 'Share your idea' :
                        step === 'স্কেচ টাইপ ও সাইজ বেছে নিন' ? 'Choose type and size' :
                          'We will create and deliver')}
                  </li>
                ))}
              </ul>
            </div>

            {/* Step 1: Upload */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#D91976] text-white flex items-center justify-center font-bold">1</div>
                <h3 className="text-xl font-bold text-gray-900">{t('ছবি আপলোড করুন', 'Upload Photo')}</h3>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/jpg"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                />
                <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 font-medium mb-2">{t('এখানে ক্লিক করে ছবি আপলোড করুন', 'Click to upload photos')}</p>
                <p className="text-sm text-gray-400">JPG/PNG, Max 5MB</p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-6">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Minus size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Idea */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#D91976] text-white flex items-center justify-center font-bold">2</div>
                <h3 className="text-xl font-bold text-gray-900">{t('আপনার আইডিয়া লিখুন', 'Write Your Idea')}</h3>
              </div>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder={t('"এই ছবিটা স্কেচ করুন, ব্যাকগ্রাউন্ড সাদা রাখবেন..."', '"Sketch this photo, keep background white..."')}
                className="w-full h-32 p-4 rounded-xl border border-gray-300 focus:outline-none focus:border-[#D91976] resize-none"
              />
            </div>

            {/* Step 3: Type */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#D91976] text-white flex items-center justify-center font-bold">3</div>
                <h3 className="text-xl font-bold text-gray-900">{t('স্কেচ টাইপ', 'Sketch Type')}</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'pencil', label: 'Pencil Sketch', icon: <PenTool /> },
                  { id: 'charcoal', label: 'Charcoal', icon: <PenTool /> },
                  { id: 'color', label: 'Color Sketch', icon: <PenTool /> },
                  { id: 'digital', label: 'Digital Sketch', icon: <ImageIcon /> },
                ].map((type) => (
                  <label key={type.id} className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition ${sketchType === type.id ? 'border-[#D91976] bg-pink-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="sketchType" value={type.id} checked={sketchType === type.id} onChange={(e) => setSketchType(e.target.value)} className="hidden" />
                    <div className={`mb-3 ${sketchType === type.id ? 'text-[#D91976]' : 'text-gray-400'}`}>{type.icon}</div>
                    <span className="font-bold text-sm text-center">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 4: Frame */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#D91976] text-white flex items-center justify-center font-bold">4</div>
                <h3 className="text-xl font-bold text-gray-900">{t('ফ্রেম অপশন', 'Frame Option')}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${frameOption === 'with-frame' ? 'border-[#D91976] bg-pink-50' : 'border-gray-200'}`}>
                  <input type="radio" name="frame" value="with-frame" checked={frameOption === 'with-frame'} onChange={(e) => setFrameOption(e.target.value)} className="hidden" />
                  <Frame size={20} className={frameOption === 'with-frame' ? 'text-[#D91976]' : 'text-gray-400'} />
                  <span className="font-bold">{t('ফ্রেম সহ', 'With Frame')}</span>
                </label>
                <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${frameOption === 'without-frame' ? 'border-[#D91976] bg-pink-50' : 'border-gray-200'}`}>
                  <input type="radio" name="frame" value="without-frame" checked={frameOption === 'without-frame'} onChange={(e) => setFrameOption(e.target.value)} className="hidden" />
                  <Maximize size={20} className={frameOption === 'without-frame' ? 'text-[#D91976]' : 'text-gray-400'} />
                  <span className="font-bold">{t('ফ্রেম ছাড়া', 'Without Frame')}</span>
                </label>
              </div>
            </div>

            {/* Step 5: Size */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#D91976] text-white flex items-center justify-center font-bold">5</div>
                <h3 className="text-xl font-bold text-gray-900">{t('সাইজ নির্বাচন করুন', 'Select Size')}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {['A5', 'A4', 'A3', 'A2', 'Custom'].map((s) => (
                  <label key={s} className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition ${size === s ? 'border-[#D91976] bg-pink-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="size" value={s} checked={size === s} onChange={(e) => setSize(e.target.value)} className="hidden" />
                    <span className="font-bold">{s}</span>
                  </label>
                ))}
              </div>

              {size === 'Custom' && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Width (cm)</label>
                    <input type="number" value={customDimensions.width} onChange={(e) => setCustomDimensions({ ...customDimensions, width: e.target.value })} className="w-full p-3 rounded-lg border border-gray-300" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Height (cm)</label>
                    <input type="number" value={customDimensions.height} onChange={(e) => setCustomDimensions({ ...customDimensions, height: e.target.value })} className="w-full p-3 rounded-lg border border-gray-300" />
                  </div>
                </div>
              )}
            </div>

            {/* Step 6: Package */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#D91976] text-white flex items-center justify-center font-bold">6</div>
                <h3 className="text-xl font-bold text-gray-900">{t('প্যাকেজ', 'Package')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${quantity === '1' ? 'border-[#D91976] bg-pink-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="quantity" value="1" checked={quantity === '1'} onChange={(e) => setQuantity(e.target.value)} className="hidden" />
                    <span className="font-bold">{t('১ পিস', '1 Piece')}</span>
                  </div>
                </label>
                <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${quantity === '2' ? 'border-[#D91976] bg-pink-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="quantity" value="2" checked={quantity === '2'} onChange={(e) => setQuantity(e.target.value)} className="hidden" />
                    <div>
                      <span className="font-bold block">{t('২ পিস', '2 Pieces')}</span>
                      <span className="text-xs text-[#D91976] font-semibold">Combo Offer</span>
                    </div>
                  </div>
                  <Gift className="text-[#D91976]" size={20} />
                </label>
              </div>
            </div>

            {/* Step 7 & 8 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={18} />
                  {t('স্কেচে লেখা (অপশনাল)', 'Text on Sketch (Optional)')}
                </h3>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Rahim & Ayesha – 2026"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#D91976]"
                />
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon size={18} />
                  {t('স্যাম্পল (অপশনাল)', 'Sample Reference (Optional)')}
                </h3>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReferenceUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-[#D91976] hover:file:bg-pink-100"
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Price Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-gray-900">{t('অর্ডার সামারি', 'Order Summary')}</h3>

              <div className="space-y-4 mb-6 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>{t('স্কেচ টাইপ', 'Sketch Type')}:</span>
                  <span className="font-medium text-gray-900 capitalize">{sketchType}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('সাইজ', 'Size')}:</span>
                  <span className="font-medium text-gray-900">{size}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('ফ্রেম', 'Frame')}:</span>
                  <span className="font-medium text-gray-900 capitalize">{frameOption.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('পরিমাণ', 'Quantity')}:</span>
                  <span className="font-medium text-gray-900">{quantity} pc{quantity === '2' ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('ডেলিভারি', 'Delivery')}:</span>
                  <span className="font-medium text-pink-600">Free</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 my-6 pt-4">
                <div className="flex justify-between items-center text-xl font-bold text-[#D91976]">
                  <span>{t('মোট', 'Total')}:</span>
                  <span>৳{price.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleOrder}
                className="w-full py-4 bg-[#D91976] text-white font-bold rounded-xl shadow-lg hover:bg-[#A8145A] transition flex items-center justify-center gap-2"
              >
                {t('অর্ডার করুন', 'Order Now')}
                <ArrowRight size={20} />
              </button>

              <div className="mt-6 bg-gray-50 rounded-lg p-4 text-xs text-gray-500">
                <p className="font-bold mb-2">{t('মূল্য তালিকা', 'Price List')}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold block underline">A4 Size</span>
                    Frame: {sketchPricing.A4.onePieceWithFrame}৳ | {sketchPricing.A4.twoPieceWithFrame}৳<br />
                    No Frame: {sketchPricing.A4.onePieceNoFrame}৳ | {sketchPricing.A4.twoPieceNoFrame}৳
                  </div>
                  <div>
                    <span className="font-semibold block underline">A5 Size</span>
                    Frame: {sketchPricing.A5.onePieceWithFrame}৳ | {sketchPricing.A5.twoPieceWithFrame}৳<br />
                    No Frame: {sketchPricing.A5.onePieceNoFrame}৳ | {sketchPricing.A5.twoPieceNoFrame}৳
                  </div>
                  <div>
                    <span className="font-semibold block underline">A3 Size</span>
                    Frame: {sketchPricing.A3.onePieceWithFrame}৳ | {sketchPricing.A3.twoPieceWithFrame}৳<br />
                    No Frame: {sketchPricing.A3.onePieceNoFrame}৳ | {sketchPricing.A3.twoPieceNoFrame}৳
                  </div>
                  <div>
                    <span className="font-semibold block underline">A2 Size</span>
                    Frame: {sketchPricing.A2.onePieceWithFrame}৳ | {sketchPricing.A2.twoPieceWithFrame}৳<br />
                    No Frame: {sketchPricing.A2.onePieceNoFrame}৳ | {sketchPricing.A2.twoPieceNoFrame}৳
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};