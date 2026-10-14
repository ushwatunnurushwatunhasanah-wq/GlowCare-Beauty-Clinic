import React, { useState, useMemo } from 'react';
import {
  FileText,
  Calendar,
  UserCheck,
  Stethoscope,
  Plus,
  Search,
  Sparkles,
  Clock,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { MedicalRecord } from '../../../types';
import { formatDateId } from '../../../utils/formatters';

export const MedicalRecordsView: React.FC = () => {
  const {
    medicalRecords,
    deleteMedicalRecord,
    openModal,
    doctors,
    currentUser,
    currentDoctor,
    isMyDoctorData
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const isDoctorRole = currentUser?.role === 'dokter';

  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    record?: MedicalRecord;
  }>({
    isOpen: false
  });

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    return medicalRecords.filter(record => {
      const matchesSearch =
        record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.patientRm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.treatmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.complaints.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.skinCondition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.examResult.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.actionTaken.toLowerCase().includes(searchQuery.toLowerCase());

      // If doctor role, strictly isolate to this doctor
      if (isDoctorRole && currentDoctor) {
        return matchesSearch && isMyDoctorData(record.doctorId, record.doctorName);
      }

      const matchesDoctor = selectedDoctor === 'all' || record.doctorName === selectedDoctor;
      return matchesSearch && matchesDoctor;
    });
  }, [medicalRecords, searchQuery, selectedDoctor, isDoctorRole, currentDoctor, isMyDoctorData]);

  const handleOpenDelete = (record: MedicalRecord) => {
    setDeleteModal({
      isOpen: true,
      record
    });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.record) {
      const rec = deleteModal.record;
      deleteMedicalRecord(rec.id);
      showToast(`Rekam perawatan untuk pasien ${rec.patientName} (${rec.patientRm}) berhasil dihapus.`);
    }
    setDeleteModal({ isOpen: false });
  };

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  const uniqueDoctors = useMemo(() => {
    const list = new Set<string>();
    medicalRecords.forEach(m => {
      if (m.doctorName) list.add(m.doctorName);
    });
    doctors.forEach(d => {
      if (d.name) list.add(d.name);
    });
    return Array.from(list);
  }, [medicalRecords, doctors]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <span>Rekam Perawatan Klinis (Medical Records)</span>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 font-mono">
              {filteredRecords.length} Rekam Medis
            </span>
            {isDoctorRole && currentDoctor && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                {currentDoctor.name.split(',')[0]}
              </span>
            )}
          </h2>
          <p className="text-xs text-stone-500">
            {isDoctorRole && currentDoctor
              ? `Arsip rekam medis, diagnosis, dan tindakan klinis pasien yang diperiksa oleh ${currentDoctor.name}`
              : 'Arsip kronologis pemeriksaan kulit, tindakan medis dermatologi, dan rencana kontrol berkala'}
          </p>
        </div>

        <button
          onClick={() => openModal('medical-exam-form', isDoctorRole && currentDoctor ? { doctorId: currentDoctor.id, doctorName: currentDoctor.name } : undefined)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>+ Catat Rekam Medis Baru</span>
        </button>
      </div>

      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama pasien, No. RM, keluhan kulit, tindakan medis, atau dokter..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {isDoctorRole && currentDoctor ? (
            <div className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-semibold flex items-center gap-2 shrink-0">
              <Stethoscope className="h-4 w-4 text-rose-600" />
              <span>Dokter Pemeriksa: {currentDoctor.name}</span>
            </div>
          ) : (
            <div className="w-full sm:w-64">
              <select
                value={selectedDoctor}
                onChange={e => setSelectedDoctor(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs text-stone-700 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="all">Semua Dokter Pemeriksa</option>
                {uniqueDoctors.map(doc => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
          <span>
            Menampilkan <strong>{filteredRecords.length}</strong> dari <strong>{medicalRecords.length}</strong> rekam perawatan
          </span>

          {(searchQuery !== '' || selectedDoctor !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDoctor('all');
              }}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Timeline View of Medical Records */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-rose-200">
        {filteredRecords.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-400 text-xs">
            Belum ada rekam perawatan yang cocok dengan pencarian.
          </div>
        ) : (
          filteredRecords.map(record => (
            <div key={record.id} className="relative group">
              {/* Timeline Pin Indicator */}
              <div className="absolute -left-6 sm:-left-8 top-1 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 border-white bg-rose-600 text-white shadow-sm group-hover:scale-110 transition-transform">
                <Sparkles className="h-3 w-3" />
              </div>

              {/* Record Card */}
              <div className="rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6 shadow-xs hover:border-rose-200 transition-all">
                {/* Header: Date, Doctor, Patient, and Action Buttons (Edit & Delete) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-stone-100 gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                      {formatDateId(record.date)}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">{record.patientName}</h3>
                      <span className="text-[11px] font-mono text-rose-700 font-semibold">{record.patientRm}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 mr-2">
                      <Stethoscope className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                      <span className="font-medium text-stone-700">{record.doctorName}</span>
                      <span>·</span>
                      <span className="font-semibold text-rose-700 bg-rose-50/80 px-2 py-0.5 rounded-md">
                        {record.treatmentName}
                      </span>
                    </div>

                    {/* Action Buttons: Edit and Delete */}
                    <div className="flex items-center gap-1.5 border-l border-stone-200 pl-2">
                      <button
                        type="button"
                        onClick={() => openModal('medical-exam-form', record)}
                        className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-2xs transition-colors cursor-pointer"
                        title="Edit data rekam perawatan"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-stone-500 group-hover:text-rose-600" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDelete(record)}
                        className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-2xs transition-colors cursor-pointer"
                        title="Hapus data rekam perawatan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Body: Clinical Examination & Treatment Action */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left Column: Keluhan & Kondisi Kulit */}
                  <div className="space-y-3">
                    <div className="rounded-xl bg-stone-50 p-3">
                      <span className="font-bold text-stone-800 uppercase tracking-wider text-[10px] block mb-1">
                        1. Keluhan Utama Pasien
                      </span>
                      <p className="text-stone-700 leading-relaxed">{record.complaints}</p>
                    </div>

                    <div className="rounded-xl bg-rose-50/40 p-3 border border-rose-100/50">
                      <span className="font-bold text-rose-900 uppercase tracking-wider text-[10px] block mb-1">
                        2. Kondisi Kulit & Diagnosis Dokter
                      </span>
                      <p className="text-stone-800 leading-relaxed font-medium">{record.skinCondition}</p>
                      <p className="text-[11px] text-stone-500 mt-1 italic">Hasil: {record.examResult}</p>
                    </div>
                  </div>

                  {/* Right Column: Tindakan Medis & Produk */}
                  <div className="space-y-3">
                    <div className="rounded-xl bg-stone-50 p-3">
                      <span className="font-bold text-stone-800 uppercase tracking-wider text-[10px] block mb-1">
                        3. Tindakan Medis yang Dilakukan
                      </span>
                      <p className="text-stone-700 leading-relaxed">{record.actionTaken}</p>
                      {record.productsUsed && (
                        <p className="text-[11px] text-stone-500 mt-1.5 pt-1.5 border-t border-stone-200/60">
                          <strong>Bahan & Produk:</strong> {record.productsUsed}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl bg-amber-50/40 p-3 border border-amber-100/60">
                      <span className="font-bold text-amber-900 uppercase tracking-wider text-[10px] block mb-1">
                        4. Catatan & Anjuran Skincare di Rumah
                      </span>
                      <p className="text-stone-700 leading-relaxed">{record.followUpAdvice}</p>
                      {record.doctorNotes && (
                        <p className="text-[11px] text-stone-500 mt-1 italic">
                          Catatan: {record.doctorNotes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Next Control Date Footer */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 text-stone-600">
                    <Calendar className="h-3.5 w-3.5 text-rose-600" />
                    <span>Jadwal Kontrol Berikutnya:</span>
                    <strong className="text-rose-700 font-mono font-bold">
                      {record.nextControlDate ? formatDateId(record.nextControlDate) : 'Sesuai kebutuhan'}
                    </strong>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-stone-400">
                      Durasi Treatment: ~{record.treatmentDurationMinutes || 60} menit
                    </span>

                    <button
                      type="button"
                      onClick={() => openModal('medical-exam-form', record)}
                      className="text-rose-600 hover:text-rose-700 font-semibold text-xs flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>Ubah Rekam Medis</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal for Delete Record */}
      {deleteModal.isOpen && deleteModal.record && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 bg-red-50/60 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    Konfirmasi Hapus Rekam Perawatan
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Tindakan ini menghapus arsip rekam medis dari sistem
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteModal({ isOpen: false })}
                className="rounded-xl p-1.5 text-stone-400 hover:bg-white hover:text-stone-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs">
              <p className="text-stone-600">
                Apakah Anda yakin ingin menghapus data rekam perawatan klinis pasien berikut?
              </p>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 font-bold shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-rose-700 font-bold text-xs">
                      {deleteModal.record.patientRm}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {formatDateId(deleteModal.record.date)}
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm truncate mt-0.5">
                    {deleteModal.record.patientName}
                  </h4>
                  <span className="text-stone-500 text-[11px] block mt-0.5 truncate">
                    {deleteModal.record.doctorName} · {deleteModal.record.treatmentName}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Perhatian: Data diagnosis, tindakan medis, dan riwayat klinis yang dihapus tidak dapat dipulihkan kembali.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: false })}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Ya, Hapus Rekam Perawatan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
