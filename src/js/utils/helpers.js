export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export const IMAGE_FALLBACKS = {
  recipe: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop',
  workout: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop',
  food: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop',
};

export function resolveImage(url, fallback) {
  const trimmed = typeof url === 'string' ? url.trim() : '';
  return trimmed || fallback || IMAGE_FALLBACKS.recipe;
}

const BROKEN_RECIPE_IMAGE_IDS = ['photo-1517673400267'];
const OATMEAL_RECIPE_IMAGE = 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&h=500&fit=crop';

export function resolveRecipeImage(url) {
  const trimmed = typeof url === 'string' ? url.trim() : '';
  if (BROKEN_RECIPE_IMAGE_IDS.some((id) => trimmed.includes(id))) {
    return OATMEAL_RECIPE_IMAGE;
  }
  return resolveImage(url, IMAGE_FALLBACKS.recipe);
}

export function recipeImgOnError(fallback = IMAGE_FALLBACKS.recipe) {
  return `this.onerror=null;this.src='${fallback}'`;
}

const BROKEN_WORKOUT_IMAGE_IDS = ['photo-1476480862128'];

export function resolveWorkoutImage(url) {
  const trimmed = typeof url === 'string' ? url.trim() : '';
  if (BROKEN_WORKOUT_IMAGE_IDS.some((id) => trimmed.includes(id))) {
    return IMAGE_FALLBACKS.workout;
  }
  return resolveImage(url, IMAGE_FALLBACKS.workout);
}

export function workoutImgOnError(fallback = IMAGE_FALLBACKS.workout) {
  return `this.onerror=null;this.src='${fallback}'`;
}

export function linesToArray(text) {
  return text.split('\n').map((s) => s.trim()).filter(Boolean);
}

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function loadDailyTracker() {
  const key = `zl_tracker_${getTodayKey()}`;
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : { calories: 0, water: 0 };
}

export function saveDailyTracker(data) {
  const key = `zl_tracker_${getTodayKey()}`;
  localStorage.setItem(key, JSON.stringify(data));
}
