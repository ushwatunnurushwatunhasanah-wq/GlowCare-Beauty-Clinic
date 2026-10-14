/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginView } from './components/auth/LoginView';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// Views
import { AdminDashboard } from './components/views/admin/AdminDashboard';
import { PatientsView } from './components/views/admin/PatientsView';
import { DoctorsView } from './components/views/admin/DoctorsView';
import { NursesView } from './components/views/admin/NursesView';
import { TreatmentsView } from './components/views/admin/TreatmentsView';
import { ProductsView } from './components/views/admin/ProductsView';
import { RegistrationsView } from './components/views/admin/RegistrationsView';
import { QueueView } from './components/views/admin/QueueView';
import { MedicalRecordsView } from './components/views/admin/MedicalRecordsView';
import { PaymentsView } from './components/views/admin/PaymentsView';
import { RatingsModerationView } from './components/views/admin/RatingsModerationView';
import { ReportsView } from './components/views/admin/ReportsView';
import { UsersView } from './components/views/admin/UsersView';
import { SettingsView } from './components/views/admin/SettingsView';
import { ActivityLogsView } from './components/views/admin/ActivityLogsView';

// Doctor Views
import { DoctorDashboard } from './components/views/doctor/DoctorDashboard';
import { DoctorPatientsToday } from './components/views/doctor/DoctorPatientsToday';
import { DoctorScheduleView } from './components/views/doctor/DoctorScheduleView';

// Reception Views
import { ReceptionDashboard } from './components/views/reception/ReceptionDashboard';

// Common Views
import { AppointmentsView } from './components/views/common/AppointmentsView';
import { ProfileView } from './components/views/common/ProfileView';

// Modals
import { RegisterModal } from './components/modals/RegisterModal';
import { PatientFormModal } from './components/modals/PatientFormModal';
import { PatientDetailModal } from './components/modals/PatientDetailModal';
import { TreatmentFormModal } from './components/modals/TreatmentFormModal';
import { DoctorFormModal } from './components/modals/DoctorFormModal';
import { NurseFormModal } from './components/modals/NurseFormModal';
import { ProductFormModal } from './components/modals/ProductFormModal';
import { NewAppointmentModal } from './components/modals/NewAppointmentModal';
import { MedicalExamModal } from './components/modals/MedicalExamModal';
import { PaymentProcessModal } from './components/modals/PaymentProcessModal';
import { PrintReceiptModal } from './components/modals/PrintReceiptModal';
import { PrintQueueTicketModal } from './components/modals/PrintQueueTicketModal';
import { PrintRegSlipModal } from './components/modals/PrintRegSlipModal';
import { PatientReviewModal } from './components/modals/PatientReviewModal';
import { EditPaymentMethodModal } from './components/modals/EditPaymentMethodModal';
import { PaymentChannelModal } from './components/modals/PaymentChannelModal';
import { NewPaymentModal } from './components/modals/NewPaymentModal';
import { UserFormModal } from './components/modals/UserFormModal';
import { ResetPasswordModal } from './components/modals/ResetPasswordModal';

