import mongoose, { Schema, Document } from "mongoose";

export interface ITenant extends Document {
  name: string;
  slug: string;
  code: string; // Tenant Code for Onboarding
  status: "active" | "suspended";
  setting: {
    maxStudents: number;
    themeColor: string;
    period: string;
  };
  createdAt: Date;
}

const TenantSchema = new Schema<ITenant>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  status: { type: String, enum: ["active", "suspended"], default: "active" },
  setting: {
    maxStudents: { type: Number, default: 200 },
    themeColor: { type: String, default: "#10b981" },
    period: { type: String, default: "Semester Ganjil 2025/2026" },
  },
  createdAt: { type: Date, default: Date.now },
});

export const Tenant =
  mongoose.models.Tenant || mongoose.model<ITenant>("Tenant", TenantSchema);
