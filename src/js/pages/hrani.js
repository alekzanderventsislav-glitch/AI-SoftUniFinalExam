import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { foods, FOOD_CATEGORIES, getCategoryLabel, getFoodImage } from '../data/foods.js';
import { escapeHtml } from '../utils/helpers.js';

let currentCategory = 'all';
let searchTerm = '';

function renderFoods() {
  const filtered = foods.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = currentCategory === 'all' || f.category === currentCategory;
    return matchSearch && matchCat;
  });

  document.getElementById('foodCount').textContent = `Показани ${filtered.length} от ${foods.length} храни`;

  document.getElementById('foodsGrid').innerHTML = filtered.map((f) => `
    <div class="col-sm-6 col-lg-4 col-xl-3">
      <div class="card card-hover food-card h-100">
        <img src="${getFoodImage(f)}" class="card-img-top" alt="${escapeHtml(f.name)}" loading="lazy">
        <div class="card-body">
          <h6 class="card-title mb-1">${escapeHtml(f.name)}</h6>
          <span class="badge bg-success-subtle text-success">${getCategoryLabel(f.category)}</span>
          <div class="mt-3 small">
            <div class="d-flex justify-content-between mb-1">
              <span class="text-muted">Калории</span>
              <span class="text-warning fw-semibold">${f.calories} kcal</span>
            </div>
            <div class="d-flex justify-content-between text-muted">
              <span>П: ${f.protein}г</span>
              <span>В: ${f.carbs}г</span>
              <span>М: ${f.fat}г</span>
            </div>
          </div>
        </div>
      </div>
    </div>`).join('') || '<div class="col-12 text-center text-muted py-5">Няма намерени храни.</div>';
}

async function initHrani() {
  const filtersEl = document.getElementById('categoryFilters');
  filtersEl.innerHTML = FOOD_CATEGORIES.map((c) => `
    <button type="button" class="btn btn-sm badge-filter ${c.id === 'all' ? 'active btn-success' : 'btn-outline-secondary'}" data-cat="${c.id}">${c.label}</button>
  `).join('');

  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    currentCategory = btn.dataset.cat;
    filtersEl.querySelectorAll('[data-cat]').forEach((b) => {
      b.classList.toggle('active', b.dataset.cat === currentCategory);
      b.classList.toggle('btn-success', b.dataset.cat === currentCategory);
      b.classList.toggle('btn-outline-secondary', b.dataset.cat !== currentCategory);
    });
    renderFoods();
  });

  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderFoods();
  });

  renderFoods();
}

initPage(initHrani, { requireAuth: true });
