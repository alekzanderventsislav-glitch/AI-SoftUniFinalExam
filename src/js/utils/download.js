import { getCategoryLabel, getDietaryLabel } from '../data/tips.js';
import { getDifficultyLabel, getGoalLabel } from '../data/workouts.js';

function slugifyFilename(title) {
  return String(title || 'export')
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0400-\u04FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60) || 'export';
}

export function downloadTextFile(content, filename) {
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatRecipeDownload(recipe) {
  const lines = [
    `РЕЦЕПТА: ${recipe.title}`,
    '='.repeat(40),
    '',
    `Автор: ${recipe.authorName || '—'}`,
    `Категория: ${getCategoryLabel(recipe.category)}`,
    `Диета: ${(recipe.dietary || []).map(getDietaryLabel).join(', ') || '—'}`,
    '',
    `Калории: ${recipe.calories} kcal`,
    `Протеин: ${recipe.protein} г`,
    `Въглехидрати: ${recipe.carbs} г`,
    `Мазнини: ${recipe.fat} г`,
    '',
    'ОПИСАНИЕ',
    '-'.repeat(20),
    recipe.description || '—',
    '',
    'СЪСТАВКИ',
    '-'.repeat(20),
    ...(recipe.ingredients || []).map((item) => `• ${item}`),
    '',
    'СТЪПКИ',
    '-'.repeat(20),
    ...(recipe.steps || []).map((step, i) => `${i + 1}. ${step}`),
    '',
    '— Здравословен Живот —',
  ];
  return lines.join('\n');
}

export function formatWorkoutDownload(workout) {
  const exercises = workout.exercises || [];
  const lines = [
    `ТРЕНИРОВКА: ${workout.title}`,
    '='.repeat(40),
    '',
    `Автор: ${workout.authorName || '—'}`,
    `Трудност: ${getDifficultyLabel(workout.difficulty)}`,
    `Цел: ${getGoalLabel(workout.goal)}`,
    `Продължителност: ${workout.duration} мин`,
    `Калории: ~${workout.calories} kcal`,
    '',
    'ОПИСАНИЕ',
    '-'.repeat(20),
    workout.description || '—',
    '',
    'УПРАЖНЕНИЯ',
    '-'.repeat(20),
    ...exercises.map((ex, i) => `${i + 1}. ${ex.name} — ${ex.duration}`),
    '',
    '— Здравословен Живот —',
  ];
  return lines.join('\n');
}

export function downloadRecipe(recipe) {
  const content = formatRecipeDownload(recipe);
  downloadTextFile(content, `${slugifyFilename(recipe.title)}.txt`);
}

export function downloadWorkout(workout) {
  const content = formatWorkoutDownload(workout);
  downloadTextFile(content, `${slugifyFilename(workout.title)}.txt`);
}
