import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { fetchRecipes, createRecipe, updateRecipe, deleteRecipe } from '../services/recipes.js';
import { fetchFavorites, toggleFavorite, isFavorited } from '../services/favorites.js';
import { uploadRecipeImage, validateImageFile } from '../services/storage.js';
import { getCurrentUser } from '../auth.js';
import { isSupabaseConfigured } from '../supabaseClient.js';
import { RECIPE_CATEGORIES, DIETARY_TAGS, getCategoryLabel, getDietaryLabel } from '../data/tips.js';
import { linesToArray, resolveRecipeImage, recipeImgOnError } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

let recipes = [];
let favorites = [];
let user = null;
let category = 'all';
let dietary = 'all';
let searchTerm = '';
let editingId = null;

function getSelectedDietary() {
  return [...document.querySelectorAll('[name="dietary"]:checked')].map((el) => el.value);
}

function renderRecipes() {
  const filtered = recipes.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = category === 'all' || r.category === category;
    const matchDiet = dietary === 'all' || (r.dietary || []).includes(dietary);
    return matchSearch && matchCat && matchDiet;
  });

  document.getElementById('recipeGrid').innerHTML = filtered.map((r) => {
    const fav = user && isFavorited(favorites, 'recipe', r.id);
    const isOwner = user && r.author_id === user.id;
    return `
    <div class="col-md-6 col-lg-4">
      <div class="card card-hover recipe-card h-100">
        <div class="position-relative">
          <a href="/recept.html?id=${r.id}"><img src="${resolveRecipeImage(r.image_url)}" class="card-img-top" alt="${r.title}" loading="lazy" onerror="${recipeImgOnError()}"></a>
          <button class="btn btn-sm btn-light position-absolute top-0 end-0 m-2 favorite-btn ${fav ? 'active' : ''}" data-fav="${r.id}" ${!user ? 'disabled' : ''}>
            <i class="bi bi-heart${fav ? '-fill' : ''}"></i>
          </button>
        </div>
        <div class="card-body">
          <span class="badge bg-success-subtle text-success">${getCategoryLabel(r.category)}</span>
          ${(r.dietary || []).slice(0, 2).map((d) => `<span class="badge bg-primary-subtle text-primary">${getDietaryLabel(d)}</span>`).join('')}
          <h5 class="card-title mt-2"><a href="/recept.html?id=${r.id}" class="text-decoration-none text-dark">${r.title}</a></h5>
          <p class="card-text text-muted small">${r.description}</p>
          <div class="d-flex justify-content-between small">
            <span class="text-success fw-semibold">${r.calories} kcal</span>
            <span class="text-muted">от ${r.authorName || 'Потребител'}</span>
          </div>
        </div>
        ${isOwner ? `
        <div class="card-footer bg-white d-flex gap-2">
          <button class="btn btn-sm btn-outline-success flex-fill" data-edit="${r.id}"><i class="bi bi-pencil"></i> Редактирай</button>
          <button class="btn btn-sm btn-outline-danger flex-fill" data-delete="${r.id}"><i class="bi bi-trash"></i> Изтрий</button>
        </div>` : ''}
      </div>
    </div>`;
  }).join('') || '<div class="col-12 text-center text-muted py-5">Няма рецепти. Качете първата!</div>';

  document.querySelectorAll('[data-fav]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const added = await toggleFavorite(user.id, 'recipe', btn.dataset.fav);
      showToast(added ? 'Добавено в любими!' : 'Премахнато от любими.', added ? 'success' : 'info');
      favorites = await fetchFavorites(user.id);
      renderRecipes();
    });
  });

  document.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openForm(btn.dataset.edit));
  });

  document.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Сигурни ли сте, че искате да изтриете тази рецепта?')) return;
      await deleteRecipe(btn.dataset.delete);
      showToast('Рецептата е изтрита.', 'info');
      await loadData();
    });
  });
}

