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
const authorEmail = env.SEED_AUTHOR_EMAIL || 'superadmin@zdravosloven.bg';
const promoteAdmin = env.SEED_PROMOTE_ADMIN !== 'false';

if (!projectRef) {
  console.error('Missing VITE_SUPABASE_URL in .env');
  process.exit(1);
}

if (!password) {
  console.error('Missing SUPABASE_DB_PASSWORD in .env');
  console.error('Get it from: Supabase Dashboard → Project Settings → Database → Database password');
  process.exit(1);
}

const recipesPath = resolve(root, 'supabase/seed/recipes.json');
const recipes = JSON.parse(readFileSync(recipesPath, 'utf8'));

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

  const { rows: users } = await client.query(
    'SELECT id, email FROM auth.users WHERE email = $1 LIMIT 1',
    [authorEmail]
  );

  if (!users.length) {
    console.error(`\nNo user found with email: ${authorEmail}`);
    console.error('1. Register at /register.html or create the user in Supabase Auth');
    console.error('2. Confirm the email (or disable email confirmation)');
    console.error('3. Run: npm run db:seed\n');
    process.exit(1);
  }

  const authorId = users[0].id;
  console.log(`Using author: ${authorEmail} (${authorId})`);

  if (promoteAdmin) {
    const { rowCount } = await client.query(
      `UPDATE public.user_roles
       SET role = 'admin'
       WHERE user_id = $1 AND role <> 'admin'`,
      [authorId]
    );
    if (rowCount > 0) {
      console.log('Promoted user to admin.');
    }
  }

  const { rows: existing } = await client.query(
    'SELECT title FROM public.recipes WHERE author_id = $1',
    [authorId]
  );
  const existingTitles = new Set(existing.map((row) => row.title));

  let inserted = 0;
  let skipped = 0;

  for (const recipe of recipes) {
    if (existingTitles.has(recipe.title)) {
      skipped += 1;
      continue;
    }

    await client.query(
      `INSERT INTO public.recipes (
        author_id, title, description, ingredients, steps,
        calories, protein, carbs, fat, category, dietary, image_url
      ) VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8, $9, $10, $11, $12)`,
      [
        authorId,
        recipe.title,
        recipe.description,
        JSON.stringify(recipe.ingredients),
        JSON.stringify(recipe.steps),
        recipe.calories,
        recipe.protein,
        recipe.carbs,
        recipe.fat,
        recipe.category,
        recipe.dietary,
        recipe.image_url,
      ]
    );
    inserted += 1;
  }

  console.log(`Seed complete: ${inserted} recipes added, ${skipped} skipped (already exist).`);

  const foodsPath = resolve(root, 'supabase/seed/foods.json');
  if (existsSync(foodsPath)) {
    const foods = JSON.parse(readFileSync(foodsPath, 'utf8'));
    const { rows: existingFoods } = await client.query('SELECT slug FROM public.foods');
    const existingSlugs = new Set(existingFoods.map((row) => row.slug));

    let foodInserted = 0;
    let foodSkipped = 0;

    for (const food of foods) {
      if (existingSlugs.has(food.slug)) {
        foodSkipped += 1;
        continue;
      }

      await client.query(
        `INSERT INTO public.foods (
          slug, name, category, calories, protein, carbs, fat, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          food.slug,
          food.name,
          food.category,
          food.calories,
          food.protein,
          food.carbs,
          food.fat,
          food.image_url,
        ]
      );
      foodInserted += 1;
    }

    console.log(`Foods seed: ${foodInserted} added, ${foodSkipped} skipped (already exist).`);
  }
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
