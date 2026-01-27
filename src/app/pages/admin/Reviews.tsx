import React, { useState, useCallback } from 'react';
import { useStore } from '@/app/context/StoreContext';
import { Trash2, Image as ImageIcon, Star, Search, Upload, RotateCw, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/app/utils/cropImage';

export const AdminReviews = () => {
  const { reviews, premiumReviews, addPremiumReview, deletePremiumReview, deleteUserReview } = useStore();
  const [activeTab, setActiveTab] = useState<'premium' | 'user'>('premium');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Crop State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Search/Filter
  const [searchTerm, setSearchTerm] = useState('');

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setUploadedImage(reader.result as string));
      reader.readAsDataURL(file);
    }
  };

  const handleAddPremium = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !uploadedImage) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const croppedImage = await getCroppedImg(
        uploadedImage,
        croppedAreaPixels!,
        rotation
      );

      addPremiumReview({
        title: newTitle,
        imageUrl: croppedImage
      });

      setNewTitle('');
      setUploadedImage(null);
      setRotation(0);
      setZoom(1);
      setIsFormOpen(false);
      toast.success('Review added successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to crop image');
    }
  };

  const filteredUserReviews = reviews.filter(r =>
    r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Reviews Management</h1>
        <div className="flex bg-white p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setActiveTab('premium')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'premium' ? 'bg-[#D91976] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Premium / Social Proof
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'user' ? 'bg-[#D91976] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            User Product Reviews
          </button>
        </div>
      </div>

      {activeTab === 'premium' ? (
        <div className="space-y-6">
          {/* Add New Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <ImageIcon size={20} className="text-[#D91976]" />
                Add New Premium Review
              </h3>
              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="text-sm text-[#D91976] hover:underline"
              >
                {isFormOpen ? 'Cancel' : 'Add New'}
              </button>
            </div>

            <AnimatePresence>
              {isFormOpen && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleAddPremium}
                  className="space-y-6 overflow-hidden"
                >
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Title / Caption</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Facebook Recommendation"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#D91976]"
                    />
                  </div>

                  {!uploadedImage ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <Upload size={24} />
                        </div>
                        <p className="text-sm font-medium">Click to upload image</p>
                        <p className="text-xs">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative h-64 w-full bg-gray-900 rounded-xl overflow-hidden">
                        <Cropper
                          image={uploadedImage}
                          crop={crop}
                          zoom={zoom}
                          rotation={rotation}
                          aspect={4 / 3}
                          onCropChange={setCrop}
                          onCropComplete={onCropComplete}
                          onZoomChange={setZoom}
                          onRotationChange={setRotation}
                        />
                      </div>

                      <div className="flex gap-4 items-center">
                        <div className="flex-1 space-y-1">
                          <label className="text-xs font-bold text-gray-600">Zoom</label>
                          <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-xs font-bold text-gray-600">Rotation</label>
                          <input
                            type="range"
                            value={rotation}
                            min={0}
                            max={360}
                            step={1}
                            aria-labelledby="Rotation"
                            onChange={(e) => setRotation(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setRotation(r => (r + 90) % 360)}
                          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                          title="Rotate 90deg"
                        >
                          <RotateCw size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadedImage(null)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                          title="Remove Image"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={!uploadedImage || !newTitle}
                      className="px-6 py-2 bg-[#D91976] text-white rounded-lg hover:bg-pink-800 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={18} /> Save Review
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumReviews.map(review => (
              <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                <div className="relative h-48 bg-gray-100">
                  <img src={review.imageUrl} alt={review.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => deletePremiumReview(review.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 truncate">{review.title}</h4>
                  <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {premiumReviews.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400">
                No premium reviews added yet.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reviews..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D91976]"
              />
            </div>
            <div className="text-sm text-gray-500">
              Total: {reviews.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Comment</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUserReviews.map(review => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-800 block max-w-[200px] truncate">{review.productId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{review.userName}</div>
                      <div className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gray-900">{review.rating}</span>
                        <Star size={12} className="text-yellow-400 fill-current" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{review.comment}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteUserReview(review.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUserReviews.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No reviews found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};