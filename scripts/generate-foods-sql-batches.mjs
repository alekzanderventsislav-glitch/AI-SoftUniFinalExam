import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const foods = JSON.parse(readFileSync(resolve(root, 'supabase/seed/foods.json'), 'utf8'));

function esc(value) {
  return String(value).replace(/'/g, "''");
}

const batchSize = 40;
const batches = [];

for (let i = 0; i < foods.length; i += batchSize) {
  const batch = foods.slice(i, i + batchSize);
  const values = batch.map((f) =>
    `('${esc(f.slug)}','${esc(f.name)}','${esc(f.category)}',${f.calories},${f.protein},${f.carbs},${f.fat},'${esc(f.image_url)}')`
  ).join(',\n');

  batches.push(
    `INSERT INTO public.foods (slug, name, category, calories, protein, carbs, fat, image_url) VALUES\n${values}\nON CONFLICT (slug) DO NOTHING;`
  );
}

writeFileSync(resolve(root, 'supabase/seed/foods-batches.sql'), batches.join('\n\n'), 'utf8');
console.log(`Wrote ${batches.length} batches for ${foods.length} foods.`);
