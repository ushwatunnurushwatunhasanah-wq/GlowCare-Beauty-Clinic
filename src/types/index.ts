export type UserRole = 'admin' | 'dokter' | 'loket';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  avatar?: string;
  phone?: string;
  department?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Patient {
  id: string;
  rmNumber: string; // e.g. RM-2026-0101
  nik: string;
  name: string;
  gender: 'Laki-laki' | 'Perempuan';
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  bloodType?: string;
  allergies: string;
  specialNotes: string;
  totalVisits: number;
  lastVisit?: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  sipNumber: string;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
  totalPatients: number;
  schedule: {
    days: string[]; // e.g. ['Senin', 'Selasa', 'Kamis']
    hours: string; // e.g. '09:00 - 16:00'
  };
  isActive: boolean;
}

export interface Nurse {
  id: string;
  name: string;
  strNumber: string;
  phone: string;
  shift: 'Pagi (08:00 - 15:00)' | 'Sore (14:00 - 21:00)' | 'Full Day';
  assignedDoctor: string;
  isActive: boolean;
}

export interface Treatment {
  id: string;
  code: string;
  name: string;
  category: 'Facial' | 'Acne' | 'Brightening' | 'Hydra' | 'Peeling' | 'Laser' | 'Rejuvenation' | 'Hair' | 'Body';
  description: string;
  price: number;
  durationMinutes: number;
  handledBy: 'Dokter' | 'Perawat' | 'Dokter & Perawat';
  popularBadge?: boolean;
  isActive: boolean;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: 'Serum' | 'Cleanser' | 'Sunscreen' | 'Toner' | 'Cream' | 'Mask';
  price: number;
  stock: number;
  unit: string;
  description: string;
  isActive: boolean;
}

export type QueueStatus = 'Menunggu' | 'Dipanggil' | 'Sedang Dilayani' | 'Selesai' | 'Dibatalkan';

export interface QueueItem {
  id: string;
  queueNumber: string; // A001, A002...
  registrationId: string;
  patientId: string;
  patientName: string;
  patientRm: string;
  doctorId: string;
  doctorName: string;
  treatmentId: string;
  treatmentName: string;
  status: QueueStatus;
  date: string;
  time: string;
  counterRoom: string; // Ruang Konsultasi 1, Treatment Room A
  notes?: string;
  calledAt?: string;
  servedAt?: string;
  completedAt?: string;
}

export type AppointmentStatus = 'Menunggu' | 'Dikonfirmasi' | 'Datang' | 'Sedang Dilayani' | 'Selesai' | 'Dibatalkan';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  treatmentId: string;
  treatmentName: string;
  treatmentPrice: number;
  date: string;
  time: string;
  status: AppointmentStatus;
  complaint: string;
  notes?: string;
  createdAt: string;
}

export interface Registration {
  id: string;
  regNumber: string; // REG-20260926-001
  patientId: string;
  patientName: string;
  patientRm: string;
  doctorId: string;
  doctorName: string;
  treatmentId: string;
  treatmentName: string;
  queueNumber: string;
  registrationDate: string;
  registrationTime: string;
  registeredBy: string;
  notes?: string;
  paymentStatus: 'Belum Dibayar' | 'Lunas';
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientRm: string;
  doctorId: string;
  doctorName: string;
  treatmentId: string;
  treatmentName: string;
  date: string;
  complaints: string; // Keluhan pasien
  skinCondition: string; // Kondisi kulit (pori besar, jerawat papula, hiperpigmentasi, dll)
  examResult: string; // Hasil pemeriksaan dokter
  actionTaken: string; // Tindakan yang dilakukan
  productsUsed: string; // Produk/bahan yang diaplikasikan
  doctorNotes: string; // Catatan dokter
  followUpAdvice: string; // Edukasi & anjuran skincare di rumah
  nextControlDate: string; // Jadwal kontrol berikutnya
  treatmentDurationMinutes: number;
}

export type PaymentMethod = 'Cash' | 'Transfer' | 'QRIS' | 'Debit';
export type PaymentStatus = 'Belum Dibayar' | 'Lunas' | 'Dibatalkan';

export interface PaymentChannel {
  id: string;
  name: string;
  type: PaymentMethod;
  provider: string; // e.g., 'BCA', 'Mandiri', 'QRIS Dinamis', 'Kasir Tunai', 'EDC BCA'
  accountNumber?: string; // e.g. '8720-192-831', 'NMID: ID1020268892182'
  accountHolder?: string; // e.g. 'Klinik GlowCare Indonesia'
  instructions?: string;
  isActive: boolean;
  adminFee?: number;
}

export interface Payment {
  id: string;
  invoiceNumber: string; // INV/GC/2026/09/0082
  patientId: string;
  patientName: string;
  patientRm: string;
  treatmentId: string;
  treatmentName: string;
  treatmentPrice: number;
  additionalProducts?: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod?: PaymentMethod;
  paymentChannelId?: string;
  paymentChannelName?: string;
  referenceNumber?: string;
  status: PaymentStatus;
  paidAt?: string;
  createdAt?: string;
  cashierName: string;
  notes?: string;
}

export type CommentStatus = 'Menunggu' | 'Ditampilkan' | 'Disembunyikan' | 'Ditindaklanjuti';

export interface PatientRatingComment {
  id: string;
  patientName: string; // masked in public view like "Siti A*****"
  patientRm: string;
  treatmentName: string;
  doctorName: string;
  overallRating: number; // 1 - 5
  aspectRatings: {
    treatmentQuality: number;
    doctorCare: number;
    nurseService: number;
    receptionistFriendliness: number;
    clinicCleanliness: number;
    roomComfort: number;
    serviceSpeed: number;
  };
  comment: string;
  date: string;
  status: CommentStatus;
  adminNotes?: string;
  clinicResponse?: string;
  flaggedForFollowUp?: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  target: string;
  ipAddress: string;
}

export interface ClinicNotification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'queue' | 'treatment' | 'review' | 'payment' | 'system';
  timestamp: string;
  isRead: boolean;
  linkMenu?: string;
}

export interface ClinicSettings {
  name: string;
  slogan: string;
  address: string;
  phone: string;
  email: string;
  instagram: string;
  operatingHours: string;
  consultationFee: number;
  taxPercentage: number;
  receiptHeaderNote: string;
  receiptFooterNote: string;
  receiptHeaderTitle?: string;
  receiptHeaderSubtitle?: string;
  receiptHeaderAddress?: string;
  receiptHeaderPhone?: string;
}

export interface NeonConfig {
  connectionString: string;
  isConnected: boolean;
  autoSync: boolean;
  lastSyncTime?: string;
  databaseName?: string;
  pgVersion?: string;
  latencyMs?: number;
}
