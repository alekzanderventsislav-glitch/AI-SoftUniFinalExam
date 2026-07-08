import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { foods, FOOD_CATEGORIES, getCategoryLabel } from '../data/foods.js';
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

  document.getElementById('foodsTableBody').innerHTML = filtered.map((f) => `
    <tr>
      <td><i class="bi bi-apple text-success"></i> ${escapeHtml(f.name)}</td>
      <td><span class="badge bg-success-subtle text-success">${getCategoryLabel(f.category)}</span></td>
      <td class="text-warning fw-semibold">${f.calories}</td>
      <td>${f.protein}</td>
      <td>${f.carbs}</td>
      <td>${f.fat}</td>
    </tr>`).join('') || '<tr><td colspan="6" class="text-center text-muted py-4">Няма намерени храни.</td></tr>';

  document.getElementById('foodsCards').innerHTML = filtered.map((f) => `
    <div class="col-12">
      <div class="card">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h6 class="mb-1">${escapeHtml(f.name)}</h6>
            <span class="badge bg-success-subtle text-success">${getCategoryLabel(f.category)}</span>
          </div>
          <div class="text-end small">
            <div class="text-warning fw-bold">${f.calories} kcal</div>
            <div class="text-muted">П${f.protein} В${f.carbs} М${f.fat}</div>
          </div>
        </div>
      </div>
    </div>`).join('');
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

initPage(initHrani);
