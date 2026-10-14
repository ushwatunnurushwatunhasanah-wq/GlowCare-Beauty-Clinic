import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  Check,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Building,
  KeyRound,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User as UserType, UserRole } from '../../types';

interface UserFormModalProps {
  initialData?: UserType | null;
  onClose: () => void;
}

const USER_AVATAR_PRESETS = [
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
    label: 'Dokter Spesialis Lab',
    url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=256'
  },
  {
    label: 'Admin Wanita',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256'
  },
  {
    label: 'Front Office / Kasir',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256'
  }
];

export const UserFormModal: React.FC<UserFormModalProps> = ({ initialData, onClose }) => {
  const { addUser, updateUser } = useApp();
  const isEdit = Boolean(initialData);

  const [name, setName] = useState(initialData?.name || '');
  const [role, setRole] = useState<UserRole>(initialData?.role || 'dokter');
  const [department, setDepartment] = useState(
    initialData?.department || (initialData?.role === 'dokter' ? 'Dermatologi & Estetika' : 'Manajemen Operasional')
  );
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '0812-');
  const [status, setStatus] = useState<'active' | 'inactive'>(initialData?.status || 'active');
  const [password, setPassword] = useState('glowcare123');
  const [avatar, setAvatar] = useState(
    initialData?.avatar || USER_AVATAR_PRESETS[0].url
  );
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (!department || department === 'Manajemen Operasional' || department === 'Dermatologi & Estetika' || department === 'Front Office & Pendaftaran') {
      if (newRole === 'admin') setDepartment('Manajemen Operasional');
      else if (newRole === 'dokter') setDepartment('Dermatologi & Estetika');
      else if (newRole === 'loket') setDepartment('Front Office & Pendaftaran');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (isEdit && initialData) {
      updateUser(initialData.id, {
        name: name.trim(),
        role,
        department: department.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatar,
        status
      });
    } else {
      addUser({
        name: name.trim(),
        role,
        department: department.trim() || (role === 'dokter' ? 'Dermatologi & Estetika' : 'Front Office & Pendaftaran'),
        email: email.trim(),
        phone: phone.trim(),
        avatar,
        status
      });
    }

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 750);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-gradient-to-r from-rose-50 to-pink-50/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                {isEdit ? 'Edit Data Pengguna Sistem' : 'Tambah Pengguna Sistem (RBAC)'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {isEdit
                  ? 'Perbarui hak akses dan profil akun staf / dokter'
                  : 'Daftarkan akun staf baru untuk hak akses Admin, Dokter, atau Loket'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-stone-400 hover:bg-white hover:text-stone-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-base font-bold text-stone-900">
              {isEdit ? 'Data Pengguna Berhasil Diperbarui!' : 'Pengguna Baru Berhasil Ditambahkan!'}
            </h4>
            <p className="text-xs text-stone-500">
              Akun {name} telah tersimpan dan siap digunakan untuk masuk sistem.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
            {/* Foto Profil / Avatar Selector */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
              <div className="relative group">
                <img
                  src={avatar}
                  alt="Avatar Preview"
                  className="h-20 w-20 rounded-2xl object-cover border-2 border-white shadow-md bg-stone-100"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-semibold"
                >
                  <Camera className="h-5 w-5 mb-0.5" />
                  <span>Ubah</span>
                </button>
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                <div>
                  <span className="font-bold text-stone-800 text-xs block">Foto Profil Pengguna</span>
                  <span className="text-[11px] text-stone-500">
                    Gunakan foto staf resmi atau pilih preset yang tersedia
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-[11px] font-semibold shadow-2xs transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5 text-rose-600" />
                    <span>Upload Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-[11px] font-semibold shadow-2xs transition-colors"
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
                    <span>Link URL</span>
                  </button>
                </div>

                {/* Preset Avatars */}
                <div className="pt-1">
                  <span className="text-[10px] text-stone-400 block mb-1">Preset Cepat:</span>
                  <div className="flex items-center gap-1.5 justify-center sm:justify-start overflow-x-auto pb-1">
                    {USER_AVATAR_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(p.url)}
                        title={p.label}
                        className={`h-7 w-7 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                          avatar === p.url ? 'border-rose-600 scale-105 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={p.url} alt={p.label} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {showUrlInput && (
                  <div className="pt-1">
                    <input
                      type="url"
                      value={avatar}
                      onChange={e => setAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] text-stone-800 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                Nama Lengkap & Gelar <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Contoh: dr. Citra Lestari, Sp.KK, M.Biomed"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Peran / Hak Akses (RBAC) */}
            <div>
              <label className="block font-bold text-stone-800 mb-1.5">
                Hak Akses & Peran (Role RBAC) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'dokter',
                    label: 'Dokter',
                    badge: 'bg-rose-100 text-rose-800 border-rose-200',
                    desc: 'Konsultasi & Resep Medis'
                  },
                  {
                    id: 'admin',
                    label: 'Admin',
                    badge: 'bg-purple-100 text-purple-800 border-purple-200',
                    desc: 'Manajer & Akses Penuh'
                  },
                  {
                    id: 'loket',
                    label: 'Loket / Kasir',
                    badge: 'bg-amber-100 text-amber-800 border-amber-200',
                    desc: 'Pendaftaran & Kasir'
                  }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleRoleChange(item.id as UserRole)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      role === item.id
                        ? 'border-rose-600 bg-rose-50/80 shadow-xs ring-1 ring-rose-500/20'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider mb-1 ${item.badge}`}
                    >
                      {item.label}
                    </span>
                    <span className="text-[10px] text-stone-500 leading-tight">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Departemen / Spesialisasi */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Departemen / Spesialisasi / Jabatan
              </label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="Contoh: Dermatologi & Estetika / Anti-Aging & Laser"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Email & Telepon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Email Akun (Login) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama@glowcare.test"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 font-mono focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 font-mono focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Password Awal (Hanya untuk buat user baru) */}
            {!isEdit && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-stone-700">
                    Kata Sandi Awal (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassword(`GlowCare@${Math.floor(1000 + Math.random() * 9000)}`)}
                    className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    Acak Sandi
                  </button>
                </div>
                <input
                  type="text"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 font-mono focus:border-rose-500 focus:bg-white focus:outline-none"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Password disimpan dengan enkripsi dan dapat diatur ulang sewaktu-waktu.
                </span>
              </div>
            )}

            {/* Status Akun Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/50 p-3">
              <div>
                <span className="font-semibold text-stone-800 block text-xs">Status Akun Pengguna</span>
                <span className="text-[10px] text-stone-500">
                  {status === 'active' ? 'Akun aktif dan diizinkan masuk sistem' : 'Akun dinonaktifkan sementara'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={status === 'active'}
                  onChange={e => setStatus(e.target.checked ? 'active' : 'inactive')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-colors"
              >
                <Check className="h-4 w-4" />
                <span>{isEdit ? 'Simpan Perubahan' : 'Tambahkan Pengguna'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
