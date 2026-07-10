import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { loginUser, resolvePostLoginRedirect } from '../auth.js';
import { isSupabaseConfigured } from '../supabaseClient.js';
import { getQueryParam } from '../utils/helpers.js';

async function initLogin() {
  if (!isSupabaseConfigured) return;

  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('loginError');
  const returnUrl = getQueryParam('return') || '/index.html';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('d-none');
    const email = form.email.value.trim();
    const password = form.password.value;

    try {
      await loginUser({ email, password });
      const redirectTo = await resolvePostLoginRedirect(returnUrl);
      window.location.href = redirectTo;
    } catch (err) {
      const msg = err.message || '';
      if (msg === 'Invalid login credentials') {
        errorEl.textContent = 'Невалиден имейл или парола. Ако нямате акаунт, регистрирайте се на /register.html';
      } else if (msg === 'Email not confirmed') {
        errorEl.textContent = 'Имейлът не е потвърден. В Supabase: Authentication → Users → потвърдете потребителя, или изключете "Confirm email" в Providers → Email.';
      } else {
        errorEl.textContent = msg;
      }
      errorEl.classList.remove('d-none');
    }
  });
}

initPage(initLogin);
