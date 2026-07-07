export const dailyTips = [
  'Пийте поне 2 литра вода дневно за оптимална хидратация.',
  'Включете поне 5 порции плодове и зеленчуци в менюто си.',
  'Спете 7-9 часа за по-добро възстановяване и метаболизъм.',
  'Започнете деня с протеинова закуска за стабилна енергия.',
  'Правете кратки разходки след всяко хранене – помага на храносмилането.',
  'Ограничете преработените храни и добавете повече цельни зърна.',
  'Планирайте храненията си предварително за по-здравословен избор.',
  'Комбинирайте силови и кардио тренировки за балансиран резултат.',
];

export const RECIPE_CATEGORIES = [
  { id: 'all', label: 'Всички' },
  { id: 'breakfast', label: 'Закуска' },
  { id: 'lunch', label: 'Обяд' },
  { id: 'dinner', label: 'Вечеря' },
  { id: 'dessert', label: 'Десерт' },
  { id: 'snack', label: 'Междинно хранене' },
];

export const DIETARY_TAGS = [
  { id: 'all', label: 'Всички' },
  { id: 'vegan', label: 'Веган' },
  { id: 'keto', label: 'Кето' },
  { id: 'gluten-free', label: 'Без глутен' },
  { id: 'high-protein', label: 'Висок протеин' },
];

export const defaultRecipes = [
  {
    id: 'r1',
    title: 'Овесена каша с ягоди',
    description: 'Питателна и бърза закуска, богата на фибри и антиоксиданти.',
    ingredients: ['80г овесени ядки', '200мл бадемово мляко', '100г ягоди', '1 с.л. мед', '1 ч.л. чиа'],
    steps: [
      'Сварете овесените ядки с млякото на среден огън 5 минути.',
      'Добавете меда и разбъркайте.',
      'Поръсете с ягоди и чиа семена.',
      'Сервирайте топла.',
    ],
    macros: { calories: 320, protein: 12, carbs: 48, fat: 8 },
    category: 'breakfast',
    dietary: ['vegan', 'gluten-free'],
    image: 'https://images.unsplash.com/photo-1517673400265-9b023902e2c5?w=600&h=400&fit=crop',
    authorId: 'system',
    authorName: 'Здравословен Живот',
    createdAt: '2025-01-15T08:00:00.000Z',
  },
  {
    id: 'r2',
    title: 'Пилешка салата с киноа',
    description: 'Високопротеинов обяд, перфектен за активен ден.',
    ingredients: ['150г пилешко филе', '80г киноа', '100г краставица', '50г домати', 'Зехтин', 'Лимон'],
    steps: [
      'Сварете киноата според указанията на опаковката.',
      'Изпечете пилешкото филе и нарежете на кубчета.',
      'Нарежете зеленчуците.',
      'Смесете всичко и полейте с зехтин и лимон.',
    ],
    macros: { calories: 420, protein: 38, carbs: 32, fat: 12 },
    category: 'lunch',
    dietary: ['high-protein', 'gluten-free'],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
    authorId: 'system',
    authorName: 'Здравословен Живот',
    createdAt: '2025-01-20T12:00:00.000Z',
  },
  {
    id: 'r3',
    title: 'Сьомга с броколи',
    description: 'Омега-3 богато ястие за вечеря, идеално за кето диета.',
    ingredients: ['200г сьомга', '200г броколи', '2 с.л. зехтин', 'Чесън', 'Лимон', 'Сол и подправки'],
    steps: [
      'Загрейте фурната на 200°C.',
      'Подправете сьомгата и я сложете в тава.',
      'Добавете броколите, полейте със зехтин.',
      'Печете 18-20 минути.',
      'Сервирайте с лимон.',
    ],
    macros: { calories: 380, protein: 35, carbs: 8, fat: 22 },
    category: 'dinner',
    dietary: ['keto', 'high-protein', 'gluten-free'],
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop',
    authorId: 'system',
    authorName: 'Здравословен Живот',
    createdAt: '2025-02-01T18:00:00.000Z',
  },
  {
    id: 'r4',
    title: 'Смути боул с банан',
    description: 'Освежаващ десерт или закуска с натурална сладост.',
    ingredients: ['1 банан', '100г замразени ягоди', '150мл кокосово мляко', 'Гранола', 'Кокосови стърготини'],
    steps: [
      'Блендирайте банана, ягодите и млякото до гладка смес.',
      'Изсипете в купа.',
      'Гарнирайте с гранола и кокос.',
    ],
    macros: { calories: 290, protein: 6, carbs: 42, fat: 12 },
    category: 'dessert',
    dietary: ['vegan', 'gluten-free'],
    image: 'https://images.unsplash.com/photo-1590301157893-4f0f0a2d7f8e?w=600&h=400&fit=crop',
    authorId: 'system',
    authorName: 'Здравословен Живот',
    createdAt: '2025-02-10T10:00:00.000Z',
  },
];

export function getCategoryLabel(id) {
  return RECIPE_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function getDietaryLabel(id) {
  return DIETARY_TAGS.find((d) => d.id === id)?.label ?? id;
}

export function getRandomTip() {
  return dailyTips[Math.floor(Math.random() * dailyTips.length)];
}
