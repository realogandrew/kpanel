/**
 * Express app setup: middleware and route mounting.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import authRoutes from './modules/auth/auth.routes.js';
import tenantRoutes from './modules/tenants/tenant.routes.js';
import siteRoutes from './modules/sites/site.routes.js';
import contentRoutes from './modules/content/content.routes.js';
import licenseRoutes from './modules/licensing/license.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.nodeEnv === 'development' ? true : config.apiBaseUrl }));
app.use(express.json());

app.use(
  rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Health (no auth)
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1/sites', siteRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/licenses', licenseRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

export default app;
