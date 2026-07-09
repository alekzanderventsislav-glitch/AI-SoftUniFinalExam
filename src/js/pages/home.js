import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Modal } from 'bootstrap';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { getDailyTip, getDailyMotivation } from '../data/tips.js';
import { workouts as staticWorkouts } from '../data/workouts.js';
import { foods } from '../data/foods.js';
import { fetchRecipes } from '../services/recipes.js';
import { fetchUserWorkouts } from '../services/workouts.js';
import { fetchProfile } from '../services/profiles.js';
import { fetchFavorites } from '../services/favorites.js';
import { getFoodFavorites } from '../services/foodFavorites.js';
import { getCurrentUser } from '../auth.js';
import { isSupabaseConfigured } from '../supabaseClient.js';
import {
  loadDailyTracker,
  saveDailyTracker,
  loadTrackerRange,
  getTodayKey,
  addDaysToDateKey,
  formatTrackerDateLabel,
  isTrackerToday,
  resolveWorkoutImage,
  workoutImgOnError,
  resolveRecipeImage,
  recipeImgOnError,
} from '../utils/helpers.js';
import { showToast } from '../components/toast.js';
import { initTrackerCalendar } from '../components/trackerCalendar.js';
import { renderSvgLineChart, buildChartLabels } from '../components/statsCharts.js';

let memberProfile = null;
let memberUser = null;
let memberDashboardReady = false;
let selectedTrackerDate = getTodayKey();
let statsRangeFrom = addDaysToDateKey(getTodayKey(), -6);
let statsRangeTo = getTodayKey();
let statsFromCalendarApi = null;
let statsToCalendarApi = null;
let trackerCalendarApi = null;
let dashboardData = {
  recipes: [],
  userWorkouts: [],
  favorites: [],
};
let statsModal = null;

function setDailyTips() {
  const today = getTodayKey();
  const tip = getDailyTip(today);
  const motivation = getDailyMotivation(today);

  document.getElementById('dailyTip').textContent = tip;
  document.getElementById('dailyMotivation').textContent = motivation;

  const memberTip = document.getElementById('memberDailyTip');
  const memberMotivation = document.getElementById('memberDailyMotivation');
  if (memberTip) memberTip.textContent = tip;
  if (memberMotivation) memberMotivation.textContent = motivation;
}

function showGuestHome() {
  document.getElementById('guestHome')?.classList.remove('d-none');
  document.getElementById('memberHome')?.classList.add('d-none');
}

function showMemberHome() {
  document.getElementById('guestHome')?.classList.add('d-none');
  document.getElementById('memberHome')?.classList.remove('d-none');
}

function getStatsModal() {
  if (!statsModal) {
    statsModal = new Modal(document.getElementById('statsModal'));
  }
  return statsModal;
}

function updateTrackerUI(profile = memberProfile) {
  if (!profile) return;

  const tracker = loadDailyTracker(selectedTrackerDate);
  const calPct = Math.min(Math.round((tracker.calories / profile.target_calories) * 100), 100);
  const waterPct = Math.min(Math.round((tracker.water / profile.water_goal) * 100), 100);

  document.getElementById('caloriesBar').style.width = `${calPct}%`;
  document.getElementById('waterBar').style.width = `${waterPct}%`;
  document.getElementById('caloriesText').textContent = `${tracker.calories} / ${profile.target_calories} kcal`;
  document.getElementById('waterText').textContent = `${tracker.water} / ${profile.water_goal} чаши`;

  const hiddenDate = document.getElementById('trackerDate');
  if (hiddenDate) hiddenDate.value = selectedTrackerDate;
  trackerCalendarApi?.updateChip();
}

