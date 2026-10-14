import React, { useState, useMemo, useEffect } from 'react';
import {
  Volume2,
  Printer,
  Plus,
  CheckCircle2,
  Play,
  XCircle,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  MinusSquare,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { QueueItem, QueueStatus } from '../../../types';

export const QueueView: React.FC = () => {
  const {
    queues,
    updateQueueStatus,
    callQueue,
    deleteQueue,
    deleteMultipleQueues,
    openModal,
    currentUser,
    currentDoctor,
    isMyDoctorData
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Confirmation modal state (handles both single & multi-delete)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'multiple';
    item?: QueueItem;
    count?: number;
  }>({
    isOpen: false,
    type: 'single'
  });

  const isDoctorRole = currentUser?.role === 'dokter';

  const statuses: { key: string; label: string }[] = [
    { key: 'all', label: 'Semua Status' },
    { key: 'Menunggu', label: 'Menunggu' },
    { key: 'Dipanggil', label: 'Dipanggil' },
    { key: 'Sedang Dilayani', label: 'Sedang Dilayani' },
    { key: 'Selesai', label: 'Selesai' },
    { key: 'Dibatalkan', label: 'Dibatalkan' },
  ];

  const filteredQueues = useMemo(() => {
    return queues.filter(q => {
      const matchStatus = filterStatus === 'all' || q.status === filterStatus;
      const matchSearch =
        q.queueNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.patientRm.toLowerCase().includes(searchQuery.toLowerCase());

      if (isDoctorRole && currentDoctor) {
        return matchStatus && matchSearch && isMyDoctorData(q.doctorId, q.doctorName);
      }

      return matchStatus && matchSearch;
    });
  }, [queues, filterStatus, searchQuery, isDoctorRole, currentDoctor, isMyDoctorData]);

  // Reset page and selection on filter/search change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [filterStatus, searchQuery]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredQueues.length / pageSize));

  // Guard page range
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredQueues.length);
  const paginatedQueues = filteredQueues.slice(startIndex, endIndex);

  // Multi-select helpers
  const isAllPageSelected =
    paginatedQueues.length > 0 &&
    paginatedQueues.every(q => selectedIds.includes(q.id));

  const isSomePageSelected =
    paginatedQueues.some(q => selectedIds.includes(q.id)) && !isAllPageSelected;

  const toggleSelectAllPage = () => {
    if (isAllPageSelected) {
      const pageIds = new Set(paginatedQueues.map(q => q.id));
      setSelectedIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const newSelected = new Set(selectedIds);
      paginatedQueues.forEach(q => newSelected.add(q.id));
      setSelectedIds(Array.from(newSelected));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirmDelete = () => {
    if (deleteModal.type === 'single' && deleteModal.item) {
      deleteQueue(deleteModal.item.id);
      setSelectedIds(prev => prev.filter(id => id !== deleteModal.item?.id));
    } else if (deleteModal.type === 'multiple' && selectedIds.length > 0) {
      deleteMultipleQueues(selectedIds);
      setSelectedIds([]);
    }
    setDeleteModal({ isOpen: false, type: 'single' });
  };

  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case 'Menunggu':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Dipanggil':
        return 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse';
      case 'Sedang Dilayani':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Selesai':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Dibatalkan':
        return 'bg-stone-100 text-stone-600 border-stone-200';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <span>Manajemen Antrian Pasien Klinik</span>
            {isDoctorRole && currentDoctor && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                {currentDoctor.name.split(',')[0]}
              </span>
            )}
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 font-mono">
              {filteredQueues.length} Antrian
            </span>
          </h2>
          <p className="text-xs text-stone-500">
            {isDoctorRole && currentDoctor
              ? `Papan monitoring dan pemanggilan nomor antrian konsultasi khusus untuk ${currentDoctor.name}`
              : 'Papan antrian real-time, panggilan suara otomatis ke poli, dan status pelayanan'}
          </p>
        </div>

        <button
          onClick={() => openModal('new-registration')}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>+ Ambil Nomor Antrian Baru</span>
        </button>
      </div>

      {/* Active Call Highlight Display */}
      {queues.find(q => q.status === 'Dipanggil') && (
        <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-500 to-rose-600 p-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-600 font-bold font-mono text-2xl shadow-inner">
              {queues.find(q => q.status === 'Dipanggil')?.queueNumber}
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-100 flex items-center gap-1">
                <Volume2 className="h-3.5 w-3.5 animate-bounce" />
                Panggilan Pasien Aktif
              </span>
              <h3 className="text-lg font-bold text-white">
                {queues.find(q => q.status === 'Dipanggil')?.patientName}
              </h3>
              <p className="text-xs text-rose-100">
                Silakan menuju: <strong>{queues.find(q => q.status === 'Dipanggil')?.counterRoom}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const item = queues.find(q => q.status === 'Dipanggil');
                if (item) callQueue(item);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur px-3 py-2 text-xs font-semibold text-white hover:bg-white/30 cursor-pointer transition-colors"
            >
              <Volume2 className="h-4 w-4" />
              <span>Ulangi Panggilan</span>
            </button>
            <button
              onClick={() => {
                const item = queues.find(q => q.status === 'Dipanggil');
                if (item) updateQueueStatus(item.id, 'Sedang Dilayani');
              }}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-rose-700 shadow-sm hover:bg-rose-50 cursor-pointer transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Mulai Layani Pasien</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {statuses.map(st => (
              <button
                key={st.key}
                onClick={() => setFilterStatus(st.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  filterStatus === st.key
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari no. antrian, RM, nama..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
        </div>

        {/* Multi-Select Action Bar (Shows when items are checked) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-medium text-rose-900">
              <span className="inline-flex items-center justify-center h-5 px-2 bg-rose-600 text-white text-[11px] font-bold rounded-full">
                {selectedIds.length}
              </span>
              <span>antrian dipilih dari total {filteredQueues.length}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900 font-medium rounded-lg hover:bg-rose-100/60 transition-colors"
              >
                Batalkan Pilihan
              </button>
              <button
                type="button"
                onClick={() =>
                  setDeleteModal({
                    isOpen: true,
                    type: 'multiple',
                    count: selectedIds.length
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Terpilih ({selectedIds.length})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Queue List Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-600 font-semibold">
                {/* Select All Checkbox */}
                <th className="py-3.5 px-4 w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAllPage}
                    className="p-1 text-stone-500 hover:text-rose-600 focus:outline-none transition-colors"
                    title={isAllPageSelected ? 'Batal pilih semua di halaman ini' : 'Pilih semua di halaman ini'}
                  >
                    {isAllPageSelected ? (
                      <CheckSquare className="h-4 w-4 text-rose-600" />
                    ) : isSomePageSelected ? (
                      <MinusSquare className="h-4 w-4 text-rose-600" />
                    ) : (
                      <Square className="h-4 w-4 text-stone-400" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">No. Antrian</th>
                <th className="py-3.5 px-4">Nama Pasien & RM</th>
                <th className="py-3.5 px-4">Dokter & Treatment</th>
                <th className="py-3.5 px-4">Ruang & Jam</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredQueues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    Tidak ada data antrian sesuai filter.
                  </td>
                </tr>
              ) : (
                paginatedQueues.map(item => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-rose-50/20 transition-colors ${
                        isSelected ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      {/* Individual Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(item.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 focus:outline-none transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-rose-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-base text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                            {item.queueNumber}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-900 block">{item.patientName}</span>
                        <span className="font-mono text-[11px] text-stone-400">{item.patientRm}</span>
                      </td>

                      <td className="py-3.5 px-4 text-stone-600">
                        <span className="font-medium text-stone-800 block">{item.doctorName}</span>
                        <span className="text-[11px] text-rose-700">{item.treatmentName}</span>
                      </td>

                      <td className="py-3.5 px-4 text-stone-600">
                        <span className="block text-stone-800">{item.counterRoom}</span>
                        <span className="text-[11px] text-stone-400 font-mono">
                          Jam: {item.time} WIB
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Panggilan: HILANGKAN JIKA SUDAH SELESAI ATAU DIBATALKAN */}
                          {item.status !== 'Selesai' && item.status !== 'Dibatalkan' ? (
                            <button
                              onClick={() => callQueue(item)}
                              className="flex h-7 items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 text-rose-700 hover:bg-rose-100 text-xs font-semibold cursor-pointer transition-colors"
                              title="Panggil Pasien"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">
                                {item.status === 'Dipanggil' ? 'Panggil Ulang' : 'Panggil'}
                              </span>
                            </button>
                          ) : item.status === 'Selesai' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>Selesai</span>
                            </span>
                          ) : null}

                          {/* Status transitions */}
                          {item.status === 'Dipanggil' && (
                            <button
                              onClick={() => updateQueueStatus(item.id, 'Sedang Dilayani')}
                              className="flex h-7 items-center gap-1 rounded-lg bg-blue-600 px-2 text-white hover:bg-blue-700 text-xs font-semibold cursor-pointer transition-colors"
                            >
                              Layani
                            </button>
                          )}

                          {item.status === 'Sedang Dilayani' && (
                            <button
                              onClick={() => updateQueueStatus(item.id, 'Selesai')}
                              className="flex h-7 items-center gap-1 rounded-lg bg-emerald-600 px-2 text-white hover:bg-emerald-700 text-xs font-semibold cursor-pointer transition-colors"
                            >
                              Selesai
                            </button>
                          )}

                          {/* Print Ticket */}
                          <button
                            onClick={() => openModal('print-queue-ticket', item)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors"
                            title="Cetak Tiket Antrian"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>

                          {/* Batalkan Antrian */}
                          {item.status !== 'Dibatalkan' && item.status !== 'Selesai' && (
                            <button
                              onClick={() => updateQueueStatus(item.id, 'Dibatalkan')}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer transition-colors"
                              title="Batalkan Antrian"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Hapus Single Antrian */}
                          <button
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                type: 'single',
                                item
                              })
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 cursor-pointer transition-colors"
                            title="Hapus Data Antrian"
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
        {filteredQueues.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-stone-200 bg-stone-50/50">
            <div className="flex items-center gap-3 text-xs text-stone-600">
              <span>
                Menampilkan <span className="font-semibold text-stone-900">{startIndex + 1}</span> -{' '}
                <span className="font-semibold text-stone-900">{endIndex}</span> dari{' '}
                <span className="font-semibold text-stone-900">{filteredQueues.length}</span> antrian
              </span>

              <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200">
                <span className="text-[11px] text-stone-500">Per halaman:</span>
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs text-stone-700 focus:border-rose-500 focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => {
                    // Show current page, edges, and adjacent pages
                    return (
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 1
                    );
                  })
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && page - prev > 1;
                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-1 text-xs text-stone-400">...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            currentPage === page
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Delete Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-100 animate-scaleUp">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-stone-900">
                  {deleteModal.type === 'single'
                    ? 'Konfirmasi Hapus Antrian'
                    : 'Konfirmasi Hapus Massal Antrian'}
                </h3>
                <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                  {deleteModal.type === 'single' ? (
                    <>
                      Apakah Anda yakin ingin menghapus nomor antrian{' '}
                      <strong className="text-rose-600 font-mono">
                        {deleteModal.item?.queueNumber}
                      </strong>{' '}
                      untuk pasien{' '}
                      <strong className="text-stone-900">
                        {deleteModal.item?.patientName}
                      </strong>
                      ? Tindakan ini tidak dapat dibatalkan.
                    </>
                  ) : (
                    <>
                      Apakah Anda yakin ingin menghapus sebanyak{' '}
                      <strong className="text-rose-600 font-bold">
                        {deleteModal.count}
                      </strong>{' '}
                      data antrian yang terpilih secara permanen? Tindakan ini tidak dapat dibatalkan.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, type: 'single' })}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>
                  {deleteModal.type === 'single' ? 'Ya, Hapus Antrian' : 'Ya, Hapus Semua Terpilih'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
