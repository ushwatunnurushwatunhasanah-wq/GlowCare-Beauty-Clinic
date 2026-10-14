import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  Smartphone,
  Save,
  Building,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentChannel, PaymentMethod } from '../../types';

interface PaymentChannelModalProps {
  channel?: PaymentChannel;
  onClose: () => void;
}

export const PaymentChannelModal: React.FC<PaymentChannelModalProps> = ({ channel, onClose }) => {
  const { addPaymentChannel, updatePaymentChannel, deletePaymentChannel } = useApp();

  const isEdit = Boolean(channel);

  const [formData, setFormData] = useState<Omit<PaymentChannel, 'id'>>({
    name: channel?.name || '',
    type: channel?.type || 'QRIS',
    provider: channel?.provider || '',
    accountNumber: channel?.accountNumber || '',
    accountHolder: channel?.accountHolder || '',
    instructions: channel?.instructions || '',
    isActive: channel ? channel.isActive : true,
    adminFee: channel?.adminFee || 0
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (isEdit && channel) {
      updatePaymentChannel(channel.id, formData);
    } else {
      addPaymentChannel(formData);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleDelete = () => {
    if (channel && window.confirm(`Hapus saluran pembayaran "${channel.name}"?`)) {
      deletePaymentChannel(channel.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-gradient-to-r from-rose-50 to-pink-50/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                {isEdit ? 'Edit Saluran Metode Pembayaran' : 'Tambah Metode Pembayaran Baru'}
              </h3>
              <p className="text-[11px] text-stone-500">
                Atur konfigurasi rekening bank, barcode QRIS, atau mesin EDC kasir
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

        {savedSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-stone-900">
              {isEdit ? 'Metode Pembayaran Diperbarui!' : 'Metode Pembayaran Baru Ditambahkan!'}
            </h4>
            <p className="text-xs text-stone-500">
              Konfigurasi kasir telah diperbarui secara instan.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
            {/* Payment Method Type */}
            <div>
              <label className="block font-bold text-stone-800 mb-1.5">
                Kategori Metode <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['QRIS', 'Cash', 'Debit', 'Transfer'] as PaymentMethod[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t })}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      formData.type === t
                        ? 'border-rose-600 bg-rose-50/80 font-bold text-rose-900 shadow-xs'
                        : 'border-stone-200 bg-stone-50/40 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {t === 'QRIS' && <QrCode className="h-4 w-4 mb-1 text-purple-600" />}
                    {t === 'Cash' && <Banknote className="h-4 w-4 mb-1 text-emerald-600" />}
                    {t === 'Debit' && <CreditCard className="h-4 w-4 mb-1 text-blue-600" />}
                    {t === 'Transfer' && <Smartphone className="h-4 w-4 mb-1 text-indigo-600" />}
                    <span className="text-[11px]">{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nama Saluran / Channel */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Nama Saluran Pembayaran <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: QRIS BCA Dinamis / Transfer Mandiri"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Provider / Nama Bank */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Provider / Nama Bank / Lembaga
              </label>
              <input
                type="text"
                value={formData.provider}
                onChange={e => setFormData({ ...formData, provider: e.target.value })}
                placeholder="Contoh: Bank Central Asia (BCA) / Mandiri / Kasir FO"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Nomor Rekening / NMID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nomor Rekening / NMID / ID Mesin
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="Contoh: 8720-192-831 / NMID: ID10..."
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 font-mono focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Pemilik / Atas Nama Akun
                </label>
                <input
                  type="text"
                  value={formData.accountHolder}
                  onChange={e => setFormData({ ...formData, accountHolder: e.target.value })}
                  placeholder="Contoh: PT GlowCare Aesthetic Klinik"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Petunjuk Pembayaran / Prosedur Kasir
              </label>
              <textarea
                rows={2}
                value={formData.instructions}
                onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Petunjuk yang tampil untuk kasir saat melayani pasien..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/50 p-3">
              <div>
                <span className="font-semibold text-stone-800 block text-xs">Status Saluran Pembayaran</span>
                <span className="text-[10px] text-stone-500">
                  {formData.isActive ? 'Tersedia dan aktif di kasir' : 'Dinonaktifkan sementara di kasir'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              {isEdit ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 text-xs font-semibold"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Hapus</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
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
                  <Save className="h-4 w-4" />
                  <span>Simpan Saluran</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
