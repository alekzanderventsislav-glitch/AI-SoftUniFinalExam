export const QUESTION_CATEGORIES = [
  { id: 'all', label: 'Всички' },
  { id: 'general', label: 'Общи' },
  { id: 'nutrition', label: 'Хранене' },
  { id: 'fitness', label: 'Фитнес' },
  { id: 'wellness', label: 'Здраве' },
  { id: 'recipes', label: 'Рецепти' },
  { id: 'workouts', label: 'Тренировки' },
];

export function getQuestionCategoryLabel(id) {
  return QUESTION_CATEGORIES.find((c) => c.id === id)?.label || id;
}