const AppContent: React.FC = () => {
  const { currentUser, currentModal, modalData, closeModal } = useApp();
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // When user switches account or role changes, reset menu to dashboard
  useEffect(() => {
    setCurrentMenu('dashboard');
  }, [currentUser?.id, currentUser?.role]);

  if (!currentUser) {
    return <LoginView />;
  }

  const role = currentUser.role;

  // Title for top bar breadcrumb
  const getMenuTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard Utama',
      pasien: 'Data Master Pasien',
      'pasien-hari-ini': 'Daftar Pasien Hari Ini',
      dokter: 'Data Tenaga Dokter Spesialis',
      perawat: 'Data Tenaga Perawat & Beautician',
      treatment: 'Katalog Layanan Treatment',
      produk: 'Inventaris Produk Skincare',
      pendaftaran: 'Data Pendaftaran Pasien',
      'pendaftaran-pasien': 'Pendaftaran & Registrasi Pasien',
      antrian: 'Papan Antrian Pasien',
      'rekam-perawatan': 'Rekam Medis & Perawatan (Timeline)',
      pemeriksaan: 'Pemeriksaan & Tindakan Klinis',
      pembayaran: 'Kasir & Pembayaran Pasien',
      komentar: 'Moderasi Komentar & Rating Pasien',
      'komentar-pasien': 'Ulasan Pasien Saya',
      laporan: 'Pusat Laporan & Analisis Klinik',
      pengguna: 'Manajemen Akun Pengguna',
      pengaturan: 'Pengaturan Profil Klinik',
      'log-aktivitas': 'Log Audit Keamanan Sistem',
      appointment: 'Jadwal Booking & Appointment',
      'jadwal-saya': 'Jadwal Praktik Dokter',
      'jadwal-dokter': 'Jadwal Dokter Spesialis',
      'riwayat-pasien': 'Arsip Riwayat Pasien',
      'riwayat-pendaftaran': 'Riwayat Pendaftaran Loket',
      'cetak-bukti': 'Cetak Bukti Registrasi',
      profil: 'Profil Pengguna',
      neondb: 'Integrasi Cloud Neon Database (neondb.com)'
    };
    return titles[currentMenu] || 'GlowCare Beauty Clinic';
  };

  // Render view depending on role and current menu
  const renderView = () => {
    // Admin routes
    if (role === 'admin') {
      switch (currentMenu) {
        case 'dashboard':
          return <AdminDashboard onNavigate={setCurrentMenu} />;
        case 'pasien':
          return <PatientsView />;
        case 'dokter':
          return <DoctorsView onNavigate={setCurrentMenu} />;
        case 'perawat':
          return <NursesView />;
        case 'treatment':
          return <TreatmentsView />;
        case 'produk':
          return <ProductsView />;
        case 'pendaftaran':
          return <RegistrationsView />;
        case 'antrian':
          return <QueueView />;
        case 'rekam-perawatan':
          return <MedicalRecordsView />;
        case 'pembayaran':
          return <PaymentsView />;
        case 'komentar':
          return <RatingsModerationView />;
        case 'laporan':
          return <ReportsView />;
        case 'pengguna':
          return <UsersView />;
        case 'pengaturan':
          return <SettingsView initialTab="profil" />;
        case 'neondb':
          return <SettingsView initialTab="neon" />;
        case 'log-aktivitas':
          return <ActivityLogsView />;
        case 'profil':
          return <ProfileView onNavigate={setCurrentMenu} />;
        default:
          return <AdminDashboard onNavigate={setCurrentMenu} />;
      }
    }

    // Doctor routes
    if (role === 'dokter') {
      switch (currentMenu) {
        case 'dashboard':
          return <DoctorDashboard onNavigate={setCurrentMenu} />;
        case 'pasien-hari-ini':
          return <DoctorPatientsToday />;
        case 'antrian':
          return <QueueView />;
        case 'appointment':
          return <AppointmentsView />;
        case 'pemeriksaan':
        case 'rekam-perawatan':
          return <MedicalRecordsView />;
        case 'treatment':
          return <TreatmentsView />;
        case 'riwayat-pasien':
          return <PatientsView />;
        case 'jadwal-saya':
          return <DoctorScheduleView />;
        case 'profil':
          return <ProfileView onNavigate={setCurrentMenu} />;
        case 'komentar-pasien':
          return <RatingsModerationView />;
        default:
          return <DoctorDashboard onNavigate={setCurrentMenu} />;
      }
    }

    // Receptionist routes
    if (role === 'loket') {
      switch (currentMenu) {
        case 'dashboard':
          return <ReceptionDashboard onNavigate={setCurrentMenu} />;
        case 'pendaftaran-pasien':
        case 'riwayat-pendaftaran':
        case 'cetak-bukti':
          return <RegistrationsView />;
        case 'pasien':
          return <PatientsView />;
        case 'appointment':
          return <AppointmentsView />;
        case 'antrian':
          return <QueueView />;
        case 'jadwal-dokter':
          return <DoctorsView onNavigate={setCurrentMenu} />;
        case 'pembayaran':
          return <PaymentsView />;
        case 'profil':
          return <ProfileView onNavigate={setCurrentMenu} />;
        default:
          return <ReceptionDashboard onNavigate={setCurrentMenu} />;
      }
    }

    return <AdminDashboard onNavigate={setCurrentMenu} />;
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7F7] text-stone-800">
      {/* Sidebar */}
      <Sidebar
        currentMenu={currentMenu}
        onSelectMenu={setCurrentMenu}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Header Bar */}
        <Header
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          currentMenuTitle={getMenuTitle()}
          onNavigate={setCurrentMenu}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderView()}
        </main>
      </div>

      {/* Global Modals */}
      {currentModal === 'new-registration' && <RegisterModal onClose={closeModal} />}
      {currentModal === 'patient-form' && <PatientFormModal initialData={modalData} onClose={closeModal} />}
      {currentModal === 'patient-detail' && <PatientDetailModal patient={modalData} onClose={closeModal} />}
      {currentModal === 'treatment-form' && <TreatmentFormModal initialData={modalData} onClose={closeModal} />}
      {currentModal === 'doctor-form' && <DoctorFormModal initialData={modalData} onClose={closeModal} />}
      {currentModal === 'nurse-form' && <NurseFormModal initialData={modalData} onClose={closeModal} />}
      {currentModal === 'product-form' && <ProductFormModal initialData={modalData} onClose={closeModal} />}
      {currentModal === 'new-appointment' && <NewAppointmentModal onClose={closeModal} />}
      {currentModal === 'medical-exam-form' && <MedicalExamModal initialData={modalData} onClose={closeModal} />}
      {currentModal === 'process-payment' && <PaymentProcessModal payment={modalData} onClose={closeModal} />}
      {currentModal === 'print-receipt' && <PrintReceiptModal payment={modalData} onClose={closeModal} />}
      {currentModal === 'print-queue-ticket' && <PrintQueueTicketModal queueItem={modalData} onClose={closeModal} />}
      {currentModal === 'print-registration-ticket' && <PrintRegSlipModal registration={modalData} onClose={closeModal} />}
      {currentModal === 'patient-review-modal' && <PatientReviewModal onClose={closeModal} />}
      {currentModal === 'edit-payment-method' && <EditPaymentMethodModal payment={modalData} onClose={closeModal} />}
      {currentModal === 'payment-channel-form' && <PaymentChannelModal channel={modalData} onClose={closeModal} />}
      {currentModal === 'new-payment' && <NewPaymentModal onClose={closeModal} />}
      {currentModal === 'user-form' && <UserFormModal initialData={modalData} onClose={closeModal} />}
      {currentModal === 'reset-password-modal' && <ResetPasswordModal user={modalData} onClose={closeModal} />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
