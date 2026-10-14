import React, { useState } from 'react';
import {
  Bell,
  Search,
  UserCheck,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  CheckCheck,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  currentMenuTitle: string;
  onNavigate: (menuKey: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar, currentMenuTitle, onNavigate }) => {
  const {
    currentUser,
    currentDoctor,
    isMyDoctorData,
    logout,
    switchRole,
    switchUser,
    doctors,
    notifications,
    markNotifAsRead,
    markAllNotifsRead,
    openModal,
    neonConfig
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    onNavigate('dashboard');
    setShowRoleMenu(false);
  };

  const getRoleBadge = (user?: User | null) => {
    if (!user) return { label: 'Staff', bg: 'bg-stone-100 text-stone-800 border-stone-200' };
    switch (user.role) {
      case 'admin':
        return { label: 'Admin Utama', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'dokter':
        return {
          label: currentDoctor ? currentDoctor.name.split(',')[0] : user.name.split(',')[0],
          bg: 'bg-rose-100 text-rose-800 border-rose-200'
        };
      case 'loket':
        return { label: 'Loket Pendaftaran', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: 'Staff', bg: 'bg-stone-100 text-stone-800 border-stone-200' };
    }
  };

  const badge = getRoleBadge(currentUser);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur md:px-6">
      {/* Left zone: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 md:hidden"
          aria-label="Buka Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-medium text-stone-400 sm:inline">GlowCare</span>
          <span className="hidden text-xs text-stone-300 sm:inline">/</span>
          <h1 className="text-sm font-semibold tracking-tight text-stone-900 md:text-base">
            {currentMenuTitle}
          </h1>
        </div>
      </div>

      {/* Right zone: Actions & Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick action buttons depending on role */}
        {currentUser?.role === 'loket' && (
          <button
            onClick={() => openModal('new-registration')}
            className="hidden items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 sm:flex"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Pendaftaran Baru</span>
          </button>
        )}

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => openModal('patient-review-modal')}
            className="hidden items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 sm:flex"
            title="Formulir Review Pasien (Simulasi Kepuasan)"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>+ Review Pasien</span>
          </button>
        )}

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => onNavigate('neondb')}
            className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors lg:flex cursor-pointer ${
              neonConfig.isConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
            title={neonConfig.isConnected ? `Neon Database Terhubung (${neonConfig.databaseName || 'neondb'})` : 'Konfigurasi Neon Database (neondb.com)'}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                neonConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
              }`}
            />
            <span className="font-mono text-[10px] font-bold">Neon DB</span>
          </button>
        )}

        {/* Role Switcher Pill Dropdown (Easy for user testing) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${badge.bg}`}
          >
            <UserCheck className="h-3 w-3" />
            <span>{badge.label}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Ganti Peran / Akun Aktif
              </div>

              <button
                onClick={() => handleRoleSelect('admin')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors cursor-pointer ${
                  currentUser?.role === 'admin' ? 'bg-purple-100 text-purple-900' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span>Admin Utama (Nur Ushwatun)</span>
                {currentUser?.role === 'admin' && (
                  <span className="text-[10px] text-purple-700 font-bold bg-white/70 px-1.5 py-0.5 rounded">
                    Aktif
                  </span>
                )}
              </button>

              <button
                onClick={() => handleRoleSelect('loket')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors cursor-pointer ${
                  currentUser?.role === 'loket' ? 'bg-amber-100 text-amber-900' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span>Loket Pendaftaran (Rina)</span>
                {currentUser?.role === 'loket' && (
                  <span className="text-[10px] text-amber-700 font-bold bg-white/70 px-1.5 py-0.5 rounded">
                    Aktif
                  </span>
                )}
              </button>

              <div className="mt-2 pt-2 border-t border-stone-100">
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1">
                  <UserCheck className="h-3 w-3" />
                  <span>Pilih Akun Dokter ({doctors.length})</span>
                </div>
                <div className="space-y-0.5 max-h-56 overflow-y-auto">
                  {doctors.map(doc => {
                    const isDoctorActive =
                      currentUser?.role === 'dokter' && isMyDoctorData(doc.id, doc.name);
                    return (
                      <button
                        key={doc.id}
                        onClick={() => {
                          switchUser(doc.email);
                          onNavigate('dashboard');
                          setShowRoleMenu(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                          isDoctorActive
                            ? 'bg-rose-100 text-rose-900 font-bold'
                            : 'text-stone-700 hover:bg-rose-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={doc.avatar}
                            alt={doc.name}
                            className="h-6 w-6 rounded-full object-cover shrink-0 border border-stone-200"
                            onError={e => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256';
                            }}
                          />
                          <span className="truncate text-[11px]">{doc.name}</span>
                        </div>
                        {isDoctorActive && (
                          <span className="text-[9px] text-rose-700 font-bold bg-white/80 px-1.5 py-0.2 rounded shrink-0">
                            Aktif
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50"
            aria-label="Pemberitahuan"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-stone-200 bg-white shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-800">Notifikasi Klinik</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotifsRead}
                    className="flex items-center gap-1 text-[11px] font-medium text-stone-500 hover:text-stone-800"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-400">Tidak ada notifikasi</div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotifAsRead(notif.id);
                        if (notif.linkMenu) onNavigate(notif.linkMenu);
                        setShowNotifMenu(false);
                      }}
                      className={`cursor-pointer p-3.5 transition-colors hover:bg-rose-50/50 ${
                        !notif.isRead ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-stone-900">{notif.title}</p>
                        <span className="text-[10px] whitespace-nowrap text-stone-400">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-stone-600 line-clamp-2">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-stone-50"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
              alt={currentUser?.name || 'User'}
              className="h-8 w-8 rounded-full border border-stone-200 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="hidden text-left lg:block">
              <p className="text-xs font-semibold text-stone-900 line-clamp-1">{currentUser?.name}</p>
              <p className="text-[10px] text-stone-500">{currentUser?.email}</p>
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-stone-400 lg:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl z-50">
              <div className="border-b border-stone-100 px-3 py-2">
                <p className="text-xs font-semibold text-stone-900">{currentUser?.name}</p>
                <p className="text-[11px] text-stone-500">{currentUser?.department || currentUser?.role}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigate('profil');
                    setShowProfileMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-stone-700 hover:bg-stone-50"
                >
                  <UserCheck className="h-3.5 w-3.5 text-stone-400" />
                  <span>Profil Akun</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('pengaturan');
                    setShowProfileMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-stone-700 hover:bg-stone-50"
                >
                  <Sparkles className="h-3.5 w-3.5 text-stone-400" />
                  <span>Pengaturan Klinik</span>
                </button>
              </div>

              <div className="border-t border-stone-100 pt-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
