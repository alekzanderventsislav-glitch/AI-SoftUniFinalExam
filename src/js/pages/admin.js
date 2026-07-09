import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Modal } from 'bootstrap';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { fetchAllRecipesAdmin, deleteRecipe } from '../services/recipes.js';
import { fetchAllProfilesAdmin, setUserRole, updateProfile } from '../services/profiles.js';
import { fetchAllUserWorkoutsAdmin, deleteUserWorkout } from '../services/workouts.js';
import { fetchAllFoodsAdmin, createFood, updateFood, deleteFood } from '../services/foods.js';
import { uploadFoodImage, validateImageFile } from '../services/storage.js';
import { FOOD_CATEGORIES, getCategoryLabel } from '../data/foods.js';
import { getAuthorDisplayName } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

const FOOD_CATEGORY_OPTIONS = FOOD_CATEGORIES.filter((c) => c.id !== 'favorites');

let editUserModal = null;
let editFoodModal = null;
let editingUserId = null;
let editingFoodId = null;
let allFoods = [];
let foodSearchTerm = '';

function getEditUserModal() {
  if (!editUserModal) {
    editUserModal = new Modal(document.getElementById('editUserModal'));
    document.getElementById('editUserModal').addEventListener('hidden.bs.modal', () => {
      editingUserId = null;
    });
  }
  return editUserModal;
}

function getEditFoodModal() {
  if (!editFoodModal) {
    editFoodModal = new Modal(document.getElementById('editFoodModal'));
    document.getElementById('editFoodModal').addEventListener('hidden.bs.modal', () => {
      editingFoodId = null;
    });
  }
  return editFoodModal;
}

function getUserRole(profile) {
  return profile.user_roles?.some((r) => r.role === 'admin') ? 'admin' : (profile.user_roles?.[0]?.role || 'user');
}

function openEditUserModal(profile) {
  editingUserId = profile.id;
  const form = document.getElementById('editUserForm');
  form.elements.userId.value = profile.id;
  form.elements.full_name.value = getAuthorDisplayName(profile.full_name, getUserRole(profile));
  form.elements.role.value = getUserRole(profile);
  getEditUserModal().show();
}

function openEditFoodModal(food = null) {
  editingFoodId = food?.id || null;
  const form = document.getElementById('editFoodForm');
  form.reset();

  if (food) {
    form.elements.foodName.value = food.name;
    form.elements.category.value = food.category;
    form.elements.calories.value = food.calories;
    form.elements.protein.value = food.protein;
    form.elements.carbs.value = food.carbs;
    form.elements.fat.value = food.fat;
    document.getElementById('editFoodModalTitle').textContent = 'Редакция на храна';
  } else {
    form.elements.category.value = 'fruits';
    document.getElementById('editFoodModalTitle').textContent = 'Нова храна';
  }

  getEditFoodModal().show();
}

function getFilteredFoodsAdmin() {
  const term = foodSearchTerm.toLowerCase();
  if (!term) return allFoods;
  return allFoods.filter((f) =>
    f.name.toLowerCase().includes(term) || getCategoryLabel(f.category).toLowerCase().includes(term));
}

function renderFoodsTable() {
  const filtered = getFilteredFoodsAdmin();
  document.getElementById('foodsTable').innerHTML = filtered.map((f) => `
    <tr>
      <td>${f.name}</td>
      <td>${getCategoryLabel(f.category)}</td>
      <td>${f.calories} kcal</td>
      <td>${new Date(f.created_at).toLocaleDateString('bg-BG')}</td>
      <td class="text-nowrap">
        <button type="button" class="btn btn-sm btn-outline-success" data-edit-food="${f.id}"><i class="bi bi-pencil"></i></button>
        <a href="/hrani.html" class="btn btn-sm btn-outline-secondary"><i class="bi bi-eye"></i></a>
        <button class="btn btn-sm btn-outline-danger" data-del-food="${f.id}"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`).join('') || '<tr><td colspan="5" class="text-center text-muted">Няма храни</td></tr>';

  document.getElementById('foodsTableInfo').textContent = foodSearchTerm
    ? `Показани ${filtered.length} от ${allFoods.length} храни`
    : `Общо ${allFoods.length} храни`;

  document.querySelectorAll('[data-edit-food]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const food = allFoods.find((f) => f.id === btn.dataset.editFood);
      if (food) openEditFoodModal(food);
    });
  });

  document.querySelectorAll('[data-del-food]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Изтриване на храната?')) return;
      await deleteFood(btn.dataset.delFood);
      showToast('Храната е изтрита.', 'info');
      await initAdmin();
    });
  });
}

