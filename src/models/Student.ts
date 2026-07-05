import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  halaqahId?: mongoose.Types.ObjectId; // Nullable until assigned
  nama: string;
  tingkatanTartil: "Awal" | "Menengah" | "Akhir";
  partnerId?: mongoose.Types.ObjectId;
  totalJuzHafal: number;
  isActive: boolean;
}

const StudentSchema = new Schema<IStudent>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  halaqahId: { type: Schema.Types.ObjectId, ref: 'Halaqah' },
  nama: { type: String, required: true },
  tingkatanTartil: { type: String, enum: ["Awal", "Menengah", "Akhir"], default: "Awal" },
  partnerId: { type: Schema.Types.ObjectId, ref: 'Student' },
  totalJuzHafal: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

export const Student = mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
