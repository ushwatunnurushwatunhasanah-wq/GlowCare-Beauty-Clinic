import { jsPDF } from 'jspdf';
import { Payment, ClinicSettings } from '../types';
import { formatRupiah, formatDateTimeId } from './formatters';

export const generateReceiptPdf = (
  payment: Payment,
  settings: ClinicSettings
): jsPDF => {
  // Height calculated based on additional products
  const productCount = payment.additionalProducts?.length || 0;
  const pageHeight = Math.max(175, 160 + productCount * 6);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, pageHeight]
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
  y += 4;

  if (settings.receiptHeaderNote) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6);
    doc.setTextColor(120, 120, 120);
    const noteLines = doc.splitTextToSize(settings.receiptHeaderNote, pageWidth - 16);
    doc.text(noteLines, pageWidth / 2, y, { align: 'center' });
    y += noteLines.length * 3;
  }
  y += 1;

  // Dashed separator line
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(6, y, pageWidth - 6, y);
  y += 5;

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text('BUKTI PEMBAYARAN KASIR', pageWidth / 2, y, { align: 'center' });
  y += 4;

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.text(payment.invoiceNumber, pageWidth / 2, y, { align: 'center' });
  y += 5;

  // Separator
  doc.line(6, y, pageWidth - 6, y);
  y += 4.5;

  // Metadata Rows
  doc.setLineDashPattern([], 0);
  const leftX = 7;
  const rightX = pageWidth - 7;

  const renderMetaRow = (label: string, value: string, isBold = false) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 100, 100);
    doc.text(label, leftX, y);

    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(value, rightX, y, { align: 'right' });
    y += 4;
  };

  renderMetaRow('Waktu Transaksi:', formatDateTimeId(payment.paidAt || new Date().toISOString()));
  renderMetaRow('Nama Pasien:', payment.patientName, true);
  renderMetaRow('Nomor RM:', payment.patientRm);
  renderMetaRow('Kasir Petugas:', payment.cashierName || 'Kasir GlowCare');

  y += 1;
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(6, y, pageWidth - 6, y);
  y += 4.5;

  // Items Header
  doc.setLineDashPattern([], 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(50, 50, 50);
  doc.text('RINCIAN LAYANAN & PRODUK', leftX, y);
  doc.text('JUMLAH', rightX, y, { align: 'right' });
  y += 4;

  // Treatment Item
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(20, 20, 20);
  const treatmentLines = doc.splitTextToSize(payment.treatmentName, 45);
  doc.text(treatmentLines, leftX, y);
  doc.text(formatRupiah(payment.treatmentPrice), rightX, y, { align: 'right' });
  y += Math.max(4, treatmentLines.length * 3.5);

  // Additional Products
  if (payment.additionalProducts && payment.additionalProducts.length > 0) {
    payment.additionalProducts.forEach(prod => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(60, 60, 60);
      const prodText = `${prod.productName} (x${prod.quantity})`;
      const prodLines = doc.splitTextToSize(prodText, 45);
      doc.text(prodLines, leftX, y);
      doc.text(formatRupiah(prod.price * prod.quantity), rightX, y, { align: 'right' });
      y += Math.max(3.8, prodLines.length * 3.2);
    });
  }

  y += 2;
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(6, y, pageWidth - 6, y);
  y += 4.5;

  // Totals Section
  doc.setLineDashPattern([], 0);
  const subtotal = payment.subtotal || payment.treatmentPrice;
  renderMetaRow('Subtotal Tagihan:', formatRupiah(subtotal));

  if (payment.discount && payment.discount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(190, 18, 60);
    doc.text('Diskon Promosi:', leftX, y);
    doc.text(`-${formatRupiah(payment.discount)}`, rightX, y, { align: 'right' });
    y += 4;
  }

  // Total Big Row
  y += 1;
  doc.setFillColor(255, 241, 242); // Rose 50
  doc.setDrawColor(251, 113, 133); // Rose 400
  doc.roundedRect(6, y - 2.5, pageWidth - 12, 10, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(159, 18, 57);
  doc.text('TOTAL PEMBAYARAN:', leftX + 2, y + 3.5);
  doc.setFontSize(9.5);
  doc.text(formatRupiah(payment.totalAmount), rightX - 2, y + 3.5, { align: 'right' });
  y += 12;

  // Payment method info
  renderMetaRow('Metode Bayar:', payment.paymentMethod || 'Tunai', true);
  if (payment.paymentChannelName) {
    renderMetaRow('Saluran / Bank:', payment.paymentChannelName);
  }
  if (payment.referenceNumber) {
    renderMetaRow('No. Referensi:', payment.referenceNumber);
  }

  // Status Box
  const isPaid = payment.status === 'Lunas';
  doc.setFillColor(isPaid ? 236 : 254, isPaid ? 253 : 243, isPaid ? 245 : 199); // emerald-50 or amber-50
  doc.setDrawColor(isPaid ? 167 : 251, isPaid ? 243 : 191, isPaid ? 208 : 36);
  doc.roundedRect(pageWidth / 2 - 25, y, 50, 7.5, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(isPaid ? 4 : 180, isPaid ? 120 : 83, isPaid ? 87 : 9);
  doc.text(isPaid ? 'STATUS: LUNAS' : `STATUS: ${payment.status.toUpperCase()}`, pageWidth / 2, y + 5, { align: 'center' });
  y += 12;

  // Simulated Barcode
  const barStartY = y;
  const barHeight = 7;
  const barStartX = 18;
  doc.setFillColor(30, 30, 30);
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
  doc.text(`*${payment.invoiceNumber}*`, pageWidth / 2, y, { align: 'center' });
  y += 4.5;

  // Footer Instructions
  doc.setDrawColor(200, 200, 200);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(6, y, pageWidth - 6, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(120, 120, 120);
  doc.text(`Terima kasih atas kunjungan Anda di ${headerTitle}.`, pageWidth / 2, y, { align: 'center' });
  y += 3;

  if (settings.receiptFooterNote) {
    const footLines = doc.splitTextToSize(settings.receiptFooterNote, pageWidth - 16);
    doc.text(footLines, pageWidth / 2, y, { align: 'center' });
    y += footLines.length * 3;
  } else {
    doc.setFont('helvetica', 'italic');
    doc.text('Struk ini merupakan bukti pembayaran kasir yang sah.', pageWidth / 2, y, { align: 'center' });
  }

  return doc;
};

export const downloadReceiptPdf = (
  payment: Payment,
  settings: ClinicSettings
): string => {
  const doc = generateReceiptPdf(payment, settings);
  const cleanInv = payment.invoiceNumber.replace(/[\/\\?%*:|"<>]/g, '-');
  const fileName = `Struk-${cleanInv}.pdf`;
  doc.save(fileName);
  return fileName;
};
