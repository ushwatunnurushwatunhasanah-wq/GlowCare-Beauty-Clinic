import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  Smartphone,
  Plus,
  Trash2,
  CheckCircle2,
  Receipt,
  User,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, PaymentStatus } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface NewPaymentModalProps {
  onClose: () => void;
}

export const NewPaymentModal: React.FC<NewPaymentModalProps> = ({ onClose }) => {
  const { patients, treatments, products, paymentChannels, addPayment, openModal, currentUser } = useApp();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>(treatments[0]?.id || '');
  const [selectedProducts, setSelectedProducts] = useState<
    { productId: string; productName: string; quantity: number; price: number }[]
  >([]);
  const [discount, setDiscount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [status, setStatus] = useState<PaymentStatus>('Belum Dibayar');
  const [notes, setNotes] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const selectedTreatment = treatments.find(t => t.id === selectedTreatmentId) || treatments[0];

  const treatmentPrice = selectedTreatment ? selectedTreatment.price : 0;
  const productsTotal = selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const subtotal = treatmentPrice + productsTotal;
  const totalAmount = Math.max(0, subtotal - discount);

  const handleAddProduct = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const existingIndex = selectedProducts.findIndex(p => p.productId === productId);
    if (existingIndex >= 0) {
      const copy = [...selectedProducts];
      copy[existingIndex].quantity += 1;
      setSelectedProducts(copy);
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          productId: prod.id,
          productName: prod.name,
          quantity: 1,
          price: prod.price
        }
      ]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient || !selectedTreatment) return;

    const matchedChannel = paymentChannels.find(c => c.isActive && c.type === method);

    const newPay = addPayment({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientRm: selectedPatient.rmNumber,
      treatmentId: selectedTreatment.id,
      treatmentName: selectedTreatment.name,
      treatmentPrice,
      additionalProducts: selectedProducts,
      subtotal,
      discount,
      tax: 0,
      totalAmount,
      paymentMethod: method,
      paymentChannelName: matchedChannel?.name,
      referenceNumber: referenceNumber.trim() || undefined,
      status,
      paidAt: status === 'Lunas' ? new Date().toISOString().replace('T', ' ').substring(0, 19) : undefined,
      cashierName: currentUser ? currentUser.name : 'Kasir GlowCare',
      notes: notes.trim() || undefined
    });

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
      if (status === 'Lunas') {
        openModal('print-receipt', newPay);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-gradient-to-r from-rose-50 to-pink-50/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Tambah Tagihan / Pembayaran Baru</h3>
              <p className="text-[11px] text-stone-500">
                Buat invoice pembayaran treatment & produk skincare langsung di kasir
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
            <h4 className="text-base font-bold text-stone-900">Tagihan Pembayaran Berhasil Dibuat!</h4>
            <p className="text-xs text-stone-500">
              Transaksi telah masuk ke sistem kasir klinik GlowCare.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
            {/* Pilih Pasien */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                Pilih Pasien <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none font-medium"
              >
                {patients.map(pat => (
                  <option key={pat.id} value={pat.id}>
                    {pat.name} - {pat.rmNumber} ({pat.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Pilih Layanan Treatment */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                Layanan Treatment <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedTreatmentId}
                onChange={e => setSelectedTreatmentId(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none font-medium"
              >
                {treatments.map(trt => (
                  <option key={trt.id} value={trt.id}>
                    {trt.name} ({trt.category}) - {formatRupiah(trt.price)}
                  </option>
                ))}
              </select>
            </div>

            {/* Produk Skincare Tambahan (Opsional) */}
            <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-700">Tambah Produk Skincare</span>
                <select
                  onChange={e => {
                    if (e.target.value) {
                      handleAddProduct(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] text-stone-700 focus:border-rose-500 focus:outline-none"
                >
                  <option value="" disabled>+ Pilih Produk...</option>
                  {products.map(prod => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({formatRupiah(prod.price)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProducts.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {selectedProducts.map(p => (
                    <div
                      key={p.productId}
                      className="flex items-center justify-between bg-white p-2 rounded-lg border border-stone-200 text-[11px]"
                    >
                      <div className="flex-1 truncate mr-2">
                        <span className="font-medium text-stone-800">{p.productName}</span>
                        <span className="text-stone-400 block font-mono text-[10px]">
                          {formatRupiah(p.price)} x {p.quantity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-900">
                          {formatRupiah(p.price * p.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(p.productId)}
                          className="text-stone-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Metode Pembayaran */}
            <div>
              <label className="block font-bold text-stone-800 mb-1.5">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Cash', 'QRIS', 'Debit', 'Transfer'] as PaymentMethod[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                      method === m
                        ? 'border-rose-600 bg-rose-50/80 text-rose-900 font-bold shadow-xs'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {m === 'Cash' && <Banknote className="h-4 w-4 mb-1 text-emerald-600" />}
                    {m === 'QRIS' && <QrCode className="h-4 w-4 mb-1 text-purple-600" />}
                    {m === 'Debit' && <CreditCard className="h-4 w-4 mb-1 text-blue-600" />}
                    {m === 'Transfer' && <Smartphone className="h-4 w-4 mb-1 text-indigo-600" />}
                    <span className="text-[11px]">{m}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status & Diskon */}
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
                  <option value="Belum Dibayar">Belum Dibayar (Pending)</option>
                  <option value="Lunas">Lunas (Selesai Langsung)</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Diskon Promo / Voucher (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 font-mono focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* No. Referensi */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                No. Referensi / Bukti Transfer / Trace EDC <span className="text-stone-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={e => setReferenceNumber(e.target.value)}
                placeholder="Contoh: REF-BCA-9821 / Trace: 0012"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Catatan */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Catatan Kasir
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Keterangan promo, voucher diskon, atau request pasien"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Ringkasan Total Tagihan */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-500 block">Total Tagihan Bersih:</span>
                <span className="text-base font-bold text-rose-700 font-mono">
                  {formatRupiah(totalAmount)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-500 block">Metode Dipilih:</span>
                <span className="font-bold text-stone-800">{method}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
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
                <Plus className="h-4 w-4" />
                <span>Simpan Tagihan Baru</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
