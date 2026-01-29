import { useState, useEffect } from 'react';
import { useStore } from '@/app/context/StoreContext';
import { MapPin, Phone, Mail, Save, Edit2 } from 'lucide-react';
import { ImageUploader } from '@/app/components/ImageUploader';

export const Profile = () => {
    const { user, updateUser, t, uploadFile } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        avatar: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                phone: user.phone || '',
                avatar: user.avatar || '',
            });
        }
    }, [user]);

    if (!user) return null;

    const handleSave = async () => {
        let avatarUrl = formData.avatar;

        if (avatarUrl && avatarUrl.startsWith('data:image')) {
            try {
                const res = await fetch(avatarUrl);
                const blob = await res.blob();
                avatarUrl = await uploadFile(blob, 'profile_images');
            } catch (error) {
                console.error("Failed to upload avatar", error);
                // Optionally handle error
            }
        }

        updateUser({
            name: formData.name,
            phone: formData.phone,
            avatar: avatarUrl,
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form
        setFormData({
            name: user.name,
            phone: user.phone || '',
            avatar: user.avatar || '',
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">{t('আমার প্রোফাইল', 'My Profile')}</h2>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                    {/* Avatar Section */}
                    <div className="shrink-0 relative">
                        {isEditing ? (
                            <ImageUploader
                                label="Profile Photo"
                                aspectRatio={1}
                                initialImage={formData.avatar}
                                onImageCropped={(base64) => setFormData(prev => ({ ...prev, avatar: base64 }))}
                                className="w-32 h-32"
                            />
                        ) : (
                            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-gray-400">{user.name.charAt(0)}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Header Info */}
                    <div className="flex-1 text-center md:text-left pt-2">
                        {isEditing ? (
                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('নাম', 'Name')}</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('ফোন', 'Phone')}</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h3>
                                <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                                    <span className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded-full capitalize font-medium">
                                        {user.role}
                                    </span>
                                    {user.phone && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                                            <Phone size={14} />
                                            <span>{user.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Action Buttons (Top Right on Desktop) */}
                    <div className="hidden md:block">
                        {isEditing ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    {t('বাতিল', 'Cancel')}
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-[#D91976] text-white rounded-lg hover:bg-[#A8145A] transition shadow-md flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    {t('সংরক্ষণ করুন', 'Save Changes')}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                            >
                                <Edit2 size={16} />
                                {t('এডিট প্রোফাইল', 'Edit Profile')}
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Mail size={18} className="text-[#D91976]" />
                            {t('যোগাযোগের তথ্য', 'Contact Info')}
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-gray-500 w-16">{t('ইমেইল', 'Email')}:</span>
                                <span className="font-medium text-gray-900">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-gray-500 w-16">{t('ফোন', 'Phone')}:</span>
                                <span className="font-medium text-gray-900">
                                    {user.phone || t('যুক্ত করা হয়নি', 'Not added')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <MapPin size={18} className="text-[#D91976]" />
                            {t('ডিফল্ট ঠিকানা', 'Default Address')}
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            {user.addresses.length > 0 ? (
                                <div>
                                    <p className="font-medium text-gray-900 mb-1">{user.addresses[0].details}</p>
                                    <p className="text-sm text-gray-500">{user.addresses[0].upazila}, {user.addresses[0].district}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">{t('কোনো ঠিকানা সেভ করা নেই', 'No address saved.')}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="md:hidden mt-8 pt-6 border-t flex justify-end gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                {t('বাতিল', 'Cancel')}
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-2 bg-[#D91976] text-white rounded-lg hover:bg-[#A8145A] transition shadow-md"
                            >
                                {t('সংরক্ষণ করুন', 'Save')}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                        >
                            <Edit2 size={16} />
                            {t('এডিট প্রোফাইল', 'Edit Profile')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
