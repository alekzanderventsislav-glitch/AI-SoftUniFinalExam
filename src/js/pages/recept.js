import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { fetchRecipeById } from '../services/recipes.js';
import { getCurrentUser } from '../auth.js';
import { fetchFavorites, toggleFavorite, isFavorited } from '../services/favorites.js';
import { isSupabaseConfigured } from '../supabaseClient.js';
import { getQueryParam, resolveImage } from '../utils/helpers.js';
import { getCategoryLabel, getDietaryLabel } from '../data/tips.js';
import { showToast } from '../components/toast.js';

async function initRecept() {
  if (!isSupabaseConfigured) return;

  const id = getQueryParam('id');
  if (!id) { window.location.href = '/recepti.html'; return; }

  try {
    const recipe = await fetchRecipeById(id);
    document.getElementById('recipeContent').innerHTML = `
      <div class="row g-4">
        <div class="col-lg-6">
          <img src="${resolveImage(recipe.image_url)}" class="img-fluid rounded-3 w-100" alt="${recipe.title}">
        </div>
        <div class="col-lg-6">
          <div class="d-flex justify-content-between">
            <div>
              <span class="badge bg-success-subtle text-success">${getCategoryLabel(recipe.category)}</span>
              ${(recipe.dietary || []).map((d) => `<span class="badge bg-primary-subtle text-primary">${getDietaryLabel(d)}</span>`).join('')}
              <h1 class="mt-2">${recipe.title}</h1>
              <p class="text-muted">${recipe.description}</p>
              <p class="small text-muted"><i class="bi bi-person"></i> ${recipe.authorName}</p>
            </div>
            <button id="favBtn" class="btn btn-outline-danger"><i class="bi bi-heart"></i></button>
          </div>
          <div class="row g-2 my-3">
            <div class="col-3"><div class="bg-warning-subtle rounded p-2 text-center"><div class="fw-bold">${recipe.calories}</div><small>kcal</small></div></div>
            <div class="col-3"><div class="bg-primary-subtle rounded p-2 text-center"><div class="fw-bold">${recipe.protein}г</div><small>П</small></div></div>
            <div class="col-3"><div class="bg-warning-subtle rounded p-2 text-center"><div class="fw-bold">${recipe.carbs}г</div><small>В</small></div></div>
            <div class="col-3"><div class="bg-secondary-subtle rounded p-2 text-center"><div class="fw-bold">${recipe.fat}г</div><small>М</small></div></div>
          </div>
          <h4>Съставки</h4>
          <ul class="list-group mb-4">
            ${(recipe.ingredients || []).map((i) => `<li class="list-group-item">${i}</li>`).join('')}
          </ul>
          <h4>Стъпки</h4>
          <ol class="list-group list-group-numbered">
            ${(recipe.steps || []).map((s) => `<li class="list-group-item">${s}</li>`).join('')}
          </ol>
        </div>
      </div>`;

    const user = await getCurrentUser();
    const favBtn = document.getElementById('favBtn');
    if (user) {
      let favorites = await fetchFavorites(user.id);
      const fav = isFavorited(favorites, 'recipe', recipe.id);
      favBtn.innerHTML = `<i class="bi bi-heart${fav ? '-fill' : ''}"></i>`;
      favBtn.addEventListener('click', async () => {
        const added = await toggleFavorite(user.id, 'recipe', recipe.id);
        showToast(added ? 'Добавено в любими!' : 'Премахнато от любими.', added ? 'success' : 'info');
        favorites = await fetchFavorites(user.id);
        const isFav = isFavorited(favorites, 'recipe', recipe.id);
        favBtn.innerHTML = `<i class="bi bi-heart${isFav ? '-fill' : ''}"></i>`;
      });
    } else {
      favBtn.disabled = true;
    }
  } catch {
    document.getElementById('recipeContent').innerHTML = '<div class="alert alert-danger">Рецептата не е намерена.</div>';
  }
}

initPage(initRecept);
