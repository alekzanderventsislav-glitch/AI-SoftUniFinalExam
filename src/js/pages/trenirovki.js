import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Modal } from 'bootstrap';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { workouts as staticWorkouts, DIFFICULTY_LEVELS, WORKOUT_GOALS, getDifficultyLabel, getGoalLabel } from '../data/workouts.js';
import { fetchUserWorkouts, createUserWorkout, updateUserWorkout, deleteUserWorkout } from '../services/workouts.js';
import { getCurrentUser } from '../auth.js';
import { fetchFavorites, toggleFavorite, isFavorited } from '../services/favorites.js';
import { uploadWorkoutImage, validateImageFile } from '../services/storage.js';
import { isSupabaseConfigured } from '../supabaseClient.js';
import { resolveWorkoutImage, workoutImgOnError, escapeHtml, getQueryParam } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

let allWorkouts = [...staticWorkouts];
let difficulty = 'all';
let goal = 'all';
let searchTerm = '';
let showFavoritesOnly = false;
let favorites = [];
let user = null;
let editingId = null;
let pendingDeleteId = null;
let workoutModal = null;
let deleteModal = null;

function getWorkoutModal() {
  if (!workoutModal) {
    workoutModal = new Modal(document.getElementById('workoutFormModal'));
    document.getElementById('workoutFormModal').addEventListener('hidden.bs.modal', () => {
      editingId = null;
    });
  }
  return workoutModal;
}

function getDeleteModal() {
  if (!deleteModal) {
    deleteModal = new Modal(document.getElementById('deleteWorkoutModal'));
    document.getElementById('deleteWorkoutModal').addEventListener('hidden.bs.modal', () => {
      pendingDeleteId = null;
    });
  }
  return deleteModal;
}

function closeFormModal() {
  getWorkoutModal().hide();
  editingId = null;
}

function formField(form, name) {
  return form.elements.namedItem(name);
}

function findWorkout(id) {
  return allWorkouts.find((w) => String(w.id) === String(id));
}

function renderExerciseRows(count, existing = []) {
  const container = document.getElementById('exerciseRows');
  const n = Math.max(1, Math.min(20, Number(count) || 1));
  container.innerHTML = Array.from({ length: n }, (_, i) => {
    const ex = existing[i] || {};
    return `
      <div class="row g-2 align-items-center">
        <div class="col-auto text-muted small fw-semibold">${i + 1}.</div>
        <div class="col-md-7">
          <input type="text" class="form-control form-control-sm" name="exerciseName" placeholder="Име на упражнение" value="${escapeHtml(ex.name || '')}" required />
        </div>
        <div class="col-md-4">
          <input type="text" class="form-control form-control-sm" name="exerciseDuration" placeholder="Продължителност (напр. 3 x 12)" value="${escapeHtml(ex.duration || '')}" required />
        </div>
      </div>`;
  }).join('');
}

