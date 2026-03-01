/**
 * License / subscription model. Links a tenant to a plan and optional payment.
 * Used for feature gating and limits.
 */
import mongoose from 'mongoose';

const licenseSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    /** Plan identifier (free, starter, pro, enterprise) */
    planId: { type: String, required: true },
    /** Optional: Stripe subscription ID */
    stripeSubscriptionId: { type: String, default: null },
    /** Optional: Stripe price ID */
    stripePriceId: { type: String, default: null },
    status: { type: String, default: 'active', enum: ['active', 'canceled', 'past_due', 'trialing'] },
    currentPeriodStart: { type: Date, default: null },
    currentPeriodEnd: { type: Date, default: null },
    /** Feature flags or limits override */
    features: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

licenseSchema.index({ tenantId: 1 });
licenseSchema.index({ stripeSubscriptionId: 1 });

export const License = mongoose.model('License', licenseSchema);
