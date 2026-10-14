import React, { useState } from 'react';
import { X, CalendarDays, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NewAppointmentModalProps {
  onClose: () => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ onClose }) => {
  const { patients, doctors, treatments, addAppointment, currentUser, currentDoctor } = useApp();

  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const defaultDoctorId = currentUser?.role === 'dokter' && currentDoctor ? currentDoctor.id : doctors[0]?.id || '';
  const [doctorId, setDoctorId] = useState(defaultDoctorId);
  const [treatmentId, setTreatmentId] = useState(treatments[0]?.id || '');
  const [date, setDate] = useState('2026-09-28');
  const [time, setTime] = useState('11:00');
  const [complaint, setComplaint] = useState('Konsultasi keluhan kulit kusam dan jadwal sesi treatment lanjutan.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPatient = patients.find(p => p.id === patientId) || patients[0];
    const selectedDoctor = doctors.find(d => d.id === doctorId) || doctors[0];
    const selectedTreatment = treatments.find(t => t.id === treatmentId) || treatments[0];

    addAppointment({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientPhone: selectedPatient.phone,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      treatmentId: selectedTreatment.id,
      treatmentName: selectedTreatment.name,
      treatmentPrice: selectedTreatment.price,
      date,
      time,
      status: 'Dikonfirmasi',
      complaint
    });

    alert(`Appointment untuk ${selectedPatient.name} pada ${date} pukul ${time} WIB berhasil dijadwalkan!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-100 bg-rose-50/50 px-6 py-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-rose-600" />
            <h3 className="font-bold text-stone-900 text-sm">Booking Appointment Baru</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Pilih Pasien Terdaftar *</label>
            <select
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.rmNumber}) - {p.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Dokter Spesialis *</label>
              <select
                value={doctorId}
                onChange={e => setDoctorId(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Layanan Treatment *</label>
              <select
                value={treatmentId}
                onChange={e => setTreatmentId(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              >
                {treatments.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Tanggal Reservasi *</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Jam Kedatangan *</label>
              <input
                type="time"
                required
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Catatan / Keluhan Awal Pasien</label>
            <textarea
              rows={2}
              value={complaint}
              onChange={e => setComplaint(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200 px-4 py-2 font-semibold text-stone-600 hover:bg-stone-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-rose-600 px-5 py-2 font-semibold text-white hover:bg-rose-700 shadow-sm"
            >
              Jadwalkan Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
