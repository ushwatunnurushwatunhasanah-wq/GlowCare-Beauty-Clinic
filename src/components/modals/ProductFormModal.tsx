import React, { useState } from 'react';
import { X, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

interface ProductFormModalProps {
  initialData?: Product;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ initialData, onClose }) => {
  const { products, addProduct, updateProduct } = useApp();

  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<Product['category']>(initialData?.category || 'Serum');
  const [price, setPrice] = useState<number>(initialData?.price || 150000);
  const [stock, setStock] = useState<number>(initialData?.stock || 50);
  const [unit, setUnit] = useState(initialData?.unit || 'Botol 30ml');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0) return;

    if (initialData) {
      updateProduct(initialData.id, {
        name,
        category,
        price,
        stock,
        unit,
        description
      });
      alert('Data produk berhasil diperbarui.');
    } else {
      const code = `SKN-${category.substring(0, 3).toUpperCase()}-${String(products.length + 1).padStart(2, '0')}`;
      addProduct({
        code,
        name,
        category,
        price,
        stock,
        unit,
        description,
        isActive: true
      });
      alert('Produk baru berhasil ditambahkan.');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-100 bg-rose-50/50 px-6 py-4">
          <h3 className="font-bold text-stone-900 text-sm">
            {initialData ? 'Edit Produk Skincare' : 'Tambah Produk Skincare Baru'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Nama Produk *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="GlowCare Barrier Repair Cream"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Kategori Produk</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              >
                <option value="Serum">Serum</option>
                <option value="Cleanser">Cleanser</option>
                <option value="Sunscreen">Sunscreen</option>
                <option value="Toner">Toner</option>
                <option value="Cream">Cream</option>
                <option value="Mask">Mask</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Satuan Kemasan</label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="Tube 50gr / Botol 30ml"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Harga Jual (Rp) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 font-mono font-bold focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Jumlah Stok</label>
              <input
                type="number"
                value={stock}
                onChange={e => setStock(Number(e.target.value))}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 font-mono focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Deskripsi & Kandungan Utama</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Kandungan Ceramide, Niacinamide, atau Hyaluron..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200 px-4 py-2 font-semibold text-stone-600 hover:bg-stone-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-rose-600 px-5 py-2 font-semibold text-white hover:bg-rose-700 shadow-sm"
            >
              Simpan Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
