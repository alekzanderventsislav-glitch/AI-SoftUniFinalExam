import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Modal } from 'bootstrap';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { fetchRecipes, createRecipe, updateRecipe, deleteRecipe } from '../services/recipes.js';
import { fetchFavorites, toggleFavorite, isFavorited } from '../services/favorites.js';
import { uploadRecipeImage, validateImageFile } from '../services/storage.js';
import { getCurrentUser, getUserRole } from '../auth.js';
import { canManageRecipes } from '../data/roles.js';
import { isSupabaseConfigured } from '../supabaseClient.js';
import { RECIPE_CATEGORIES, DIETARY_TAGS, getCategoryLabel, getDietaryLabel } from '../data/tips.js';
import { linesToArray, resolveRecipeImage, recipeImgOnError, getQueryParam } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

let recipes = [];
let favorites = [];
let user = null;
let category = 'all';
let dietary = 'all';
let searchTerm = '';
let showFavoritesOnly = false;
let userRole = 'user';
let editingId = null;
let pendingDeleteId = null;
let recipeModal = null;
let deleteModal = null;

function getRecipeModal() {
  if (!recipeModal) {
    recipeModal = new Modal(document.getElementById('recipeFormModal'));
    document.getElementById('recipeFormModal').addEventListener('hidden.bs.modal', () => {
      editingId = null;
    });
  }
  return recipeModal;
}

function getDeleteModal() {
  if (!deleteModal) {
    deleteModal = new Modal(document.getElementById('deleteRecipeModal'));
    document.getElementById('deleteRecipeModal').addEventListener('hidden.bs.modal', () => {
      pendingDeleteId = null;
    });
  }
  return deleteModal;
}

function closeFormModal() {
  getRecipeModal().hide();
  editingId = null;
}

function formField(form, name) {
  return form.elements.namedItem(name);
}

function findRecipe(id) {
  return recipes.find((r) => String(r.id) === String(id));
}

function getSelectedDietary(form) {
  return [...form.querySelectorAll('[name="dietary"]:checked')].map((el) => el.value);
}

function openDeleteModal(id) {
  pendingDeleteId = id;
  getDeleteModal().show();
}

function updateFavoritesToggleBtn() {
  const btn = document.getElementById('favoritesToggleBtn');
  if (!btn) return;
  btn.className = `btn btn-sm ${showFavoritesOnly ? 'btn-success' : 'btn-outline-secondary'}`;
  btn.innerHTML = showFavoritesOnly
    ? '<i class="bi bi-grid"></i> Всички'
    : '<i class="bi bi-heart"></i> Любими';
}

function renderRecipes() {
  const filtered = recipes.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = category === 'all' || r.category === category;
    const matchDiet = dietary === 'all' || (r.dietary || []).includes(dietary);
    const matchFav = !showFavoritesOnly || (user && isFavorited(favorites, 'recipe', r.id));
    return matchSearch && matchCat && matchDiet && matchFav;
  });

  updateFavoritesToggleBtn();

  document.getElementById('recipeGrid').innerHTML = filtered.map((r) => {
    const fav = user && isFavorited(favorites, 'recipe', r.id);
    const canManage = canManageRecipes(userRole, user, r.author_id);
    return `
    <div class="col-md-6 col-lg-4">
      <div class="card card-hover recipe-card h-100">
        <div class="position-relative">
          <a href="/recept.html?id=${r.id}"><img src="${resolveRecipeImage(r.image_url, r.title)}" class="card-img-top" alt="${r.title}" loading="lazy" onerror="${recipeImgOnError()}"></a>
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
        ${canManage ? `
        <div class="card-footer bg-white d-flex gap-2">
          <button type="button" class="btn btn-sm btn-outline-success flex-fill" data-edit="${r.id}"><i class="bi bi-pencil"></i> Редактирай</button>
          <button type="button" class="btn btn-sm btn-outline-danger flex-fill" data-delete="${r.id}"><i class="bi bi-trash"></i> Изтрий</button>
        </div>` : ''}
      </div>
    </div>`;
  }).join('') || `<div class="col-12 text-center text-muted py-5">${showFavoritesOnly ? 'Нямате любими рецепти.' : 'Няма рецепти. Качете първата!'}</div>`;

  document.querySelectorAll('[data-fav]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const added = await toggleFavorite(user.id, 'recipe', btn.dataset.fav);
      showToast(added ? 'Добавено в любими!' : 'Премахнато от любими.', added ? 'success' : 'info');
      favorites = await fetchFavorites(user.id);
      renderRecipes();
    });
  });

  document.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openForm(btn.dataset.edit);
    });
  });

  document.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openDeleteModal(btn.dataset.delete);
    });
  });
}

