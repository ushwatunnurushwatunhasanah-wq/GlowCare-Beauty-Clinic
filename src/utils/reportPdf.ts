import { jsPDF } from 'jspdf';
import { Patient, Treatment, Doctor, Payment, PatientRatingComment, ClinicSettings } from '../types';
import { formatRupiah, formatDateId } from './formatters';

export const generateReportPdf = (
  reportType: 'pendapatan' | 'pasien' | 'treatment' | 'dokter' | 'kepuasan',
  period: string,
  data: {
    patients: Patient[];
    treatments: Treatment[];
    doctors: Doctor[];
    payments: Payment[];
    ratings: PatientRatingComment[];
  },
  settings: ClinicSettings
): jsPDF => {
  // A4 portrait: 210 x 297 mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  let y = 16;

  // Header Box
  doc.setFillColor(255, 241, 242); // Rose 50
  doc.rect(14, y, pageWidth - 28, 26, 'F');

  // Clinic Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(190, 18, 60); // Rose 700
  doc.text(settings.name || 'GLOWCARE CLINIC & AESTHETIC', 20, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  doc.text(`${settings.slogan || 'Klinik Kecantikan & Estetika Medis'} · ${settings.address || 'Jakarta Selatan'}`, 20, y + 14);
  doc.text(`Telp: ${settings.phone || '021-7198822'} · Email: official@glowcare.id · Website: www.glowcare.id`, 20, y + 19);

  // Document Title
  y += 34;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);

  const reportTitles: Record<string, string> = {
    pendapatan: 'LAPORAN REKAPITULASI PENDAPATAN & KASIR',
    pasien: 'LAPORAN DEMOGRAFI & KUNJUNGAN PASIEN',
    treatment: 'LAPORAN UTILISASI LAYANAN & TREATMENT',
    dokter: 'LAPORAN PRODUKTIVITAS & KINERJA DOKTER',
    kepuasan: 'LAPORAN MUTU & KEPUASAN PELAYANAN PASIEN'
  };

  doc.text(reportTitles[reportType] || 'LAPORAN RESMI KLINIK', 14, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(110, 110, 110);
  doc.text(`Periode: ${period} · Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}`, 14, y);
  y += 6;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  // Helper for drawing tables
  const drawTableHeader = (cols: { text: string; x: number; align?: 'left' | 'right' | 'center' }[]) => {
    doc.setFillColor(245, 245, 244); // Stone 100
    doc.rect(14, y, pageWidth - 28, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    cols.forEach(c => {
      doc.text(c.text, c.x, y + 5, { align: c.align || 'left' });
    });
    y += 8.5;
  };

  if (reportType === 'pendapatan') {
    // Summary Cards
    const paidPayments = data.payments.filter(p => p.status === 'Lunas');
    const totalOmzet = paidPayments.reduce((sum, p) => sum + p.totalAmount, 0);
    const pendingTotal = data.payments.filter(p => p.status === 'Belum Dibayar').reduce((sum, p) => sum + p.totalAmount, 0);

    doc.setFillColor(250, 250, 250);
    doc.roundedRect(14, y, 88, 14, 2, 2, 'FD');
    doc.roundedRect(108, y, 88, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text('TOTAL OMZET TERBAYAR (LUNAS):', 18, y + 5);
    doc.text('MENUNGGU PEMBAYARAN (PENDING):', 112, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(190, 18, 60);
    doc.text(formatRupiah(totalOmzet), 18, y + 11);
    doc.setTextColor(217, 119, 6);
    doc.text(formatRupiah(pendingTotal), 112, y + 11);
    y += 18;

    // Table Header
    drawTableHeader([
      { text: 'NO. FAKTUR', x: 18 },
      { text: 'NAMA PASIEN / RM', x: 60 },
      { text: 'TREATMENT', x: 105 },
      { text: 'METODE', x: 152 },
      { text: 'STATUS', x: 172 },
      { text: 'TOTAL (RP)', x: pageWidth - 18, align: 'right' }
    ]);

    // Rows
    data.payments.forEach((p, idx) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 30, 30);
      if (idx % 2 === 1) {
        doc.setFillColor(252, 252, 252);
        doc.rect(14, y - 3, pageWidth - 28, 6.5, 'F');
      }
      doc.setFont('courier', 'bold');
      doc.text(p.invoiceNumber, 18, y + 1.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`${p.patientName} (${p.patientRm})`, 60, y + 1.5);
      doc.text(p.treatmentName.substring(0, 24), 105, y + 1.5);
      doc.text(p.paymentMethod || 'Cash', 152, y + 1.5);
      doc.setTextColor(p.status === 'Lunas' ? 16 : 180, p.status === 'Lunas' ? 120 : 83, p.status === 'Lunas' ? 87 : 9);
      doc.text(p.status, 172, y + 1.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(formatRupiah(p.totalAmount), pageWidth - 18, y + 1.5, { align: 'right' });
      y += 6.5;
    });

  } else if (reportType === 'pasien') {
    drawTableHeader([
      { text: 'NO. RM', x: 18 },
      { text: 'NAMA LENGKAP', x: 50 },
      { text: 'GENDER', x: 95 },
      { text: 'NO. TELEPON', x: 120 },
      { text: 'TOTAL KUNJUNGAN', x: 155 },
      { text: 'KUNJUNGAN TERAKHIR', x: pageWidth - 18, align: 'right' }
    ]);

    data.patients.forEach((pt, idx) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }
      if (idx % 2 === 1) {
        doc.setFillColor(252, 252, 252);
        doc.rect(14, y - 3, pageWidth - 28, 6.5, 'F');
      }
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(190, 18, 60);
      doc.text(pt.rmNumber, 18, y + 1.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(pt.name, 50, y + 1.5);
      doc.setFont('helvetica', 'normal');
      doc.text(pt.gender, 95, y + 1.5);
      doc.text(pt.phone, 120, y + 1.5);
      doc.text(`${pt.totalVisits || 1} kali`, 155, y + 1.5);
      doc.text(pt.lastVisit ? formatDateId(pt.lastVisit) : '-', pageWidth - 18, y + 1.5, { align: 'right' });
      y += 6.5;
    });

  } else if (reportType === 'treatment') {
    drawTableHeader([
      { text: 'KODE', x: 18 },
      { text: 'NAMA TREATMENT', x: 45 },
      { text: 'KATEGORI', x: 105 },
      { text: 'PELAKSANA', x: 140 },
      { text: 'DURASI', x: 165 },
      { text: 'TARIF (RP)', x: pageWidth - 18, align: 'right' }
    ]);

    data.treatments.forEach((t, idx) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }
      if (idx % 2 === 1) {
        doc.setFillColor(252, 252, 252);
        doc.rect(14, y - 3, pageWidth - 28, 6.5, 'F');
      }
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(190, 18, 60);
      doc.text(t.code, 18, y + 1.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(t.name, 45, y + 1.5);
      doc.setFont('helvetica', 'normal');
      doc.text(t.category, 105, y + 1.5);
      doc.text(t.handledBy, 140, y + 1.5);
      doc.text(`${t.durationMinutes} mnt`, 165, y + 1.5);
      doc.setFont('helvetica', 'bold');
      doc.text(formatRupiah(t.price), pageWidth - 18, y + 1.5, { align: 'right' });
      y += 6.5;
    });

  } else if (reportType === 'dokter') {
    drawTableHeader([
      { text: 'NAMA DOKTER SPESIALIS', x: 18 },
      { text: 'SPESIALISASI / BIDANG', x: 75 },
      { text: 'NO. SIP RESMI', x: 125 },
      { text: 'PASIEN', x: 160 },
      { text: 'RATING', x: pageWidth - 18, align: 'right' }
    ]);

    data.doctors.forEach((d, idx) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }
      if (idx % 2 === 1) {
        doc.setFillColor(252, 252, 252);
        doc.rect(14, y - 3, pageWidth - 28, 6.5, 'F');
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(20, 20, 20);
      doc.text(d.name, 18, y + 1.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(d.specialization, 75, y + 1.5);
      doc.setFont('courier', 'normal');
      doc.text(d.sipNumber, 125, y + 1.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`${d.totalPatients} pasien`, 160, y + 1.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(190, 18, 60);
      doc.text(`★ ${d.rating.toFixed(1)} / 5.0`, pageWidth - 18, y + 1.5, { align: 'right' });
      y += 7;
    });

  } else {
    // Kepuasan Pasien
    drawTableHeader([
      { text: 'PASIEN', x: 18 },
      { text: 'TREATMENT', x: 60 },
      { text: 'DOKTER', x: 105 },
      { text: 'NILAI', x: 145 },
      { text: 'STATUS', x: pageWidth - 18, align: 'right' }
    ]);

    data.ratings.forEach((r, idx) => {
      if (y > pageHeight - 35) {
        doc.addPage();
        y = 20;
      }
      if (idx % 2 === 1) {
        doc.setFillColor(252, 252, 252);
        doc.rect(14, y - 3, pageWidth - 28, 10, 'F');
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(20, 20, 20);
      doc.text(r.patientName, 18, y + 1.5);
      doc.setFont('helvetica', 'normal');
      doc.text(r.treatmentName.substring(0, 24), 60, y + 1.5);
      doc.text(r.doctorName, 105, y + 1.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(190, 18, 60);
      doc.text(`★ ${r.overallRating} / 5`, 145, y + 1.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(r.status, pageWidth - 18, y + 1.5, { align: 'right' });
      y += 4;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.8);
      doc.setTextColor(100, 100, 100);
      const commentLines = doc.splitTextToSize(`"${r.comment}"`, pageWidth - 36);
      doc.text(commentLines, 18, y + 1.5);
      y += Math.max(5, commentLines.length * 3.5);
    });
  }

  // Footer / Signature Section
  y = Math.max(y + 8, pageHeight - 38);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text(`Laporan resmi ini dihasilkan secara terkomputerisasi melalui Sistem Informasi ${settings.name}.`, 14, y);
  y += 4;
  doc.text('Dokumen ini valid dan sah tanpa tanda tangan basah.', 14, y);

  return doc;
};

export const downloadReportPdf = (
  reportType: 'pendapatan' | 'pasien' | 'treatment' | 'dokter' | 'kepuasan',
  period: string,
  data: {
    patients: Patient[];
    treatments: Treatment[];
    doctors: Doctor[];
    payments: Payment[];
    ratings: PatientRatingComment[];
  },
  settings: ClinicSettings
): string => {
  const doc = generateReportPdf(reportType, period, data, settings);
  const fileName = `Laporan_GlowCare_${reportType.toUpperCase()}_${Date.now()}.pdf`;
  doc.save(fileName);
  return fileName;
};
