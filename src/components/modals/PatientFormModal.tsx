import React, { useState } from 'react';
import { X, Users, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Patient } from '../../types';
import { generateRMNumber } from '../../utils/formatters';

interface PatientFormModalProps {
  initialData?: Patient;
  onClose: () => void;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({ initialData, onClose }) => {
  const { patients, addPatient, updatePatient } = useApp();

  const [name, setName] = useState(initialData?.name || '');
  const [nik, setNik] = useState(initialData?.nik || '');
  const [gender, setGender] = useState<'Perempuan' | 'Laki-laki'>(initialData?.gender || 'Perempuan');
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '1998-05-15');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [allergies, setAllergies] = useState(initialData?.allergies || 'Tidak ada');
  const [specialNotes, setSpecialNotes] = useState(initialData?.specialNotes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Nama dan nomor telepon wajib diisi.');
      return;
    }

    if (initialData) {
      updatePatient(initialData.id, {
        name,
        nik,
        gender,
        birthDate,
        phone,
        email,
        address,
        allergies,
        specialNotes
      });
      alert('Data pasien berhasil diperbarui.');
    } else {
      const rm = generateRMNumber(patients);
      addPatient({
        rmNumber: rm,
        nik: nik || '327301' + Math.floor(1000000000 + Math.random() * 9000000000),
        name,
        gender,
        birthDate,
        phone,
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        address,
        allergies,
        specialNotes
      });
      alert('Pasien baru berhasil didaftarkan.');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-100 bg-rose-50/50 px-6 py-4">
          <h3 className="font-bold text-stone-900 text-sm">
            {initialData ? 'Edit Data Pasien' : 'Tambah Pasien Baru'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nama Pasien *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nomor Telepon / WA *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">NIK (KTP)</label>
              <input
                type="text"
                value={nik}
                onChange={e => setNik(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Jenis Kelamin</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              >
                <option value="Perempuan">Perempuan</option>
                <option value="Laki-laki">Laki-laki</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">Alamat Tinggal</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">Riwayat Alergi</label>
              <input
                type="text"
                value={allergies}
                onChange={e => setAllergies(e.target.value)}
                placeholder="Contoh: Alergi benzoyl peroxide, seafood..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">Catatan Khusus</label>
              <textarea
                rows={2}
                value={specialNotes}
                onChange={e => setSpecialNotes(e.target.value)}
                placeholder="Kondisi kulit sensitif, preferensi ruangan, dll..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
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
              Simpan Data Pasien
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
