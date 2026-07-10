import { getRoleLabel } from '../data/roles.js';

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function getAuthorDisplayName(fullName, role) {
  const trimmed = typeof fullName === 'string' ? fullName.trim() : '';
  if (trimmed) return trimmed;
  return getRoleLabel(role) || 'Потребител';
}

/** @deprecated Use canManageWorkouts / canManageRecipes from roles.js */
export function canManageContent(user, authorId, isAdmin) {
  if (!user) return false;
  if (isAdmin) return true;
  return Boolean(authorId && user.id === authorId);
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

const RECIPE_IMAGE_REPLACEMENTS = {
  'photo-1517673400267': 'https://images.unsplash.com/photo-1550461716-dbf266b2a8a7?w=800&h=500&fit=crop',
  'photo-1528207776546': 'https://images.unsplash.com/photo-1550461716-dbf266b2a8a7?w=800&h=500&fit=crop',
  'photo-1512621776951': 'https://images.unsplash.com/photo-1763000215238-38350d3e41ac?w=800&h=500&fit=crop',
  'photo-1604908176997': 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800&h=500&fit=crop',
  'photo-1540189549336': 'https://images.unsplash.com/photo-1745126010010-da1c6f5300a9?w=800&h=500&fit=crop',
  'photo-1606313564200': 'https://images.unsplash.com/photo-1678554500191-3885a6fbf8c2?w=800&h=500&fit=crop',
};

const OMELET_RECIPE_TITLE = 'Омлет със спанак и извара';
const OMELET_RECIPE_IMAGE = 'https://images.unsplash.com/photo-1754894992043-d51f1d75ea3b?w=800&h=500&fit=crop';
const BROKEN_OMELET_IMAGE_IDS = ['photo-1525351484163', 'photo-1612929633738'];

export function resolveRecipeImage(url, title = '') {
  const trimmed = typeof url === 'string' ? url.trim() : '';
  const recipeTitle = typeof title === 'string' ? title.trim() : '';

  if (
    recipeTitle === OMELET_RECIPE_TITLE
    && (!trimmed || BROKEN_OMELET_IMAGE_IDS.some((id) => trimmed.includes(id)))
  ) {
    return OMELET_RECIPE_IMAGE;
  }

  for (const [photoId, replacement] of Object.entries(RECIPE_IMAGE_REPLACEMENTS)) {
    if (trimmed.includes(photoId)) {
      return replacement;
    }
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

export function formatRelativeTime(isoDate) {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'току-що';
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} д`;
  return date.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatMessageTime(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' });
}

const AVATAR_COLORS = ['#198754', '#0d6efd', '#6f42c1', '#fd7e14', '#d63384', '#20c997'];

export function getAvatarInitials(name) {
  const parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

export function getAvatarColor(name) {
  const str = String(name || '');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
