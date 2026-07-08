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

export function getCategoryLabel(id) {
  return RECIPE_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function getDietaryLabel(id) {
  return DIETARY_TAGS.find((d) => d.id === id)?.label ?? id;
}

export function getRandomTip() {
  return dailyTips[Math.floor(Math.random() * dailyTips.length)];
}
