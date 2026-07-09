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

export function loadDailyTracker(dateKey = getTodayKey()) {
  const key = `zl_tracker_${dateKey}`;
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : { calories: 0, water: 0 };
}

export function saveDailyTracker(data, dateKey = getTodayKey()) {
  const key = `zl_tracker_${dateKey}`;
  localStorage.setItem(key, JSON.stringify(data));
}

export function formatTrackerDateLabel(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('bg-BG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function isTrackerToday(dateKey) {
  return dateKey === getTodayKey();
}

function toDateKeyFromDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysToDateKey(dateKey, days) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return toDateKeyFromDate(date);
}

export function getDateKeysInRange(fromKey, toKey) {
  const [fy, fm, fd] = fromKey.split('-').map(Number);
  const [ty, tm, td] = toKey.split('-').map(Number);
  const from = new Date(fy, fm - 1, fd);
  const to = new Date(ty, tm - 1, td);
  if (from > to) return [];

  const keys = [];
  const cur = new Date(from);
  while (cur <= to) {
    keys.push(toDateKeyFromDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return keys;
}

export function loadTrackerRange(fromKey, toKey) {
  return getDateKeysInRange(fromKey, toKey).map((dateKey) => ({
    dateKey,
    ...loadDailyTracker(dateKey),
  }));
}

export function formatShortDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('bg-BG', {
    day: 'numeric',
    month: 'short',
  });
}
