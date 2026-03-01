/**
 * API keys for programmatic access, scoped to a tenant.
 * Keys can have different scopes (e.g. read-only, full).
 */
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

/** Hash the raw key for storage; we only show the raw key once at creation */
function hashKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

const apiKeySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    /** Hashed key (never store raw) */
    keyHash: { type: String, required: true, unique: true },
    /** Prefix for display, e.g. "kp_live_abc..." */
    keyPrefix: { type: String, required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    scopes: [{ type: String }],
    lastUsedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

apiKeySchema.index({ tenantId: 1 });

apiKeySchema.statics.createKey = async function (tenantId, name, scopes = []) {
  const raw = `kp_${uuidv4().replace(/-/g, '')}`;
  const keyHash = hashKey(raw);
  const keyPrefix = raw.slice(0, 12) + '...';
  await this.create({ name, keyHash, keyPrefix, tenantId, scopes });
  return { raw, keyPrefix };
};

apiKeySchema.statics.findByRawKey = async function (rawKey) {
  const keyHash = hashKey(rawKey);
  return this.findOne({ keyHash, active: true }).populate('tenantId');
};

export const ApiKey = mongoose.model('ApiKey', apiKeySchema);
