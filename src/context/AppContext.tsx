import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  UserRole,
  Patient,
  Doctor,
  Nurse,
  Treatment,
  Product,
  QueueItem,
  QueueStatus,
  Appointment,
  AppointmentStatus,
  Registration,
  MedicalRecord,
  Payment,
  PaymentMethod,
  PaymentChannel,
  PaymentStatus,
  PatientRatingComment,
  CommentStatus,
  ActivityLog,
  ClinicNotification,
  ClinicSettings,
  NeonConfig
} from '../types';
import {
  getStoredNeonConfig,
  saveStoredNeonConfig,
  testNeonConnection,
  initializeNeonSchema,
  pushAllDataToNeon,
  pullAllDataFromNeon
} from '../services/neonService';
import {
  INITIAL_USERS,
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_NURSES,
  INITIAL_TREATMENTS,
  INITIAL_PRODUCTS,
  INITIAL_QUEUES,
  INITIAL_APPOINTMENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_PAYMENTS,
  INITIAL_PAYMENT_CHANNELS,
  INITIAL_RATINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SETTINGS
} from '../data/initialData';

interface AppContextType {
  currentUser: User | null;
  currentDoctor: Doctor | null;
  isMyDoctorData: (docId?: string, docName?: string) => boolean;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole, specificEmailOrId?: string) => void;
  switchUser: (userIdOrEmail: string) => void;

  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  resetUserPassword: (id: string, customPassword?: string) => string;

  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'totalVisits' | 'createdAt'>) => Patient;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  deleteMultiplePatients: (ids: string[]) => void;

  doctors: Doctor[];
  addDoctor: (doctor: Omit<Doctor, 'id' | 'totalPatients'>) => void;
  updateDoctor: (id: string, data: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  deleteMultipleDoctors: (ids: string[]) => void;

  nurses: Nurse[];
  addNurse: (nurse: Omit<Nurse, 'id'>) => void;
  updateNurse: (id: string, data: Partial<Nurse>) => void;
  deleteNurse: (id: string) => void;
  deleteMultipleNurses: (ids: string[]) => void;

  treatments: Treatment[];
  addTreatment: (treatment: Omit<Treatment, 'id'>) => void;
  updateTreatment: (id: string, data: Partial<Treatment>) => void;
  deleteTreatment: (id: string) => void;
  deleteMultipleTreatments: (ids: string[]) => void;

  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  queues: QueueItem[];
  addQueueItem: (item: Omit<QueueItem, 'id' | 'queueNumber'>) => QueueItem;
  updateQueueStatus: (id: string, status: QueueStatus) => void;
  callQueue: (queueItem: QueueItem) => void;
  deleteQueue: (id: string) => void;
  deleteMultipleQueues: (ids: string[]) => void;

  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;

  registrations: Registration[];
  addRegistration: (reg: Omit<Registration, 'id' | 'regNumber'>) => Registration;
  deleteRegistration: (id: string) => void;
  deleteMultipleRegistrations: (ids: string[]) => void;

  medicalRecords: MedicalRecord[];
  addMedicalRecord: (record: Omit<MedicalRecord, 'id'>) => MedicalRecord;
  updateMedicalRecord: (id: string, data: Partial<MedicalRecord>) => void;
  deleteMedicalRecord: (id: string) => void;

  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'invoiceNumber'>) => Payment;
  updatePaymentStatus: (id: string, status: PaymentStatus, method?: any) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  deleteMultiplePayments: (ids: string[]) => void;
  updatePaymentMethod: (
    id: string,
    method: PaymentMethod,
    details?: {
      referenceNumber?: string;
      notes?: string;
      status?: PaymentStatus;
      paymentChannelName?: string;
      discount?: number;
      totalAmount?: number;
    }
  ) => void;

  paymentChannels: PaymentChannel[];
  addPaymentChannel: (channel: Omit<PaymentChannel, 'id'>) => void;
  updatePaymentChannel: (id: string, updates: Partial<PaymentChannel>) => void;
  deletePaymentChannel: (id: string) => void;

  ratings: PatientRatingComment[];
  addRatingComment: (review: Omit<PatientRatingComment, 'id' | 'date' | 'status'>) => void;
  updateRatingStatus: (id: string, status: CommentStatus, adminNotes?: string) => void;
  replyToReview: (id: string, response: string) => void;

  activityLogs: ActivityLog[];
  notifications: ClinicNotification[];
  markNotifAsRead: (id: string) => void;
  markAllNotifsRead: () => void;

  settings: ClinicSettings;
  updateSettings: (newSettings: Partial<ClinicSettings>) => void;

  neonConfig: NeonConfig;
  updateNeonConfig: (config: Partial<NeonConfig>) => void;
  testNeon: (customConn?: string) => Promise<{ success: boolean; message: string; latencyMs?: number; pgVersion?: string; databaseName?: string; user?: string }>;
  initNeonDatabase: () => Promise<{ success: boolean; message: string }>;
  pushDataToNeon: () => Promise<{ success: boolean; message: string; stats?: any }>;
  pullDataFromNeon: () => Promise<{ success: boolean; message: string }>;

  currentModal: string | null;
  modalData: any;
  openModal: (modalName: string, data?: any) => void;
  closeModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`glowcare_${key}`);
    const data = item ? JSON.parse(item) : fallback;
    if (key === 'doctors' && Array.isArray(data)) {
      return data.map((doc: any) => {
        if (doc.avatar && doc.avatar.includes('photo-1594824813576-90518778f654')) {
          return {
            ...doc,
            avatar: 'https://images.unsplash.com/photo-1594824813689-53e3fa299be1?auto=format&fit=crop&q=80&w=256'
          };
        }
        return doc;
      }) as any;
    }
    return data;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(`glowcare_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('glowcare_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.id === 'usr-1' || parsed.email === 'admin@glowcare.test' || (parsed.name && parsed.name.includes('Amanda')))) {
          parsed.name = INITIAL_USERS[0].name;
          localStorage.setItem('glowcare_current_user', JSON.stringify(parsed));
          return parsed;
        }
        return parsed;
      } catch {
        return INITIAL_USERS[0];
      }
    }
    return INITIAL_USERS[0]; // default logged in as admin for immediate evaluation
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = loadStorage<User[]>('users', INITIAL_USERS);
    // Ensure all INITIAL_USERS (including all doctors) are present
    const existingEmails = new Set(saved.map(u => u.email.toLowerCase()));
    const missing = INITIAL_USERS.filter(u => !existingEmails.has(u.email.toLowerCase()));
    let merged = missing.length > 0 ? [...saved, ...missing] : [...saved];

    // Ensure every single doctor has an active login user account
    INITIAL_DOCTORS.forEach(doc => {
      const docEmail = doc.email.toLowerCase();
      const hasUser = merged.some(
        u => u.email.toLowerCase() === docEmail || u.name.toLowerCase() === doc.name.toLowerCase()
      );
      if (!hasUser) {
        merged.push({
          id: `usr-${doc.id.replace('doc-', 'docusr-')}`,
          name: doc.name,
          email: doc.email,
          role: 'dokter',
          avatar: doc.avatar,
          phone: doc.phone,
          department: doc.specialization,
          status: 'active',
          createdAt: '2026-01-12 09:30:00'
        });
      }
    });

    // Harmonize dr. Andini email if stored as old dokter@glowcare.test
    merged = merged.map(u => {
      if (u.id === 'usr-2' && (u.email === 'dokter@glowcare.test' || u.name.includes('Andini'))) {
        return { ...u, email: 'dr.andini@glowcare.test', name: 'dr. Andini Putri, Sp.DV' };
      }
      return u;
    });

    saveStorage('users', merged);
    return merged;
  });

  const [patients, setPatients] = useState<Patient[]>(() => loadStorage('patients', INITIAL_PATIENTS));
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const savedDocs = loadStorage<Doctor[]>('doctors', INITIAL_DOCTORS);
    const existingNames = new Set(savedDocs.map(d => d.name.toLowerCase()));
    const missingDocs = INITIAL_DOCTORS.filter(d => !existingNames.has(d.name.toLowerCase()));
    if (missingDocs.length > 0) {
      const merged = [...savedDocs, ...missingDocs];
      saveStorage('doctors', merged);
      return merged;
    }
    return savedDocs;
  });
  const [nurses, setNurses] = useState<Nurse[]>(() => {
    const savedNurses = loadStorage<Nurse[]>('nurses', INITIAL_NURSES);
    const existingNames = new Set(savedNurses.map(n => n.name.toLowerCase()));
    const missingNurses = INITIAL_NURSES.filter(n => !existingNames.has(n.name.toLowerCase()));
    if (missingNurses.length > 0) {
      const merged = [...savedNurses, ...missingNurses];
      saveStorage('nurses', merged);
      return merged;
    }
    return savedNurses;
  });
  const [treatments, setTreatments] = useState<Treatment[]>(() => loadStorage('treatments', INITIAL_TREATMENTS));
  const [products, setProducts] = useState<Product[]>(() => loadStorage('products', INITIAL_PRODUCTS));
  const [queues, setQueues] = useState<QueueItem[]>(() => {
    const saved = loadStorage<QueueItem[]>('queues', INITIAL_QUEUES);
    const existingIds = new Set(saved.map(q => q.id));
    const missing = INITIAL_QUEUES.filter(q => !existingIds.has(q.id));
    if (missing.length > 0) {
      const merged = [...saved, ...missing];
      saveStorage('queues', merged);
      return merged;
    }
    return saved;
  });
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = loadStorage<Appointment[]>('appointments', INITIAL_APPOINTMENTS);
    const existingIds = new Set(saved.map(a => a.id));
    const missing = INITIAL_APPOINTMENTS.filter(a => !existingIds.has(a.id));
    if (missing.length > 0) {
      const merged = [...saved, ...missing];
      saveStorage('appointments', merged);
      return merged;
    }
    return saved;
  });
  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const savedRegs = loadStorage<Registration[]>('registrations', INITIAL_REGISTRATIONS);
    const existingRegNums = new Set(savedRegs.map(r => r.regNumber));
    const missingRegs = INITIAL_REGISTRATIONS.filter(r => !existingRegNums.has(r.regNumber));
    if (missingRegs.length > 0) {
      const merged = [...savedRegs, ...missingRegs];
      saveStorage('registrations', merged);
      return merged;
    }
    return savedRegs;
  });
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {
    const saved = loadStorage<MedicalRecord[]>('medical_records', INITIAL_MEDICAL_RECORDS);
    const existingIds = new Set(saved.map(m => m.id));
    const missing = INITIAL_MEDICAL_RECORDS.filter(m => !existingIds.has(m.id));
    if (missing.length > 0) {
      const merged = [...saved, ...missing];
      saveStorage('medical_records', merged);
      return merged;
    }
    return saved;
  });
  const [payments, setPayments] = useState<Payment[]>(() => loadStorage('payments', INITIAL_PAYMENTS));
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>(() => loadStorage('payment_channels', INITIAL_PAYMENT_CHANNELS));
  const [ratings, setRatings] = useState<PatientRatingComment[]>(() => {
    const saved = loadStorage<PatientRatingComment[]>('ratings', INITIAL_RATINGS);
    const existingIds = new Set(saved.map(r => r.id));
    const missing = INITIAL_RATINGS.filter(r => !existingIds.has(r.id));
    if (missing.length > 0) {
      const merged = [...saved, ...missing];
      saveStorage('ratings', merged);
      return merged;
    }
    return saved;
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadStorage('activity_logs', INITIAL_ACTIVITY_LOGS));
  const [notifications, setNotifications] = useState<ClinicNotification[]>(() => loadStorage('notifications', INITIAL_NOTIFICATIONS));
  const [settings, setSettings] = useState<ClinicSettings>(() => loadStorage('settings', INITIAL_SETTINGS));

  const [currentModal, setCurrentModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('glowcare_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('glowcare_current_user');
    }
  }, [currentUser]);

  useEffect(() => saveStorage('patients', patients), [patients]);
  useEffect(() => saveStorage('users', users), [users]);
  useEffect(() => saveStorage('doctors', doctors), [doctors]);
  useEffect(() => saveStorage('nurses', nurses), [nurses]);
  useEffect(() => saveStorage('treatments', treatments), [treatments]);
  useEffect(() => saveStorage('products', products), [products]);
  useEffect(() => saveStorage('queues', queues), [queues]);
  useEffect(() => saveStorage('appointments', appointments), [appointments]);
  useEffect(() => saveStorage('registrations', registrations), [registrations]);
  useEffect(() => saveStorage('medical_records', medicalRecords), [medicalRecords]);
  useEffect(() => saveStorage('payments', payments), [payments]);
  useEffect(() => saveStorage('payment_channels', paymentChannels), [paymentChannels]);
  useEffect(() => saveStorage('ratings', ratings), [ratings]);
  useEffect(() => saveStorage('activity_logs', activityLogs), [activityLogs]);
  useEffect(() => saveStorage('notifications', notifications), [notifications]);
  useEffect(() => saveStorage('settings', settings), [settings]);

  const logAction = (action: string, target: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: currentUser ? currentUser.name : 'Sistem',
      userRole: currentUser ? currentUser.role : 'admin',
      action,
      target,
      ipAddress: '192.168.1.105'
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (title: string, message: string, type: ClinicNotification['type'], linkMenu?: string) => {
    const newNotif: ClinicNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Baru saja',
      isRead: false,
      linkMenu
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Auto-sync all doctors in doctors list to users so every doctor has an active user account
  useEffect(() => {
    setUsers(prevUsers => {
      let changed = false;
      const updated = [...prevUsers];
      doctors.forEach(doc => {
        const docEmail = doc.email.toLowerCase();
        const existingIdx = updated.findIndex(
          u => u.email.toLowerCase() === docEmail || u.name.toLowerCase() === doc.name.toLowerCase()
        );
        if (existingIdx === -1) {
          updated.push({
            id: `usr-${doc.id.replace('doc-', 'docusr-')}`,
            name: doc.name,
            email: doc.email,
            role: 'dokter',
            avatar: doc.avatar,
            phone: doc.phone,
            department: doc.specialization,
            status: 'active',
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
          });
          changed = true;
        } else {
          const u = updated[existingIdx];
          if (
            u.name !== doc.name ||
            u.avatar !== doc.avatar ||
            u.department !== doc.specialization ||
            u.role !== 'dokter' ||
            u.email.toLowerCase() !== docEmail
          ) {
            updated[existingIdx] = {
              ...u,
              name: doc.name,
              avatar: doc.avatar || u.avatar,
              department: doc.specialization,
              role: 'dokter',
              email: doc.email
            };
            changed = true;
          }
        }
      });
      return changed ? updated : prevUsers;
    });
  }, [doctors]);

  // Reliable resolver for active doctor matching the logged-in user
  const currentDoctor = useMemo<Doctor | null>(() => {
    if (!currentUser || currentUser.role !== 'dokter') return null;
    const cleanEmail = currentUser.email.toLowerCase();
    const cleanName = currentUser.name.toLowerCase().replace(/[^a-z]/g, '');

    // 1. Direct match on email
    let found = doctors.find(d => d.email.toLowerCase() === cleanEmail);
    if (found) return found;

    // 2. Direct match on full name
    found = doctors.find(d => d.name.toLowerCase() === currentUser.name.toLowerCase());
    if (found) return found;

    // 3. Normalized name inclusion (e.g. "andini", "citra", "farhan", "celine")
    found = doctors.find(d => {
      const docClean = d.name.toLowerCase().replace(/[^a-z]/g, '');
      return docClean.includes(cleanName) || cleanName.includes(docClean);
    });
    if (found) return found;

    // 4. Aliases
    if (cleanEmail === 'dokter@glowcare.test' || cleanName.includes('andini')) {
      return doctors.find(d => d.name.toLowerCase().includes('andini')) || doctors[0] || null;
    }

    return doctors[0] || null;
  }, [currentUser, doctors]);

  // Strict data isolation matcher for active doctor
  const isMyDoctorData = useCallback((docId?: string, docName?: string): boolean => {
    if (!currentDoctor) return false;
    if (docId && docId === currentDoctor.id) return true;
    if (!docName) return false;
    const cleanDoc = docName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanCurrent = currentDoctor.name.toLowerCase().replace(/[^a-z]/g, '');
    return cleanDoc.includes(cleanCurrent) || cleanCurrent.includes(cleanDoc);
  }, [currentDoctor]);

  const login = (email: string, password?: string): boolean => {
    let clean = email.trim().toLowerCase();
    if (!clean) return false;

    // Auto-fix domain typo e.g. .tes -> .test
    if (clean.endsWith('.tes')) {
      clean = clean + 't';
    }

    const prefix = clean.includes('@') ? clean.split('@')[0] : clean;

    let user: User | undefined;

    // 1. Direct match on user email
    user = users.find(u => u.email.toLowerCase() === clean);

    // 2. Direct match on user name
    if (!user) {
      user = users.find(u => u.name.toLowerCase() === clean);
    }

    // 3. Match Admin (e.g. admin, admin@glowcare.tes, admin@glowcare.test, admin@..., ushwatun, hasanah, nursamlad, etc.)
    if (!user) {
      if (
        prefix === 'admin' ||
        clean.includes('admin') ||
        clean.includes('ushwatun') ||
        clean.includes('hasanah') ||
        clean.includes('nursam') ||
        clean === 'ushwatunnurushwatunhasanah@gmail.com'
      ) {
        user = users.find(u => u.role === 'admin') || INITIAL_USERS[0];
      }
    }

    // 4. Match Loket (e.g. loket, loket@..., rina)
    if (!user) {
      if (prefix === 'loket' || clean.includes('loket') || clean.includes('rina')) {
        user = users.find(u => u.role === 'loket') || INITIAL_USERS[2];
      }
    }

    // 5. Match Doctors by email, name, prefix or common alias
    if (!user) {
      if (prefix.includes('andini') || clean.includes('andini') || clean === 'dokter') {
        user = users.find(u => u.name.toLowerCase().includes('andini') || u.email.toLowerCase().includes('andini'));
      } else if (prefix.includes('citra') || clean.includes('citra')) {
        user = users.find(u => u.name.toLowerCase().includes('citra') || u.email.toLowerCase().includes('citra'));
      } else if (prefix.includes('farhan') || clean.includes('farhan')) {
        user = users.find(u => u.name.toLowerCase().includes('farhan') || u.email.toLowerCase().includes('farhan'));
      } else if (prefix.includes('celine') || clean.includes('celine')) {
        user = users.find(u => u.name.toLowerCase().includes('celine') || u.email.toLowerCase().includes('celine'));
      }
    }

    // 6. Match any doctor from doctors list
    if (!user) {
      const cleanInput = clean.replace(/[^a-z0-9]/g, '');
      const matchedDoc = doctors.find(d => {
        const dEmail = d.email.toLowerCase();
        const dName = d.name.toLowerCase();
        const dCleanName = dName.replace(/[^a-z0-9]/g, '');
        return (
          dEmail === clean ||
          dEmail.startsWith(prefix) ||
          dName === clean ||
          (cleanInput.length >= 3 && (dCleanName.includes(cleanInput) || cleanInput.includes(dCleanName)))
        );
      });

      if (matchedDoc) {
        user = users.find(
          u =>
            u.email.toLowerCase() === matchedDoc.email.toLowerCase() ||
            u.name.toLowerCase() === matchedDoc.name.toLowerCase()
        );
      }
    }

    // 7. General search in users list by partial prefix
    if (!user) {
      user = users.find(u => {
        const uPrefix = u.email.split('@')[0].toLowerCase();
        return uPrefix === prefix || u.name.toLowerCase().includes(prefix);
      });
    }

    if (user) {
      // Sync and record password if user set a custom password like 'nursamlad27'
      if (password && password.trim()) {
        const pass = password.trim();
        if (!user.password || user.password !== pass) {
          setUsers(prev => prev.map(u => (u.id === user?.id ? { ...u, password: pass } : u)));
        }
      }

      setCurrentUser(user);
      logAction('Pengguna Masuk (Login)', `User ${user.name} (${user.role.toUpperCase()})`);
      return true;
    }

    return false;
  };

  const logout = () => {
    if (currentUser) {
      logAction('Pengguna Keluar (Logout)', `User ${currentUser.name}`);
    }
    setCurrentUser(null);
  };

  const switchRole = (role: UserRole, specificEmailOrId?: string) => {
    if (specificEmailOrId) {
      switchUser(specificEmailOrId);
      return;
    }

    // If role is doctor and current user is already a doctor, keep current doctor!
    if (role === 'dokter' && currentUser?.role === 'dokter') {
      return;
    }

    if (role === 'dokter') {
      const firstDoc = doctors[0];
      if (firstDoc) {
        switchUser(firstDoc.email);
        return;
      }
    }

    const matched = users.find(u => u.role === role) || INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[0];
    setCurrentUser(matched);
    logAction('Ganti Peran / Akun Demo', `Beralih ke peran ${role.toUpperCase()} (${matched.name})`);
  };

  const switchUser = (userIdOrEmail: string) => {
    const clean = userIdOrEmail.trim().toLowerCase();
    let matchedUser =
      users.find(u => u.id === userIdOrEmail || u.email.toLowerCase() === clean || u.name.toLowerCase() === clean);

    if (!matchedUser) {
      const matchedDoc = doctors.find(
        d =>
          d.id === userIdOrEmail ||
          d.email.toLowerCase() === clean ||
          d.name.toLowerCase() === clean ||
          d.name.toLowerCase().replace(/[^a-z]/g, '').includes(clean.replace(/[^a-z]/g, ''))
      );
      if (matchedDoc) {
        matchedUser = users.find(
          u =>
            u.email.toLowerCase() === matchedDoc.email.toLowerCase() ||
            u.name.toLowerCase() === matchedDoc.name.toLowerCase()
        );
      }
    }

    if (matchedUser) {
      setCurrentUser(matchedUser);
      logAction('Ganti Akun Pengguna', `Beralih ke akun ${matchedUser.name} (${matchedUser.role.toUpperCase()})`);
    }
  };

  // User Management
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setUsers(prev => [newUser, ...prev]);
    logAction('Tambah Pengguna Baru', `${newUser.name} (${newUser.role})`);
    addNotification('👤 Pengguna Baru Ditambahkan', `Akun untuk ${newUser.name} (${newUser.role.toUpperCase()}) berhasil dibuat.`, 'system', 'pengguna');
    return newUser;
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...data } : prev);
    }
    logAction('Update Data Pengguna', `User ID: ${id}`);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    logAction('Hapus Pengguna', `User ID: ${id}`);
  };

  const resetUserPassword = (id: string, customPassword?: string): string => {
    const user = users.find(u => u.id === id);
    const newPass = customPassword && customPassword.trim() ? customPassword.trim() : `GlowCare@${new Date().getFullYear()}`;

    // Save password directly to user object in state and localStorage
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, password: newPass } : u)));

    // Update currentUser if matching
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => (prev ? { ...prev, password: newPass } : null));
    }

    logAction('Reset Sandi Pengguna', `User: ${user?.name || id} (Password Baru Berhasil Disimpan)`);
    addNotification(
      '🔑 Kata Sandi Pengguna Diperbarui',
      `Kata sandi baru untuk pengguna ${user?.name || id} berhasil dibuat dan disimpan langsung ke sistem.`,
      'system',
      'pengguna'
    );
    return newPass;
  };

  // Patients
  const addPatient = (patientData: Omit<Patient, 'id' | 'totalVisits' | 'createdAt'>): Patient => {
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      totalVisits: 1,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setPatients(prev => [newPatient, ...prev]);
    logAction('Pendaftaran Pasien Baru', `${newPatient.name} (${newPatient.rmNumber})`);
    return newPatient;
  };

  const updatePatient = (id: string, data: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    logAction('Ubah Data Pasien', `ID: ${id}`);
  };

  const deletePatient = (id: string) => {
    const pat = patients.find(p => p.id === id);
    setPatients(prev => prev.filter(p => p.id !== id));
    logAction('Hapus Pasien', pat ? `${pat.name} (${pat.rmNumber})` : id);
    addNotification('🗑️ Pasien Dihapus', `Data pasien ${pat ? pat.name : id} telah dihapus dari sistem.`, 'system', 'pasien');
  };

  const deleteMultiplePatients = (ids: string[]) => {
    const count = ids.length;
    setPatients(prev => prev.filter(p => !ids.includes(p.id)));
    logAction('Hapus Massal Pasien', `Menghapus ${count} pasien terpilih`);
    addNotification('🗑️ Hapus Massal Pasien', `${count} data pasien berhasil dihapus secara bersamaan.`, 'system', 'pasien');
  };

  // Doctors
  const addDoctor = (doctorData: Omit<Doctor, 'id' | 'totalPatients'>) => {
    const newDoc: Doctor = {
      ...doctorData,
      id: `doc-${Date.now()}`,
      totalPatients: 0
    };
    setDoctors(prev => [...prev, newDoc]);

    // Automatically create a login user account for this doctor
    const docEmail = newDoc.email || `${newDoc.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@glowcare.test`;
    const newUser: User = {
      id: `usr-${newDoc.id.replace('doc-', 'docusr-')}`,
      name: newDoc.name,
      email: docEmail,
      role: 'dokter',
      avatar: newDoc.avatar,
      phone: newDoc.phone,
      department: newDoc.specialization,
      status: 'active',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setUsers(prev => {
      const exists = prev.some(
        u => u.email.toLowerCase() === docEmail.toLowerCase() || u.name.toLowerCase() === newDoc.name.toLowerCase()
      );
      return exists ? prev : [...prev, newUser];
    });

    logAction('Tambah Data Dokter & Akun Login', `${newDoc.name} (${docEmail})`);
    addNotification('🩺 Akun Dokter Baru Dibuat', `Akun dokter ${newDoc.name} telah dibuat dan siap untuk login mandiri.`, 'system', 'dokter');
  };

  const updateDoctor = (id: string, data: Partial<Doctor>) => {
    const doc = doctors.find(d => d.id === id);
    setDoctors(prev => prev.map(d => (d.id === id ? { ...d, ...data } : d)));
    if (doc) {
      setUsers(prev =>
        prev.map(u => {
          if (
            u.email.toLowerCase() === doc.email.toLowerCase() ||
            u.name.toLowerCase() === doc.name.toLowerCase()
          ) {
            return {
              ...u,
              ...(data.name ? { name: data.name } : {}),
              ...(data.email ? { email: data.email } : {}),
              ...(data.avatar ? { avatar: data.avatar } : {}),
              ...(data.phone ? { phone: data.phone } : {}),
              ...(data.specialization ? { department: data.specialization } : {})
            };
          }
          return u;
        })
      );
      if (
        currentUser &&
        (currentUser.email.toLowerCase() === doc.email.toLowerCase() ||
          currentUser.name.toLowerCase() === doc.name.toLowerCase())
      ) {
        setCurrentUser(prev =>
          prev
            ? {
                ...prev,
                ...(data.name ? { name: data.name } : {}),
                ...(data.email ? { email: data.email } : {}),
                ...(data.avatar ? { avatar: data.avatar } : {}),
                ...(data.specialization ? { department: data.specialization } : {})
              }
            : prev
        );
      }
    }
    logAction('Ubah Data Dokter', `ID: ${id}`);
  };

  const deleteDoctor = (id: string) => {
    const doc = doctors.find(d => d.id === id);
    setDoctors(prev => prev.filter(d => d.id !== id));
    if (doc) {
      setUsers(prev =>
        prev.filter(
          u =>
            u.email.toLowerCase() !== doc.email.toLowerCase() &&
            u.name.toLowerCase() !== doc.name.toLowerCase()
        )
      );
    }
    logAction('Hapus Dokter', doc ? doc.name : id);
    addNotification('🗑️ Dokter Dihapus', `Data dokter ${doc ? doc.name : id} telah dihapus dari sistem.`, 'system', 'dokter');
  };

  const deleteMultipleDoctors = (ids: string[]) => {
    const count = ids.length;
    const targetDocs = doctors.filter(d => ids.includes(d.id));
    const targetEmails = new Set(targetDocs.map(d => d.email.toLowerCase()));
    const targetNames = new Set(targetDocs.map(d => d.name.toLowerCase()));

    setDoctors(prev => prev.filter(d => !ids.includes(d.id)));
    setUsers(prev =>
      prev.filter(
        u => !targetEmails.has(u.email.toLowerCase()) && !targetNames.has(u.name.toLowerCase())
      )
    );

    logAction('Hapus Massal Dokter', `Menghapus ${count} dokter terpilih`);
    addNotification('🗑️ Hapus Massal Dokter', `${count} data dokter berhasil dihapus.`, 'system', 'dokter');
  };

  // Nurses
  const addNurse = (nurseData: Omit<Nurse, 'id'>) => {
    const newNurse: Nurse = {
      ...nurseData,
      id: `nur-${Date.now()}`
    };
    setNurses(prev => [...prev, newNurse]);
    logAction('Tambah Data Perawat', newNurse.name);
  };

  const updateNurse = (id: string, data: Partial<Nurse>) => {
    setNurses(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));
    logAction('Ubah Data Perawat', `ID: ${id}`);
  };

  const deleteNurse = (id: string) => {
    const nurse = nurses.find(n => n.id === id);
    setNurses(prev => prev.filter(n => n.id !== id));
    logAction('Hapus Perawat', nurse ? nurse.name : id);
    addNotification('🗑️ Perawat Dihapus', `Data perawat ${nurse ? nurse.name : id} telah dihapus dari sistem.`, 'system', 'perawat');
  };

  const deleteMultipleNurses = (ids: string[]) => {
    const count = ids.length;
    setNurses(prev => prev.filter(n => !ids.includes(n.id)));
    logAction('Hapus Massal Perawat', `Menghapus ${count} perawat terpilih`);
    addNotification('🗑️ Hapus Massal Perawat', `${count} data perawat berhasil dihapus.`, 'system', 'perawat');
  };

  // Treatments
  const addTreatment = (treatmentData: Omit<Treatment, 'id'>) => {
    const newTreatment: Treatment = {
      ...treatmentData,
      id: `trt-${Date.now()}`
    };
    setTreatments(prev => [...prev, newTreatment]);
    logAction('Tambah Menu Treatment', newTreatment.name);
  };

  const updateTreatment = (id: string, data: Partial<Treatment>) => {
    setTreatments(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    logAction('Ubah Data Treatment', `ID: ${id}`);
  };

  const deleteTreatment = (id: string) => {
    const t = treatments.find(item => item.id === id);
    setTreatments(prev => prev.filter(item => item.id !== id));
    logAction('Hapus Treatment', t ? t.name : id);
    addNotification('🗑️ Layanan Treatment Dihapus', `Layanan treatment ${t ? t.name : id} telah dihapus.`, 'system', 'treatment');
  };

  const deleteMultipleTreatments = (ids: string[]) => {
    const count = ids.length;
    setTreatments(prev => prev.filter(item => !ids.includes(item.id)));
    logAction('Hapus Massal Treatment', `Menghapus ${count} treatment terpilih`);
    addNotification('🗑️ Hapus Massal Treatment', `${count} layanan treatment berhasil dihapus.`, 'system', 'treatment');
  };

  // Products
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prodData,
      id: `prd-${Date.now()}`
    };
    setProducts(prev => [...prev, newProd]);
    logAction('Tambah Produk Skincare', newProd.name);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    logAction('Ubah Data Produk', `ID: ${id}`);
  };

  const deleteProduct = (id: string) => {
    const p = products.find(prod => prod.id === id);
    setProducts(prev => prev.filter(prod => prod.id !== id));
    logAction('Hapus Produk', p ? p.name : id);
  };

  // Queues
  const addQueueItem = (item: Omit<QueueItem, 'id' | 'queueNumber'>): QueueItem => {
    const count = queues.length + 1;
    const queueNumber = `A${String(count).padStart(3, '0')}`;
    const newQueue: QueueItem = {
      ...item,
      id: `que-${Date.now()}`,
      queueNumber
    };
    setQueues(prev => [...prev, newQueue]);
    logAction('Buat Antrian Baru', `Nomor ${queueNumber} (${item.patientName})`);
    addNotification('🔔 Nomor Antrian Dibuat', `Antrian ${queueNumber} (${item.patientName}) telah dibuat.`, 'queue', 'antrian');
    return newQueue;
  };

  const updateQueueStatus = (id: string, status: QueueStatus) => {
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setQueues(prev => prev.map(q => {
      if (q.id === id) {
        const updated: QueueItem = { ...q, status };
        if (status === 'Dipanggil') updated.calledAt = nowTime;
        if (status === 'Sedang Dilayani') updated.servedAt = nowTime;
        if (status === 'Selesai') updated.completedAt = nowTime;
        return updated;
      }
      return q;
    }));
    logAction('Ubah Status Antrian', `Antrian ID: ${id} → ${status}`);
  };

  const callQueue = (queueItem: QueueItem) => {
    updateQueueStatus(queueItem.id, 'Dipanggil');
    // Announce using speech synthesis if available
    try {
      if ('speechSynthesis' in window) {
        const text = `Nomor antrian ${queueItem.queueNumber}, silakan menuju ${queueItem.counterRoom || 'ruang konsultasi'}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Speech fallback silently
    }
    logAction('Panggil Pasien di Pengeras Suara', `Nomor ${queueItem.queueNumber} (${queueItem.patientName})`);
  };

  const deleteQueue = (id: string) => {
    const q = queues.find(item => item.id === id);
    setQueues(prev => prev.filter(item => item.id !== id));
    logAction('Hapus Antrian', q ? `Nomor ${q.queueNumber} (${q.patientName})` : id);
    addNotification('🗑️ Antrian Dihapus', `Data antrian ${q ? `${q.queueNumber} (${q.patientName})` : id} telah dihapus.`, 'queue', 'antrian');
  };

  const deleteMultipleQueues = (ids: string[]) => {
    const count = ids.length;
    setQueues(prev => prev.filter(item => !ids.includes(item.id)));
    logAction('Hapus Massal Antrian', `Menghapus ${count} antrian terpilih`);
    addNotification('🗑️ Hapus Massal Antrian', `${count} nomor antrian berhasil dihapus secara bersamaan.`, 'queue', 'antrian');
  };

  // Appointments
  const addAppointment = (aptData: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAppointments(prev => [newApt, ...prev]);
    logAction('Jadwalkan Appointment', `${newApt.patientName} - ${newApt.treatmentName} (${newApt.date} ${newApt.time})`);
    addNotification('🔔 Appointment Baru Telah Dibuat', `${newApt.patientName} menjadwalkan ${newApt.treatmentName} pada ${newApt.date} pukul ${newApt.time}.`, 'appointment', 'appointment');
    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    logAction('Ubah Status Appointment', `ID: ${id} → ${status}`);
  };

  // Registrations
  const addRegistration = (regData: Omit<Registration, 'id' | 'regNumber'>): Registration => {
    const count = registrations.length + 1;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const regNumber = `REG-${dateStr}-${String(count).padStart(3, '0')}`;
    const newReg: Registration = {
      ...regData,
      id: `reg-${Date.now()}`,
      regNumber
    };
    setRegistrations(prev => [newReg, ...prev]);
    logAction('Pendaftaran Pasien di Loket', `${newReg.regNumber} - ${newReg.patientName}`);
    return newReg;
  };

  const deleteRegistration = (id: string) => {
    const reg = registrations.find(r => r.id === id);
    setRegistrations(prev => prev.filter(r => r.id !== id));
    logAction('Hapus Data Registrasi', reg ? `${reg.regNumber} (${reg.patientName})` : id);
    addNotification('🗑️ Registrasi Dihapus', `Data pendaftaran ${reg ? reg.regNumber : id} telah dihapus.`, 'system', 'pendaftaran');
  };

  const deleteMultipleRegistrations = (ids: string[]) => {
    const count = ids.length;
    setRegistrations(prev => prev.filter(r => !ids.includes(r.id)));
    logAction('Hapus Massal Registrasi', `Menghapus ${count} pendaftaran terpilih`);
    addNotification('🗑️ Hapus Massal Registrasi', `${count} data pendaftaran berhasil dihapus.`, 'system', 'pendaftaran');
  };

  // Medical Records
  const addMedicalRecord = (recordData: Omit<MedicalRecord, 'id'>): MedicalRecord => {
    const newRecord: MedicalRecord = {
      ...recordData,
      id: `mr-${Date.now()}`
    };
    setMedicalRecords(prev => [newRecord, ...prev]);

    // Update patient total visits and last visit date
    setPatients(prev => prev.map(p => {
      if (p.id === newRecord.patientId) {
        return {
          ...p,
          totalVisits: (p.totalVisits || 0) + 1,
          lastVisit: newRecord.date
        };
      }
      return p;
    }));

    // Generate pending payment invoice automatically for cashier
    const count = payments.length + 81;
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const invoiceNumber = `INV/GC/${year}/${month}/${String(count).padStart(4, '0')}`;
    
    // Find treatment price
    const trt = treatments.find(t => t.id === newRecord.treatmentId);
    const price = trt ? trt.price : 250000;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      invoiceNumber,
      patientId: newRecord.patientId,
      patientName: newRecord.patientName,
      patientRm: newRecord.patientRm,
      treatmentId: newRecord.treatmentId,
      treatmentName: newRecord.treatmentName,
      treatmentPrice: price,
      subtotal: price,
      discount: 0,
      tax: 0,
      totalAmount: price,
      status: 'Belum Dibayar',
      cashierName: 'Loket / Kasir GlowCare'
    };
    setPayments(prev => [newPayment, ...prev]);

    logAction('Simpan Rekam Perawatan Pasien', `${newRecord.patientName} (${newRecord.treatmentName})`);
    addNotification('🔔 Treatment Telah Selesai', `${newRecord.doctorName} telah mencatat rekam perawatan ${newRecord.patientName}. Tagihan siap di kasir.`, 'treatment', 'pembayaran');

    return newRecord;
  };

  const updateMedicalRecord = (id: string, data: Partial<MedicalRecord>) => {
    setMedicalRecords(prev => prev.map(m => (m.id === id ? { ...m, ...data } : m)));
    const rec = medicalRecords.find(m => m.id === id);
    logAction('Ubah Rekam Perawatan', rec ? `${rec.patientName} (${rec.patientRm})` : id);
    addNotification('✏️ Rekam Perawatan Diperbarui', `Data rekam medis perawatan ${rec ? rec.patientName : id} telah diperbarui.`, 'treatment', 'rekam-perawatan');
  };

  const deleteMedicalRecord = (id: string) => {
    const rec = medicalRecords.find(m => m.id === id);
    setMedicalRecords(prev => prev.filter(m => m.id !== id));
    logAction('Hapus Rekam Perawatan', rec ? `${rec.patientName} (${rec.patientRm})` : id);
    addNotification('🗑️ Rekam Perawatan Dihapus', `Data rekam medis perawatan ${rec ? rec.patientName : id} telah dihapus dari sistem.`, 'system', 'rekam-perawatan');
  };

  // Payments
  const addPayment = (paymentData: Omit<Payment, 'id' | 'invoiceNumber'>): Payment => {
    const count = payments.length + 81;
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const invoiceNumber = `INV/GC/${year}/${month}/${String(count).padStart(4, '0')}`;

    const newPay: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      invoiceNumber,
      createdAt: new Date().toISOString()
    };
    setPayments(prev => [newPay, ...prev]);
    logAction('Proses Pembayaran Pasien', `${newPay.invoiceNumber} - ${newPay.patientName}`);
    return newPay;
  };

  const updatePaymentStatus = (id: string, status: PaymentStatus, method?: any) => {
    setPayments(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status,
          paymentMethod: method || p.paymentMethod || 'Cash',
          paidAt: status === 'Lunas' ? new Date().toISOString().replace('T', ' ').substring(0, 19) : p.paidAt
        };
      }
      return p;
    }));
    logAction('Pembaruan Status Pembayaran', `Tagihan ID: ${id} → ${status}`);
  };

  const updatePayment = (id: string, updates: Partial<Payment>) => {
    setPayments(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    }));
    logAction('Pembaruan Data Pembayaran', `Tagihan ID: ${id}`);
  };

  const updatePaymentMethod = (
    id: string,
    method: PaymentMethod,
    details?: {
      referenceNumber?: string;
      notes?: string;
      status?: PaymentStatus;
      paymentChannelName?: string;
      discount?: number;
      totalAmount?: number;
    }
  ) => {
    let invoiceInfo = '';
    setPayments(prev => prev.map(p => {
      if (p.id === id) {
        invoiceInfo = `${p.invoiceNumber} (${p.patientName})`;
        const newStatus = details?.status || p.status;
        const newDiscount = details?.discount !== undefined ? details.discount : p.discount;
        const baseSubtotal = p.subtotal || p.treatmentPrice;
        const newTotal = details?.totalAmount !== undefined ? details.totalAmount : Math.max(0, baseSubtotal - newDiscount);

        return {
          ...p,
          paymentMethod: method,
          paymentChannelName: details?.paymentChannelName || p.paymentChannelName,
          referenceNumber: details?.referenceNumber !== undefined ? details.referenceNumber : p.referenceNumber,
          notes: details?.notes !== undefined ? details.notes : p.notes,
          status: newStatus,
          discount: newDiscount,
          totalAmount: newTotal,
          paidAt: (newStatus === 'Lunas' && !p.paidAt) ? new Date().toISOString().replace('T', ' ').substring(0, 19) : p.paidAt
        };
      }
      return p;
    }));
    logAction('Ubah Metode Pembayaran', `${invoiceInfo || id} → Metode: ${method}`);
    addNotification(
      '💳 Metode Pembayaran Diperbarui',
      `Metode bayar untuk ${invoiceInfo || id} berhasil diubah ke ${method}.`,
      'payment',
      'pembayaran'
    );
  };

  const deletePayment = (id: string) => {
    const pay = payments.find(p => p.id === id);
    setPayments(prev => prev.filter(p => p.id !== id));
    logAction('Hapus Data Pembayaran', pay ? `${pay.invoiceNumber} (${pay.patientName})` : id);
    addNotification(
      '🗑️ Faktur Tagihan Dihapus',
      `Faktur pembayaran ${pay ? pay.invoiceNumber : id} telah dihapus dari sistem kasir.`,
      'payment',
      'pembayaran'
    );
  };

  const deleteMultiplePayments = (ids: string[]) => {
    const count = ids.length;
    setPayments(prev => prev.filter(p => !ids.includes(p.id)));
    logAction('Hapus Massal Pembayaran', `Menghapus ${count} faktur tagihan kasir terpilih`);
    addNotification(
      '🗑️ Hapus Massal Pembayaran',
      `${count} faktur tagihan kasir berhasil dihapus dari sistem.`,
      'payment',
      'pembayaran'
    );
  };

  const addPaymentChannel = (channelData: Omit<PaymentChannel, 'id'>) => {
    const newChannel: PaymentChannel = {
      ...channelData,
      id: `ch-${Date.now()}`
    };
    setPaymentChannels(prev => [...prev, newChannel]);
    logAction('Tambah Saluran Pembayaran', `${newChannel.name} (${newChannel.type})`);
  };

  const updatePaymentChannel = (id: string, updates: Partial<PaymentChannel>) => {
    setPaymentChannels(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    logAction('Update Saluran Pembayaran', `Channel ID: ${id}`);
  };

  const deletePaymentChannel = (id: string) => {
    setPaymentChannels(prev => prev.filter(c => c.id !== id));
    logAction('Hapus Saluran Pembayaran', `Channel ID: ${id}`);
  };

  // Ratings
  const addRatingComment = (reviewData: Omit<PatientRatingComment, 'id' | 'date' | 'status'>) => {
    const newRating: PatientRatingComment = {
      ...reviewData,
      id: `rat-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Menunggu' // Default moderation status
    };
    setRatings(prev => [newRating, ...prev]);
    logAction('Ulasan & Rating Baru dari Pasien', `${newRating.patientName} - Rating ${newRating.overallRating} Bintang`);
    addNotification('🔔 Ada Komentar Baru dari Pasien', `${newRating.patientName} mengirimkan ulasan baru untuk ${newRating.treatmentName}.`, 'review', 'komentar');
  };

  const updateRatingStatus = (id: string, status: CommentStatus, adminNotes?: string) => {
    setRatings(prev => prev.map(r => r.id === id ? { ...r, status, adminNotes: adminNotes || r.adminNotes } : r));
    logAction('Moderasi Ulasan Pasien', `Ulasan ID: ${id} → ${status}`);
  };

  const replyToReview = (id: string, clinicResponse: string) => {
    setRatings(prev => prev.map(r => r.id === id ? { ...r, clinicResponse } : r));
    logAction('Balas Komentar Pasien', `Ulasan ID: ${id}`);
  };

  // Notifications
  const markNotifAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Settings
  const updateSettings = (newSettings: Partial<ClinicSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    logAction('Pembaruan Pengaturan Klinik', 'Profil & Konfigurasi Sistem');
  };

  // Neon PostgreSQL Integration
  const [neonConfig, setNeonConfig] = useState<NeonConfig>(() => getStoredNeonConfig());

  const updateNeonConfig = (newConfig: Partial<NeonConfig>) => {
    setNeonConfig(prev => {
      const updated = { ...prev, ...newConfig };
      saveStoredNeonConfig(updated);
      return updated;
    });
  };

  const testNeon = async (customConn?: string) => {
    const conn = customConn !== undefined ? customConn : neonConfig.connectionString;
    const res = await testNeonConnection(conn);
    if (res.success) {
      updateNeonConfig({
        isConnected: true,
        latencyMs: res.latencyMs,
        pgVersion: res.pgVersion,
        databaseName: res.databaseName
      });
      logAction('Koneksi Neon Database Berhasil', `DB: ${res.databaseName || 'neondb'} (${res.latencyMs}ms)`);
    } else {
      updateNeonConfig({ isConnected: false });
    }
    return res;
  };

  const initNeonDatabase = async () => {
    if (!neonConfig.connectionString) {
      return { success: false, message: 'Harap masukkan Connection String Neon terlebih dahulu.' };
    }
    const res = await initializeNeonSchema(neonConfig.connectionString);
    if (res.success) {
      updateNeonConfig({ isConnected: true });
      logAction('Inisialisasi Tabel Neon Database', '15 Tabel Relasional Terbuat');
    }
    return res;
  };

  const pushDataToNeon = async () => {
    if (!neonConfig.connectionString) {
      return { success: false, message: 'Harap konfigurasi Connection String Neon terlebih dahulu.' };
    }
    const res = await pushAllDataToNeon(neonConfig.connectionString, {
      users,
      patients,
      doctors,
      nurses,
      treatments,
      products,
      queues,
      appointments,
      registrations,
      medicalRecords,
      payments,
      paymentChannels,
      ratings,
      settings
    });
    if (res.success) {
      const now = new Date().toLocaleString('id-ID');
      updateNeonConfig({ lastSyncTime: now, isConnected: true });
      logAction('Sinkronisasi Data ke Neon', 'Semua Data Terkirim ke PostgreSQL');
    }
    return res;
  };

  const pullDataFromNeon = async () => {
    if (!neonConfig.connectionString) {
      return { success: false, message: 'Harap konfigurasi Connection String Neon terlebih dahulu.' };
    }
    const res = await pullAllDataFromNeon(neonConfig.connectionString);
    if (res.success && res.data) {
      if (res.data.patients && res.data.patients.length > 0) {
        setPatients(res.data.patients);
        saveStorage('patients', res.data.patients);
      }
      if (res.data.queues && res.data.queues.length > 0) {
        setQueues(res.data.queues);
        saveStorage('queues', res.data.queues);
      }
      if (res.data.medicalRecords && res.data.medicalRecords.length > 0) {
        setMedicalRecords(res.data.medicalRecords);
        saveStorage('medicalRecords', res.data.medicalRecords);
      }
      if (res.data.payments && res.data.payments.length > 0) {
        setPayments(res.data.payments);
        saveStorage('payments', res.data.payments);
      }
      const now = new Date().toLocaleString('id-ID');
      updateNeonConfig({ lastSyncTime: now, isConnected: true });
      logAction('Tarik Data dari Neon', 'Data Diperbarui dari PostgreSQL');
    }
    return res;
  };

  // Modal manager
  const openModal = (modalName: string, data: any = null) => {
    setCurrentModal(modalName);
    setModalData(data);
  };

  const closeModal = () => {
    setCurrentModal(null);
    setModalData(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentDoctor,
        isMyDoctorData,
        login,
        logout,
        switchRole,
        switchUser,
        users,
        addUser,
        updateUser,
        deleteUser,
        resetUserPassword,
        patients,
        addPatient,
        updatePatient,
        deletePatient,
        deleteMultiplePatients,
        doctors,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        deleteMultipleDoctors,
        nurses,
        addNurse,
        updateNurse,
        deleteNurse,
        deleteMultipleNurses,
        treatments,
        addTreatment,
        updateTreatment,
        deleteTreatment,
        deleteMultipleTreatments,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        queues,
        addQueueItem,
        updateQueueStatus,
        callQueue,
        deleteQueue,
        deleteMultipleQueues,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        registrations,
        addRegistration,
        deleteRegistration,
        deleteMultipleRegistrations,
        medicalRecords,
        addMedicalRecord,
        updateMedicalRecord,
        deleteMedicalRecord,
        payments,
        addPayment,
        updatePaymentStatus,
        updatePayment,
        deletePayment,
        deleteMultiplePayments,
        updatePaymentMethod,
        paymentChannels,
        addPaymentChannel,
        updatePaymentChannel,
        deletePaymentChannel,
        ratings,
        addRatingComment,
        updateRatingStatus,
        replyToReview,
        activityLogs,
        notifications,
        markNotifAsRead,
        markAllNotifsRead,
        settings,
        updateSettings,
        neonConfig,
        updateNeonConfig,
        testNeon,
        initNeonDatabase,
        pushDataToNeon,
        pullDataFromNeon,
        currentModal,
        modalData,
        openModal,
        closeModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
