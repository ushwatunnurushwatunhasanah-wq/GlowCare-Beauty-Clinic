import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Server,
  Layers,
  Zap,
  Clock,
  ShieldCheck,
  Code2
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { getNeonSchemaSQL } from '../../../services/neonService';

export const NeonDatabaseSettings: React.FC = () => {
  const {
    neonConfig,
    updateNeonConfig,
    testNeon,
    initNeonDatabase,
    pushDataToNeon,
    pullDataFromNeon
  } = useApp();

  const [connStringInput, setConnStringInput] = useState(neonConfig.connectionString || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleTestConnection = async () => {
    if (!connStringInput.trim()) {
      setFeedback({ type: 'error', message: 'Silakan masukkan Connection String Neon terlebih dahulu.' });
      return;
    }
    setIsTesting(true);
    setFeedback(null);
    try {
      updateNeonConfig({ connectionString: connStringInput.trim() });
      const result = await testNeon(connStringInput.trim());
      if (result.success) {
        setFeedback({
          type: 'success',
          message: `${result.message} ${result.databaseName ? `(Database: ${result.databaseName})` : ''}`
        });
      } else {
        setFeedback({
          type: 'error',
          message: result.message
        });
      }
    } catch (e: any) {
      setFeedback({
        type: 'error',
        message: e?.message || 'Terjadi kesalahan saat menguji koneksi Neon.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleInitDatabase = async () => {
    setIsInitializing(true);
    setFeedback(null);
    try {
      const res = await initNeonDatabase();
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.message
        });
      }
    } catch (e: any) {
      setFeedback({
        type: 'error',
        message: e?.message || 'Gagal inisialisasi tabel di Neon.'
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handlePushData = async () => {
    setIsPushing(true);
    setFeedback(null);
    try {
      const res = await pushDataToNeon();
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.message
        });
      }
    } catch (e: any) {
      setFeedback({
        type: 'error',
        message: e?.message || 'Gagal sinkronisasi data ke Neon.'
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handlePullData = async () => {
    if (!window.confirm('Tarik data dari Neon akan memperbarui data lokal dengan data terkini di database Neon. Lanjutkan?')) {
      return;
    }
    setIsPulling(true);
    setFeedback(null);
    try {
      const res = await pullDataFromNeon();
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.message
        });
      }
    } catch (e: any) {
      setFeedback({
        type: 'error',
        message: e?.message || 'Gagal menarik data dari Neon.'
      });
    } finally {
      setIsPulling(false);
    }
  };

  const handleCopySql = () => {
    const sql = getNeonSchemaSQL();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const sqlCode = getNeonSchemaSQL();

  return (
    <div className="space-y-6">
      {/* Neon Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-stone-900 via-stone-900 to-emerald-950 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Database className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>Neon PostgreSQL Integration</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-stone-950">
                  neondb.com
                </span>
              </h3>
            </div>
            <p className="text-xs text-stone-300 max-w-xl">
              Hubungkan sistem informasi klinik GlowCare secara langsung ke serverless PostgreSQL di <strong>Neon (neondb.com)</strong> untuk penyimpanan data persisten, aman, dan dapat diakses bersama secara cloud.
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-start md:items-end gap-1.5">
            {neonConfig.isConnected ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Terhubung ke Neon Cloud</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-stone-800/80 border border-stone-700 px-3.5 py-1.5 text-xs font-medium text-stone-400">
                <span className="h-2 w-2 rounded-full bg-stone-500" />
                <span>Belum Terhubung</span>
              </div>
            )}
            {neonConfig.lastSyncTime && (
              <span className="text-[10px] text-stone-400 flex items-center gap-1">
                <Clock className="h-3 w-3 text-emerald-400" />
                <span>Sync terakhir: {neonConfig.lastSyncTime}</span>
              </span>
            )}
          </div>
        </div>

        {/* Quick Metrics Bar if connected */}
        {neonConfig.isConnected && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-800 text-xs">
            <div className="rounded-xl bg-stone-800/50 p-2.5 border border-stone-700/50">
              <span className="text-[10px] text-stone-400 block">Database</span>
              <span className="font-semibold text-emerald-300">{neonConfig.databaseName || 'neondb'}</span>
            </div>
            <div className="rounded-xl bg-stone-800/50 p-2.5 border border-stone-700/50">
              <span className="text-[10px] text-stone-400 block">Serverless Latency</span>
              <span className="font-semibold text-emerald-300">{neonConfig.latencyMs ? `${neonConfig.latencyMs} ms` : '~ Fast'}</span>
            </div>
            <div className="rounded-xl bg-stone-800/50 p-2.5 border border-stone-700/50">
              <span className="text-[10px] text-stone-400 block">Tipe Mesin</span>
              <span className="font-semibold text-emerald-300">{neonConfig.pgVersion || 'PostgreSQL 17+'}</span>
            </div>
            <div className="rounded-xl bg-stone-800/50 p-2.5 border border-stone-700/50">
              <span className="text-[10px] text-stone-400 block">Protokol Driver</span>
              <span className="font-semibold text-emerald-300">@neondatabase/serverless</span>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`rounded-2xl p-4 border text-xs flex items-start gap-3 transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium leading-relaxed">{feedback.message}</div>
          <button
            onClick={() => setFeedback(null)}
            className="text-stone-400 hover:text-stone-700 text-xs cursor-pointer font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Configuration Form */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-stone-900">Konfigurasi Koneksi Neon PostgreSQL</h4>
          </div>
          <a
            href="https://console.neon.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <span>Buka Console Neon</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Connection String Input */}
        <div className="space-y-1.5 text-xs">
          <label className="block font-semibold text-stone-800">
            Neon Connection String (URI Database)
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={connStringInput}
              onChange={e => setConnStringInput(e.target.value)}
              placeholder="postgresql://user:password@ep-sample-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/60 p-3 pr-24 font-mono text-[11px] text-stone-900 focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-stone-500">
            Dapatkan connection string dari dashboard Neon pada tab <strong>Connection Details</strong> (pilih opsi <code>Postgres</code> connection string).
          </p>
        </div>

        {/* Action Buttons: Test Connection & Save */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !connStringInput.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Menguji Koneksi...' : 'Uji & Simpan Koneksi'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <Code2 className="h-3.5 w-3.5 text-stone-500" />
              <span>Lihat Skrip SQL Tabel</span>
            </button>
          </div>

          {/* Auto sync switch */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-stone-700 font-medium">
            <input
              type="checkbox"
              checked={neonConfig.autoSync}
              onChange={e => updateNeonConfig({ autoSync: e.target.checked })}
              className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Auto-Sync Realtime</span>
          </label>
        </div>
      </div>

      {/* Database Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Operation 1: Init Tables */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Layers className="h-4 w-4" />
            </div>
            <h5 className="text-xs font-bold text-stone-900">1. Inisialisasi Tabel Neon</h5>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Membuat struktur 15 tabel PostgreSQL (pasien, dokter, antrian, rekam medis, pembayaran, pengaturan) di Neon secara otomatis.
            </p>
          </div>
          <button
            type="button"
            onClick={handleInitDatabase}
            disabled={isInitializing || !connStringInput.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Zap className={`h-3.5 w-3.5 ${isInitializing ? 'animate-bounce' : ''}`} />
            <span>{isInitializing ? 'Membuat Tabel...' : 'Buat Tabel di Neon'}</span>
          </button>
        </div>

        {/* Operation 2: Push Data */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
              <UploadCloud className="h-4 w-4" />
            </div>
            <h5 className="text-xs font-bold text-stone-900">2. Kirim Data ke Neon (Push)</h5>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Mengunggah seluruh data klinik saat ini (rekam medis, pasien, tagihan, antrian) ke database cloud Neon PostgreSQL.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePushData}
            disabled={isPushing || !connStringInput.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-3 py-2 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <UploadCloud className={`h-3.5 w-3.5 ${isPushing ? 'animate-spin' : ''}`} />
            <span>{isPushing ? 'Mengunggah Data...' : 'Kirim Semua Data ke Neon'}</span>
          </button>
        </div>

        {/* Operation 3: Pull Data */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
              <DownloadCloud className="h-4 w-4" />
            </div>
            <h5 className="text-xs font-bold text-stone-900">3. Tarik Data dari Neon (Pull)</h5>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Mengambil dan memperbarui data aplikasi dengan rekaman terbaru yang tersimpan di Neon PostgreSQL.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePullData}
            disabled={isPulling || !connStringInput.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <DownloadCloud className={`h-3.5 w-3.5 ${isPulling ? 'animate-spin' : ''}`} />
            <span>{isPulling ? 'Menarik Data...' : 'Tarik Data dari Neon'}</span>
          </button>
        </div>
      </div>

      {/* 3 Steps Guide to Connect Neon */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2 pb-2 border-b border-stone-100">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Panduan Cepat Menghubungkan ke Neon (neondb.com)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
              1
            </span>
            <div className="font-semibold text-stone-900">Daftar / Buat Project</div>
            <p className="text-[11px] text-stone-500">
              Buka <a href="https://console.neon.tech" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline font-medium">console.neon.tech</a>, buat project baru (bebas biaya/Free Tier).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
              2
            </span>
            <div className="font-semibold text-stone-900">Salin Connection String</div>
            <p className="text-[11px] text-stone-500">
              Pada dashboard Neon, temukan card <strong>Connection Details</strong> dan salin URI lengkap berawalan <code>postgresql://...</code>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
              3
            </span>
            <div className="font-semibold text-stone-900">Tempel & Uji Koneksi</div>
            <p className="text-[11px] text-stone-500">
              Tempelkan pada kolom di atas, klik <strong>Uji & Simpan Koneksi</strong>, lalu klik <strong>Buat Tabel di Neon</strong>. Selesai!
            </p>
          </div>
        </div>
      </div>

      {/* SQL Script Viewer Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-emerald-600" />
                  <span>Skrip SQL PostgreSQL untuk Neon Database</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  Anda juga dapat mengeksekusi skrip DDL ini langsung di menu <strong>SQL Editor</strong> pada console.neon.tech
                </p>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl bg-stone-950 p-4 font-mono text-[11px] text-emerald-400 border border-stone-800">
              <pre className="whitespace-pre-wrap">{sqlCode}</pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <span className="text-[11px] text-stone-500">
                15 tabel terstruktur lengkap dengan relasi dan indeks.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{copiedSql ? 'Tersalin ke Clipboard!' : 'Salin Skrip SQL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
