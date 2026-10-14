import {
  User,
  Patient,
  Doctor,
  Nurse,
  Treatment,
  Product,
  QueueItem,
  Appointment,
  Registration,
  MedicalRecord,
  Payment,
  PaymentChannel,
  PatientRatingComment,
  ActivityLog,
  ClinicNotification,
  ClinicSettings
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Nur Ushwatun Hasanah',
    email: 'admin@glowcare.test',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    phone: '0812-3456-7890',
    department: 'Manajemen Operasional',
    status: 'active',
    createdAt: '2026-01-10 08:00:00'
  },
  {
    id: 'usr-2',
    name: 'dr. Andini Putri, Sp.DV',
    email: 'dr.andini@glowcare.test',
    role: 'dokter',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256',
    phone: '0813-8877-6655',
    department: 'Dermatologi & Estetika',
    status: 'active',
    createdAt: '2026-01-12 09:30:00'
  },
  {
    id: 'usr-3',
    name: 'Rina Kusuma Dewi',
    email: 'loket@glowcare.test',
    role: 'loket',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
    phone: '0819-2233-4455',
    department: 'Front Office & Pendaftaran',
    status: 'active',
    createdAt: '2026-01-15 10:00:00'
  },
  {
    id: 'usr-4',
    name: 'dr. Citra Lestari, Sp.KK, M.Biomed',
    email: 'dr.citra@glowcare.test',
    role: 'dokter',
    avatar: 'https://images.unsplash.com/photo-1594824813689-53e3fa299be1?auto=format&fit=crop&q=80&w=256',
    phone: '0812-7788-9900',
    department: 'Anti-Aging & Laser Aesthetics Specialist',
    status: 'active',
    createdAt: '2026-01-18 10:00:00'
  },
  {
    id: 'usr-5',
    name: 'dr. Celine Maharani. Sp',
    email: 'dr.celine@glowcare.test',
    role: 'dokter',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=256',
    phone: '0812778432',
    department: 'Hair Growth Laser Stimulation & Aesthetic',
    status: 'active',
    createdAt: '2026-02-01 10:00:00'
  },
  {
    id: 'usr-6',
    name: 'dr. Farhan Hidayat, M.Kes, AAM',
    email: 'dr.farhan@glowcare.test',
    role: 'dokter',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256',
    phone: '0811-3344-5566',
    department: 'Aesthetic Medicine & Skin Rejuvenation',
    status: 'active',
    createdAt: '2026-02-05 11:00:00'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    rmNumber: 'RM-2026-0101',
    nik: '3273014508980002',
    name: 'Siti Rahmawati',
    gender: 'Perempuan',
    birthDate: '1998-08-15',
    phone: '0812-9988-7711',
    email: 'siti.rahmawati@gmail.com',
    address: 'Jl. Kemang Raya No. 42, Jakarta Selatan',
    bloodType: 'B',
    allergies: 'Alergi seafood, benzoyl peroxide dosis tinggi',
    specialNotes: 'Kulit sensitif, kecenderungan kemerahan (rosacea prone)',
    totalVisits: 5,
    lastVisit: '2026-09-20',
    createdAt: '2026-02-14'
  },
  {
    id: 'pat-2',
    rmNumber: 'RM-2026-0102',
    nik: '3273016004950001',
    name: 'Dian Permatasari',
    gender: 'Perempuan',
    birthDate: '1995-04-20',
    phone: '0821-4455-6677',
    email: 'dian.permatasari@gmail.com',
    address: 'Jl. Senopati No. 18, Jakarta Selatan',
    bloodType: 'O',
    allergies: 'Tidak ada riwayat alergi',
    specialNotes: 'Fokus pencerahan wajah dan flek bekas jerawat',
    totalVisits: 8,
    lastVisit: '2026-09-24',
    createdAt: '2026-01-18'
  },
  {
    id: 'pat-3',
    rmNumber: 'RM-2026-0103',
    nik: '3171021203920005',
    name: 'Nadia Anggraini',
    gender: 'Perempuan',
    birthDate: '1992-03-12',
    phone: '0857-1122-3344',
    email: 'nadia.anggraini@yahoo.com',
    address: 'Apartemen Sudirman Tower A Lt. 12, Jakarta Pusat',
    bloodType: 'A',
    allergies: 'Sulfur, pewangi buatan (fragrance)',
    specialNotes: 'Persiapan perawatan pre-wedding dalam 2 bulan ke depan',
    totalVisits: 12,
    lastVisit: '2026-09-26',
    createdAt: '2026-01-05'
  },
  {
    id: 'pat-4',
    rmNumber: 'RM-2026-0104',
    nik: '3174092506990003',
    name: 'Reza Pratama',
    gender: 'Laki-laki',
    birthDate: '1999-06-25',
    phone: '0813-7766-5544',
    email: 'reza.pratama@outlook.com',
    address: 'Jl. Tebet Barat Dalam No. 8, Jakarta Selatan',
    bloodType: 'AB',
    allergies: 'Tidak ada riwayat alergi obat',
    specialNotes: 'Masalah komedo membandel dan pori-pori besar di T-zone',
    totalVisits: 3,
    lastVisit: '2026-09-18',
    createdAt: '2026-04-10'
  },
  {
    id: 'pat-5',
    rmNumber: 'RM-2026-0105',
    nik: '3275085112930004',
    name: 'Clara Michelle',
    gender: 'Perempuan',
    birthDate: '1993-12-11',
    phone: '0818-0909-1212',
    email: 'clara.michelle@gmail.com',
    address: 'Pondok Indah Bukit Hijau VII No. 15, Jakarta Selatan',
    bloodType: 'O',
    allergies: 'Kacang kedelai, alkohol denat',
    specialNotes: 'Maintenance hidrasi rutin & botox dahi halus',
    totalVisits: 15,
    lastVisit: '2026-09-25',
    createdAt: '2026-01-02'
  },
  {
    id: 'pat-6',
    rmNumber: 'RM-2026-0106',
    nik: '3273014101970008',
    name: 'Aisyah Putri Zahrani',
    gender: 'Perempuan',
    birthDate: '1997-01-01',
    phone: '0878-5544-3322',
    email: 'aisyah.pz@gmail.com',
    address: 'Jl. Gandaria Tengah III No. 5, Jakarta Selatan',
    bloodType: 'B',
    allergies: 'Tidak ada',
    specialNotes: 'Sedang program peeling berkala setiap 3 minggu',
    totalVisits: 4,
    lastVisit: '2026-09-22',
    createdAt: '2026-05-15'
  }
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'dr. Andini Putri, Sp.DV',
    specialization: 'Spesialis Dermatologi & Venereologi',
    sipNumber: 'SIP.446.1/045/Dinkes/2024',
    phone: '0813-8877-6655',
    email: 'dr.andini@glowcare.test',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=256',
    rating: 4.9,
    totalPatients: 420,
    schedule: {
      days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
      hours: '09:00 - 16:00'
    },
    isActive: true
  },
  {
    id: 'doc-2',
    name: 'dr. Citra Lestari, Sp.KK, M.Biomed',
    specialization: 'Anti-Aging & Laser Aesthetics Specialist',
    sipNumber: 'SIP.446.1/089/Dinkes/2023',
    phone: '0812-7788-9900',
    email: 'dr.citra@glowcare.test',
    avatar: 'https://images.unsplash.com/photo-1594824813689-53e3fa299be1?auto=format&fit=crop&q=80&w=256',
    rating: 4.8,
    totalPatients: 385,
    schedule: {
      days: ['Selasa', 'Rabu', 'Jumat', 'Sabtu'],
      hours: '10:00 - 18:00'
    },
    isActive: true
  },
  {
    id: 'doc-3',
    name: 'dr. Farhan Hidayat, M.Kes, AAM',
    specialization: 'Aesthetic Medicine & Skin Rejuvenation',
    sipNumber: 'SIP.446.1/112/Dinkes/2025',
    phone: '0811-3344-5566',
    email: 'dr.farhan@glowcare.test',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256',
    rating: 4.85,
    totalPatients: 310,
    schedule: {
      days: ['Senin', 'Kamis', 'Sabtu', 'Minggu'],
      hours: '11:00 - 19:00'
    },
    isActive: true
  },
  {
    id: 'doc-4',
    name: 'dr. Celine Maharani. Sp',
    specialization: 'Hair Growth Laser Stimulation & Aesthetic Specialist',
    sipNumber: 'SIP.446.1/120/Dinkes/2026',
    phone: '0812778432',
    email: 'dr.celine@glowcare.test',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=256',
    rating: 4.9,
    totalPatients: 0,
    schedule: {
      days: ['Senin', 'Rabu', 'Jumat'],
      hours: '09:00 - 16:00'
    },
    isActive: true
  }
];

