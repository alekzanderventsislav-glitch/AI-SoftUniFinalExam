export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function resolveImage(url, fallback) {
  return url || fallback || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop';
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
