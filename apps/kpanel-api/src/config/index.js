/**
 * Central configuration for KPanel API.
 * Load from environment variables (see .env.example).
 */
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),

  /** MongoDB connection string */
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/kpanel',

  /** JWT secret for access tokens */
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',

  /** Netlify API token for site status (optional) */
  netlifyToken: process.env.NETLIFY_TOKEN || '',

  /** Base URL of this API (for webhook/callback URLs) */
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',

  /** Rate limit: max requests per window per IP */
  rateLimitWindowMs: 15 * 60 * 1000,
  rateLimitMax: 100,

  /** Default platform admin – if both set, created/updated on startup */
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
};

export default config;