function openForm(id = null) {
  editingId = id;
  const form = document.getElementById('recipeForm');

  if (id) {
    const recipe = findRecipe(id);
    if (!recipe) {
      showToast('Рецептата не беше намерена.', 'error');
      editingId = null;
      return;
    }

    formField(form, 'recipeTitle').value = recipe.title;
    formField(form, 'description').value = recipe.description;
    formField(form, 'ingredients').value = (recipe.ingredients || []).join('\n');
    formField(form, 'steps').value = (recipe.steps || []).join('\n');
    formField(form, 'calories').value = recipe.calories;
    formField(form, 'protein').value = recipe.protein;
    formField(form, 'carbs').value = recipe.carbs;
    formField(form, 'fat').value = recipe.fat;
    formField(form, 'category').value = recipe.category;
    form.querySelectorAll('[name="dietary"]').forEach((cb) => {
      cb.checked = (recipe.dietary || []).includes(cb.value);
    });
    document.getElementById('formTitle').textContent = 'Редактирай рецепта';
  } else {
    form.reset();
    formField(form, 'category').value = 'lunch';
    form.querySelectorAll('[name="dietary"]').forEach((cb) => { cb.checked = false; });
    document.getElementById('formTitle').textContent = 'Качи нова рецепта';
  }

  getRecipeModal().show();
}

async function loadData() {
  if (!isSupabaseConfigured) return;
  try {
    recipes = await fetchRecipes();
    if (user) favorites = await fetchFavorites(user.id);
  } catch (err) {
    recipes = [];
    showToast(err.message || 'Грешка при зареждане на рецептите.', 'error');
  }
  renderRecipes();
}

async function initRecepti() {
  if (!isSupabaseConfigured) {
    document.getElementById('recipeGrid').innerHTML = '<div class="col-12"><div class="alert alert-warning">Конфигурирайте Supabase в .env файла.</div></div>';
    return;
  }

  user = await getCurrentUser();
  userRole = user ? await getUserRole(user.id) : 'user';
  const uploadBtn = document.getElementById('showFormBtn');
  if (!user) {
    uploadBtn.outerHTML = '<a href="/login.html" class="btn btn-success">Влезте за да качите рецепта</a>';
  } else {
    uploadBtn.addEventListener('click', () => openForm());
  }

  document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteRecipe(pendingDeleteId);
      getDeleteModal().hide();
      showToast('Рецептата е изтрита.', 'info');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

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

  document.getElementById('favoritesToggleBtn').addEventListener('click', () => {
    showFavoritesOnly = !showFavoritesOnly;
    renderRecipes();
  });

  document.getElementById('recipeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!user) return;

    const form = e.target;
    const file = form.image.files[0];
    const existingRecipe = editingId ? findRecipe(editingId) : null;
    let imageUrl = existingRecipe?.image_url || null;

    if (file) {
      const err = validateImageFile(file);
      if (err) { showToast(err, 'error'); return; }
      imageUrl = await uploadRecipeImage(file, user.id);
    }

    const payload = {
      title: formField(form, 'recipeTitle').value.trim(),
      description: formField(form, 'description').value.trim(),
      ingredients: linesToArray(formField(form, 'ingredients').value),
      steps: linesToArray(formField(form, 'steps').value),
      calories: Number(formField(form, 'calories').value) || 0,
      protein: Number(formField(form, 'protein').value) || 0,
      carbs: Number(formField(form, 'carbs').value) || 0,
      fat: Number(formField(form, 'fat').value) || 0,
      category: formField(form, 'category').value,
      dietary: getSelectedDietary(form),
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
      closeFormModal();
      form.reset();
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  await loadData();

  const editId = getQueryParam('edit');
  if (editId && user) {
    openForm(editId);
    window.history.replaceState({}, '', '/recepti.html');
  }
}

initPage(initRecepti, { requireAuth: true });
