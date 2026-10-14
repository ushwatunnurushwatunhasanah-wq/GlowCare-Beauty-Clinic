import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckSquare,
  Square,
  MinusSquare,
  AlertTriangle,
  X,
  CheckCircle2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Patient } from '../../../types';
import { formatDateId } from '../../../utils/formatters';

export const PatientsView: React.FC = () => {
  const {
    patients,
    deletePatient,
    deleteMultiplePatients,
    openModal,
    currentUser,
    currentDoctor,
    isMyDoctorData,
    appointments,
    medicalRecords,
    queues
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterAllergy, setFilterAllergy] = useState<string>('all');

  const isDoctorRole = currentUser?.role === 'dokter';
  const [doctorPatientScope, setDoctorPatientScope] = useState<'mine' | 'all'>('mine');

  // Identify patients associated with this specific doctor
  const doctorPatientIds = useMemo(() => {
    if (!currentDoctor) return new Set<string>();
    const ids = new Set<string>();
    appointments.forEach(a => {
      if (isMyDoctorData(a.doctorId, a.doctorName)) {
        if (a.patientId) ids.add(a.patientId);
      }
    });
    medicalRecords.forEach(m => {
      if (isMyDoctorData(m.doctorId, m.doctorName)) {
        if (m.patientId) ids.add(m.patientId);
        if (m.patientRm) ids.add(m.patientRm);
      }
    });
    queues.forEach(q => {
      if (isMyDoctorData(q.doctorId, q.doctorName)) {
        if (q.patientId) ids.add(q.patientId);
      }
    });
    return ids;
  }, [currentDoctor, appointments, medicalRecords, queues, isMyDoctorData]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Confirmation modal state (handles both single & multi-delete)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'multiple';
    patient?: Patient;
    count?: number;
  }>({
    isOpen: false,
    type: 'single'
  });

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch =
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.rmNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.nik.includes(searchQuery) ||
        patient.phone.includes(searchQuery);

      const matchesGender = filterGender === 'all' || patient.gender === filterGender;
      const matchesAllergy =
        filterAllergy === 'all' ||
        (filterAllergy === 'has_allergy' && patient.allergies && !patient.allergies.toLowerCase().includes('tidak')) ||
        (filterAllergy === 'no_allergy' && (!patient.allergies || patient.allergies.toLowerCase().includes('tidak')));

      if (isDoctorRole && currentDoctor && doctorPatientScope === 'mine') {
        const isMyPatient = doctorPatientIds.has(patient.id) || doctorPatientIds.has(patient.rmNumber);
        return matchesSearch && matchesGender && matchesAllergy && isMyPatient;
      }

      return matchesSearch && matchesGender && matchesAllergy;
    });
  }, [patients, searchQuery, filterGender, filterAllergy, isDoctorRole, currentDoctor, doctorPatientScope, doctorPatientIds]);

  // Reset to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterGender, filterAllergy]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));

  // Clamping current page if data shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Sliced data for the current page
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredPatients.length);
  const paginatedPatients = useMemo(() => {
    return filteredPatients.slice(startIndex, endIndex);
  }, [filteredPatients, startIndex, endIndex]);

  // Selection helpers on current page
  const currentPageIds = useMemo(() => paginatedPatients.map(p => p.id), [paginatedPatients]);
  const isCurrentPageAllSelected =
    currentPageIds.length > 0 && currentPageIds.every(id => selectedIds.includes(id));
  const isCurrentPagePartiallySelected =
    currentPageIds.some(id => selectedIds.includes(id)) && !isCurrentPageAllSelected;

  const handleSelectAllCurrentPageToggle = () => {
    if (isCurrentPageAllSelected) {
      // Unselect current page
      setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      // Select all in current page
      setSelectedIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds(filteredPatients.map(p => p.id));
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Open single delete modal
  const handleOpenSingleDelete = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      type: 'single',
      patient
    });
  };

  // Open multi delete modal
  const handleOpenMultiDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      type: 'multiple',
      count: selectedIds.length
    });
  };

  // Confirm delete action
  const handleConfirmDelete = () => {
    if (deleteModal.type === 'single' && deleteModal.patient) {
      const p = deleteModal.patient;
      deletePatient(p.id);
      setSelectedIds(prev => prev.filter(id => id !== p.id));
      showToast(`Pasien ${p.name} (${p.rmNumber}) berhasil dihapus.`);
    } else if (deleteModal.type === 'multiple') {
      const count = selectedIds.length;
      deleteMultiplePatients(selectedIds);
      setSelectedIds([]);
      showToast(`${count} data pasien berhasil dihapus.`);
    }

    setDeleteModal({ isOpen: false, type: 'single' });
  };

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  const selectedPatientsList = useMemo(() => {
    return patients.filter(p => selectedIds.includes(p.id));
  }, [patients, selectedIds]);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <span>{isDoctorRole ? 'Riwayat & Arsip Pasien' : 'Data Master Pasien'}</span>
            {isDoctorRole && currentDoctor && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                {currentDoctor.name.split(',')[0]}
              </span>
            )}
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 font-mono">
              {filteredPatients.length} Pasien
            </span>
          </h2>
          <p className="text-xs text-stone-500">
            {isDoctorRole && currentDoctor
              ? `Daftar rekam riwayat pasien yang berkonsultasi dan mendapatkan tindakan medis oleh ${currentDoctor.name}`
              : 'Kelola database rekam medis, profil identitas, dan riwayat alergi pasien klinik'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleOpenMultiDelete}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition-all animate-in fade-in"
              title="Hapus pasien yang dicentang"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus Terpilih ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={() => openModal('patient-form')}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Pasien Baru</span>
          </button>
        </div>
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

      {/* Multi-Delete Active Banner */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-3.5 px-4 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-600 text-white font-bold text-xs shadow-xs">
              {selectedIds.length}
            </div>
            <div>
              <span className="text-xs font-bold text-stone-900 block">
                {selectedIds.length} Pasien Dipilih
              </span>
              <span className="text-[11px] text-stone-500">
                {selectedIds.length < filteredPatients.length ? (
                  <>
                    Memilih {selectedIds.length} pasien.{' '}
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="font-semibold text-rose-700 underline hover:text-rose-800 ml-1"
                    >
                      Pilih semua {filteredPatients.length} pasien
                    </button>
                  </>
                ) : (
                  'Seluruh pasien pada hasil filter telah dipilih.'
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearSelection}
              className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Batalkan Pilihan
            </button>
            <button
              onClick={handleOpenMultiDelete}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus Massal ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
        {isDoctorRole && currentDoctor && (
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-700">Filter Cakupan Pasien:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDoctorPatientScope('mine')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    doctorPatientScope === 'mine'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Pasien Ditangani Saya ({doctorPatientIds.size} Pasien)
                </button>
                <button
                  type="button"
                  onClick={() => setDoctorPatientScope('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    doctorPatientScope === 'all'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Semua Pasien Klinik ({patients.length})
                </button>
              </div>
            </div>
            <span className="text-[11px] text-stone-400">
              {doctorPatientScope === 'mine'
                ? `Menampilkan riwayat pasien ${currentDoctor.name}`
                : 'Menampilkan seluruh master pasien klinik GlowCare'}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan Nama, No. RM, NIK, atau No. HP..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Filter Gender */}
          <div className="sm:col-span-3">
            <select
              value={filterGender}
              onChange={e => setFilterGender(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs text-stone-700 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="all">Semua Jenis Kelamin</option>
              <option value="Perempuan">Perempuan</option>
              <option value="Laki-laki">Laki-laki</option>
            </select>
          </div>

          {/* Filter Alergi */}
          <div className="sm:col-span-3">
            <select
              value={filterAllergy}
              onChange={e => setFilterAllergy(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs text-stone-700 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="all">Semua Status Alergi</option>
              <option value="has_allergy">Ada Riwayat Alergi</option>
              <option value="no_allergy">Tanpa Alergi</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
          <span>
            Menampilkan <strong>{filteredPatients.length}</strong> dari <strong>{patients.length}</strong> pasien
            {selectedIds.length > 0 && (
              <span className="text-rose-600 font-semibold ml-2">
                ({selectedIds.length} dipilih)
              </span>
            )}
          </span>
          {(searchQuery || filterGender !== 'all' || filterAllergy !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterGender('all');
                setFilterAllergy('all');
              }}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Patient Table with Pagination */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-600 font-semibold select-none">
                {/* Checkbox Header for Select All on Current Page */}
                <th className="py-3.5 pl-4 pr-2 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAllCurrentPageToggle}
                    className="p-1 rounded text-stone-400 hover:text-stone-700 focus:outline-none transition-colors"
                    title={
                      isCurrentPageAllSelected
                        ? 'Batalkan pilihan halaman ini'
                        : 'Pilih semua di halaman ini'
                    }
                  >
                    {isCurrentPageAllSelected ? (
                      <CheckSquare className="h-4 w-4 text-rose-600" />
                    ) : isCurrentPagePartiallySelected ? (
                      <MinusSquare className="h-4 w-4 text-rose-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-3">No. RM & Nama</th>
                <th className="py-3.5 px-4">Identitas & Kontak</th>
                <th className="py-3.5 px-4">Riwayat Alergi & Catatan</th>
                <th className="py-3.5 px-4 text-center">Kunjungan</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    Tidak ditemukan data pasien sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                paginatedPatients.map(patient => {
                  const isChecked = selectedIds.includes(patient.id);
                  return (
                    <tr
                      key={patient.id}
                      onClick={() =>
                        setSelectedIds(prev =>
                          prev.includes(patient.id)
                            ? prev.filter(id => id !== patient.id)
                            : [...prev, patient.id]
                        )
                      }
                      className={`cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-rose-50/50 hover:bg-rose-50/80'
                          : 'hover:bg-rose-50/20'
                      }`}
                    >
                      {/* Checkbox Row Cell */}
                      <td
                        className="py-3.5 pl-4 pr-2 w-10 text-center"
                        onClick={e => handleToggleRow(patient.id, e)}
                      >
                        <button
                          type="button"
                          className="p-1 rounded text-stone-400 hover:text-stone-700 focus:outline-none"
                        >
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-rose-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-800 font-bold shrink-0 text-xs">
                            {patient.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-stone-900 block">{patient.name}</span>
                            <span className="font-mono text-[11px] text-rose-700 font-medium">
                              {patient.rmNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-stone-600">
                        <div>
                          <span>
                            {patient.gender} · {patient.birthDate ? `${patient.birthDate}` : '-'}
                          </span>
                          <div className="text-stone-500 font-mono text-[11px] mt-0.5">
                            {patient.phone}
                          </div>
                          <div className="text-stone-400 text-[10px] truncate max-w-xs">
                            {patient.address}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {patient.allergies && !patient.allergies.toLowerCase().includes('tidak') ? (
                          <div className="flex items-center gap-1.5 text-red-700 bg-red-50 rounded-md p-1.5 border border-red-100 max-w-xs">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-[11px] line-clamp-1">{patient.allergies}</span>
                          </div>
                        ) : (
                          <span className="text-stone-400 text-[11px]">Tidak ada alergi</span>
                        )}
                        {patient.specialNotes && (
                          <p className="text-stone-500 text-[10px] mt-1 line-clamp-1 italic">
                            "{patient.specialNotes}"
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-mono font-semibold text-stone-800 text-xs">
                          {patient.totalVisits || 1}x
                        </span>
                        <span className="block text-[10px] text-stone-400">
                          {patient.lastVisit ? `Terakhir: ${formatDateId(patient.lastVisit)}` : 'Pasien baru'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openModal('patient-detail', patient)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                            title="Lihat Detail & Riwayat Pasien"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openModal('patient-form', patient)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-rose-600"
                            title="Edit Pasien"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={e => handleOpenSingleDelete(patient, e)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                            title="Hapus Data Pasien"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200/80 bg-stone-50/50 px-4 py-3 text-xs">
          {/* Left: Entries Info & PageSize Selector */}
          <div className="flex flex-wrap items-center gap-3 text-stone-600">
            <span>
              Menampilkan{' '}
              <strong className="text-stone-900 font-semibold">
                {filteredPatients.length === 0 ? 0 : startIndex + 1}
              </strong>{' '}
              -{' '}
              <strong className="text-stone-900 font-semibold">{endIndex}</strong> dari{' '}
              <strong className="text-stone-900 font-semibold">{filteredPatients.length}</strong>{' '}
              pasien
            </span>

            <div className="flex items-center gap-1.5 border-l border-stone-200 pl-3">
              <span className="text-stone-500">Tampilkan:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-semibold text-stone-700 focus:border-rose-500 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-stone-500">per halaman</span>
            </div>
          </div>

          {/* Right: Page Navigation Controls */}
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Halaman Pertama"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>

            {/* Prev Page */}
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 px-1">
              {getPageNumbers().map((pg, idx) =>
                typeof pg === 'number' ? (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`h-7 min-w-7 px-2 rounded-lg text-xs font-semibold transition-all ${
                      currentPage === pg
                        ? 'bg-rose-600 text-white shadow-xs font-bold'
                        : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {pg}
                  </button>
                ) : (
                  <span key={idx} className="px-1 text-stone-400 select-none">
                    ...
                  </span>
                )
              )}
            </div>

            {/* Next Page */}
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Halaman Selanjutnya"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Halaman Terakhir"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Delete & Multi-Delete */}
      {deleteModal.isOpen && (
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
                    {deleteModal.type === 'single'
                      ? 'Konfirmasi Hapus Pasien'
                      : 'Konfirmasi Hapus Massal (Multidelete)'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Tindakan ini permanen dan menghapus catatan data pasien
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteModal({ isOpen: false, type: 'single' })}
                className="rounded-xl p-1.5 text-stone-400 hover:bg-white hover:text-stone-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs">
              {deleteModal.type === 'single' && deleteModal.patient ? (
                <div className="space-y-3">
                  <p className="text-stone-600">
                    Apakah Anda yakin ingin menghapus data pasien berikut dari database klinik?
                  </p>

                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-800 font-bold shrink-0 text-sm">
                      {deleteModal.patient.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-900 text-sm truncate">
                        {deleteModal.patient.name}
                      </h4>
                      <span className="font-mono text-rose-700 font-semibold block text-xs">
                        {deleteModal.patient.rmNumber}
                      </span>
                      <span className="text-stone-500 text-[11px] block mt-0.5">
                        NIK: {deleteModal.patient.nik} · {deleteModal.patient.phone}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800 flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      Data pasien yang dihapus tidak dapat dipulihkan kembali. Pastikan riwayat kunjungan sudah selesai.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-stone-600">
                    Anda akan menghapus <strong>{selectedIds.length} data pasien terpilih</strong> secara bersamaan:
                  </p>

                  {/* List of selected patients */}
                  <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-xl border border-stone-200 bg-stone-50/50 p-2.5">
                    {selectedPatientsList.map(p => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-stone-200/80 text-[11px]"
                      >
                        <span className="font-medium text-stone-800 truncate mr-2">
                          {p.name}
                        </span>
                        <span className="font-mono text-rose-700 font-semibold shrink-0">
                          {p.rmNumber}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-[11px] text-red-800 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                    <span>
                      Peringatan: Seluruh data rekam identitas dari <strong>{selectedIds.length} pasien</strong> ini akan dihapus dari sistem klinik secara permanen.
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: false, type: 'single' })}
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
                  <span>
                    {deleteModal.type === 'single'
                      ? 'Ya, Hapus Pasien'
                      : `Ya, Hapus ${selectedIds.length} Pasien`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
