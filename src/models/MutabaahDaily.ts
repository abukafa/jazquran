import mongoose, { Schema, Document } from "mongoose";

export interface IMutabaahDaily extends Document {
  tenantId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  guruId: mongoose.Types.ObjectId;
  tanggal: Date;
  presensi: {
    dzikirPagiPetang: boolean;
    matanTuhfahJazari: boolean;
  };
  ziyadah: {
    hasSetoran: boolean;
    juz?: number;
    halamanDari?: string;
    halamanKe?: string;
    nilaiKelancaran?: "A+" | "A" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D";
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
    nilai?: "A+" | "A" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D";
  };
  offlineSync: {
    isSynced: boolean;
    updatedAt: Date;
  };
}

const MutabaahDailySchema = new Schema<IMutabaahDaily>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  guruId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tanggal: { type: Date, required: true },
  presensi: {
    dzikirPagiPetang: { type: Boolean, default: false },
    matanTuhfahJazari: { type: Boolean, default: false },
  },
  ziyadah: {
    hasSetoran: { type: Boolean, default: false },
    juz: { type: Number },
    halamanDari: { type: String },
    halamanKe: { type: String },
    nilaiKelancaran: { type: String, enum: ["A+", "A", "B+", "B", "B-", "C+", "C", "C-", "D"] },
    talaqqiTakrir: { type: Boolean, default: false },
    talaqqiCount: { type: Number },
    binNadzorComplete: { type: Boolean, default: false },
    binNadzorJuz: { type: Number },
    binNadzorHalamanDari: { type: String },
    binNadzorHalamanKe: { type: String },
  },
  murojaahPartner: {
    isCompleted: { type: Boolean, default: false },
    juz: { type: Number },
    halamanDari: { type: String },
    halamanKe: { type: String },
  },
  tatsbit: {
    isCompleted: { type: Boolean, default: false },
    juz: { type: Number },
    halamanDari: { type: String },
    halamanKe: { type: String },
    nilai: { type: String, enum: ["A+", "A", "B+", "B", "B-", "C+", "C", "C-", "D"] },
  },
  offlineSync: {
    isSynced: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now },
  },
});

export const MutabaahDaily = mongoose.models.MutabaahDaily || mongoose.model<IMutabaahDaily>("MutabaahDaily", MutabaahDailySchema);
