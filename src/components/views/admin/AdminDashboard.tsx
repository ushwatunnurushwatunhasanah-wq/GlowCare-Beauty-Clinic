import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Clock,
  Sparkles,
  TrendingUp,
  Star,
  MessageSquare,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { formatRupiah, formatDateId } from '../../../utils/formatters';

interface AdminDashboardProps {
  onNavigate: (menuKey: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { patients, appointments, queues, treatments, payments, ratings, openModal } = useApp();
  const [chartPeriod, setChartPeriod] = useState<'monthly' | 'weekly'>('monthly');

  // Realistic calculated metrics with rich initial figures
  const totalPatientsCount = patients.length + 1240;
  const newPatientsThisMonth = 68;
  const todayAppointmentsCount = appointments.length + 26;
  const waitingPatientsCount = queues.filter(q => q.status === 'Menunggu' || q.status === 'Dipanggil').length + 4;
  const todayTreatmentsCount = 24;
  
  const todayRevenue = payments
    .filter(p => p.status === 'Lunas')
    .reduce((sum, p) => sum + p.totalAmount, 0) + 5450000;

  // Rating average calculation
  const totalRatingSum = ratings.reduce((sum, r) => sum + r.overallRating, 0);
  const avgRating = (totalRatingSum / (ratings.length || 1)).toFixed(1);

  // Monthly trend mock data
  const monthlyData = [
    { month: 'Apr', patients: 110, revenue: 48000000, treatments: 95 },
    { month: 'Mei', patients: 145, revenue: 62000000, treatments: 120 },
    { month: 'Jun', patients: 180, revenue: 75000000, treatments: 155 },
    { month: 'Jul', patients: 210, revenue: 89000000, treatments: 190 },
    { month: 'Agu', patients: 240, revenue: 98000000, treatments: 215 },
    { month: 'Sep', patients: 285, revenue: 118000000, treatments: 260 },
  ];

  // Top treatments data
  const topTreatments = [
    { name: 'Hydrafacial Deep Infusion', count: 142, revenue: 92300000, percentage: 35, color: 'bg-rose-500' },
    { name: 'Korean Glass Skin DNA Salmon', count: 98, revenue: 181300000, percentage: 28, color: 'bg-pink-500' },
    { name: 'Brightening Laser Rejuvenation', count: 86, revenue: 107500000, percentage: 22, color: 'bg-purple-500' },
    { name: 'Acne Purifying Treatment', count: 74, revenue: 25900000, percentage: 15, color: 'bg-amber-500' }
  ];

  // Rating aspect ratings summary
  const aspectScores = [
    { label: 'Kualitas Treatment', score: 4.9 },
    { label: 'Pelayanan Dokter', score: 4.9 },
    { label: 'Pelayanan Perawat', score: 4.8 },
    { label: 'Keramahan Loket', score: 4.7 },
    { label: 'Kebersihan Klinik', score: 4.9 },
    { label: 'Kenyamanan Ruangan', score: 4.8 },
    { label: 'Kecepatan Pelayanan', score: 4.6 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-900 via-rose-800 to-stone-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-rose-200 border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-rose-300" />
              <span>GlowCare Executive Dashboard</span>
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight">
              Selamat Datang Kembali, Admin!
            </h2>
            <p className="mt-1 text-xs text-rose-100/80 max-w-xl">
              Operasional klinik berjalan prima. Hari ini terdapat <strong className="text-white">{todayAppointmentsCount} appointment</strong> dan <strong className="text-white">{waitingPatientsCount} pasien</strong> dalam antrian aktif.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('antrian')}
              className="rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-rose-950 shadow-sm hover:bg-rose-50 transition-colors"
            >
              Monitor Antrian
            </button>
            <button
              onClick={() => onNavigate('laporan')}
              className="rounded-xl bg-white/10 backdrop-blur px-3.5 py-2 text-xs font-semibold text-white border border-white/20 hover:bg-white/20 transition-colors"
            >
              Lihat Laporan Lengkap
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pasien */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5 shadow-xs transition-hover hover:border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Total Pasien Terdaftar</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono tabular-nums">
              {totalPatientsCount.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-emerald-600 font-medium">
            <ArrowUpRight className="h-3 w-3 mr-0.5" />
            <span>+{newPatientsThisMonth} pasien baru bulan ini</span>
          </div>
        </div>

        {/* Appointment Hari Ini */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5 shadow-xs transition-hover hover:border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Appointment Hari Ini</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-stone-900 font-mono tabular-nums">
              {todayAppointmentsCount}
            </span>
            <span className="text-xs text-stone-400">booking</span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-rose-600 font-medium">
            <span>{todayTreatmentsCount} treatment terjadwal</span>
          </div>
        </div>

        {/* Pasien Sedang Menunggu */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5 shadow-xs transition-hover hover:border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Pasien Menunggu Antrian</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-600 font-mono tabular-nums">
              {waitingPatientsCount}
            </span>
            <span className="text-xs text-stone-400">di ruang tunggu</span>
          </div>
          <div className="mt-2 text-[11px] text-stone-500">
            Waktu tunggu rata-rata: ~12 menit
          </div>
        </div>

        {/* Total Pendapatan Hari Ini */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 sm:p-5 shadow-xs transition-hover hover:border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Pendapatan Hari Ini</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-mono tabular-nums">
              {formatRupiah(todayRevenue)}
            </span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="h-3 w-3 mr-0.5" />
            <span>+18.4% vs rata-rata harian</span>
          </div>
        </div>
      </div>

      {/* Row 2: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Growth Chart: Pasien & Pendapatan Bulanan */}
        <div className="lg:col-span-8 rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Tren Pasien & Pertumbuhan Pendapatan
              </h3>
              <p className="text-xs text-stone-500">
                Statistik performa kunjungan klinik semester terakhir 2026
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg self-start">
              <button
                onClick={() => setChartPeriod('monthly')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  chartPeriod === 'monthly' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Bulanan
              </button>
              <button
                onClick={() => setChartPeriod('weekly')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  chartPeriod === 'weekly' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Mingguan
              </button>
            </div>
          </div>

          {/* Responsive SVG/HTML Bar & Area Visual */}
          <div className="mt-6">
            <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
              {monthlyData.map(item => {
                const heightPercentage = Math.round((item.revenue / 120000000) * 100);
                const patientHeight = Math.round((item.patients / 300) * 100);

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-48">
                      {/* Bar 1: Pasien */}
                      <div
                        style={{ height: `${patientHeight}%` }}
                        className="w-1/2 max-w-[20px] rounded-t-md bg-rose-200 group-hover:bg-rose-300 transition-all relative"
                        title={`${item.patients} Pasien`}
                      />
                      {/* Bar 2: Pendapatan */}
                      <div
                        style={{ height: `${heightPercentage}%` }}
                        className="w-1/2 max-w-[20px] rounded-t-md bg-rose-600 group-hover:bg-rose-700 transition-all relative shadow-xs"
                        title={formatRupiah(item.revenue)}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-stone-600">
                      {item.month}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
                      {item.patients} psn
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-xs bg-rose-600" />
                  <span>Pendapatan (Juta IDR)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-xs bg-rose-200" />
                  <span>Jumlah Pasien</span>
                </div>
              </div>
              <span className="text-stone-400 text-[11px]">
                Total semester berjalan: <strong className="text-stone-700 font-mono">Rp 490.000.000</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Top Treatments Breakdown */}
        <div className="lg:col-span-4 rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Treatment Terpopuler
                </h3>
                <p className="text-xs text-stone-500">Treatment paling banyak diminati</p>
              </div>
              <button
                onClick={() => onNavigate('treatment')}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                Lihat Semua
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {topTreatments.map((t, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800 line-clamp-1">{t.name}</span>
                    <span className="font-mono text-stone-500">{t.count}x</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${t.color}`}
                      style={{ width: `${t.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-400">
                    <span>{formatRupiah(t.revenue)}</span>
                    <span>{t.percentage}% dari total</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 bg-rose-50/50 rounded-xl p-3 text-center">
            <p className="text-xs text-rose-900 font-medium">
              💡 Saran Manajemen:
            </p>
            <p className="text-[11px] text-stone-600 mt-0.5">
              Hydrafacial & Salmon DNA berkontribusi lebih dari 60% omzet klinik bulan ini.
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Rating Pelayanan & Komentar Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rating Breakdown */}
        <div className="lg:col-span-5 rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Indeks Kepuasan Pasien
              </h3>
              <p className="text-xs text-stone-500">Evaluasi mutu pelayanan terintegrasi</p>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-sm text-stone-900 font-mono">{avgRating}</span>
              <span className="text-xs text-stone-400">/ 5.0</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {aspectScores.map((aspect, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-stone-600 min-w-[140px] truncate">{aspect.label}</span>
                <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full"
                    style={{ width: `${(aspect.score / 5) * 100}%` }}
                  />
                </div>
                <span className="font-mono font-semibold text-stone-800 w-8 text-right">
                  {aspect.score}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Berdasarkan <strong>182 ulasan terverifikasi</strong></span>
            <button
              onClick={() => onNavigate('komentar')}
              className="text-rose-600 font-semibold hover:underline"
            >
              Moderasi Ulasan →
            </button>
          </div>
        </div>

        {/* Recent Comments Feed */}
        <div className="lg:col-span-7 rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-rose-600" />
              <h3 className="text-sm font-bold text-stone-900">
                Komentar & Ulasan Pasien Terbaru
              </h3>
            </div>
            <button
              onClick={() => openModal('patient-review-modal')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              + Buat Ulasan Simulasi
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {ratings.slice(0, 3).map(rev => (
              <div
                key={rev.id}
                className="rounded-xl border border-stone-100 bg-stone-50/50 p-3.5 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">{rev.patientName}</span>
                      <span className="text-[10px] text-stone-400">·</span>
                      <span className="text-[11px] text-rose-700 font-medium">{rev.treatmentName}</span>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      Dokter: {rev.doctorName} · {formatDateId(rev.date)}
                    </p>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < rev.overallRating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="mt-2 text-xs text-stone-700 italic leading-relaxed">
                  "{rev.comment}"
                </p>

                {rev.clinicResponse && (
                  <div className="mt-2 rounded-lg bg-rose-50/80 p-2 text-[11px] text-stone-600 border border-rose-100/50">
                    <strong className="text-rose-900 block font-semibold">Respon GlowCare:</strong>
                    {rev.clinicResponse}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => onNavigate('komentar')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              <span>Kelola dan moderasi semua komentar</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
