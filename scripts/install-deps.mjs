import { execSync } from 'child_process';

console.log('[v0] Installing zustand and framer-motion...');
try {
  execSync('pnpm add zustand framer-motion', { stdio: 'inherit', cwd: '/vercel/share/v0-project' });
  console.log('[v0] Dependencies installed successfully.');
} catch (e) {
  console.error('[v0] Install failed:', e.message);
}
