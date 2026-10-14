import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Star,
  Calendar,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Clock,
  Camera,
  AlertTriangle,
  X,
  CheckCircle2,
  ShieldAlert,
  CheckSquare,
  Square,
  MinusSquare,
  Stethoscope,
  LayoutDashboard,
  KeyRound,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Doctor } from '../../../types';

interface DoctorsViewProps {
  onNavigate?: (menu: string) => void;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({ onNavigate }) => {
  const {
    doctors,
    deleteDoctor,
    deleteMultipleDoctors,
    openModal,
    switchUser,
    currentUser,
    isMyDoctorData
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'multiple';
    doctor?: Doctor;
    count?: number;
  }>({
    isOpen: false,
    type: 'single'
  });

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const DEFAULT_FALLBACK_AVATAR =
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256';

  const filteredDoctors = useMemo(() => {
    return doctors.filter(
      doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.sipNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.phone.includes(searchQuery)
    );
  }, [doctors, searchQuery]);

  const filteredIds = useMemo(() => filteredDoctors.map(d => d.id), [filteredDoctors]);
  const isAllSelected = filteredIds.length > 0 && filteredIds.every(id => selectedIds.includes(id));
  const isPartiallySelected =
    filteredIds.some(id => selectedIds.includes(id)) && !isAllSelected;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleToggleDoctorSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOpenSingleDelete = (doc: Doctor, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      type: 'single',
      doctor: doc
    });
  };

  const handleOpenMultiDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      type: 'multiple',
      count: selectedIds.length
    });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.type === 'single' && deleteModal.doctor) {
      const doc = deleteModal.doctor;
      deleteDoctor(doc.id);
      setSelectedIds(prev => prev.filter(id => id !== doc.id));
      showToast(`Data dokter ${doc.name} berhasil dihapus.`);
    } else if (deleteModal.type === 'multiple') {
      const count = selectedIds.length;
      deleteMultipleDoctors(selectedIds);
      setSelectedIds([]);
      showToast(`${count} data dokter berhasil dihapus.`);
    }

    setDeleteModal({ isOpen: false, type: 'single' });
  };

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  const selectedDoctorsList = useMemo(() => {
    return doctors.filter(d => selectedIds.includes(d.id));
  }, [doctors, selectedIds]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <span>Data Dokter Spesialis & Estetika</span>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 font-mono">
              {doctors.length} Dokter
            </span>
          </h2>
          <p className="text-xs text-stone-500">
            Daftar tenaga medis berlisensi SIP, jadwal konsultasi mingguan, dan rating kepuasan
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleOpenMultiDelete}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition-all animate-in fade-in"
              title="Hapus dokter terpilih"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus Terpilih ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={() => openModal('doctor-form')}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Dokter Baru</span>
          </button>
        </div>
      </div>

      {/* Info Banner: Sistem Akun Mandiri Dokter */}
      <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-r from-rose-50 via-pink-50/60 to-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900 flex items-center gap-2">
                <span>Sistem Akun Mandiri Setiap Dokter Spesialis ({doctors.length} Dokter)</span>
                <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Data Terisolasi Per Dokter
                </span>
              </h3>
              <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                Setiap dokter spesialis memiliki akun login sendiri dengan data antrian pasien, jadwal praktik, janji temu (appointment), dan rekam medis yang terisolasi. Klik tombol <strong>"Masuk Akun"</strong> pada dokter mana pun untuk langsung beralih ke sesi kerja dokter tersebut, atau gunakan email dokter dan password <code className="bg-rose-100/70 text-rose-800 px-1 py-0.2 rounded font-mono text-[10px]">password</code> di halaman login.
              </p>
            </div>
          </div>
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
                {selectedIds.length} Dokter Dipilih
              </span>
              <span className="text-[11px] text-stone-500">
                Pilih opsi di sebelah kanan untuk menghapus dokter yang ditandai.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
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

      {/* Search & Select All Bar */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama dokter, spesialisasi, atau nomor SIP..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          {filteredDoctors.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleSelectAllToggle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 transition-colors"
              >
                {isAllSelected ? (
                  <CheckSquare className="h-4 w-4 text-rose-600" />
                ) : isPartiallySelected ? (
                  <MinusSquare className="h-4 w-4 text-rose-600" />
                ) : (
                  <Square className="h-4 w-4 text-stone-400" />
                )}
                <span>{isAllSelected ? 'Batalkan Semua' : 'Pilih Semua Dokter'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Doctors */}
      {filteredDoctors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-12 text-center text-stone-400 text-xs">
          <Stethoscope className="h-8 w-8 mx-auto mb-2 text-stone-300" />
          Tidak ditemukan dokter dengan kata kunci "{searchQuery}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map(doc => {
            const isChecked = selectedIds.includes(doc.id);
            const isCurrentActive = currentUser?.role === 'dokter' && isMyDoctorData(doc.id, doc.name);
            return (
              <div
                key={doc.id}
                onClick={e => handleToggleDoctorSelect(doc.id, e)}
                className={`rounded-2xl border bg-white p-5 shadow-xs flex flex-col justify-between transition-all cursor-pointer relative ${
                  isCurrentActive
                    ? 'border-emerald-400 bg-emerald-50/20 ring-2 ring-emerald-500/20 shadow-sm'
                    : isChecked
                    ? 'border-rose-400 bg-rose-50/30 ring-2 ring-rose-500/20 shadow-sm'
                    : 'border-stone-200/80 hover:border-rose-300'
                }`}
              >
                <div>
                  {/* Top Bar on Card: Checkbox & Rating */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={e => handleToggleDoctorSelect(doc.id, e)}
                      className="p-1 -ml-1 rounded text-stone-400 hover:text-stone-700 focus:outline-none"
                    >
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 text-rose-600" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {doc.rating}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {doc.totalPatients} Pasien
                      </span>
                    </div>
                  </div>

                  {/* Profile info */}
                  <div className="flex items-start gap-4">
                    <div className="relative group shrink-0" onClick={e => e.stopPropagation()}>
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        onError={e => {
                          (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_AVATAR;
                        }}
                        className={`h-16 w-16 rounded-2xl object-cover border shadow-xs bg-stone-100 ${
                          isCurrentActive ? 'border-2 border-emerald-500' : 'border-rose-100'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => openModal('doctor-form', doc)}
                        title="Klik untuk ubah foto profil dokter"
                        className="absolute inset-0 bg-stone-900/50 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-[9px] font-medium"
                      >
                        <Camera className="h-4 w-4 mb-0.5" />
                        <span>Ubah Foto</span>
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-stone-900 text-sm leading-snug">
                          {doc.name}
                        </h3>
                        {isCurrentActive && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            <span>Aktif</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-rose-700 font-medium mt-0.5 line-clamp-1">
                        {doc.specialization}
                      </p>
                      <p className="text-[10px] text-stone-400 font-mono mt-1">
                        {doc.sipNumber}
                      </p>
                    </div>
                  </div>

                  {/* Schedule and Contact */}
                  <div className="mt-4 pt-3 border-t border-stone-100 space-y-2 text-xs text-stone-600">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-stone-800">Hari Praktik:</span>{' '}
                        <span>{doc.schedule.days.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                      <span>
                        Jam:{' '}
                        <strong className="font-mono text-stone-800">
                          {doc.schedule.hours} WIB
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-stone-500 font-mono text-[11px]">
                      <Phone className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      <span>{doc.phone}</span>
                    </div>

                    {/* Dedicated Doctor Account Credentials Box */}
                    <div className={`mt-2 p-2.5 rounded-xl border text-[11px] ${
                      isCurrentActive
                        ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-500/20'
                        : 'bg-stone-50/80 border-stone-200'
                    }`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <KeyRound className="h-3 w-3 text-rose-600" />
                          <span>Akun Login Dokter</span>
                        </span>
                        {isCurrentActive ? (
                          <span className="text-[9px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            <span>Sedang Login</span>
                          </span>
                        ) : (
                          <span className="text-[9px] bg-stone-200 text-stone-600 font-semibold px-2 py-0.5 rounded-full">
                            Akun Aktif
                          </span>
                        )}
                      </div>
                      <div className="space-y-0.5 font-mono text-[10px]">
                        <div className="flex items-center justify-between text-stone-600 truncate">
                          <span className="text-stone-400">Email:</span>
                          <span className="font-bold text-stone-900 truncate ml-2">{doc.email}</span>
                        </div>
                        <div className="flex items-center justify-between text-stone-500">
                          <span className="text-stone-400">Password:</span>
                          <span className="text-stone-700 font-semibold">password</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-1.5"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2">
                    {isCurrentActive ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (onNavigate) onNavigate('dashboard');
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-emerald-400 bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-xs cursor-pointer active:scale-95"
                        title="Buka dashboard dokter yang sedang aktif"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        <span>Buka Dashboard</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          switchUser(doc.email);
                          if (onNavigate) onNavigate('dashboard');
                          showToast(`Berhasil masuk sebagai ${doc.name}. Menampilkan dashboard & data terisolasi.`);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-all shadow-xs cursor-pointer active:scale-95"
                        title={`Masuk & buka sesi kerja ${doc.name}`}
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Masuk Akun</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openModal('doctor-form', doc)}
                      className="text-[11px] text-stone-400 hover:text-rose-600 flex items-center gap-1 transition-colors px-1"
                      title="Ganti foto profil dokter"
                    >
                      <Camera className="h-3 w-3" />
                      <span className="hidden sm:inline">Foto</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openModal('doctor-form', doc)}
                      className="flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={e => handleOpenSingleDelete(doc, e)}
                      className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-2xs"
                      title={`Hapus dokter ${doc.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Delete & Multi-Delete Doctor */}
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
                      ? 'Konfirmasi Hapus Dokter'
                      : 'Konfirmasi Hapus Massal Dokter'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Tindakan ini menghapus data dokter dari database klinik
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
              {deleteModal.type === 'single' && deleteModal.doctor ? (
                <div className="space-y-3">
                  <p className="text-stone-600">
                    Apakah Anda yakin ingin menghapus data dokter berikut dari sistem GlowCare?
                  </p>

                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 flex items-start gap-3">
                    <img
                      src={deleteModal.doctor.avatar}
                      alt={deleteModal.doctor.name}
                      onError={e => {
                        (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_AVATAR;
                      }}
                      className="h-12 w-12 rounded-xl object-cover border border-rose-100 shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-900 text-sm truncate">
                        {deleteModal.doctor.name}
                      </h4>
                      <span className="text-rose-700 font-medium block text-xs truncate">
                        {deleteModal.doctor.specialization}
                      </span>
                      <span className="text-stone-400 font-mono text-[10px] block mt-0.5">
                        {deleteModal.doctor.sipNumber} · {deleteModal.doctor.phone}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800 flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      Jadwal praktik dokter ini tidak akan ditampilkan lagi kepada pasien dan loket pendaftaran.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-stone-600">
                    Anda akan menghapus <strong>{selectedIds.length} data dokter terpilih</strong> secara bersamaan:
                  </p>

                  <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-xl border border-stone-200 bg-stone-50/50 p-2.5">
                    {selectedDoctorsList.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-stone-200/80 text-[11px]"
                      >
                        <span className="font-medium text-stone-800 truncate mr-2">
                          {doc.name}
                        </span>
                        <span className="font-mono text-rose-700 font-semibold shrink-0">
                          {doc.sipNumber}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-[11px] text-red-800 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                    <span>
                      Peringatan: Seluruh data lisensi dan jadwal konsultasi dari{' '}
                      <strong>{selectedIds.length} dokter</strong> ini akan dihapus dari sistem.
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
                      ? 'Ya, Hapus Dokter'
                      : `Ya, Hapus ${selectedIds.length} Dokter`}
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