export const INITIAL_NURSES: Nurse[] = [
  {
    id: 'nur-1',
    name: 'Ns. Maya Indah, S.Kep',
    strNumber: 'STR-K.14.09.8821',
    phone: '0812-1111-2222',
    shift: 'Pagi (08:00 - 15:00)',
    assignedDoctor: 'dr. Andini Putri, Sp.DV',
    isActive: true
  },
  {
    id: 'nur-2',
    name: 'Ns. Tiara Salsabila, S.Kep',
    strNumber: 'STR-K.14.09.9142',
    phone: '0813-2222-3333',
    shift: 'Sore (14:00 - 21:00)',
    assignedDoctor: 'dr. Citra Lestari, Sp.KK, M.Biomed',
    isActive: true
  },
  {
    id: 'nur-3',
    name: 'Ns. Ratna Wulandari, S.Kep',
    strNumber: 'STR-K.14.09.7765',
    phone: '0819-3333-4444',
    shift: 'Full Day',
    assignedDoctor: 'dr. Farhan Hidayat, M.Kes, AAM',
    isActive: true
  },
  {
    id: 'nur-4',
    name: 'Ns. Dewi Anggraini, A.Md.Kep',
    strNumber: 'STR-K.14.09.6543',
    phone: '0812-4455-6677',
    shift: 'Pagi (08:00 - 15:00)',
    assignedDoctor: 'dr. Celine Maharani. Sp',
    isActive: true
  },
  {
    id: 'nur-5',
    name: 'Ns. Amanda Kusuma, S.Kep, Ners',
    strNumber: 'STR-K.14.09.3210',
    phone: '0813-5566-7788',
    shift: 'Sore (14:00 - 21:00)',
    assignedDoctor: 'dr. Budi Santoso, Sp.KK',
    isActive: true
  },
  {
    id: 'nur-6',
    name: 'Ns. Rian Pratama, S.Kep',
    strNumber: 'STR-K.14.09.4321',
    phone: '0818-6677-8899',
    shift: 'Pagi (08:00 - 15:00)',
    assignedDoctor: 'dr. Andini Putri, Sp.DV',
    isActive: true
  },
  {
    id: 'nur-7',
    name: 'Ns. Fitriani Rahma, A.Md.Kep',
    strNumber: 'STR-K.14.09.5432',
    phone: '0821-7788-9900',
    shift: 'Sore (14:00 - 21:00)',
    assignedDoctor: 'dr. Citra Lestari, Sp.KK, M.Biomed',
    isActive: false
  }
];

