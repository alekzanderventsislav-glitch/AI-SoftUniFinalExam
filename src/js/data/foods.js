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

const IMG = (id) => `https://images.unsplash.com/${id}?w=600&h=400&fit=crop`;

export const CATEGORY_IMAGES = {
  fruits: IMG('photo-1610831308535-0d4f0b5a5e5b'),
  vegetables: IMG('photo-1540420773420-3366772f4999'),
  meats: IMG('photo-1603048292542-61052c44a8ab'),
  dairy: IMG('photo-1486297678162-ebfa3be50184'),
  grains: IMG('photo-1509440159596-0249088772ff'),
  nuts: IMG('photo-1508061258002-48ad92704d42'),
  legumes: IMG('photo-1546069907-ba9599a7e63c'),
  fish: IMG('photo-1467003909585-2f8a72700288'),
};

export const foods = [
  { id: 'f1', name: 'Ябълка', category: 'fruits', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, image: IMG('photo-1560806887-1e4cdfa55e29') },
  { id: 'f2', name: 'Банан', category: 'fruits', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, image: IMG('photo-1571771896011-9f2a40f0b3a8') },
  { id: 'f3', name: 'Портокал', category: 'fruits', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, image: IMG('photo-1547514704-5ccc6385bb8e') },
  { id: 'f4', name: 'Ягода', category: 'fruits', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, image: IMG('photo-1464965911861-746a04b4bca6') },
  { id: 'f5', name: 'Авокадо', category: 'fruits', calories: 160, protein: 2, carbs: 9, fat: 15, image: IMG('photo-1523049673857-fbfc8f8391bc') },
  { id: 'f6', name: 'Броколи', category: 'vegetables', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, image: IMG('photo-1459411550354-afa024a0d5a9') },
  { id: 'f7', name: 'Морков', category: 'vegetables', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, image: IMG('photo-1598170846088-d326bd32f7d8') },
  { id: 'f8', name: 'Спанак', category: 'vegetables', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, image: IMG('photo-1576045057995-568f128f0e9b') },
  { id: 'f9', name: 'Домати', category: 'vegetables', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, image: IMG('photo-1546094310-7d9c554c64dd') },
  { id: 'f10', name: 'Краставица', category: 'vegetables', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, image: IMG('photo-1604977042946-1eeccbbd784e') },
  { id: 'f11', name: 'Пилешко филе', category: 'meats', calories: 165, protein: 31, carbs: 0, fat: 3.6, image: IMG('photo-1604908176997-125f25cc6f3d') },
  { id: 'f12', name: 'Говеждо месо', category: 'meats', calories: 250, protein: 26, carbs: 0, fat: 15, image: IMG('photo-1603048292542-61052c44a8ab') },
  { id: 'f13', name: 'Свинско филе', category: 'meats', calories: 143, protein: 26, carbs: 0, fat: 3.5, image: IMG('photo-1602473818210-b316b3eaa9db') },
  { id: 'f14', name: 'Пуешко месо', category: 'meats', calories: 135, protein: 30, carbs: 0, fat: 1, image: IMG('photo-1604503467796-d9aef95608b5') },
  { id: 'f15', name: 'Сьомга', category: 'fish', calories: 208, protein: 20, carbs: 0, fat: 13, image: IMG('photo-1467003909585-2f8a72700288') },
  { id: 'f16', name: 'Тон', category: 'fish', calories: 132, protein: 28, carbs: 0, fat: 1.3, image: IMG('photo-1544943910-4c1dc44aab44') },
  { id: 'f17', name: 'Скариди', category: 'fish', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, image: IMG('photo-1565680018434-b0d0589470bd') },
  { id: 'f18', name: 'Яйце', category: 'dairy', calories: 155, protein: 13, carbs: 1.1, fat: 11, image: IMG('photo-1582722872445-44dc5f4ee3f0') },
  { id: 'f19', name: 'Гръцко кисело мляко', category: 'dairy', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, image: IMG('photo-1571212515410-9d1a0b703929') },
  { id: 'f20', name: 'Сирене', category: 'dairy', calories: 402, protein: 25, carbs: 1.3, fat: 33, image: IMG('photo-1486297678162-ebfa3be50184') },
  { id: 'f21', name: 'Извара', category: 'dairy', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, image: IMG('photo-1628088062856-d10cdbfd35d4') },
  { id: 'f22', name: 'Овесени ядки', category: 'grains', calories: 389, protein: 17, carbs: 66, fat: 7, image: IMG('photo-1517673400267-025144f4420a') },
  { id: 'f23', name: 'Киноа', category: 'grains', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, image: IMG('photo-1586201375767-2b74c778ed90') },
  { id: 'f24', name: 'Ориз', category: 'grains', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, image: IMG('photo-1516683286713-cb654259f1da') },
  { id: 'f25', name: 'Пълнозърнест хляб', category: 'grains', calories: 247, protein: 13, carbs: 41, fat: 3.4, image: IMG('photo-1509440159596-0249088772ff') },
  { id: 'f26', name: 'Бадеми', category: 'nuts', calories: 579, protein: 21, carbs: 22, fat: 50, image: IMG('photo-1508061258002-48ad92704d42') },
  { id: 'f27', name: 'Орехи', category: 'nuts', calories: 654, protein: 15, carbs: 14, fat: 65, image: IMG('photo-1574320334745-5fdf9bdb6cd5') },
  { id: 'f28', name: 'Чиа', category: 'nuts', calories: 486, protein: 17, carbs: 42, fat: 31, image: IMG('photo-1615485500832-83f1baa06428') },
  { id: 'f29', name: 'Леща', category: 'legumes', calories: 116, protein: 9, carbs: 20, fat: 0.4, image: IMG('photo-1546069907-ba9599a7e63c') },
  { id: 'f30', name: 'Нахут', category: 'legumes', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, image: IMG('photo-1512058562276-383ad4ffa553') },
];

export function getCategoryLabel(categoryId) {
  return FOOD_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;
}

export function getFoodImage(food) {
  return food?.image || CATEGORY_IMAGES[food?.category] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop';
}
