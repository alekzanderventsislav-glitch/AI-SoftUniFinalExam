import { getSupabaseOrThrow } from '../supabaseClient.js';
import { getAuthorDisplayName } from '../utils/helpers.js';

export async function fetchRecipes() {
  const { data, error } = await getSupabaseOrThrow()
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return attachAuthorNames(data);
}

export async function fetchRecipeById(id) {
  const { data, error } = await getSupabaseOrThrow()
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  const [recipe] = await attachAuthorNames([data]);
  return recipe;
}

export async function createRecipe(recipe, authorId) {
  const { data, error } = await getSupabaseOrThrow()
    .from('recipes')
    .insert({
      author_id: authorId,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      category: recipe.category,
      dietary: recipe.dietary,
      image_url: recipe.image_url || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRecipe(id, recipe) {
  const { data, error } = await getSupabaseOrThrow()
    .from('recipes')
    .update({
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      category: recipe.category,
      dietary: recipe.dietary,
      image_url: recipe.image_url || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRecipe(id) {
  const { error } = await getSupabaseOrThrow().from('recipes').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchAllRecipesAdmin() {
  const client = getSupabaseOrThrow();
  const { data: recipes, error } = await client
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!recipes.length) return [];

  const authorIds = [...new Set(recipes.map((r) => r.author_id))];
  const { data: profiles, error: profilesError } = await client
    .from('profiles')
    .select('id, full_name')
    .in('id', authorIds);

  if (profilesError) throw profilesError;

  const { data: roles, error: rolesError } = await client
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', authorIds);

  if (rolesError) throw rolesError;

  const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
  const roleMap = buildRoleMap(roles);

  return recipes.map((r) => ({
    ...r,
    profiles: profileMap[r.author_id]
      ? { full_name: profileMap[r.author_id].full_name, id: r.author_id }
      : null,
    authorRole: roleMap[r.author_id] || 'user',
    authorName: getAuthorDisplayName(profileMap[r.author_id]?.full_name, roleMap[r.author_id]),
  }));
}

async function attachAuthorNames(rows) {
  if (!rows.length) return [];

  const client = getSupabaseOrThrow();
  const authorIds = [...new Set(rows.map((r) => r.author_id))];
  if (!authorIds.length) {
    return rows.map((row) => mapRecipe({ ...row, profiles: null, authorRole: 'user' }));
  }

  const { data: profiles, error } = await client
    .from('profiles')
    .select('id, full_name')
    .in('id', authorIds);

  if (error) throw error;

  const { data: roles, error: rolesError } = await client
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', authorIds);

  if (rolesError) throw rolesError;

  const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
  const roleMap = buildRoleMap(roles);

  return rows.map((row) => mapRecipe({
    ...row,
    profiles: profileMap[row.author_id] || null,
    authorRole: roleMap[row.author_id] || 'user',
  }));
}

function buildRoleMap(rows) {
  const roleMap = {};
  (rows || []).forEach((row) => {
    if (row.role === 'admin') roleMap[row.user_id] = 'admin';
    else if (!roleMap[row.user_id]) roleMap[row.user_id] = row.role;
  });
  return roleMap;
}

function mapRecipe(row) {
  return {
    ...row,
    authorName: getAuthorDisplayName(row.profiles?.full_name, row.authorRole),
    image: row.image_url,
    macros: {
      calories: row.calories,
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
    },
  };
}