export const INITIAL_TREATMENTS: Treatment[] = [
  {
    id: 'trt-1',
    code: 'TRT-001',
    name: 'Basic Facial Glow',
    category: 'Facial',
    description: 'Pembersihan mendalam, ekstraksi komedo higienis, relaksasi acupressure wajah, dan masker nutrisi aloe vera.',
    price: 150000,
    durationMinutes: 60,
    handledBy: 'Perawat',
    popularBadge: true,
    isActive: true
  },
  {
    id: 'trt-2',
    code: 'TRT-002',
    name: 'Acne Purifying Treatment',
    category: 'Acne',
    description: 'Terapi penanganan jerawat aktif, komedo, sterilisasi high frequency (HF), serum anti-inflamasi, dan masker tea tree soothing.',
    price: 350000,
    durationMinutes: 75,
    handledBy: 'Dokter & Perawat',
    popularBadge: true,
    isActive: true
  },
  {
    id: 'trt-3',
    code: 'TRT-003',
    name: 'Hydrafacial Deep Infusion',
    category: 'Hydra',
    description: 'Pembersihan vortex exfoliation, suction pori vakum mikro, dan infusi serum hyaluronic acid untuk hidrasi maksimal seketika.',
    price: 650000,
    durationMinutes: 75,
    handledBy: 'Dokter & Perawat',
    popularBadge: true,
    isActive: true
  },
  {
    id: 'trt-4',
    code: 'TRT-004',
    name: 'Brightening Laser Rejuvenation',
    category: 'Laser',
    description: 'Q-Switched Nd:YAG Laser untuk menyamarkan flek hitam, hiperpigmentasi, meratakan rona wajah, dan menstimulasi kolagen baru.',
    price: 1250000,
    durationMinutes: 45,
    handledBy: 'Dokter',
    popularBadge: true,
    isActive: true
  },
  {
    id: 'trt-5',
    code: 'TRT-005',
    name: 'Chemical Peeling Glow AHA/BHA',
    category: 'Peeling',
    description: 'Eksfoliasi kimia lembut terkontrol untuk mengangkat tumpukan sel kulit mati, mempercepat regenerasi sel, dan menghaluskan tekstur kulit.',
    price: 375000,
    durationMinutes: 45,
    handledBy: 'Dokter',
    popularBadge: false,
    isActive: true
  },
  {
    id: 'trt-6',
    code: 'TRT-006',
    name: 'Korean Glass Skin DNA Salmon',
    category: 'Rejuvenation',
    description: 'Microneedling mesotherapy dengan infusi serum Polydeoxyribonucleotide (PDRN) DNA Salmon murni untuk regenerasi sel dan kilau alami.',
    price: 1850000,
    durationMinutes: 90,
    handledBy: 'Dokter',
    popularBadge: true,
    isActive: true
  },
  {
    id: 'trt-7',
    code: 'TRT-007',
    name: 'OxyGeneo Super Facial 3-in-1',
    category: 'Facial',
    description: 'Kombinasi eksfoliasi, oksigenasi alami dari dalam jaringan kulit (Bohr effect), dan infusi nutrisi peptida aktif.',
    price: 850000,
    durationMinutes: 60,
    handledBy: 'Dokter & Perawat',
    popularBadge: false,
    isActive: true
  },
  {
    id: 'trt-8',
    code: 'TRT-008',
    name: 'Hair Growth Laser Stimulation',
    category: 'Hair',
    description: 'Terapi stimulasi folikel rambut menggunakan Low Level Laser Therapy (LLLT) dan serum peptide khusus penumbuh akar rambut.',
    price: 550000,
    durationMinutes: 50,
    handledBy: 'Dokter',
    popularBadge: false,
    isActive: true
  },
  {
    id: 'trt-9',
    code: 'TRT-009',
    name: 'Body Slimming RF & Cavitation',
    category: 'Body',
    description: 'Penghancuran lemak lokal dengan gelombang ultrasonik cavitation dan pengencangan kulit bergelambir dengan Radio Frequency.',
    price: 750000,
    durationMinutes: 60,
    handledBy: 'Perawat',
    popularBadge: false,
    isActive: true
  },
  {
    id: 'trt-10',
    code: 'TRT-010',
    name: 'Derma Clarifying Peeling TCA',
    category: 'Peeling',
    description: 'Trichloroacetic Acid peeling konsentrasi medis untuk mengatasi scar bopeng jerawat dan tekstur kulit kasar.',
    price: 600000,
    durationMinutes: 50,
    handledBy: 'Dokter',
    popularBadge: false,
    isActive: true
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prd-1',
    code: 'SKN-CRM-01',
    name: 'GlowCare Barrier Repair Ceramide Cream',
    category: 'Cream',
    price: 185000,
    stock: 48,
    unit: 'Tube 50gr',
    description: 'Pelembap kaya 5x Ceramide, Centella Asiatica & Hyaluron untuk memperkuat skin barrier pasca treatment.',
    isActive: true
  },
  {
    id: 'prd-2',
    code: 'SKN-SRM-02',
    name: 'GlowCare Niacinamide 10% + Zinc Glow Serum',
    category: 'Serum',
    price: 210000,
    stock: 62,
    unit: 'Botol Pipet 30ml',
    description: 'Serum pencerah konsentrasi tinggi untuk menyamarkan noda hitam dan mengontrol minyak berlebih.',
    isActive: true
  },
  {
    id: 'prd-3',
    code: 'SKN-SUN-03',
    name: 'GlowCare Ultra Invisible Sunscreen SPF 50+ PA++++',
    category: 'Sunscreen',
    price: 165000,
    stock: 75,
    unit: 'Tube 50ml',
    description: 'Perlindungan spektrum luas tanpa whitecast, tekstur seringan air, aman untuk kulit acne-prone.',
    isActive: true
  },
  {
    id: 'prd-4',
    code: 'SKN-CLN-04',
    name: 'Gentle Low pH Calming Cleanser',
    category: 'Cleanser',
    price: 120000,
    stock: 55,
    unit: 'Botol Pump 100ml',
    description: 'Sabun cuci muka pH 5.5 seimbang tanpa sulfat (SLS-free), melembutkan kulit tanpa rasa ketarik.',
    isActive: true
  },
  {
    id: 'prd-5',
    code: 'SKN-TON-05',
    name: 'Hydrating Essence Toner B5',
    category: 'Toner',
    price: 145000,
    stock: 40,
    unit: 'Botol 120ml',
    description: 'Toner esensi dengan Provitamin B5 dan Rose Water murni untuk hidrasi instan dan calming kemerahan.',
    isActive: true
  }
];

