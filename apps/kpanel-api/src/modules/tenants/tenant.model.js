/**
 * Tenant (organization) model.
 * Every site, user, and content is scoped to a tenant for multi-tenancy.
 */
import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    /** Optional: Stripe or other billing customer ID */
    billingCustomerId: { type: String, default: null },
    /** Plan / license tier (e.g. free, pro, enterprise) */
    plan: { type: String, default: 'free', enum: ['free', 'starter', 'pro', 'enterprise'] },
    /** Feature flags or limits (sites count, etc.) */
    limits: {
      sites: { type: Number, default: 5 },
      users: { type: Number, default: 3 },
    },
    /** Tenant-level settings (timezone, branding, etc.) */
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

tenantSchema.index({ active: 1 });

export const Tenant = mongoose.model('Tenant', tenantSchema);
