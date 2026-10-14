import React, { useState, useMemo } from 'react';
import {
  Printer,
  FileSpreadsheet,
  FileDown,
  Calendar,
  Users,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  CheckCircle,
  RefreshCw,
  Clock,
  Layers,
  Banknote
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { formatRupiah, formatDateId, formatDateTimeId } from '../../../utils/formatters';
import { downloadReportPdf } from '../../../utils/reportPdf';

type ReportTab = 'pendapatan' | 'pasien' | 'treatment' | 'dokter' | 'kepuasan';

export const ReportsView: React.FC = () => {
  const {
    patients,
    treatments,
    doctors,
    payments,
    ratings,
    registrations,
    medicalRecords,
    settings
  } = useApp();

  const [activeTab, setActiveTab] = useState<ReportTab>('pendapatan');
  const [reportPeriod, setReportPeriod] = useState<string>('Semua Periode (Real-Time)');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // Date Filtering Helper (100% Real-Time check)
  const isDateInSelectedPeriod = (dateStr?: string): boolean => {
    if (!reportPeriod || reportPeriod === 'Semua Periode (Real-Time)') return true;
    if (!dateStr) return true;

    try {
      const cleanDateStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
      const targetDate = new Date(cleanDateStr);
      if (isNaN(targetDate.getTime())) return true;

      const now = new Date(); // Oct 2026
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth();
      const targetDay = targetDate.getDate();

      const nowYear = now.getFullYear();
      const nowMonth = now.getMonth();
      const nowDay = now.getDate();

      if (reportPeriod === 'Hari Ini') {
        return targetYear === nowYear && targetMonth === nowMonth && targetDay === nowDay;
      }

      if (reportPeriod === '7 Hari Terakhir') {
        const diffDays = (now.getTime() - targetDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= -1 && diffDays <= 7;
      }

      if (reportPeriod === 'Bulan Ini (Oktober 2026)') {
        return targetYear === 2026 && targetMonth === 9; // Month 9 is October (0-indexed)
      }

      if (reportPeriod === 'Bulan Lalu (September 2026)') {
        return targetYear === 2026 && targetMonth === 8; // Month 8 is September
      }

      if (reportPeriod === 'Tahun Berjalan (2026)') {
        return targetYear === 2026;
      }
    } catch {
      return true;
    }

    return true;
  };

  // 1. Real-Time Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => isDateInSelectedPeriod(p.paidAt || p.createdAt));
  }, [payments, reportPeriod]);

  // Real Revenue Calculations (100% genuine from admin database)
  const paidPayments = useMemo(
    () => filteredPayments.filter(p => p.status === 'Lunas'),
    [filteredPayments]
  );
  const pendingPayments = useMemo(
    () => filteredPayments.filter(p => p.status === 'Belum Dibayar'),
    [filteredPayments]
  );
  const cancelledPayments = useMemo(
    () => filteredPayments.filter(p => p.status === 'Dibatalkan'),
    [filteredPayments]
  );

  const totalPaidRevenue = useMemo(
    () => paidPayments.reduce((sum, p) => sum + p.totalAmount, 0),
    [paidPayments]
  );
  const pendingRevenue = useMemo(
    () => pendingPayments.reduce((sum, p) => sum + p.totalAmount, 0),
    [pendingPayments]
  );
  const totalDiscounts = useMemo(
    () => filteredPayments.reduce((sum, p) => sum + (p.discount || 0), 0),
    [filteredPayments]
  );

  // Real-Time Payment Method Breakdown
  const methodStats = useMemo(() => {
    const methods: Record<string, { count: number; total: number }> = {
      QRIS: { count: 0, total: 0 },
      Cash: { count: 0, total: 0 },
      Debit: { count: 0, total: 0 },
      Transfer: { count: 0, total: 0 }
    };

    paidPayments.forEach(p => {
      const m = p.paymentMethod || 'Cash';
      if (!methods[m]) methods[m] = { count: 0, total: 0 };
      methods[m].count += 1;
      methods[m].total += p.totalAmount;
    });

    return methods;
  }, [paidPayments]);

  // 2. Real-Time Filtered Patients
  const filteredPatients = useMemo(() => {
    if (reportPeriod === 'Semua Periode (Real-Time)') return patients;
    return patients.filter(
      p => isDateInSelectedPeriod(p.createdAt) || isDateInSelectedPeriod(p.lastVisit)
    );
  }, [patients, reportPeriod]);

  const totalPatients = patients.length;
  const femalePatients = useMemo(
    () => patients.filter(p => p.gender === 'Perempuan').length,
    [patients]
  );
  const malePatients = useMemo(
    () => patients.filter(p => p.gender === 'Laki-laki').length,
    [patients]
  );
  const femalePercentage = totalPatients > 0 ? Math.round((femalePatients / totalPatients) * 100) : 0;
  const malePercentage = totalPatients > 0 ? Math.round((malePatients / totalPatients) * 100) : 0;
  const totalVisitsCount = useMemo(
    () => patients.reduce((sum, p) => sum + (p.totalVisits || 1), 0),
    [patients]
  );

  // 3. Real-Time Treatment Session & Revenue Statistics
  const treatmentStats = useMemo(() => {
    return treatments.map(t => {
      // Real paid payments for this treatment in selected period
      const tPayments = filteredPayments.filter(
        p => p.treatmentId === t.id || p.treatmentName.toLowerCase() === t.name.toLowerCase()
      );
      const paidSessions = tPayments.filter(p => p.status === 'Lunas').length;
      const totalRevenue = tPayments
        .filter(p => p.status === 'Lunas')
        .reduce((sum, p) => sum + p.treatmentPrice, 0);

      // Real registrations for this treatment in selected period
      const tRegistrations = registrations.filter(
        r =>
          (r.treatmentId === t.id || r.treatmentName.toLowerCase() === t.name.toLowerCase()) &&
          isDateInSelectedPeriod(r.registrationDate)
      ).length;

      // Real medical records for this treatment in selected period
      const tMedRecords = medicalRecords.filter(
        m =>
          (m.treatmentId === t.id || m.treatmentName.toLowerCase() === t.name.toLowerCase()) &&
          isDateInSelectedPeriod(m.date)
      ).length;

      const totalSessions = Math.max(paidSessions, tRegistrations, tMedRecords, tPayments.length);

      return {
        ...t,
        sessions: totalSessions,
        revenue: totalRevenue,
        invoicedCount: tPayments.length
      };
    });
  }, [treatments, filteredPayments, registrations, medicalRecords]);

  const totalTreatmentRevenue = useMemo(
    () => treatmentStats.reduce((sum, t) => sum + t.revenue, 0),
    [treatmentStats]
  );
  const totalCompletedSessions = useMemo(
    () => treatmentStats.reduce((sum, t) => sum + t.sessions, 0),
    [treatmentStats]
  );

  // 4. Real-Time Doctor Productivity Statistics
  const doctorStats = useMemo(() => {
    return doctors.map(d => {
      // Real registrations for this doctor in selected period
      const docRegs = registrations.filter(
        r =>
          (r.doctorId === d.id || r.doctorName.toLowerCase() === d.name.toLowerCase()) &&
          isDateInSelectedPeriod(r.registrationDate)
      );

      // Real medical exams performed by this doctor in selected period
      const docMed = medicalRecords.filter(
        m =>
          (m.doctorId === d.id || m.doctorName.toLowerCase() === d.name.toLowerCase()) &&
          isDateInSelectedPeriod(m.date)
      );

      // Real reviews/ratings for this doctor
      const docRatings = ratings.filter(
        r => r.doctorName.toLowerCase() === d.name.toLowerCase()
      );
      const avgRating =
        docRatings.length > 0
          ? docRatings.reduce((sum, r) => sum + r.overallRating, 0) / docRatings.length
          : d.rating;

      // Real patient count: either from registrations, medical records, or total recorded
      const handledPatients = Math.max(d.totalPatients || 0, docRegs.length, docMed.length);

      return {
        ...d,
        handledPatients,
        activeExamCount: docMed.length,
        ratingsCount: docRatings.length,
        computedRating: avgRating
      };
    });
  }, [doctors, registrations, medicalRecords, ratings]);

  // 5. Real-Time Patient Satisfaction & Rating Statistics
  const filteredRatings = useMemo(() => {
    return ratings.filter(r => isDateInSelectedPeriod(r.date));
  }, [ratings, reportPeriod]);

  const totalRatingsCount = filteredRatings.length;
  const displayedRatingsCount = useMemo(
    () => filteredRatings.filter(r => r.status === 'Ditampilkan').length,
    [filteredRatings]
  );
  const pendingRatingsCount = useMemo(
    () => filteredRatings.filter(r => r.status === 'Menunggu').length,
    [filteredRatings]
  );
  const followUpRatingsCount = useMemo(
    () => filteredRatings.filter(r => r.status === 'Ditindaklanjuti').length,
    [filteredRatings]
  );

  const averageRatingScore = useMemo(() => {
    if (totalRatingsCount === 0) return '5.0';
    const sum = filteredRatings.reduce((acc, r) => acc + r.overallRating, 0);
    return (sum / totalRatingsCount).toFixed(1);
  }, [filteredRatings, totalRatingsCount]);

  const positiveReviewPercent = useMemo(() => {
    if (totalRatingsCount === 0) return 100;
    const positive = filteredRatings.filter(r => r.overallRating >= 4).length;
    return Math.round((positive / totalRatingsCount) * 100);
  }, [filteredRatings, totalRatingsCount]);

  // Real PDF Export using jsPDF with actual real-time filtered dataset
  const handleExportPDF = () => {
    try {
      setIsExportingPdf(true);
      const filename = downloadReportPdf(
        activeTab,
        reportPeriod,
        {
          patients: filteredPatients,
          treatments,
          doctors,
          payments: filteredPayments,
          ratings: filteredRatings
        },
        settings
      );
      showToast(`Laporan ${activeTab.toUpperCase()} berhasil diunduh sebagai PDF: ${filename}`);
    } catch (err) {
      console.error('Error exporting PDF report:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Print function (with automatic PDF fallback)
  const handlePrint = () => {
    try {
      window.print();
    } catch {
      handleExportPDF();
    }
  };

  // Export to Excel / CSV function with real-time data & UTF-8 BOM
  const handleExportExcel = () => {
    let csvHeader = '';
    let csvRows = '';

    if (activeTab === 'pendapatan') {
      csvHeader = 'No. Invoice,Nama Pasien,No. RM,Layanan Treatment,Metode Bayar,Status Transaksi,Total Biaya (Rp),Waktu Bayar,Kasir\n';
      filteredPayments.forEach(p => {
        csvRows += `"${p.invoiceNumber}","${p.patientName}","${p.patientRm}","${p.treatmentName}","${p.paymentMethod || 'Cash'}","${p.status}","${p.totalAmount}","${p.paidAt || '-'}","${p.cashierName || '-'}"\n`;
      });
    } else if (activeTab === 'pasien') {
      csvHeader = 'No. Rekam Medis,NIK,Nama Pasien,Jenis Kelamin,No. Telepon,Email,Total Kunjungan,Kunjungan Terakhir,Alergi\n';
      filteredPatients.forEach(p => {
        csvRows += `"${p.rmNumber}","'${p.nik}'","${p.name}","${p.gender}","${p.phone}","${p.email || '-'}","${p.totalVisits || 1}","${p.lastVisit || '-'}","${p.allergies || '-'}"\n`;
      });
    } else if (activeTab === 'treatment') {
      csvHeader = 'Kode Treatment,Nama Layanan,Kategori,Tarif Satuan (Rp),Total Sesi Selesai,Total Kontribusi Omzet (Rp),Pelaksana,Status\n';
      treatmentStats.forEach(t => {
        csvRows += `"${t.code}","${t.name}","${t.category}","${t.price}","${t.sessions} sesi","${t.revenue}","${t.handledBy}","${t.isActive ? 'Aktif' : 'Non-aktif'}"\n`;
      });
    } else if (activeTab === 'dokter') {
      csvHeader = 'Nama Dokter Spesialis,Bidang Spesialisasi,Nomor SIP,Pasien Ditangani,Rating Kepuasan,Jadwal Praktik\n';
      doctorStats.forEach(d => {
        csvRows += `"${d.name}","${d.specialization}","'${d.sipNumber}'","${d.handledPatients}","${d.computedRating.toFixed(1)}","${d.schedule.days.join(', ')} (${d.schedule.hours})"\n`;
      });
    } else {
      csvHeader = 'Nama Pasien,Layanan Treatment,Dokter Pemeriksa,Rating (Bintang),Status Moderasi,Tanggal,Komentar & Ulasan\n';
      filteredRatings.forEach(r => {
        csvRows += `"${r.patientName}","${r.treatmentName}","${r.doctorName}","${r.overallRating}","${r.status}","${r.date || '-'}","${r.comment.replace(/"/g, '""')}"\n`;
      });
    }

    const csvContent = '\uFEFF' + csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `Laporan_GlowCare_${activeTab.toUpperCase()}_Realtime_${Date.now()}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Laporan ${activeTab.toUpperCase()} berhasil diekspor ke Excel / CSV: ${filename}`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Export & Print toolbar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <span>Pusat Laporan & Analitik Klinik</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              <Activity className="h-3 w-3 text-emerald-600 animate-pulse" />
              <span>Real-Time Database</span>
            </span>
          </h2>
          <p className="text-xs text-stone-500">
            Laporan dihitung 100% otomatis secara real-time dari data pendaftaran, rekam medis, transaksi kasir, dan ulasan pasien
          </p>
        </div>

        {/* Action buttons: Period Selector, Print, PDF, Excel */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 shadow-xs text-xs">
            <Calendar className="h-3.5 w-3.5 text-rose-600 shrink-0" />
            <select
              value={reportPeriod}
              onChange={e => setReportPeriod(e.target.value)}
              className="font-semibold text-stone-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Semua Periode (Real-Time)">Semua Periode (Real-Time)</option>
              <option value="Hari Ini">Hari Ini</option>
              <option value="7 Hari Terakhir">7 Hari Terakhir</option>
              <option value="Bulan Ini (Oktober 2026)">Bulan Ini (Oktober 2026)</option>
              <option value="Bulan Lalu (September 2026)">Bulan Lalu (September 2026)</option>
              <option value="Tahun Berjalan (2026)">Tahun Berjalan (2026)</option>
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-xs transition-colors cursor-pointer"
            title="Cetak Laporan ke Printer"
          >
            <Printer className="h-3.5 w-3.5 text-stone-500" />
            <span>Print</span>
          </button>

          {/* Export PDF Button (Active jsPDF) */}
          <button
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Unduh Laporan Resmi sebagai Berkas PDF"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>{isExportingPdf ? 'Menyusun...' : 'Export PDF'}</span>
          </button>

          {/* Export Excel Button (Active CSV/Excel with UTF-8 BOM) */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 shadow-xs transition-all cursor-pointer"
            title="Ekspor Data ke Format Excel (.CSV)"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Export Excel</span>
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

      {/* Real-time sync badge info banner */}
      <div className="flex items-center justify-between gap-3 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            Sumber Data Real-Time:{' '}
            <strong className="text-stone-900">{payments.length} Faktur Pembayaran</strong>,{' '}
            <strong className="text-stone-900">{patients.length} Pasien Terdaftar</strong>,{' '}
            <strong className="text-stone-900">{treatments.length} Layanan Tindakan</strong>,{' '}
            <strong className="text-stone-900">{ratings.length} Ulasan Masuk</strong>.
          </span>
        </div>
        <span className="font-mono text-[11px] text-stone-400 hidden sm:inline">
          Filter: {reportPeriod}
        </span>
      </div>

      {/* Tabs navigation */}
      <div className="no-print flex items-center gap-1 overflow-x-auto pb-1 border-b border-stone-200">
        {[
          { key: 'pendapatan', label: 'Laporan Pendapatan', icon: TrendingUp },
          { key: 'pasien', label: 'Laporan Pasien', icon: Users },
          { key: 'treatment', label: 'Laporan Treatment', icon: Sparkles },
          { key: 'dokter', label: 'Laporan Dokter', icon: Stethoscope },
          { key: 'kepuasan', label: 'Laporan Kepuasan Pasien', icon: Star },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as ReportTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-rose-600 text-rose-600 font-bold bg-rose-50/50 rounded-t-xl'
                  : 'border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Official Clinic Report Document Container */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs print-container">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-4 mb-6 gap-3">
          <div>
            <h1 className="font-serif-display text-xl font-bold text-stone-900 uppercase tracking-wide">
              {settings.receiptHeaderTitle || settings.name}
            </h1>
            <p className="text-xs text-rose-700 italic font-medium">
              {settings.receiptHeaderSubtitle || settings.slogan}
            </p>
            <p className="text-[11px] text-stone-500 mt-1">
              {settings.receiptHeaderAddress || settings.address} · Telp:{' '}
              {settings.receiptHeaderPhone || settings.phone}
            </p>
          </div>
          <div className="sm:text-right">
            <span className="text-xs font-bold text-stone-900 uppercase block tracking-wider">
              {activeTab === 'pendapatan' && 'LAPORAN REKAPITULASI PENDAPATAN & KASIR'}
              {activeTab === 'pasien' && 'LAPORAN DEMOGRAFI & KUNJUNGAN PASIEN'}
              {activeTab === 'treatment' && 'LAPORAN UTILISASI TREATMENT & LAYANAN'}
              {activeTab === 'dokter' && 'LAPORAN PRODUKTIVITAS DOKTER SPESIALIS'}
              {activeTab === 'kepuasan' && 'LAPORAN MUTU & KEPUASAN PELAYANAN'}
            </span>
            <span className="text-[11px] text-stone-600 font-medium">Periode: {reportPeriod}</span>
            <span className="text-[10px] text-stone-400 block mt-0.5 font-mono">
              Waktu Sinkronisasi: {formatDateTimeId(new Date().toISOString())}
            </span>
          </div>
        </div>

        {/* Tab 1: Laporan Pendapatan (100% Real-Time dari Data Input Admin) */}
        {activeTab === 'pendapatan' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] text-stone-500 block">Total Omzet Lunas</span>
                <span className="text-base font-bold text-emerald-700 font-mono">
                  {formatRupiah(totalPaidRevenue)}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  {paidPayments.length} transaksi berstatus lunas
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] text-stone-500 block">Menunggu Pembayaran</span>
                <span className="text-base font-bold text-amber-600 font-mono">
                  {formatRupiah(pendingRevenue)}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  {pendingPayments.length} tagihan pending
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] text-stone-500 block">Total Faktur Kasir</span>
                <span className="text-base font-bold text-stone-900 font-mono">
                  {filteredPayments.length} Faktur
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  {cancelledPayments.length > 0 ? `${cancelledPayments.length} dibatalkan` : 'Semua kanal'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] text-stone-500 block">Total Diskon Diberikan</span>
                <span className="text-base font-bold text-rose-700 font-mono">
                  {formatRupiah(totalDiscounts)}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  Diskon promosi & voucher
                </span>
              </div>
            </div>

            {/* Rincian Real-Time per Metode Pembayaran */}
            <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-4 space-y-3">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Banknote className="h-4 w-4 text-emerald-600" />
                <span>Rincian Omzet Berdasarkan Metode Pembayaran (Real-Time)</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {Object.entries(methodStats).map(([methodName, stat]) => (
                  <div key={methodName} className="bg-white p-3 rounded-lg border border-stone-200/70">
                    <span className="text-[10px] font-semibold text-stone-400 block uppercase">
                      {methodName === 'Cash' ? 'Tunai (Cash)' : methodName}
                    </span>
                    <strong className="text-sm font-bold text-stone-900 font-mono block mt-0.5">
                      {formatRupiah(stat.total)}
                    </strong>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      {stat.count} transaksi terbayar
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabel Real-Time Transaksi Pembayaran */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-bold">
                    <th className="py-2.5 px-3">No. Faktur</th>
                    <th className="py-2.5 px-3">Nama Pasien & RM</th>
                    <th className="py-2.5 px-3">Layanan & Produk Skincare</th>
                    <th className="py-2.5 px-3">Metode Bayar</th>
                    <th className="py-2.5 px-3">Kasir</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Total Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400">
                        Tidak ada transaksi pembayaran pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map(p => (
                      <tr key={p.id} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-3 font-mono font-medium text-stone-900">
                          {p.invoiceNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-stone-900 block">{p.patientName}</span>
                          <span className="text-[10px] text-stone-400 font-mono">{p.patientRm}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-stone-800 block">{p.treatmentName}</span>
                          {p.additionalProducts && p.additionalProducts.length > 0 && (
                            <span className="text-[10px] text-purple-700 block">
                              +{p.additionalProducts.length} produk skincare
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-stone-700">
                          {p.paymentMethod || 'Cash'}
                          {p.referenceNumber && (
                            <span className="text-[9px] text-stone-400 block font-mono">
                              Ref: {p.referenceNumber}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-stone-600">
                          {p.cashierName || 'Kasir GlowCare'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              p.status === 'Lunas'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'Belum Dibayar'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                          {formatRupiah(p.totalAmount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Laporan Pasien (100% Real-Time) */}
        {activeTab === 'pasien' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] text-stone-500 block">Total Pasien Terdaftar</span>
                <span className="text-base font-bold text-stone-900 font-mono">{totalPatients} Pasien</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Sesuai data input admin</span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] text-stone-500 block">Total Kunjungan Pasien</span>
                <span className="text-base font-bold text-emerald-600 font-mono">
                  {totalVisitsCount} Kunjungan
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Akumulasi kunjungan rawat jalan</span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] text-stone-500 block">Pasien Perempuan</span>
                <span className="text-base font-bold text-rose-700 font-mono">
                  {femalePatients} ({femalePercentage}%)
                </span>
                <div className="w-full bg-stone-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-rose-600 h-full rounded-full"
                    style={{ width: `${femalePercentage}%` }}
                  />
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] text-stone-500 block">Pasien Laki-laki</span>
                <span className="text-base font-bold text-blue-700 font-mono">
                  {malePatients} ({malePercentage}%)
                </span>
                <div className="w-full bg-stone-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${malePercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-bold">
                    <th className="py-2.5 px-3">No. RM</th>
                    <th className="py-2.5 px-3">NIK</th>
                    <th className="py-2.5 px-3">Nama Lengkap</th>
                    <th className="py-2.5 px-3">Gender</th>
                    <th className="py-2.5 px-3">No. Telepon</th>
                    <th className="py-2.5 px-3">Kunjungan Terakhir</th>
                    <th className="py-2.5 px-3">Alergi & Catatan</th>
                    <th className="py-2.5 px-3 text-center">Total Sesi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-stone-400">
                        Tidak ada data pasien pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map(pat => (
                      <tr key={pat.id} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-700">{pat.rmNumber}</td>
                        <td className="py-2.5 px-3 font-mono text-stone-500">{pat.nik}</td>
                        <td className="py-2.5 px-3 font-bold text-stone-900">{pat.name}</td>
                        <td className="py-2.5 px-3">{pat.gender}</td>
                        <td className="py-2.5 px-3 font-mono">{pat.phone}</td>
                        <td className="py-2.5 px-3 text-stone-600">
                          {pat.lastVisit ? formatDateId(pat.lastVisit) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-stone-600">{pat.allergies || '-'}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-stone-900">
                          {pat.totalVisits || 1}x
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Laporan Treatment (100% Real-Time Sesi & Omzet dari Transaksi Admin) */}
        {activeTab === 'treatment' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] text-stone-500 block">Total Layanan Tindakan</span>
                <span className="text-base font-bold text-stone-900 font-mono">
                  {treatments.length} Layanan
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  {treatments.filter(t => t.isActive).length} berstatus aktif
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] text-stone-500 block">Total Sesi Ditangani</span>
                <span className="text-base font-bold text-rose-700 font-mono">
                  {totalCompletedSessions} Sesi
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  Dari faktur & rekam medis
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] text-stone-500 block">Total Kontribusi Omzet</span>
                <span className="text-base font-bold text-emerald-700 font-mono">
                  {formatRupiah(totalTreatmentRevenue)}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  Treatment berstatus lunas
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] text-stone-500 block">Rata-rata Tarif Tindakan</span>
                <span className="text-base font-bold text-stone-900 font-mono">
                  {formatRupiah(
                    treatments.length > 0
                      ? Math.round(treatments.reduce((sum, t) => sum + t.price, 0) / treatments.length)
                      : 0
                  )}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Per treatment</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-bold">
                    <th className="py-2.5 px-3">Kode</th>
                    <th className="py-2.5 px-3">Nama Treatment</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Pelaksana</th>
                    <th className="py-2.5 px-3">Tarif Satuan</th>
                    <th className="py-2.5 px-3 text-center">Volume Sesi</th>
                    <th className="py-2.5 px-3 text-right">Kontribusi Omzet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {treatmentStats.map(t => (
                    <tr key={t.id} className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-3 font-mono font-semibold text-rose-700">{t.code}</td>
                      <td className="py-2.5 px-3 font-bold text-stone-900">{t.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-stone-100 px-2 py-0.5 rounded text-[10px] text-stone-700">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-stone-600">{t.handledBy}</td>
                      <td className="py-2.5 px-3 font-mono">{formatRupiah(t.price)}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-700">
                        {t.sessions}x
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                        {formatRupiah(t.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Laporan Dokter (100% Real-Time dari Pasien & Rekam Medis) */}
        {activeTab === 'dokter' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {doctorStats.map(d => (
                <div key={d.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">{d.name}</h4>
                    <p className="text-xs text-rose-700 font-medium mt-0.5">{d.specialization}</p>
                    <p className="text-[11px] text-stone-400 font-mono mt-0.5">{d.sipNumber}</p>
                  </div>

                  <div className="pt-3 border-t border-stone-200 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Total Pasien Ditangani</span>
                      <strong className="font-mono text-stone-800 text-sm">
                        {d.handledPatients} pasien
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Rating Kepuasan</span>
                      <strong className="font-mono text-amber-600 text-sm">
                        ★ {d.computedRating.toFixed(1)} / 5.0
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-600">
                    <strong>Jadwal Praktik:</strong> {d.schedule.days.join(', ')} ({d.schedule.hours})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Laporan Kepuasan Pasien (100% Real-Time dari Ulasan Masuk) */}
        {activeTab === 'kepuasan' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] text-stone-500 block">Rata-rata Rating</span>
                <span className="text-xl font-bold text-amber-600 font-mono">
                  ★ {averageRatingScore} / 5.0
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  Dari total ulasan masuk
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] text-stone-500 block">Total Ulasan Masuk</span>
                <span className="text-xl font-bold text-stone-900 font-mono">
                  {totalRatingsCount} Ulasan
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Sesuai data sistem</span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] text-stone-500 block">Ulasan Ditampilkan</span>
                <span className="text-xl font-bold text-emerald-600 font-mono">
                  {displayedRatingsCount} Ulasan
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  {pendingRatingsCount} menunggu moderasi
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="text-[11px] text-stone-500 block">Kepuasan Pasien Positif</span>
                <span className="text-xl font-bold text-rose-700 font-mono">
                  {positiveReviewPercent}%
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Rating bintang 4 & 5</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-bold">
                    <th className="py-2.5 px-3">Nama Pasien</th>
                    <th className="py-2.5 px-3">Layanan & Dokter</th>
                    <th className="py-2.5 px-3">Rating</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Komentar & Pengalaman</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredRatings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-stone-400">
                        Tidak ada ulasan pasien pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    filteredRatings.map(r => (
                      <tr key={r.id} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-3 font-bold text-stone-900">{r.patientName}</td>
                        <td className="py-2.5 px-3">
                          <span className="block font-medium">{r.treatmentName}</span>
                          <span className="text-[11px] text-stone-500">{r.doctorName}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-600">
                          ★ {r.overallRating}.0
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                              r.status === 'Ditampilkan'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'Menunggu'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-stone-700 italic max-w-md">"{r.comment}"</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report Signature Sign-off */}
        <div className="mt-10 pt-6 border-t border-stone-200 grid grid-cols-2 gap-4 text-xs text-stone-600">
          <div>
            <p>Disiapkan oleh:</p>
            <p className="mt-8 font-bold text-stone-900 underline">Ushwatun Hasanah</p>
            <p className="text-[11px] text-stone-500">Manajer Operasional Klinik</p>
          </div>
          <div className="text-right">
            <p>Mengetahui,</p>
            <p className="mt-8 font-bold text-stone-900 underline">dr. Andini Putri, Sp.DV</p>
            <p className="text-[11px] text-stone-500">Direktur Medis GlowCare Clinic</p>
          </div>
        </div>
      </div>
    </div>
  );
};
