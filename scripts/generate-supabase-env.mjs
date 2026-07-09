import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outputPath = resolve(root, 'public', 'supabase-env.js');

function loadDotEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return {};

  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    env[key] = value;
  }
  return env;
}

const dotenv = loadDotEnv();
const url = process.env.VITE_SUPABASE_URL || dotenv.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || dotenv.VITE_SUPABASE_ANON_KEY || '';

if (process.env.CI && (!url || !anonKey)) {
  console.error('\n[build] Missing Supabase environment variables.');
  console.error('Set these in your hosting dashboard (Netlify/Telify) before deploy:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - VITE_SUPABASE_ANON_KEY');
  console.error('Then trigger a new deploy.\n');
  process.exit(1);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(
  outputPath,
  `window.__SUPABASE_ENV__=${JSON.stringify({ url, anonKey })};\n`,
  'utf8'
);

console.log(
  url && anonKey
    ? '[supabase-env] Config generated.'
    : '[supabase-env] No keys found (local .env or CI env vars).'
);
