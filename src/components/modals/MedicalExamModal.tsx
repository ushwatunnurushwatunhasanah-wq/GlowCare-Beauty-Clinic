import React, { useState } from 'react';
import { X, Stethoscope, Sparkles, CheckCircle2, Calendar, Edit3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MedicalExamModalProps {
  initialData?: any;
  onClose: () => void;
}

export const MedicalExamModal: React.FC<MedicalExamModalProps> = ({ initialData, onClose }) => {
  const {
    patients,
    doctors,
    treatments,
    addMedicalRecord,
    updateMedicalRecord,
    updateQueueStatus,
    currentUser,
    currentDoctor
  } = useApp();

  const isEditing = Boolean(initialData && initialData.id && (initialData.id.startsWith('mr-') || initialData.examResult));

  const defaultDoctorId = initialData?.doctorId || (currentUser?.role === 'dokter' && currentDoctor ? currentDoctor.id : doctors[0]?.id || '');
  const [patientId, setPatientId] = useState(initialData?.patientId || patients[0]?.id || '');
  const [doctorId, setDoctorId] = useState(defaultDoctorId);
  const [treatmentId, setTreatmentId] = useState(initialData?.treatmentId || treatments[0]?.id || '');
  const [recordDate, setRecordDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);

  // Doctor exam fields
  const [complaints, setComplaints] = useState(
    initialData?.complaints || 'Keluhan kulit kusam dan muncul jerawat papula pasca siklus haid.'
  );
  const [skinCondition, setSkinCondition] = useState(
    initialData?.skinCondition || 'Kulit dehidrasi, pori-pori tersumbat di T-zone, lesi papula eritematosa aktif.'
  );
  const [examResult, setExamResult] = useState(
    initialData?.examResult || 'Acne vulgaris ringan - sedang, skin barrier sedikit terganggu.'
  );
  const [actionTaken, setActionTaken] = useState(
    initialData?.actionTaken || 'Pembersihan antiseptik, ekstraksi komedo aseptik, sterilisasi ozon HF, pengaplikasian serum penenang.'
  );
  const [productsUsed, setProductsUsed] = useState(
    initialData?.productsUsed || 'Gentle Low pH Cleanser, Salicylic Serum 2%, Calming Centella Cream, Sunscreen SPF 50.'
  );
  const [doctorNotes, setDoctorNotes] = useState(
    initialData?.doctorNotes || 'Prosedur berjalan lancar tanpa reaksi alergi, kemerahan transien ringan.'
  );
  const [followUpAdvice, setFollowUpAdvice] = useState(
    initialData?.followUpAdvice || 'Wajib reapply sunscreen tiap 3 jam, hindari eksfoliasi scrub fisik selama 5 hari, perbanyak hidrasi.'
  );
  const [nextControlDate, setNextControlDate] = useState(initialData?.nextControlDate || '2026-10-05');
  const [durationMinutes, setDurationMinutes] = useState(initialData?.treatmentDurationMinutes || 60);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const pat = patients.find(p => p.id === patientId) || patients[0];
    const doc = doctors.find(d => d.id === doctorId) || doctors[0];
    const trt = treatments.find(t => t.id === treatmentId) || treatments[0];

    if (isEditing && initialData?.id) {
      updateMedicalRecord(initialData.id, {
        patientId: pat.id,
        patientName: pat.name,
        patientRm: pat.rmNumber,
        doctorId: doc.id,
        doctorName: doc.name,
        treatmentId: trt.id,
        treatmentName: trt.name,
        date: recordDate,
        complaints,
        skinCondition,
        examResult,
        actionTaken,
        productsUsed,
        doctorNotes,
        followUpAdvice,
        nextControlDate,
        treatmentDurationMinutes: durationMinutes
      });
    } else {
      addMedicalRecord({
        patientId: pat.id,
        patientName: pat.name,
        patientRm: pat.rmNumber,
        doctorId: doc.id,
        doctorName: doc.name,
        treatmentId: trt.id,
        treatmentName: trt.name,
        date: recordDate,
        complaints,
        skinCondition,
        examResult,
        actionTaken,
        productsUsed,
        doctorNotes,
        followUpAdvice,
        nextControlDate,
        treatmentDurationMinutes: durationMinutes
      });

      // If originated from active queue, update queue status to Selesai
      if (initialData?.id && initialData.queueNumber) {
        updateQueueStatus(initialData.id, 'Selesai');
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 bg-rose-50/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white shadow-xs">
              {isEditing ? <Edit3 className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                {isEditing ? 'Edit Data Rekam Perawatan Pasien' : 'Formulir Rekam Medis & Tindakan Dokter'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {isEditing
                  ? `Memperbarui rincian klinis dan tindakan perawatan medis`
                  : 'Pencatatan klinis hasil konsultasi dermatologi & estetika'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
          {/* Patient, Doctor, Treatment Selector & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nama Pasien</label>
              <select
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.rmNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Dokter Pemeriksa</label>
              <select
                value={doctorId}
                onChange={e => setDoctorId(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Jenis Treatment</label>
              <select
                value={treatmentId}
                onChange={e => setTreatmentId(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              >
                {treatments.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Tanggal Rekam</label>
              <input
                type="date"
                required
                value={recordDate}
                onChange={e => setRecordDate(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Item 1: Keluhan Pasien */}
          <div>
            <label className="block font-semibold text-stone-800 mb-1">
              1. Keluhan Utama Pasien *
            </label>
            <textarea
              rows={2}
              required
              value={complaints}
              onChange={e => setComplaints(e.target.value)}
              placeholder="Contoh: Kulit kering, breakout jerawat di pipi, flek hitam..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Item 2 & 3: Kondisi Kulit & Hasil Pemeriksaan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                2. Kondisi Kulit (Pemeriksaan Fisik) *
              </label>
              <textarea
                rows={2}
                required
                value={skinCondition}
                onChange={e => setSkinCondition(e.target.value)}
                placeholder="Jenis kulit, hiperpigmentasi, vaskularisasi..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                3. Hasil Pemeriksaan (Diagnosis Dokter) *
              </label>
              <textarea
                rows={2}
                required
                value={examResult}
                onChange={e => setExamResult(e.target.value)}
                placeholder="Diagnosis klinis dermatologis..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Item 4 & 5: Tindakan & Produk */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                4. Tindakan Medis yang Dilakukan *
              </label>
              <textarea
                rows={2}
                required
                value={actionTaken}
                onChange={e => setActionTaken(e.target.value)}
                placeholder="Rincian prosedur tindakan treatment..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                5. Produk & Bahan yang Digunakan
              </label>
              <textarea
                rows={2}
                value={productsUsed}
                onChange={e => setProductsUsed(e.target.value)}
                placeholder="Serum, ampul, cream anestesi, masker..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Item 6 & 7: Catatan Dokter & Saran Perawatan Lanjutan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                6. Catatan Observasi / Catatan Dokter
              </label>
              <textarea
                rows={2}
                value={doctorNotes}
                onChange={e => setDoctorNotes(e.target.value)}
                placeholder="Catatan observasi medis..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                7. Saran Perawatan Lanjutan (Homecare) *
              </label>
              <textarea
                rows={2}
                required
                value={followUpAdvice}
                onChange={e => setFollowUpAdvice(e.target.value)}
                placeholder="Edukasi anjuran skincare di rumah..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Item 8: Jadwal Kontrol Berikutnya & Durasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                8. Jadwal Kontrol Berikutnya *
              </label>
              <input
                type="date"
                required
                value={nextControlDate}
                onChange={e => setNextControlDate(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                Durasi Treatment (Menit)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200 px-4 py-2.5 text-stone-600 hover:bg-stone-50 font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-rose-600 px-6 py-2.5 text-white shadow-sm hover:bg-rose-700 font-semibold active:scale-95 transition-all cursor-pointer"
            >
              {isEditing ? 'Simpan Perubahan Rekam' : 'Simpan Rekam Perawatan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
