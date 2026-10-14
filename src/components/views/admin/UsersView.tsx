import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  UserCheck,
  Mail,
  Phone,
  KeyRound,
  CheckCircle,
  XCircle,
  Building,
  Edit2,
  Trash2,
  Filter,
  User as UserIcon,
  Stethoscope
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { User, UserRole } from '../../../types';

export const UsersView: React.FC = () => {
  const { users, openModal, updateUser, deleteUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.phone && u.phone.includes(searchQuery));
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'dokter':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'loket':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    updateUser(user.id, { status: newStatus });
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === 'usr-1') {
      alert('Akun admin utama tidak dapat dihapus.');
      return;
    }
    if (window.confirm(`Hapus akun pengguna "${user.name}"?`)) {
      deleteUser(user.id);
    }
  };

  const countDoctors = users.filter(u => u.role === 'dokter').length;
  const countAdmins = users.filter(u => u.role === 'admin').length;
  const countLoket = users.filter(u => u.role === 'loket').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <span>Manajemen Pengguna Sistem (RBAC)</span>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800 font-mono">
              {users.length} Akun
            </span>
          </h2>
          <p className="text-xs text-stone-500">
            Pengaturan akun staf, hak akses berbasis peran (Admin, Dokter, Loket Pendaftaran)
          </p>
        </div>

        <button
          type="button"
          onClick={() => openModal('user-form')}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
          title="Tambah Akun Pengguna Baru"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Role Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-semibold text-stone-400 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Peran:
            </span>
            {[
              { id: 'all', label: `Semua (${users.length})` },
              { id: 'dokter', label: `Dokter (${countDoctors})` },
              { id: 'admin', label: `Admin (${countAdmins})` },
              { id: 'loket', label: `Loket (${countLoket})` }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setFilterRole(r.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                  filterRole === r.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, spesialisasi..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-8 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
        </div>
      </div>

      {/* Grid of Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-stone-200 bg-white p-8 text-center text-stone-400 text-xs">
            Tidak ada pengguna yang sesuai dengan pencarian "{searchQuery}".
          </div>
        ) : (
          filteredUsers.map(user => (
            <div
              key={user.id}
              className={`rounded-2xl border bg-white p-5 shadow-xs flex flex-col justify-between hover:border-rose-300 transition-all ${
                user.status === 'active' ? 'border-stone-200/80' : 'border-stone-200 bg-stone-50/60 opacity-80'
              }`}
            >
              <div>
                {/* Avatar and Role */}
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256'}
                      alt={user.name}
                      className="h-16 w-16 rounded-2xl object-cover border-2 border-rose-100 shadow-xs bg-stone-100"
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256';
                      }}
                      referrerPolicy="no-referrer"
                    />
                    {user.role === 'dokter' && (
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white shadow-2xs">
                        <Stethoscope className="h-3 w-3" />
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                    <button
                      type="button"
                      onClick={() => openModal('user-form', user)}
                      className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-rose-600 font-medium py-0.5 px-1.5 rounded-md hover:bg-stone-50 transition-colors"
                      title="Edit Data Pengguna"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                {/* Name & Department */}
                <div className="mt-4">
                  <h3 className="font-bold text-stone-900 text-sm leading-tight">{user.name}</h3>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-1 truncate" title={user.department}>
                    <Building className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{user.department || '-'}</span>
                  </p>
                </div>

                {/* Contact Details */}
                <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span className="font-mono text-[11px]">{user.phone || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                {/* Status Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleStatus(user)}
                  className={`font-semibold flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
                    user.status === 'active'
                      ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      : 'text-stone-500 bg-stone-100 hover:bg-stone-200'
                  }`}
                  title="Klik untuk mengubah status aktif"
                >
                  {user.status === 'active' ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Status Aktif</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 text-stone-400" />
                      <span>Non-aktif</span>
                    </>
                  )}
                </button>

                {/* Reset Password */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openModal('reset-password-modal', user)}
                    className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-semibold px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
                    title={`Reset kata sandi untuk ${user.name}`}
                  >
                    <KeyRound className="h-3.5 w-3.5 text-stone-400" />
                    <span>Reset Sandi</span>
                  </button>

                  {user.id !== 'usr-1' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(user)}
                      className="text-stone-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      title="Hapus Pengguna"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
