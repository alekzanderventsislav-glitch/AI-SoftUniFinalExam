const STORAGE_KEY = 'zl_food_favorites';

export function getFoodFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFoodFavorite(foodId) {
  return getFoodFavorites().includes(foodId);
}

export function toggleFoodFavorite(foodId) {
  const favorites = getFoodFavorites();
  const index = favorites.indexOf(foodId);
  if (index >= 0) favorites.splice(index, 1);
  else favorites.push(foodId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  return favorites.includes(foodId);
}