export const INITIAL_QUEUES: QueueItem[] = [
  {
    id: 'que-1',
    queueNumber: 'A001',
    registrationId: 'reg-01',
    patientId: 'pat-3',
    patientName: 'Nadia Anggraini',
    patientRm: 'RM-2026-0103',
    doctorId: 'doc-1',
    doctorName: 'dr. Andini Putri, Sp.DV',
    treatmentId: 'trt-3',
    treatmentName: 'Hydrafacial Deep Infusion',
    status: 'Sedang Dilayani',
    date: '2026-09-26',
    time: '09:15',
    counterRoom: 'Ruang Konsultasi 1 & Treatment A',
    calledAt: '09:20',
    servedAt: '09:25'
  },
  {
    id: 'que-2',
    queueNumber: 'A002',
    registrationId: 'reg-02',
    patientId: 'pat-1',
    patientName: 'Siti Rahmawati',
    patientRm: 'RM-2026-0101',
    doctorId: 'doc-1',
    doctorName: 'dr. Andini Putri, Sp.DV',
    treatmentId: 'trt-2',
    treatmentName: 'Acne Purifying Treatment',
    status: 'Dipanggil',
    date: '2026-09-26',
    time: '09:30',
    counterRoom: 'Ruang Konsultasi 1',
    calledAt: '09:40'
  },
  {
    id: 'que-3',
    queueNumber: 'A003',
    registrationId: 'reg-03',
    patientId: 'pat-2',
    patientName: 'Dian Permatasari',
    patientRm: 'RM-2026-0102',
    doctorId: 'doc-2',
    doctorName: 'dr. Citra Lestari, Sp.KK, M.Biomed',
    treatmentId: 'trt-4',
    treatmentName: 'Brightening Laser Rejuvenation',
    status: 'Menunggu',
    date: '2026-09-26',
    time: '10:00',
    counterRoom: 'Ruang Laser 2'
  },
  {
    id: 'que-4',
    queueNumber: 'A004',
    registrationId: 'reg-04',
    patientId: 'pat-4',
    patientName: 'Reza Pratama',
    patientRm: 'RM-2026-0104',
    doctorId: 'doc-3',
    doctorName: 'dr. Farhan Hidayat, M.Kes, AAM',
    treatmentId: 'trt-1',
    treatmentName: 'Basic Facial Glow',
    status: 'Menunggu',
    date: '2026-09-26',
    time: '10:30',
    counterRoom: 'Ruang Facial 3'
  },
  {
    id: 'que-5',
    queueNumber: 'A005',
    registrationId: 'reg-05',
    patientId: 'pat-5',
    patientName: 'Clara Michelle',
    patientRm: 'RM-2026-0105',
    doctorId: 'doc-2',
    doctorName: 'dr. Citra Lestari, Sp.KK, M.Biomed',
    treatmentId: 'trt-6',
    treatmentName: 'Korean Glass Skin DNA Salmon',
    status: 'Menunggu',
    date: '2026-09-26',
    time: '11:15',
    counterRoom: 'Ruang Anti-Aging'
  },
  {
    id: 'que-6',
    queueNumber: 'A006',
    registrationId: 'reg-06',
    patientId: 'pat-6',
    patientName: 'Maya Safitri',
    patientRm: 'RM-2026-0106',
    doctorId: 'doc-4',
    doctorName: 'dr. Celine Maharani. Sp',
    treatmentId: 'trt-8',
    treatmentName: 'Hair Growth Laser Stimulation',
    status: 'Menunggu',
    date: '2026-09-26',
    time: '13:00',
    counterRoom: 'Ruang Hair & Scalp Therapy'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'pat-3',
    patientName: 'Nadia Anggraini',
    patientPhone: '0857-1122-3344',
    doctorId: 'doc-1',
    doctorName: 'dr. Andini Putri, Sp.DV',
    treatmentId: 'trt-3',
    treatmentName: 'Hydrafacial Deep Infusion',
    treatmentPrice: 650000,
    date: '2026-09-26',
    time: '09:15',
    status: 'Sedang Dilayani',
    complaint: 'Kulit dehidrasi dan kusam karena sering lembur di ruangan ber-AC.',
    createdAt: '2026-09-24 14:10'
  },
  {
    id: 'apt-2',
    patientId: 'pat-1',
    patientName: 'Siti Rahmawati',
    patientPhone: '0812-9988-7711',
    doctorId: 'doc-1',
    doctorName: 'dr. Andini Putri, Sp.DV',
    treatmentId: 'trt-2',
    treatmentName: 'Acne Purifying Treatment',
    treatmentPrice: 350000,
    date: '2026-09-26',
    time: '09:30',
    status: 'Datang',
    complaint: 'Muncul breakout jerawat papula di area pipi kanan pasca menstruasi.',
    createdAt: '2026-09-25 11:20'
  },
  {
    id: 'apt-3',
    patientId: 'pat-2',
    patientName: 'Dian Permatasari',
    patientPhone: '0821-4455-6677',
    doctorId: 'doc-2',
    doctorName: 'dr. Citra Lestari, Sp.KK, M.Biomed',
    treatmentId: 'trt-4',
    treatmentName: 'Brightening Laser Rejuvenation',
    treatmentPrice: 1250000,
    date: '2026-09-26',
    time: '10:00',
    status: 'Dikonfirmasi',
    complaint: 'Melasma dan flek matahari di tulang pipi butuh sesi lanjutan ke-3.',
    createdAt: '2026-09-23 16:45'
  },
  {
    id: 'apt-4',
    patientId: 'pat-4',
    patientName: 'Reza Pratama',
    patientPhone: '0813-7766-5544',
    doctorId: 'doc-3',
    doctorName: 'dr. Farhan Hidayat, M.Kes, AAM',
    treatmentId: 'trt-1',
    treatmentName: 'Basic Facial Glow',
    treatmentPrice: 150000,
    date: '2026-09-26',
    time: '10:30',
    status: 'Dikonfirmasi',
    complaint: 'Komedo hitam kasar di hidung dan area dagu.',
    createdAt: '2026-09-25 18:00'
  },
  {
    id: 'apt-5',
    patientId: 'pat-5',
    patientName: 'Clara Michelle',
    patientPhone: '0818-0909-1212',
    doctorId: 'doc-2',
    doctorName: 'dr. Citra Lestari, Sp.KK, M.Biomed',
    treatmentId: 'trt-6',
    treatmentName: 'Korean Glass Skin DNA Salmon',
    treatmentPrice: 1850000,
    date: '2026-09-26',
    time: '11:15',
    status: 'Dikonfirmasi',
    complaint: 'Ingin booster elastisitas kulit dan efek glass skin instan.',
    createdAt: '2026-09-24 09:12'
  },
  {
    id: 'apt-6',
    patientId: 'pat-6',
    patientName: 'Aisyah Putri Zahrani',
    patientPhone: '0878-5544-3322',
    doctorId: 'doc-1',
    doctorName: 'dr. Andini Putri, Sp.DV',
    treatmentId: 'trt-5',
    treatmentName: 'Chemical Peeling Glow AHA/BHA',
    treatmentPrice: 375000,
    date: '2026-09-27',
    time: '13:00',
    status: 'Menunggu',
    complaint: 'Tekstur kulit gradakan dan bekas jerawat PIH kecokelatan.',
    createdAt: '2026-09-26 08:30'
  },
  {
    id: 'apt-7',
    patientId: 'pat-6',
    patientName: 'Maya Safitri',
    patientPhone: '0812-3344-5566',
    doctorId: 'doc-4',
    doctorName: 'dr. Celine Maharani. Sp',
    treatmentId: 'trt-8',
    treatmentName: 'Hair Growth Laser Stimulation',
    treatmentPrice: 550000,
    date: '2026-09-26',
    time: '13:00',
    status: 'Dikonfirmasi',
    complaint: 'Penipisan rambut di area vertex dan kerontokan pasca melahirkan.',
    createdAt: '2026-09-25 14:00'
  }
];

