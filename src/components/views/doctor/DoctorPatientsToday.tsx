import React, { useState } from 'react';
import {
  Users,
  Search,
  Volume2,
  FileEdit,
  Clock,
  CheckCircle,
  Eye,
  Sparkles,
  Stethoscope
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const DoctorPatientsToday: React.FC = () => {
  const { queues, callQueue, openModal, currentUser, doctors, currentDoctor: contextDoctor, isMyDoctorData } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Find current doctor
  const currentDoctor = contextDoctor || doctors[0];

  const doctorQueues = queues.filter(q => isMyDoctorData(q.doctorId, q.doctorName));

  const filteredQueues = doctorQueues.filter(
    q =>
      q.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.queueNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.treatmentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <span>Daftar Pasien Konsultasi Hari Ini</span>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
              {currentDoctor.name.split(',')[0]}
            </span>
          </h2>
          <p className="text-xs text-stone-500">
            Daftar antrian pasien yang dijadwalkan khusus untuk konsultasi dan tindakan bersama Anda hari ini
          </p>
        </div>

        <span className="text-xs font-semibold text-stone-600 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
          Total Pasien Anda: <strong className="text-rose-700 font-mono">{doctorQueues.length}</strong>
        </span>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
        <div className="relative max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nomor antrian atau nama pasien Anda..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-600 font-semibold">
              <th className="py-3.5 px-4">No. Antrian</th>
              <th className="py-3.5 px-4">Nama Pasien & RM</th>
              <th className="py-3.5 px-4">Rencana Treatment</th>
              <th className="py-3.5 px-4">Jam Kedatangan</th>
              <th className="py-3.5 px-4">Ruangan</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Tindakan Dokter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredQueues.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-stone-400">
                  <Stethoscope className="h-8 w-8 mx-auto mb-2 text-stone-300" />
                  <p className="font-semibold text-stone-600">Tidak ada antrian pasien untuk {currentDoctor.name}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {searchQuery ? 'Coba ubah kata kunci pencarian.' : 'Pasien baru dari loket pendaftaran akan otomatis masuk ke daftar ini.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredQueues.map(item => (
                <tr key={item.id} className="hover:bg-rose-50/20 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-sm text-rose-600">
                    {item.queueNumber}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-stone-900 block">{item.patientName}</span>
                    <span className="font-mono text-[11px] text-stone-400">{item.patientRm}</span>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-stone-800">
                    {item.treatmentName}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-stone-500">
                    {item.time} WIB
                  </td>

                  <td className="py-3.5 px-4 text-stone-600">
                    {item.counterRoom || 'Ruang Konsultasi'}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.status === 'Sedang Dilayani'
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : item.status === 'Dipanggil'
                          ? 'bg-blue-100 text-blue-800'
                          : item.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => callQueue(item)}
                        className="flex items-center gap-1 rounded-lg border border-stone-200 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 cursor-pointer"
                        title="Panggil Pasien"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>Panggil</span>
                      </button>
                      <button
                        onClick={() => openModal('medical-exam-form', item)}
                        className="flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-700 cursor-pointer"
                        title="Isi Rekam Medis & Tindakan"
                      >
                        <FileEdit className="h-3.5 w-3.5" />
                        <span>Periksa</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