async function initAdmin() {
  let recipes = [];
  let profiles = [];
  let workouts = [];
  let loadError = '';

  try {
    [recipes, profiles, workouts, allFoods] = await Promise.all([
      fetchAllRecipesAdmin(),
      fetchAllProfilesAdmin(),
      fetchAllUserWorkoutsAdmin(),
      fetchAllFoodsAdmin(),
    ]);
  } catch (err) {
    loadError = err.message || 'Грешка при зареждане на данните.';
    try { profiles = await fetchAllProfilesAdmin(); } catch { /* ignore */ }
    try { recipes = await fetchAllRecipesAdmin(); } catch { /* ignore */ }
    try { workouts = await fetchAllUserWorkoutsAdmin(); } catch { /* ignore */ }
    try { allFoods = await fetchAllFoodsAdmin(); } catch { /* ignore */ }
  }

  if (loadError) {
    document.querySelector('main .page-header')?.insertAdjacentHTML(
      'afterend',
      `<div class="alert alert-warning"><i class="bi bi-exclamation-triangle"></i> ${loadError}</div>`,
    );
  }

  const adminCount = profiles.filter((p) => getUserRole(p) === 'admin').length;

  document.getElementById('adminStats').innerHTML = `
    <div class="col-6 col-md-4 col-lg">
      <div class="card text-center"><div class="card-body"><h3>${profiles.length}</h3><p class="text-muted mb-0">Потребители</p></div></div>
    </div>
    <div class="col-6 col-md-4 col-lg">
      <div class="card text-center"><div class="card-body"><h3>${recipes.length}</h3><p class="text-muted mb-0">Рецепти</p></div></div>
    </div>
    <div class="col-6 col-md-4 col-lg">
      <div class="card text-center"><div class="card-body"><h3>${workouts.length}</h3><p class="text-muted mb-0">Тренировки</p></div></div>
    </div>
    <div class="col-6 col-md-4 col-lg">
      <div class="card text-center"><div class="card-body"><h3>${allFoods.length}</h3><p class="text-muted mb-0">Храни</p></div></div>
    </div>
    <div class="col-6 col-md-4 col-lg">
      <div class="card text-center"><div class="card-body"><h3>${adminCount}</h3><p class="text-muted mb-0">Админи</p></div></div>
    </div>`;

  document.getElementById('usersTable').innerHTML = profiles.map((p) => {
    const role = getUserRole(p);
    const displayName = getAuthorDisplayName(p.full_name, role);
    return `
    <tr>
      <td>${displayName}${role === 'admin' ? ' <span class="badge admin-badge">Админ</span>' : ''}</td>
      <td><span class="badge ${role === 'admin' ? 'bg-danger' : 'bg-secondary'}">${role === 'admin' ? 'Админ' : 'Потребител'}</span></td>
      <td>${new Date(p.created_at).toLocaleDateString('bg-BG')}</td>
      <td>
        <button type="button" class="btn btn-sm btn-outline-success" data-edit-user="${p.id}">
          <i class="bi bi-pencil"></i> Редактирай
        </button>
      </td>
    </tr>`;
  }).join('') || '<tr><td colspan="4" class="text-center text-muted">Няма потребители</td></tr>';

  document.getElementById('recipesTable').innerHTML = recipes.map((r) => `
    <tr>
      <td>${r.title}</td>
      <td>${r.authorName || getAuthorDisplayName(r.profiles?.full_name, r.authorRole)}</td>
      <td>${r.calories} kcal</td>
      <td>${new Date(r.created_at).toLocaleDateString('bg-BG')}</td>
      <td class="text-nowrap">
        <a href="/recepti.html?edit=${r.id}" class="btn btn-sm btn-outline-success"><i class="bi bi-pencil"></i></a>
        <a href="/recept.html?id=${r.id}" class="btn btn-sm btn-outline-secondary"><i class="bi bi-eye"></i></a>
        <button class="btn btn-sm btn-outline-danger" data-del-recipe="${r.id}"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`).join('') || '<tr><td colspan="5" class="text-center text-muted">Няма рецепти</td></tr>';

  document.getElementById('workoutsTable').innerHTML = workouts.map((w) => `
    <tr>
      <td>${w.title}</td>
      <td>${w.authorName || '—'}</td>
      <td>${w.duration} мин · ${w.calories} kcal</td>
      <td>${new Date(w.created_at).toLocaleDateString('bg-BG')}</td>
      <td class="text-nowrap">
        <a href="/trenirovki.html?edit=${w.id}" class="btn btn-sm btn-outline-success"><i class="bi bi-pencil"></i></a>
        <a href="/trenirovka.html?id=${w.id}" class="btn btn-sm btn-outline-secondary"><i class="bi bi-eye"></i></a>
        <button class="btn btn-sm btn-outline-danger" data-del-workout="${w.id}"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`).join('') || '<tr><td colspan="5" class="text-center text-muted">Няма тренировки</td></tr>';

  renderFoodsTable();

  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
  const foodMap = Object.fromEntries(allFoods.map((f) => [f.id, f]));

  document.querySelectorAll('[data-edit-user]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const profile = profileMap[btn.dataset.editUser];
      if (profile) openEditUserModal(profile);
    });
  });

  document.querySelectorAll('[data-del-recipe]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Изтриване на рецепта?')) return;
      await deleteRecipe(btn.dataset.delRecipe);
      showToast('Рецептата е изтрита.', 'info');
      initAdmin();
    });
  });

  document.querySelectorAll('[data-del-workout]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Изтриване на тренировката?')) return;
      await deleteUserWorkout(btn.dataset.delWorkout);
      showToast('Тренировката е изтрита.', 'info');
      initAdmin();
    });
  });
}

