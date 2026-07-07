export const STORAGE_KEYS = {
  USERS: 'zl_users',
  SESSION: 'zl_session',
  RECIPES: 'zl_recipes',
  FAVORITES: 'zl_favorites',
  PROFILE: 'zl_profile',
  DAILY_TRACKER: 'zl_daily_tracker',
};

export function loadFromStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}
