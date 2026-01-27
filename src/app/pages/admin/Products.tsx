import React, { useState } from 'react';
import { ImageUploader } from '@/app/components/ImageUploader';
import { AutoTranslator } from '@/app/components/AutoTranslator';
import { useStore, Product } from '@/app/context/StoreContext';
import { Plus, Edit, Trash2, Search, X, Gift } from 'lucide-react';
import { OCCASIONS, PERSON_TYPES, MOODS } from '@/app/utils/giftConstants';
import { PRODUCT_CATEGORIES } from '@/app/constants/categories';

export const AdminProducts = () => {
    const { products, addProduct, updateProduct, deleteProduct, t } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [formData, setFormData] = useState({
        title_bn: '',
        title_en: '',
        desc_bn: '',
        desc_en: '',
        price: 0,
        discount_price: 0,
        category: '',
        subCategory: '',
        itemType: '',
        stock: 0,
        images: [''],
        colors: '',
        isCustomizable: false,
        isNew: false,
        isBestSeller: false,
        isGiftFeatured: false,
        tags: [] as string[],
    });

    const filteredProducts = products.filter(p =>
        p.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                title_bn: product.title_bn,
                title_en: product.title_en,
                desc_bn: product.desc_bn,
                desc_en: product.desc_en,
                price: product.price,
                discount_price: product.discount_price || 0,
                category: product.category,
                subCategory: product.subCategory || '',
                itemType: product.itemType || '',
                stock: product.stock,
                images: product.images.length > 0 ? product.images : [''],
                colors: product.colors ? product.colors.join(', ') : '',
                isCustomizable: product.isCustomizable || false,
                isNew: product.isNew || false,
                isBestSeller: product.isBestSeller || false,
                isGiftFeatured: product.isGiftFeatured || false,
                tags: product.tags || [],
            });
        } else {
            setEditingProduct(null);
            setFormData({
                title_bn: '',
                title_en: '',
                desc_bn: '',
                desc_en: '',
                price: 0,
                discount_price: 0,
                category: '',
                subCategory: '',
                itemType: '',
                stock: 0,
                images: [''],
                colors: '',
                isCustomizable: false,
                isNew: false,
                isBestSeller: false,
                isGiftFeatured: false,
                tags: [],
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();


        // Map category names to IDs expected by Shop.tsx
        const categoryMap: Record<string, string> = {
            'ক্লে (Clay)': 'Clay',
            'উইমেন প্রোডাক্ট (Women\'s Items)': 'Women',
            'গিফট বক্স (Gift Boxes)': 'Gifts',
            'ওয়াল আর্ট (Wall Art / Sketch)': 'Art',
            'ইনডোর প্ল্যান্টস (Indoor Plants)': 'Plants',
            'কাস্টমাইজড (Customized Products)': 'Custom'
        };

        const productData: any = {
            title_bn: formData.title_bn,
            title_en: formData.title_en,
            desc_bn: formData.desc_bn,
            desc_en: formData.desc_en,
            price: Number(formData.price),
            discount_price: Number(formData.discount_price) || undefined,
            category: categoryMap[formData.category] || formData.category, // Use mapped ID
            subCategory: formData.subCategory,
            itemType: formData.itemType,
            stock: Number(formData.stock),
            images: formData.images.filter(img => img.trim() !== ''),
            colors: formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(c => c !== '') : [],
            isCustomizable: formData.isCustomizable,
            isNew: formData.isNew,
            isBestSeller: formData.isBestSeller,
            isGiftFeatured: formData.isGiftFeatured,
            tags: formData.tags,
        };

        if (editingProduct) {
            updateProduct({ ...editingProduct, ...productData });
        } else {
            addProduct({ ...productData, id: `p_${Date.now()}`, rating: 0, reviews: 0 });
        }

        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (confirm(t('আপনি কি নিশ্চিত যে আপনি এই পণ্যটি মুছে ফেলতে চান?', 'Are you sure you want to delete this product?'))) {
            deleteProduct(id);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">{t('পণ্য সমূহ', 'Products')}</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#D91976] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-pink-800 transition"
                >
                    <Plus size={18} /> {t('পণ্য যোগ করুন', 'Add Product')}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <input
                            type="text"
                            placeholder={t('পণ্য খুঁজুন...', 'Search products...')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#D91976] text-sm"
                        />
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                                <th className="p-4">{t('পণ্য', 'Product')}</th>
                                <th className="p-4">{t('ক্যাটাগরি', 'Category')}</th>
                                <th className="p-4">{t('দাম', 'Price')}</th>
                                <th className="p-4">{t('স্টক', 'Stock')}</th>
                                <th className="p-4 text-right">{t('অ্যাকশন', 'Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0">
                                                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">{product.title_en}</p>
                                                <p className="text-xs text-gray-500">{product.title_bn}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{product.category}</td>
                                    <td className="p-4 text-sm font-medium">
                                        {product.discount_price ? (
                                            <>
                                                <span className="text-[#D91976]">৳{product.discount_price}</span>
                                                <span className="text-gray-400 text-xs ml-1 line-through">৳{product.price}</span>
                                            </>
                                        ) : (
                                            <span>৳{product.price}</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2 py-1 rounded text-xs font-medium w-fit ${product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-pink-100 text-pink-700'}`}>
                                                {product.stock} {t('টি স্টকে আছে', 'in stock')}
                                            </span>
                                            {product.isGiftFeatured && (
                                                <span className="px-2 py-1 rounded text-xs font-medium w-fit bg-purple-100 text-purple-700 flex items-center gap-1">
                                                    <Gift size={10} /> {t('গিফট', 'Gift')}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleOpenModal(product)}
                                            className="p-1.5 text-gray-500 hover:text-blue-600 transition"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredProducts.length === 0 && (
                    <div className="p-8 text-center text-gray-500">{t('কোনো পণ্য পাওয়া যায়নি', 'No products found.')}</div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingProduct ? t('পণ্য এডিট করুন', 'Edit Product') : t('নতুন পণ্য যোগ করুন', 'Add New Product')}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                                {/* Title EN */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('শিরোনাম (ইংরেজি)', 'Title (English)')} *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title_en}
                                        onChange={e => setFormData({ ...formData, title_en: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                                    />
                                </div>
                                {/* Title BN */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-semibold text-gray-700">{t('শিরোনাম (বাংলা)', 'Title (Bangla)')} *</label>
                                        <AutoTranslator
                                            sourceText={formData.title_en}
                                            onTranslate={(translated) => setFormData(prev => ({ ...prev, title_bn: translated }))}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title_bn}
                                        onChange={e => setFormData({ ...formData, title_bn: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('দাম', 'Price')} *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                                    />
                                </div>
                                {/* Discount Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('ডিসকাউন্ট দাম', 'Discount Price')}</label>
                                    <input
                                        type="number"
                                        value={formData.discount_price}
                                        onChange={e => setFormData({ ...formData, discount_price: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                                    />
                                </div>

                                {/* Category Dropdowns */}
                                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Main Category */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('ক্যাটাগরি', 'Category')} *</label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value, subCategory: '', itemType: '' })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                                        >
                                            <option value="">{t('ক্যাটাগরি নির্বাচন করুন', 'Select Category')}</option>
                                            {PRODUCT_CATEGORIES.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Sub Category */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('সাব-ক্যাটাগরি', 'Sub Category')}</label>
                                        <select
                                            value={formData.subCategory}
                                            onChange={e => setFormData({ ...formData, subCategory: e.target.value, itemType: '' })}
                                            disabled={!formData.category}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent disabled:opacity-50"
                                        >
                                            <option value="">{t('সাব-ক্যাটাগরি নির্বাচন করুন', 'Select Sub-Category')}</option>
                                            {PRODUCT_CATEGORIES.find(c => c.name === formData.category)?.subcategories?.map(sub => (
                                                <option key={sub.id} value={sub.name}>{sub.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Item Type (If applicable) */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('আইটেম টাইপ', 'Item Type')}</label>
                                        <select
                                            value={formData.itemType}
                                            onChange={e => setFormData({ ...formData, itemType: e.target.value })}
                                            disabled={!formData.subCategory}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent disabled:opacity-50"
                                        >
                                            <option value="">{t('টাইপ নির্বাচন করুন', 'Select Type')}</option>
                                            {
                                                // Type logic: Find the selected subcategory object within the selected category
                                                PRODUCT_CATEGORIES.find(c => c.name === formData.category)
                                                    ?.subcategories?.find(s => s.name === formData.subCategory)
                                                    ?.types?.map(type => (
                                                        <option key={type.id} value={type.name}>{type.name}</option>
                                                    ))
                                            }
                                        </select>
                                    </div>
                                </div>
                                {/* Stock */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('স্টক', 'Stock')} *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                                    />
                                </div>



                                {/* Description EN */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('বিবরণ (ইংরেজি)', 'Description (English)')} *</label>
                                    <textarea
                                        required
                                        value={formData.desc_en}
                                        onChange={e => setFormData({ ...formData, desc_en: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                                    />
                                </div>
                                {/* Description BN */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-semibold text-gray-700">{t('বিবরণ (বাংলা)', 'Description (Bangla)')} *</label>
                                        <AutoTranslator
                                            sourceText={formData.desc_en}
                                            onTranslate={(translated) => setFormData(prev => ({ ...prev, desc_bn: translated }))}
                                        />
                                    </div>
                                    <textarea
                                        required
                                        value={formData.desc_bn}
                                        onChange={e => setFormData({ ...formData, desc_bn: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                                    />
                                </div>



                                {/* Image Upload */}
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('পণ্যের ছবি', 'Product Images')} *</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <ImageUploader
                                                label={t('নতুন ছবি যোগ করুন', 'Add New Image')}
                                                aspectRatio={1}
                                                onImageCropped={(base64) => setFormData({ ...formData, images: [...formData.images, base64].filter(img => img !== '') })}
                                            />
                                            <p className="text-xs text-gray-500">{t('অন্তত ৩-৪টি ছবি আপলোড করার পরামর্শ দেওয়া হচ্ছে।', 'It is recommended to upload at least 3-4 images.')}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 min-h-[140px]">
                                            <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">{t('আপলোড করা ছবি', 'Uploaded Images')}</label>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                                {formData.images.filter(img => img && img !== '').map((img, idx) => (
                                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group shadow-sm bg-white">
                                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-red-600 scale-90"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {formData.images.filter(img => img && img !== '').length === 0 && (
                                                    <div className="col-span-full h-20 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-xs">
                                                        {t('কোনো ছবি নেই', 'No images yet')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Colors */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('রঙ (কমা দিয়ে আলাদা করুন)', 'Colors (Comma separated)')}</label>
                                    <input
                                        type="text"
                                        value={formData.colors}
                                        onChange={e => setFormData({ ...formData, colors: e.target.value })}
                                        placeholder="Red, Blue, Green"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                                    />
                                </div>

                                {/* Checkboxes */}
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isCustomizable}
                                            onChange={e => setFormData({ ...formData, isCustomizable: e.target.checked })}
                                            className="w-5 h-5 text-[#D91976] rounded focus:ring-[#D91976]"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{t('কাস্টমাইজেবল', 'Customizable')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isNew}
                                            onChange={e => setFormData({ ...formData, isNew: e.target.checked })}
                                            className="w-5 h-5 text-[#D91976] rounded focus:ring-[#D91976]"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{t('নতুন আগমন', 'New Arrival')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isBestSeller}
                                            onChange={e => setFormData({ ...formData, isBestSeller: e.target.checked })}
                                            className="w-5 h-5 text-[#D91976] rounded focus:ring-[#D91976]"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{t('বেস্ট সেলার', 'Best Seller')}</span>
                                    </label>
                                </div>

                                {/* Gift Generator Settings */}
                                <div className="border-t border-gray-200 pt-6 mt-2">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 bg-pink-100 text-pink-600 rounded">
                                            <Gift size={18} />
                                        </div>
                                        <h3 className="font-bold text-gray-800">{t('গিফট জেনারেটর সেটিংস', 'Gift Generator Settings')}</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 cursor-pointer mb-4">
                                            <input
                                                type="checkbox"
                                                checked={formData.isGiftFeatured}
                                                onChange={e => setFormData({ ...formData, isGiftFeatured: e.target.checked })}
                                                className="w-5 h-5 text-[#D91976] rounded focus:ring-[#D91976]"
                                            />
                                            <span className="text-sm font-medium text-gray-700">{t('গিফট হিসেবে ফিচার করুন', 'Feature as Gift')}</span>
                                        </label>

                                        {/* Tag Selection */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Occasions */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">{t('উপলক্ষ', 'Occasions')}</label>
                                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                                    {OCCASIONS.map(occ => (
                                                        <label key={occ.id} className="flex items-center gap-2 cursor-pointer text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={occ.tags.some(t => formData.tags.includes(t))}
                                                                onChange={e => {
                                                                    const formTags = new Set(formData.tags);
                                                                    if (e.target.checked) {
                                                                        occ.tags.forEach(t => formTags.add(t));
                                                                    } else {
                                                                        occ.tags.forEach(t => formTags.delete(t));
                                                                    }
                                                                    setFormData({ ...formData, tags: Array.from(formTags) });
                                                                }}
                                                                className="rounded text-[#D91976] focus:ring-[#D91976]"
                                                            />
                                                            <span className="flex items-center gap-1.5">
                                                                <occ.Icon size={14} className="text-gray-400" />
                                                                {occ.label}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Person Types */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">{t('কাকে দেবেন', 'For Who')}</label>
                                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                                    {PERSON_TYPES.map(p => (
                                                        <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={p.tags.some(t => formData.tags.includes(t))}
                                                                onChange={e => {
                                                                    const formTags = new Set(formData.tags);
                                                                    if (e.target.checked) {
                                                                        p.tags.forEach(t => formTags.add(t));
                                                                    } else {
                                                                        p.tags.forEach(t => formTags.delete(t));
                                                                    }
                                                                    setFormData({ ...formData, tags: Array.from(formTags) });
                                                                }}
                                                                className="rounded text-[#D91976] focus:ring-[#D91976]"
                                                            />
                                                            {p.label}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Moods */}
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">{t('মুড', 'Mood')}</label>
                                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                                    {MOODS.map(m => (
                                                        <label key={m.id} className="flex items-center gap-2 cursor-pointer text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={m.tags.some(t => formData.tags.includes(t))}
                                                                onChange={e => {
                                                                    const formTags = new Set(formData.tags);
                                                                    if (e.target.checked) {
                                                                        m.tags.forEach(t => formTags.add(t));
                                                                    } else {
                                                                        m.tags.forEach(t => formTags.delete(t));
                                                                    }
                                                                    setFormData({ ...formData, tags: Array.from(formTags) });
                                                                }}
                                                                className="rounded text-[#D91976] focus:ring-[#D91976]"
                                                            />
                                                            <span className="flex items-center gap-1.5">
                                                                <m.Icon size={14} className="text-gray-400" />
                                                                {m.label}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                                >
                                    {t('বাতিল', 'Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-[#D91976] text-white rounded-lg hover:bg-[#A8145A] transition font-semibold shadow-md"
                                >
                                    {editingProduct ? t('আপডেট করুন', 'Update Product') : t('যোগ করুন', 'Add Product')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
