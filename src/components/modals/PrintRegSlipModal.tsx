import React, { useState } from 'react';
import { X, Printer, Copy, Check, FileDown, CheckCircle2, AlertCircle, Edit2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Registration } from '../../types';
import { formatDateId } from '../../utils/formatters';
import { downloadRegistrationPdf } from '../../utils/registrationPdf';
import { EditReceiptHeaderModal } from './EditReceiptHeaderModal';

interface PrintRegSlipModalProps {
  registration: Registration;
  onClose: () => void;
}

export const PrintRegSlipModal: React.FC<PrintRegSlipModalProps> = ({ registration, onClose }) => {
  const { settings } = useApp();
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditingHeader, setIsEditingHeader] = useState(false);

  // Resolved header values
  const headerTitle = settings.receiptHeaderTitle || settings.name || 'GLOWCARE AESTHETIC';
  const headerSubtitle = settings.receiptHeaderSubtitle || settings.slogan || 'Klinik Kecantikan & Estetika Medis';
  const headerAddress = settings.receiptHeaderAddress || settings.address || 'Jl. Kemang Raya No. 45B, Jakarta Selatan';
  const headerPhone = settings.receiptHeaderPhone || settings.phone || '021-7198822';

  // Direct PDF Download / Generation
  const handleDownloadPdf = () => {
    try {
      setIsDownloading(true);
      const filename = downloadRegistrationPdf(registration, settings);
      setDownloadSuccess(`Bukti pendaftaran berhasil dicetak dan diunduh sebagai PDF: ${filename}`);
      setTimeout(() => {
        setDownloadSuccess(null);
      }, 4000);
    } catch (err) {
      console.error('Error generating PDF:', err);
      try {
        window.print();
      } catch {
        // Silent fallback
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Browser Print with fallback to PDF
  const handlePrint = () => {
    try {
      window.print();
    } catch {
      handleDownloadPdf();
    }
  };

  const handleCopy = () => {
    const text = `
=== BUKTI REGISTRASI ${headerTitle.toUpperCase()} ===
${headerSubtitle}
${headerAddress} · Telp: ${headerPhone}
---------------------------------------------
No. Registrasi : ${registration.regNumber}
Tanggal / Jam  : ${formatDateId(registration.registrationDate)} · ${registration.registrationTime}
Nama Pasien    : ${registration.patientName} (${registration.patientRm})
Dokter         : ${registration.doctorName}
Layanan        : ${registration.treatmentName}
Nomor Antrian  : ${registration.queueNumber}
Petugas Loket  : ${registration.registeredBy}
Status Biaya   : ${registration.paymentStatus}
=============================================
Harap simpan bukti pendaftaran ini untuk verifikasi di ruang periksa.
Terima kasih atas kunjungan Anda di ${headerTitle}.
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="print-modal-wrapper fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
        <div className="print-modal-card relative w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in zoom-in-95 duration-150 flex flex-col max-h-[95vh]">
          {/* Top Control Bar */}
          <div className="no-print flex items-center justify-between border-b border-stone-100 bg-stone-50 px-4 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                <Printer className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-stone-800">Bukti Registrasi</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Edit Header Button */}
              <button
                type="button"
                onClick={() => setIsEditingHeader(true)}
                className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/70 px-2 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 hover:text-rose-800 transition-colors shadow-2xs cursor-pointer"
                title="Edit Nama Klinik, Alamat & Kontak di Header"
              >
                <Edit2 className="h-3 w-3" />
                <span>Edit Header</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                title="Salin Teks Bukti"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>

              {/* Cetak Bukti Button (Primary Red Button) - Downloads PDF */}
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Cetak dan simpan sebagai file PDF"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>{isDownloading ? 'Membuat...' : 'PDF'}</span>
              </button>

              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors ml-0.5"
                title="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Feedback Alert if PDF was generated successfully */}
          {downloadSuccess && (
            <div className="no-print bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-[11px] text-emerald-800 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{downloadSuccess}</span>
              </div>
              <button onClick={() => setDownloadSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Paper Document for Print / Thermal Slip Preview */}
          <div className="p-6 bg-white font-mono text-stone-800 space-y-3 text-[11px] print-container select-text overflow-y-auto">
            {/* Clickable Header with Edit Trigger */}
            <div
              onClick={() => setIsEditingHeader(true)}
              className="group/hdr relative text-center pb-3 border-b border-dashed border-stone-300 hover:bg-rose-50/40 rounded-xl p-2 transition-all cursor-pointer"
              title="Klik di sini untuk mengedit header bukti pendaftaran"
            >
              <div className="absolute right-1 top-1 hidden group-hover/hdr:flex items-center gap-1 bg-white border border-rose-200 text-rose-700 text-[9px] px-1.5 py-0.5 rounded-md font-sans font-semibold shadow-2xs">
                <Edit2 className="h-2.5 w-2.5" />
                <span>Edit Header</span>
              </div>

              <h2 className="font-serif-display text-base font-bold uppercase tracking-wider text-stone-900">
                {headerTitle}
              </h2>
              <p className="text-[10px] text-rose-700 italic font-sans font-medium">{headerSubtitle}</p>
              <p className="text-[9px] text-stone-500 mt-0.5 leading-tight">{headerAddress}</p>
              <p className="text-[9px] text-stone-500">Telp: {headerPhone}</p>
              {settings.receiptHeaderNote && (
                <p className="text-[8.5px] text-stone-400 italic pt-0.5 font-sans leading-tight">
                  {settings.receiptHeaderNote}
                </p>
              )}
            </div>

            <div className="text-center py-1">
              <span className="text-[11px] font-bold text-stone-900 font-sans tracking-wide block uppercase">
                BUKTI REGISTRASI RAWAT JALAN
              </span>
              <span className="text-[10px] text-stone-500 font-mono font-bold tracking-wider">
                {registration.regNumber}
              </span>
            </div>

            <div className="border-t border-b border-dashed border-stone-300 py-2.5 space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-stone-500">Tanggal / Jam:</span>
                <span className="font-bold text-stone-800">
                  {formatDateId(registration.registrationDate)} · {registration.registrationTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Nama Pasien:</span>
                <span className="font-bold text-stone-900">{registration.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">No. Rekam Medis:</span>
                <span className="font-mono font-bold text-rose-700">{registration.patientRm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Dokter Spesialis:</span>
                <span className="font-medium text-stone-800">{registration.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Layanan Tindakan:</span>
                <span className="font-medium text-stone-800">{registration.treatmentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Petugas Loket:</span>
                <span className="text-stone-700">{registration.registeredBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Status Biaya:</span>
                <span className="font-bold text-emerald-700">{registration.paymentStatus}</span>
              </div>
            </div>

            {/* Queue Highlight */}
            <div className="text-center py-3 bg-stone-50 rounded-xl border border-dashed border-stone-200">
              <span className="text-[9px] uppercase tracking-wider text-stone-500 font-bold block mb-1">
                NOMOR ANTRIAN POLI
              </span>
              <span className="text-3xl font-extrabold text-rose-700 font-mono tracking-tight block">
                {registration.queueNumber}
              </span>
              <span className="text-[9px] text-stone-400 mt-1 block">
                Harap perhatikan layar panggilan poliklinik
              </span>
            </div>

            {/* Barcode simulation */}
            <div className="pt-2 text-center">
              <div className="flex justify-center items-center gap-0.5 h-6">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full ${
                      (i * 3 + 1) % 4 === 0 ? 'w-1 bg-stone-900' : 'w-0.5 bg-stone-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[8px] text-stone-400 font-mono tracking-widest mt-1 block">
                *{registration.regNumber}*
              </span>
            </div>

            {/* Footer Notice */}
            <div className="text-center text-[9px] text-stone-400 font-sans leading-tight pt-2 border-t border-dashed border-stone-200">
              <p>Simpan lembar bukti ini sebagai tanda registrasi yang sah.</p>
              <p className="mt-0.5">Terima kasih atas kunjungan Anda di {headerTitle}.</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="no-print p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
              title="Kirim ke printer thermal"
            >
              <Printer className="h-3.5 w-3.5 text-stone-500" />
              <span>Cetak Printer</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-xs transition-colors cursor-pointer"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>Unduh / Cetak PDF</span>
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Header Modal */}
      {isEditingHeader && (
        <EditReceiptHeaderModal
          onClose={() => setIsEditingHeader(false)}
          onSaved={() => {
            setDownloadSuccess('Header bukti registrasi berhasil diperbarui!');
          }}
        />
      )}
    </>
  );
};
