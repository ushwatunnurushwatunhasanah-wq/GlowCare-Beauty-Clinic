import { jsPDF } from 'jspdf';
import { Registration, ClinicSettings } from '../types';
import { formatDateId } from './formatters';

export const generateRegistrationPdf = (
  registration: Registration,
  settings: ClinicSettings
): jsPDF => {
  // Create receipt format: 80mm width x 165mm height (thermal / slip format)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 165]
  });

  const pageWidth = 80;
  let y = 10;

  // Clinic Header
  const headerTitle = settings.receiptHeaderTitle || settings.name || 'GLOWCARE AESTHETIC';
  const headerSubtitle = settings.receiptHeaderSubtitle || settings.slogan || 'Klinik Kecantikan & Estetika Medis';
  const headerAddress = settings.receiptHeaderAddress || settings.address || 'Jl. Kemang Raya No. 45B, Jakarta Selatan';
  const headerPhone = settings.receiptHeaderPhone || settings.phone || '021-7198822';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(190, 18, 60); // Rose 700
  doc.text(headerTitle, pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text(headerSubtitle, pageWidth / 2, y, { align: 'center' });
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  doc.text(headerAddress, pageWidth / 2, y, { align: 'center' });
  y += 3.5;
  doc.text(`Telp: ${headerPhone}`, pageWidth / 2, y, { align: 'center' });
  y += 5;

  // Dashed separator line
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(6, y, pageWidth - 6, y);
  y += 5;

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text('BUKTI REGISTRASI PASIEN', pageWidth / 2, y, { align: 'center' });
  y += 4;

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.text(registration.regNumber, pageWidth / 2, y, { align: 'center' });
  y += 5;

  // Separator
  doc.line(6, y, pageWidth - 6, y);
  y += 5;

  // Patient & Visit Details (Table-like Key Values)
  doc.setLineDashPattern([], 0); // Solid lines reset
  const leftX = 8;
  const valX = 32;

  const renderRow = (label: string, value: string, isBoldVal = false, valColor: [number, number, number] = [30, 30, 30]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(110, 110, 110);
    doc.text(label, leftX, y);

    doc.setFont('helvetica', isBoldVal ? 'bold' : 'normal');
    doc.setTextColor(valColor[0], valColor[1], valColor[2]);
    // Truncate if value is too long
    const lines = doc.splitTextToSize(value, pageWidth - valX - 6);
    doc.text(lines, valX, y);
    y += Math.max(4, lines.length * 3.5);
  };

  renderRow('Tanggal / Jam', `${formatDateId(registration.registrationDate)} · ${registration.registrationTime} WIB`);
  renderRow('Nama Pasien', registration.patientName, true, [20, 20, 20]);
  renderRow('Nomor RM', registration.patientRm, true, [190, 18, 60]);
  renderRow('Dokter', registration.doctorName);
  renderRow('Layanan', registration.treatmentName);
  renderRow('Petugas Loket', registration.registeredBy);
  if (registration.notes) {
    renderRow('Catatan', registration.notes);
  }

  y += 2;

  // Big Highlight Box for Queue Number
  doc.setFillColor(255, 241, 242); // Rose-50
  doc.setDrawColor(251, 113, 133); // Rose-400
  doc.roundedRect(12, y, pageWidth - 24, 20, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(159, 18, 57); // Rose-800
  doc.text('NOMOR ANTRIAN POLI', pageWidth / 2, y + 5.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(190, 18, 60); // Rose-700
  doc.text(registration.queueNumber, pageWidth / 2, y + 15, { align: 'center' });
  y += 24;

  // Simulated Barcode
  const barStartY = y;
  const barHeight = 8;
  const barStartX = 18;
  const barTotalWidth = 44;
  
  doc.setFillColor(30, 30, 30);
  // Draw simulated barcode stripes
  for (let i = 0; i < 35; i++) {
    const xPos = barStartX + (i * 1.25);
    const barW = (i * 7 + 3) % 4 === 0 ? 0.8 : (i * 3) % 2 === 0 ? 0.4 : 0.2;
    if ((i * 5) % 6 !== 0) {
      doc.rect(xPos, barStartY, barW, barHeight, 'F');
    }
  }
  y += barHeight + 3.5;

  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  doc.text(`*${registration.regNumber}*`, pageWidth / 2, y, { align: 'center' });
  y += 5;

  // Footer Instructions
  doc.setDrawColor(200, 200, 200);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(6, y, pageWidth - 6, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(120, 120, 120);
  doc.text('Harap bawa struk ini saat nama Anda dipanggil ke ruang tindakan.', pageWidth / 2, y, { align: 'center' });
  y += 3;
  doc.setFont('helvetica', 'italic');
  doc.text('Semoga sehat & tampil percaya diri bersama GlowCare.', pageWidth / 2, y, { align: 'center' });

  return doc;
};

export const downloadRegistrationPdf = (
  registration: Registration,
  settings: ClinicSettings
): string => {
  const doc = generateRegistrationPdf(registration, settings);
  const fileName = `Bukti-Pendaftaran-${registration.regNumber}.pdf`;
  doc.save(fileName);
  return fileName;
};