function collectExercises(form) {
  const names = [...form.querySelectorAll('[name="exerciseName"]')];
  const durations = [...form.querySelectorAll('[name="exerciseDuration"]')];
  return names.map((input, i) => ({
    name: input.value.trim(),
    duration: durations[i]?.value.trim() || '',
  })).filter((ex) => ex.name && ex.duration);
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

function renderWorkouts() {
  const filtered = allWorkouts.filter((w) => {
    const matchSearch = w.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDiff = difficulty === 'all' || w.difficulty === difficulty;
    const matchGoal = goal === 'all' || w.goal === goal;
    const matchFav = !showFavoritesOnly || (user && isFavorited(favorites, 'workout', w.id));
    return matchSearch && matchDiff && matchGoal && matchFav;
  });

  updateFavoritesToggleBtn();

  document.getElementById('workoutGrid').innerHTML = filtered.map((w) => {
    const fav = user && isFavorited(favorites, 'workout', w.id);
    const isOwner = user && w.isUserCreated && w.author_id === user.id;
    const visibilityBadge = w.isUserCreated && !w.is_public
      ? '<span class="badge bg-secondary-subtle text-secondary">Лична</span>'
      : w.isUserCreated
        ? '<span class="badge bg-info-subtle text-info">Потребителска</span>'
        : '';
    return `
    <div class="col-md-6 col-lg-4">
      <div class="card card-hover workout-card h-100">
        <div class="position-relative">
          <a href="/trenirovka.html?id=${w.id}"><img src="${resolveWorkoutImage(w.image || w.image_url)}" class="card-img-top" alt="${w.title}" loading="lazy" onerror="${workoutImgOnError()}"></a>
          <button class="btn btn-sm btn-light position-absolute top-0 end-0 m-2 favorite-btn ${fav ? 'active' : ''}" data-fav="${w.id}" ${!user ? 'disabled title="Влезте за любими"' : ''}>
            <i class="bi bi-heart${fav ? '-fill' : ''}"></i>
          </button>
        </div>
        <div class="card-body">
          <div class="mb-2">
            <span class="badge bg-success-subtle text-success">${getDifficultyLabel(w.difficulty)}</span>
            <span class="badge bg-primary-subtle text-primary">${getGoalLabel(w.goal)}</span>
            ${visibilityBadge}
          </div>
          <h5 class="card-title"><a href="/trenirovka.html?id=${w.id}" class="text-decoration-none text-dark">${w.title}</a></h5>
          <p class="card-text text-muted small">${w.description}</p>
          <div class="text-muted small"><i class="bi bi-clock"></i> ${w.duration} мин · <i class="bi bi-fire text-warning"></i> ${w.calories} kcal · <i class="bi bi-list-ol"></i> ${(w.exercises || []).length} упр.</div>
          ${w.authorName ? `<div class="text-muted small mt-1">от ${w.authorName}</div>` : ''}
        </div>
        ${isOwner ? `
        <div class="card-footer bg-white d-flex gap-2">
          <button type="button" class="btn btn-sm btn-outline-success flex-fill" data-edit="${w.id}"><i class="bi bi-pencil"></i> Редактирай</button>
          <button type="button" class="btn btn-sm btn-outline-danger flex-fill" data-delete="${w.id}"><i class="bi bi-trash"></i> Изтрий</button>
        </div>` : ''}
      </div>
    </div>`;
  }).join('') || `<div class="col-12 text-center text-muted py-5">${showFavoritesOnly ? 'Нямате любими тренировки.' : 'Няма намерени тренировки.'}</div>`;

  document.querySelectorAll('[data-fav]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const added = await toggleFavorite(user.id, 'workout', btn.dataset.fav);
      showToast(added ? 'Добавено в любими!' : 'Премахнато от любими.', added ? 'success' : 'info');
      favorites = await fetchFavorites(user.id);
      renderWorkouts();
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

function renderFilterButtons() {
  const diffEl = document.getElementById('difficultyFilters');
  const goalEl = document.getElementById('goalFilters');

  diffEl.innerHTML = DIFFICULTY_LEVELS.map((d) => `
    <button type="button" class="btn btn-sm ${d.id === difficulty ? 'btn-success' : 'btn-outline-secondary'}" data-diff="${d.id}">${d.label}</button>
  `).join('');

  goalEl.innerHTML = WORKOUT_GOALS.map((g) => `
    <button type="button" class="btn btn-sm ${g.id === goal ? 'btn-success' : 'btn-outline-secondary'}" data-goal="${g.id}">${g.label}</button>
  `).join('');
}

function openForm(id = null) {
  editingId = id;
  const form = document.getElementById('workoutForm');

  if (id) {
    const workout = findWorkout(id);
    if (!workout?.isUserCreated) {
      showToast('Само вашите тренировки могат да се редактират.', 'error');
      editingId = null;
      return;
    }

    formField(form, 'workoutTitle').value = workout.title;
    formField(form, 'description').value = workout.description;
    formField(form, 'difficulty').value = workout.difficulty;
    formField(form, 'goal').value = workout.goal;
    formField(form, 'duration').value = workout.duration;
    formField(form, 'calories').value = workout.calories;
    formField(form, 'exerciseCount').value = (workout.exercises || []).length || 1;
    form.querySelector(`[name="visibility"][value="${workout.is_public ? 'public' : 'private'}"]`).checked = true;
    renderExerciseRows(formField(form, 'exerciseCount').value, workout.exercises || []);
    document.getElementById('formTitle').textContent = 'Редактирай тренировка';
  } else {
    form.reset();
    formField(form, 'exerciseCount').value = 3;
    form.querySelector('[name="visibility"][value="public"]').checked = true;
    renderExerciseRows(3);
    document.getElementById('formTitle').textContent = 'Нова тренировка';
  }

  getWorkoutModal().show();
}

async function loadData() {
  allWorkouts = [...staticWorkouts];
  if (isSupabaseConfigured) {
    try {
      const userWorkouts = await fetchUserWorkouts();
      allWorkouts = [...staticWorkouts, ...userWorkouts];
    } catch { /* keep static only */ }
  }
  if (user) favorites = await fetchFavorites(user.id);
  renderWorkouts();
}

async function initTrenirovki() {
  if (isSupabaseConfigured) {
    user = await getCurrentUser();
  }

  const uploadBtn = document.getElementById('showFormBtn');
  if (!user) {
    uploadBtn.disabled = true;
    uploadBtn.title = 'Влезте за да добавите тренировка';
  } else {
    uploadBtn.addEventListener('click', () => openForm());
  }

  document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteUserWorkout(pendingDeleteId);
      getDeleteModal().hide();
      showToast('Тренировката е изтрита.', 'info');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  document.getElementById('exerciseCount').addEventListener('input', (e) => {
    const form = document.getElementById('workoutForm');
    const existing = collectExercises(form);
    renderExerciseRows(e.target.value, existing);
  });

  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderWorkouts();
  });

  document.getElementById('favoritesToggleBtn').addEventListener('click', () => {
    showFavoritesOnly = !showFavoritesOnly;
    renderWorkouts();
  });

  document.getElementById('difficultyFilters').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-diff]');
    if (!btn) return;
    difficulty = btn.dataset.diff;
    renderFilterButtons();
    renderWorkouts();
  });

  document.getElementById('goalFilters').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-goal]');
    if (!btn) return;
    goal = btn.dataset.goal;
    renderFilterButtons();
    renderWorkouts();
  });

  document.getElementById('workoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!user) return;

    const form = e.target;
    const exercises = collectExercises(form);
    if (!exercises.length) {
      showToast('Добавете поне едно упражнение.', 'error');
      return;
    }

    const file = form.image.files[0];
    const existingWorkout = editingId ? findWorkout(editingId) : null;
    let imageUrl = existingWorkout?.image_url || existingWorkout?.image || null;

    if (file) {
      const err = validateImageFile(file);
      if (err) { showToast(err, 'error'); return; }
      imageUrl = await uploadWorkoutImage(file, user.id);
    }

    const payload = {
      title: formField(form, 'workoutTitle').value.trim(),
      description: formField(form, 'description').value.trim(),
      difficulty: formField(form, 'difficulty').value,
      goal: formField(form, 'goal').value,
      duration: Number(formField(form, 'duration').value) || 1,
      calories: Number(formField(form, 'calories').value) || 0,
      exercises,
      image_url: imageUrl,
      is_public: form.querySelector('[name="visibility"]:checked').value === 'public',
    };

    try {
      if (editingId) {
        await updateUserWorkout(editingId, payload);
        showToast('Тренировката е обновена!');
      } else {
        await createUserWorkout(payload, user.id);
        showToast('Тренировката е добавена успешно!');
      }
      closeFormModal();
      form.reset();
      renderExerciseRows(3);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  renderFilterButtons();
  await loadData();

  const editId = getQueryParam('edit');
  if (editId && user) {
    openForm(editId);
    window.history.replaceState({}, '', '/trenirovki.html');
  }
}

initPage(initTrenirovki, { requireAuth: true });
