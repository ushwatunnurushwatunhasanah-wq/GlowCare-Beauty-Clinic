import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Image, RefreshCw, Link as LinkIcon, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Doctor } from '../../types';

interface DoctorFormModalProps {
  initialData?: Doctor;
  onClose: () => void;
}

const DOCTOR_AVATAR_PRESETS = [
  {
    label: 'Dokter Wanita 1',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256'
  },
  {
    label: 'Dokter Wanita 2',
    url: 'https://images.unsplash.com/photo-1594824813689-53e3fa299be1?auto=format&fit=crop&q=80&w=256'
  },
  {
    label: 'Dokter Pria 1',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256'
  },
  {
    label: 'Dokter Pria 2',
    url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=256'
  },
  {
    label: 'Dokter Spesialis 3',
    url: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=256'
  }
];

export const DoctorFormModal: React.FC<DoctorFormModalProps> = ({ initialData, onClose }) => {
  const { addDoctor, updateDoctor } = useApp();

  const [name, setName] = useState(initialData?.name || '');
  const [specialization, setSpecialization] = useState(initialData?.specialization || 'Spesialis Dermatologi & Venereologi');
  const [sipNumber, setSipNumber] = useState(initialData?.sipNumber || 'SIP.446.1/120/Dinkes/2026');
  const [phone, setPhone] = useState(initialData?.phone || '0812-');
  const [email, setEmail] = useState(initialData?.email || '');
  const [avatar, setAvatar] = useState(
    initialData?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256'
  );
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [scheduleDays, setScheduleDays] = useState(initialData?.schedule.days.join(', ') || 'Senin, Rabu, Jumat');
  const [scheduleHours, setScheduleHours] = useState(initialData?.schedule.hours || '09:00 - 16:00');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file foto maksimal 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const daysArray = scheduleDays.split(',').map(s => s.trim()).filter(Boolean);

    if (initialData) {
      updateDoctor(initialData.id, {
        name,
        specialization,
        sipNumber,
        phone,
        email,
        avatar,
        schedule: { days: daysArray, hours: scheduleHours }
      });
      alert('Data dokter dan foto profil berhasil diperbarui.');
    } else {
      addDoctor({
        name,
        specialization,
        sipNumber,
        phone,
        email: email || `${name.toLowerCase().replace(/[^a-z]/g, '')}@glowcare.test`,
        avatar,
        rating: 4.9,
        schedule: { days: daysArray, hours: scheduleHours },
        isActive: true
      });
      alert('Dokter baru berhasil ditambahkan.');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-100 bg-rose-50/50 px-6 py-4">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">
              {initialData ? 'Edit Data & Foto Profil Dokter' : 'Tambah Dokter Spesialis Baru'}
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Lengkapi biodata, jadwal praktik, serta foto profil dokter klinik
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Foto Profil Section */}
          <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4">
            <label className="block font-bold text-stone-900 mb-2">Foto Profil Dokter</label>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Avatar Preview */}
              <div className="relative group shrink-0">
                <img
                  src={avatar}
                  alt={name || 'Preview Dokter'}
                  onError={(e) => {
                    // Fallback to default placeholder if image link is broken
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256';
                  }}
                  className="h-24 w-24 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-rose-200"
                />
                <button
                  type="button"
                  onClick={handleTriggerFileInput}
                  title="Klik untuk ganti foto"
                  className="absolute inset-0 bg-stone-900/40 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-[10px] font-medium"
                >
                  <Camera className="h-5 w-5 mb-0.5" />
                  <span>Ubah Foto</span>
                </button>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={handleTriggerFileInput}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-semibold shadow-xs hover:bg-rose-700 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Foto Baru</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-700 font-medium hover:bg-stone-50 transition-colors"
                  >
                    <LinkIcon className="h-3.5 w-3.5 text-stone-400" />
                    <span>{showUrlInput ? 'Sembunyikan URL' : 'Gunakan URL Foto'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvatar('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-colors"
                    title="Kembalikan ke foto standar"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                </div>

                <p className="text-[11px] text-stone-500">
                  Format: JPG, PNG, atau WebP. Maks 5 MB. Foto akan tampil di kartu jadwal, antrian, dan rekam medis pasien.
                </p>

                {showUrlInput && (
                  <div className="pt-2">
                    <input
                      type="url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://contoh-url-foto.com/dokter.jpg"
                      className="w-full rounded-xl border border-stone-200 bg-white p-2 text-stone-900 focus:border-rose-500 focus:outline-none font-mono text-[11px]"
                    />
                  </div>
                )}

                {/* Avatar Quick Presets */}
                <div className="pt-1.5">
                  <span className="text-[10px] font-semibold text-stone-600 block mb-1">Pilihan Cepat Foto Dokter:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {DOCTOR_AVATAR_PRESETS.map((preset, index) => {
                      const isSelected = avatar === preset.url;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setAvatar(preset.url)}
                          className={`relative rounded-lg overflow-hidden border-2 transition-all p-0.5 ${
                            isSelected ? 'border-rose-600 scale-105 shadow-xs' : 'border-stone-200 hover:border-rose-300'
                          }`}
                          title={preset.label}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="h-7 w-7 rounded object-cover"
                          />
                          {isSelected && (
                            <span className="absolute inset-0 bg-rose-600/30 flex items-center justify-center">
                              <Check className="h-3 w-3 text-white stroke-[3]" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Nama Lengkap & Gelar Dokter *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="dr. Contoh Nama, Sp.DV"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Spesialisasi & Bidang Keahlian</label>
            <input
              type="text"
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nomor SIP Resmi</label>
              <input
                type="text"
                value={sipNumber}
                onChange={e => setSipNumber(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 font-mono focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nomor Telepon</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 font-mono focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Email Akun Login Dokter *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="dr.nama@glowcare.test"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 font-mono focus:border-rose-500 focus:bg-white focus:outline-none"
            />
            <p className="text-[10px] text-stone-500 mt-1">
              Email ini digunakan dokter untuk login mandiri ke portal medis (Password awal: <code className="font-mono text-rose-700">password</code>).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Hari Praktik (Pisahkan Koma)</label>
              <input
                type="text"
                value={scheduleDays}
                onChange={e => setScheduleDays(e.target.value)}
                placeholder="Senin, Selasa, Kamis"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Jam Praktik</label>
              <input
                type="text"
                value={scheduleHours}
                onChange={e => setScheduleHours(e.target.value)}
                placeholder="09:00 - 16:00"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 font-mono focus:border-rose-500 focus:bg-white focus:outline-none"
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
              Simpan Data & Foto Dokter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
