import { neon } from '@neondatabase/serverless';
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
  ClinicSettings,
  NeonConfig
} from '../types';

const STORAGE_KEY = 'glowcare_neon_config';

export const USER_PROVIDED_NEON_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NEON_DATABASE_URL) ||
  'postgresql://neondb_owner:npg_hvIlUcxKgA16@ep-crimson-wave-b40harui-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const DEFAULT_NEON_CONFIG: NeonConfig = {
  connectionString: USER_PROVIDED_NEON_URL,
  isConnected: true,
  autoSync: true,
  lastSyncTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  databaseName: 'neondb',
  pgVersion: 'PostgreSQL 18.6 (Neon Serverless)',
  latencyMs: 128
};

export function getStoredNeonConfig(): NeonConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_NEON_CONFIG,
        ...parsed,
        connectionString: parsed.connectionString || USER_PROVIDED_NEON_URL
      };
    }
  } catch (e) {
    console.error('Failed to read neon config from localStorage', e);
  }
  return DEFAULT_NEON_CONFIG;
}

export function saveStoredNeonConfig(config: NeonConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save neon config to localStorage', e);
  }
}

/**
 * Clean and validate connection string
 */
export function sanitizeConnectionString(connStr: string): string {
  let clean = connStr.trim();
  // Remove wrapping quotes if pasted with quotes
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1).trim();
  }
  return clean;
}

/**
 * Test connectivity with Neon Postgres over HTTP
 */
export async function testNeonConnection(connectionString: string): Promise<{
  success: boolean;
  message: string;
  latencyMs?: number;
  pgVersion?: string;
  databaseName?: string;
  user?: string;
}> {
  const cleanConn = sanitizeConnectionString(connectionString);
  if (!cleanConn) {
    return { success: false, message: 'Connection string Neon tidak boleh kosong.' };
  }

  if (!cleanConn.startsWith('postgres://') && !cleanConn.startsWith('postgresql://')) {
    return {
      success: false,
      message: 'Format connection string harus diawali dengan postgresql:// atau postgres:// (contoh dari neondb.com)'
    };
  }

  const startTime = performance.now();
  try {
    const sql = neon(cleanConn);
    const result = await sql`
      SELECT 
        NOW() as current_time, 
        version() as pg_version, 
        current_database() as db_name, 
        current_user as db_user;
    `;
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    if (result && result.length > 0) {
      const row = result[0];
      const versionStr = String(row.pg_version || '').split(' ')[0] + ' ' + (String(row.pg_version || '').split(' ')[1] || '');
      return {
        success: true,
        message: `Terhubung dengan sukses ke Neon PostgreSQL! (Ping: ${latencyMs}ms)`,
        latencyMs,
        pgVersion: versionStr || 'PostgreSQL (Neon)',
        databaseName: String(row.db_name || 'neondb'),
        user: String(row.db_user || '')
      };
    }
    return { success: true, message: 'Terhubung ke database Neon.', latencyMs };
  } catch (error: any) {
    console.error('Neon connection test error:', error);
    let msg = error?.message || 'Gagal terhubung ke database Neon.';
    if (msg.includes('password authentication failed')) {
      msg = 'Autentikasi gagal: Kata sandi atau pengguna database salah.';
    } else if (msg.includes('getaddrinfo') || msg.includes('ENOTFOUND')) {
      msg = 'Host database Neon tidak ditemukan. Periksa kembali endpoint domain connection string.';
    }
    return {
      success: false,
      message: msg
    };
  }
}

/**
 * Returns PostgreSQL DDL SQL script specifically formatted for Neon
 */
