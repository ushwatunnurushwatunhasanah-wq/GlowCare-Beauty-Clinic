import React, { useState } from 'react';
import {
  X,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

interface ResetPasswordModalProps {
  user: User;
  onClose: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ user, onClose }) => {
  const { resetUserPassword } = useApp();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [finalPassword, setFinalPassword] = useState('');

  const handleGenerateRandom = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = 'GC';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setConfirmPassword(res);
    setError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('Kata sandi baru tidak boleh kosong.');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi minimal harus 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }

    // Save directly to the user
    const saved = resetUserPassword(user.id, password.trim());
    setFinalPassword(saved);
    setSavedSuccess(true);
    setError(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(finalPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-gradient-to-r from-rose-50 to-orange-50/50 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Reset Kata Sandi Pengguna</h3>
              <p className="text-[11px] text-stone-500 font-mono truncate max-w-[220px]">
                {user.email} · {user.role.toUpperCase()}
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {!savedSuccess ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="rounded-xl bg-stone-50 p-3.5 border border-stone-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">
                    Nama Pengguna:
                  </span>
                  <span className="font-bold text-stone-900 text-sm">{user.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateRandom}
                  className="flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 transition-colors shadow-2xs"
                  title="Buat rekomendasi kata sandi acak yang aman"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Sandi Otomatis</span>
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-red-700 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Input 1: Kata Sandi Baru */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Buat Kata Sandi Baru *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Ketik kata sandi yang Anda inginkan (min. 6 karakter)..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-3 pr-10 py-2.5 text-xs text-stone-900 font-mono placeholder:font-sans placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                    title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Input 2: Konfirmasi Kata Sandi */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Ulangi Konfirmasi Kata Sandi *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Ketik ulang kata sandi baru untuk verifikasi..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-3 pr-10 py-2.5 text-xs text-stone-900 font-mono placeholder:font-sans placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                    title={showConfirmPassword ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-stone-50 p-2.5 text-[11px] text-stone-500 space-y-0.5">
                <p>• Kata sandi langsung disimpan ke akun pengguna di sistem.</p>
                <p>• Pengguna dapat langsung login menggunakan kata sandi baru ini.</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Simpan Kata Sandi</span>
                </button>
              </div>
            </form>
          ) : (
            /* Success State */
            <div className="space-y-4 animate-in fade-in">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-center space-y-2">
                <div className="flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                </div>
                <h4 className="font-bold text-emerald-900 text-sm">
                  Kata Sandi Berhasil Disimpan!
                </h4>
                <p className="text-stone-600 text-xs">
                  Kata sandi baru untuk <strong>{user.name}</strong> telah aktif dan disimpan langsung ke database sistem.
                </p>
              </div>

              {/* Display the password with copy button */}
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 space-y-2 text-center">
                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
                  KATA SANDI BARU YANG TELAH DISIMPAN:
                </span>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-sm font-mono font-bold bg-white px-3 py-1.5 rounded-lg border border-stone-300 text-rose-700 select-all shadow-2xs">
                    {finalPassword}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-white font-semibold hover:bg-rose-700 shadow-xs text-xs cursor-pointer"
                    title="Salin Kata Sandi ke Clipboard"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