function renderAvailabilityCard() {
  const listEl = document.getElementById('availabilityList');
  if (!listEl) return;

  const totalWorkouts = staticWorkouts.length + dashboardData.userWorkouts.length;
  const myRecipes = memberUser
    ? dashboardData.recipes.filter((r) => r.author_id === memberUser.id).length
    : 0;
  const myWorkouts = memberUser
    ? dashboardData.userWorkouts.filter((w) => w.author_id === memberUser.id).length
    : 0;

  const items = [
    { icon: 'bi-egg-fried', label: 'Храни в каталога', count: foods.length, href: '/hrani.html' },
    { icon: 'bi-journal-richtext', label: 'Споделени рецепти', count: dashboardData.recipes.length, href: '/recepti.html' },
    { icon: 'bi-lightning', label: 'Тренировки', count: totalWorkouts, href: '/trenirovki.html' },
    { icon: 'bi-upload', label: 'Ваши рецепти', count: myRecipes, href: '/recepti.html' },
    { icon: 'bi-plus-circle', label: 'Ваши тренировки', count: myWorkouts, href: '/trenirovki.html' },
  ];

  listEl.innerHTML = items.map((item) => `
    <li class="d-flex justify-content-between align-items-center py-1 border-bottom border-light-subtle">
      <a href="${item.href}" class="text-decoration-none text-dark">
        <i class="bi ${item.icon} text-success"></i> ${item.label}
      </a>
      <span class="badge bg-success-subtle text-success">${item.count}</span>
    </li>`).join('');
}

function renderStatsModal() {
  const body = document.getElementById('statsModalBody');
  if (!body || !memberProfile) return;

  statsFromCalendarApi?.destroy?.();
  statsToCalendarApi?.destroy?.();
  statsFromCalendarApi = null;
  statsToCalendarApi = null;

  body.innerHTML = `
    <div class="stats-range-bar">
      <div class="stats-range-picker">
        <span class="stats-range-picker-label">От</span>
        <div class="tracker-day-picker" id="statsFromPicker">
          <button type="button" class="tracker-date-chip tracker-date-chip--compact" id="statsFromChip" aria-haspopup="dialog" aria-expanded="false">
            <span class="tracker-date-chip__icon"><i class="bi bi-calendar-event"></i></span>
            <span class="tracker-date-chip__text">
              <span class="tracker-date-chip__primary" id="statsFromPrimary"></span>
              <span class="tracker-date-chip__secondary" id="statsFromSecondary"></span>
            </span>
            <i class="bi bi-chevron-down tracker-date-chip__chevron"></i>
          </button>
          <div class="md-calendar-popup" id="statsFromCalendar" hidden></div>
        </div>
      </div>
      <span class="stats-range-sep"><i class="bi bi-arrow-right"></i></span>
      <div class="stats-range-picker">
        <span class="stats-range-picker-label">До</span>
        <div class="tracker-day-picker" id="statsToPicker">
          <button type="button" class="tracker-date-chip tracker-date-chip--compact" id="statsToChip" aria-haspopup="dialog" aria-expanded="false">
            <span class="tracker-date-chip__icon"><i class="bi bi-calendar-event"></i></span>
            <span class="tracker-date-chip__text">
              <span class="tracker-date-chip__primary" id="statsToPrimary"></span>
              <span class="tracker-date-chip__secondary" id="statsToSecondary"></span>
            </span>
            <i class="bi bi-chevron-down tracker-date-chip__chevron"></i>
          </button>
          <div class="md-calendar-popup" id="statsToCalendar" hidden></div>
        </div>
      </div>
    </div>

    <div class="row g-2 mb-3" id="statsPeriodSummary"></div>

    <div class="row g-3 mb-4">
      <div class="col-lg-6">
        <div id="statsCaloriesChart"></div>
      </div>
      <div class="col-lg-6">
        <div id="statsWaterChart"></div>
      </div>
    </div>

    <h6 class="text-muted small text-uppercase mb-2" id="statsDaySnapshotTitle">Дневни данни</h6>
    <div class="row g-3 mb-4" id="statsDaySnapshot"></div>

    <h6 class="text-success mb-3"><i class="bi bi-person-check"></i> Вашата активност</h6>
    <div class="row g-2 mb-4" id="statsActivityTiles"></div>

    <h6 class="text-success mb-3"><i class="bi bi-collection"></i> Налично в портала</h6>
    <div class="row g-2" id="statsPortalTiles"></div>`;

  initStatsRangeCalendars();
  updateStatsModalContent();
}

