import { getSupabaseOrThrow } from '../supabaseClient.js';

export async function listMfaFactors() {
  const { data, error } = await getSupabaseOrThrow().auth.mfa.listFactors();
  if (error) throw error;
  return data;
}

export function getVerifiedTotpFactor(factors) {
  return (factors?.totp || []).find((factor) => factor.status === 'verified') || null;
}

export async function getMfaAssuranceLevel() {
  const { data, error } = await getSupabaseOrThrow().auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) throw error;
  return data;
}

export async function enrollTotp(friendlyName = 'Authenticator') {
  const { data, error } = await getSupabaseOrThrow().auth.mfa.enroll({
    factorType: 'totp',
    friendlyName,
  });
  if (error) throw error;
  return data;
}

export async function challengeMfa(factorId) {
  const { data, error } = await getSupabaseOrThrow().auth.mfa.challenge({ factorId });
  if (error) throw error;
  return data;
}

export async function verifyMfa(factorId, challengeId, code) {
  const { data, error } = await getSupabaseOrThrow().auth.mfa.verify({
    factorId,
    challengeId,
    code: String(code).trim(),
  });
  if (error) throw error;
  return data;
}

export async function verifyTotpCode(factorId, code) {
  const challenge = await challengeMfa(factorId);
  return verifyMfa(factorId, challenge.id, code);
}

/** Redirect path when MFA setup or verification is still required. */
export async function getMfaRedirectPath(profile) {
  if (!profile?.mfa_required) return null;

  const factors = await listMfaFactors();
  const verifiedTotp = getVerifiedTotpFactor(factors);

  if (!verifiedTotp) {
    return '/mfa-setup.html';
  }

  const aal = await getMfaAssuranceLevel();
  if (aal.currentLevel !== 'aal2' && aal.nextLevel === 'aal2') {
    return '/mfa-verify.html';
  }

  return null;
}
