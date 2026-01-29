import { useState, useEffect } from 'react';
import { useStore, Address } from '@/app/context/StoreContext';
import { User, MapPin, Phone, Mail, Plus, Edit, Check, X, Save, Edit2, Bell, Calendar, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ImageUploader } from '@/app/components/ImageUploader';

export const ProfileEnhanced = () => {
  const { user, updateUserAddress, deleteAddress, updateUser, addReminder, deleteReminder, uploadFile, t } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'reminders'>('info');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Profile Edit State
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

  const [addressForm, setAddressForm] = useState({
    division: '',
    district: '',
    upazila: '',
    details: ''
  });

  // Reminder Form State
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    title: '',
    date: '',
    type: 'birthday' as 'birthday' | 'anniversary' | 'other'
  });

  const handleAddReminder = () => {
    if (!reminderForm.title || !reminderForm.date) {
      toast.error(t('শিরোনাম এবং তারিখ দিন', 'Please provide title and date'));
      return;
    }
    addReminder(reminderForm);
    setReminderForm({ title: '', date: '', type: 'birthday' });
    setShowReminderForm(false);
  };

  const getDaysLeft = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateStr);
    targetDate.setFullYear(today.getFullYear());
    if (targetDate < today) {
      targetDate.setFullYear(today.getFullYear() + 1);
    }
    const diffTime = Math.abs(targetDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!user) return null;

  const handleSaveProfile = async () => {
    try {
      let avatarUrl = formData.avatar;

      // If avatar is base64, upload it first
      if (formData.avatar && formData.avatar.startsWith('data:')) {
        const res = await fetch(formData.avatar);
        const blob = await res.blob();
        avatarUrl = await uploadFile(blob, 'profiles');
      }

      await updateUser({
        name: formData.name,
        phone: formData.phone,
        avatar: avatarUrl,
      });
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  const divisions = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];

  const handleSaveAddress = () => {
    // ... existing address logic
    if (!addressForm.division || !addressForm.district || !addressForm.upazila || !addressForm.details) {
      toast.error(t('সকল তথ্য পূরণ করুন', 'Please fill all fields'));
      return;
    }

    const newAddress: Address = {
      id: editingAddress?.id || Math.random().toString(36).substr(2, 9),
      ...addressForm,
      isDefault: user.addresses.length === 0
    };

    updateUserAddress(newAddress);
    toast.success(t('ঠিকানা সংরক্ষিত হয়েছে', 'Address saved'));
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm({ division: '', district: '', upazila: '', details: '' });
  };

  const handleEditAddress = (address: Address) => {
    // ... existing logic
    setEditingAddress(address);
    setAddressForm({
      division: address.division,
      district: address.district,
      upazila: address.upazila,
      details: address.details
    });
    setShowAddressForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">{t('আমার প্রোফাইল', 'My Profile')}</h2>
        {activeTab === 'info' && (
          isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50"
              >
                {t('বাতিল', 'Cancel')}
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-[#D91976] text-white rounded text-sm flex items-center gap-2 hover:bg-pink-800"
              >
                <Save size={16} /> {t('সেভ', 'Save')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit2 size={16} /> {t('এডিট প্রোফাইল', 'Edit Profile')}
            </button>
          )
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-6 py-4 font-medium transition ${activeTab === 'info'
              ? 'bg-[#D91976] text-white'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <User size={18} className="inline mr-2" />
            {t('ব্যক্তিগত তথ্য', 'Personal Info')}
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex-1 px-6 py-4 font-medium transition ${activeTab === 'addresses'
              ? 'bg-[#D91976] text-white'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <MapPin size={18} className="inline mr-2" />
            {t('ঠিকানা', 'Addresses')} ({(user.addresses || []).length})
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex-1 px-6 py-4 font-medium transition ${activeTab === 'reminders'
              ? 'bg-[#D91976] text-white'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <Bell size={18} className="inline mr-2" />
            {t('রিমাইন্ডার', 'Reminders')} ({(user.reminders || []).length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
                {isEditing ? (
                  <div className="shrink-0">
                    <ImageUploader
                      label=""
                      initialImage={formData.avatar}
                      onImageCropped={(base64) => setFormData({ ...formData, avatar: base64 })}
                      className="w-24"
                      aspectRatio={1}
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-[#D91976] to-pink-700 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg overflow-hidden shrink-0 border-4 border-white">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                )}

                <div className="flex-1 pt-2">
                  {isEditing ? (
                    <div className="space-y-4 max-w-sm">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">{t('নাম', 'Name')}</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#D91976]"
                        />
                      </div>
                      {/* We can edit phone here too if needed, but it's also in the contact section below. */}
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                      <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full capitalize font-medium">
                        {user.role}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    {t('যোগাযোগের তথ্য', 'Contact Information')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail size={18} className="text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">{t('ইমেইল', 'Email')}</p>
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone size={18} className="text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">{t('ফোন', 'Phone')}</p>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:border-[#D91976]"
                          />
                        ) : (
                          <p className="text-sm font-medium text-gray-900">{user.phone || t('যোগ করা হয়নি', 'Not added')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    {t('ডিফল্ট ঠিকানা', 'Default Address')}
                  </h4>
                  {user.addresses.length > 0 ? (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-gray-400 mt-1 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.addresses[0].details}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {user.addresses[0].upazila}, {user.addresses[0].district}, {user.addresses[0].division}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-400 italic">{t('কোনো ঠিকানা নেই', 'No address saved')}</p>
                      <button
                        onClick={() => {
                          setActiveTab('addresses');
                          setShowAddressForm(true);
                        }}
                        className="mt-2 text-sm text-[#D91976] font-medium hover:underline"
                      >
                        {t('ঠিকানা যোগ করুন', 'Add Address')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-700">
                  {t('সংরক্ষিত ঠিকানা', 'Saved Addresses')}
                </h4>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#D91976] text-white rounded-lg hover:bg-pink-800 transition text-sm font-medium"
                  >
                    <Plus size={16} />
                    {t('নতুন ঠিকানা', 'Add Address')}
                  </button>
                )}
              </div>

              {showAddressForm && (
                <div className="bg-gray-50 p-6 rounded-xl border-2 border-[#D91976]">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-bold text-gray-800">
                      {editingAddress ? t('ঠিকানা সম্পাদনা', 'Edit Address') : t('নতুন ঠিকানা যোগ করুন', 'Add New Address')}
                    </h5>
                    <button
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                        setAddressForm({ division: '', district: '', upazila: '', details: '' });
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('বিভাগ', 'Division')} *
                      </label>
                      <select
                        value={addressForm.division}
                        onChange={(e) => setAddressForm({ ...addressForm, division: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                      >
                        <option value="">{t('বিভাগ নির্বাচন করুন', 'Select Division')}</option>
                        {divisions.map(div => (
                          <option key={div} value={div}>{div}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('জেলা', 'District')} *
                      </label>
                      <input
                        type="text"
                        value={addressForm.district}
                        onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                        placeholder={t('জেলার নাম', 'District name')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('উপজেলা', 'Upazila')} *
                      </label>
                      <input
                        type="text"
                        value={addressForm.upazila}
                        onChange={(e) => setAddressForm({ ...addressForm, upazila: e.target.value })}
                        placeholder={t('উপজেলার নাম', 'Upazila name')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('বিস্তারিত ঠিকানা', 'Detailed Address')} *
                      </label>
                      <textarea
                        value={addressForm.details}
                        onChange={(e) => setAddressForm({ ...addressForm, details: e.target.value })}
                        placeholder={t('বাড়ি/ফ্ল্যাট নম্বর, রাস্তা, এলাকা', 'House/Flat, Road, Area')}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleSaveAddress}
                      className="flex items-center gap-2 px-6 py-2 bg-[#D91976] text-white rounded-lg hover:bg-pink-800 transition font-medium"
                    >
                      <Check size={18} />
                      {t('সংরক্ষণ করুন', 'Save Address')}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                        setAddressForm({ division: '', district: '', upazila: '', details: '' });
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      {t('বাতিল', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {user.addresses.map((address) => (
                  <div
                    key={address.id}
                    className="p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-[#D91976] transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-[#D91976] mt-1 shrink-0" />
                        <div>
                          {address.isDefault && (
                            <span className="inline-block text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-medium mb-2">
                              {t('ডিফল্ট', 'Default')}
                            </span>
                          )}
                          <p className="font-medium text-gray-900">{address.details}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {address.upazila}, {address.district}, {address.division}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title={t('সম্পাদনা', 'Edit')}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(t('এই ঠিকানাটি মুছে ফেলতে চান?', 'Delete this address?'))) {
                              deleteAddress(address.id);
                              toast.success(t('ঠিকানা মুছে ফেলা হয়েছে', 'Address deleted'));
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title={t('মুছে ফেলুন', 'Delete')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {user.addresses.length === 0 && !showAddressForm && (
                  <div className="text-center py-12">
                    <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 mb-4">{t('কোনো ঠিকানা সংরক্ষিত নেই', 'No saved addresses')}</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#D91976] text-white rounded-lg hover:bg-pink-800 transition font-medium"
                    >
                      <Plus size={18} />
                      {t('প্রথম ঠিকানা যোগ করুন', 'Add Your First Address')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'reminders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-700">
                  {t('আমার রিমাইন্ডার', 'My Reminders')}
                </h4>
                {!showReminderForm && (
                  <button
                    onClick={() => setShowReminderForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#D91976] text-white rounded-lg hover:bg-pink-800 transition text-sm font-medium shadow-md"
                  >
                    <Plus size={16} />
                    {t('নতুন রিমাইন্ডার', 'Add Reminder')}
                  </button>
                )}
              </div>

              {showReminderForm && (
                <div className="bg-pink-50 p-6 rounded-xl border border-pink-200">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-bold text-gray-800">{t('নতুন রিমাইন্ডার যোগ করুন', 'Add New Reminder')}</h5>
                    <button
                      onClick={() => setShowReminderForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('শিরোনাম', 'Title')} *
                      </label>
                      <input
                        type="text"
                        value={reminderForm.title}
                        onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                        placeholder="Mom's Birthday"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('তারিখ', 'Date')} *
                      </label>
                      <input
                        type="date"
                        value={reminderForm.date}
                        onChange={(e) => setReminderForm({ ...reminderForm, date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('ধরন', 'Type')}
                      </label>
                      <select
                        value={reminderForm.type}
                        onChange={(e) => setReminderForm({ ...reminderForm, type: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                      >
                        <option value="birthday">Birthday</option>
                        <option value="anniversary">Anniversary</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => setShowReminderForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition text-sm font-medium"
                    >
                      {t('বাতিল', 'Cancel')}
                    </button>
                    <button
                      onClick={handleAddReminder}
                      className="px-4 py-2 bg-[#D91976] text-white rounded-lg hover:bg-pink-800 transition text-sm font-medium"
                    >
                      {t('সেভ করুন', 'Save')}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(user.reminders || []).map(reminder => {
                  const daysLeft = getDaysLeft(reminder.date);
                  const isUrgent = daysLeft <= 10;

                  return (
                    <div key={reminder.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition relative group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${reminder.type === 'birthday' ? 'bg-purple-100 text-purple-600' : reminder.type === 'anniversary' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {reminder.type === 'birthday' ? <User size={20} /> : <Calendar size={20} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{reminder.title}</h4>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar size={10} /> {new Date(reminder.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteReminder(reminder.id)}
                          className="text-red-500 hover:text-red-700 transition p-2 hover:bg-red-50 rounded-full"
                          title={t('মুছে ফেলুন', 'Delete')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 uppercase font-bold">{t('বাকি আছে', 'Time Left')}</span>
                          <span className={`text-lg font-bold ${isUrgent ? 'text-[#D91976]' : 'text-gray-700'}`}>
                            {daysLeft} {t('দিন', 'Days')}
                          </span>
                        </div>
                        {isUrgent ? (
                          <div className="text-right">
                            <p className="text-[10px] text-green-600 font-bold mb-1 flex items-center gap-1 justify-end">
                              <Check size={10} /> {t('সময়মতো পেতে আজই অর্ডার করুন', 'Order today for timely delivery')}
                            </p>
                            <button
                              onClick={() => navigate('/gift-generator')}
                              className="px-3 py-1.5 bg-[#D91976] text-white text-xs font-bold rounded shadow-sm hover:bg-pink-800 transition"
                            >
                              👉 {t('এখনই অর্ডার করুন', 'Order Now')}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">{t('এখনও সময় আছে', 'Plenty of time')}</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {(user.reminders || []).length === 0 && !showReminderForm && (
                  <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 mb-4">{t('কোনো রিমাইন্ডার নেই', 'No reminders set')}</p>
                    <button
                      onClick={() => setShowReminderForm(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#D91976] text-white rounded-lg hover:bg-pink-800 transition font-medium"
                    >
                      <Plus size={18} />
                      {t('প্রথম রিমাইন্ডার সেট করুন', 'Set First Reminder')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
