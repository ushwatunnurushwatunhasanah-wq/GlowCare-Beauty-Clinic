import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Printer,
  Sparkles,
  Save,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Payment, PaymentMethod, PaymentStatus } from '../../types';
import { formatRupiah, formatDateTimeId } from '../../utils/formatters';

interface EditPaymentMethodModalProps {
  payment: Payment;
  onClose: () => void;
}

export const EditPaymentMethodModal: React.FC<EditPaymentMethodModalProps> = ({
  payment,
  onClose
}) => {
  const { updatePaymentMethod, paymentChannels, openModal } = useApp();

  const [method, setMethod] = useState<PaymentMethod>(payment.paymentMethod || 'QRIS');
  const [selectedChannelId, setSelectedChannelId] = useState<string>(payment.paymentChannelId || '');
  const [referenceNumber, setReferenceNumber] = useState<string>(payment.referenceNumber || '');
  const [notes, setNotes] = useState<string>(payment.notes || '');
  const [status, setStatus] = useState<PaymentStatus>(payment.status);
  const [discount, setDiscount] = useState<number>(payment.discount || 0);
  const [isSuccess, setIsSuccess] = useState(false);

  const subtotal = payment.subtotal || payment.treatmentPrice;
  const calculatedTotal = Math.max(0, subtotal - discount);

  // Filter channels based on selected method
  const availableChannels = paymentChannels.filter(c => c.isActive && c.type === method);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const chosenChannel = paymentChannels.find(c => c.id === selectedChannelId);

    updatePaymentMethod(payment.id, method, {
      referenceNumber: referenceNumber.trim(),
      notes: notes.trim(),
      status,
      discount,
      totalAmount: calculatedTotal,
      paymentChannelName: chosenChannel ? chosenChannel.name : undefined
    });

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handlePrintReceiptNow = () => {
    const chosenChannel = paymentChannels.find(c => c.id === selectedChannelId);
    const updatedPayment: Payment = {
      ...payment,
      paymentMethod: method,
      paymentChannelName: chosenChannel ? chosenChannel.name : undefined,
      referenceNumber: referenceNumber.trim(),
      notes: notes.trim(),
      status,
      discount,
      totalAmount: calculatedTotal
    };
    onClose();
    openModal('print-receipt', updatedPayment);
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
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 text-sm">Edit Metode Pembayaran</h3>
                <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 font-mono">
                  {payment.invoiceNumber}
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Perbarui cara bayar pasien atau rincian transaksi kasir
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
            <h4 className="text-base font-bold text-stone-900">Metode Pembayaran Berhasil Diperbarui!</h4>
            <p className="text-xs text-stone-500">
              Data transaksi faktur {payment.invoiceNumber} telah disinkronkan ke sistem dan struk resmi.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
            {/* Invoice & Patient Info Summary */}
            <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Pasien:</span>
                <span className="font-bold text-stone-900">
                  {payment.patientName} <span className="font-mono text-stone-400 font-normal">({payment.patientRm})</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Layanan:</span>
                <span className="font-medium text-rose-700">{payment.treatmentName}</span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-stone-200/60">
                <span className="text-stone-500">Metode Saat Ini:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-stone-700 bg-white px-2 py-0.5 rounded-lg border border-stone-200 font-mono text-[11px]">
                  {payment.paymentMethod || 'Belum Dipilih'}
                </span>
              </div>
            </div>

            {/* Select Payment Method */}
            <div>
              <label className="block font-bold text-stone-800 mb-2">
                Pilih Metode Pembayaran Baru <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'QRIS', label: 'QRIS Scan', icon: QrCode, color: 'text-purple-600', activeBg: 'border-purple-600 bg-purple-50/70 text-purple-900' },
                  { id: 'Cash', label: 'Tunai / Cash', icon: Banknote, color: 'text-emerald-600', activeBg: 'border-emerald-600 bg-emerald-50/70 text-emerald-900' },
                  { id: 'Debit', label: 'Debit / Kartu', icon: CreditCard, color: 'text-blue-600', activeBg: 'border-blue-600 bg-blue-50/70 text-blue-900' },
                  { id: 'Transfer', label: 'Transfer Bank', icon: Smartphone, color: 'text-indigo-600', activeBg: 'border-indigo-600 bg-indigo-50/70 text-indigo-900' }
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = method === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setMethod(item.id as PaymentMethod);
                        const firstCh = paymentChannels.find(c => c.isActive && c.type === item.id);
                        setSelectedChannelId(firstCh ? firstCh.id : '');
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? `${item.activeBg} font-bold shadow-xs ring-1 ring-rose-500/20`
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50/80 hover:border-stone-300'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mb-1.5 ${item.color}`} />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specific Payment Channel Picker */}
            {availableChannels.length > 0 && (
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Saluran / Rekening Klinik Terdaftar
                </label>
                <div className="space-y-1.5">
                  {availableChannels.map(ch => (
                    <label
                      key={ch.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        selectedChannelId === ch.id
                          ? 'border-rose-500 bg-rose-50/40 text-stone-900'
                          : 'border-stone-200 bg-stone-50/40 hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_channel"
                        value={ch.id}
                        checked={selectedChannelId === ch.id}
                        onChange={() => setSelectedChannelId(ch.id)}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs text-stone-900">{ch.name}</strong>
                          <span className="font-mono text-[10px] text-stone-500">{ch.provider}</span>
                        </div>
                        {ch.accountNumber && ch.accountNumber !== '-' && (
                          <div className="text-[11px] font-mono text-stone-700 mt-0.5">
                            {ch.accountNumber} <span className="text-stone-400 font-sans">({ch.accountHolder})</span>
                          </div>
                        )}
                        {ch.instructions && (
                          <p className="text-[10px] text-stone-400 mt-0.5">{ch.instructions}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Reference Number / Bukti Transaksi */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Nomor Referensi / Approval / Ref Transfer <span className="text-stone-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={e => setReferenceNumber(e.target.value)}
                placeholder={
                  method === 'QRIS'
                    ? 'Contoh: NMID-99218201 / Ref BCA'
                    : method === 'Debit'
                    ? 'Contoh: Approval Code: 492019 / Trace: 0012'
                    : method === 'Transfer'
                    ? 'Contoh: Bukti Transfer m-Banking / Rekening Pengirim'
                    : 'Catatan kasir tunai'
                }
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Status & Discount in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Status Pembayaran
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as PaymentStatus)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none font-medium"
                >
                  <option value="Lunas">Lunas (Selesai)</option>
                  <option value="Belum Dibayar">Belum Dibayar (Pending)</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Diskon / Potongan Promo (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 font-mono focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Notes / Catatan Kasir */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Catatan Kasir / Keterangan Tambahan
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Misal: Pasien minta bayar split QRIS atau konfirmasi bukti transfer..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Total Summary Footer */}
            <div className="rounded-xl border border-stone-200 bg-rose-50/40 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-500 block">Total Akhir Tagihan:</span>
                <span className="text-base font-bold text-rose-700 font-mono">
                  {formatRupiah(calculatedTotal)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-500 block">Metode Pengganti:</span>
                <span className="font-bold text-stone-800 text-xs">{method}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={handlePrintReceiptNow}
                className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-stone-700 hover:bg-stone-50 text-xs font-medium"
                title="Cetak struk setelah update"
              >
                <Printer className="h-4 w-4 text-stone-500" />
                <span>Cetak Ulang Struk</span>
              </button>

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
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
