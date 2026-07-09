import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const sql = readFileSync(resolve(root, 'supabase/seed/foods-batches.sql'), 'utf8');
const batches = sql.trim().split(/\n\n+/);
const outDir = resolve(root, 'supabase/seed/food-batch-parts');
mkdirSync(outDir, { recursive: true });
batches.forEach((batch, i) => {
  writeFileSync(resolve(outDir, `batch-${i + 1}.sql`), batch, 'utf8');
});
console.log(`Wrote ${batches.length} batch files.`);
