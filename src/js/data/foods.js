import { GENERATED_FOODS } from './foods-catalog.generated.js';

export const FOOD_CATEGORIES = [
  { id: 'favorites', label: 'Любими' },
  { id: 'fruits', label: 'Плодове' },
  { id: 'vegetables', label: 'Зеленчуци' },
  { id: 'meats', label: 'Меса' },
  { id: 'dairy', label: 'Млечни' },
  { id: 'grains', label: 'Зърнени' },
  { id: 'nuts', label: 'Ядки' },
  { id: 'legumes', label: 'Бобови' },
  { id: 'fish', label: 'Риба' },
];

/** Референтни максимуми на 100г за макро баровете (0–100%) */
export const MACRO_CAPS = {
  protein: 35,
  carbs: 80,
  fat: 65,
};

const IMG = (id) => `https://images.unsplash.com/${id}?w=600&h=400&fit=crop&q=80`;

export const CATEGORY_IMAGES = {
  fruits: IMG('photo-1464965911861-746a04b4bca6'),
  vegetables: IMG('photo-1540420773420-3366772f4999'),
  meats: IMG('photo-1603048292542-61052c44a8ab'),
  dairy: IMG('photo-1486297678162-ebfa3be50184'),
  grains: IMG('photo-1509440159596-0249088772ff'),
  nuts: IMG('photo-1508061258002-48ad92704d42'),
  legumes: IMG('photo-1546069907-ba9599a7e63c'),
  fish: IMG('photo-1467003909585-2f8a72700288'),
};

const FOOD_FALLBACK = IMG('photo-1542838132-92c53300491e');
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

export const foods = GENERATED_FOODS;

export function getCategoryLabel(categoryId) {
  return FOOD_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;
}

export function getFoodImage(food) {
  if (!food) return FOOD_FALLBACK;
  if (food.image?.startsWith('/images/foods/') && SUPABASE_URL) {
    const fileName = food.image.split('/').pop();
    return `${SUPABASE_URL}/storage/v1/object/public/foods/${fileName}`;
  }
  return food.image || CATEGORY_IMAGES[food.category] || FOOD_FALLBACK;
}

export function foodImgOnError() {
  return `this.onerror=null;this.src='${FOOD_FALLBACK}';`;
}

export function macroPercent(value, nutrient) {
  const cap = MACRO_CAPS[nutrient] ?? 100;
  return Math.min(100, Math.round((value / cap) * 100));
}
