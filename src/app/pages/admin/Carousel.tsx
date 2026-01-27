import { ImageUploader } from '@/app/components/ImageUploader';
import React, { useState } from 'react';
import { useStore, CarouselSlide } from '@/app/context/StoreContext';
import { Plus, Trash2, Eye, EyeOff, Image as ImageIcon, Link as LinkIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

export const AdminCarousel = () => {
  const { carouselSlides, addCarouselSlide, updateCarouselSlide, deleteCarouselSlide, toggleCarouselSlide } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [formData, setFormData] = useState({
    image: '',
    link: '',
    isActive: true,
    order: carouselSlides.length + 1
  });



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image || !formData.link) {
      toast.error('Please provide both image and link');
      return;
    }

    if (editingSlide) {
      updateCarouselSlide({
        ...editingSlide,
        image: formData.image,
        link: formData.link,
        isActive: formData.isActive,
        order: formData.order
      });
      setEditingSlide(null);
    } else {
      addCarouselSlide(formData);
    }

    setShowAddModal(false);
    setFormData({
      image: '',
      link: '',
      isActive: true,
      order: carouselSlides.length + 1
    });
  };

  const handleEdit = (slide: CarouselSlide) => {
    setEditingSlide(slide);
    setFormData({
      image: slide.image,
      link: slide.link,
      isActive: slide.isActive,
      order: slide.order
    });
    setShowAddModal(true);
  };

  const handleDelete = (slideId: string) => {
    if (confirm('Are you sure you want to delete this carousel slide?')) {
      deleteCarouselSlide(slideId);
    }
  };

  const handleMoveUp = (slide: CarouselSlide) => {
    const currentIndex = carouselSlides.findIndex(s => s.id === slide.id);
    if (currentIndex > 0) {
      const prevSlide = carouselSlides[currentIndex - 1];
      updateCarouselSlide({ ...slide, order: prevSlide.order });
      updateCarouselSlide({ ...prevSlide, order: slide.order });
    }
  };

  const handleMoveDown = (slide: CarouselSlide) => {
    const currentIndex = carouselSlides.findIndex(s => s.id === slide.id);
    if (currentIndex < carouselSlides.length - 1) {
      const nextSlide = carouselSlides[currentIndex + 1];
      updateCarouselSlide({ ...slide, order: nextSlide.order });
      updateCarouselSlide({ ...nextSlide, order: slide.order });
    }
  };

  const sortedSlides = [...carouselSlides].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">ক্যারোসেল ম্যানেজমেন্ট</h1>
          <p className="text-sm text-gray-500">Carousel Management</p>
        </div>
        <button
          onClick={() => {
            setEditingSlide(null);
            setFormData({
              image: '',
              link: '',
              isActive: true,
              order: carouselSlides.length + 1
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#D91976] text-white rounded-lg hover:bg-[#A8145A] transition"
        >
          <Plus size={20} />
          Add Carousel Slide
        </button>
      </div>

      {sortedSlides.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No carousel slides found. Add your first slide!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSlides.map((slide, index) => (
            <div key={slide.id} className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-gray-100 hover:border-[#D91976] transition">
              <div className="relative aspect-video bg-gray-100">
                <img src={slide.image} alt="Carousel" className="w-full h-full object-cover" />
                {!slide.isActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">Inactive</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold text-gray-700">
                  Order: {slide.order}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <LinkIcon size={14} />
                  <span className="truncate">{slide.link}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMoveUp(slide)}
                    disabled={index === 0}
                    className="p-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => handleMoveDown(slide)}
                    disabled={index === sortedSlides.length - 1}
                    className="p-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => toggleCarouselSlide(slide.id)}
                    className={`flex-1 p-2 rounded flex items-center justify-center gap-2 ${slide.isActive ? 'bg-pink-50 text-pink-600 hover:bg-pink-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                    title={slide.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {slide.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleEdit(slide)}
                    className="flex-1 p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold">{editingSlide ? 'Edit' : 'Add'} Carousel Slide</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              <div>
                <label className="block text-sm font-medium mb-2">Carousel Image *</label>
                <ImageUploader
                  label="Upload Slide Image"
                  aspectRatio={16 / 9}
                  initialImage={formData.image}
                  onImageCropped={(base64) => setFormData(prev => ({ ...prev, image: base64 }))}
                />
                <p className="text-xs text-gray-500 mt-1">Recommended size: 1920x1080px (16:9 ratio)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Link URL *</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={e => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="/shop?cat=Women or https://example.com"
                  className="w-full p-3 border rounded-lg"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter internal path (e.g. /shop) or external URL</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={e => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                  min="1"
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium">Active (Show on homepage)</label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#D91976] text-white rounded-lg hover:bg-[#A8145A]"
                >
                  {editingSlide ? 'Update' : 'Add'} Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};