export const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-01',
    regNumber: 'REG-20260926-001',
    patientId: 'pat-3',
    patientName: 'Nadia Anggraini',
    patientRm: 'RM-2026-0103',
    doctorId: 'doc-1',
    doctorName: 'dr. Andini Putri, Sp.DV',
    treatmentId: 'trt-3',
    treatmentName: 'Hydrafacial Deep Infusion',
    queueNumber: 'A001',
    registrationDate: '2026-09-26',
    registrationTime: '08:45',
    registeredBy: 'Rina Kusuma Dewi (Loket)',
    paymentStatus: 'Belum Dibayar',
    notes: 'Pasien datang tepat waktu, kondisi umum baik.'
  },
  {
    id: 'reg-02',
    regNumber: 'REG-20260926-002',
    patientId: 'pat-1',
    patientName: 'Siti Rahmawati',
    patientRm: 'RM-2026-0101',
    doctorId: 'doc-1',
    doctorName: 'dr. Andini Putri, Sp.DV',
    treatmentId: 'trt-2',
    treatmentName: 'Acne Purifying Treatment',
    queueNumber: 'A002',
    registrationDate: '2026-09-26',
    registrationTime: '09:05',
    registeredBy: 'Rina Kusuma Dewi (Loket)',
    paymentStatus: 'Belum Dibayar',
    notes: 'Keluhan jerawat hormonal membandel.'
  },
  {
    id: 'reg-03',
    regNumber: 'REG-20260926-003',
    patientId: 'pat-2',
    patientName: 'Dian Permatasari',
    patientRm: 'RM-2026-0102',
    doctorId: 'doc-2',
    doctorName: 'dr. Citra Lestari, Sp.KK, M.Biomed',
    treatmentId: 'trt-4',
    treatmentName: 'Brightening Laser Rejuvenation',
    queueNumber: 'A003',
    registrationDate: '2026-09-26',
    registrationTime: '09:20',
    registeredBy: 'Rina Kusuma Dewi (Loket)',
    paymentStatus: 'Belum Dibayar'
  },
  {
    id: 'reg-04',
    regNumber: 'REG-20260927-001',
    patientId: 'pat-4',
    patientName: 'Maya Safitri',
    patientRm: 'RM-2026-0104',
    doctorId: 'doc-3',
    doctorName: 'dr. Farhan Hidayat, M.Kes, AAM',
    treatmentId: 'trt-5',
    treatmentName: 'Korean Glass Skin Peeling',
    queueNumber: 'A004',
    registrationDate: '2026-09-27',
    registrationTime: '10:00',
    registeredBy: 'Rina Kusuma Dewi (Loket)',
    paymentStatus: 'Belum Dibayar',
    notes: 'Konsultasi anti-aging dan flek ringan.'
  },
  {
    id: 'reg-05',
    regNumber: 'REG-20260927-002',
    patientId: 'pat-5',
    patientName: 'drg. Rina Oktaviani',
    patientRm: 'RM-2026-0105',
    doctorId: 'doc-1',
    doctorName: 'dr. Andini Putri, Sp.DV',
    treatmentId: 'trt-6',
    treatmentName: 'Collagen Booster Infusion',
    queueNumber: 'A005',
    registrationDate: '2026-09-27',
    registrationTime: '10:30',
    registeredBy: 'Rina Kusuma Dewi (Loket)',
    paymentStatus: 'Belum Dibayar'
  },
  {
    id: 'reg-06',
    regNumber: 'REG-20260928-001',
    patientId: 'pat-6',
    patientName: 'Budi Santoso',
    patientRm: 'RM-2026-0106',
    doctorId: 'doc-2',
    doctorName: 'dr. Citra Lestari, Sp.KK, M.Biomed',
    treatmentId: 'trt-1',
    treatmentName: 'Basic Facial Glow',
    queueNumber: 'A006',
    registrationDate: '2026-09-28',
    registrationTime: '11:15',
    registeredBy: 'Rina Kusuma Dewi (Loket)',
    paymentStatus: 'Belum Dibayar'
  },
  {
    id: 'reg-07',
    regNumber: 'REG-20260928-002',
    patientId: 'pat-7',
    patientName: 'Ahmad Faisal',
    patientRm: 'RM-2026-0107',
    doctorId: 'doc-3',
    doctorName: 'dr. Farhan Hidayat, M.Kes, AAM',
    treatmentId: 'trt-8',
    treatmentName: 'Hair Growth & Scalp Therapy',
    queueNumber: 'A007',
    registrationDate: '2026-09-28',
    registrationTime: '13:00',
    registeredBy: 'Rina Kusuma Dewi (Loket)',
    paymentStatus: 'Belum Dibayar'
  }
];

