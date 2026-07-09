import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dir = resolve(root, 'supabase/seed/food-batch-parts');
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

const combined = files.map((file) => readFileSync(resolve(dir, file), 'utf8')).join('\n\n');
process.stdout.write(combined);
