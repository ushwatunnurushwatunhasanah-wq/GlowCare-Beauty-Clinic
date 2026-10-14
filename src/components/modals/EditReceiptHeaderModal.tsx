import React, { useState } from 'react';
import { X, Building2, Save, RotateCcw, CheckCircle2, Sparkles, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface EditReceiptHeaderModalProps {
  onClose: () => void;
  onSaved?: () => void;
}

export const EditReceiptHeaderModal: React.FC<EditReceiptHeaderModalProps> = ({ onClose, onSaved }) => {
  const { settings, updateSettings } = useApp();

  const [headerTitle, setHeaderTitle] = useState(settings.receiptHeaderTitle || settings.name);
  const [headerSubtitle, setHeaderSubtitle] = useState(settings.receiptHeaderSubtitle || settings.slogan);
  const [headerAddress, setHeaderAddress] = useState(settings.receiptHeaderAddress || settings.address);
  const [headerPhone, setHeaderPhone] = useState(settings.receiptHeaderPhone || settings.phone);
  const [headerNote, setHeaderNote] = useState(settings.receiptHeaderNote || '');
  const [footerNote, setFooterNote] = useState(settings.receiptFooterNote || '');

  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetToDefault = () => {
    setHeaderTitle(settings.name);
    setHeaderSubtitle(settings.slogan);
    setHeaderAddress(settings.address);
    setHeaderPhone(settings.phone);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateSettings({
      receiptHeaderTitle: headerTitle.trim(),
      receiptHeaderSubtitle: headerSubtitle.trim(),
      receiptHeaderAddress: headerAddress.trim(),
      receiptHeaderPhone: headerPhone.trim(),
      receiptHeaderNote: headerNote.trim(),
      receiptFooterNote: footerNote.trim(),
      // Also sync main clinic name and address if they were empty or match
      name: headerTitle.trim() || settings.name,
      slogan: headerSubtitle.trim() || settings.slogan,
      address: headerAddress.trim() || settings.address,
      phone: headerPhone.trim() || settings.phone
    });

    setIsSuccess(true);
    if (onSaved) onSaved();

    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-gradient-to-r from-rose-50 to-pink-50/50 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Edit Header Struk & Bukti Pembayaran</h3>
              <p className="text-[11px] text-stone-500">
                Kustomisasi identitas klinik pada kertas struk kasir & PDF
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* Live Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-rose-600" />
                <span>Pratinjau Langsung Header Struk</span>
              </span>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline cursor-pointer"
                title="Kembalikan ke data utama klinik"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset ke Default</span>
              </button>
            </div>

            <div className="rounded-xl border border-dashed border-rose-300 bg-rose-50/30 p-3.5 text-center font-mono space-y-1">
              <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wider">
                {headerTitle || 'NAMA KLINIK'}
              </h4>
              <p className="text-[10px] text-rose-700 italic font-sans font-medium">
                {headerSubtitle || 'Slogan / Tagline Klinik'}
              </p>
              <p className="text-[9px] text-stone-600 leading-tight">
                {headerAddress || 'Alamat Lengkap Klinik'}
              </p>
              <p className="text-[9px] text-stone-500 font-mono">
                {headerPhone ? `Telp: ${headerPhone}` : 'No. Telepon Kontak'}
              </p>
              {headerNote && (
                <p className="text-[8.5px] text-stone-400 italic pt-1 border-t border-dashed border-stone-200">
                  {headerNote}
                </p>
              )}
            </div>
          </div>

          {/* Input 1: Nama / Brand Klinik */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1">
              1. Nama Klinik / Brand pada Struk *
            </label>
            <input
              type="text"
              required
              value={headerTitle}
              onChange={e => setHeaderTitle(e.target.value)}
              placeholder="Contoh: GlowCare Beauty Clinic & Aesthetic"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Input 2: Slogan / Subtitle */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1">
              2. Slogan / Subjudul Klinik *
            </label>
            <input
              type="text"
              required
              value={headerSubtitle}
              onChange={e => setHeaderSubtitle(e.target.value)}
              placeholder="Contoh: Your Beauty, Our Care"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Input 3: Alamat Lengkap */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1">
              3. Alamat Lengkap Klinik *
            </label>
            <textarea
              rows={2}
              required
              value={headerAddress}
              onChange={e => setHeaderAddress(e.target.value)}
              placeholder="Contoh: Jl. Senopati Raya No. 45, Kebayoran Baru, Jakarta Selatan"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Input 4: No. Telepon / Kontak */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1">
              4. Nomor Telepon / Kontak Kasir *
            </label>
            <input
              type="text"
              required
              value={headerPhone}
              onChange={e => setHeaderPhone(e.target.value)}
              placeholder="Contoh: (021) 7280-9988 / WA: 0812-9988-7700"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Input 5: Catatan Header Tambahan (Opsional) */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1">
              5. Catatan Tambahan Header / No. Izin Klinik (Opsional)
            </label>
            <input
              type="text"
              value={headerNote}
              onChange={e => setHeaderNote(e.target.value)}
              placeholder="Contoh: Izin Operasional Dinkes No. 445/12/Dinkes/2024"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Input 6: Catatan Kaki / Footer Struk */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1">
              6. Catatan Kaki / Syarat Pembayaran (Footer Struk)
            </label>
            <textarea
              rows={2}
              value={footerNote}
              onChange={e => setFooterNote(e.target.value)}
              placeholder="Pesan penutup atau kebijakan retur produk di kasir..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
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
              {isSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan Header</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
