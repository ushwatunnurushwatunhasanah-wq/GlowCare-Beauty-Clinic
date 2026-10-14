import React, { useState, useMemo, useEffect } from 'react';
import {
  HeartPulse,
  Plus,
  Search,
  Filter,
  Clock,
  Phone,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  UserCheck,
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
  Stethoscope
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Nurse } from '../../../types';

export const NursesView: React.FC = () => {
  const { nurses, doctors, deleteNurse, deleteMultipleNurses, openModal, updateNurse } = useApp();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterShift, setFilterShift] = useState<string>('all');
  const [filterDoctor, setFilterDoctor] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Multi-select State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Confirmation Modal State (Single & Multiple Delete)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'multiple';
    nurse?: Nurse;
    count?: number;
  }>({
    isOpen: false,
    type: 'single'
  });

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Extract unique assigned doctors for filter dropdown
  const uniqueDoctors = useMemo(() => {
    const docSet = new Set<string>();
    nurses.forEach(n => {
      if (n.assignedDoctor) docSet.add(n.assignedDoctor);
    });
    doctors.forEach(d => {
      if (d.name) docSet.add(d.name);
    });
    return Array.from(docSet);
  }, [nurses, doctors]);

  // Filtered Nurses
  const filteredNurses = useMemo(() => {
    return nurses.filter(n => {
      const matchesSearch =
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.strNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.assignedDoctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.phone.includes(searchQuery);

      const matchesShift = filterShift === 'all' || n.shift === filterShift;
      const matchesDoctor = filterDoctor === 'all' || n.assignedDoctor === filterDoctor;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && n.isActive) ||
        (filterStatus === 'inactive' && !n.isActive);

      return matchesSearch && matchesShift && matchesDoctor && matchesStatus;
    });
  }, [nurses, searchQuery, filterShift, filterDoctor, filterStatus]);

  // Reset pagination to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterShift, filterDoctor, filterStatus]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredNurses.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredNurses.length);
  const paginatedNurses = useMemo(() => {
    return filteredNurses.slice(startIndex, endIndex);
  }, [filteredNurses, startIndex, endIndex]);

  // Checkbox helpers for current page
  const currentPageIds = useMemo(() => paginatedNurses.map(n => n.id), [paginatedNurses]);
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
    setSelectedIds(filteredNurses.map(n => n.id));
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
  const handleOpenSingleDelete = (nurse: Nurse, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      type: 'single',
      nurse
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

  // Confirm Delete Action
  const handleConfirmDelete = () => {
    if (deleteModal.type === 'single' && deleteModal.nurse) {
      const n = deleteModal.nurse;
      deleteNurse(n.id);
      setSelectedIds(prev => prev.filter(id => id !== n.id));
      showToast(`Data perawat ${n.name} (${n.strNumber}) berhasil dihapus.`);
    } else if (deleteModal.type === 'multiple') {
      const count = selectedIds.length;
      deleteMultipleNurses(selectedIds);
      setSelectedIds([]);
      showToast(`${count} data perawat berhasil dihapus.`);
    }

    setDeleteModal({ isOpen: false, type: 'single' });
  };

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  const selectedNursesList = useMemo(() => {
    return nurses.filter(n => selectedIds.includes(n.id));
  }, [nurses, selectedIds]);

  const handleToggleStatus = (nurse: Nurse, e: React.MouseEvent) => {
    e.stopPropagation();
    updateNurse(nurse.id, { isActive: !nurse.isActive });
    showToast(`Status ${nurse.name} diubah menjadi ${!nurse.isActive ? 'Aktif' : 'Non-Aktif'}.`);
  };

  // Helper for generating page numbers
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

  const hasActiveFilters =
    searchQuery !== '' ||
    filterShift !== 'all' ||
    filterDoctor !== 'all' ||
    filterStatus !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <span>Data Tenaga Perawat & Beautician</span>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 font-mono">
              {nurses.length} Perawat
            </span>
          </h2>
          <p className="text-xs text-stone-500">
            Daftar perawat berlisensi STR, alokasi shift kerja, dan pendampingan dokter spesialis
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleOpenMultiDelete}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition-all animate-in fade-in cursor-pointer"
              title="Hapus perawat terpilih"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus Terpilih ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={() => openModal('nurse-form')}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Perawat Baru</span>
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
                {selectedIds.length} Perawat Dipilih
              </span>
              <span className="text-[11px] text-stone-500">
                {selectedIds.length < filteredNurses.length ? (
                  <>
                    Memilih {selectedIds.length} perawat.{' '}
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="font-semibold text-rose-700 underline hover:text-rose-800 ml-1"
                    >
                      Pilih semua {filteredNurses.length} perawat
                    </button>
                  </>
                ) : (
                  'Seluruh perawat pada hasil filter telah dipilih.'
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
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama perawat, STR, atau telepon..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Filter Shift Kerja */}
          <div className="sm:col-span-3">
            <select
              value={filterShift}
              onChange={e => setFilterShift(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs text-stone-700 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="all">Semua Shift Kerja</option>
              <option value="Pagi (08:00 - 15:00)">Pagi (08:00 - 15:00)</option>
              <option value="Sore (14:00 - 21:00)">Sore (14:00 - 21:00)</option>
              <option value="Full Day">Full Day</option>
            </select>
          </div>

          {/* Filter Dokter Pendamping */}
          <div className="sm:col-span-2">
            <select
              value={filterDoctor}
              onChange={e => setFilterDoctor(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs text-stone-700 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 truncate"
            >
              <option value="all">Semua Dokter</option>
              {uniqueDoctors.map(doc => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="sm:col-span-2">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs text-stone-700 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Non-Aktif</option>
            </select>
          </div>
        </div>

        {/* Counter & Reset Filter */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
          <span>
            Menampilkan <strong>{filteredNurses.length}</strong> dari <strong>{nurses.length}</strong> perawat
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
                setFilterShift('all');
                setFilterDoctor('all');
                setFilterStatus('all');
              }}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Nurses Table with Checkboxes & Pagination */}
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
                <th className="py-3.5 px-3">Nama Lengkap & STR</th>
                <th className="py-3.5 px-4">Shift Tugas</th>
                <th className="py-3.5 px-4">Dokter Pendamping</th>
                <th className="py-3.5 px-4">Kontak Telepon</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedNurses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    Tidak ditemukan data perawat sesuai kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedNurses.map(nurse => {
                  const isChecked = selectedIds.includes(nurse.id);
                  return (
                    <tr
                      key={nurse.id}
                      onClick={() =>
                        setSelectedIds(prev =>
                          prev.includes(nurse.id)
                            ? prev.filter(id => id !== nurse.id)
                            : [...prev, nurse.id]
                        )
                      }
                      className={`cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-rose-50/50 hover:bg-rose-50/80'
                          : 'hover:bg-rose-50/20'
                      }`}
                    >
                      {/* Checkbox Column */}
                      <td
                        className="py-3.5 pl-4 pr-2 w-10 text-center"
                        onClick={e => handleToggleRow(nurse.id, e)}
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

                      {/* Name & STR */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 font-bold shrink-0 shadow-2xs">
                            <HeartPulse className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-bold text-stone-900 block text-xs">
                              {nurse.name}
                            </span>
                            <span className="font-mono text-[11px] text-stone-400 font-medium">
                              {nurse.strNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Shift Tugas */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-stone-200/60">
                          <Clock className="h-3 w-3 text-stone-400" />
                          <span>{nurse.shift}</span>
                        </span>
                      </td>

                      {/* Dokter Pendamping */}
                      <td className="py-3.5 px-4 font-medium text-stone-800">
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                          <span className="truncate max-w-xs">{nurse.assignedDoctor}</span>
                        </div>
                      </td>

                      {/* Kontak Telepon */}
                      <td className="py-3.5 px-4 font-mono text-stone-600 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                          <span>{nurse.phone}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={e => handleToggleStatus(nurse, e)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            nurse.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                          }`}
                          title="Klik untuk ubah status aktif perawat"
                        >
                          {nurse.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-emerald-600" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 text-stone-400" />
                              <span>Non-Aktif</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openModal('nurse-form', nurse)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                            title="Edit Data Perawat"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={e => handleOpenSingleDelete(nurse, e)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                            title={`Hapus ${nurse.name}`}
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
                {filteredNurses.length === 0 ? 0 : startIndex + 1}
              </strong>{' '}
              -{' '}
              <strong className="text-stone-900 font-semibold">{endIndex}</strong> dari{' '}
              <strong className="text-stone-900 font-semibold">{filteredNurses.length}</strong>{' '}
              perawat
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

      {/* Confirmation Modal for Delete & Multi-Delete Nurse */}
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
                      ? 'Konfirmasi Hapus Perawat'
                      : 'Konfirmasi Hapus Massal Perawat'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Tindakan ini menghapus data perawat dari database klinik
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
              {deleteModal.type === 'single' && deleteModal.nurse ? (
                <div className="space-y-3">
                  <p className="text-stone-600">
                    Apakah Anda yakin ingin menghapus data tenaga perawat berikut?
                  </p>

                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 font-bold shrink-0">
                      <HeartPulse className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-900 text-sm truncate">
                        {deleteModal.nurse.name}
                      </h4>
                      <span className="font-mono text-stone-500 block text-xs">
                        {deleteModal.nurse.strNumber}
                      </span>
                      <span className="text-rose-700 font-medium text-[11px] block mt-0.5 truncate">
                        Shift: {deleteModal.nurse.shift} · Pendamping: {deleteModal.nurse.assignedDoctor}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800 flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      Data perawat yang dihapus tidak dapat dipulihkan. Pastikan jadwal pendampingan tindakan estetika telah dialihkan.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-stone-600">
                    Anda akan menghapus <strong>{selectedIds.length} data perawat terpilih</strong> secara bersamaan:
                  </p>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-xl border border-stone-200 bg-stone-50/50 p-2.5">
                    {selectedNursesList.map(n => (
                      <div
                        key={n.id}
                        className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-stone-200/80 text-[11px]"
                      >
                        <span className="font-medium text-stone-800 truncate mr-2">
                          {n.name}
                        </span>
                        <span className="font-mono text-stone-400 font-semibold shrink-0">
                          {n.strNumber}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-[11px] text-red-800 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                    <span>
                      Peringatan: Seluruh data lisensi STR dan jadwal shift dari{' '}
                      <strong>{selectedIds.length} perawat</strong> ini akan dihapus permanen.
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
                      ? 'Ya, Hapus Perawat'
                      : `Ya, Hapus ${selectedIds.length} Perawat`}
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
