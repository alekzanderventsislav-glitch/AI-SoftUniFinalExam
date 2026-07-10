import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../../css/styles.js';
import { initPage } from '../components/layout.js';
import { getCurrentUser } from '../auth.js';
import { fetchProfile } from '../services/profiles.js';
import { getVerifiedTotpFactor, listMfaFactors, verifyTotpCode } from '../services/mfa.js';
import { getQueryParam } from '../utils/helpers.js';
import { isSupabaseConfigured } from '../supabaseClient.js';

async function initMfaVerify() {
  if (!isSupabaseConfigured) return;

  const user = await getCurrentUser();
  if (!user) return;

  const profile = await fetchProfile(user.id);
  if (!profile.mfa_required) {
    window.location.href = getQueryParam('return') || '/index.html';
    return;
  }

  const factors = await listMfaFactors();
  const totpFactor = getVerifiedTotpFactor(factors);
  if (!totpFactor) {
    window.location.href = `/mfa-setup.html?return=${encodeURIComponent(getQueryParam('return') || '/index.html')}`;
    return;
  }

  const errorEl = document.getElementById('mfaVerifyError');
  const form = document.getElementById('mfaVerifyForm');
  const returnUrl = getQueryParam('return') || '/index.html';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('d-none');

    const code = form.elements.code.value.trim();
    try {
      await verifyTotpCode(totpFactor.id, code);
      window.location.href = decodeURIComponent(returnUrl);
    } catch (err) {
      errorEl.textContent = err.message || 'Невалиден код. Опитайте отново.';
      errorEl.classList.remove('d-none');
    }
  });
}

initPage(initMfaVerify, { requireAuth: true, skipMfaCheck: true });
