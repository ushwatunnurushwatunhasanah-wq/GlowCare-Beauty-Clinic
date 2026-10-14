import React, { useState } from 'react';
import { X, Sparkles, User, Stethoscope, Clock, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateRMNumber } from '../../utils/formatters';

interface RegisterModalProps {
  onClose: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ onClose }) => {
  const { patients, doctors, treatments, addPatient, addRegistration, addQueueItem, openModal } = useApp();

  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  // New patient fields
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [gender, setGender] = useState<'Perempuan' | 'Laki-laki'>('Perempuan');
  const [birthDate, setBirthDate] = useState('1998-05-12');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [allergies, setAllergies] = useState('Tidak ada');
  const [specialNotes, setSpecialNotes] = useState('');

  // Visit details
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [treatmentId, setTreatmentId] = useState(treatments[0]?.id || '');
  const [room, setRoom] = useState('Ruang Konsultasi 1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetPatient = patients.find(p => p.id === selectedPatientId);

    if (!isExistingPatient) {
      if (!name || !phone) {
        alert('Mohon isi nama dan nomor telepon pasien.');
        return;
      }
      const newRm = generateRMNumber(patients);
      targetPatient = addPatient({
        rmNumber: newRm,
        nik: nik || '327301' + Math.floor(1000000000 + Math.random() * 9000000000),
        name,
        gender,
        birthDate,
        phone,
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        address: address || 'Jakarta',
        allergies: allergies || 'Tidak ada',
        specialNotes
      });
    }

    if (!targetPatient) {
      alert('Pasien tidak ditemukan.');
      return;
    }

    const selectedDoc = doctors.find(d => d.id === doctorId) || doctors[0];
    const selectedTrt = treatments.find(t => t.id === treatmentId) || treatments[0];
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toISOString().split('T')[0];

    // Create Queue Item
    const newQueue = addQueueItem({
      registrationId: `reg-${Date.now()}`,
      patientId: targetPatient.id,
      patientName: targetPatient.name,
      patientRm: targetPatient.rmNumber,
      doctorId: selectedDoc.id,
      doctorName: selectedDoc.name,
      treatmentId: selectedTrt.id,
      treatmentName: selectedTrt.name,
      status: 'Menunggu',
      date: nowDate,
      time: nowTime,
      counterRoom: room
    });

    // Create Registration log
    addRegistration({
      patientId: targetPatient.id,
      patientName: targetPatient.name,
      patientRm: targetPatient.rmNumber,
      doctorId: selectedDoc.id,
      doctorName: selectedDoc.name,
      treatmentId: selectedTrt.id,
      treatmentName: selectedTrt.name,
      queueNumber: newQueue.queueNumber,
      registrationDate: nowDate,
      registrationTime: nowTime,
      registeredBy: 'Loket Pendaftaran GlowCare',
      paymentStatus: 'Belum Dibayar'
    });

    onClose();
    // Open print ticket modal for receptionist convenience
    openModal('print-queue-ticket', newQueue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-rose-50/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Pendaftaran Pasien & Antrian Baru</h3>
              <p className="text-[11px] text-stone-500">Buat nomor antrian otomatis dan rekam kunjungan loket</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Patient Type Switcher */}
          <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => setIsExistingPatient(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                !isExistingPatient ? 'bg-white text-rose-700 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              + Pasien Baru (Buat No. RM Baru)
            </button>
            <button
              type="button"
              onClick={() => setIsExistingPatient(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isExistingPatient ? 'bg-white text-rose-700 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Cari Pasien Lama Terdaftar
            </button>
          </div>

          {isExistingPatient ? (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Pilih Pasien Terdaftar
              </label>
              <select
                required
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              >
                <option value="">-- Pilih dari database pasien --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.rmNumber}) - {p.phone}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nama Lengkap Pasien *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Contoh: Siti Rahmawati"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nomor WhatsApp / HP *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0812-XXXX-XXXX"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">NIK (KTP)</label>
                  <input
                    type="text"
                    value={nik}
                    onChange={e => setNik(e.target.value)}
                    placeholder="16 digit NIK..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                  >
                    <option value="Perempuan">Perempuan</option>
                    <option value="Laki-laki">Laki-laki</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Riwayat Alergi (Obat/Skincare)</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={e => setAllergies(e.target.value)}
                    placeholder="Contoh: Alergi seafood, benzoyl peroxide"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Alamat Tinggal</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Jl. Senopati No. 42, Jakarta Selatan"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Consultation & Treatment Assignment */}
          <div className="pt-3 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-900 mb-3">Tujuan Kunjungan & Poli Spesialis</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Dokter Spesialis Yang Bertugas</label>
                <select
                  value={doctorId}
                  onChange={e => setDoctorId(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Pilihan Layanan Treatment</label>
                <select
                  value={treatmentId}
                  onChange={e => setTreatmentId(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                >
                  {treatments.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Rp {t.price.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">Ruangan Perawatan / Poli</label>
                <input
                  type="text"
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
            >
              Daftarkan & Cetak Antrian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
