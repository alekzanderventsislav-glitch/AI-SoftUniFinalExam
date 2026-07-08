import { getSupabaseOrThrow } from '../supabaseClient.js';

export async function fetchFavorites(userId) {
  const { data, error } = await getSupabaseOrThrow()
    .from('favorites')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

export async function toggleFavorite(userId, itemType, itemId) {
  const client = getSupabaseOrThrow();

  const { data: existing } = await client
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)
    .maybeSingle();

  if (existing) {
    const { error } = await client.from('favorites').delete().eq('id', existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await client.from('favorites').insert({
    user_id: userId,
    item_type: itemType,
    item_id: itemId,
  });
  if (error) throw error;
  return true;
}

export function isFavorited(favorites, itemType, itemId) {
  return favorites.some((f) => f.item_type === itemType && f.item_id === itemId);
}
