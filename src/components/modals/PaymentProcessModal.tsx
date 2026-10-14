import React, { useState } from 'react';
import { X, CreditCard, Banknote, QrCode, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Payment, PaymentMethod } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface PaymentProcessModalProps {
  payment: Payment;
  onClose: () => void;
}

export const PaymentProcessModal: React.FC<PaymentProcessModalProps> = ({ payment, onClose }) => {
  const { updatePaymentMethod, paymentChannels, openModal } = useApp();
  const [method, setMethod] = useState<PaymentMethod>(payment.paymentMethod || 'QRIS');
  const [discount, setDiscount] = useState<number>(payment.discount || 0);
  const [cashAmount, setCashAmount] = useState<number>(payment.totalAmount);
  const [referenceNumber, setReferenceNumber] = useState<string>(payment.referenceNumber || '');

  const subtotal = payment.subtotal || payment.treatmentPrice;
  const totalAfterDiscount = Math.max(0, subtotal - discount);
  const change = Math.max(0, cashAmount - totalAfterDiscount);

  // Active channel for this method
  const matchedChannel = paymentChannels.find(c => c.isActive && c.type === method);

  const handleCompletePayment = () => {
    updatePaymentMethod(payment.id, method, {
      status: 'Lunas',
      discount,
      totalAmount: totalAfterDiscount,
      referenceNumber: referenceNumber.trim(),
      paymentChannelName: matchedChannel?.name
    });

    onClose();
    // Open print receipt modal immediately
    openModal('print-receipt', {
      ...payment,
      discount,
      totalAmount: totalAfterDiscount,
      paymentMethod: method,
      paymentChannelName: matchedChannel?.name,
      referenceNumber: referenceNumber.trim(),
      status: 'Lunas',
      paidAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-rose-50/50 px-6 py-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-rose-600" />
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Proses Pembayaran Kasir</h3>
              <p className="text-[11px] text-stone-500 font-mono">{payment.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Patient and Treatment details */}
          <div className="rounded-xl bg-stone-50 p-3.5 space-y-1">
            <div className="flex justify-between">
              <span className="text-stone-500">Nama Pasien:</span>
              <strong className="text-stone-900">{payment.patientName} ({payment.patientRm})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Layanan Treatment:</span>
              <strong className="text-rose-700">{payment.treatmentName}</strong>
            </div>
            <div className="flex justify-between pt-1 border-t border-stone-200/60 font-mono">
              <span className="text-stone-500">Tarif Dasar:</span>
              <span>{formatRupiah(payment.treatmentPrice)}</span>
            </div>
          </div>

          {/* Discount Field */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Diskon Promosi / Voucher (Rp)
            </label>
            <input
              type="number"
              value={discount}
              onChange={e => setDiscount(Number(e.target.value))}
              placeholder="0"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 font-mono focus:border-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block font-semibold text-stone-700 mb-2">
              Pilih Metode Pembayaran
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['QRIS', 'Cash', 'Debit', 'Transfer'] as PaymentMethod[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                    method === m
                      ? 'border-rose-600 bg-rose-50/80 text-rose-900 font-bold shadow-xs'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {m === 'QRIS' && <QrCode className="h-4 w-4 mb-1 text-purple-600" />}
                  {m === 'Cash' && <Banknote className="h-4 w-4 mb-1 text-emerald-600" />}
                  {m === 'Debit' && <CreditCard className="h-4 w-4 mb-1 text-blue-600" />}
                  {m === 'Transfer' && <Smartphone className="h-4 w-4 mb-1 text-indigo-600" />}
                  <span className="text-[11px]">{m}</span>
                </button>
              ))}
            </div>
          </div>

          {/* QRIS Display simulation if QRIS selected */}
          {method === 'QRIS' && (
            <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 text-center">
              <span className="text-[11px] font-bold text-purple-900 block mb-2">
                Scan QRIS GlowCare Clinic (BCA / Gopay / OVO / ShopeePay)
              </span>
              <div className="mx-auto w-32 h-32 bg-white p-2 rounded-xl border border-stone-200 flex items-center justify-center shadow-xs">
                <QrCode className="w-24 h-24 text-stone-900" />
              </div>
              <span className="text-[10px] text-stone-500 mt-2 block font-mono">
                {matchedChannel?.accountNumber || 'NMID: ID1020268892182'}
              </span>
            </div>
          )}

          {/* Transfer Bank Display if Transfer selected */}
          {method === 'Transfer' && matchedChannel && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3.5 space-y-1">
              <span className="text-indigo-950 font-bold block">{matchedChannel.name}</span>
              <div className="flex justify-between text-xs text-stone-700 font-mono">
                <span>No. Rekening:</span>
                <strong>{matchedChannel.accountNumber}</strong>
              </div>
              <div className="flex justify-between text-xs text-stone-600">
                <span>Atas Nama:</span>
                <span>{matchedChannel.accountHolder}</span>
              </div>
            </div>
          )}

          {/* Cash input simulation if Cash selected */}
          {method === 'Cash' && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-900 font-semibold">Uang Diterima Pasien:</span>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={e => setCashAmount(Number(e.target.value))}
                  className="w-36 rounded-lg border border-stone-200 bg-white px-2 py-1 text-right font-mono font-bold"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-stone-600 pt-1 border-t border-emerald-100">
                <span>Kembalian:</span>
                <strong className="font-mono text-emerald-700">{formatRupiah(change)}</strong>
              </div>
            </div>
          )}

          {/* Reference Number Field */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              No. Referensi / Bukti Bayar / Kode Transaksi <span className="text-stone-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={e => setReferenceNumber(e.target.value)}
              placeholder="Contoh: Ref-882910 atau Approval EDC"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2 text-xs text-stone-900 font-mono focus:border-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Grand Total */}
          <div className="pt-2 flex items-center justify-between border-t border-stone-100 text-sm">
            <span className="font-semibold text-stone-600">Total Tagihan Bersih:</span>
            <span className="font-bold text-lg text-rose-700 font-mono">
              {formatRupiah(totalAfterDiscount)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200 px-4 py-2 text-stone-600 hover:bg-stone-50 font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleCompletePayment}
              className="rounded-xl bg-rose-600 px-5 py-2 text-white font-semibold hover:bg-rose-700 shadow-sm"
            >
              Selesaikan Pembayaran & Cetak Struk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
