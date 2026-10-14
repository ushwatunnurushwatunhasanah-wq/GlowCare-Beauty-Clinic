import React, { useState, useMemo, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Printer,
  CheckCircle,
  Clock,
  DollarSign,
  QrCode,
  Smartphone,
  Banknote,
  Receipt,
  FileCheck,
  Edit2,
  Plus,
  SlidersHorizontal,
  Settings,
  Building,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Filter,
  Trash2,
  CheckSquare,
  Square,
  MinusSquare,
  AlertTriangle,
  X,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileDown
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Payment, PaymentMethod, PaymentStatus, PaymentChannel } from '../../../types';
import { formatRupiah, formatDateTimeId } from '../../../utils/formatters';
import { downloadReceiptPdf } from '../../../utils/receiptPdf';
import { EditReceiptHeaderModal } from '../../modals/EditReceiptHeaderModal';

export const PaymentsView: React.FC = () => {
  const {
    payments,
    paymentChannels,
    updatePaymentChannel,
    deletePaymentChannel,
    deletePayment,
    deleteMultiplePayments,
    openModal,
    settings
  } = useApp();

  const [activeTab, setActiveTab] = useState<'transactions' | 'channels'>('transactions');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingHeader, setIsEditingHeader] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Multi-select State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Confirmation Modal State (Single & Multiple Delete)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'multiple';
    payment?: Payment;
    count?: number;
  }>({
    isOpen: false,
    type: 'single'
  });

  // Delete Channel Modal State
  const [deleteChannelModal, setDeleteChannelModal] = useState<{
    isOpen: boolean;
    channel?: PaymentChannel;
  }>({
    isOpen: false
  });

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchesMethod = filterMethod === 'all' || p.paymentMethod === filterMethod;
      const matchesSearch =
        p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patientRm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.treatmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesMethod && matchesSearch;
    });
  }, [payments, filterStatus, filterMethod, searchQuery]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterMethod, searchQuery]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredPayments.length);
  const paginatedPayments = useMemo(() => {
    return filteredPayments.slice(startIndex, endIndex);
  }, [filteredPayments, startIndex, endIndex]);

  // Checkbox helpers for current page
  const currentPageIds = useMemo(() => paginatedPayments.map(p => p.id), [paginatedPayments]);
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
    setSelectedIds(filteredPayments.map(p => p.id));
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
  const handleOpenSingleDelete = (payment: Payment, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      type: 'single',
      payment
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
    if (deleteModal.type === 'single' && deleteModal.payment) {
      const p = deleteModal.payment;
      deletePayment(p.id);
      setSelectedIds(prev => prev.filter(id => id !== p.id));
      showToast(`Faktur tagihan ${p.invoiceNumber} (${p.patientName}) berhasil dihapus.`);
    } else if (deleteModal.type === 'multiple') {
      const count = selectedIds.length;
      deleteMultiplePayments(selectedIds);
      setSelectedIds([]);
      showToast(`${count} faktur tagihan pembayaran berhasil dihapus.`);
    }

    setDeleteModal({ isOpen: false, type: 'single' });
  };

  // Open Delete Channel Modal
  const handleOpenDeleteChannel = (channel: PaymentChannel, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteChannelModal({
      isOpen: true,
      channel
    });
  };

  const handleConfirmDeleteChannel = () => {
    if (deleteChannelModal.channel) {
      const ch = deleteChannelModal.channel;
      deletePaymentChannel(ch.id);
      showToast(`Saluran pembayaran ${ch.name} berhasil dihapus.`);
    }
    setDeleteChannelModal({ isOpen: false });
  };

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  const totalPaidRevenue = payments
    .filter(p => p.status === 'Lunas')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const pendingPaymentsTotal = payments
    .filter(p => p.status === 'Belum Dibayar')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const handlePayNow = (payment: Payment) => {
    openModal('process-payment', payment);
  };

  const handleEditPaymentMethod = (payment: Payment) => {
    openModal('edit-payment-method', payment);
  };

  const handleOpenChannelModal = (channel?: PaymentChannel) => {
    openModal('payment-channel-form', channel);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Lunas':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Belum Dibayar':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Dibatalkan':
        return 'bg-stone-100 text-stone-600 border-stone-200';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  const getMethodIcon = (method?: PaymentMethod) => {
    switch (method) {
      case 'QRIS':
        return <QrCode className="h-3.5 w-3.5 text-purple-600" />;
      case 'Transfer':
        return <Smartphone className="h-3.5 w-3.5 text-indigo-600" />;
      case 'Debit':
        return <CreditCard className="h-3.5 w-3.5 text-blue-600" />;
      case 'Cash':
      default:
        return <Banknote className="h-3.5 w-3.5 text-emerald-600" />;
    }
  };

  const selectedPaymentsList = useMemo(() => {
    return payments.filter(p => selectedIds.includes(p.id));
  }, [payments, selectedIds]);

  // Page Numbers Generator
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

  const hasActiveFilters = filterStatus !== 'all' || filterMethod !== 'all' || searchQuery !== '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <span>Kasir & Pembayaran Pasien</span>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
              GlowCare Cashier
            </span>
          </h2>
          <p className="text-xs text-stone-500">
            Pencatatan invoice tagihan treatment, diskon promo, edit metode pembayaran, dan cetak struk resmi
          </p>
        </div>

        {/* Tab & Action Controls */}
        <div className="flex items-center gap-2">
          {activeTab === 'transactions' && selectedIds.length > 0 && (
            <button
              onClick={handleOpenMultiDelete}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition-all animate-in fade-in cursor-pointer"
              title="Hapus faktur tagihan terpilih"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus Terpilih ({selectedIds.length})</span>
            </button>
          )}

          {activeTab === 'channels' ? (
            <button
              onClick={() => handleOpenChannelModal()}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Metode Pembayaran</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openModal('new-payment')}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
                title="Buat Tagihan / Pembayaran Baru"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>+ Buat Pembayaran</span>
              </button>

              <button
                onClick={() => setActiveTab('channels')}
                className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5 text-stone-500" />
                <span>Master Metode ({paymentChannels.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditingHeader(true)}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-xs font-semibold text-rose-700 shadow-xs hover:bg-rose-100 hover:text-rose-800 transition-colors cursor-pointer"
                title="Kustomisasi Header & Identitas Struk Kasir"
              >
                <Building className="h-3.5 w-3.5 text-rose-600" />
                <span>Header Struk</span>
              </button>
            </div>
          )}
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
      {activeTab === 'transactions' && selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-3.5 px-4 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-600 text-white font-bold text-xs shadow-xs">
              {selectedIds.length}
            </div>
            <div>
              <span className="text-xs font-bold text-stone-900 block">
                {selectedIds.length} Faktur Tagihan Dipilih
              </span>
              <span className="text-[11px] text-stone-500">
                {selectedIds.length < filteredPayments.length ? (
                  <>
                    Memilih {selectedIds.length} transaksi.{' '}
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      className="font-semibold text-rose-700 underline hover:text-rose-800 ml-1"
                    >
                      Pilih semua {filteredPayments.length} transaksi
                    </button>
                  </>
                ) : (
                  'Seluruh transaksi pada hasil filter telah dipilih.'
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200/80 pb-1">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Faktur & Transaksi Pasien</span>
          <span className="rounded-full bg-white px-2 py-0.2 text-[10px] font-mono border border-stone-200 text-stone-600">
            {payments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('channels')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'channels'
              ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Konfigurasi & Master Metode Bayar</span>
          <span className="rounded-full bg-white px-2 py-0.2 text-[10px] font-mono border border-stone-200 text-stone-600">
            {paymentChannels.length}
          </span>
        </button>
      </div>

      {activeTab === 'transactions' ? (
        <>
          {/* Summary KPI Mini Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
              <span className="text-xs font-medium text-stone-500">Total Omzet Terbayar</span>
              <p className="mt-2 text-xl font-bold text-stone-900 font-mono">
                {formatRupiah(totalPaidRevenue)}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium mt-1 block">
                ✓ Transaksi berstatus Lunas
              </span>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
              <span className="text-xs font-medium text-stone-500">Menunggu Pembayaran</span>
              <p className="mt-2 text-xl font-bold text-amber-600 font-mono">
                {formatRupiah(pendingPaymentsTotal)}
              </p>
              <span className="text-[10px] text-amber-600 font-medium mt-1 block">
                {payments.filter(p => p.status === 'Belum Dibayar').length} tagihan belum diselesaikan
              </span>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
              <span className="text-xs font-medium text-stone-500">Total Transaksi</span>
              <p className="mt-2 text-xl font-bold text-stone-900 font-mono">
                {payments.length} Faktur
              </p>
              <span className="text-[10px] text-stone-400 mt-1 block">
                QRIS, Tunai, Kartu Debit & Transfer Bank
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <span className="text-[11px] font-semibold text-stone-400 mr-1 flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Status:
                </span>
                {['all', 'Belum Dibayar', 'Lunas', 'Dibatalkan'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                      filterStatus === st
                        ? 'bg-rose-600 text-white shadow-xs font-semibold'
                        : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {st === 'all' ? 'Semua Status' : st}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[260px]">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari faktur, pasien, No. RM, treatment..."
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            {/* Payment Method Filter */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[11px] font-semibold text-stone-400 mr-1">Metode Bayar:</span>
                {[
                  { id: 'all', label: 'Semua Metode' },
                  { id: 'QRIS', label: 'QRIS' },
                  { id: 'Cash', label: 'Tunai (Cash)' },
                  { id: 'Debit', label: 'Kartu Debit' },
                  { id: 'Transfer', label: 'Transfer Bank' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setFilterMethod(m.id)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                      filterMethod === m.id
                        ? 'bg-stone-800 text-white shadow-2xs font-semibold'
                        : 'bg-stone-100/70 text-stone-600 hover:bg-stone-200/60'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterMethod('all');
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Payment Table */}
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
                    <th className="py-3.5 px-3">No. Invoice & Pasien</th>
                    <th className="py-3.5 px-4">Treatment & Produk</th>
                    <th className="py-3.5 px-4">Total Biaya</th>
                    <th className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <span>Metode Bayar</span>
                        <span className="text-[10px] font-normal text-rose-600 bg-rose-50 px-1 rounded">
                          Bisa Diedit
                        </span>
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi & Kasir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {paginatedPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400">
                        Tidak ditemukan data pembayaran yang sesuai kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    paginatedPayments.map(p => {
                      const isChecked = selectedIds.includes(p.id);
                      return (
                        <tr
                          key={p.id}
                          onClick={() =>
                            setSelectedIds(prev =>
                              prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
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
                            onClick={e => handleToggleRow(p.id, e)}
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

                          {/* Invoice & Patient */}
                          <td className="py-3.5 px-3">
                            <span className="font-mono font-bold text-stone-900 block text-xs">
                              {p.invoiceNumber}
                            </span>
                            <span className="text-stone-800 font-semibold">{p.patientName}</span>
                            <span className="text-[11px] text-rose-700 font-mono block font-medium">
                              {p.patientRm}
                            </span>
                          </td>

                          {/* Treatment & Products */}
                          <td className="py-3.5 px-4 text-stone-600">
                            <span className="font-medium text-stone-900 block">{p.treatmentName}</span>
                            <span className="text-[11px] text-stone-500 font-mono">
                              {formatRupiah(p.treatmentPrice)}
                            </span>
                            {p.additionalProducts && p.additionalProducts.length > 0 && (
                              <span className="text-[10px] text-purple-700 block mt-0.5">
                                +{p.additionalProducts.length} produk skincare tambahan
                              </span>
                            )}
                          </td>

                          {/* Total Amount */}
                          <td className="py-3.5 px-4">
                            {p.discount > 0 && (
                              <span className="text-[10px] text-red-600 line-through font-mono block">
                                {formatRupiah(p.subtotal || p.treatmentPrice)}
                              </span>
                            )}
                            <span className="font-bold text-stone-900 font-mono text-sm block">
                              {formatRupiah(p.totalAmount)}
                            </span>
                            {p.discount > 0 && (
                              <span className="text-[10px] text-emerald-700">
                                Hemat {formatRupiah(p.discount)}
                              </span>
                            )}
                          </td>

                          {/* Payment Method Cell with Quick Edit Trigger */}
                          <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                              {p.paymentMethod ? (
                                <button
                                  onClick={() => handleEditPaymentMethod(p)}
                                  title="Klik untuk mengubah metode pembayaran"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-800 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-900 transition-all shadow-2xs group/btn cursor-pointer"
                                >
                                  {getMethodIcon(p.paymentMethod)}
                                  <span>{p.paymentMethod}</span>
                                  <Edit2 className="h-3 w-3 text-stone-400 group-hover/btn:text-rose-600 ml-0.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleEditPaymentMethod(p)}
                                  className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-medium underline underline-offset-2 cursor-pointer"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>Set Metode</span>
                                </button>
                              )}
                            </div>

                            {/* Reference Number / Subtitle */}
                            {p.referenceNumber && (
                              <span
                                className="text-[10px] text-stone-400 font-mono block mt-1 truncate max-w-[140px]"
                                title={p.referenceNumber}
                              >
                                Ref: {p.referenceNumber}
                              </span>
                            )}
                            {p.paymentChannelName && (
                              <span className="text-[9px] text-stone-500 block truncate max-w-[140px]">
                                {p.paymentChannelName}
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                                p.status
                              )}`}
                            >
                              {p.status}
                            </span>
                          </td>

                          {/* Action Buttons: Bayar, Edit Metode, Struk, PDF, Hapus */}
                          <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* If pending, show pay button */}
                              {p.status === 'Belum Dibayar' && (
                                <button
                                  onClick={() => handlePayNow(p)}
                                  className="flex h-7 items-center gap-1 rounded-lg bg-rose-600 px-2.5 text-white hover:bg-rose-700 text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
                                  title="Proses Pembayaran Kasir Sekarang"
                                >
                                  <CreditCard className="h-3.5 w-3.5" />
                                  <span>Bayar</span>
                                </button>
                              )}

                              {/* Tombol Edit Metode Pembayaran */}
                              <button
                                onClick={() => handleEditPaymentMethod(p)}
                                className="flex h-7 items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/60 px-2 text-rose-700 hover:bg-rose-100 hover:text-rose-800 text-xs font-medium transition-colors cursor-pointer"
                                title="Ubah Metode Pembayaran & Rincian Transaksi"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-rose-600" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>

                              {/* Cetak Struk Modal */}
                              <button
                                onClick={() => openModal('print-receipt', p)}
                                className="flex h-7 items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 text-stone-700 hover:bg-stone-50 hover:text-stone-900 text-xs font-medium cursor-pointer"
                                title="Buka & Cetak Struk Kasir"
                              >
                                <Printer className="h-3.5 w-3.5 text-stone-500" />
                                <span>Struk</span>
                              </button>

                              {/* Direct Download PDF Receipt */}
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  const fn = downloadReceiptPdf(p, settings);
                                  showToast(`Struk ${p.invoiceNumber} berhasil diunduh sebagai PDF: ${fn}`);
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-2xs cursor-pointer"
                                title="Unduh Struk Langsung sebagai File PDF"
                              >
                                <FileDown className="h-3.5 w-3.5" />
                              </button>

                              {/* Delete Payment Button */}
                              <button
                                onClick={e => handleOpenSingleDelete(p, e)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                                title="Hapus Faktur Tagihan"
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

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200/80 bg-stone-50/50 px-4 py-3 text-xs">
              {/* Left: Info & PageSize Selector */}
              <div className="flex flex-wrap items-center gap-3 text-stone-600">
                <span>
                  Menampilkan{' '}
                  <strong className="text-stone-900 font-semibold">
                    {filteredPayments.length === 0 ? 0 : startIndex + 1}
                  </strong>{' '}
                  - <strong className="text-stone-900 font-semibold">{endIndex}</strong> dari{' '}
                  <strong className="text-stone-900 font-semibold">{filteredPayments.length}</strong>{' '}
                  faktur
                  {selectedIds.length > 0 && (
                    <span className="text-rose-600 font-semibold ml-2">
                      ({selectedIds.length} dipilih)
                    </span>
                  )}
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

              {/* Right: Navigation Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Halaman Pertama"
                >
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

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

                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

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
        </>
      ) : (
        /* Tab 2: Konfigurasi & Master Metode Pembayaran */
        <div className="space-y-4">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-rose-600" />
                <span>Daftar Saluran & Rekening Pembayaran Klinik</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Konfigurasi rekening bank resmi, QRIS statis/dinamis kasir, dan mesin EDC kartu debit.
              </p>
            </div>
            <button
              onClick={() => handleOpenChannelModal()}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Metode Baru</span>
            </button>
          </div>

          {/* Channel Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentChannels.map(ch => (
              <div
                key={ch.id}
                className={`rounded-2xl border p-4 shadow-xs transition-all relative flex flex-col justify-between ${
                  ch.isActive
                    ? 'border-stone-200/80 bg-white hover:border-rose-300'
                    : 'border-stone-200 bg-stone-50/70 opacity-70'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 border border-rose-100">
                        {getMethodIcon(ch.type)}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-xs">{ch.name}</h4>
                        <span className="font-mono text-[10px] text-stone-500">{ch.provider}</span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        ch.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-stone-200/70 text-stone-600 border-stone-300'
                      }`}
                    >
                      {ch.isActive ? 'Aktif' : 'Non-aktif'}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="py-3 space-y-2 text-xs">
                    {ch.accountNumber && ch.accountNumber !== '-' && (
                      <div>
                        <span className="text-[10px] text-stone-400 block">No. Rekening / NMID:</span>
                        <span className="font-mono font-bold text-stone-800 text-[11px]">
                          {ch.accountNumber}
                        </span>
                      </div>
                    )}

                    {ch.accountHolder && (
                      <div>
                        <span className="text-[10px] text-stone-400 block">Atas Nama:</span>
                        <span className="font-semibold text-stone-700 text-[11px]">
                          {ch.accountHolder}
                        </span>
                      </div>
                    )}

                    {ch.instructions && (
                      <div className="pt-1">
                        <span className="text-[10px] text-stone-400 block">Petunjuk Kasir:</span>
                        <p className="text-[11px] text-stone-600 italic bg-stone-50 p-2 rounded-lg border border-stone-100">
                          "{ch.instructions}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons: Quick Toggle, Edit, Delete */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  {/* Quick Toggle */}
                  <label className="flex items-center gap-1.5 text-[11px] text-stone-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={ch.isActive}
                      onChange={e => updatePaymentChannel(ch.id, { isActive: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                    />
                    <span>{ch.isActive ? 'Aktif' : 'Non-aktif'}</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenChannelModal(ch)}
                      className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-2xs cursor-pointer"
                      title="Edit Saluran Pembayaran"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-rose-600" />
                      <span>Edit</span>
                    </button>

                    {/* Delete Channel Button */}
                    <button
                      onClick={e => handleOpenDeleteChannel(ch, e)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                      title={`Hapus Saluran ${ch.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete Payment (Single & Multiple) */}
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
                      ? 'Konfirmasi Hapus Faktur Pembayaran'
                      : 'Konfirmasi Hapus Massal Pembayaran'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Tindakan ini menghapus data tagihan kasir dari database
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
              {deleteModal.type === 'single' && deleteModal.payment ? (
                <div className="space-y-3">
                  <p className="text-stone-600">
                    Apakah Anda yakin ingin menghapus faktur transaksi tagihan berikut?
                  </p>

                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 font-bold shrink-0">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono font-bold text-stone-900 text-xs">
                          {deleteModal.payment.invoiceNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatusBadge(
                            deleteModal.payment.status
                          )}`}
                        >
                          {deleteModal.payment.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm truncate mt-0.5">
                        {deleteModal.payment.patientName} ({deleteModal.payment.patientRm})
                      </h4>
                      <div className="flex items-center justify-between mt-1 text-stone-600 text-[11px]">
                        <span className="truncate mr-2">{deleteModal.payment.treatmentName}</span>
                        <span className="font-mono font-bold text-stone-900 shrink-0">
                          {formatRupiah(deleteModal.payment.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800 flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      Peringatan: Faktur yang dihapus tidak akan lagi tercatat dalam laporan omzet kasir dan laporan keuangan berkala.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-stone-600">
                    Anda akan menghapus <strong>{selectedIds.length} faktur tagihan kasir terpilih</strong> secara bersamaan:
                  </p>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-xl border border-stone-200 bg-stone-50/50 p-2.5">
                    {selectedPaymentsList.map(p => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-stone-200/80 text-[11px]"
                      >
                        <div className="truncate mr-2">
                          <span className="font-mono text-[10px] text-stone-500 font-bold mr-1.5">
                            {p.invoiceNumber}
                          </span>
                          <span className="font-medium text-stone-800">{p.patientName}</span>
                        </div>
                        <span className="font-mono text-stone-900 font-bold shrink-0">
                          {formatRupiah(p.totalAmount)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-[11px] text-red-800 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                    <span>
                      Peringatan: Seluruh rekonsiliasi pembayaran dari{' '}
                      <strong>{selectedIds.length} transaksi</strong> ini akan dihapus permanen.
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
                      ? 'Ya, Hapus Faktur'
                      : `Ya, Hapus ${selectedIds.length} Faktur`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete Channel */}
      {deleteChannelModal.isOpen && deleteChannelModal.channel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 bg-red-50/60 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Hapus Saluran Pembayaran</h3>
                  <p className="text-[11px] text-stone-500">Konfirmasi hapus master rekening</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteChannelModal({ isOpen: false })}
                className="rounded-xl p-1.5 text-stone-400 hover:bg-white hover:text-stone-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-stone-600">
                Apakah Anda yakin ingin menghapus saluran pembayaran{' '}
                <strong className="text-stone-900">{deleteChannelModal.channel.name}</strong> ({deleteChannelModal.channel.type})?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setDeleteChannelModal({ isOpen: false })}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteChannel}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Ya, Hapus Saluran</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Header Struk Modal */}
      {isEditingHeader && (
        <EditReceiptHeaderModal
          onClose={() => setIsEditingHeader(false)}
          onSaved={() => {
            showToast('Header struk dan bukti pembayaran berhasil diperbarui!');
          }}
        />
      )}
    </div>
  );
};