function normalizeStatsRange() {
  if (statsRangeFrom > statsRangeTo) {
    [statsRangeFrom, statsRangeTo] = [statsRangeTo, statsRangeFrom];
  }
}

function initStatsRangeCalendars() {
  statsFromCalendarApi = initTrackerCalendar({
    chipEl: document.getElementById('statsFromChip'),
    primaryEl: document.getElementById('statsFromPrimary'),
    secondaryEl: document.getElementById('statsFromSecondary'),
    popupEl: document.getElementById('statsFromCalendar'),
    rootEl: document.getElementById('statsFromPicker'),
    getSelectedDate: () => statsRangeFrom,
    setSelectedDate: (dateKey) => { statsRangeFrom = dateKey; },
    getTodayKey,
    useFixedPosition: true,
    onDateChange: () => {
      normalizeStatsRange();
      statsToCalendarApi?.updateChip();
      updateStatsModalContent();
    },
  });

  statsToCalendarApi = initTrackerCalendar({
    chipEl: document.getElementById('statsToChip'),
    primaryEl: document.getElementById('statsToPrimary'),
    secondaryEl: document.getElementById('statsToSecondary'),
    popupEl: document.getElementById('statsToCalendar'),
    rootEl: document.getElementById('statsToPicker'),
    getSelectedDate: () => statsRangeTo,
    setSelectedDate: (dateKey) => { statsRangeTo = dateKey; },
    getTodayKey,
    useFixedPosition: true,
    onDateChange: () => {
      normalizeStatsRange();
      statsFromCalendarApi?.updateChip();
      updateStatsModalContent();
    },
  });
}

function applyStatsRange() {
  normalizeStatsRange();
  statsFromCalendarApi?.updateChip();
  statsToCalendarApi?.updateChip();
  updateStatsModalContent();
}

