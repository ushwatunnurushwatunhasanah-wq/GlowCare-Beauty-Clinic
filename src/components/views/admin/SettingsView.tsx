import React, { useState } from 'react';
import {
  Building,
  Save,
  Printer,
  CheckCircle2,
  Database
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { NeonDatabaseSettings } from './NeonDatabaseSettings';

interface SettingsViewProps {
  initialTab?: 'profil' | 'struk' | 'neon';
}

export const SettingsView: React.FC<SettingsViewProps> = ({ initialTab = 'profil' }) => {
  const { settings, updateSettings, neonConfig } = useApp();
  const [activeTab, setActiveTab] = useState<'profil' | 'struk' | 'neon'>(initialTab);
  const [formData, setFormData] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-stone-900">
          Pengaturan Klinik & Konfigurasi Sistem
        </h2>
        <p className="text-xs text-stone-500">
          Identitas resmi klinik, jam operasional, format nota cetak, dan integrasi Cloud PostgreSQL Neon (neondb.com)
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('profil')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'profil'
              ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Building className="h-4 w-4" />
          <span>Profil Klinik</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('struk')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'struk'
              ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Printer className="h-4 w-4" />
          <span>Format Struk & Nota</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('neon')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'neon'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs'
              : 'text-stone-600 hover:bg-emerald-50/50 hover:text-emerald-900'
          }`}
        >
          <Database className="h-4 w-4 text-emerald-600" />
          <span>Neon Database (neondb.com)</span>
          {neonConfig.isConnected ? (
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Terhubung" />
          ) : (
            <span className="flex h-1.5 w-1.5 rounded-full bg-stone-300" title="Belum Terhubung" />
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Pengaturan klinik berhasil diperbarui dan disimpan.</span>
        </div>
      )}

      {/* Tab: Neon Database */}
      {activeTab === 'neon' && (
        <NeonDatabaseSettings />
      )}

      {/* Tab: Profil Klinik */}
      {activeTab === 'profil' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
              <Building className="h-4 w-4 text-rose-600" />
              <span>Profil & Identitas Klinik</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Klinik</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Slogan / Tagline</label>
                <input
                  type="text"
                  value={formData.slogan}
                  onChange={e => setFormData({ ...formData, slogan: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nomor Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Email Resmi</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Akun Instagram</label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Jam Operasional Pelayanan</label>
                <input
                  type="text"
                  value={formData.operatingHours}
                  onChange={e => setFormData({ ...formData, operatingHours: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Format Struk & Nota */}
      {activeTab === 'struk' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
              <Printer className="h-4 w-4 text-rose-600" />
              <span>Format Header Struk Kasir & Bukti Pembayaran</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nama Brand pada Header Struk
                  </label>
                  <input
                    type="text"
                    value={formData.receiptHeaderTitle || ''}
                    placeholder={formData.name}
                    onChange={e => setFormData({ ...formData, receiptHeaderTitle: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Slogan / Subjudul Struk
                  </label>
                  <input
                    type="text"
                    value={formData.receiptHeaderSubtitle || ''}
                    placeholder={formData.slogan}
                    onChange={e => setFormData({ ...formData, receiptHeaderSubtitle: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Alamat Lengkap pada Struk
                  </label>
                  <input
                    type="text"
                    value={formData.receiptHeaderAddress || ''}
                    placeholder={formData.address}
                    onChange={e => setFormData({ ...formData, receiptHeaderAddress: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nomor Telepon / Kontak pada Struk
                  </label>
                  <input
                    type="text"
                    value={formData.receiptHeaderPhone || ''}
                    placeholder={formData.phone}
                    onChange={e => setFormData({ ...formData, receiptHeaderPhone: e.target.value })}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Pesan Header Tambahan / Izin Dinkes</label>
                <input
                  type="text"
                  value={formData.receiptHeaderNote}
                  placeholder="Contoh: Izin Operasional Dinkes No. 445/12/Dinkes/2024"
                  onChange={e => setFormData({ ...formData, receiptHeaderNote: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Pesan Footer / Kebijakan Struk</label>
                <textarea
                  rows={2}
                  value={formData.receiptFooterNote}
                  onChange={e => setFormData({ ...formData, receiptFooterNote: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
