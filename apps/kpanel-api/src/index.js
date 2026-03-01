/**
 * KPanel API entry point.
 * Bind the server first so the port is open, then connect to DB (avoids ECONNREFUSED
 * when the UI starts before MongoDB is ready or when DB connection fails).
 */
import { connectDb } from './db/connection.js';
import { ensureDefaultAdmin } from './db/ensureDefaultAdmin.js';
import app from './app.js';
import { config } from './config/index.js';

async function start() {
  // Bind first so something is listening on the port; UI won't get ECONNREFUSED
  app.listen(config.port, () => {
    console.log(`[kpanel-api] Listening on http://localhost:${config.port}`);
  });

  try {
    await connectDb();
    await ensureDefaultAdmin();
  } catch (err) {
    console.error('[kpanel-api] Database setup failed (API still running):', err.message);
    console.error('  → Start MongoDB and restart the API, or check MONGO_URI in .env');
  }
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
