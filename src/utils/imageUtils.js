const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Няма избран файл'));
      return;
    }

    if (!file.type.startsWith('image/')) {
      reject(new Error('Моля, изберете валидно изображение'));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      reject(new Error('Изображението трябва да е под 2MB'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Грешка при четене на файла'));
    reader.readAsDataURL(file);
  });
}

export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function resolveRecipeImage(image) {
  if (!image) {
    return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop';
  }
  if (image.startsWith('data:image') || isValidImageUrl(image)) {
    return image;
  }
  return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop';
}
