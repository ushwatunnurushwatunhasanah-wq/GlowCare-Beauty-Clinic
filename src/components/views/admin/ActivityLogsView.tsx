import React, { useState } from 'react';
import {
  History,
  Search,
  User,
  ShieldCheck,
  Clock,
  Terminal
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { formatDateTimeId } from '../../../utils/formatters';

export const ActivityLogsView: React.FC = () => {
  const { activityLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = activityLogs.filter(log =>
    log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.ipAddress.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-stone-900">
          Log Aktivitas & Audit Keamanan Sistem
        </h2>
        <p className="text-xs text-stone-500">
          Catatan riwayat lengkap seluruh aksi operasional, login, perubahan rekam medis, dan transaksi klinik
        </p>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
        <div className="relative max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari aktivitas berdasarkan staf, aksi, atau target..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-9 pr-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-rose-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-600 font-semibold">
              <th className="py-3.5 px-4">Waktu & Tanggal</th>
              <th className="py-3.5 px-4">Nama Pengguna & Peran</th>
              <th className="py-3.5 px-4">Tindakan / Aksi</th>
              <th className="py-3.5 px-4">Target Entitas</th>
              <th className="py-3.5 px-4 text-right">Alamat IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-rose-50/20 transition-colors">
                <td className="py-3.5 px-4 text-stone-500">
                  {log.timestamp}
                </td>

                <td className="py-3.5 px-4">
                  <span className="font-bold text-stone-900 font-sans block">{log.userName}</span>
                  <span className="text-[10px] text-rose-700 uppercase font-semibold">{log.userRole}</span>
                </td>

                <td className="py-3.5 px-4 font-sans font-medium text-stone-800">
                  {log.action}
                </td>

                <td className="py-3.5 px-4 font-sans text-stone-600">
                  {log.target}
                </td>

                <td className="py-3.5 px-4 text-right text-stone-400">
                  {log.ipAddress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
