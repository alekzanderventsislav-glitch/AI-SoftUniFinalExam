import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CATALOG } from './food-catalog.mjs';
import { getFoodImageFileName } from './food-image-meta.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const foods = [];
for (const [category, items] of Object.entries(CATALOG)) {
  items.forEach(([name, calories, protein, carbs, fat], index) => {
    const itemId = `${category}-${index + 1}`;
    const imageFile = getFoodImageFileName(name);
    foods.push({
      id: itemId,
      name,
      category,
      calories,
      protein,
      carbs,
      fat,
      image: `/images/foods/${imageFile}`,
    });
  });
}

const output = `// Auto-generated – npm run generate:foods
export const FOOD_CATALOG = ${JSON.stringify(CATALOG, null, 2)};

export const GENERATED_FOODS = ${JSON.stringify(foods, null, 2)};
`;

writeFileSync(resolve(root, 'src/js/data/foods-catalog.generated.js'), output, 'utf8');
console.log(`Generated ${foods.length} foods.`);
