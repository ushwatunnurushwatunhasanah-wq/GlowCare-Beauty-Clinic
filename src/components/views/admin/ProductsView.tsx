import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Tag,
  AlertTriangle,
  Edit2,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { formatRupiah } from '../../../utils/formatters';

export const ProductsView: React.FC = () => {
  const { products, deleteProduct, openModal } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk ${name}?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">
            Inventaris Produk Skincare Klinik
          </h2>
          <p className="text-xs text-stone-500">
            Katalog stok produk perawatan kulit harian, serum pencerah, sunscreen, dan krim racikan resep dokter
          </p>
        </div>

        <button
          onClick={() => openModal('product-form')}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
        <div className="relative max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari produk berdasarkan nama, kode, atau kategori..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(p => (
          <div
            key={p.id}
            className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-rose-200 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-100">
                  {p.category}
                </span>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    p.stock <= 10
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  Stok: {p.stock} {p.unit}
                </span>
              </div>

              <div className="mt-3">
                <span className="text-[10px] font-mono text-stone-400">{p.code}</span>
                <h3 className="font-bold text-stone-900 text-sm mt-0.5 leading-snug">{p.name}</h3>
                <p className="mt-2 text-xs text-stone-600 leading-relaxed line-clamp-2">
                  {p.description}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-400 block uppercase font-semibold">Harga Jual</span>
                <span className="text-base font-bold text-stone-900 font-mono">
                  {formatRupiah(p.price)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openModal('product-form', p)}
                  className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-rose-600 hover:bg-stone-50"
                  title="Edit Produk"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-red-600 hover:bg-red-50"
                  title="Hapus Produk"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
