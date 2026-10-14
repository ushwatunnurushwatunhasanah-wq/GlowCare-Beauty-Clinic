import React from 'react';
import {
  ClipboardList,
  Clock,
  CreditCard,
  Plus,
  Users,
  Calendar,
  Sparkles,
  Printer
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { formatRupiah } from '../../../utils/formatters';

interface ReceptionDashboardProps {
  onNavigate: (menuKey: string) => void;
}

export const ReceptionDashboard: React.FC<ReceptionDashboardProps> = ({ onNavigate }) => {
  const { queues, appointments, payments, registrations, openModal } = useApp();

  const waitingCount = queues.filter(q => q.status === 'Menunggu' || q.status === 'Dipanggil').length;
  const todayRegCount = registrations.length + 18;
  const pendingPaymentCount = payments.filter(p => p.status === 'Belum Dibayar').length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-900 via-rose-800 to-stone-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-rose-200 border border-white/10">
              <ClipboardList className="h-3.5 w-3.5 text-rose-300" />
              <span>Front Office & Pendaftaran Pasien</span>
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight">
              Selamat Bertugas di Meja Pendaftaran!
            </h2>
            <p className="mt-1 text-xs text-rose-100/80 max-w-xl">
              Sambut pasien dengan ramah dan profesional. Siapkan berkas pendaftaran dan nomor antrian konsultasi dokter.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal('new-registration')}
              className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-rose-950 shadow-sm hover:bg-rose-50"
            >
              + Pendaftaran Pasien Baru
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Antrian Menunggu Saat Ini</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-amber-600 font-mono">
            {waitingCount}
          </p>
          <span className="text-[11px] text-stone-400 mt-1 block">Pasien di ruang tunggu loket</span>
        </div>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Total Pendaftaran Hari Ini</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <ClipboardList className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-stone-900 font-mono">
            {todayRegCount}
          </p>
          <span className="text-[11px] text-stone-400 mt-1 block">Pasien baru & pasien kontrol ulang</span>
        </div>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Tagihan Menunggu Pembayaran</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-purple-700 font-mono">
            {pendingPaymentCount}
          </p>
          <span className="text-[11px] text-purple-600 mt-1 block">Pasien siap cetak struk di kasir</span>
        </div>
      </div>

      {/* Quick Action Hub for Receptionist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Antrian Terkini */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="text-sm font-bold text-stone-900">Antrian Berjalan</h3>
            <button
              onClick={() => onNavigate('antrian')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              Buka Papan Antrian →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {queues.slice(0, 4).map(q => (
              <div
                key={q.id}
                className="flex items-center justify-between p-3 rounded-xl border border-stone-100 bg-stone-50/50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                    {q.queueNumber}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{q.patientName}</h4>
                    <p className="text-[11px] text-stone-500">{q.doctorName} · {q.treatmentName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-700 font-medium">
                    {q.status}
                  </span>
                  <button
                    onClick={() => openModal('print-queue-ticket', q)}
                    className="p-1 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600"
                    title="Cetak Nomor Antrian"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pendaftaran Cepat Pasien */}
        <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Alur Standar Pelayanan Loket</h3>
            <p className="text-xs text-stone-500 mt-1">
              Panduan langkah demi langkah saat pasien tiba di klinik GlowCare:
            </p>

            <ol className="mt-4 space-y-2 text-xs text-stone-700 list-decimal list-inside">
              <li>Tanyakan apakah pasien sudah pernah berobat sebelumnya (pasien lama / baru).</li>
              <li>Pilih dokter spesialis yang sedang bertugas sesuai keluhan kulit.</li>
              <li>Tentukan jenis treatment yang diinginkan atau pilih konsultasi awal.</li>
              <li>Cetak nomor antrian dan slip bukti registrasi pasien.</li>
              <li>Arahkan pasien ke ruang tunggu yang nyaman dengan minuman selamat datang.</li>
            </ol>
          </div>

          <div className="mt-6 pt-4 border-t border-rose-100 flex items-center justify-between">
            <button
              onClick={() => openModal('new-registration')}
              className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white text-center hover:bg-rose-700 shadow-xs"
            >
              + Buka Formulir Pendaftaran
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
