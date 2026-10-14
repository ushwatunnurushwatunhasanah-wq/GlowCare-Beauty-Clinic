import React from 'react';
import { X, Printer, Sparkles, Clock, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QueueItem } from '../../types';

interface PrintQueueTicketModalProps {
  queueItem: QueueItem;
  onClose: () => void;
}

export const PrintQueueTicketModal: React.FC<PrintQueueTicketModalProps> = ({ queueItem, onClose }) => {
  const { settings } = useApp();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xs rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Toolbar */}
        <div className="no-print flex items-center justify-between border-b border-stone-100 bg-stone-50 px-4 py-3">
          <span className="text-xs font-bold text-stone-800">Tiket Antrian Pasien</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak Tiket</span>
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Ticket Print Body */}
        <div className="p-6 bg-white font-mono text-center text-stone-800 space-y-3 print-container">
          <div className="border-b border-dashed border-stone-300 pb-3">
            <h3 className="font-serif-display text-sm font-bold text-stone-900 uppercase">
              {settings.name}
            </h3>
            <p className="text-[10px] text-rose-700 italic font-sans">{settings.slogan}</p>
          </div>

          <div className="py-2">
            <span className="text-[10px] text-stone-500 uppercase tracking-widest block">
              NOMOR ANTRIAN ANDA
            </span>
            <span className="text-4xl font-extrabold text-stone-900 block my-1 font-mono tracking-tight">
              {queueItem.queueNumber}
            </span>
            <span className="text-[11px] text-stone-600 block font-sans font-bold">
              {queueItem.patientName}
            </span>
            <span className="text-[10px] text-stone-400 block font-mono">
              {queueItem.patientRm}
            </span>
          </div>

          <div className="border-t border-b border-dashed border-stone-300 py-2 text-[10px] text-stone-600 space-y-1 text-left font-sans">
            <div className="flex justify-between">
              <span>Dokter:</span>
              <strong className="text-stone-900">{queueItem.doctorName}</strong>
            </div>
            <div className="flex justify-between">
              <span>Layanan:</span>
              <strong className="text-rose-700">{queueItem.treatmentName}</strong>
            </div>
            <div className="flex justify-between">
              <span>Ruangan:</span>
              <span>{queueItem.counterRoom}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>Waktu Ambil:</span>
              <span>{queueItem.time} WIB</span>
            </div>
          </div>

          <div className="pt-2 text-[9px] text-stone-400 font-sans leading-tight">
            <p>Silakan menunggu di ruang tunggu ber-AC.</p>
            <p className="mt-0.5">Nomor Anda akan dipanggil lewat layar dan pengeras suara.</p>
          </div>
        </div>

        <div className="no-print p-3 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-stone-200 bg-white px-4 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
