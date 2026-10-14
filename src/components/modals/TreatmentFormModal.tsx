import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Treatment } from '../../types';

interface TreatmentFormModalProps {
  initialData?: Treatment;
  onClose: () => void;
}

export const TreatmentFormModal: React.FC<TreatmentFormModalProps> = ({ initialData, onClose }) => {
  const { treatments, addTreatment, updateTreatment } = useApp();

  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<Treatment['category']>(initialData?.category || 'Facial');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState<number>(initialData?.price || 250000);
  const [durationMinutes, setDurationMinutes] = useState<number>(initialData?.durationMinutes || 60);
  const [handledBy, setHandledBy] = useState<Treatment['handledBy']>(initialData?.handledBy || 'Dokter & Perawat');
  const [isActive, setIsActive] = useState<boolean>(initialData ? initialData.isActive : true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0) {
      alert('Mohon isi nama treatment dan tarif harga yang valid.');
      return;
    }

    if (initialData) {
      updateTreatment(initialData.id, {
        name,
        category,
        description,
        price,
        durationMinutes,
        handledBy,
        isActive
      });
      alert('Data treatment berhasil diperbarui.');
    } else {
      const code = `TRT-${String(treatments.length + 1).padStart(3, '0')}`;
      addTreatment({
        code,
        name,
        category,
        description,
        price,
        durationMinutes,
        handledBy,
        isActive
      });
      alert('Treatment baru berhasil ditambahkan.');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-100 bg-rose-50/50 px-6 py-4">
          <h3 className="font-bold text-stone-900 text-sm">
            {initialData ? 'Edit Layanan Treatment' : 'Tambah Layanan Treatment Baru'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Nama Treatment *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Hydrafacial Deep Infusion"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Kategori Treatment</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              >
                <option value="Facial">Facial</option>
                <option value="Acne">Acne</option>
                <option value="Hydra">Hydra</option>
                <option value="Laser">Laser</option>
                <option value="Peeling">Peeling</option>
                <option value="Rejuvenation">Rejuvenation</option>
                <option value="Hair">Hair</option>
                <option value="Body">Body</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Tenaga Pelaksana</label>
              <select
                value={handledBy}
                onChange={e => setHandledBy(e.target.value as any)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              >
                <option value="Dokter">Dokter</option>
                <option value="Perawat">Perawat</option>
                <option value="Dokter & Perawat">Dokter & Perawat</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Tarif Harga (Rupiah) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                placeholder="150000"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 font-mono font-bold focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Estimasi Durasi (Menit)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                placeholder="60"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Deskripsi Manfaat & Tahapan Prosedur</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Jelaskan tahapan eksfoliasi, serum, atau efek terapi..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="rounded border-stone-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
              />
              <span className="font-semibold text-stone-700">Treatment Aktif di Menu Pelayanan</span>
            </label>
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
              Simpan Treatment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
