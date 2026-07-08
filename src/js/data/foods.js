export const FOOD_CATEGORIES = [
  { id: 'all', label: 'Всички' },
  { id: 'fruits', label: 'Плодове' },
  { id: 'vegetables', label: 'Зеленчуци' },
  { id: 'meats', label: 'Меса' },
  { id: 'dairy', label: 'Млечни' },
  { id: 'grains', label: 'Зърнени' },
  { id: 'nuts', label: 'Ядки' },
  { id: 'legumes', label: 'Бобови' },
  { id: 'fish', label: 'Риба' },
];

export const foods = [
  { id: 'f1', name: 'Ябълка', category: 'fruits', calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { id: 'f2', name: 'Банан', category: 'fruits', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { id: 'f3', name: 'Портокал', category: 'fruits', calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  { id: 'f4', name: 'Ягода', category: 'fruits', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
  { id: 'f5', name: 'Авокадо', category: 'fruits', calories: 160, protein: 2, carbs: 9, fat: 15 },
  { id: 'f6', name: 'Броколи', category: 'vegetables', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { id: 'f7', name: 'Морков', category: 'vegetables', calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { id: 'f8', name: 'Спанак', category: 'vegetables', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { id: 'f9', name: 'Домати', category: 'vegetables', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { id: 'f10', name: 'Краставица', category: 'vegetables', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1 },
  { id: 'f11', name: 'Пилешко филе', category: 'meats', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: 'f12', name: 'Говеждо месо', category: 'meats', calories: 250, protein: 26, carbs: 0, fat: 15 },
  { id: 'f13', name: 'Свинско филе', category: 'meats', calories: 143, protein: 26, carbs: 0, fat: 3.5 },
  { id: 'f14', name: 'Пуешко месо', category: 'meats', calories: 135, protein: 30, carbs: 0, fat: 1 },
  { id: 'f15', name: 'Сьомга', category: 'fish', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { id: 'f16', name: 'Тон', category: 'fish', calories: 132, protein: 28, carbs: 0, fat: 1.3 },
  { id: 'f17', name: 'Скариди', category: 'fish', calories: 99, protein: 24, carbs: 0.2, fat: 0.3 },
  { id: 'f18', name: 'Яйце', category: 'dairy', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { id: 'f19', name: 'Гръцко кисело мляко', category: 'dairy', calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { id: 'f20', name: 'Сирене', category: 'dairy', calories: 402, protein: 25, carbs: 1.3, fat: 33 },
  { id: 'f21', name: 'Извара', category: 'dairy', calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  { id: 'f22', name: 'Овесени ядки', category: 'grains', calories: 389, protein: 17, carbs: 66, fat: 7 },
  { id: 'f23', name: 'Киноа', category: 'grains', calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
  { id: 'f24', name: 'Ориз', category: 'grains', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { id: 'f25', name: 'Пълнозърнест хляб', category: 'grains', calories: 247, protein: 13, carbs: 41, fat: 3.4 },
  { id: 'f26', name: 'Бадеми', category: 'nuts', calories: 579, protein: 21, carbs: 22, fat: 50 },
  { id: 'f27', name: 'Орехи', category: 'nuts', calories: 654, protein: 15, carbs: 14, fat: 65 },
  { id: 'f28', name: 'Чиа', category: 'nuts', calories: 486, protein: 17, carbs: 42, fat: 31 },
  { id: 'f29', name: 'Леща', category: 'legumes', calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  { id: 'f30', name: 'Нахут', category: 'legumes', calories: 164, protein: 8.9, carbs: 27, fat: 2.6 },
];

export function getCategoryLabel(categoryId) {
  return FOOD_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;
}
