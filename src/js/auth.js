import { getSupabaseOrThrow, isSupabaseConfigured } from './supabaseClient.js';

export async function getSession() {
  if (!isSupabaseConfigured) return null;
  const { data } = await getSupabaseOrThrow().auth.getSession();
  return data.session;
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function getUserRole(userId) {
  if (!userId) return null;
  const { data, error } = await getSupabaseOrThrow()
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (error) throw error;
  if (data?.some((r) => r.role === 'admin')) return 'admin';
  return data?.[0]?.role ?? 'user';
}

export async function isAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;
  return (await getUserRole(user.id)) === 'admin';
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

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured) return () => {};
  return getSupabaseOrThrow().auth.onAuthStateChange(callback);
}
