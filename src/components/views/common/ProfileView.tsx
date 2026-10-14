import React, { useState, useRef } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  KeyRound,
  CheckCircle2,
  Save,
  Eye,
  EyeOff,
  Building,
  Calendar,
  Clock,
  LogOut,
  Sparkles,
  Camera,
  Activity,
  Check,
  AlertCircle,
  Copy,
  Lock,
  UserCheck,
  Upload,
  Trash2,
  X,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { formatDateId, formatDateTimeId } from '../../../utils/formatters';

interface ProfileViewProps {
  onNavigate?: (menu: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate }) => {
  const { currentUser, updateUser, resetUserPassword, activityLogs, logout } = useApp();
  const role = currentUser?.role || 'admin';

  const [activeTab, setActiveTab] = useState<'profil' | 'keamanan' | 'aktivitas'>('profil');

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  // Avatar Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(currentUser?.avatar || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState<string | null>(null);

  // General Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Preset Avatars
  const avatarPresets = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1594824813593-9031c3c97ea0?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
  ];

  // Compress & resize image to lightweight Data URL
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 360;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle local image file upload from device
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('File yang dipilih harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }

    try {
      setIsUploading(true);
      const compressedDataUrl = await compressImage(file);
      setTempAvatar(compressedDataUrl);
      showToast('Foto berhasil dimuat dari perangkat! Klik "Terapkan & Simpan Foto" untuk menyimpan.');
    } catch (err) {
      console.error('Gagal memproses gambar:', err);
      showToast('Gagal memproses foto. Silakan coba gambar lainnya.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Open modal and sync tempAvatar
  const handleOpenAvatarModal = () => {
    setTempAvatar(avatar || currentUser?.avatar || '');
    setIsAvatarModalOpen(true);
  };

  // Apply and save avatar directly
  const handleSaveAvatar = () => {
    if (!currentUser) return;
    setAvatar(tempAvatar);
    updateUser(currentUser.id, {
      avatar: tempAvatar
    });
    setIsAvatarModalOpen(false);
    showToast('Foto profil akun Anda berhasil diperbarui dan disimpan!');
  };

  // Save Profile Changes from Tab 1
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!name.trim()) {
      showToast('Nama lengkap tidak boleh kosong');
      return;
    }

    updateUser(currentUser.id, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department: department.trim(),
      avatar: avatar.trim()
    });

    showToast('Profil akun Anda berhasil diperbarui dan tersimpan!');
  };

  // Save Password Change
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentUser) return;

    if (!newPassword) {
      setPasswordError('Silakan ketikkan kata sandi baru');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Kata sandi minimal harus 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }

    resetUserPassword(currentUser.id, newPassword);
    setPasswordSaved(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    showToast('Kata sandi akun Anda berhasil diperbarui!');
  };

  // Filter logs for this user
  const userLogs = activityLogs
    .filter(
      l =>
        l.userName.toLowerCase() === (currentUser?.name || '').toLowerCase() ||
        l.userRole === currentUser?.role
    )
    .slice(0, 10);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            &times;
          </button>
        </div>
      )}

      {/* Hidden File Input for direct device upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Profile Header Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-800 via-rose-700 to-pink-700 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Avatar Display with live edit trigger */}
            <div className="relative group cursor-pointer" onClick={handleOpenAvatarModal}>
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-20 w-20 rounded-2xl object-cover border-2 border-white/60 shadow-md group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-2xl font-bold text-white shadow-md group-hover:bg-white/30 transition-colors">
                  {currentUser?.name?.substring(0, 2).toUpperCase() || 'AD'}
                </div>
              )}

              {/* Hover overlay hint */}
              <div className="absolute inset-0 rounded-2xl bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-semibold">
                <span>Ubah Foto</span>
              </div>

              {/* Camera Button with active click handler */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenAvatarModal();
                }}
                className="absolute -bottom-1 -right-1 rounded-full bg-white p-2 text-rose-700 shadow-lg hover:bg-rose-50 hover:scale-110 active:scale-95 transition-all cursor-pointer border border-rose-100"
                title="Klik untuk Mengganti Foto Profil"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">{currentUser?.name}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-200 border border-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Akun Aktif</span>
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                {currentUser?.department || 'Manajemen Operasional & Eksekutif'}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-white/80">
                <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/15">
                  <Shield className="h-3 w-3 text-rose-200" />
                  <span className="font-semibold uppercase tracking-wider">{role}</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/15">
                  <Mail className="h-3 w-3 text-rose-200" />
                  <span>{currentUser?.email}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {role === 'admin' && onNavigate && (
              <button
                onClick={() => onNavigate('pengaturan')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-2 text-xs font-semibold text-white border border-white/20 transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Pengaturan Klinik</span>
              </button>
            )}

            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white text-rose-700 hover:bg-rose-50 px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-stone-200 pb-1">
        {[
          { key: 'profil', label: 'Data Diri & Profil', icon: UserIcon },
          { key: 'keamanan', label: 'Keamanan & Kata Sandi', icon: KeyRound },
          { key: 'aktivitas', label: 'Riwayat Aktivitas Sesi', icon: Activity }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-rose-600 text-rose-600 font-bold bg-rose-50/50 rounded-t-xl'
                  : 'border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DATA DIRI & PROFIL */}
      {activeTab === 'profil' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-rose-600" />
                <span>Informasi Pribadi & Kontak Pengguna</span>
              </h3>
              <button
                type="button"
                onClick={handleOpenAvatarModal}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/70 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Ganti Foto Profil</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Alamat Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nomor Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Departemen / Divisi</label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="Contoh: Manajemen Operasional"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-stone-700">Foto Profil (Avatar)</label>
                  <button
                    type="button"
                    onClick={handleOpenAvatarModal}
                    className="text-xs text-rose-600 font-semibold hover:underline"
                  >
                    Buka Pemilih Foto Lengkap & Upload
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={avatar}
                    onChange={e => setAvatar(e.target.value)}
                    placeholder="URL gambar atau klik tombol kamera di atas..."
                    className="flex-1 rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  <button
                    type="button"
                    onClick={handleOpenAvatarModal}
                    className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer shrink-0"
                  >
                    <ImageIcon className="h-4 w-4 text-stone-500" />
                    <span>Pilih / Upload</span>
                  </button>
                </div>

                {/* Preset Avatar Picker */}
                <div className="mt-3">
                  <span className="text-[11px] text-stone-500 block mb-2 font-medium">
                    Atau pilih foto avatar siap pakai:
                  </span>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {avatarPresets.map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatar(presetUrl);
                          if (currentUser) {
                            updateUser(currentUser.id, { avatar: presetUrl });
                            showToast('Foto profil berhasil diubah!');
                          }
                        }}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                          avatar === presetUrl
                            ? 'border-rose-600 scale-105 shadow-xs'
                            : 'border-transparent hover:border-stone-300'
                        }`}
                        title={`Pilih Avatar ${idx + 1}`}
                      >
                        <img
                          src={presetUrl}
                          alt={`Preset ${idx + 1}`}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        {avatar === presetUrl && (
                          <div className="absolute inset-0 bg-rose-600/30 flex items-center justify-center rounded-lg">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: KEAMANAN & KATA SANDI */}
      {activeTab === 'keamanan' && (
        <form onSubmit={handleSavePassword} className="space-y-6">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
              <Lock className="h-4 w-4 text-rose-600" />
              <span>Ubah Kata Sandi Akun</span>
            </h3>

            {passwordSaved && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Kata Sandi Baru Berhasil Disimpan dan Aktif!</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Kata sandi akun Anda telah diperbarui langsung di sistem. Anda dapat menggunakan kata sandi ini untuk sesi login berikutnya.
                </p>
                <div className="flex items-center gap-2 pt-1 font-mono text-xs text-stone-800">
                  <span className="font-semibold text-stone-600">Sandi Anda:</span>
                  <span className="bg-white px-2.5 py-1 rounded border border-emerald-200 font-bold select-all">
                    {passwordSaved}
                  </span>
                </div>
              </div>
            )}

            {passwordError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-4 max-w-md text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Ketik Kata Sandi Baru *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 pr-10 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Ulangi Konfirmasi Kata Sandi Baru *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru..."
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Simpan & Perbarui Kata Sandi</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: RIWAYAT AKTIVITAS SESI */}
      {activeTab === 'aktivitas' && (
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-rose-600" />
              <span>Log Aktivitas Akun Terkini</span>
            </h3>
            <span className="text-[11px] text-stone-400">10 aktivitas terakhir</span>
          </div>

          <div className="divide-y divide-stone-100">
            {userLogs.length === 0 ? (
              <p className="py-6 text-center text-xs text-stone-400">
                Belum ada catatan aktivitas untuk sesi ini.
              </p>
            ) : (
              userLogs.map(log => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <strong className="text-stone-900 block font-semibold">{log.action}</strong>
                    <span className="text-stone-500 text-[11px]">{log.target}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-[10px] text-stone-400 block">
                      {formatDateTimeId(log.timestamp)}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">IP: {log.ipAddress}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL GANTI FOTO PROFIL (TRIGGERED BY CAMERA BUTTON) */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Ubah Foto Profil Akun</h3>
                  <p className="text-[11px] text-stone-500">
                    Unggah dari perangkat Anda atau pilih avatar profesional
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="rounded-xl p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Current & Live Preview */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200/80">
              <div className="relative">
                {tempAvatar ? (
                  <img
                    src={tempAvatar}
                    alt="Pratinjau Foto"
                    className="h-20 w-20 rounded-2xl object-cover border-2 border-rose-600 shadow-md"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-xl font-bold text-rose-700 shadow-md">
                    {currentUser?.name?.substring(0, 2).toUpperCase() || 'AD'}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 bg-rose-600 text-white rounded-full p-1 shadow-xs">
                  <Check className="h-3 w-3" />
                </span>
              </div>
              <div className="text-xs space-y-1">
                <span className="font-bold text-stone-800 block">Pratinjau Foto Profil Baru</span>
                <p className="text-[11px] text-stone-500">
                  {tempAvatar
                    ? 'Foto siap diterapkan untuk identitas akun Anda.'
                    : 'Menggunakan inisial nama tanpa foto profil.'}
                </p>
                {tempAvatar && (
                  <button
                    type="button"
                    onClick={() => setTempAvatar('')}
                    className="text-[11px] text-rose-600 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Hapus Foto (Gunakan Inisial)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Upload from Device Button */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-800 block">
                Opsi 1: Unggah Foto dari Komputer / Smartphone
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-rose-300 bg-rose-50/50 p-4 text-xs font-bold text-rose-700 hover:bg-rose-100/60 active:scale-[0.99] transition-all cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>{isUploading ? 'Memproses Foto...' : 'Pilih File Gambar dari Perangkat'}</span>
              </button>
              <p className="text-[10px] text-stone-400 text-center">
                Mendukung format JPG, PNG, WEBP. Otomatis dikompres optimal untuk avatar.
              </p>
            </div>

            {/* Presets Gallery */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-800 block">
                Opsi 2: Atau Pilih dari Galeri Avatar Klinik
              </span>
              <div className="grid grid-cols-4 gap-2.5">
                {avatarPresets.map((presetUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setTempAvatar(presetUrl)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                      tempAvatar === presetUrl
                        ? 'border-rose-600 scale-105 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <img
                      src={presetUrl}
                      alt={`Avatar ${index + 1}`}
                      className="h-14 w-full rounded-lg object-cover"
                    />
                    {tempAvatar === presetUrl && (
                      <div className="absolute inset-0 bg-rose-600/30 flex items-center justify-center rounded-lg">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-stone-700 block">
                Opsi 3: Tautan URL Foto (Opsional)
              </span>
              <input
                type="url"
                value={tempAvatar}
                onChange={e => setTempAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Terapkan & Simpan Foto</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
