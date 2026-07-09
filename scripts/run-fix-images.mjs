import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return {};
  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

function getProjectRef(supabaseUrl) {
  try {
    return new URL(supabaseUrl).hostname.split('.')[0];
  } catch {
    return null;
  }
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const password = env.SUPABASE_DB_PASSWORD;
const projectRef = env.SUPABASE_PROJECT_REF || getProjectRef(supabaseUrl);

if (!projectRef) {
  console.error('Missing VITE_SUPABASE_URL in .env');
  process.exit(1);
}

if (!password) {
  console.error('Missing SUPABASE_DB_PASSWORD in .env');
  process.exit(1);
}

const sqlPath = resolve(root, 'supabase/migrations/20260709120000_fix_recipe_images.sql');
const sql = readFileSync(sqlPath, 'utf8');

const connectionString =
  env.DATABASE_URL ||
  `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`;

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  console.log(`Connecting to db.${projectRef}.supabase.co...`);
  await client.connect();
  console.log('Fixing broken recipe image URLs...');
  await client.query(sql);
  console.log('Recipe images updated successfully.');
} catch (err) {
  console.error('Fix failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
