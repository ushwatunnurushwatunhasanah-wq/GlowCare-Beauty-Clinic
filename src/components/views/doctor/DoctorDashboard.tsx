import React from 'react';
import {
  Users,
  Calendar,
  Clock,
  Sparkles,
  Stethoscope,
  Star,
  CheckCircle2,
  ChevronRight,
  Volume2,
  FileEdit,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { formatDateId } from '../../../utils/formatters';

interface DoctorDashboardProps {
  onNavigate: (menuKey: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onNavigate }) => {
  const {
    currentUser,
    doctors,
    queues,
    appointments,
    medicalRecords,
    currentDoctor: contextDoctor,
    isMyDoctorData,
    callQueue,
    openModal,
    ratings
  } = useApp();

  // Active doctor matching the logged-in doctor account
  const currentDoctor = contextDoctor || doctors[0];
  const doctorName = currentDoctor.name;

  // 1. Filter queues strictly for this doctor
  const doctorQueues = queues.filter(q => isMyDoctorData(q.doctorId, q.doctorName));
  const waitingQueues = doctorQueues.filter(q => q.status === 'Menunggu' || q.status === 'Dipanggil');
  const servedToday = doctorQueues.filter(q => q.status === 'Selesai');
  const activePatient = doctorQueues.find(q => q.status === 'Sedang Dilayani' || q.status === 'Dipanggil');

  // 2. Filter appointments strictly for this doctor
  const doctorAppointments = appointments.filter(a => isMyDoctorData(a.doctorId, a.doctorName));

  // 3. Filter reviews strictly for this doctor
  const doctorReviews = ratings.filter(r => isMyDoctorData(undefined, r.doctorName));
  const avgRating =
    doctorReviews.length > 0
      ? (doctorReviews.reduce((sum, r) => sum + r.overallRating, 0) / doctorReviews.length).toFixed(1)
      : currentDoctor.rating
      ? currentDoctor.rating.toFixed(1)
      : '5.0';

  // 4. Medical records strictly examined by this doctor
  const doctorMedicalRecords = medicalRecords.filter(m =>
    isMyDoctorData(m.doctorId, m.doctorName)
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-900 via-rose-800 to-stone-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={currentDoctor.avatar}
              alt={doctorName}
              className="h-16 w-16 rounded-2xl object-cover border-2 border-white/40 shadow-md shrink-0 bg-white/10"
              onError={e => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256';
              }}
            />
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-rose-200 border border-white/10">
                <Stethoscope className="h-3.5 w-3.5 text-rose-300" />
                <span>Portal Medis: {currentDoctor.specialization}</span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight">
                Selamat Bertugas, {doctorName}!
              </h2>
              <p className="mt-1 text-xs text-rose-100/80 max-w-xl">
                Jadwal Praktik: <strong className="text-white">{currentDoctor.schedule.days.join(', ')}</strong> ({currentDoctor.schedule.hours} WIB) · No. SIP: <span className="font-mono text-white/90">{currentDoctor.sipNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal('medical-exam-form')}
              className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-rose-950 shadow-sm hover:bg-rose-50 cursor-pointer active:scale-95 transition-all"
            >
              + Input Pemeriksaan Pasien
            </button>
          </div>
        </div>
      </div>

      {/* Mini KPI Cards (Isolated for this Doctor) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-stone-500">Antrian Pasien Saya</span>
          <p className="mt-2 text-2xl font-bold text-amber-600 font-mono">
            {waitingQueues.length} Pasien
          </p>
          <span className="text-[10px] text-stone-400 mt-1 block">Menunggu giliran konsultasi</span>
        </div>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-stone-500">Riwayat Pemeriksaan</span>
          <p className="mt-2 text-2xl font-bold text-emerald-600 font-mono">
            {doctorMedicalRecords.length} Pasien
          </p>
          <span className="text-[10px] text-emerald-600 mt-1 block">Rekam medis tercatat oleh Anda</span>
        </div>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-stone-500">Jadwal Appointment Saya</span>
          <p className="mt-2 text-2xl font-bold text-stone-900 font-mono">
            {doctorAppointments.length} Jadwal
          </p>
          <span className="text-[10px] text-stone-400 mt-1 block">Khusus dengan {doctorName.split(',')[0]}</span>
        </div>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-stone-500">Rating Kepuasan Anda</span>
          <p className="mt-2 text-2xl font-bold text-amber-500 font-mono flex items-center gap-1">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            {avgRating} <span className="text-xs text-stone-400">/ 5.0</span>
          </p>
          <span className="text-[10px] text-stone-400 mt-1 block">
            Berdasarkan {doctorReviews.length} ulasan pasien Anda
          </span>
        </div>
      </div>

      {/* Active consultation card (if patient called or served) */}
      {activePatient && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white font-mono font-bold text-xl shadow-xs">
              {activePatient.queueNumber}
            </div>
            <div>
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                Pasien di Ruang Konsultasi {doctorName.split(',')[0]}
              </span>
              <h3 className="text-base font-bold text-stone-900">{activePatient.patientName}</h3>
              <p className="text-xs text-stone-500">
                No. RM: <strong className="font-mono text-stone-700">{activePatient.patientRm}</strong> · Treatment:{' '}
                <span className="text-rose-700 font-medium">{activePatient.treatmentName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => callQueue(activePatient)}
              className="flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 shadow-xs cursor-pointer"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Panggil Lagi</span>
            </button>
            <button
              onClick={() => openModal('medical-exam-form', activePatient)}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 cursor-pointer"
            >
              <FileEdit className="h-3.5 w-3.5" />
              <span>Isi Rekam Perawatan & Tindakan</span>
            </button>
          </div>
        </div>
      )}

      {/* Queue and reviews grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Antrian Hari Ini Khusus Dokter Ini */}
        <div className="lg:col-span-7 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Daftar Pasien Menunggu ({doctorName.split(',')[0]})
              </h3>
              <p className="text-xs text-stone-500">
                Pasien yang teregistrasi untuk jadwal pemeriksaan Anda
              </p>
            </div>
            <button
              onClick={() => onNavigate('pasien-hari-ini')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {waitingQueues.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
                <Stethoscope className="h-6 w-6 mx-auto mb-2 text-stone-300" />
                Tidak ada pasien dalam antrian {doctorName} saat ini.
              </div>
            ) : (
              waitingQueues.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/50 p-3 hover:bg-rose-50/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-700 font-mono font-bold text-xs">
                      {item.queueNumber}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">{item.patientName}</h4>
                      <p className="text-[11px] text-stone-500">
                        {item.treatmentName} · {item.counterRoom}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => callQueue(item)}
                      className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 cursor-pointer"
                    >
                      Panggil
                    </button>
                    <button
                      onClick={() => openModal('medical-exam-form', item)}
                      className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-700 cursor-pointer"
                    >
                      Periksa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Komentar Pasien Khusus Dokter Ini */}
        <div className="lg:col-span-5 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
          <div className="pb-3 border-b border-stone-100">
            <h3 className="text-sm font-bold text-stone-900">Ulasan Khusus {doctorName.split(',')[0]}</h3>
            <p className="text-xs text-stone-500">Feedback langsung dari pasien yang telah Anda tangani</p>
          </div>

          <div className="mt-4 space-y-3">
            {doctorReviews.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
                <Star className="h-6 w-6 mx-auto mb-2 text-stone-300" />
                Belum ada ulasan pasien untuk {doctorName}.
              </div>
            ) : (
              doctorReviews.slice(0, 3).map(r => (
                <div key={r.id} className="rounded-xl border border-stone-100 bg-stone-50/40 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900">{r.patientName}</span>
                    <span className="text-amber-500 font-bold font-mono">★ {r.overallRating}.0</span>
                  </div>
                  <p className="mt-1.5 text-xs text-stone-600 italic">"{r.comment}"</p>
                  <span className="text-[10px] text-stone-400 mt-2 block">{formatDateId(r.date)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
