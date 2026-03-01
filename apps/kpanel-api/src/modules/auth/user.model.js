/**
 * User model. Users belong to one or more tenants (via membership).
 * For simplicity we support one tenant per user; can extend to many later.
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, trim: true },
    /** Tenant this user belongs to */
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    role: { type: String, default: 'member', enum: ['owner', 'admin', 'member', 'viewer'] },
    /** When true, user can access /api/v1/admin and see all tenants/sites (platform admin) */
    isPlatformAdmin: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