function updateStatsModalContent() {
  if (!memberProfile) return;

  const rangeData = loadTrackerRange(statsRangeFrom, statsRangeTo);
  const labels = buildChartLabels(rangeData.map((d) => d.dateKey));
  const calories = rangeData.map((d) => d.calories);
  const water = rangeData.map((d) => d.water);
  const totalCal = calories.reduce((s, v) => s + v, 0);
  const totalWater = water.reduce((s, v) => s + v, 0);
  const days = rangeData.length || 1;
  const activeDays = rangeData.filter((d) => d.calories > 0 || d.water > 0).length;

  const summaryEl = document.getElementById('statsPeriodSummary');
  if (summaryEl) {
    summaryEl.innerHTML = `
      ${periodChip('Общо калории', `${totalCal} kcal`, 'bi-fire text-warning')}
      ${periodChip('Средно калории', `${Math.round(totalCal / days)} kcal`, 'bi-graph-up')}
      ${periodChip('Общо вода', `${totalWater} чаши`, 'bi-droplet text-primary')}
      ${periodChip('Активни дни', `${activeDays} / ${days}`, 'bi-calendar-check')}`;
  }

  const calChart = document.getElementById('statsCaloriesChart');
  const waterChart = document.getElementById('statsWaterChart');
  if (calChart) {
    renderSvgLineChart(calChart, {
      labels,
      values: calories,
      color: '#fd7e14',
      goal: memberProfile.target_calories,
      unit: 'kcal',
      title: 'Калории по дни',
      icon: 'bi-fire text-warning',
    });
  }
  if (waterChart) {
    renderSvgLineChart(waterChart, {
      labels,
      values: water,
      color: '#0d6efd',
      goal: memberProfile.water_goal,
      unit: 'чаши',
      title: 'Вода по дни',
      icon: 'bi-droplet text-primary',
    });
  }

  const tracker = loadDailyTracker(selectedTrackerDate);
  const snapshotTitle = isTrackerToday(selectedTrackerDate)
    ? 'Данни към днес'
    : `Данни към ${formatTrackerDateLabel(selectedTrackerDate)}`;
  const calPct = Math.min(Math.round((tracker.calories / memberProfile.target_calories) * 100), 100);
  const waterPct = Math.min(Math.round((tracker.water / memberProfile.water_goal) * 100), 100);

  const snapshotTitleEl = document.getElementById('statsDaySnapshotTitle');
  if (snapshotTitleEl) snapshotTitleEl.textContent = snapshotTitle;

  const snapshotEl = document.getElementById('statsDaySnapshot');
  if (snapshotEl) {
    snapshotEl.innerHTML = `
      <div class="col-md-6">
        <div class="border rounded-3 p-3 h-100">
          <div class="d-flex justify-content-between small mb-2">
            <span><i class="bi bi-fire text-warning"></i> Калории</span>
            <strong>${tracker.calories} / ${memberProfile.target_calories} kcal</strong>
          </div>
          <div class="progress progress-calories" style="height:8px">
            <div class="progress-bar" style="width:${calPct}%"></div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="border rounded-3 p-3 h-100">
          <div class="d-flex justify-content-between small mb-2">
            <span><i class="bi bi-droplet text-primary"></i> Вода</span>
            <strong>${tracker.water} / ${memberProfile.water_goal} чаши</strong>
          </div>
          <div class="progress progress-water" style="height:8px">
            <div class="progress-bar" style="width:${waterPct}%"></div>
          </div>
        </div>
      </div>`;
  }

  const favRecipes = dashboardData.favorites.filter((f) => f.item_type === 'recipe').length;
  const favWorkouts = dashboardData.favorites.filter((f) => f.item_type === 'workout').length;
  const foodFavs = getFoodFavorites().length;
  const myRecipes = memberUser
    ? dashboardData.recipes.filter((r) => r.author_id === memberUser.id).length
    : 0;
  const myWorkouts = memberUser
    ? dashboardData.userWorkouts.filter((w) => w.author_id === memberUser.id).length
    : 0;
  const totalWorkouts = staticWorkouts.length + dashboardData.userWorkouts.length;

  const activityEl = document.getElementById('statsActivityTiles');
  if (activityEl) {
    activityEl.innerHTML = [
      statTile('Качени рецепти', myRecipes, 'bi-journal-plus'),
      statTile('Създадени тренировки', myWorkouts, 'bi-plus-lg'),
      statTile('Любими рецепти', favRecipes, 'bi-heart'),
      statTile('Любими тренировки', favWorkouts, 'bi-heart'),
      statTile('Любими храни', foodFavs, 'bi-heart'),
    ].join('');
  }

  const portalEl = document.getElementById('statsPortalTiles');
  if (portalEl) {
    portalEl.innerHTML = [
      statTile('Храни в каталога', foods.length, 'bi-egg-fried'),
      statTile('Общо рецепти', dashboardData.recipes.length, 'bi-journal-richtext'),
      statTile('Общо тренировки', totalWorkouts, 'bi-lightning'),
    ].join('');
  }
}

function periodChip(label, value, icon) {
  return `
    <div class="col-6 col-md-3">
      <div class="stats-period-chip">
        <i class="bi ${icon}"></i>
        <div>
          <div class="stats-period-chip__value">${value}</div>
          <div class="stats-period-chip__label">${label}</div>
        </div>
      </div>
    </div>`;
}

function statTile(label, value, icon) {
  return `
    <div class="col-sm-6 col-lg-4">
      <div class="bg-light rounded-3 p-3 text-center h-100">
        <i class="bi ${icon} text-success fs-5"></i>
        <div class="fw-bold fs-4 mt-1">${value}</div>
        <small class="text-muted">${label}</small>
      </div>
    </div>`;
}

