import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { fetchAllRecipesAdmin, deleteRecipe } from '../services/recipes.js';
import { fetchAllProfilesAdmin, setUserRole } from '../services/profiles.js';
import { showToast } from '../components/toast.js';

async function initAdmin() {
  const [recipes, profiles] = await Promise.all([
    fetchAllRecipesAdmin(),
    fetchAllProfilesAdmin(),
  ]);

  document.getElementById('adminStats').innerHTML = `
    <div class="col-md-4"><div class="card text-center"><div class="card-body"><h3>${profiles.length}</h3><p class="text-muted mb-0">Потребители</p></div></div></div>
    <div class="col-md-4"><div class="card text-center"><div class="card-body"><h3>${recipes.length}</h3><p class="text-muted mb-0">Рецепти</p></div></div></div>
    <div class="col-md-4"><div class="card text-center"><div class="card-body"><h3>${profiles.filter((p) => p.user_roles?.some((r) => r.role === 'admin')).length}</h3><p class="text-muted mb-0">Админи</p></div></div></div>`;

  document.getElementById('recipesTable').innerHTML = recipes.map((r) => `
    <tr>
      <td>${r.title}</td>
      <td>${r.profiles?.full_name || '—'}</td>
      <td>${r.calories} kcal</td>
      <td>${new Date(r.created_at).toLocaleDateString('bg-BG')}</td>
      <td><button class="btn btn-sm btn-outline-danger" data-del-recipe="${r.id}"><i class="bi bi-trash"></i></button></td>
    </tr>`).join('') || '<tr><td colspan="5" class="text-center text-muted">Няма рецепти</td></tr>';

  document.getElementById('usersTable').innerHTML = profiles.map((p) => {
    const role = p.user_roles?.[0]?.role || 'user';
    return `
    <tr>
      <td>${p.full_name || '—'}</td>
      <td><span class="badge ${role === 'admin' ? 'bg-danger' : 'bg-secondary'}">${role}</span></td>
      <td>
        <select class="form-select form-select-sm" data-user-role="${p.id}">
          <option value="user" ${role === 'user' ? 'selected' : ''}>user</option>
          <option value="admin" ${role === 'admin' ? 'selected' : ''}>admin</option>
        </select>
      </td>
    </tr>`;
  }).join('');

  document.querySelectorAll('[data-del-recipe]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Изтриване на рецепта?')) return;
      await deleteRecipe(btn.dataset.delRecipe);
      showToast('Рецептата е изтрита.', 'info');
      initAdmin();
    });
  });

  document.querySelectorAll('[data-user-role]').forEach((sel) => {
    sel.addEventListener('change', async () => {
      await setUserRole(sel.dataset.userRole, sel.value);
      showToast('Ролята е обновена.');
    });
  });
}

initPage(initAdmin, { requireAdmin: true });
