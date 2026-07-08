import { getSupabaseOrThrow } from '../supabaseClient.js';

const BUCKET = 'recipe-images';

export async function uploadRecipeImage(file, userId) {
  const ext = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await getSupabaseOrThrow()
    .storage
    .from(BUCKET)
    .upload(fileName, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data } = getSupabaseOrThrow().storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export function validateImageFile(file) {
  if (!file) return 'Няма избран файл';
  if (!file.type.startsWith('image/')) return 'Моля, изберете валидно изображение';
  if (file.size > 2 * 1024 * 1024) return 'Изображението трябва да е под 2MB';
  return null;
}
