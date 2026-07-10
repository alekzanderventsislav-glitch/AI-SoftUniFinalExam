import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { getCurrentUser } from '../auth.js';
import { fetchProfile } from '../services/profiles.js';
import { enrollTotp, verifyTotpCode } from '../services/mfa.js';
import { getQueryParam } from '../utils/helpers.js';
import { isSupabaseConfigured } from '../supabaseClient.js';

let enrolledFactorId = null;

async function initMfaSetup() {
  if (!isSupabaseConfigured) return;

  const user = await getCurrentUser();
  if (!user) return;

  const profile = await fetchProfile(user.id);
  if (!profile.mfa_required) {
    window.location.href = getQueryParam('return') || '/index.html';
    return;
  }

  const errorEl = document.getElementById('mfaSetupError');
  const contentEl = document.getElementById('mfaSetupContent');
  const form = document.getElementById('mfaSetupForm');
  const returnUrl = getQueryParam('return') || '/index.html';

  try {
    const enrollment = await enrollTotp('Здравословен Живот');
    enrolledFactorId = enrollment.id;

    document.getElementById('mfaQrWrap').innerHTML = `
      <img src="${enrollment.totp.qr_code}" alt="QR код за 2FA" class="img-fluid border rounded p-2 bg-white" style="max-width:220px" />
    `;
    document.getElementById('mfaSecret').textContent = enrollment.totp.secret;

    contentEl.classList.add('d-none');
    form.classList.remove('d-none');
  } catch (err) {
    contentEl.classList.add('d-none');
    errorEl.textContent = err.message || 'Грешка при стартиране на 2FA настройката.';
    errorEl.classList.remove('d-none');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('d-none');

    if (!enrolledFactorId) {
      errorEl.textContent = 'Липсва активна настройка. Презаредете страницата.';
      errorEl.classList.remove('d-none');
      return;
    }

    const code = form.elements.code.value.trim();
    try {
      await verifyTotpCode(enrolledFactorId, code);
      window.location.href = decodeURIComponent(returnUrl);
    } catch (err) {
      errorEl.textContent = err.message || 'Невалиден код. Опитайте отново.';
      errorEl.classList.remove('d-none');
    }
  });
}

initPage(initMfaSetup, { requireAuth: true, skipMfaCheck: true });
