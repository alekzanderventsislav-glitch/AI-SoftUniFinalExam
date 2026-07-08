import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { registerUser } from '../auth.js';
import { isSupabaseConfigured } from '../supabaseClient.js';

async function initRegister() {
  if (!isSupabaseConfigured) return;

  const form = document.getElementById('registerForm');
  const errorEl = document.getElementById('registerError');
  const successEl = document.getElementById('registerSuccess');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('d-none');
    successEl.classList.add('d-none');

    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirm = form.confirmPassword.value;

    if (password !== confirm) {
      errorEl.textContent = 'Паролите не съвпадат.';
      errorEl.classList.remove('d-none');
      return;
    }

    try {
      await registerUser({ email, password, fullName });
      successEl.textContent = 'Регистрацията е успешна! Проверете имейла си или влезте.';
      successEl.classList.remove('d-none');
      form.reset();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.remove('d-none');
    }
  });
}

initPage(initRegister);
