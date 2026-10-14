import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Clock,
  UserCheck,
  Sparkles,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Appointment, AppointmentStatus } from '../../../types';
import { formatDateId, formatRupiah } from '../../../utils/formatters';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    updateAppointmentStatus,
    openModal,
    currentUser,
    currentDoctor,
    isMyDoctorData
  } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isDoctorRole = currentUser?.role === 'dokter';

  const statuses: { key: string; label: string }[] = [
    { key: 'all', label: 'Semua Status' },
    { key: 'Menunggu', label: 'Menunggu' },
    { key: 'Dikonfirmasi', label: 'Dikonfirmasi' },
    { key: 'Datang', label: 'Datang' },
    { key: 'Sedang Dilayani', label: 'Sedang Dilayani' },
    { key: 'Selesai', label: 'Selesai' },
    { key: 'Dibatalkan', label: 'Dibatalkan' },
  ];

  const filteredAppointments = appointments.filter(a => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchSearch =
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.treatmentName.toLowerCase().includes(searchQuery.toLowerCase());

    if (isDoctorRole && currentDoctor) {
      return matchStatus && matchSearch && isMyDoctorData(a.doctorId, a.doctorName);
    }

    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Dikonfirmasi':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Datang':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Sedang Dilayani':
        return 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse';
      case 'Selesai':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Menunggu':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Dibatalkan':
        return 'bg-stone-100 text-stone-600 border-stone-200';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <span>Jadwal Appointment & Booking Pasien</span>
            {isDoctorRole && currentDoctor && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                {currentDoctor.name.split(',')[0]}
              </span>
            )}
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800 font-mono">
              {filteredAppointments.length} Jadwal
            </span>
          </h2>
          <p className="text-xs text-stone-500">
            {isDoctorRole && currentDoctor
              ? `Jadwal janji temu konsultasi dan treatment khusus untuk ${currentDoctor.name}`
              : 'Reservasi sesi konsultasi dan perawatan, pemilihan dokter, tanggal, jam, dan konfirmasi kedatangan'}
          </p>
        </div>

        <button
          onClick={() => openModal('new-appointment', isDoctorRole && currentDoctor ? { doctorId: currentDoctor.id, doctorName: currentDoctor.name } : undefined)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>+ Buat Appointment Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {statuses.map(st => (
              <button
                key={st.key}
                onClick={() => setFilterStatus(st.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                  filterStatus === st.key
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari pasien / dokter / treatment..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Appointments List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.map(item => (
          <div
            key={item.id}
            className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-rose-200 transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>

                <div className="flex items-center gap-1 text-xs font-mono font-bold text-stone-700 bg-stone-50 px-2.5 py-1 rounded-lg">
                  <Clock className="h-3.5 w-3.5 text-rose-600" />
                  <span>{item.time} WIB</span>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-base text-stone-900 leading-snug">{item.patientName}</h3>
                <p className="text-xs text-rose-700 font-semibold mt-0.5">{item.treatmentName}</p>
                <p className="text-[11px] text-stone-500 mt-0.5">Dokter: {item.doctorName}</p>
              </div>

              {item.complaint && (
                <div className="mt-3 rounded-xl bg-stone-50 p-2.5 text-xs text-stone-600">
                  <span className="font-semibold text-stone-800 block text-[10px] uppercase">Keluhan Awal:</span>
                  <p className="italic mt-0.5 line-clamp-2">"{item.complaint}"</p>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <CalendarDays className="h-3.5 w-3.5 text-stone-400" />
                  <span>{formatDateId(item.date)}</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <Phone className="h-3.5 w-3.5 text-stone-400" />
                  <span>{item.patientPhone}</span>
                </div>
              </div>
            </div>

            {/* Change Status Buttons */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-[10px] text-stone-400 uppercase font-bold">Ubah Status:</span>
              <div className="flex items-center gap-1">
                {item.status === 'Menunggu' && (
                  <button
                    onClick={() => updateAppointmentStatus(item.id, 'Dikonfirmasi')}
                    className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100"
                  >
                    Konfirmasi
                  </button>
                )}
                {item.status === 'Dikonfirmasi' && (
                  <button
                    onClick={() => updateAppointmentStatus(item.id, 'Datang')}
                    className="px-2 py-1 rounded-md bg-purple-50 text-purple-700 font-semibold hover:bg-purple-100"
                  >
                    Pasien Tiba
                  </button>
                )}
                {item.status === 'Datang' && (
                  <button
                    onClick={() => updateAppointmentStatus(item.id, 'Sedang Dilayani')}
                    className="px-2 py-1 rounded-md bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100"
                  >
                    Layani
                  </button>
                )}
                {item.status === 'Sedang Dilayani' && (
                  <button
                    onClick={() => updateAppointmentStatus(item.id, 'Selesai')}
                    className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100"
                  >
                    Selesai
                  </button>
                )}
                {item.status !== 'Dibatalkan' && item.status !== 'Selesai' && (
                  <button
                    onClick={() => updateAppointmentStatus(item.id, 'Dibatalkan')}
                    className="px-1.5 py-1 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50"
                    title="Batalkan Booking"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
