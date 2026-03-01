/**
 * Try to start MongoDB via Docker Compose so `npm run dev` works without
 * manually running docker compose. If Docker isn't available or the command
 * fails, we exit 0 so dev continues (user may have MongoDB running elsewhere).
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  try {
    execSync('docker compose up -d', { cwd: root, stdio: 'pipe' });
    console.log('[kpanel] MongoDB container started (or already running). Waiting 3s for it to be ready…');
    await wait(3000);
  } catch (err) {
    console.warn('[kpanel] Docker MongoDB not started (start Docker Desktop or use another MongoDB). Dev will continue.');
  }
  process.exit(0);
})();
