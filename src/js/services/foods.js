import { getSupabaseOrThrow } from '../supabaseClient.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapFood(row) {
  return {
    ...row,
    id: row.slug,
    uuid: row.id,
    image: row.image_url,
  };
}

export async function fetchFoods() {
  const { data, error } = await getSupabaseOrThrow()
    .from('foods')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapFood);
}

export async function fetchFoodById(id) {
  const client = getSupabaseOrThrow();
  const column = UUID_RE.test(String(id)) ? 'id' : 'slug';
  const { data, error } = await client
    .from('foods')
    .select('*')
    .eq(column, id)
    .single();

  if (error) throw error;
  return mapFood(data);
}

export async function createFood(food) {
  const { data, error } = await getSupabaseOrThrow()
    .from('foods')
    .insert({
      slug: food.slug,
      name: food.name,
      category: food.category,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      image_url: food.image_url || null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapFood(data);
}

export async function updateFood(id, food) {
  const { data, error } = await getSupabaseOrThrow()
    .from('foods')
    .update({
      name: food.name,
      category: food.category,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      image_url: food.image_url || null,
    })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Храната не беше намерена или нямате права за редакция.');
  return mapFood(data);
}

export async function deleteFood(id) {
  const { error } = await getSupabaseOrThrow().from('foods').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchAllFoodsAdmin() {
  const { data, error } = await getSupabaseOrThrow()
    .from('foods')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []).map((row) => ({
    ...row,
    image: row.image_url,
  }));
}