export const INITIAL_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'mr-1',
    patientId: 'pat-1',
    patientName: 'Siti Rahmawati',
    patientRm: 'RM-2026-0101',
    doctorId: 'doc-1',
    doctorName: 'dr. Andini Putri, Sp.DV',
    treatmentId: 'trt-2',
    treatmentName: 'Acne Purifying Treatment',
    date: '2026-09-20',
    complaints: 'Breakout jerawat inflamasi di pipi kanan & dagu disertai rasa nyeri saat disentuh.',
    skinCondition: 'Tipe kulit kombinasi berminyak, terdapat 8 lesi papula eritematosa, 3 pustula kecil, komedo tertutup di T-zone.',
    examResult: 'Acne Vulgaris derajat sedang (Grade II) eksaserbasi faktor hormonal.',
    actionTaken: 'Cleansing antiseptik, ekstraksi komedo non-inflamasi, electrocauter HF sterilisasi jerawat, aplikasi serum asam salisilat 2%, kompres dingin chamomile, dan photo dynamic therapy (PDT) sinar biru 20 menit.',
    productsUsed: 'GlowCare Gentle Cleanser, Salicylic Purifying Gel, Tea Tree Calming Mask.',
    doctorNotes: 'Respon kulit sangat baik, peradangan mulai mereda pasca PDT. Hindari scrub kasar dan susu sapi berlebih selama 1 minggu.',
    followUpAdvice: 'Gunakan tabir surya SPF 50 setiap 3 jam saat aktivitas luar. Lanjutkan totol jerawat malam hari.',
    nextControlDate: '2026-09-27',
    treatmentDurationMinutes: 75
  },
  {
    id: 'mr-2',
    patientId: 'pat-2',
    patientName: 'Dian Permatasari',
    patientRm: 'RM-2026-0102',
    doctorId: 'doc-2',
    doctorName: 'dr. Citra Lestari, Sp.KK, M.Biomed',
    treatmentId: 'trt-4',
    treatmentName: 'Brightening Laser Rejuvenation',
    date: '2026-09-24',
    complaints: 'Bercak kecokelatan melasma di malar zygomaticus bilateral semakin terlihat jelas pasca liburan pantai.',
    skinCondition: 'Fitzpatrick skin type IV, hiperpigmentasi epidermal tidak merata, skin barrier cukup sehat dan tidak kemerahan.',
    examResult: 'Epidermal melasma & freckles derajat ringan-sedang.',
    actionTaken: 'Anestesi topikal 25 menit, Q-switched Nd:YAG Laser 1064nm low fluence toning 4 pass, pendinginan cryo roller -5°C, aplikasi sheet mask peptide brightening.',
    productsUsed: 'Cream anestesi lidocaine 4%, Niacinamide Glow Serum, Post-Laser Soothing Gel.',
    doctorNotes: 'Eritema ringan transien selama 30 menit pasca laser, tidak ada blistering atau purpura.',
    followUpAdvice: 'Wajib reapply sunscreen 2 jari setiap pagi & siang. Tidak boleh menggunakan retinol atau AHA selama 4 hari ke depan.',
    nextControlDate: '2026-10-15',
    treatmentDurationMinutes: 50
  },
  {
    id: 'mr-3',
    patientId: 'pat-5',
    patientName: 'Clara Michelle',
    patientRm: 'RM-2026-0105',
    doctorId: 'doc-2',
    doctorName: 'dr. Citra Lestari, Sp.KK, M.Biomed',
    treatmentId: 'trt-6',
    treatmentName: 'Korean Glass Skin DNA Salmon',
    date: '2026-09-25',
    complaints: 'Garis halus di dahi dan kulit tampak lelah kusam akibat sering penerbangan antar kota.',
    skinCondition: 'Kulit kering dehidrasi (transepidermal water loss meningkat), elastisitas agak menurun di bawah mata.',
    examResult: 'Photoaging awal, fine lines dahi dan periorbital.',
    actionTaken: 'Microneedling kedalaman 0.8mm dengan sterile cartridge, infusi PDRN Salmon DNA 2.5ml merata, electroporation booster, soothing biocellulose mask.',
    productsUsed: 'Rejuran Salmon PDRN concentrate, Hyaluronic Acid B5, Barrier Repair Cream.',
    doctorNotes: 'Penetrasi serum optimal, pasien merasa nyaman tanpa keluhan perih berlebih.',
    followUpAdvice: 'Jangan membasuh wajah dengan air panas selama 24 jam. Gunakan pelembap ceramide secara intensif.',
    nextControlDate: '2026-10-23',
    treatmentDurationMinutes: 85
  },
  {
    id: 'mr-4',
    patientId: 'pat-4',
    patientName: 'Reza Pratama',
    patientRm: 'RM-2026-0104',
    doctorId: 'doc-3',
    doctorName: 'dr. Farhan Hidayat, M.Kes, AAM',
    treatmentId: 'trt-1',
    treatmentName: 'Basic Facial Glow',
    date: '2026-09-22',
    complaints: 'Komedo membandel dan kulit berminyak kusam di T-zone.',
    skinCondition: 'Pori-pori membesar di area hidung & pipi, sebum tinggi.',
    examResult: 'Komedonal acne ringan.',
    actionTaken: 'Deep cleansing, vacuum suction komedo, aplikasi masker purifying tea tree.',
    productsUsed: 'GlowCare Cleanser, Salicylic Gel.',
    doctorNotes: 'Wajah jauh lebih bersih dan komedo terangkat optimal.',
    followUpAdvice: 'Rutin cuci muka 2 kali sehari dan gunakan sunscreen oil-free.',
    nextControlDate: '2026-10-10',
    treatmentDurationMinutes: 45
  },
  {
    id: 'mr-5',
    patientId: 'pat-6',
    patientName: 'Maya Safitri',
    patientRm: 'RM-2026-0106',
    doctorId: 'doc-4',
    doctorName: 'dr. Celine Maharani. Sp',
    treatmentId: 'trt-8',
    treatmentName: 'Hair Growth Laser Stimulation',
    date: '2026-09-23',
    complaints: 'Kerontokan rambut berlebih lebih dari 100 helai per hari.',
    skinCondition: 'Kulit kepala agak berminyak, densitas rambut menurun di area mahkota.',
    examResult: 'Telogen Effluvium derajat sedang.',
    actionTaken: 'Scalp cleansing antiseptik, infusi peptide serum penumbuh akar, Low Level Laser Therapy (LLLT) 20 menit.',
    productsUsed: 'Hair Growth Peptide Tonic, Scalp Purifying Serum.',
    doctorNotes: 'Stimulasi folikel berjalan baik, tidak ada iritasi di kulit kepala.',
    followUpAdvice: 'Hindari mengikat rambut terlalu kencang dan gunakan tonik tiap malam.',
    nextControlDate: '2026-10-07',
    treatmentDurationMinutes: 50
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    invoiceNumber: 'INV/GC/2026/09/0080',
    patientId: 'pat-5',
    patientName: 'Clara Michelle',
    patientRm: 'RM-2026-0105',
    treatmentId: 'trt-6',
    treatmentName: 'Korean Glass Skin DNA Salmon',
    treatmentPrice: 1850000,
    additionalProducts: [
      {
        productId: 'prd-1',
        productName: 'GlowCare Barrier Repair Ceramide Cream',
        quantity: 1,
        price: 185000
      },
      {
        productId: 'prd-3',
        productName: 'GlowCare Ultra Invisible Sunscreen SPF 50+',
        quantity: 1,
        price: 165000
      }
    ],
    subtotal: 2200000,
    discount: 100000,
    tax: 0,
    totalAmount: 2100000,
    paymentMethod: 'QRIS',
    status: 'Lunas',
    paidAt: '2026-09-25 15:40:00',
    cashierName: 'Rina Kusuma Dewi',
    notes: 'Member VIP promo potongan Rp100.000'
  },
  {
    id: 'pay-2',
    invoiceNumber: 'INV/GC/2026/09/0081',
    patientId: 'pat-2',
    patientName: 'Dian Permatasari',
    patientRm: 'RM-2026-0102',
    treatmentId: 'trt-4',
    treatmentName: 'Brightening Laser Rejuvenation',
    treatmentPrice: 1250000,
    subtotal: 1250000,
    discount: 50000,
    tax: 0,
    totalAmount: 1200000,
    paymentMethod: 'Debit',
    status: 'Lunas',
    paidAt: '2026-09-24 17:15:00',
    cashierName: 'Rina Kusuma Dewi'
  },
  {
    id: 'pay-3',
    invoiceNumber: 'INV/GC/2026/09/0082',
    patientId: 'pat-3',
    patientName: 'Nadia Anggraini',
    patientRm: 'RM-2026-0103',
    treatmentId: 'trt-3',
    treatmentName: 'Hydrafacial Deep Infusion',
    treatmentPrice: 650000,
    subtotal: 650000,
    discount: 0,
    tax: 0,
    totalAmount: 650000,
    paymentMethod: 'Transfer',
    status: 'Belum Dibayar',
    cashierName: 'Rina Kusuma Dewi'
  }
];

