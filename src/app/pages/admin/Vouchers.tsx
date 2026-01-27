import React, { useState } from 'react';
import { useStore } from '@/app/context/StoreContext';
import { Plus, Edit2, Trash2, Tag, Calendar, TrendingUp, Users, X } from 'lucide-react';
import type { Voucher } from '@/app/context/StoreContext';

export const AdminVouchers = () => {
  const { vouchers, addVoucher, updateVoucher, deleteVoucher } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount: 0,
    description_bn: '',
    description_en: '',
    minPurchase: 0,
    maxDiscount: 0,
    validUntil: '',
    isActive: true,
    usageLimit: undefined as number | undefined,
  });

  const handleOpenModal = (voucher?: Voucher) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setFormData({
        code: voucher.code,
        discount: voucher.discount,
        description_bn: voucher.description_bn,
        description_en: voucher.description_en,
        minPurchase: voucher.minPurchase,
        maxDiscount: voucher.maxDiscount,
        validUntil: voucher.validUntil.split('T')[0],
        isActive: voucher.isActive,
        usageLimit: voucher.usageLimit,
      });
    } else {
      setEditingVoucher(null);
      setFormData({
        code: '',
        discount: 0,
        description_bn: '',
        description_en: '',
        minPurchase: 0,
        maxDiscount: 0,
        validUntil: '',
        isActive: true,
        usageLimit: undefined,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVoucher(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const voucherData = {
      ...formData,
      validUntil: new Date(formData.validUntil).toISOString(),
    };

    if (editingVoucher) {
      updateVoucher({ ...editingVoucher, ...voucherData });
    } else {
      addVoucher(voucherData);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this voucher?')) {
      deleteVoucher(id);
    }
  };

  const activeVouchers = vouchers.filter(v => v.isActive);
  const inactiveVouchers = vouchers.filter(v => !v.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Voucher Management</h1>
          <p className="text-gray-500 mt-1">Create and manage discount vouchers</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#D91976] text-white px-6 py-3 rounded-lg hover:bg-[#A8145A] transition shadow-md w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          Add Voucher
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Vouchers</p>
              <p className="text-2xl font-bold text-gray-900">{vouchers.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Tag className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Vouchers</p>
              <p className="text-2xl font-bold text-pink-600">{activeVouchers.length}</p>
            </div>
            <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-pink-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Inactive Vouchers</p>
              <p className="text-2xl font-bold text-gray-600">{inactiveVouchers.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
              <Calendar className="text-gray-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Uses</p>
              <p className="text-2xl font-bold text-purple-600">
                {vouchers.reduce((sum, v) => sum + v.usedCount, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Min Purchase</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Max Discount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valid Until</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <Tag className="mx-auto mb-2 text-gray-300" size={48} />
                    <p>No vouchers created yet</p>
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => {
                  const isExpired = new Date(voucher.validUntil) < new Date();
                  const isLimitReached = voucher.usageLimit && voucher.usedCount >= voucher.usageLimit;

                  return (
                    <tr key={voucher.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-[#D91976] text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                            <Tag size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{voucher.code}</p>
                            <p className="text-xs text-gray-500 line-clamp-1 max-w-[150px]">{voucher.description_en}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-pink-100 text-pink-800">
                          {voucher.discount}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap">৳{voucher.minPurchase?.toLocaleString() ?? 0}</td>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap">৳{voucher.maxDiscount?.toLocaleString() ?? 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <p className="text-gray-700">{new Date(voucher.validUntil).toLocaleDateString()}</p>
                          {isExpired && (
                            <p className="text-xs text-red-600 font-medium">Expired</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <p className="text-gray-700">
                            {voucher.usedCount}
                            {voucher.usageLimit && ` / ${voucher.usageLimit}`}
                          </p>
                          {isLimitReached && (
                            <p className="text-xs text-orange-600 font-medium">Limit reached</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${voucher.isActive && !isExpired && !isLimitReached
                          ? 'bg-pink-100 text-pink-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {voucher.isActive && !isExpired && !isLimitReached ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(voucher)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(voucher.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingVoucher ? 'Edit Voucher' : 'Create New Voucher'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Voucher Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Voucher Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., SUMMER2026"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent uppercase"
                  />
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount Percentage *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                  />
                </div>

                {/* Min Purchase */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Purchase (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                  />
                </div>

                {/* Max Discount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Maximum Discount (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 500"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                  />
                </div>

                {/* Valid Until */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valid Until *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                  />
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Usage Limit (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit || ''}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Leave empty for unlimited"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description Bangla */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Bangla) *
                </label>
                <textarea
                  required
                  value={formData.description_bn}
                  onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })}
                  placeholder="বাংলায় বর্ণনা লিখুন"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                />
              </div>

              {/* Description English */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (English) *
                </label>
                <textarea
                  required
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Enter description in English"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91976] focus:border-transparent"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-[#D91976] border-gray-300 rounded focus:ring-[#D91976]"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                  Active (voucher can be used immediately)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#D91976] text-white rounded-lg hover:bg-[#A8145A] transition font-semibold shadow-md"
                >
                  {editingVoucher ? 'Update Voucher' : 'Create Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