function openForm(id = null) {
  editingId = id;
  const formSection = document.getElementById('recipeFormSection');
  const form = document.getElementById('recipeForm');
  formSection.classList.remove('d-none');

  if (id) {
    const recipe = recipes.find((r) => r.id === id);
    form.title.value = recipe.title;
    form.description.value = recipe.description;
    form.ingredients.value = (recipe.ingredients || []).join('\n');
    form.steps.value = (recipe.steps || []).join('\n');
    form.calories.value = recipe.calories;
    form.protein.value = recipe.protein;
    form.carbs.value = recipe.carbs;
    form.fat.value = recipe.fat;
    form.category.value = recipe.category;
    form.querySelectorAll('[name="dietary"]').forEach((cb) => {
      cb.checked = (recipe.dietary || []).includes(cb.value);
    });
    document.getElementById('formTitle').textContent = 'Редактирай рецепта';
  } else {
    form.reset();
    document.getElementById('formTitle').textContent = 'Качи нова рецепта';
  }
}

async function loadData() {
  if (!isSupabaseConfigured) return;
  recipes = await fetchRecipes();
  if (user) favorites = await fetchFavorites(user.id);
  renderRecipes();
}

async function initRecepti() {
  if (!isSupabaseConfigured) {
    document.getElementById('recipeGrid').innerHTML = '<div class="col-12"><div class="alert alert-warning">Конфигурирайте Supabase в .env файла.</div></div>';
    return;
  }

  user = await getCurrentUser();
  const uploadBtn = document.getElementById('showFormBtn');
  if (!user) {
    uploadBtn.outerHTML = '<a href="/login.html" class="btn btn-success">Влезте за да качите рецепта</a>';
  } else {
    uploadBtn.addEventListener('click', () => openForm());
    document.getElementById('cancelFormBtn').addEventListener('click', () => {
      document.getElementById('recipeFormSection').classList.add('d-none');
      editingId = null;
    });
  }

  const catFilters = document.getElementById('categoryFilters');
  catFilters.innerHTML = RECIPE_CATEGORIES.map((c) => `
    <button type="button" class="btn btn-sm ${c.id === 'all' ? 'btn-success' : 'btn-outline-secondary'}" data-cat="${c.id}">${c.label}</button>
  `).join('');

  const dietFilters = document.getElementById('dietaryFilters');
  dietFilters.innerHTML = DIETARY_TAGS.map((d) => `
    <button type="button" class="btn btn-sm ${d.id === 'all' ? 'btn-success' : 'btn-outline-secondary'}" data-diet="${d.id}">${d.label}</button>
  `).join('');

  catFilters.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    category = btn.dataset.cat;
    catFilters.querySelectorAll('[data-cat]').forEach((b) => {
      b.className = `btn btn-sm ${b.dataset.cat === category ? 'btn-success' : 'btn-outline-secondary'}`;
    });
    renderRecipes();
  });

  dietFilters.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-diet]');
    if (!btn) return;
    dietary = btn.dataset.diet;
    dietFilters.querySelectorAll('[data-diet]').forEach((b) => {
      b.className = `btn btn-sm ${b.dataset.diet === dietary ? 'btn-success' : 'btn-outline-secondary'}`;
    });
    renderRecipes();
  });

  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderRecipes();
  });

  document.getElementById('recipeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!user) return;

    const form = e.target;
    const file = form.image.files[0];
    let imageUrl = editingId ? recipes.find((r) => r.id === editingId)?.image_url : null;

    if (file) {
      const err = validateImageFile(file);
      if (err) { showToast(err, 'error'); return; }
      imageUrl = await uploadRecipeImage(file, user.id);
    }

    const payload = {
      title: form.title.value.trim(),
      description: form.description.value.trim(),
      ingredients: linesToArray(form.ingredients.value),
      steps: linesToArray(form.steps.value),
      calories: Number(form.calories.value) || 0,
      protein: Number(form.protein.value) || 0,
      carbs: Number(form.carbs.value) || 0,
      fat: Number(form.fat.value) || 0,
      category: form.category.value,
      dietary: getSelectedDietary(),
      image_url: imageUrl,
    };

    try {
      if (editingId) {
        await updateRecipe(editingId, payload);
        showToast('Рецептата е обновена!');
      } else {
        await createRecipe(payload, user.id);
        showToast('Рецептата е добавена успешно!');
      }
      document.getElementById('recipeFormSection').classList.add('d-none');
      editingId = null;
      form.reset();
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  await loadData();
}

initPage(initRecepti, { requireAuth: true });