function bindAdminControls() {
  document.getElementById('addFoodBtn')?.addEventListener('click', () => openEditFoodModal());

  document.getElementById('foodSearchInput')?.addEventListener('input', (e) => {
    foodSearchTerm = e.target.value;
    renderFoodsTable();
  });

  document.getElementById('editUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!editingUserId) return;

    const form = e.target;
    try {
      await updateProfile(editingUserId, {
        full_name: form.elements.full_name.value.trim(),
      });
      await setUserRole(editingUserId, form.elements.role.value);
      getEditUserModal().hide();
      showToast('Потребителят е обновен.');
      await initAdmin();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('editFoodForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const file = form.elements.image.files[0];
    const existingFood = editingFoodId ? allFoods.find((f) => f.id === editingFoodId) : null;
    let imageUrl = existingFood?.image_url || null;

    if (file) {
      const err = validateImageFile(file);
      if (err) { showToast(err, 'error'); return; }
      imageUrl = await uploadFoodImage(file);
    }

    const payload = {
      name: form.elements.foodName.value.trim(),
      category: form.elements.category.value,
      calories: Number(form.elements.calories.value) || 0,
      protein: Number(form.elements.protein.value) || 0,
      carbs: Number(form.elements.carbs.value) || 0,
      fat: Number(form.elements.fat.value) || 0,
      image_url: imageUrl,
    };

    try {
      if (editingFoodId) {
        await updateFood(editingFoodId, payload);
        showToast('Храната е обновена.');
      } else {
        const slug = `${payload.category}-${Date.now()}`;
        await createFood({ ...payload, slug });
        showToast('Храната е добавена.');
      }
      getEditFoodModal().hide();
      await initAdmin();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

bindAdminControls();
initPage(initAdmin, { requireAdmin: true });