async function loadDashboardData(user) {
  dashboardData = { recipes: [], userWorkouts: [], favorites: [] };

  if (!isSupabaseConfigured) return;

  try {
    dashboardData.recipes = await fetchRecipes();
  } catch { /* empty */ }

  try {
    dashboardData.userWorkouts = await fetchUserWorkouts();
  } catch { /* empty */ }

  try {
    dashboardData.favorites = await fetchFavorites(user.id);
  } catch { /* empty */ }
}

function bindTrackerControls() {
  trackerCalendarApi = initTrackerCalendar({
    chipEl: document.getElementById('trackerDateChip'),
    primaryEl: document.getElementById('trackerDatePrimary'),
    secondaryEl: document.getElementById('trackerDateSecondary'),
    popupEl: document.getElementById('trackerCalendar'),
    todayBtnEl: document.getElementById('trackerTodayBtn'),
    getSelectedDate: () => selectedTrackerDate,
    setSelectedDate: (dateKey) => { selectedTrackerDate = dateKey; },
    getTodayKey,
    onDateChange: () => updateTrackerUI(memberProfile),
  });

  document.getElementById('openStatsBtn')?.addEventListener('click', () => {
    renderStatsModal();
    getStatsModal().show();
  });

  document.querySelectorAll('[data-add-cal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const t = loadDailyTracker(selectedTrackerDate);
      t.calories = Math.min(t.calories + Number(btn.dataset.addCal), 5000);
      saveDailyTracker(t, selectedTrackerDate);
      updateTrackerUI();
    });
  });

  document.querySelectorAll('[data-sub-cal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const t = loadDailyTracker(selectedTrackerDate);
      t.calories = Math.max(0, t.calories - Number(btn.dataset.subCal));
      saveDailyTracker(t, selectedTrackerDate);
      updateTrackerUI();
    });
  });

  document.getElementById('addWaterBtn')?.addEventListener('click', () => {
    const t = loadDailyTracker(selectedTrackerDate);
    t.water = Math.min(t.water + 1, 20);
    saveDailyTracker(t, selectedTrackerDate);
    showToast('Чаша вода добавена!', 'info');
    updateTrackerUI();
  });

  document.getElementById('removeWaterBtn')?.addEventListener('click', () => {
    const t = loadDailyTracker(selectedTrackerDate);
    t.water = Math.max(0, t.water - 1);
    saveDailyTracker(t, selectedTrackerDate);
    showToast('Чаша вода премахната.', 'info');
    updateTrackerUI();
  });
}

async function renderFeaturedContent() {
  const recipesGrid = document.getElementById('featuredRecipes');
  const workoutsGrid = document.getElementById('featuredWorkouts');

  const recipes = dashboardData.recipes.slice(0, 3);
  const featuredWorkouts = [...staticWorkouts, ...dashboardData.userWorkouts].slice(0, 3);

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

  workoutsGrid.innerHTML = featuredWorkouts.map((w) => `
    <div class="col-md-4">
      <a href="/trenirovka.html?id=${w.id}" class="card card-hover workout-card text-decoration-none text-dark h-100">
        <img src="${resolveWorkoutImage(w.image || w.image_url)}" class="card-img-top" alt="${w.title}" loading="lazy" onerror="${workoutImgOnError()}">
        <div class="card-body">
          <h5 class="card-title">${w.title}</h5>
          <p class="text-muted small mb-0">${w.duration} мин · ${w.calories} kcal</p>
        </div>
      </a>
    </div>`).join('');
}

async function initMemberDashboard(user) {
  memberUser = user;

  if (!memberProfile) {
    try {
      memberProfile = await fetchProfile(user.id);
    } catch {
      memberProfile = { target_calories: 2000, water_goal: 8 };
    }
  }

  await loadDashboardData(user);
  renderAvailabilityCard();
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
