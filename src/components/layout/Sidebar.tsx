import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  HeartPulse,
  Sparkles,
  Package,
  ClipboardList,
  Clock,
  FileText,
  CreditCard,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Settings,
  History,
  Stethoscope,
  CalendarDays,
  UserCircle2,
  Printer,
  ChevronRight,
  X,
  Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface SidebarProps {
  currentMenu: string;
  onSelectMenu: (menuKey: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface MenuItem {
  key: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMenu,
  onSelectMenu,
  mobileOpen,
  onCloseMobile
}) => {
  const { currentUser, currentDoctor, isMyDoctorData, queues, appointments, ratings, payments } = useApp();
  const role: UserRole = currentUser?.role || 'admin';
  const isDoctor = role === 'dokter';

  // Compute live badges (isolated per doctor when logged in as doctor)
  const doctorQueues = isDoctor && currentDoctor ? queues.filter(q => isMyDoctorData(q.doctorId, q.doctorName)) : queues;
  const doctorAppointments = isDoctor && currentDoctor ? appointments.filter(a => isMyDoctorData(a.doctorId, a.doctorName)) : appointments;
  const doctorRatings = isDoctor && currentDoctor ? ratings.filter(r => isMyDoctorData(undefined, r.doctorName)) : ratings;

  const waitingQueuesCount = doctorQueues.filter(q => q.status === 'Menunggu' || q.status === 'Dipanggil').length;
  const pendingAppointmentsCount = doctorAppointments.filter(a => a.status === 'Menunggu' || a.status === 'Dikonfirmasi').length;
  const pendingRatingsCount = doctorRatings.filter(r => r.status === 'Menunggu').length;
  const pendingPaymentsCount = payments.filter(p => p.status === 'Belum Dibayar').length;

  const adminMenus: MenuItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'pasien', label: 'Data Pasien', icon: Users },
    { key: 'dokter', label: 'Data Dokter', icon: UserCheck },
    { key: 'perawat', label: 'Data Perawat', icon: HeartPulse },
    { key: 'treatment', label: 'Data Treatment', icon: Sparkles },
    { key: 'produk', label: 'Data Produk', icon: Package },
    { key: 'pendaftaran', label: 'Data Pendaftaran', icon: ClipboardList },
    { key: 'antrian', label: 'Data Antrian', icon: Clock, badge: waitingQueuesCount },
    { key: 'rekam-perawatan', label: 'Rekam Perawatan', icon: FileText },
    { key: 'pembayaran', label: 'Pembayaran', icon: CreditCard, badge: pendingPaymentsCount },
    { key: 'komentar', label: 'Komentar & Rating', icon: MessageSquare, badge: pendingRatingsCount },
    { key: 'laporan', label: 'Laporan', icon: BarChart3 },
    { key: 'pengguna', label: 'Pengguna', icon: ShieldCheck },
    { key: 'profil', label: 'Profil Akun', icon: UserCircle2 },
    { key: 'pengaturan', label: 'Pengaturan', icon: Settings },
    { key: 'neondb', label: 'Neon Database', icon: Database },
    { key: 'log-aktivitas', label: 'Log Aktivitas', icon: History }
  ];

  const dokterMenus: MenuItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'pasien-hari-ini', label: 'Pasien Hari Ini', icon: Users, badge: waitingQueuesCount },
    { key: 'antrian', label: 'Antrian', icon: Clock },
    { key: 'appointment', label: 'Appointment', icon: CalendarDays, badge: pendingAppointmentsCount },
    { key: 'pemeriksaan', label: 'Pemeriksaan', icon: Stethoscope },
    { key: 'rekam-perawatan', label: 'Rekam Perawatan', icon: FileText },
    { key: 'treatment', label: 'Treatment', icon: Sparkles },
    { key: 'riwayat-pasien', label: 'Riwayat Pasien', icon: History },
    { key: 'jadwal-saya', label: 'Jadwal Saya', icon: CalendarDays },
    { key: 'komentar-pasien', label: 'Komentar Pasien', icon: MessageSquare },
    { key: 'profil', label: 'Profil Dokter', icon: UserCircle2 }
  ];

  const loketMenus: MenuItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'pendaftaran-pasien', label: 'Pendaftaran Pasien', icon: ClipboardList },
    { key: 'pasien', label: 'Data Pasien', icon: Users },
    { key: 'appointment', label: 'Appointment', icon: CalendarDays, badge: pendingAppointmentsCount },
    { key: 'antrian', label: 'Antrian', icon: Clock, badge: waitingQueuesCount },
    { key: 'jadwal-dokter', label: 'Jadwal Dokter', icon: UserCheck },
    { key: 'pembayaran', label: 'Pembayaran', icon: CreditCard, badge: pendingPaymentsCount },
    { key: 'cetak-bukti', label: 'Cetak Bukti Pendaftaran', icon: Printer },
    { key: 'riwayat-pendaftaran', label: 'Riwayat Pendaftaran', icon: History },
    { key: 'profil', label: 'Profil Petugas', icon: UserCircle2 }
  ];

  const currentRoleMenus = role === 'admin' ? adminMenus : role === 'dokter' ? dokterMenus : loketMenus;

  const content = (
    <div className="flex h-full flex-col bg-white">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-stone-100 px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-400 text-white shadow-md shadow-rose-200">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="font-serif-display text-base font-bold tracking-tight text-stone-900 block leading-tight">
              GlowCare
            </span>
            <span className="text-[10px] font-medium text-rose-600 italic block tracking-wide">
              Beauty Clinic
            </span>
          </div>
        </div>

        <button
          onClick={onCloseMobile}
          className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-50 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Slogan banner */}
      <div className="mx-3 mt-3 rounded-lg bg-rose-50/70 px-3 py-2 text-center border border-rose-100/60">
        <p className="text-[11px] font-medium text-rose-900 italic">
          "Your Beauty, Our Care"
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Menu {role === 'admin' ? 'Admin' : role === 'dokter' ? 'Dokter' : 'Loket'}
        </div>

        {currentRoleMenus.map(item => {
          const Icon = item.icon;
          const isActive = currentMenu === item.key;

          return (
            <button
              key={item.key}
              onClick={() => {
                onSelectMenu(item.key);
                onCloseMobile();
              }}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-200'
                  : 'text-stone-600 hover:bg-rose-50/60 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-stone-400 group-hover:text-rose-600'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="h-3 w-3 text-white/70" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Role card */}
      <div className="border-t border-stone-100 p-3">
        <button
          onClick={() => {
            onSelectMenu('profil');
            onCloseMobile();
          }}
          className={`flex w-full items-center gap-3 rounded-xl p-2.5 transition-all cursor-pointer text-left ${
            currentMenu === 'profil'
              ? 'bg-rose-50 border border-rose-200 text-rose-900 shadow-2xs'
              : 'bg-stone-50 hover:bg-rose-50/70 border border-transparent'
          }`}
          title="Buka Profil Akun Saya"
        >
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-8 w-8 rounded-lg object-cover border border-rose-200"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700 text-xs font-bold uppercase">
              {role.substring(0, 2)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-stone-900 truncate">{currentUser?.name}</p>
            <p className="text-[10px] text-stone-500 capitalize">{currentUser?.department || role}</p>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="no-print hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 border-r border-stone-200 bg-white">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex w-72 max-w-full flex-1 flex-col shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
