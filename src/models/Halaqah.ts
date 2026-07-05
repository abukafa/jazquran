import mongoose, { Schema, Document } from "mongoose";

export interface IHalaqah extends Document {
  tenantId: mongoose.Types.ObjectId;
  guruId: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
}

const HalaqahSchema = new Schema<IHalaqah>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  guruId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Halaqah = mongoose.models.Halaqah || mongoose.model<IHalaqah>("Halaqah", HalaqahSchema);
