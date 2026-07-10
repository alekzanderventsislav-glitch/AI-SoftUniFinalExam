import { getSupabaseOrThrow } from '../supabaseClient.js';

export async function fetchProfile(userId) {
  const { data, error } = await getSupabaseOrThrow()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await getSupabaseOrThrow()
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchAllProfilesAdmin() {
  const client = getSupabaseOrThrow();

  const { data: profiles, error } = await client
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const { data: roles, error: rolesError } = await client
    .from('user_roles')
    .select('user_id, role');

  if (rolesError) throw rolesError;

  const rolesByUser = {};
  (roles || []).forEach((row) => {
    if (!rolesByUser[row.user_id]) rolesByUser[row.user_id] = [];
    rolesByUser[row.user_id].push({ role: row.role });
  });

  return (profiles || []).map((profile) => ({
    ...profile,
    user_roles: rolesByUser[profile.id] || [{ role: 'user' }],
  }));
}

export async function setUserRole(userId, role) {
  const { error } = await getSupabaseOrThrow().rpc('admin_set_user_role', {
    p_user_id: userId,
    p_role: role,
  });
  if (error) throw error;
}