export const INITIAL_PAYMENT_CHANNELS: PaymentChannel[] = [
  {
    id: 'ch-qris',
    name: 'QRIS GlowCare (BCA & All E-Wallet)',
    type: 'QRIS',
    provider: 'BCA QRIS Dinamis & Statis',
    accountNumber: 'NMID: ID1020268892182',
    accountHolder: 'Klinik Estetika GlowCare',
    instructions: 'Scan barcode QRIS kasir melalui GoPay, OVO, ShopeePay, BCA Mobile, atau DANA.',
    isActive: true
  },
  {
    id: 'ch-cash',
    name: 'Tunai Kasir (Cash)',
    type: 'Cash',
    provider: 'Kasir Front Office',
    accountNumber: '-',
    accountHolder: 'Kasir Klinik GlowCare',
    instructions: 'Pembayaran tunai langsung di meja kasir. Periksa keaslian uang kertas dan serahkan kembalian.',
    isActive: true
  },
  {
    id: 'ch-debit-bca',
    name: 'Debit / Kredit Mesin EDC',
    type: 'Debit',
    provider: 'EDC BCA & Mandiri',
    accountNumber: 'Terminal ID: EDC-GC-01',
    accountHolder: 'Klinik GlowCare',
    instructions: 'Gesek atau masukkan chip kartu debit/kredit nasabah pada mesin EDC di kasir.',
    isActive: true
  },
  {
    id: 'ch-transfer-bca',
    name: 'Transfer Bank BCA',
    type: 'Transfer',
    provider: 'Bank Central Asia (BCA)',
    accountNumber: '8720-192-831',
    accountHolder: 'Klinik GlowCare Utama PT',
    instructions: 'Transfer antar rekening via BCA Mobile / ATM. Lampirkan bukti mutasi ke sistem.',
    isActive: true
  },
  {
    id: 'ch-transfer-mandiri',
    name: 'Transfer Bank Mandiri',
    type: 'Transfer',
    provider: 'Bank Mandiri',
    accountNumber: '137-00-1928392-1',
    accountHolder: 'Klinik GlowCare Utama PT',
    instructions: 'Transfer via aplikasi Livin by Mandiri atau ATM ke rekening giro klinik.',
    isActive: true
  }
];

export const INITIAL_RATINGS: PatientRatingComment[] = [
  {
    id: 'rat-1',
    patientName: 'Clara M******',
    patientRm: 'RM-2026-0105',
    treatmentName: 'Korean Glass Skin DNA Salmon',
    doctorName: 'dr. Citra Lestari, Sp.KK, M.Biomed',
    overallRating: 5,
    aspectRatings: {
      treatmentQuality: 5,
      doctorCare: 5,
      nurseService: 5,
      receptionistFriendliness: 5,
      clinicCleanliness: 5,
      roomComfort: 5,
      serviceSpeed: 4
    },
    comment: 'Pelayanannya sangat ramah dan treatment dilakukan dengan begitu teliti. dr. Citra sangat informatif menjelaskan kondisi skin barrier saya. Ruangannya juga sangat estetik, tenang, dan wangi bunga rose lembut!',
    date: '2026-09-25 16:10',
    status: 'Ditampilkan',
    clinicResponse: 'Terima kasih banyak Ibu Clara atas ulasan hangatnya. Senang sekali kulit Ibu merasakan hasil maksimal dari treatment DNA Salmon kami.'
  },
  {
    id: 'rat-2',
    patientName: 'Dian P*********',
    patientRm: 'RM-2026-0102',
    treatmentName: 'Brightening Laser Rejuvenation',
    doctorName: 'dr. Citra Lestari, Sp.KK, M.Biomed',
    overallRating: 5,
    aspectRatings: {
      treatmentQuality: 5,
      doctorCare: 5,
      nurseService: 5,
      receptionistFriendliness: 5,
      clinicCleanliness: 5,
      roomComfort: 5,
      serviceSpeed: 5
    },
    comment: 'Hasil laser sesi ke-2 sudah mulai terlihat, flek hitam bekas matahari di pipi memudar signifikan. Tidak ada rasa sakit karena anestesi krimnya bekerja dengan baik.',
    date: '2026-09-24 17:35',
    status: 'Ditampilkan'
  },
  {
    id: 'rat-3',
    patientName: 'Siti R********',
    patientRm: 'RM-2026-0101',
    treatmentName: 'Acne Purifying Treatment',
    doctorName: 'dr. Andini Putri, Sp.DV',
    overallRating: 4,
    aspectRatings: {
      treatmentQuality: 5,
      doctorCare: 5,
      nurseService: 4,
      receptionistFriendliness: 4,
      clinicCleanliness: 5,
      roomComfort: 4,
      serviceSpeed: 3
    },
    comment: 'Jerawat batu yang meradang langsung kempes dalam 2 hari pasca ekstraksi dan masker PDT! Sedikit masukan di waktu tunggu antrian saat jam makan siang agak padat, tapi hasilnya sebanding.',
    date: '2026-09-21 11:45',
    status: 'Ditindaklanjuti',
    flaggedForFollowUp: true,
    adminNotes: 'Manajer FO telah mengoptimalkan alokasi perawat asisten di jam 12:00 - 13:30 agar antrian lebih cepat mengalir.'
  },
  {
    id: 'rat-4',
    patientName: 'Reza P******',
    patientRm: 'RM-2026-0104',
    treatmentName: 'Basic Facial Glow',
    doctorName: 'dr. Farhan Hidayat, M.Kes, AAM',
    overallRating: 5,
    aspectRatings: {
      treatmentQuality: 5,
      doctorCare: 5,
      nurseService: 5,
      receptionistFriendliness: 5,
      clinicCleanliness: 5,
      roomComfort: 5,
      serviceSpeed: 5
    },
    comment: 'Sebagai pria awalnya agak canggung ke klinik kecantikan, tapi staf GlowCare sangat profesional dan welcome. Wajah langsung segar dan bersih tuntas dari komedo.',
    date: '2026-09-18 19:20',
    status: 'Ditampilkan'
  },
  {
    id: 'rat-5',
    patientName: 'Aisyah P****',
    patientRm: 'RM-2026-0106',
    treatmentName: 'Chemical Peeling Glow AHA/BHA',
    doctorName: 'dr. Andini Putri, Sp.DV',
    overallRating: 5,
    aspectRatings: {
      treatmentQuality: 5,
      doctorCare: 5,
      nurseService: 5,
      receptionistFriendliness: 5,
      clinicCleanliness: 5,
      roomComfort: 5,
      serviceSpeed: 5
    },
    comment: 'Peelingnya tidak perih sama sekali, rasanya mint dingin menyegarkan. Kulit jadi halus dan glowing natural tanpa efek mengelupas berlebih.',
    date: '2026-09-23 15:00',
    status: 'Ditampilkan'
  },
  {
    id: 'rat-6',
    patientName: 'Maya S******',
    patientRm: 'RM-2026-0106',
    treatmentName: 'Hair Growth Laser Stimulation',
    doctorName: 'dr. Celine Maharani. Sp',
    overallRating: 5,
    aspectRatings: {
      treatmentQuality: 5,
      doctorCare: 5,
      nurseService: 5,
      receptionistFriendliness: 5,
      clinicCleanliness: 5,
      roomComfort: 5,
      serviceSpeed: 5
    },
    comment: 'Konsultasi masalah rambut rontok sangat jelas dan solutif bersama dr. Celine. Terapi laser kepalanya nyaman dan hasilnya kerontokan berkurang signifikan.',
    date: '2026-09-24 14:15',
    status: 'Ditampilkan'
  }
];

