import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  tenantId?: mongoose.Types.ObjectId; // Optional because super-admin might not belong to one tenant
  email: string;
  name: string;
  role: "super-admin" | "admin-tenant" | "guru" | "murid";
  googleId?: string;
  avatar?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["super-admin", "admin-tenant", "guru", "murid"], required: true },
  googleId: { type: String },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