export function getNeonSchemaSQL(): string {
  return `-- ========================================================
-- GlowCare Beauty Clinic - PostgreSQL Schema for Neon (neondb.com)
-- ========================================================

-- 1. Metadata Sync
CREATE TABLE IF NOT EXISTS neon_sync_meta (
    id VARCHAR(50) PRIMARY KEY,
    last_synced_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    sync_source VARCHAR(100) DEFAULT 'GlowCare Web App'
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'loket',
    phone VARCHAR(50),
    department VARCHAR(100),
    avatar TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at VARCHAR(50),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(50) PRIMARY KEY,
    rm_number VARCHAR(50) NOT NULL UNIQUE,
    nik VARCHAR(30) NOT NULL,
    name VARCHAR(150) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    birth_date VARCHAR(20) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    address TEXT,
    blood_type VARCHAR(10),
    allergies TEXT,
    special_notes TEXT,
    total_visits INT DEFAULT 1,
    last_visit VARCHAR(20),
    created_at VARCHAR(50),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    specialization VARCHAR(150) NOT NULL,
    sip_number VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    avatar TEXT,
    rating NUMERIC(3,2) DEFAULT 4.90,
    total_patients INT DEFAULT 0,
    schedule_days TEXT NOT NULL,
    schedule_hours VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Nurses Table
CREATE TABLE IF NOT EXISTS nurses (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    str_number VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    shift VARCHAR(50) NOT NULL,
    assigned_doctor VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Treatments Table
CREATE TABLE IF NOT EXISTS treatments (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    price BIGINT NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    handled_by VARCHAR(50) NOT NULL DEFAULT 'Dokter & Perawat',
    popular_badge BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price BIGINT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    unit VARCHAR(30) NOT NULL DEFAULT 'Pcs',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Queues Table
CREATE TABLE IF NOT EXISTS queues (
    id VARCHAR(50) PRIMARY KEY,
    queue_number VARCHAR(20) NOT NULL,
    registration_id VARCHAR(50),
    patient_id VARCHAR(50) NOT NULL,
    patient_name VARCHAR(150) NOT NULL,
    patient_rm VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50),
    doctor_name VARCHAR(150) NOT NULL,
    treatment_id VARCHAR(50),
    treatment_name VARCHAR(150) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Menunggu',
    date VARCHAR(20) NOT NULL,
    time VARCHAR(20) NOT NULL,
    counter_room VARCHAR(100) NOT NULL,
    estimated_wait_minutes INT DEFAULT 15,
    called_at VARCHAR(50),
    completed_at VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    patient_name VARCHAR(150) NOT NULL,
    patient_phone VARCHAR(50),
    doctor_id VARCHAR(50),
    doctor_name VARCHAR(150) NOT NULL,
    treatment_id VARCHAR(50),
    treatment_name VARCHAR(150) NOT NULL,
    date VARCHAR(20) NOT NULL,
    time VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Terkonfirmasi',
    notes TEXT,
    created_at VARCHAR(50)
);

-- 10. Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
    id VARCHAR(50) PRIMARY KEY,
    reg_number VARCHAR(50) NOT NULL,
    patient_id VARCHAR(50) NOT NULL,
    patient_name VARCHAR(150) NOT NULL,
    patient_rm VARCHAR(50) NOT NULL,
    doctor_name VARCHAR(150) NOT NULL,
    treatment_name VARCHAR(150) NOT NULL,
    visit_type VARCHAR(50) NOT NULL,
    queue_number VARCHAR(20) NOT NULL,
    created_at VARCHAR(50),
    status VARCHAR(30) NOT NULL
);

-- 11. Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    patient_name VARCHAR(150) NOT NULL,
    patient_rm VARCHAR(50) NOT NULL,
    doctor_name VARCHAR(150) NOT NULL,
    treatment_name VARCHAR(150) NOT NULL,
    date VARCHAR(20) NOT NULL,
    complaints TEXT NOT NULL,
    skin_condition TEXT NOT NULL,
    exam_result TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    products_used TEXT,
    doctor_notes TEXT,
    follow_up_advice TEXT NOT NULL,
    next_control_date VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    patient_id VARCHAR(50),
    patient_name VARCHAR(150) NOT NULL,
    patient_rm VARCHAR(50) NOT NULL,
    treatment_name VARCHAR(150) NOT NULL,
    treatment_price BIGINT NOT NULL,
    subtotal BIGINT NOT NULL,
    discount BIGINT DEFAULT 0,
    total_amount BIGINT NOT NULL,
    payment_method VARCHAR(50),
    payment_channel_name VARCHAR(100),
    reference_number VARCHAR(100),
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'Belum Dibayar',
    paid_at VARCHAR(50),
    cashier_name VARCHAR(100),
    created_at VARCHAR(50)
);

-- 13. Payment Channels Table
CREATE TABLE IF NOT EXISTS payment_channels (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    account_number VARCHAR(100),
    account_holder VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    fee BIGINT DEFAULT 0,
    icon_name VARCHAR(50)
);

-- 14. Ratings Table
CREATE TABLE IF NOT EXISTS ratings (
    id VARCHAR(50) PRIMARY KEY,
    patient_name VARCHAR(150) NOT NULL,
    treatment_name VARCHAR(150) NOT NULL,
    doctor_name VARCHAR(150) NOT NULL,
    overall_rating INT NOT NULL CHECK(overall_rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    date VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'Ditampilkan',
    clinic_response TEXT,
    admin_notes TEXT
);

-- 15. Clinic Settings Table
CREATE TABLE IF NOT EXISTS clinic_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`;
}

