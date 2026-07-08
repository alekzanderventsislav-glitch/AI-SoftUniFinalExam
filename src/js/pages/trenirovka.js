import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { getWorkoutById, getDifficultyLabel, getGoalLabel } from '../data/workouts.js';
import { getCurrentUser } from '../auth.js';
import { fetchFavorites, toggleFavorite, isFavorited } from '../services/favorites.js';
import { isSupabaseConfigured } from '../supabaseClient.js';
import { getQueryParam } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

async function initTrenirovka() {
  const id = getQueryParam('id');
  const workout = getWorkoutById(id);
  if (!workout) {
    window.location.href = '/trenirovki.html';
    return;
  }

  document.getElementById('workoutContent').innerHTML = `
    <div class="row g-4">
      <div class="col-lg-6">
        <img src="${workout.image}" class="img-fluid rounded-3 w-100" alt="${workout.title}">
      </div>
      <div class="col-lg-6">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <span class="badge bg-success-subtle text-success">${getDifficultyLabel(workout.difficulty)}</span>
            <span class="badge bg-primary-subtle text-primary">${getGoalLabel(workout.goal)}</span>
            <h1 class="mt-2">${workout.title}</h1>
            <p class="text-muted">${workout.description}</p>
          </div>
          <button id="favBtn" class="btn btn-outline-danger"><i class="bi bi-heart"></i></button>
        </div>
        <div class="d-flex gap-3 my-4 flex-wrap">
          <div class="bg-success-subtle rounded-3 p-3"><small class="text-muted">Продължителност</small><div class="fw-bold">${workout.duration} мин</div></div>
          <div class="bg-warning-subtle rounded-3 p-3"><small class="text-muted">Калории</small><div class="fw-bold">~${workout.calories} kcal</div></div>
          <div class="bg-primary-subtle rounded-3 p-3"><small class="text-muted">Упражнения</small><div class="fw-bold">${workout.exercises.length}</div></div>
        </div>
        <h4>Упражнения</h4>
        <ol class="list-group list-group-numbered">
          ${workout.exercises.map((ex) => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <span>${ex.name}</span>
              <span class="badge bg-success rounded-pill">${ex.duration}</span>
            </li>`).join('')}
        </ol>
      </div>
    </div>`;

  const favBtn = document.getElementById('favBtn');
  if (isSupabaseConfigured) {
    const user = await getCurrentUser();
    if (user) {
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

initPage(initTrenirovka);
