import React, { useState } from 'react';
import { X, HeartPulse } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Nurse } from '../../types';

interface NurseFormModalProps {
  initialData?: Nurse;
  onClose: () => void;
}

export const NurseFormModal: React.FC<NurseFormModalProps> = ({ initialData, onClose }) => {
  const { doctors, addNurse, updateNurse } = useApp();

  const [name, setName] = useState(initialData?.name || '');
  const [strNumber, setStrNumber] = useState(initialData?.strNumber || 'STR-K.14.09.9922');
  const [phone, setPhone] = useState(initialData?.phone || '0812-');
  const [shift, setShift] = useState<Nurse['shift']>(initialData?.shift || 'Pagi (08:00 - 15:00)');
  const [assignedDoctor, setAssignedDoctor] = useState(initialData?.assignedDoctor || doctors[0]?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (initialData) {
      updateNurse(initialData.id, {
        name,
        strNumber,
        phone,
        shift,
        assignedDoctor
      });
      alert('Data perawat berhasil diperbarui.');
    } else {
      addNurse({
        name,
        strNumber,
        phone,
        shift,
        assignedDoctor,
        isActive: true
      });
      alert('Perawat baru berhasil ditambahkan.');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-100 bg-rose-50/50 px-6 py-4">
          <h3 className="font-bold text-stone-900 text-sm">
            {initialData ? 'Edit Data Perawat' : 'Tambah Tenaga Perawat Baru'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Nama Lengkap & Gelar *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ns. Nama Perawat, S.Kep"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nomor STR</label>
              <input
                type="text"
                value={strNumber}
                onChange={e => setStrNumber(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 font-mono focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Kontak Telepon</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 font-mono focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Shift Kerja</label>
              <select
                value={shift}
                onChange={e => setShift(e.target.value as any)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              >
                <option value="Pagi (08:00 - 15:00)">Pagi (08:00 - 15:00)</option>
                <option value="Sore (14:00 - 21:00)">Sore (14:00 - 21:00)</option>
                <option value="Full Day">Full Day</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Dokter Pendamping</label>
              <select
                value={assignedDoctor}
                onChange={e => setAssignedDoctor(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
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
              Simpan Data Perawat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
