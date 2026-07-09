import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { getWorkoutById, getDifficultyLabel, getGoalLabel } from '../data/workouts.js';
import { fetchUserWorkoutById } from '../services/workouts.js';
import { getCurrentUser, isAdmin } from '../auth.js';
import { fetchFavorites, toggleFavorite, isFavorited } from '../services/favorites.js';
import { isSupabaseConfigured } from '../supabaseClient.js';
import { getQueryParam, resolveWorkoutImage, workoutImgOnError, canManageContent } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

async function resolveWorkout(id) {
  if (isSupabaseConfigured) {
    try {
      return await fetchUserWorkoutById(id);
    } catch { /* not found */ }
  }
  return getWorkoutById(id);
}

async function initTrenirovka() {
  const id = getQueryParam('id');
  const workout = await resolveWorkout(id);
  if (!workout) {
    window.location.href = '/trenirovki.html';
    return;
  }

  const exercises = workout.exercises || [];
  const visibilityNote = workout.isUserCreated
    ? workout.is_public
      ? '<span class="badge bg-info-subtle text-info">Публична тренировка</span>'
      : '<span class="badge bg-secondary-subtle text-secondary">Лична тренировка</span>'
    : '';

  document.getElementById('workoutContent').innerHTML = `
    <div class="row g-4">
      <div class="col-lg-6">
        <img src="${resolveWorkoutImage(workout.image || workout.image_url)}" class="img-fluid rounded-3 w-100" alt="${workout.title}" loading="lazy" onerror="${workoutImgOnError()}">
      </div>
      <div class="col-lg-6">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <span class="badge bg-success-subtle text-success">${getDifficultyLabel(workout.difficulty)}</span>
            <span class="badge bg-primary-subtle text-primary">${getGoalLabel(workout.goal)}</span>
            ${visibilityNote}
            <h1 class="mt-2">${workout.title}</h1>
            <p class="text-muted">${workout.description}</p>
            ${workout.authorName ? `<p class="small text-muted mb-0"><i class="bi bi-person"></i> ${workout.authorName}</p>` : ''}
          </div>
          <button id="favBtn" class="btn btn-outline-danger"><i class="bi bi-heart"></i></button>
        </div>
        <div class="d-flex gap-3 my-4 flex-wrap">
          <div class="bg-success-subtle rounded-3 p-3"><small class="text-muted">Продължителност</small><div class="fw-bold">${workout.duration} мин</div></div>
          <div class="bg-warning-subtle rounded-3 p-3"><small class="text-muted">Калории</small><div class="fw-bold">~${workout.calories} kcal</div></div>
          <div class="bg-primary-subtle rounded-3 p-3"><small class="text-muted">Упражнения</small><div class="fw-bold">${exercises.length}</div></div>
        </div>
        <h4>Упражнения</h4>
        <ol class="list-group list-group-numbered">
          ${exercises.map((ex) => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <span>${ex.name}</span>
              <span class="badge bg-success rounded-pill">${ex.duration}</span>
            </li>`).join('')}
        </ol>
        <div id="ownerActions" class="mt-4 d-flex gap-2"></div>
      </div>
    </div>`;

  const favBtn = document.getElementById('favBtn');
  if (isSupabaseConfigured) {
    const user = await getCurrentUser();
    const userIsAdmin = user ? await isAdmin() : false;
    if (user) {
      if (workout.isUserCreated && canManageContent(user, workout.author_id, userIsAdmin)) {
        document.getElementById('ownerActions').innerHTML = `
          <a href="/trenirovki.html?edit=${workout.id}" class="btn btn-outline-success">
            <i class="bi bi-pencil"></i> Редактирай
          </a>`;
      }
      let favorites = await fetchFavorites(user.id);
      const fav = isFavorited(favorites, 'workout', workout.id);
      favBtn.innerHTML = `<i class="bi bi-heart${fav ? '-fill' : ''}"></i>`;
      if (fav) favBtn.classList.add('active');

      favBtn.addEventListener('click', async () => {
        const added = await toggleFavorite(user.id, 'workout', workout.id);
        showToast(added ? 'Добавено в любими!' : 'Премахнато от любими.', added ? 'success' : 'info');
        favorites = await fetchFavorites(user.id);
        const isFav = isFavorited(favorites, 'workout', workout.id);
        favBtn.innerHTML = `<i class="bi bi-heart${isFav ? '-fill' : ''}"></i>`;
      });
    } else {
      favBtn.disabled = true;
      favBtn.title = 'Влезте за любими';
    }
  } else {
    favBtn.disabled = true;
  }
}

initPage(initTrenirovka, { requireAuth: true });
