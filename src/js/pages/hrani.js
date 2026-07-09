import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Modal } from 'bootstrap';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import {
  foods as staticFoods,
  FOOD_CATEGORIES,
  getCategoryLabel,
  getFoodImage,
  foodImgOnError,
  macroPercent,
} from '../data/foods.js';
import { fetchFoods } from '../services/foods.js';
import { getFoodFavorites, isFoodFavorite, toggleFoodFavorite } from '../services/foodFavorites.js';
import { isSupabaseConfigured } from '../supabaseClient.js';
import { escapeHtml } from '../utils/helpers.js';

let foods = [];
let currentCategory = null;
let searchTerm = '';

function formatMacro(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function renderMacroBar(label, value, nutrient) {
  const pct = macroPercent(value, nutrient);
  return `
    <div class="food-macro-row">
      <div class="d-flex justify-content-between small mb-1">
        <span class="text-muted">${label}</span>
        <span>${formatMacro(value)}г <span class="text-muted">(${pct}%)</span></span>
      </div>
      <div class="progress food-macro-progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${label}">
        <div class="progress-bar food-macro-fill" style="width:${pct}%"></div>
      </div>
    </div>`;
}

function renderFoodCard(food) {
  const fav = isFoodFavorite(food.id);
  return `
    <div class="col-sm-6 col-lg-4 col-xl-3">
      <div class="card card-hover food-card h-100">
        <div class="food-card-img-wrap position-relative">
          <img src="${getFoodImage(food)}" class="card-img-top" alt="${escapeHtml(food.name)}" loading="lazy" onerror="${foodImgOnError()}">
          <button type="button" class="btn btn-light btn-sm food-fav-btn ${fav ? 'is-favorite' : ''}" data-fav="${food.id}" aria-label="${fav ? 'Премахни от любими' : 'Добави в любими'}" title="${fav ? 'Премахни от любими' : 'Добави в любими'}">
            <i class="bi ${fav ? 'bi-heart-fill text-danger' : 'bi-heart'}"></i>
          </button>
        </div>
        <div class="card-body d-flex flex-column">
          <h6 class="card-title mb-1">${escapeHtml(food.name)}</h6>
          <span class="badge bg-success-subtle text-success align-self-start">${getCategoryLabel(food.category)}</span>
          <div class="mt-3 small flex-grow-1">
            <div class="d-flex justify-content-between mb-2 pb-2 border-bottom">
              <span class="text-muted">Калории</span>
              <span class="text-warning fw-semibold">${food.calories} kcal</span>
            </div>
            ${renderMacroBar('Протеин', food.protein, 'protein')}
            ${renderMacroBar('Въглехидрати', food.carbs, 'carbs')}
            ${renderMacroBar('Мазнини', food.fat, 'fat')}
          </div>
        </div>
      </div>
    </div>`;
}

function getFilteredFoods() {
  return foods.filter((food) => {
    const matchSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    if (currentCategory === 'favorites') return isFoodFavorite(food.id);
    if (!currentCategory) return true;
    return food.category === currentCategory;
  });
}

function updateFilterButtons() {
  const filtersEl = document.getElementById('categoryFilters');
  filtersEl.querySelectorAll('[data-cat]').forEach((btn) => {
    const isFavoritesBtn = btn.dataset.cat === 'favorites';
    const active = btn.dataset.cat === currentCategory;
    btn.classList.toggle('active', active);
    btn.classList.toggle('btn-success', active);
    btn.classList.toggle('btn-outline-secondary', !active);
    if (isFavoritesBtn) {
      btn.innerHTML = currentCategory === 'favorites'
        ? '<i class="bi bi-grid"></i> Всички'
        : '<i class="bi bi-heart"></i> Любими';
    }
  });
}

function renderFoods() {
  const filtered = getFilteredFoods();
  const favCount = getFoodFavorites().length;

  let countText = `Показани ${filtered.length} от ${foods.length} храни`;
  if (currentCategory === 'favorites') {
    countText = favCount
      ? `Показани ${filtered.length} любими храни`
      : 'Нямате любими храни – натиснете сърцето на картата';
  }

  document.getElementById('foodCount').textContent = countText;

  updateFilterButtons();

  document.getElementById('foodsGrid').innerHTML = filtered.length
    ? filtered.map(renderFoodCard).join('')
    : '<div class="col-12 text-center text-muted py-5">Няма намерени храни.</div>';
}

async function loadFoods() {
  foods = [];
  if (isSupabaseConfigured) {
    try {
      const dbFoods = await fetchFoods();
      foods = dbFoods.length ? dbFoods : [...staticFoods];
    } catch {
      foods = [...staticFoods];
    }
  } else {
    foods = [...staticFoods];
  }
  renderFoods();
}

async function initHrani() {
  const filtersEl = document.getElementById('categoryFilters');
  filtersEl.innerHTML = FOOD_CATEGORIES.map((cat) => `
    <button type="button" class="btn btn-sm badge-filter btn-outline-secondary" data-cat="${cat.id}">${cat.label}</button>
  `).join('');

  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    const next = btn.dataset.cat;
    currentCategory = currentCategory === next ? null : next;
    updateFilterButtons();
    renderFoods();
  });

  document.getElementById('foodsGrid').addEventListener('click', (e) => {
    const favBtn = e.target.closest('[data-fav]');
    if (!favBtn) return;
    e.preventDefault();
    e.stopPropagation();
    toggleFoodFavorite(favBtn.dataset.fav);
    renderFoods();
    updateFilterButtons();
  });

  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderFoods();
  });

  await loadFoods();
}

initPage(initHrani, { requireAuth: true });
