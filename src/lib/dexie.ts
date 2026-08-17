import Dexie, { type Table } from 'dexie';

export interface IHalaqahLocal {
  _id: string;
  tenantId: string;
  guruId: string;
  name: string;
  createdAt: Date;
}

export interface IMutabaahDailyLocal {
  _id: string; // generate UUID if created offline, else mongo _id
  tenantId: string;
  studentId: string;
  guruId: string;
  tanggal: Date;
  presensi: { dzikirPagiPetang: boolean; matanTuhfahJazari: boolean };
  ziyadah: {
    hasSetoran: boolean;
    juz?: number;
    halamanDari?: string;
    halamanKe?: string;
    nilaiKelancaran?: string;
    talaqqiTakrir: boolean;
    talaqqiCount?: number;
    binNadzorComplete: boolean;
    binNadzorJuz?: number;
    binNadzorHalamanDari?: string;
    binNadzorHalamanKe?: string;
  };
  murojaahPartner: {
    isCompleted: boolean;
    juz?: number;
    halamanDari?: string;
    halamanKe?: string;
  };
  tatsbit: {
    isCompleted: boolean;
    juz?: number;
    halamanDari?: string;
    halamanKe?: string;
    nilai?: string;
  };
  offlineSync: {
    isSynced: boolean;
    updatedAt: Date;
  };
}

export interface IQuoteLocal {
  _id: string;
  text: string;
  verseRef: string;
  verseText: string;
  verseTranslation: string;
  authorId: string;
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentLocal {
  _id: string;
  tenantId: string;
  userId?: string;
  halaqahId?: string;
  nama: string;
  tingkatanTartil: string;
  partnerId?: string;
  totalJuzHafal: number;
  isActive: boolean;
}

export interface ITenantLocal {
  _id: string;
  name: string;
  slug: string;
  code: string;
  status: string;
  setting: {
    maxStudents: number;
    themeColor: string;
    period: string;
  };
  createdAt: Date;
}

export interface IUserLocal {
  _id: string;
  tenantId?: string;
  email: string;
  name: string;
  role: string;
  googleId?: string;
  avatar?: string;
  createdAt: Date;
}

export interface ISyncQueueItem {
  id?: number; // Auto-increment primary key
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  collection: 'Halaqah' | 'MutabaahDaily' | 'Quote' | 'Student' | 'Tenant' | 'User';
  payload: any;
  createdAt: Date;
}

export interface ISessionLocal {
  id: string; // 'current_session'
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    tenantId?: string;
    avatar?: string;
  };
  expires: string;
  lastSync?: Date;
}

export class AppDatabase extends Dexie {
  users!: Table<IUserLocal, string>;
  tenants!: Table<ITenantLocal, string>;
  halaqahs!: Table<IHalaqahLocal, string>;
  students!: Table<IStudentLocal, string>;
  mutabaahs!: Table<IMutabaahDailyLocal, string>;
  quotes!: Table<IQuoteLocal, string>;
  syncQueue!: Table<ISyncQueueItem, number>;
  session!: Table<ISessionLocal, string>;

  constructor() {
    super('JazQuranDB');
    this.version(1).stores({
      users: '_id, email, tenantId, role',
      tenants: '_id, slug, code',
      halaqahs: '_id, tenantId, guruId',
      students: '_id, tenantId, halaqahId, userId',
      mutabaahs: '_id, tenantId, studentId, guruId, tanggal, offlineSync.isSynced',
      quotes: '_id, authorId',
      syncQueue: '++id, action, collection',
      session: 'id',
    });
  }
}

export const db = new AppDatabase();
