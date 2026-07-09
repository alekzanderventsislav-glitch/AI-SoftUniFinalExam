import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { getRandomTip } from '../data/tips.js';
import { workouts } from '../data/workouts.js';
import { fetchRecipes } from '../services/recipes.js';
import { fetchProfile } from '../services/profiles.js';
import { getCurrentUser } from '../auth.js';
import { isSupabaseConfigured } from '../supabaseClient.js';
import { loadDailyTracker, saveDailyTracker, resolveWorkoutImage, workoutImgOnError, resolveRecipeImage, recipeImgOnError } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

let memberProfile = null;
let memberDashboardReady = false;

function setDailyTips() {
  const tip = getRandomTip();
  document.getElementById('dailyTip').textContent = tip;
  const memberTip = document.getElementById('memberDailyTip');
  if (memberTip) memberTip.textContent = tip;
}

function showGuestHome() {
  document.getElementById('guestHome')?.classList.remove('d-none');
  document.getElementById('memberHome')?.classList.add('d-none');
}

function showMemberHome() {
  document.getElementById('guestHome')?.classList.add('d-none');
  document.getElementById('memberHome')?.classList.remove('d-none');
}

function updateTrackerUI(profile = memberProfile) {
  if (!profile) return;

  const tracker = loadDailyTracker();
  const calPct = Math.min(Math.round((tracker.calories / profile.target_calories) * 100), 100);
  const waterPct = Math.min(Math.round((tracker.water / profile.water_goal) * 100), 100);

  document.getElementById('caloriesBar').style.width = `${calPct}%`;
  document.getElementById('waterBar').style.width = `${waterPct}%`;
  document.getElementById('caloriesText').textContent = `${tracker.calories} / ${profile.target_calories} kcal`;
  document.getElementById('waterText').textContent = `${tracker.water} / ${profile.water_goal} чаши`;
}

function bindTrackerControls() {
  document.querySelectorAll('[data-add-cal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const t = loadDailyTracker();
      t.calories = Math.min(t.calories + Number(btn.dataset.addCal), 5000);
      saveDailyTracker(t);
      updateTrackerUI();
    });
  });

  document.querySelectorAll('[data-sub-cal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const t = loadDailyTracker();
      t.calories = Math.max(0, t.calories - Number(btn.dataset.subCal));
      saveDailyTracker(t);
      updateTrackerUI();
    });
  });

  document.getElementById('addWaterBtn')?.addEventListener('click', () => {
    const t = loadDailyTracker();
    t.water = Math.min(t.water + 1, 20);
    saveDailyTracker(t);
    showToast('Чаша вода добавена!', 'info');
    updateTrackerUI();
  });

  document.getElementById('removeWaterBtn')?.addEventListener('click', () => {
    const t = loadDailyTracker();
    t.water = Math.max(0, t.water - 1);
    saveDailyTracker(t);
    showToast('Чаша вода премахната.', 'info');
    updateTrackerUI();
  });
}

async function renderFeaturedContent() {
  const recipesGrid = document.getElementById('featuredRecipes');
  const workoutsGrid = document.getElementById('featuredWorkouts');

  let recipes = [];
  if (isSupabaseConfigured) {
    try {
      recipes = (await fetchRecipes()).slice(0, 3);
    } catch { /* empty */ }
  }

  recipesGrid.innerHTML = recipes.length
    ? recipes.map((r) => `
      <div class="col-md-4">
        <a href="/recept.html?id=${r.id}" class="card card-hover recipe-card text-decoration-none text-dark h-100">
          <img src="${resolveRecipeImage(r.image_url)}" class="card-img-top" alt="${r.title}" loading="lazy" onerror="${recipeImgOnError()}">
          <div class="card-body">
            <h5 class="card-title">${r.title}</h5>
            <p class="card-text text-muted small">${r.description}</p>
            <span class="text-success fw-semibold">${r.calories} kcal</span>
          </div>
        </a>
      </div>`).join('')
    : '<div class="col-12"><p class="text-muted">Все още няма рецепти от общността.</p></div>';

  workoutsGrid.innerHTML = workouts.slice(0, 3).map((w) => `
    <div class="col-md-4">
      <a href="/trenirovka.html?id=${w.id}" class="card card-hover workout-card text-decoration-none text-dark h-100">
        <img src="${resolveWorkoutImage(w.image)}" class="card-img-top" alt="${w.title}" loading="lazy" onerror="${workoutImgOnError()}">
        <div class="card-body">
          <h5 class="card-title">${w.title}</h5>
          <p class="text-muted small mb-0">${w.duration} мин · ${w.calories} kcal</p>
        </div>
      </a>
    </div>`).join('');
}

async function initMemberDashboard(user) {
  if (!memberProfile) {
    try {
      memberProfile = await fetchProfile(user.id);
    } catch {
      memberProfile = { target_calories: 2000, water_goal: 8 };
    }
  }

  updateTrackerUI(memberProfile);

  if (memberDashboardReady) return;
  memberDashboardReady = true;

  bindTrackerControls();
  await renderFeaturedContent();
}

async function initHome() {
  setDailyTips();

  const user = isSupabaseConfigured ? await getCurrentUser() : null;

  if (!user) {
    showGuestHome();
    return;
  }

  showMemberHome();
  await initMemberDashboard(user);
}

initPage(initHome);