export const INITIAL_NOTIFICATIONS: ClinicNotification[] = [
  {
    id: 'notif-1',
    title: '🔔 Appointment Baru Telah Dibuat',
    message: 'Pasien Aisyah Putri Zahrani menjadwalkan Chemical Peeling pada 27 September 2026 pukul 13:00.',
    type: 'appointment',
    timestamp: '10 menit yang lalu',
    isRead: false,
    linkMenu: 'appointment'
  },
  {
    id: 'notif-2',
    title: '🔔 Pasien Sudah Tiba di Klinik',
    message: 'Pasien Dian Permatasari (A003) telah tiba di ruang tunggu Loket 2.',
    type: 'queue',
    timestamp: '25 menit yang lalu',
    isRead: false,
    linkMenu: 'antrian'
  },
  {
    id: 'notif-3',
    title: '🔔 Ada Pasien yang Sedang Menunggu',
    message: '3 pasien berada dalam antrian tunggu konsultasi dr. Citra Lestari, Sp.KK.',
    type: 'queue',
    timestamp: '40 menit yang lalu',
    isRead: false,
    linkMenu: 'antrian'
  },
  {
    id: 'notif-4',
    title: '🔔 Treatment Telah Selesai',
    message: 'dr. Andini Putri telah menyelesaikan treatment Hydrafacial untuk Nadia Anggraini. Menunggu kasir.',
    type: 'treatment',
    timestamp: '1 jam yang lalu',
    isRead: true,
    linkMenu: 'pembayaran'
  },
  {
    id: 'notif-5',
    title: '🔔 Ada Komentar & Rating Baru',
    message: 'Clara Michelle memberikan rating 5 bintang untuk treatment Korean Glass Skin DNA Salmon.',
    type: 'review',
    timestamp: '2 jam yang lalu',
    isRead: true,
    linkMenu: 'komentar'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-26 09:40:12',
    userName: 'dr. Andini Putri, Sp.DV',
    userRole: 'dokter',
    action: 'Memanggil Antrian Pasien',
    target: 'Antrian A002 (Siti Rahmawati - RM-2026-0101)',
    ipAddress: '192.168.1.104'
  },
  {
    id: 'log-2',
    timestamp: '2026-09-26 09:25:00',
    userName: 'dr. Andini Putri, Sp.DV',
    userRole: 'dokter',
    action: 'Mulai Pemeriksaan & Treatment',
    target: 'Hydrafacial Deep Infusion - Nadia Anggraini',
    ipAddress: '192.168.1.104'
  },
  {
    id: 'log-3',
    timestamp: '2026-09-26 09:20:15',
    userName: 'Rina Kusuma Dewi',
    userRole: 'loket',
    action: 'Pendaftaran Pasien & Cetak Antrian',
    target: 'Registrasi REG-20260926-003 (A003)',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'log-4',
    timestamp: '2026-09-26 09:05:40',
    userName: 'Rina Kusuma Dewi',
    userRole: 'loket',
    action: 'Pendaftaran Pasien Baru',
    target: 'Siti Rahmawati (RM-2026-0101)',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'log-5',
    timestamp: '2026-09-26 08:30:11',
    userName: 'Nur Ushwatun Hasanah',
    userRole: 'admin',
    action: 'Moderasi Komentar Pasien',
    target: 'Menyetujui ulasan bintang 5 Clara Michelle',
    ipAddress: '192.168.1.101'
  }
];

export const INITIAL_SETTINGS: ClinicSettings = {
  name: 'GlowCare Beauty Clinic',
  slogan: 'Your Beauty, Our Care',
  address: 'Jl. Senopati Raya No. 45, Kebayoran Baru, Jakarta Selatan 12190',
  phone: '(021) 7280-9988 / 0812-9988-7700',
  email: 'care@glowcareclinic.id',
  instagram: '@glowcare.beautyclinic',
  operatingHours: 'Senin - Minggu: 09:00 - 20:00 WIB',
  consultationFee: 150000,
  taxPercentage: 0,
  receiptHeaderNote: 'Terima kasih telah mempercayakan perawatan kecantikan Anda di GlowCare Beauty Clinic.',
  receiptFooterNote: 'Barang dan produk skincare yang sudah dibeli tidak dapat ditukar atau dikembalikan kecuali cacat pabrik dalam 2x24 jam.'
};
