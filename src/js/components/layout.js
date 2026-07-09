import { getCurrentUser, getUserRole, logoutUser, requireAuth, requireAdmin } from '../auth.js';
import { isSupabaseConfigured, supabaseKeyError } from '../supabaseClient.js';
import { escapeHtml } from '../utils/helpers.js';

const NAV_LINKS = [
  { href: '/index.html', label: 'Начало' },
  { href: '/hrani.html', label: 'Каталог на храните' },
  { href: '/trenirovki.html', label: 'Тренировки' },
  { href: '/recepti.html', label: 'Споделени Рецепти' },
  { href: '/profil.html', label: 'Профил' },
];

function isActive(href) {
  const path = window.location.pathname;
  if (href === '/index.html') return path === '/' || path.endsWith('index.html');
  return path.endsWith(href.replace('/', ''));
}

export async function renderLayout() {
  const navbarEl = document.getElementById('navbar');
  const footerEl = document.getElementById('footer');
  if (!navbarEl || !footerEl) return;

  let user = null;
  let role = null;
  if (isSupabaseConfigured) {
    try {
      user = await getCurrentUser();
      if (user) role = await getUserRole(user.id);
    } catch {
      /* ignore */
    }
  }

  const userName = user?.user_metadata?.full_name || user?.email || '';
  const visibleNavLinks = user ? NAV_LINKS : [{ href: '/index.html', label: 'Начало' }];

  navbarEl.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top">
      <div class="container">
        <a class="navbar-brand fw-bold text-success d-flex align-items-center gap-2" href="/index.html">
          <i class="bi bi-leaf"></i> Здравословен Живот
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            ${visibleNavLinks.map((link) => `
              <li class="nav-item">
                <a class="nav-link ${isActive(link.href) ? 'active fw-semibold text-success' : ''}" href="${link.href}">${link.label}</a>
              </li>
            `).join('')}
            ${user && role === 'admin' ? '<li class="nav-item"><a class="nav-link text-danger fw-semibold" href="/admin.html"><i class="bi bi-shield-lock"></i> Админ</a></li>' : ''}
          </ul>
          <div class="d-flex align-items-center gap-2">
            ${user
              ? `<span class="text-muted small d-none d-md-inline"><i class="bi bi-person-circle"></i> ${escapeHtml(userName)}</span>
                 <button class="btn btn-outline-success btn-sm" id="logoutBtn"><i class="bi bi-box-arrow-right"></i> Изход</button>`
              : `<a href="/login.html" class="btn btn-success btn-sm"><i class="bi bi-box-arrow-in-right"></i> Вход</a>
                 <a href="/register.html" class="btn btn-outline-success btn-sm d-none d-sm-inline-block"><i class="bi bi-person-plus"></i> Регистрация</a>`
            }
          </div>
        </div>
      </div>
    </nav>
    ${supabaseKeyError ? `
      <div class="container mt-3">
        <div class="alert alert-danger supabase-warning mb-0">
          <i class="bi bi-exclamation-triangle"></i>
          ${supabaseKeyError}
        </div>
      </div>` : !isSupabaseConfigured ? `
      <div class="container mt-3">
        <div class="alert alert-warning supabase-warning mb-0">
          <i class="bi bi-exclamation-triangle"></i>
          Supabase не е конфигуриран.
          ${import.meta.env.PROD
            ? 'В Netlify/Telify добавете <code>VITE_SUPABASE_URL</code> и <code>VITE_SUPABASE_ANON_KEY</code> в Environment variables и направете нов deploy.'
            : 'Копирайте <code>.env.example</code> в <code>.env</code> и попълнете ключовете.'}
        </div>
      </div>` : ''}
  `;

  footerEl.innerHTML = `
    <footer class="bg-white border-top mt-5 py-4">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-4">
            <h6 class="fw-bold text-success"><i class="bi bi-leaf"></i> Здравословен Живот</h6>
            <p class="text-muted small">Портал за здравословно хранене, фитнес и балансиран начин на живот.</p>
          </div>
          <div class="col-md-4">
            <h6 class="fw-bold">Бързи връзки</h6>
            ${user ? `
            <ul class="list-unstyled small">
              ${NAV_LINKS.map((l) => `<li><a href="${l.href}" class="text-muted text-decoration-none">${l.label}</a></li>`).join('')}
            </ul>` : '<p class="text-muted small mb-0">Влезте в профила си, за да разгледате каталозите и функциите на портала.</p>'}
          </div>
          <div class="col-md-4">
            <h6 class="fw-bold">Контакт</h6>
            <p class="text-muted small mb-0"><i class="bi bi-envelope"></i> info@zdravosloven-zhivot.bg</p>
          </div>
        </div>
        <hr>
        <p class="text-center text-muted small mb-0">© ${new Date().getFullYear()} Здравословен Живот</p>
      </div>
    </footer>
  `;

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await logoutUser();
    window.location.href = '/index.html';
  });
}

export async function initPage(pageInit, options = {}) {
  await renderLayout();

  if (options.requireAdmin) {
    const session = await requireAdmin();
    if (!session) return;
  } else if (options.requireAuth) {
    const session = await requireAuth();
    if (!session) return;
  }

  if (pageInit) await pageInit();
}
