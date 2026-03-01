/**
 * Ensures a platform admin user exists on startup.
 * Uses ADMIN_EMAIL + ADMIN_PASSWORD if set; otherwise in development creates
 * admin@kpanel.local / changeme so the app is ready to use.
 */
import bcrypt from 'bcryptjs';
import { User } from '../modules/auth/user.model.js';
import { Tenant } from '../modules/tenants/tenant.model.js';
import { config } from '../config/index.js';

const DEFAULT_TENANT_SLUG = 'kpanel';
const DEFAULT_TENANT_NAME = 'KPanel';
const DEV_ADMIN_EMAIL = 'admin@kpanel.local';
const DEV_ADMIN_PASSWORD = 'changeme';

export async function ensureDefaultAdmin() {
  const email = (config.adminEmail?.trim?.() || (config.nodeEnv === 'development' ? DEV_ADMIN_EMAIL : '')).toLowerCase();
  const password = config.adminPassword || (config.nodeEnv === 'development' ? DEV_ADMIN_PASSWORD : null);

  if (!email || !password) return;

  const existing = await User.findOne({ email }).populate('tenantId');
  if (existing) {
    if (!existing.isPlatformAdmin) {
      existing.isPlatformAdmin = true;
      await existing.save();
      console.log('[admin] Existing user promoted to platform admin:', email);
    }
    return;
  }

  let tenant = await Tenant.findOne({ slug: DEFAULT_TENANT_SLUG });
  if (!tenant) {
    tenant = await Tenant.create({ name: DEFAULT_TENANT_NAME, slug: DEFAULT_TENANT_SLUG });
    console.log('[admin] Created default tenant:', DEFAULT_TENANT_SLUG);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    email: email.toLowerCase(),
    passwordHash,
    name: 'Platform Admin',
    tenantId: tenant._id,
    role: 'owner',
    isPlatformAdmin: true,
  });
  console.log('[admin] Default platform admin created:', email);
}
