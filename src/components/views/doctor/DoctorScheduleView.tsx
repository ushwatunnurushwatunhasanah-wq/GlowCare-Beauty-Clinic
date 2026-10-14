import React from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
  Building,
  UserCheck,
  Stethoscope,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const DoctorScheduleView: React.FC = () => {
  const { doctors, currentUser, currentDoctor: contextDoctor } = useApp();

  const currentDoctor = contextDoctor || doctors[0];

  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const activeDaysSet = new Set(currentDoctor.schedule.days);

  const scheduleSlots = daysOfWeek.map(day => {
    const isPracticeDay = activeDaysSet.has(day);
    return {
      day,
      hours: isPracticeDay ? `${currentDoctor.schedule.hours} WIB` : 'Libur Praktik',
      room: isPracticeDay
        ? `Ruang Konsultasi Medis & Treatment (${currentDoctor.name.split(',')[0]})`
        : '-',
      quota: isPracticeDay ? '15 Pasien / Hari' : '-',
      status: isPracticeDay ? 'Aktif' : 'Libur'
    };
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
          <span>Jadwal Praktik & Ruangan Konsultasi</span>
          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
            {currentDoctor.name.split(',')[0]}
          </span>
        </h2>
        <p className="text-xs text-stone-500">
          Alokasi jadwal praktik mingguan, jam konsultasi, ruang tindakan treatment, dan kuota appointment Anda
        </p>
      </div>

      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-4 pb-4 border-b border-stone-100">
          <img
            src={currentDoctor.avatar}
            alt={currentDoctor.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256';
            }}
            className="h-16 w-16 rounded-2xl object-cover border border-rose-100 shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div>
            <h3 className="font-bold text-base text-stone-900">{currentDoctor.name}</h3>
            <p className="text-xs text-rose-700 font-semibold">{currentDoctor.specialization}</p>
            <p className="text-[11px] text-stone-400 font-mono mt-0.5">{currentDoctor.sipNumber}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-stone-500 font-mono">
              <span>Akun Login: {currentDoctor.email}</span>
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {scheduleSlots.map((slot, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-xs transition-colors ${
                slot.status === 'Aktif'
                  ? 'border-stone-200/80 bg-white hover:border-rose-200 shadow-2xs'
                  : 'border-stone-100 bg-stone-50/50 text-stone-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-stone-900 w-20">{slot.day}</span>
                <span className="font-mono text-stone-700">{slot.hours}</span>
              </div>

              <div className="hidden sm:block text-stone-600 font-medium">
                {slot.room}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-stone-500">{slot.quota}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    slot.status === 'Aktif'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {slot.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
