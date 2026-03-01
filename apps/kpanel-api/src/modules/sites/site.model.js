/**
 * Site model. Represents a website (domain) linked to Netlify or standalone.
 * Belongs to a tenant.
 */
import mongoose from 'mongoose';

const siteSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true, trim: true },
    /** Primary domain to monitor (e.g. example.com) */
    domain: { type: String, required: true, trim: true },
    /** Optional: Netlify site ID for API integration */
    netlifySiteId: { type: String, default: null },
    /** Optional: Netlify deploy hook or other config */
    netlifyConfig: {
      deployHookUrl: { type: String, default: null },
      buildCommand: { type: String, default: null },
    },
    /** Last health check result (summary) */
    lastHealth: {
      status: { type: String, enum: ['up', 'down', 'degraded', 'unknown'], default: 'unknown' },
      statusCode: { type: Number, default: null },
      checkedAt: { type: Date, default: null },
      message: { type: String, default: null },
    },
    /** Generic diagnostics (response time, SSL, etc.) stored after checks */
    diagnostics: { type: mongoose.Schema.Types.Mixed, default: {} },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

siteSchema.index({ tenantId: 1, domain: 1 }, { unique: true });
siteSchema.index({ tenantId: 1 });
siteSchema.index({ netlifySiteId: 1 });

export const Site = mongoose.model('Site', siteSchema);
