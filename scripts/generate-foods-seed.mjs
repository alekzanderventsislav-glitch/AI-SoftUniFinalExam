import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GENERATED_FOODS } from '../src/js/data/foods-catalog.generated.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const foods = GENERATED_FOODS.map((food) => ({
  slug: food.id,
  name: food.name,
  category: food.category,
  calories: food.calories,
  protein: food.protein,
  carbs: food.carbs,
  fat: food.fat,
  image_url: food.image,
}));

writeFileSync(resolve(root, 'supabase/seed/foods.json'), JSON.stringify(foods, null, 2), 'utf8');
console.log(`Generated ${foods.length} foods in supabase/seed/foods.json`);
