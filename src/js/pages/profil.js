import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { getCurrentUser, getUserRole } from '../auth.js';
import { fetchProfile, updateProfile } from '../services/profiles.js';
import { fetchFavorites } from '../services/favorites.js';
import { fetchRecipeById } from '../services/recipes.js';
import { fetchUserWorkoutById } from '../services/workouts.js';
import { getWorkoutById } from '../data/workouts.js';
import { isSupabaseConfigured } from '../supabaseClient.js';
import { resolveRecipeImage, recipeImgOnError, resolveWorkoutImage, workoutImgOnError, getAuthorDisplayName } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

async function initProfil() {
  const content = document.getElementById('profileContent');

  if (!isSupabaseConfigured) {
    content.innerHTML = '<div class="alert alert-warning">Конфигурирайте Supabase.</div>';
    return;
  }

  const user = await getCurrentUser();
  if (!user) return;

  const profile = await fetchProfile(user.id);
  const role = await getUserRole(user.id);
  const displayName = getAuthorDisplayName(profile.full_name, role);
  const favorites = await fetchFavorites(user.id);

  const favRecipes = [];
  for (const f of favorites.filter((x) => x.item_type === 'recipe')) {
    try { favRecipes.push(await fetchRecipeById(f.item_id)); } catch { /* skip */ }
  }
  const favWorkouts = [];
  for (const f of favorites.filter((x) => x.item_type === 'workout')) {
    try {
      favWorkouts.push(await fetchUserWorkoutById(f.item_id));
      continue;
    } catch { /* skip */ }
    const staticW = getWorkoutById(f.item_id);
    if (staticW) favWorkouts.push(staticW);
  }

  content.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-4">
        <div class="card">
          <div class="card-body text-center">
            <div class="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center" style="width:64px;height:64px;font-size:1.5rem;font-weight:bold;">
              ${displayName.charAt(0).toUpperCase()}
            </div>
            <h4 class="mt-3">${displayName}${role === 'admin' ? ' <span class="badge admin-badge">Админ</span>' : ''}</h4>
            <p class="text-muted small">${user.email}</p>
            <div class="d-flex justify-content-around mt-3 small">
              <div><strong>${favRecipes.length}</strong><br>рецепти</div>
              <div><strong>${favWorkouts.length}</strong><br>тренировки</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-8">
        <div class="card">
          <div class="card-body">
            <h5><i class="bi bi-bullseye text-success"></i> Дневни цели</h5>
            <form id="profileForm" class="row g-3 mt-2">
              <div class="col-md-6"><label class="form-label">Целеви калории</label><input type="number" name="target_calories" class="form-control" value="${profile.target_calories}"></div>
              <div class="col-md-6"><label class="form-label">Цел вода (чаши)</label><input type="number" name="water_goal" class="form-control" value="${profile.water_goal}"></div>
              <div class="col-md-4"><label class="form-label">Протеини (г)</label><input type="number" name="target_protein" class="form-control" value="${profile.target_protein}"></div>
              <div class="col-md-4"><label class="form-label">Въглехидрати (г)</label><input type="number" name="target_carbs" class="form-control" value="${profile.target_carbs}"></div>
              <div class="col-md-4"><label class="form-label">Мазнини (г)</label><input type="number" name="target_fat" class="form-control" value="${profile.target_fat}"></div>
              <div class="col-12"><button type="submit" class="btn btn-success"><i class="bi bi-save"></i> Запази</button></div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="row g-4 mt-2">
      <div class="col-md-6">
        <h5><i class="bi bi-heart text-danger"></i> Любими рецепти</h5>
        ${favRecipes.length ? favRecipes.map((r) => `
          <a href="/recept.html?id=${r.id}" class="d-flex align-items-center gap-3 text-decoration-none text-dark card mb-2 p-2">
            <img src="${resolveRecipeImage(r.image_url, r.title)}" width="56" height="56" class="rounded object-fit-cover" alt="" onerror="${recipeImgOnError()}">
            <div><div class="fw-semibold">${r.title}</div><small class="text-success">${r.calories} kcal</small></div>
          </a>`).join('') : '<p class="text-muted">Няма любими рецепти.</p>'}
      </div>
      <div class="col-md-6">
        <h5><i class="bi bi-heart text-danger"></i> Любими тренировки</h5>
        ${favWorkouts.length ? favWorkouts.map((w) => `
          <a href="/trenirovka.html?id=${w.id}" class="d-flex align-items-center gap-3 text-decoration-none text-dark card mb-2 p-2">
            <img src="${resolveWorkoutImage(w.image || w.image_url)}" width="56" height="56" class="rounded object-fit-cover" alt="${w.title}" onerror="${workoutImgOnError()}">
            <div><div class="fw-semibold">${w.title}</div><small class="text-muted">${w.duration} мин</small></div>
          </a>`).join('') : '<p class="text-muted">Няма любими тренировки.</p>'}
      </div>
    </div>`;

  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await updateProfile(user.id, {
      target_calories: Number(fd.get('target_calories')),
      water_goal: Number(fd.get('water_goal')),
      target_protein: Number(fd.get('target_protein')),
      target_carbs: Number(fd.get('target_carbs')),
      target_fat: Number(fd.get('target_fat')),
    });
    showToast('Профилът е запазен!');
  });
}

initPage(initProfil, { requireAuth: true });
