import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Clock,
  UserCheck,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Tag,
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
  Star
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Treatment } from '../../../types';
import { formatRupiah } from '../../../utils/formatters';

export const TreatmentsView: React.FC = () => {
  const { treatments, deleteTreatment, deleteMultipleTreatments, updateTreatment, openModal } = useApp();

  // Search & Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterHandledBy, setFilterHandledBy] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPopular, setFilterPopular] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Multi-select State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Confirmation Modal State (Single & Multiple Delete)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'multiple';
    treatment?: Treatment;
    count?: number;
  }>({
    isOpen: false,
    type: 'single'
  });

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const categories = [
    { key: 'all', label: 'Semua Kategori' },
    { key: 'Facial', label: 'Facial Care' },
    { key: 'Acne', label: 'Acne Care' },
    { key: 'Hydra', label: 'Hydrafacial' },
    { key: 'Laser', label: 'Laser & Light' },
    { key: 'Peeling', label: 'Chemical Peeling' },
    { key: 'Rejuvenation', label: 'Skin Rejuvenation' },
    { key: 'Hair', label: 'Hair Care' },
    { key: 'Body', label: 'Body Care' },
  ];

  // Filtered treatments
  const filteredTreatments = useMemo(() => {
    return treatments.filter(t => {
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const matchesHandledBy = filterHandledBy === 'all' || t.handledBy === filterHandledBy;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && t.isActive) ||
        (filterStatus === 'inactive' && !t.isActive);
      const matchesPopular =
        filterPopular === 'all' ||
        (filterPopular === 'favorite' && t.popularBadge) ||
        (filterPopular === 'regular' && !t.popularBadge);

      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesHandledBy && matchesStatus && matchesPopular && matchesSearch;
    });
  }, [treatments, selectedCategory, filterHandledBy, filterStatus, filterPopular, searchQuery]);

  // Reset pagination to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, filterHandledBy, filterStatus, filterPopular, searchQuery]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredTreatments.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredTreatments.length);
  const paginatedTreatments = useMemo(() => {
    return filteredTreatments.slice(startIndex, endIndex);
  }, [filteredTreatments, startIndex, endIndex]);

  // Checkbox helpers for current page
  const currentPageIds = useMemo(() => paginatedTreatments.map(t => t.id), [paginatedTreatments]);
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
    setSelectedIds(filteredTreatments.map(t => t.id));
  };

  const handleToggleCardSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const toggleStatus = (t: Treatment, e: React.MouseEvent) => {
    e.stopPropagation();
    updateTreatment(t.id, { isActive: !t.isActive });
    showToast(`Status ${t.name} diubah menjadi ${!t.isActive ? 'Aktif' : 'Non-Aktif'}.`);
  };

  // Open Single Delete Modal
  const handleOpenSingleDelete = (t: Treatment, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      type: 'single',
      treatment: t
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
    if (deleteModal.type === 'single' && deleteModal.treatment) {
      const t = deleteModal.treatment;
      deleteTreatment(t.id);
      setSelectedIds(prev => prev.filter(id => id !== t.id));
      showToast(`Treatment ${t.name} (${t.code}) berhasil dihapus.`);
    } else if (deleteModal.type === 'multiple') {
      const count = selectedIds.length;
      deleteMultipleTreatments(selectedIds);
      setSelectedIds([]);
      showToast(`${count} layanan treatment berhasil dihapus.`);
    }

    setDeleteModal({ isOpen: false, type: 'single' });
  };

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  const selectedTreatmentsList = useMemo(() => {
    return treatments.filter(t => selectedIds.includes(t.id));
  }, [treatments, selectedIds]);

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
    selectedCategory !== 'all' ||
    filterHandledBy !== 'all' ||
    filterStatus !== 'all' ||
    filterPopular !== 'all' ||
    searchQuery !== '';

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <span>Daftar Layanan Treatment Kecantikan</span>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 font-mono">
              {treatments.length} Layanan
            </span>
          </h2>
          <p className="text-xs text-stone-500">
            Katalog prosedur klinis, tarif resmi Rupiah, estimasi durasi, dan spesialis pelaksana
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleOpenMultiDelete}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition-all animate-in fade-in cursor-pointer"
              title="Hapus treatment terpilih"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus Terpilih ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={() => openModal('treatment-form')}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Treatment Baru</span>
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
                {selectedIds.length} Treatment Dipilih
              </span>
              <span className="text-[11px] text-stone-500">
                {selectedIds.length < filteredTreatments.length ? (
                  <>
                    Memilih {selectedIds.length} treatment.{' '}
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="font-semibold text-rose-700 underline hover:text-rose-800 ml-1"
                    >
                      Pilih semua {filteredTreatments.length} treatment
                    </button>
                  </>
                ) : (
                  'Seluruh treatment pada hasil filter telah dipilih.'
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

      {/* Category Pills & Advanced Filters Bar */}
      <div className="space-y-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                selectedCategory === cat.key
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Dropdown Filters Bar */}
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
                placeholder="Cari treatment berdasarkan nama, deskripsi, atau kode..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            {/* Filter Pelaksana */}
            <div className="sm:col-span-3">
              <select
                value={filterHandledBy}
                onChange={e => setFilterHandledBy(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs text-stone-700 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="all">Semua Pelaksana</option>
                <option value="Dokter">Dokter</option>
                <option value="Perawat">Perawat</option>
                <option value="Dokter & Perawat">Dokter & Perawat</option>
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

            {/* Filter Favorit */}
            <div className="sm:col-span-2">
              <select
                value={filterPopular}
                onChange={e => setFilterPopular(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-2 text-xs text-stone-700 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="all">Semua Tipe</option>
                <option value="favorite">★ Favorit</option>
                <option value="regular">Reguler</option>
              </select>
            </div>
          </div>

          {/* Bar Control: Select All Header on Current Page & Info Counter */}
          <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100 gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAllCurrentPageToggle}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors"
                title={
                  isCurrentPageAllSelected
                    ? 'Batalkan pilihan halaman ini'
                    : 'Pilih semua di halaman ini'
                }
              >
                {isCurrentPageAllSelected ? (
                  <CheckSquare className="h-3.5 w-3.5 text-rose-600" />
                ) : isCurrentPagePartiallySelected ? (
                  <MinusSquare className="h-3.5 w-3.5 text-rose-600" />
                ) : (
                  <Square className="h-3.5 w-3.5 text-stone-400" />
                )}
                <span>
                  {isCurrentPageAllSelected
                    ? 'Batalkan Pilihan Halaman Ini'
                    : 'Pilih Semua di Halaman Ini'}
                </span>
              </button>

              <span>
                Menampilkan <strong>{filteredTreatments.length}</strong> dari{' '}
                <strong>{treatments.length}</strong> treatment
                {selectedIds.length > 0 && (
                  <span className="text-rose-600 font-semibold ml-2">
                    ({selectedIds.length} dipilih)
                  </span>
                )}
              </span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setFilterHandledBy('all');
                  setFilterStatus('all');
                  setFilterPopular('all');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Treatment Cards Grid */}
      {paginatedTreatments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-12 text-center text-stone-400 text-xs">
          <Sparkles className="h-8 w-8 mx-auto mb-2 text-stone-300" />
          Tidak ditemukan layanan treatment yang sesuai dengan kriteria filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedTreatments.map(t => {
            const isChecked = selectedIds.includes(t.id);
            return (
              <div
                key={t.id}
                onClick={e => handleToggleCardSelect(t.id, e)}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all cursor-pointer relative ${
                  isChecked
                    ? 'bg-rose-50/40 border-rose-400 ring-2 ring-rose-500/20 shadow-sm'
                    : t.isActive
                    ? 'bg-white border-stone-200/80 shadow-xs hover:border-rose-300'
                    : 'bg-stone-50/80 border-stone-200 opacity-60 hover:opacity-90'
                }`}
              >
                <div>
                  {/* Top Bar on Card: Checkbox, Category, Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={e => handleToggleCardSelect(t.id, e)}
                        className="p-1 -ml-1 rounded text-stone-400 hover:text-stone-700 focus:outline-none"
                      >
                        {isChecked ? (
                          <CheckSquare className="h-4 w-4 text-rose-600" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>

                      <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                        {t.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {t.popularBadge && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                          <span>Favorit</span>
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          t.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {t.isActive ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </div>
                  </div>

                  {/* Treatment Title & Code */}
                  <div className="mt-2">
                    <span className="text-[10px] font-mono text-stone-400 font-semibold">{t.code}</span>
                    <h3 className="text-base font-bold text-stone-900 leading-snug">{t.name}</h3>
                    <p className="mt-2 text-xs text-stone-600 leading-relaxed line-clamp-3">
                      {t.description}
                    </p>
                  </div>

                  {/* Specs: Duration & Handler */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-stone-400" />
                      <span>
                        Durasi:{' '}
                        <strong className="text-stone-700 font-mono">
                          {t.durationMinutes} menit
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-stone-400" />
                      <span>{t.handledBy}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card: Price in Rupiah & Action Buttons */}
                <div
                  className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between"
                  onClick={e => e.stopPropagation()}
                >
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                      Tarif Layanan
                    </span>
                    <span className="text-lg font-bold text-stone-900 font-mono">
                      {formatRupiah(t.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={e => toggleStatus(t, e)}
                      className="rounded-lg border border-stone-200 p-1.5 text-stone-500 hover:bg-stone-50 text-xs transition-colors"
                      title={t.isActive ? 'Nonaktifkan Treatment' : 'Aktifkan Treatment'}
                    >
                      {t.isActive ? (
                        <XCircle className="h-4 w-4 text-stone-400" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal('treatment-form', t)}
                      className="rounded-lg border border-stone-200 p-1.5 text-stone-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-xs transition-colors"
                      title="Edit Treatment"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={e => handleOpenSingleDelete(t, e)}
                      className="rounded-lg border border-red-200 bg-red-50/50 p-1.5 text-red-600 hover:bg-red-600 hover:text-white text-xs transition-colors"
                      title={`Hapus ${t.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-white px-4 py-3 shadow-xs text-xs">
        {/* Left: Info & PageSize Selector */}
        <div className="flex flex-wrap items-center gap-3 text-stone-600">
          <span>
            Menampilkan{' '}
            <strong className="text-stone-900 font-semibold">
              {filteredTreatments.length === 0 ? 0 : startIndex + 1}
            </strong>{' '}
            -{' '}
            <strong className="text-stone-900 font-semibold">{endIndex}</strong> dari{' '}
            <strong className="text-stone-900 font-semibold">{filteredTreatments.length}</strong>{' '}
            treatment
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
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
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

      {/* Confirmation Modal for Delete & Multi-Delete Treatment */}
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
                      ? 'Konfirmasi Hapus Treatment'
                      : 'Konfirmasi Hapus Massal Treatment'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Tindakan ini menghapus layanan treatment dari katalog klinik
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
              {deleteModal.type === 'single' && deleteModal.treatment ? (
                <div className="space-y-3">
                  <p className="text-stone-600">
                    Apakah Anda yakin ingin menghapus layanan treatment berikut?
                  </p>

                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 font-bold shrink-0">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-stone-400 text-[10px] font-semibold">
                          {deleteModal.treatment.code}
                        </span>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                          {deleteModal.treatment.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm truncate mt-0.5">
                        {deleteModal.treatment.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-stone-500 text-[11px]">
                        <span className="font-mono font-bold text-stone-800">
                          {formatRupiah(deleteModal.treatment.price)}
                        </span>
                        <span>·</span>
                        <span>{deleteModal.treatment.durationMinutes} menit</span>
                        <span>·</span>
                        <span>{deleteModal.treatment.handledBy}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800 flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      Layanan yang dihapus tidak akan dapat dipilih pada antrean reservasi atau kasir billing baru.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-stone-600">
                    Anda akan menghapus <strong>{selectedIds.length} layanan treatment terpilih</strong> secara bersamaan:
                  </p>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-xl border border-stone-200 bg-stone-50/50 p-2.5">
                    {selectedTreatmentsList.map(t => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-stone-200/80 text-[11px]"
                      >
                        <div className="truncate mr-2">
                          <span className="font-mono text-[10px] text-stone-400 mr-1.5">
                            {t.code}
                          </span>
                          <span className="font-medium text-stone-800">{t.name}</span>
                        </div>
                        <span className="font-mono text-stone-900 font-semibold shrink-0">
                          {formatRupiah(t.price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-[11px] text-red-800 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                    <span>
                      Peringatan: Seluruh tarif dan katalog dari{' '}
                      <strong>{selectedIds.length} treatment</strong> ini akan dihapus permanen dari sistem.
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
                      ? 'Ya, Hapus Treatment'
                      : `Ya, Hapus ${selectedIds.length} Treatment`}
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
