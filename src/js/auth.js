import { getSupabaseOrThrow, isSupabaseConfigured } from './supabaseClient.js';
import { fetchProfile } from './services/profiles.js';
import { getMfaRedirectPath } from './services/mfa.js';
import { canAccessStaffPanel, pickPrimaryRole } from './data/roles.js';

export async function getSession() {
  if (!isSupabaseConfigured) return null;
  const { data } = await getSupabaseOrThrow().auth.getSession();
  return data.session;
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function getUserRoles(userId) {
  if (!userId) return [];
  const { data, error } = await getSupabaseOrThrow()
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (error) throw error;
  return (data || []).map((r) => r.role);
}

export async function getUserRole(userId) {
  const roles = await getUserRoles(userId);
  return pickPrimaryRole(roles);
}

export async function isAdmin() {
  return (await getUserRole((await getCurrentUser())?.id)) === 'admin';
}

export async function isStaff() {
  const user = await getCurrentUser();
  if (!user) return false;
  return canAccessStaffPanel(await getUserRole(user.id));
}

export async function registerUser({ email, password, fullName }) {
  const client = getSupabaseOrThrow();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function loginUser({ email, password }) {
  const client = getSupabaseOrThrow();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function resolvePostLoginRedirect(returnUrl = '/index.html') {
  const user = await getCurrentUser();
  if (!user) return returnUrl;

  const profile = await fetchProfile(user.id).catch(() => null);
  if (!profile) return returnUrl;

  const mfaPath = await getMfaRedirectPath(profile);
  if (!mfaPath) return returnUrl;

  const encodedReturn = encodeURIComponent(returnUrl);
  return `${mfaPath}?return=${encodedReturn}`;
}

export async function ensureMfaCompliance(returnUrl) {
  const user = await getCurrentUser();
  if (!user) return true;

  const profile = await fetchProfile(user.id).catch(() => null);
  if (!profile) return true;

  const mfaPath = await getMfaRedirectPath(profile);
  if (!mfaPath) return true;

  const currentPath = window.location.pathname;
  if (currentPath.endsWith('mfa-setup.html') || currentPath.endsWith('mfa-verify.html')) {
    return true;
  }

  const encodedReturn = encodeURIComponent(returnUrl || window.location.pathname + window.location.search);
  window.location.href = `${mfaPath}?return=${encodedReturn}`;
  return false;
}

export async function logoutUser() {
  const { error } = await getSupabaseOrThrow().auth.signOut();
  if (error) throw error;
}

export function requireAuth(redirectTo = '/login.html') {
  return getSession().then((session) => {
    if (!session) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `${redirectTo}?return=${returnUrl}`;
      return null;
    }
    return session;
  });
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!session) return null;
  const admin = await isAdmin();
  if (!admin) {
    window.location.href = '/index.html';
    return null;
  }
  return session;
}

export async function requireStaff() {
  const session = await requireAuth();
  if (!session) return null;
  const staff = await isStaff();
  if (!staff) {
    window.location.href = '/index.html';
    return null;
  }
  return session;
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured) return () => {};
  return getSupabaseOrThrow().auth.onAuthStateChange(callback);
}
