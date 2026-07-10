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
import { getCurrentUser, getUserRole as getAuthUserRole } from '../auth.js';
import {
  getRoleBadgeClass,
  getRoleLabel,
  getStaffTabs,
  pickPrimaryRole,
} from '../data/roles.js';
import { getAuthorDisplayName } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

const FOOD_CATEGORY_OPTIONS = FOOD_CATEGORIES.filter((c) => c.id !== 'favorites');

let editUserModal = null;
let editFoodModal = null;
let editingUserId = null;
let editingUserRole = null;
let editingFoodId = null;
let allFoods = [];
let foodSearchTerm = '';
let staffRole = 'user';

function getEditUserModal() {
  if (!editUserModal) {
    editUserModal = new Modal(document.getElementById('editUserModal'));
    document.getElementById('editUserModal').addEventListener('hidden.bs.modal', () => {
      editingUserId = null;
      editingUserRole = null;
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

function getProfileRole(profile) {
  return pickPrimaryRole(profile.user_roles || []);
}

function renderRoleBadge(role) {
  return `<span class="badge ${getRoleBadgeClass(role)}">${getRoleLabel(role)}</span>`;
}

function configureStaffTabs() {
  const allowed = getStaffTabs(staffRole);
  const tabMap = {
    users: 'users-tab',
    recipes: 'recipes-tab',
    workouts: 'workouts-tab',
    foods: 'foods-tab',
  };

  Object.entries(tabMap).forEach(([key, id]) => {
    const tabBtn = document.getElementById(id);
    const panel = document.getElementById(`${key}Panel`);
    const visible = allowed.includes(key);
    tabBtn?.closest('li')?.classList.toggle('d-none', !visible);
    if (!visible) {
      tabBtn?.classList.remove('active');
      panel?.classList.remove('show', 'active');
    }
  });

  const firstTab = allowed[0];
  if (firstTab) {
    document.getElementById(tabMap[firstTab])?.classList.add('active');
    document.getElementById(`${firstTab}Panel`)?.classList.add('show', 'active');
  }
}

function openEditUserModal(profile) {
  editingUserId = profile.id;
  editingUserRole = getProfileRole(profile);
  const form = document.getElementById('editUserForm');
  form.elements.userId.value = profile.id;
  form.elements.full_name.value = getAuthorDisplayName(profile.full_name, editingUserRole);
  form.elements.role.value = editingUserRole;
  form.elements.phone.value = profile.phone || '';
  form.elements.address.value = profile.address || '';
  form.elements.profession.value = profile.profession || '';
  form.elements.mfa_required.checked = Boolean(profile.mfa_required);
  getEditUserModal().show();
}

async function toggleUserMfa(userId, required) {
  await updateProfile(userId, { mfa_required: required });
  showToast(required ? '2FA е включена за потребителя.' : '2FA е изключена за потребителя.');
  await initAdmin();
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
  const tabs = getStaffTabs(staffRole);

  try {
    const tasks = [];
    if (tabs.includes('recipes')) tasks.push(fetchAllRecipesAdmin().then((r) => { recipes = r; }));
    if (tabs.includes('users')) tasks.push(fetchAllProfilesAdmin().then((r) => { profiles = r; }));
    if (tabs.includes('workouts')) tasks.push(fetchAllUserWorkoutsAdmin().then((r) => { workouts = r; }));
    if (tabs.includes('foods')) tasks.push(fetchAllFoodsAdmin().then((r) => { allFoods = r; }));
    await Promise.all(tasks);
  } catch (err) {
    loadError = err.message || 'Грешка при зареждане на данните.';
    if (tabs.includes('users')) try { profiles = await fetchAllProfilesAdmin(); } catch { /* ignore */ }
    if (tabs.includes('recipes')) try { recipes = await fetchAllRecipesAdmin(); } catch { /* ignore */ }
    if (tabs.includes('workouts')) try { workouts = await fetchAllUserWorkoutsAdmin(); } catch { /* ignore */ }
    if (tabs.includes('foods')) try { allFoods = await fetchAllFoodsAdmin(); } catch { /* ignore */ }
  }

  document.querySelectorAll('main .alert.alert-warning').forEach((el) => el.remove());
  if (loadError) {
    document.querySelector('main .page-header')?.insertAdjacentHTML(
      'afterend',
      `<div class="alert alert-warning"><i class="bi bi-exclamation-triangle"></i> ${loadError}</div>`,
    );
  }

  const adminCount = profiles.filter((p) => getProfileRole(p) === 'admin').length;
  const trainerCount = profiles.filter((p) => getProfileRole(p) === 'trainer').length;
  const dietitianCount = profiles.filter((p) => getProfileRole(p) === 'dietitian').length;

  const stats = [];
  if (tabs.includes('users')) {
    stats.push(`<div class="col-6 col-md-4 col-lg"><div class="card text-center"><div class="card-body"><h3>${profiles.length}</h3><p class="text-muted mb-0">Потребители</p></div></div></div>`);
    stats.push(`<div class="col-6 col-md-4 col-lg"><div class="card text-center"><div class="card-body"><h3>${adminCount}</h3><p class="text-muted mb-0">Админи</p></div></div></div>`);
    stats.push(`<div class="col-6 col-md-4 col-lg"><div class="card text-center"><div class="card-body"><h3>${trainerCount}</h3><p class="text-muted mb-0">Треньори</p></div></div></div>`);
    stats.push(`<div class="col-6 col-md-4 col-lg"><div class="card text-center"><div class="card-body"><h3>${dietitianCount}</h3><p class="text-muted mb-0">Диетолози</p></div></div></div>`);
  }
  if (tabs.includes('recipes')) {
    stats.push(`<div class="col-6 col-md-4 col-lg"><div class="card text-center"><div class="card-body"><h3>${recipes.length}</h3><p class="text-muted mb-0">Рецепти</p></div></div></div>`);
  }
  if (tabs.includes('workouts')) {
    stats.push(`<div class="col-6 col-md-4 col-lg"><div class="card text-center"><div class="card-body"><h3>${workouts.length}</h3><p class="text-muted mb-0">Тренировки</p></div></div></div>`);
  }
  if (tabs.includes('foods')) {
    stats.push(`<div class="col-6 col-md-4 col-lg"><div class="card text-center"><div class="card-body"><h3>${allFoods.length}</h3><p class="text-muted mb-0">Храни</p></div></div></div>`);
  }
  document.getElementById('adminStats').innerHTML = stats.join('');

  if (tabs.includes('users')) {
    document.getElementById('usersTable').innerHTML = profiles.map((p) => {
      const role = getProfileRole(p);
      const displayName = getAuthorDisplayName(p.full_name, role);
      return `
      <tr>
        <td>${displayName}${role !== 'user' ? ` ${renderRoleBadge(role)}` : ''}</td>
        <td>${p.phone || '<span class="text-muted">—</span>'}</td>
        <td>${p.profession || '<span class="text-muted">—</span>'}</td>
        <td>${renderRoleBadge(role)}</td>
        <td>
          <div class="form-check form-switch mb-0">
            <input class="form-check-input" type="checkbox" role="switch" data-mfa-toggle="${p.id}" ${p.mfa_required ? 'checked' : ''} aria-label="2FA за ${displayName}" />
          </div>
        </td>
        <td>${new Date(p.created_at).toLocaleDateString('bg-BG')}</td>
        <td>
          <button type="button" class="btn btn-sm btn-outline-success" data-edit-user="${p.id}">
            <i class="bi bi-pencil"></i> Редактирай
          </button>
        </td>
      </tr>`;
    }).join('') || '<tr><td colspan="7" class="text-center text-muted">Няма потребители</td></tr>';
  }

  if (tabs.includes('recipes')) {
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
  }

  if (tabs.includes('workouts')) {
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
  }

  if (tabs.includes('foods')) {
    renderFoodsTable();
  }

  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
  const foodMap = Object.fromEntries(allFoods.map((f) => [f.id, f]));

  document.querySelectorAll('[data-edit-user]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const profile = profileMap[btn.dataset.editUser];
      if (profile) openEditUserModal(profile);
    });
  });

  document.querySelectorAll('[data-mfa-toggle]').forEach((input) => {
    input.addEventListener('change', async () => {
      const userId = input.dataset.mfaToggle;
      const required = input.checked;
      input.disabled = true;
      try {
        await toggleUserMfa(userId, required);
      } catch (err) {
        input.checked = !required;
        showToast(err.message, 'error');
      } finally {
        input.disabled = false;
      }
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
        phone: form.elements.phone.value.trim(),
        address: form.elements.address.value.trim(),
        profession: form.elements.profession.value.trim(),
        mfa_required: form.elements.mfa_required.checked,
      });
      const newRole = form.elements.role.value;
      if (newRole !== editingUserRole) {
        await setUserRole(editingUserId, newRole);
      }
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

async function bootAdmin() {
  const user = await getCurrentUser();
  if (!user) return;
  staffRole = await getAuthUserRole(user.id);
  configureStaffTabs();

  const subtitle = document.querySelector('main .page-header p');
  if (subtitle && staffRole === 'trainer') {
    subtitle.textContent = 'Управление на тренировки';
  } else if (subtitle && staffRole === 'dietitian') {
    subtitle.textContent = 'Управление на рецепти и храни';
  }

  await initAdmin();
}

initPage(bootAdmin, { requireAdmin: true });
