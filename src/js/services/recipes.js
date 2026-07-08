import { getSupabaseOrThrow } from '../supabaseClient.js';

export async function fetchRecipes() {
  const { data, error } = await getSupabaseOrThrow()
    .from('recipes')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(mapRecipe);
}

export async function fetchRecipeById(id) {
  const { data, error } = await getSupabaseOrThrow()
    .from('recipes')
    .select('*, profiles(full_name)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapRecipe(data);
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
  const { data, error } = await getSupabaseOrThrow()
    .from('recipes')
    .select('*, profiles(full_name, id)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

function mapRecipe(row) {
  return {
    ...row,
    authorName: row.profiles?.full_name || 'Потребител',
    image: row.image_url,
    macros: {
      calories: row.calories,
      protein: row.protein,
      carbs: row.carbs,
      fat: row.fat,
    },
  };
}
