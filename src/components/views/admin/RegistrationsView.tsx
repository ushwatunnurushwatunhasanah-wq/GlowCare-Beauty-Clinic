import React, { useState, useMemo, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  Plus,
  Printer,
  Calendar,
  Clock,
  UserCheck,
  Sparkles,
  Trash2,
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
  ChevronsRight,
  Filter,
  FileDown
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Registration } from '../../../types';
import { formatDateId } from '../../../utils/formatters';
import { downloadRegistrationPdf } from '../../../utils/registrationPdf';

export const RegistrationsView: React.FC = () => {
  const { registrations, deleteRegistration, deleteMultipleRegistrations, openModal, settings } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Confirmation modal state (Single & Multiple Delete)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'multiple';
    registration?: Registration;
    count?: number;
  }>({
    isOpen: false,
    type: 'single'
  });

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      const matchesSearch =
        r.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.patientRm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.treatmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.queueNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPayment =
        filterPaymentStatus === 'all' ||
        (filterPaymentStatus === 'paid' && r.paymentStatus === 'Lunas') ||
        (filterPaymentStatus === 'unpaid' && r.paymentStatus !== 'Lunas');

      return matchesSearch && matchesPayment;
    });
  }, [registrations, searchQuery, filterPaymentStatus]);

  // Reset to page 1 on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterPaymentStatus]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredRegistrations.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredRegistrations.length);
  const paginatedRegistrations = useMemo(() => {
    return filteredRegistrations.slice(startIndex, endIndex);
  }, [filteredRegistrations, startIndex, endIndex]);

  // Selection helpers for current page
  const currentPageIds = useMemo(
    () => paginatedRegistrations.map(r => r.id),
    [paginatedRegistrations]
  );
  const isCurrentPageAllSelected =
    currentPageIds.length > 0 && currentPageIds.every(id => selectedIds.includes(id));
  const isCurrentPagePartiallySelected =
    currentPageIds.some(id => selectedIds.includes(id)) && !isCurrentPageAllSelected;

  const handleSelectAllCurrentPageToggle = () => {
    if (isCurrentPageAllSelected) {
      setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds(filteredRegistrations.map(r => r.id));
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

  // Open Single Delete Modal
  const handleOpenSingleDelete = (reg: Registration, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      type: 'single',
      registration: reg
    });
  };

  // Open Multi Delete Modal
  const handleOpenMultiDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      type: 'multiple',
      count: selectedIds.length
    });
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deleteModal.type === 'single' && deleteModal.registration) {
      const reg = deleteModal.registration;
      deleteRegistration(reg.id);
      setSelectedIds(prev => prev.filter(id => id !== reg.id));
      showToast(`Pendaftaran ${reg.regNumber} (${reg.patientName}) berhasil dihapus.`);
    } else if (deleteModal.type === 'multiple') {
      const count = selectedIds.length;
      deleteMultipleRegistrations(selectedIds);
      setSelectedIds([]);
      showToast(`${count} data pendaftaran berhasil dihapus.`);
    }

    setDeleteModal({ isOpen: false, type: 'single' });
  };

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  const selectedRegistrationsList = useMemo(() => {
    return registrations.filter(r => selectedIds.includes(r.id));
  }, [registrations, selectedIds]);

  // Page numbers generator
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

  const hasActiveFilters = searchQuery !== '' || filterPaymentStatus !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <span>Data Registrasi & Pendaftaran Pasien</span>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 font-mono">
              {registrations.length} Pendaftaran
            </span>
          </h2>
          <p className="text-xs text-stone-500">
            Log seluruh kunjungan pendaftaran baru dan pasien ulangan ke dokter spesialis
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleOpenMultiDelete}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition-all animate-in fade-in cursor-pointer"
              title="Hapus pendaftaran terpilih"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus Terpilih ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={() => openModal('new-registration')}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Buat Pendaftaran Baru</span>
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
                {selectedIds.length} Pendaftaran Dipilih
              </span>
              <span className="text-[11px] text-stone-500">
                {selectedIds.length < filteredRegistrations.length ? (
                  <>
                    Memilih {selectedIds.length} pendaftaran.{' '}
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="font-semibold text-rose-700 underline hover:text-rose-800 ml-1"
                    >
                      Pilih semua {filteredRegistrations.length} data pendaftaran
                    </button>
                  </>
                ) : (
                  'Seluruh pendaftaran pada hasil pencarian telah dipilih.'
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

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari No. Registrasi, Nama Pasien, No. RM, Dokter, Treatment, atau No. Antrian..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={filterPaymentStatus}
              onChange={e => setFilterPaymentStatus(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs text-stone-700 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="all">Semua Status Pembayaran</option>
              <option value="paid">Lunas</option>
              <option value="unpaid">Belum Dibayar / Proses</option>
            </select>
          </div>
        </div>

        {/* Counter & Reset Filter */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
          <span>
            Menampilkan <strong>{filteredRegistrations.length}</strong> dari{' '}
            <strong>{registrations.length}</strong> pendaftaran
            {selectedIds.length > 0 && (
              <span className="text-rose-600 font-semibold ml-2">
                ({selectedIds.length} dipilih)
              </span>
            )}
          </span>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterPaymentStatus('all');
              }}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-600 font-semibold select-none">
                {/* Select All Checkbox Header */}
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
                <th className="py-3.5 px-3">No. Registrasi & Tanggal</th>
                <th className="py-3.5 px-4">Data Pasien & RM</th>
                <th className="py-3.5 px-4">Dokter & Treatment</th>
                <th className="py-3.5 px-4 text-center">Antrian</th>
                <th className="py-3.5 px-4">Petugas Loket</th>
                <th className="py-3.5 px-4 text-right">Aksi & Cetak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    Tidak ditemukan data registrasi pendaftaran sesuai kriteria.
                  </td>
                </tr>
              ) : (
                paginatedRegistrations.map(reg => {
                  const isChecked = selectedIds.includes(reg.id);
                  return (
                    <tr
                      key={reg.id}
                      onClick={() =>
                        setSelectedIds(prev =>
                          prev.includes(reg.id)
                            ? prev.filter(id => id !== reg.id)
                            : [...prev, reg.id]
                        )
                      }
                      className={`cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-rose-50/50 hover:bg-rose-50/80'
                          : 'hover:bg-rose-50/20'
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-3.5 pl-4 pr-2 w-10 text-center"
                        onClick={e => handleToggleRow(reg.id, e)}
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

                      {/* No. Registrasi & Tanggal */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-stone-900 block text-xs">
                          {reg.regNumber}
                        </span>
                        <span className="text-[11px] text-stone-400 font-mono">
                          {formatDateId(reg.registrationDate)} · {reg.registrationTime}
                        </span>
                      </td>

                      {/* Pasien & RM */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-900 block text-xs">
                          {reg.patientName}
                        </span>
                        <span className="font-mono text-[11px] text-rose-700 font-semibold">
                          {reg.patientRm}
                        </span>
                      </td>

                      {/* Dokter & Layanan */}
                      <td className="py-3.5 px-4 text-stone-700">
                        <span className="font-medium text-stone-900 block text-xs">
                          {reg.doctorName}
                        </span>
                        <span className="text-[11px] text-rose-700 font-medium line-clamp-1">
                          {reg.treatmentName}
                        </span>
                      </td>

                      {/* Antrian */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-extrabold text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs">
                          {reg.queueNumber}
                        </span>
                      </td>

                      {/* Petugas Loket */}
                      <td className="py-3.5 px-4 text-stone-600 text-xs">
                        <span className="block truncate max-w-[130px]">{reg.registeredBy}</span>
                      </td>

                      {/* Aksi & Cetak Bukti */}
                      <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Cetak Bukti Button (Active & Highlighted) */}
                          <button
                            type="button"
                            onClick={() => openModal('print-registration-ticket', reg)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/70 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-2xs transition-all cursor-pointer"
                            title="Buka & Cetak Bukti Pendaftaran Pasien (PDF / Print)"
                          >
                            <Printer className="h-3.5 w-3.5 shrink-0" />
                            <span>Cetak Bukti</span>
                          </button>

                          {/* Quick Direct PDF Download */}
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              const fn = downloadRegistrationPdf(reg, settings);
                              showToast(`Bukti pendaftaran ${reg.regNumber} berhasil diunduh sebagai PDF: ${fn}`);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-2xs cursor-pointer"
                            title="Unduh langsung sebagai file PDF"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={e => handleOpenSingleDelete(reg, e)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                            title="Hapus Data Pendaftaran"
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
          {/* Left: Info & PageSize Selector */}
          <div className="flex flex-wrap items-center gap-3 text-stone-600">
            <span>
              Menampilkan{' '}
              <strong className="text-stone-900 font-semibold">
                {filteredRegistrations.length === 0 ? 0 : startIndex + 1}
              </strong>{' '}
              -{' '}
              <strong className="text-stone-900 font-semibold">{endIndex}</strong> dari{' '}
              <strong className="text-stone-900 font-semibold">
                {filteredRegistrations.length}
              </strong>{' '}
              pendaftaran
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

          {/* Right: Navigation Controls */}
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

      {/* Confirmation Modal for Delete & Multi-Delete Registration */}
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
                      ? 'Konfirmasi Hapus Pendaftaran'
                      : 'Konfirmasi Hapus Massal Pendaftaran'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Tindakan ini menghapus log registrasi dari database klinik
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
              {deleteModal.type === 'single' && deleteModal.registration ? (
                <div className="space-y-3">
                  <p className="text-stone-600">
                    Apakah Anda yakin ingin menghapus catatan pendaftaran berikut?
                  </p>

                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 font-bold shrink-0">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono font-bold text-stone-900 text-xs">
                          {deleteModal.registration.regNumber}
                        </span>
                        <span className="font-mono font-bold text-xs text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          {deleteModal.registration.queueNumber}
                        </span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm truncate mt-0.5">
                        {deleteModal.registration.patientName} ({deleteModal.registration.patientRm})
                      </h4>
                      <span className="text-stone-500 text-[11px] block mt-0.5 truncate">
                        {deleteModal.registration.doctorName} · {deleteModal.registration.treatmentName}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800 flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      Data pendaftaran yang dihapus tidak dapat dipulihkan. Pastikan antrean atau proses tindakan medis sudah tidak aktif.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-stone-600">
                    Anda akan menghapus <strong>{selectedIds.length} data pendaftaran terpilih</strong> secara bersamaan:
                  </p>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-xl border border-stone-200 bg-stone-50/50 p-2.5">
                    {selectedRegistrationsList.map(r => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-stone-200/80 text-[11px]"
                      >
                        <div className="truncate mr-2">
                          <span className="font-mono text-rose-700 font-bold mr-1.5">
                            {r.queueNumber}
                          </span>
                          <span className="font-medium text-stone-800">{r.patientName}</span>
                          <span className="text-stone-400 font-mono text-[10px] ml-1">
                            ({r.regNumber})
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono shrink-0">
                          {formatDateId(r.registrationDate)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-[11px] text-red-800 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                    <span>
                      Peringatan: Seluruh catatan log registrasi dari{' '}
                      <strong>{selectedIds.length} pendaftaran</strong> ini akan dihapus permanen dari sistem.
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
                      ? 'Ya, Hapus Pendaftaran'
                      : `Ya, Hapus ${selectedIds.length} Pendaftaran`}
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
