import React, { useState } from 'react';
import { X, Printer, Copy, Check, FileDown, CheckCircle2, Edit2, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Payment } from '../../types';
import { formatRupiah, formatDateTimeId } from '../../utils/formatters';
import { downloadReceiptPdf } from '../../utils/receiptPdf';
import { EditReceiptHeaderModal } from './EditReceiptHeaderModal';

interface PrintReceiptModalProps {
  payment: Payment;
  onClose: () => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({ payment, onClose }) => {
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

  const handleDownloadPdf = () => {
    try {
      setIsDownloading(true);
      const filename = downloadReceiptPdf(payment, settings);
      setDownloadSuccess(`Struk kasir berhasil diunduh sebagai PDF: ${filename}`);
      setTimeout(() => {
        setDownloadSuccess(null);
      }, 4000);
    } catch (err) {
      console.error('Error generating PDF receipt:', err);
      try {
        window.print();
      } catch {
        // Fallback
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      handleDownloadPdf();
    }
  };

  const handleCopy = () => {
    const lines = [
      `=== STRUK PEMBAYARAN ${headerTitle.toUpperCase()} ===`,
      `${headerSubtitle}`,
      `${headerAddress}`,
      `Telp: ${headerPhone}`,
      `------------------------------------------`,
      `No. Faktur : ${payment.invoiceNumber}`,
      `Waktu      : ${formatDateTimeId(payment.paidAt || new Date().toISOString())}`,
      `Pasien     : ${payment.patientName} (${payment.patientRm})`,
      `Kasir      : ${payment.cashierName || 'Kasir GlowCare'}`,
      `------------------------------------------`,
      `Item       : ${payment.treatmentName} - ${formatRupiah(payment.treatmentPrice)}`
    ];

    if (payment.additionalProducts && payment.additionalProducts.length > 0) {
      payment.additionalProducts.forEach(p => {
        lines.push(`Produk     : ${p.productName} (x${p.quantity}) - ${formatRupiah(p.price * p.quantity)}`);
      });
    }

    if (payment.discount && payment.discount > 0) {
      lines.push(`Diskon     : -${formatRupiah(payment.discount)}`);
    }

    lines.push(`TOTAL      : ${formatRupiah(payment.totalAmount)}`);
    lines.push(`Metode     : ${payment.paymentMethod || 'Tunai'}`);
    if (payment.referenceNumber) lines.push(`No. Ref    : ${payment.referenceNumber}`);
    lines.push(`Status     : ${payment.status.toUpperCase()}`);
    lines.push(`==========================================`);
    lines.push(settings.receiptFooterNote || `Terima kasih atas kunjungan Anda di ${headerTitle}.`);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
              <span className="text-xs font-bold text-stone-800">Pratinjau Struk Kasir</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Edit Header Struk Button */}
              <button
                type="button"
                onClick={() => setIsEditingHeader(true)}
                className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/70 px-2 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 hover:text-rose-800 transition-colors shadow-2xs cursor-pointer"
                title="Edit Nama Klinik, Alamat & Kontak di Header Struk"
              >
                <Edit2 className="h-3 w-3" />
                <span>Edit Header</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                title="Salin Teks Struk"
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

              {/* Cetak Struk PDF Button */}
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Cetak dan simpan sebagai file PDF"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>{isDownloading ? 'Menyusun...' : 'PDF'}</span>
              </button>

              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors ml-0.5"
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

          {/* Thermal Receipt Paper Style */}
          <div className="p-6 bg-white font-mono text-[11px] leading-relaxed text-stone-800 space-y-3 print-container select-text overflow-y-auto">
            {/* Clinic Brand Header with Interactive Edit Button */}
            <div
              onClick={() => setIsEditingHeader(true)}
              className="group/hdr relative text-center pb-3 border-b border-dashed border-stone-300 hover:bg-rose-50/40 rounded-xl p-2 transition-all cursor-pointer"
              title="Klik di sini untuk mengedit header struk (nama klinik, slogan, alamat, telepon)"
            >
              <div className="absolute right-1 top-1 hidden group-hover/hdr:flex items-center gap-1 bg-white border border-rose-200 text-rose-700 text-[9px] px-1.5 py-0.5 rounded-md font-sans font-semibold shadow-2xs">
                <Edit2 className="h-2.5 w-2.5" />
                <span>Edit Header</span>
              </div>

              <h2 className="font-serif-display text-base font-bold uppercase tracking-wider text-stone-900">
                {headerTitle}
              </h2>
              <p className="text-[10px] text-rose-700 italic font-sans font-medium">{headerSubtitle}</p>
              <p className="text-[9px] text-stone-500 mt-1 leading-tight">{headerAddress}</p>
              <p className="text-[9px] text-stone-500 font-mono">Telp: {headerPhone}</p>
              {settings.receiptHeaderNote && (
                <p className="text-[8.5px] text-stone-400 italic pt-0.5 font-sans leading-tight">
                  {settings.receiptHeaderNote}
                </p>
              )}
            </div>

            {/* Invoice Metadata */}
            <div className="space-y-1 text-[10px] text-stone-600 pb-2 border-b border-dashed border-stone-300">
              <div className="flex justify-between">
                <span>No. Faktur:</span>
                <strong className="text-stone-900">{payment.invoiceNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{formatDateTimeId(payment.paidAt || new Date().toISOString())}</span>
              </div>
              <div className="flex justify-between">
                <span>Pasien:</span>
                <strong className="text-stone-900">{payment.patientName}</strong>
              </div>
              <div className="flex justify-between">
                <span>No. RM:</span>
                <span>{payment.patientRm}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{payment.cashierName || 'Kasir GlowCare'}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-1.5 py-1">
              <div className="flex justify-between font-bold text-stone-900">
                <span>ITEM PERAWATAN</span>
                <span>JUMLAH</span>
              </div>
              <div className="flex justify-between">
                <span className="max-w-[180px]">{payment.treatmentName}</span>
                <span>{formatRupiah(payment.treatmentPrice)}</span>
              </div>

              {payment.additionalProducts?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[10px] text-stone-600">
                  <span className="max-w-[180px]">{item.productName} (x{item.quantity})</span>
                  <span>{formatRupiah(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-2 border-t border-dashed border-stone-300 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatRupiah(payment.subtotal || payment.treatmentPrice)}</span>
              </div>
              {payment.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon Promosi:</span>
                  <span>-{formatRupiah(payment.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-stone-300 text-stone-900">
                <span>TOTAL PEMBAYARAN:</span>
                <span>{formatRupiah(payment.totalAmount)}</span>
              </div>
            </div>

            {/* Payment Method Info */}
            <div className="pt-2 border-t border-dashed border-stone-300 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Metode Pembayaran:</span>
                <strong className="text-stone-900">{payment.paymentMethod || 'Tunai'}</strong>
              </div>
              {payment.paymentChannelName && (
                <div className="flex justify-between text-stone-500">
                  <span>Saluran / Bank:</span>
                  <span>{payment.paymentChannelName}</span>
                </div>
              )}
              {payment.referenceNumber && (
                <div className="flex justify-between text-stone-500">
                  <span>No. Referensi:</span>
                  <span>{payment.referenceNumber}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1">
                <span>Status Transaksi:</span>
                <span
                  className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                    payment.status === 'Lunas'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {payment.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Barcode simulation */}
            <div className="pt-3 text-center">
              <div className="flex justify-center items-center gap-0.5 h-6">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full ${
                      (i * 5 + 2) % 3 === 0 ? 'w-1 bg-stone-900' : 'w-0.5 bg-stone-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[8px] text-stone-400 font-mono tracking-widest mt-1 block">
                *{payment.invoiceNumber}*
              </span>
            </div>

            {/* Footer note */}
            <div className="text-center pt-2 text-[9px] text-stone-400 font-sans leading-tight">
              <p>Terima kasih atas kepercayaan Anda di {headerTitle}.</p>
              {settings.receiptFooterNote ? (
                <p className="mt-0.5 italic text-[8.5px]">{settings.receiptFooterNote}</p>
              ) : (
                <p className="mt-0.5 italic">Struk ini merupakan bukti pembayaran kasir yang sah.</p>
              )}
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
            setDownloadSuccess('Header struk kasir berhasil diperbarui!');
          }}
        />
      )}
    </>
  );
};
