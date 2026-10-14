export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount).replace('Rp', 'Rp ');
}

export function formatDateId(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatDateTimeId(dateTimeStr: string): string {
  if (!dateTimeStr) return '-';
  try {
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return dateTimeStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return dateTimeStr;
  }
}

export function generateNextQueueNumber(existingQueues: { queueNumber: string }[]): string {
  const count = existingQueues.length + 1;
  return `A${String(count).padStart(3, '0')}`;
}

export function generateRMNumber(existingPatients: { rmNumber: string }[]): string {
  const nextNum = existingPatients.length + 101;
  const year = new Date().getFullYear();
  return `RM-${year}-${String(nextNum).padStart(4, '0')}`;
}

export function generateInvoiceNumber(existingPayments: { invoiceNumber: string }[]): string {
  const count = existingPayments.length + 80;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `INV/GC/${year}/${month}/${String(count).padStart(4, '0')}`;
}
