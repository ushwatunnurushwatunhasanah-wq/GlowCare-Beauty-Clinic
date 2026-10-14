import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Lock,
  UserCheck,
  Eye,
  EyeOff,
  ArrowRight,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginView: React.FC = () => {
  const { login, doctors } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Real-time detection of account based on typing
  const detectedAccount = useMemo(() => {
    let clean = email.trim().toLowerCase();
    if (!clean) return null;

    if (clean.endsWith('.tes')) {
      clean = clean + 't';
    }

    const prefix = clean.includes('@') ? clean.split('@')[0] : clean;

    if (
      prefix === 'admin' ||
      clean.includes('admin') ||
      clean.includes('ushwatun') ||
      clean.includes('hasanah') ||
      clean.includes('nursam')
    ) {
      return {
        role: 'Administrator Utama',
        name: 'Nur Ushwatun Hasanah',
        color: 'text-purple-700 bg-purple-50 border-purple-200'
      };
    }

    if (prefix === 'loket' || clean.includes('loket') || clean.includes('rina')) {
      return {
        role: 'Loket Pendaftaran',
        name: 'Rina Kusuma Dewi',
        color: 'text-amber-700 bg-amber-50 border-amber-200'
      };
    }

    // Check doctors
    for (const doc of doctors) {
      const dName = doc.name.toLowerCase();
      const dEmail = doc.email.toLowerCase();
      const dPrefix = dEmail.split('@')[0];
      if (
        clean.includes(dPrefix) ||
        clean === dEmail ||
        dName.includes(prefix) ||
        (clean.length > 3 && dName.includes(clean))
      ) {
        return {
          role: 'Dokter Spesialis',
          name: doc.name,
          color: 'text-rose-700 bg-rose-50 border-rose-200'
        };
      }
    }

    return null;
  }, [email, doctors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    let targetEmail = email.trim();
    if (targetEmail.toLowerCase().endsWith('.tes')) {
      targetEmail = targetEmail + 't';
    }

    setTimeout(() => {
      const success = login(targetEmail, password);
      setIsLoading(false);
      if (!success) {
        setErrorMessage(
          'Akun tidak ditemukan. Anda dapat masuk menggunakan "admin", "admin@glowcare.test", "loket", atau email/nama dokter.'
        );
      }
    }, 300);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#FCF8F8] overflow-hidden">
      {/* Decorative luxury gradient background glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden">
        {/* Left Side: Editorial Clinic Hero Visual */}
        <div className="relative lg:col-span-5 bg-gradient-to-br from-rose-900 via-rose-950 to-stone-900 p-8 sm:p-10 text-white flex flex-col justify-between overflow-hidden">
          {/* Background image overlay */}
          <div className="absolute inset-0 opacity-25 mix-blend-overlay">
            <img
              src="/src/assets/images/glowcare_clinic_interior_1790422359208.jpg"
              alt="GlowCare Clinic Lounge"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1.5 border border-white/15 text-xs text-rose-200">
              <Sparkles className="h-3.5 w-3.5 text-rose-300" />
              <span>Aesthetic Medical Management System</span>
            </div>

            <div className="mt-8">
              <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                GlowCare
                <span className="block text-rose-200 font-normal text-2xl sm:text-3xl italic">
                  Beauty Clinic
                </span>
              </h1>
              <p className="mt-4 text-sm text-rose-100/90 leading-relaxed font-light">
                "Your Beauty, Our Care"
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-12 pt-6 border-t border-white/10">
            <p className="text-xs text-rose-200/80 leading-relaxed">
              Solusi terpadu manajemen klinik estetika modern: pendaftaran, antrian digital, rekam medis dermatologi, kasir & struk, serta moderasi review kepuasan pasien.
            </p>
            <div className="mt-4 flex items-center gap-3 text-[11px] text-white/60">
              <span>ISO 9001 Certified Clinic</span>
              <span>·</span>
              <span>Dermatologist Approved</span>
            </div>
          </div>
        </div>

        {/* Right Side: Professional Authentication Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-stone-900">
                Masuk ke Sistem
              </h2>
              <p className="mt-1.5 text-xs text-stone-500 leading-relaxed">
                Silakan masukkan email atau username beserta kata sandi akun Anda.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-xl bg-red-50 p-3.5 text-xs text-red-700 border border-red-200 animate-fadeIn">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Email Akun atau Username
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin / admin@glowcare.test"
                    autoComplete="username"
                    className="block w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-3 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                  />
                </div>

                {/* Detected Account Feedback */}
                {detectedAccount && (
                  <div
                    className={`mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium animate-fadeIn ${detectedAccount.color}`}
                  >
                    <UserCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Akun dikenali: <strong>{detectedAccount.name}</strong> ({detectedAccount.role})
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="block w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-10 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-stone-600">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-3.5 w-3.5 rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Ingat saya di perangkat ini</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 py-3 px-4 text-xs font-semibold text-white shadow-md shadow-rose-200 hover:from-rose-700 hover:to-rose-800 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/40 disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <span>Memverifikasi akun...</span>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