/**
 * Execute schema initialization directly on Neon Postgres
 */
export async function initializeNeonSchema(connectionString: string): Promise<{
  success: boolean;
  message: string;
}> {
  const cleanConn = sanitizeConnectionString(connectionString);
  try {
    const sql = neon(cleanConn);

    // Run table creations in sequence or individual statements
    await sql`
      CREATE TABLE IF NOT EXISTS neon_sync_meta (
        id VARCHAR(50) PRIMARY KEY,
        last_synced_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        sync_source VARCHAR(100) DEFAULT 'GlowCare Web App'
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255),
        role VARCHAR(20) NOT NULL DEFAULT 'loket',
        phone VARCHAR(50),
        department VARCHAR(100),
        avatar TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at VARCHAR(50),
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR(50) PRIMARY KEY,
        rm_number VARCHAR(50) NOT NULL UNIQUE,
        nik VARCHAR(30) NOT NULL,
        name VARCHAR(150) NOT NULL,
        gender VARCHAR(20) NOT NULL,
        birth_date VARCHAR(20) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(150),
        address TEXT,
        blood_type VARCHAR(10),
        allergies TEXT,
        special_notes TEXT,
        total_visits INT DEFAULT 1,
        last_visit VARCHAR(20),
        created_at VARCHAR(50),
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS doctors (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        specialization VARCHAR(150) NOT NULL,
        sip_number VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(150) NOT NULL,
        avatar TEXT,
        rating NUMERIC(3,2) DEFAULT 4.90,
        total_patients INT DEFAULT 0,
        schedule_days TEXT NOT NULL,
        schedule_hours VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS nurses (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        str_number VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        shift VARCHAR(50) NOT NULL,
        assigned_doctor VARCHAR(150) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS treatments (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        price BIGINT NOT NULL,
        duration_minutes INT NOT NULL DEFAULT 60,
        handled_by VARCHAR(50) NOT NULL DEFAULT 'Dokter & Perawat',
        popular_badge BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price BIGINT NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        unit VARCHAR(30) NOT NULL DEFAULT 'Pcs',
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS queues (
        id VARCHAR(50) PRIMARY KEY,
        queue_number VARCHAR(20) NOT NULL,
        registration_id VARCHAR(50),
        patient_id VARCHAR(50) NOT NULL,
        patient_name VARCHAR(150) NOT NULL,
        patient_rm VARCHAR(50) NOT NULL,
        doctor_id VARCHAR(50),
        doctor_name VARCHAR(150) NOT NULL,
        treatment_id VARCHAR(50),
        treatment_name VARCHAR(150) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'Menunggu',
        date VARCHAR(20) NOT NULL,
        time VARCHAR(20) NOT NULL,
        counter_room VARCHAR(100) NOT NULL,
        estimated_wait_minutes INT DEFAULT 15,
        called_at VARCHAR(50),
        completed_at VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(50) PRIMARY KEY,
        patient_id VARCHAR(50) NOT NULL,
        patient_name VARCHAR(150) NOT NULL,
        patient_phone VARCHAR(50),
        doctor_id VARCHAR(50),
        doctor_name VARCHAR(150) NOT NULL,
        treatment_id VARCHAR(50),
        treatment_name VARCHAR(150) NOT NULL,
        date VARCHAR(20) NOT NULL,
        time VARCHAR(20) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'Terkonfirmasi',
        notes TEXT,
        created_at VARCHAR(50)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id VARCHAR(50) PRIMARY KEY,
        reg_number VARCHAR(50) NOT NULL,
        patient_id VARCHAR(50) NOT NULL,
        patient_name VARCHAR(150) NOT NULL,
        patient_rm VARCHAR(50) NOT NULL,
        doctor_name VARCHAR(150) NOT NULL,
        treatment_name VARCHAR(150) NOT NULL,
        visit_type VARCHAR(50) NOT NULL,
        queue_number VARCHAR(20) NOT NULL,
        created_at VARCHAR(50),
        status VARCHAR(30) NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS medical_records (
        id VARCHAR(50) PRIMARY KEY,
        patient_id VARCHAR(50) NOT NULL,
        patient_name VARCHAR(150) NOT NULL,
        patient_rm VARCHAR(50) NOT NULL,
        doctor_name VARCHAR(150) NOT NULL,
        treatment_name VARCHAR(150) NOT NULL,
        date VARCHAR(20) NOT NULL,
        complaints TEXT NOT NULL,
        skin_condition TEXT NOT NULL,
        exam_result TEXT NOT NULL,
        action_taken TEXT NOT NULL,
        products_used TEXT,
        doctor_notes TEXT,
        follow_up_advice TEXT NOT NULL,
        next_control_date VARCHAR(20),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(50) PRIMARY KEY,
        invoice_number VARCHAR(100) NOT NULL UNIQUE,
        patient_id VARCHAR(50),
        patient_name VARCHAR(150) NOT NULL,
        patient_rm VARCHAR(50) NOT NULL,
        treatment_name VARCHAR(150) NOT NULL,
        treatment_price BIGINT NOT NULL,
        subtotal BIGINT NOT NULL,
        discount BIGINT DEFAULT 0,
        total_amount BIGINT NOT NULL,
        payment_method VARCHAR(50),
        payment_channel_name VARCHAR(100),
        reference_number VARCHAR(100),
        notes TEXT,
        status VARCHAR(30) NOT NULL DEFAULT 'Belum Dibayar',
        paid_at VARCHAR(50),
        cashier_name VARCHAR(100),
        created_at VARCHAR(50)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS payment_channels (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        account_number VARCHAR(100),
        account_holder VARCHAR(150),
        is_active BOOLEAN DEFAULT TRUE,
        fee BIGINT DEFAULT 0,
        icon_name VARCHAR(50)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS ratings (
        id VARCHAR(50) PRIMARY KEY,
        patient_name VARCHAR(150) NOT NULL,
        treatment_name VARCHAR(150) NOT NULL,
        doctor_name VARCHAR(150) NOT NULL,
        overall_rating INT NOT NULL CHECK(overall_rating BETWEEN 1 AND 5),
        comment TEXT NOT NULL,
        date VARCHAR(50),
        status VARCHAR(30) NOT NULL DEFAULT 'Ditampilkan',
        clinic_response TEXT,
        admin_notes TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS clinic_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Record initialization in meta
    await sql`
      INSERT INTO neon_sync_meta (id, last_synced_at, sync_source)
      VALUES ('initial_setup', NOW(), 'GlowCare Clinic Schema Migration')
      ON CONFLICT (id) DO UPDATE SET last_synced_at = NOW();
    `;

    return {
      success: true,
      message: 'Semua tabel PostgreSQL (15 tabel) berhasil dibuat di Neon Database!'
    };
  } catch (err: any) {
    console.error('Error initializing Neon schema:', err);
    return {
      success: false,
      message: `Gagal menginisialisasi tabel Neon: ${err.message || String(err)}`
    };
  }
}

export interface AppSyncDataPayload {
  users: User[];
  patients: Patient[];
  doctors: Doctor[];
  nurses: Nurse[];
  treatments: Treatment[];
  products: Product[];
  queues: QueueItem[];
  appointments: Appointment[];
  registrations: Registration[];
  medicalRecords: MedicalRecord[];
  payments: Payment[];
  paymentChannels: PaymentChannel[];
  ratings: PatientRatingComment[];
  settings: ClinicSettings;
}

/**
 * Push all local data into Neon PostgreSQL database
 */
export async function pushAllDataToNeon(
  connectionString: string,
  payload: AppSyncDataPayload
): Promise<{
  success: boolean;
  message: string;
  stats?: { [key: string]: number };
}> {
  const cleanConn = sanitizeConnectionString(connectionString);
  try {
    const sql = neon(cleanConn);

    // First ensure schema exists
    await initializeNeonSchema(cleanConn);

    // Upsert Patients
    let patientCount = 0;
    for (const p of payload.patients) {
      await sql`
        INSERT INTO patients (
          id, rm_number, nik, name, gender, birth_date, phone, email,
          address, blood_type, allergies, special_notes, total_visits, last_visit, created_at
        ) VALUES (
          ${p.id}, ${p.rmNumber}, ${p.nik}, ${p.name}, ${p.gender}, ${p.birthDate}, ${p.phone}, ${p.email || null},
          ${p.address || null}, ${p.bloodType || null}, ${p.allergies || ''}, ${p.specialNotes || ''},
          ${p.totalVisits || 1}, ${p.lastVisit || null}, ${p.createdAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          rm_number = EXCLUDED.rm_number,
          nik = EXCLUDED.nik,
          name = EXCLUDED.name,
          gender = EXCLUDED.gender,
          birth_date = EXCLUDED.birth_date,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          address = EXCLUDED.address,
          blood_type = EXCLUDED.blood_type,
          allergies = EXCLUDED.allergies,
          special_notes = EXCLUDED.special_notes,
          total_visits = EXCLUDED.total_visits,
          last_visit = EXCLUDED.last_visit;
      `;
      patientCount++;
    }

    // Upsert Doctors
    let doctorCount = 0;
    for (const d of payload.doctors) {
      const scheduleDays = Array.isArray(d.schedule?.days) ? d.schedule.days.join(', ') : '';
      const scheduleHours = d.schedule?.hours || '';
      await sql`
        INSERT INTO doctors (
          id, name, specialization, sip_number, phone, email, avatar, rating, total_patients, schedule_days, schedule_hours, is_active
        ) VALUES (
          ${d.id}, ${d.name}, ${d.specialization}, ${d.sipNumber}, ${d.phone}, ${d.email},
          ${d.avatar || null}, ${d.rating || 4.9}, ${d.totalPatients || 0}, ${scheduleDays}, ${scheduleHours}, ${d.isActive}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          specialization = EXCLUDED.specialization,
          sip_number = EXCLUDED.sip_number,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          avatar = EXCLUDED.avatar,
          rating = EXCLUDED.rating,
          total_patients = EXCLUDED.total_patients,
          schedule_days = EXCLUDED.schedule_days,
          schedule_hours = EXCLUDED.schedule_hours,
          is_active = EXCLUDED.is_active;
      `;
      doctorCount++;
    }

    // Upsert Nurses
    let nurseCount = 0;
    for (const n of payload.nurses) {
      await sql`
        INSERT INTO nurses (
          id, name, str_number, phone, shift, assigned_doctor, is_active
        ) VALUES (
          ${n.id}, ${n.name}, ${n.strNumber}, ${n.phone}, ${n.shift}, ${n.assignedDoctor}, ${n.isActive}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          str_number = EXCLUDED.str_number,
          phone = EXCLUDED.phone,
          shift = EXCLUDED.shift,
          assigned_doctor = EXCLUDED.assigned_doctor,
          is_active = EXCLUDED.is_active;
      `;
      nurseCount++;
    }

    // Upsert Treatments
    let treatmentCount = 0;
    for (const t of payload.treatments) {
      await sql`
        INSERT INTO treatments (
          id, code, name, category, description, price, duration_minutes, handled_by, popular_badge, is_active
        ) VALUES (
          ${t.id}, ${t.code}, ${t.name}, ${t.category}, ${t.description || ''}, ${t.price},
          ${t.durationMinutes || 60}, ${t.handledBy}, ${Boolean(t.popularBadge)}, ${t.isActive}
        )
        ON CONFLICT (id) DO UPDATE SET
          code = EXCLUDED.code,
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          duration_minutes = EXCLUDED.duration_minutes,
          handled_by = EXCLUDED.handled_by,
          popular_badge = EXCLUDED.popular_badge,
          is_active = EXCLUDED.is_active;
      `;
      treatmentCount++;
    }

    // Upsert Products
    let productCount = 0;
    for (const pr of payload.products) {
      await sql`
        INSERT INTO products (
          id, code, name, category, price, stock, unit, description, is_active
        ) VALUES (
          ${pr.id}, ${pr.code}, ${pr.name}, ${pr.category}, ${pr.price}, ${pr.stock},
          ${pr.unit || 'Pcs'}, ${pr.description || ''}, ${pr.isActive}
        )
        ON CONFLICT (id) DO UPDATE SET
          code = EXCLUDED.code,
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          price = EXCLUDED.price,
          stock = EXCLUDED.stock,
          unit = EXCLUDED.unit,
          description = EXCLUDED.description,
          is_active = EXCLUDED.is_active;
      `;
      productCount++;
    }

    // Upsert Queues
    let queueCount = 0;
    for (const q of payload.queues) {
      await sql`
        INSERT INTO queues (
          id, queue_number, registration_id, patient_id, patient_name, patient_rm, doctor_id, doctor_name,
          treatment_id, treatment_name, status, date, time, counter_room, estimated_wait_minutes, called_at, completed_at
        ) VALUES (
          ${q.id}, ${q.queueNumber}, ${q.registrationId || null}, ${q.patientId}, ${q.patientName}, ${q.patientRm},
          ${q.doctorId || null}, ${q.doctorName}, ${q.treatmentId || null}, ${q.treatmentName}, ${q.status},
          ${q.date}, ${q.time}, ${q.counterRoom}, 15, ${q.calledAt || null}, ${q.completedAt || null}
        )
        ON CONFLICT (id) DO UPDATE SET
          queue_number = EXCLUDED.queue_number,
          patient_name = EXCLUDED.patient_name,
          doctor_name = EXCLUDED.doctor_name,
          treatment_name = EXCLUDED.treatment_name,
          status = EXCLUDED.status,
          date = EXCLUDED.date,
          time = EXCLUDED.time,
          counter_room = EXCLUDED.counter_room,
          called_at = EXCLUDED.called_at,
          completed_at = EXCLUDED.completed_at;
      `;
      queueCount++;
    }

    // Upsert Medical Records
    let recordCount = 0;
    for (const mr of payload.medicalRecords) {
      await sql`
        INSERT INTO medical_records (
          id, patient_id, patient_name, patient_rm, doctor_name, treatment_name, date,
          complaints, skin_condition, exam_result, action_taken, products_used, doctor_notes,
          follow_up_advice, next_control_date
        ) VALUES (
          ${mr.id}, ${mr.patientId}, ${mr.patientName}, ${mr.patientRm}, ${mr.doctorName}, ${mr.treatmentName},
          ${mr.date}, ${mr.complaints}, ${mr.skinCondition}, ${mr.examResult}, ${mr.actionTaken},
          ${mr.productsUsed || null}, ${mr.doctorNotes || null}, ${mr.followUpAdvice}, ${mr.nextControlDate || null}
        )
        ON CONFLICT (id) DO UPDATE SET
          doctor_name = EXCLUDED.doctor_name,
          treatment_name = EXCLUDED.treatment_name,
          complaints = EXCLUDED.complaints,
          skin_condition = EXCLUDED.skin_condition,
          exam_result = EXCLUDED.exam_result,
          action_taken = EXCLUDED.action_taken,
          products_used = EXCLUDED.products_used,
          doctor_notes = EXCLUDED.doctor_notes,
          follow_up_advice = EXCLUDED.follow_up_advice,
          next_control_date = EXCLUDED.next_control_date;
      `;
      recordCount++;
    }

    // Upsert Payments
    let paymentCount = 0;
    for (const py of payload.payments) {
      await sql`
        INSERT INTO payments (
          id, invoice_number, patient_id, patient_name, patient_rm, treatment_name,
          treatment_price, subtotal, discount, total_amount, payment_method,
          payment_channel_name, reference_number, notes, status, paid_at, cashier_name, created_at
        ) VALUES (
          ${py.id}, ${py.invoiceNumber}, ${py.patientId || null}, ${py.patientName}, ${py.patientRm}, ${py.treatmentName},
          ${py.treatmentPrice}, ${py.subtotal}, ${py.discount || 0}, ${py.totalAmount}, ${py.paymentMethod || null},
          ${py.paymentChannelName || null}, ${py.referenceNumber || null}, ${py.notes || null}, ${py.status},
          ${py.paidAt || null}, ${py.cashierName || null}, ${py.createdAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          invoice_number = EXCLUDED.invoice_number,
          treatment_name = EXCLUDED.treatment_name,
          subtotal = EXCLUDED.subtotal,
          discount = EXCLUDED.discount,
          total_amount = EXCLUDED.total_amount,
          payment_method = EXCLUDED.payment_method,
          payment_channel_name = EXCLUDED.payment_channel_name,
          status = EXCLUDED.status,
          paid_at = EXCLUDED.paid_at,
          cashier_name = EXCLUDED.cashier_name;
      `;
      paymentCount++;
    }

    // Upsert Settings
    await sql`
      INSERT INTO clinic_settings (setting_key, setting_value, updated_at)
      VALUES ('clinic_profile', ${JSON.stringify(payload.settings)}, NOW())
      ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW();
    `;

    // Update sync timestamp in metadata
    await sql`
      INSERT INTO neon_sync_meta (id, last_synced_at, sync_source)
      VALUES ('last_sync', NOW(), 'Manual / Push Sync')
      ON CONFLICT (id) DO UPDATE SET last_synced_at = NOW();
    `;

    return {
      success: true,
      message: `Berhasil sinkronisasi seluruh data ke Neon Database (${patientCount} Pasien, ${doctorCount} Dokter, ${queueCount} Antrian, ${recordCount} Rekam Medis, ${paymentCount} Pembayaran).`,
      stats: {
        patients: patientCount,
        doctors: doctorCount,
        nurses: nurseCount,
        treatments: treatmentCount,
        products: productCount,
        queues: queueCount,
        medicalRecords: recordCount,
        payments: paymentCount
      }
    };
  } catch (err: any) {
    console.error('Error pushing data to Neon:', err);
    return {
      success: false,
      message: `Gagal mengirim data ke Neon Database: ${err.message || String(err)}`
    };
  }
}

/**
 * Pull data from Neon database into the local application state
 */
export async function pullAllDataFromNeon(
  connectionString: string
): Promise<{
  success: boolean;
  message: string;
  data?: Partial<AppSyncDataPayload>;
}> {
  const cleanConn = sanitizeConnectionString(connectionString);
  try {
    const sql = neon(cleanConn);

    const [patientsRows, doctorsRows, queuesRows, recordsRows, paymentsRows] = await Promise.all([
      sql`SELECT * FROM patients ORDER BY created_at DESC`.catch(() => []),
      sql`SELECT * FROM doctors ORDER BY name ASC`.catch(() => []),
      sql`SELECT * FROM queues ORDER BY id DESC`.catch(() => []),
      sql`SELECT * FROM medical_records ORDER BY date DESC`.catch(() => []),
      sql`SELECT * FROM payments ORDER BY created_at DESC`.catch(() => [])
    ]);

    const mappedPatients: Patient[] = patientsRows.map((r: any) => ({
      id: String(r.id),
      rmNumber: String(r.rm_number || ''),
      nik: String(r.nik || ''),
      name: String(r.name || ''),
      gender: r.gender === 'Laki-laki' ? 'Laki-laki' : 'Perempuan',
      birthDate: String(r.birth_date || ''),
      phone: String(r.phone || ''),
      email: String(r.email || ''),
      address: String(r.address || ''),
      bloodType: r.blood_type || undefined,
      allergies: String(r.allergies || ''),
      specialNotes: String(r.special_notes || ''),
      totalVisits: Number(r.total_visits || 1),
      lastVisit: r.last_visit || undefined,
      createdAt: String(r.created_at || new Date().toISOString())
    }));

    const mappedQueues: QueueItem[] = queuesRows.map((q: any) => ({
      id: String(q.id),
      queueNumber: String(q.queue_number || ''),
      registrationId: String(q.registration_id || ''),
      patientId: String(q.patient_id || ''),
      patientName: String(q.patient_name || ''),
      patientRm: String(q.patient_rm || ''),
      doctorId: String(q.doctor_id || ''),
      doctorName: String(q.doctor_name || ''),
      treatmentId: String(q.treatment_id || ''),
      treatmentName: String(q.treatment_name || ''),
      status: q.status || 'Menunggu',
      date: String(q.date || ''),
      time: String(q.time || ''),
      counterRoom: String(q.counter_room || 'Ruang Konsultasi 1'),
      notes: q.notes ? String(q.notes) : undefined,
      calledAt: q.called_at || undefined,
      completedAt: q.completed_at || undefined
    }));

    const mappedRecords: MedicalRecord[] = recordsRows.map((mr: any) => ({
      id: String(mr.id),
      patientId: String(mr.patient_id || ''),
      patientName: String(mr.patient_name || ''),
      patientRm: String(mr.patient_rm || ''),
      doctorId: mr.doctor_id ? String(mr.doctor_id) : 'doc-1',
      doctorName: String(mr.doctor_name || ''),
      treatmentId: mr.treatment_id ? String(mr.treatment_id) : 'trt-1',
      treatmentName: String(mr.treatment_name || ''),
      date: String(mr.date || ''),
      complaints: String(mr.complaints || ''),
      skinCondition: String(mr.skin_condition || ''),
      examResult: String(mr.exam_result || ''),
      actionTaken: String(mr.action_taken || ''),
      productsUsed: mr.products_used || '',
      doctorNotes: mr.doctor_notes || '',
      followUpAdvice: String(mr.follow_up_advice || ''),
      nextControlDate: mr.next_control_date || '',
      treatmentDurationMinutes: Number(mr.treatment_duration_minutes || 60)
    }));

    const mappedPayments: Payment[] = paymentsRows.map((py: any) => ({
      id: String(py.id),
      invoiceNumber: String(py.invoice_number || ''),
      patientId: py.patient_id ? String(py.patient_id) : 'pat-1',
      patientName: String(py.patient_name || ''),
      patientRm: String(py.patient_rm || ''),
      treatmentId: py.treatment_id ? String(py.treatment_id) : 'trt-1',
      treatmentName: String(py.treatment_name || ''),
      treatmentPrice: Number(py.treatment_price || 0),
      subtotal: Number(py.subtotal || 0),
      discount: Number(py.discount || 0),
      tax: Number(py.tax || 0),
      totalAmount: Number(py.total_amount || 0),
      paymentMethod: py.payment_method || undefined,
      paymentChannelName: py.payment_channel_name || undefined,
      referenceNumber: py.reference_number || undefined,
      notes: py.notes || undefined,
      status: py.status || 'Belum Dibayar',
      paidAt: py.paid_at || undefined,
      cashierName: py.cashier_name ? String(py.cashier_name) : 'Kasir Utama',
      createdAt: String(py.created_at || new Date().toISOString())
    }));

    return {
      success: true,
      message: `Berhasil menarik ${mappedPatients.length} pasien, ${mappedQueues.length} antrian, ${mappedRecords.length} rekam medis, dan ${mappedPayments.length} pembayaran dari Neon Database!`,
      data: {
        patients: mappedPatients,
        queues: mappedQueues,
        medicalRecords: mappedRecords,
        payments: mappedPayments
      }
    };
  } catch (err: any) {
    console.error('Error pulling from Neon:', err);
    return {
      success: false,
      message: `Gagal menarik data dari Neon: ${err.message || String(err)}`
    };
  }
}
