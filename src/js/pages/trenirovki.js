import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { workouts, DIFFICULTY_LEVELS, WORKOUT_GOALS, getDifficultyLabel, getGoalLabel } from '../data/workouts.js';
import { getCurrentUser } from '../auth.js';
import { fetchFavorites, toggleFavorite, isFavorited } from '../services/favorites.js';
import { isSupabaseConfigured } from '../supabaseClient.js';
import { showToast } from '../components/toast.js';

let difficulty = 'all';
let goal = 'all';
let searchTerm = '';
let favorites = [];
let user = null;

function renderWorkouts() {
  const filtered = workouts.filter((w) => {
    const matchSearch = w.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDiff = difficulty === 'all' || w.difficulty === difficulty;
    const matchGoal = goal === 'all' || w.goal === goal;
    return matchSearch && matchDiff && matchGoal;
  });

  document.getElementById('workoutGrid').innerHTML = filtered.map((w) => {
    const fav = user && isFavorited(favorites, 'workout', w.id);
    return `
    <div class="col-md-6 col-lg-4">
      <div class="card card-hover workout-card h-100">
        <div class="position-relative">
          <a href="/trenirovka.html?id=${w.id}"><img src="${w.image}" class="card-img-top" alt="${w.title}"></a>
          <button class="btn btn-sm btn-light position-absolute top-0 end-0 m-2 favorite-btn ${fav ? 'active' : ''}" data-fav="${w.id}" ${!user ? 'disabled title="Влезте за любими"' : ''}>
            <i class="bi bi-heart${fav ? '-fill' : ''}"></i>
          </button>
        </div>
        <div class="card-body">
          <div class="mb-2">
            <span class="badge bg-success-subtle text-success">${getDifficultyLabel(w.difficulty)}</span>
            <span class="badge bg-primary-subtle text-primary">${getGoalLabel(w.goal)}</span>
          </div>
          <h5 class="card-title"><a href="/trenirovka.html?id=${w.id}" class="text-decoration-none text-dark">${w.title}</a></h5>
          <p class="card-text text-muted small">${w.description}</p>
          <div class="text-muted small"><i class="bi bi-clock"></i> ${w.duration} мин · <i class="bi bi-fire text-warning"></i> ${w.calories} kcal</div>
        </div>
      </div>
    </div>`;
  }).join('') || '<div class="col-12 text-center text-muted py-5">Няма намерени тренировки.</div>';

  document.querySelectorAll('[data-fav]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const added = await toggleFavorite(user.id, 'workout', btn.dataset.fav);
      showToast(added ? 'Добавено в любими!' : 'Премахнато от любими.', added ? 'success' : 'info');
      favorites = await fetchFavorites(user.id);
      renderWorkouts();
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

async function initTrenirovki() {
  if (isSupabaseConfigured) {
    user = await getCurrentUser();
    if (user) favorites = await fetchFavorites(user.id);
  }

  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchTerm = e.target.value;
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

  renderFilterButtons();
  renderWorkouts();
}

initPage(initTrenirovki);
