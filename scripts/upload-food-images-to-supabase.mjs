import { readdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const imagesDir = resolve(root, 'public/images/foods');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listAllObjects(prefix = '') {
  const all = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await supabase.storage.from('foods').list(prefix, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) throw error;
    if (!data?.length) break;

    for (const item of data) {
      if (item.id) all.push(prefix ? `${prefix}/${item.name}` : item.name);
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return all;
}

async function main() {
  const localFiles = readdirSync(imagesDir).filter((f) => f.endsWith('.jpg'));
  if (!localFiles.length) {
    throw new Error('No local .jpg files found. Run npm run download:food-images first.');
  }

  const existing = await listAllObjects();
  if (existing.length) {
    const chunkSize = 50;
    for (let i = 0; i < existing.length; i += chunkSize) {
      const chunk = existing.slice(i, i + chunkSize);
      const { error } = await supabase.storage.from('foods').remove(chunk);
      if (error) throw error;
      console.log(`Removed ${chunk.length} old objects`);
    }
  }

  let successCount = 0;
  let failCount = 0;

  for (const file of localFiles) {
    const filePath = resolve(imagesDir, file);
    const bytes = readFileSync(filePath);

    const { error } = await supabase.storage
      .from('foods')
      .upload(file, bytes, { contentType: 'image/jpeg', upsert: true });

    if (error) {
      failCount += 1;
      console.error(`FAIL ${file}: ${error.message}`);
      continue;
    }

    successCount += 1;
    console.log(`OK ${file}`);
  }

  console.log(`Upload complete. Success: ${successCount}, Fail: ${failCount}`);
  if (failCount > 0) process.exitCode = 1;
}

main();
