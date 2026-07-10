import { getSupabaseOrThrow } from '../supabaseClient.js';

export async function uploadRecipeImage(file, userId) {
  return uploadImage(file, userId, 'recipe-images');
}

export async function uploadWorkoutImage(file, userId) {
  return uploadImage(file, userId, 'workout-images');
}

export async function uploadCommunityImage(file, userId) {
  return uploadImage(file, userId, 'community-images');
}

export async function uploadFoodImage(file) {
  const ext = file.name.split('.').pop();
  const fileName = `admin/${Date.now()}.${ext}`;

  const { error: uploadError } = await getSupabaseOrThrow()
    .storage
    .from('foods')
    .upload(fileName, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data } = getSupabaseOrThrow().storage.from('foods').getPublicUrl(fileName);
  return data.publicUrl;
}

async function uploadImage(file, userId, bucket) {
  const ext = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await getSupabaseOrThrow()
    .storage
    .from(bucket)
    .upload(fileName, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data } = getSupabaseOrThrow().storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

export function validateImageFile(file) {
  if (!file) return 'Няма избран файл';
  if (!file.type.startsWith('image/')) return 'Моля, изберете валидно изображение';
  if (file.size > 2 * 1024 * 1024) return 'Изображението трябва да е под 2MB';
  return null;
}
