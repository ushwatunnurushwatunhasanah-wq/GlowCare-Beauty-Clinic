-- ========================================================
-- GlowCare Beauty Clinic Database Initialization
-- MySQL 8.0 Script
-- "Your Beauty, Our Care"
-- ========================================================

CREATE DATABASE IF NOT EXISTS glowcare_clinic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE glowcare_clinic;

-- 1. Users Table (Admin, Dokter, Loket)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- bcrypt hashed
    role ENUM('admin', 'dokter', 'loket') NOT NULL DEFAULT 'loket',
    phone VARCHAR(30) NULL,
    department VARCHAR(100) NULL,
    avatar VARCHAR(255) NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed Demo Users (Password: password -> $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)
INSERT INTO users (name, email, password, role, phone, department, status) VALUES
('Nur Ushwatun Hasanah', 'admin@glowcare.test', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '0812-3456-7890', 'Manajemen Operasional', 'active'),
('dr. Andini Putri, Sp.DV', 'dokter@glowcare.test', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dokter', '0813-8877-6655', 'Dermatologi & Estetika', 'active'),
('Rina Kusuma Dewi', 'loket@glowcare.test', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'loket', '0819-2233-4455', 'Front Office & Pendaftaran', 'active');

-- 2. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rm_number VARCHAR(50) NOT NULL UNIQUE,
    nik VARCHAR(30) NOT NULL,
    name VARCHAR(150) NOT NULL,
    gender ENUM('Perempuan', 'Laki-laki') NOT NULL,
    birth_date DATE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NULL,
    address TEXT NULL,
    blood_type VARCHAR(5) NULL,
    allergies TEXT NULL,
    special_notes TEXT NULL,
    total_visits INT DEFAULT 1,
    last_visit DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO patients (rm_number, nik, name, gender, birth_date, phone, email, address, allergies, special_notes, total_visits, last_visit) VALUES
('RM-2026-0101', '3273014508980002', 'Siti Rahmawati', 'Perempuan', '1998-08-15', '0812-9988-7711', 'siti.rahmawati@gmail.com', 'Jl. Kemang Raya No. 42, Jakarta Selatan', 'Alergi seafood, benzoyl peroxide', 'Kulit sensitif, rosacea prone', 5, '2026-09-20'),
('RM-2026-0102', '3273016004950001', 'Dian Permatasari', 'Perempuan', '1995-04-20', '0821-4455-6677', 'dian.permatasari@gmail.com', 'Jl. Senopati No. 18, Jakarta Selatan', 'Tidak ada', 'Fokus pencerahan flek bekas jerawat', 8, '2026-09-24'),
('RM-2026-0103', '3171021203920005', 'Nadia Anggraini', 'Perempuan', '1992-03-12', '0857-1122-3344', 'nadia.anggraini@yahoo.com', 'Apartemen Sudirman Tower A Lt. 12', 'Sulfur, pewangi buatan', 'Perawatan pre-wedding 2 bulan ke depan', 12, '2026-09-26');

-- 3. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    specialization VARCHAR(150) NOT NULL,
    sip_number VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 4.90,
    total_patients INT DEFAULT 0,
    schedule_days VARCHAR(255) NOT NULL,
    schedule_hours VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO doctors (name, specialization, sip_number, phone, email, rating, total_patients, schedule_days, schedule_hours) VALUES
('dr. Andini Putri, Sp.DV', 'Spesialis Dermatologi & Venereologi', 'SIP.446.1/045/Dinkes/2024', '0813-8877-6655', 'dr.andini@glowcare.test', 4.90, 420, 'Senin, Selasa, Rabu, Kamis, Jumat', '09:00 - 16:00'),
('dr. Citra Lestari, Sp.KK, M.Biomed', 'Anti-Aging & Laser Aesthetics Specialist', 'SIP.446.1/089/Dinkes/2023', '0812-7788-9900', 'dr.citra@glowcare.test', 4.80, 385, 'Selasa, Rabu, Jumat, Sabtu', '10:00 - 18:00'),
('dr. Farhan Hidayat, M.Kes, AAM', 'Aesthetic Medicine & Skin Rejuvenation', 'SIP.446.1/112/Dinkes/2025', '0811-3344-5566', 'dr.farhan@glowcare.test', 4.85, 310, 'Senin, Kamis, Sabtu, Minggu', '11:00 - 19:00');

-- 4. Treatments Table
CREATE TABLE IF NOT EXISTS treatments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NULL,
    price BIGINT NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    handled_by VARCHAR(50) NOT NULL DEFAULT 'Dokter & Perawat',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO treatments (code, name, category, description, price, duration_minutes, handled_by) VALUES
('TRT-001', 'Basic Facial Glow', 'Facial', 'Pembersihan mendalam, ekstraksi komedo aseptik, masker nutrisi.', 150000, 60, 'Perawat'),
('TRT-002', 'Acne Purifying Treatment', 'Acne', 'Terapi jerawat aktif, sterilisasi HF ozon, serum anti-inflamasi.', 350000, 75, 'Dokter & Perawat'),
('TRT-003', 'Hydrafacial Deep Infusion', 'Hydra', 'Vortex exfoliation, vakum pori, dan infusi hyaluronic acid.', 650000, 75, 'Dokter & Perawat'),
('TRT-004', 'Brightening Laser Rejuvenation', 'Laser', 'Nd:YAG laser untuk meratakan rona kulit dan menyamarkan melasma.', 1250000, 45, 'Dokter'),
('TRT-006', 'Korean Glass Skin DNA Salmon', 'Rejuvenation', 'Microneedling infusi Salmon PDRN concentrate untuk regenerasi sel.', 1850000, 90, 'Dokter');

-- 5. Queues Table
CREATE TABLE IF NOT EXISTS queues (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    queue_number VARCHAR(10) NOT NULL,
    patient_id BIGINT NOT NULL,
    patient_name VARCHAR(150) NOT NULL,
    patient_rm VARCHAR(50) NOT NULL,
    doctor_name VARCHAR(150) NOT NULL,
    treatment_name VARCHAR(150) NOT NULL,
    status ENUM('Menunggu', 'Dipanggil', 'Sedang Dilayani', 'Selesai', 'Dibatalkan') DEFAULT 'Menunggu',
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    counter_room VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO queues (queue_number, patient_id, patient_name, patient_rm, doctor_name, treatment_name, status, date, time, counter_room) VALUES
('A001', 3, 'Nadia Anggraini', 'RM-2026-0103', 'dr. Andini Putri, Sp.DV', 'Hydrafacial Deep Infusion', 'Sedang Dilayani', '2026-09-26', '09:15', 'Ruang Konsultasi 1'),
('A002', 1, 'Siti Rahmawati', 'RM-2026-0101', 'dr. Andini Putri, Sp.DV', 'Acne Purifying Treatment', 'Dipanggil', '2026-09-26', '09:30', 'Ruang Konsultasi 1'),
('A003', 2, 'Dian Permatasari', 'RM-2026-0102', 'dr. Citra Lestari, Sp.KK', 'Brightening Laser Rejuvenation', 'Menunggu', '2026-09-26', '10:00', 'Ruang Laser 2');

-- 6. Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    patient_name VARCHAR(150) NOT NULL,
    patient_rm VARCHAR(50) NOT NULL,
    doctor_name VARCHAR(150) NOT NULL,
    treatment_name VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    complaints TEXT NOT NULL,
    skin_condition TEXT NOT NULL,
    exam_result TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    products_used TEXT NULL,
    doctor_notes TEXT NULL,
    follow_up_advice TEXT NOT NULL,
    next_control_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    patient_name VARCHAR(150) NOT NULL,
    patient_rm VARCHAR(50) NOT NULL,
    treatment_name VARCHAR(150) NOT NULL,
    treatment_price BIGINT NOT NULL,
    subtotal BIGINT NOT NULL,
    discount BIGINT DEFAULT 0,
    total_amount BIGINT NOT NULL,
    payment_method ENUM('Cash', 'Transfer', 'QRIS', 'Debit') NULL,
    status ENUM('Belum Dibayar', 'Lunas', 'Dibatalkan') DEFAULT 'Belum Dibayar',
    paid_at TIMESTAMP NULL,
    cashier_name VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Ratings & Reviews Table
CREATE TABLE IF NOT EXISTS ratings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_name VARCHAR(150) NOT NULL,
    treatment_name VARCHAR(150) NOT NULL,
    doctor_name VARCHAR(150) NOT NULL,
    overall_rating INT NOT NULL CHECK(overall_rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Menunggu', 'Ditampilkan', 'Disembunyikan', 'Ditindaklanjuti') DEFAULT 'Ditampilkan',
    clinic_response TEXT NULL
);

INSERT INTO ratings (patient_name, treatment_name, doctor_name, overall_rating, comment, status, clinic_response) VALUES
('Clara M******', 'Korean Glass Skin DNA Salmon', 'dr. Citra Lestari, Sp.KK', 5, 'Pelayanannya sangat ramah dan treatment dilakukan dengan begitu teliti. Ruangannya juga sangat estetik dan wangi!', 'Ditampilkan', 'Terima kasih banyak Ibu Clara atas ulasan hangatnya. Senang sekali melayani Anda.');
