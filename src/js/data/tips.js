export const dailyTips = [
  'Пийте поне 2 литра вода дневно за оптимална хидратация.',
  'Включете поне 5 порции плодове и зеленчуци в менюто си.',
  'Спете 7-9 часа за по-добро възстановяване и метаболизъм.',
  'Започнете деня с протеинова закуска за стабилна енергия.',
  'Правете кратки разходки след всяко хранене – помага на храносмилането.',
  'Ограничете преработените храни и добавете повече цельни зърна.',
  'Планирайте храненията си предварително за по-здравословен избор.',
  'Комбинирайте силови и кардио тренировки за балансиран резултат.',
  'Яжте бавно и осъзнато – тялото има нужда от време да усети ситост.',
  'Добавете повече фибри в менюто си за по-добро храносмилане.',
  'Намалете добавената захар – малките промени водят до големи резултати.',
  'Приготвяйте храна у дома – така контролирате съставките и порциите.',
];

export const dailyMotivations = [
  'Малката стъпка днес е голямата победа утре.',
  'Грижата за себе си не е егоизъм – тя е отговорност.',
  'Всяка здравословна вечеря е инвестиция в по-добро утре.',
  'Не търсите съвършенство – търсите постоянство.',
  'Тялото ви благодари на всяко добро решение.',
  'Дисциплината е мостът между целите и постиженията.',
  'Днес е най-добрият ден да продължите напред.',
  'Силата ви расте с всеки избран здравословен навик.',
  'Вярвайте в процеса – резултатите идват с време.',
  'Енергията започва от това как се храните и почивате.',
  'Вие сте по-способни, отколкото мислите – действайте.',
  'Балансът е по-важен от крайностите.',
  'Всяка тренировка е победа над извиненията.',
  'Здравословният живот е маратон, не спринт.',
  'Изберете напредък пред перфекция.',
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

function getDailyFromList(list, dateKey) {
  let index = 0;
  for (let i = 0; i < dateKey.length; i++) {
    index = (index + dateKey.charCodeAt(i) * (i + 3)) % list.length;
  }
  return list[index];
}

export function getDailyTip(dateKey) {
  return getDailyFromList(dailyTips, dateKey);
}

export function getDailyMotivation(dateKey) {
  const offsetKey = `${dateKey}-motivation`;
  return getDailyFromList(dailyMotivations, offsetKey);
}

/** @deprecated използвайте getDailyTip */
export function getRandomTip() {
  const today = new Date().toISOString().slice(0, 10);
  return getDailyTip(today);
}
