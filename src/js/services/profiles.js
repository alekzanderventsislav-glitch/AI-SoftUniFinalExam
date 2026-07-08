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
  const { data, error } = await getSupabaseOrThrow()
    .from('profiles')
    .select('*, user_roles(role)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function setUserRole(userId, role) {
  const client = getSupabaseOrThrow();

  await client.from('user_roles').delete().eq('user_id', userId);

  const { error } = await client.from('user_roles').insert({ user_id: userId, role });
  if (error) throw error;
}
