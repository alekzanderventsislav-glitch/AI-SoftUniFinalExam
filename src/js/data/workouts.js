export const DIFFICULTY_LEVELS = [
  { id: 'all', label: 'Всички нива' },
  { id: 'beginner', label: 'Начинаещ' },
  { id: 'intermediate', label: 'Среден' },
  { id: 'advanced', label: 'Напреднал' },
];

export const WORKOUT_GOALS = [
  { id: 'all', label: 'Всички цели' },
  { id: 'weight-loss', label: 'Отслабване' },
  { id: 'muscle-gain', label: 'Мускулна маса' },
  { id: 'endurance', label: 'Издръжливост' },
];

export const workouts = [
  { id: 'w1', title: 'Сутрешна енергия', difficulty: 'beginner', goal: 'weight-loss', duration: 25, calories: 180, description: 'Лека кардио тренировка за активно начало на деня.', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop', exercises: [{ name: 'Разгрявка – ходене на място', duration: '3 мин' }, { name: 'Jumping Jacks', duration: '2 мин' }, { name: 'Клекове', duration: '3 x 12' }, { name: 'Планк', duration: '3 x 30 сек' }, { name: 'Бърпи (опростени)', duration: '3 x 8' }, { name: 'Стречинг', duration: '5 мин' }] },
  { id: 'w2', title: 'HIIT за изгаряне', difficulty: 'intermediate', goal: 'weight-loss', duration: 30, calories: 320, description: 'Интензивна интервална тренировка за максимално изгаряне на калории.', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop', exercises: [{ name: 'Спринт на място', duration: '45 сек / 15 сек почивка x 5' }, { name: 'Планк с ротация', duration: '3 x 10' }, { name: 'Планински катерачи', duration: '3 x 20' }, { name: 'Скокове с клек', duration: '3 x 12' }, { name: 'Върбели', duration: '3 x 30 сек' }, { name: 'Охлаждане', duration: '5 мин' }] },
  { id: 'w3', title: 'Сила за горна част', difficulty: 'intermediate', goal: 'muscle-gain', duration: 40, calories: 280, description: 'Тренировка за гърди, рамене и трицепс с собствено тегло.', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c1498?w=600&h=400&fit=crop', exercises: [{ name: 'Лицеви опори', duration: '4 x 12' }, { name: 'Diamond Push-ups', duration: '3 x 10' }, { name: 'Pike Push-ups', duration: '3 x 10' }, { name: 'Tricep Dips (стол)', duration: '3 x 12' }, { name: 'Plank to Downward Dog', duration: '3 x 10' }, { name: 'Разтягане', duration: '5 мин' }] },
  { id: 'w4', title: 'Долна част – мускулна маса', difficulty: 'advanced', goal: 'muscle-gain', duration: 45, calories: 350, description: 'Интензивна тренировка за крака и седалище.', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop', exercises: [{ name: 'Български клек', duration: '4 x 10 на крак' }, { name: 'Румънска мъртва тяга', duration: '4 x 12' }, { name: 'Клекове с скок', duration: '3 x 15' }, { name: 'Walking Lunges', duration: '3 x 20' }, { name: 'Wall Sit', duration: '3 x 45 сек' }, { name: 'Стречинг', duration: '8 мин' }] },
  { id: 'w5', title: 'Кардио издръжливост', difficulty: 'intermediate', goal: 'endurance', duration: 35, calories: 300, description: 'Продължителна кардио сесия за подобряване на издръжливостта.', image: 'https://images.unsplash.com/photo-1476480862128-209faa394bbf?w=600&h=400&fit=crop', exercises: [{ name: 'Бързо ходене / лек джог', duration: '10 мин' }, { name: 'Скачане на въже', duration: '5 x 2 мин' }, { name: 'High Knees', duration: '4 x 1 мин' }, { name: 'Butt Kicks', duration: '4 x 1 мин' }, { name: 'Side Shuffles', duration: '3 x 1 мин' }, { name: 'Охлаждане', duration: '5 мин' }] },
  { id: 'w6', title: 'Йога за гъвкавост', difficulty: 'beginner', goal: 'endurance', duration: 30, calories: 120, description: 'Спокойна йога сесия за гъвкавост и възстановяване.', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop', exercises: [{ name: 'Cat-Cow Stretch', duration: '2 мин' }, { name: 'Downward Dog', duration: '3 x 30 сек' }, { name: 'Warrior I & II', duration: '3 x 30 сек на страна' }, { name: "Child's Pose", duration: '2 мин' }, { name: 'Pigeon Pose', duration: '2 x 1 мин на страна' }, { name: 'Savasana', duration: '5 мин' }] },
  { id: 'w7', title: 'Табата бласт', difficulty: 'advanced', goal: 'weight-loss', duration: 20, calories: 250, description: '20-минутна табата тренировка с максимална интензивност.', image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=600&h=400&fit=crop', exercises: [{ name: 'Табата: Burpees', duration: '4 мин (20/10)' }, { name: 'Табата: Squat Jumps', duration: '4 мин (20/10)' }, { name: 'Табата: Mountain Climbers', duration: '4 мин (20/10)' }, { name: 'Табата: High Knees', duration: '4 мин (20/10)' }, { name: 'Охлаждане', duration: '4 мин' }] },
  { id: 'w8', title: 'Core & стабилност', difficulty: 'beginner', goal: 'muscle-gain', duration: 20, calories: 150, description: 'Фокус върху коремните мускули и стабилност на тялото.', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop', exercises: [{ name: 'Dead Bug', duration: '3 x 10' }, { name: 'Bicycle Crunches', duration: '3 x 15' }, { name: 'Plank', duration: '3 x 40 сек' }, { name: 'Side Plank', duration: '2 x 30 сек на страна' }, { name: 'Leg Raises', duration: '3 x 12' }, { name: 'Разтягане', duration: '3 мин' }] },
];

export function getDifficultyLabel(id) {
  return DIFFICULTY_LEVELS.find((d) => d.id === id)?.label ?? id;
}

export function getGoalLabel(id) {
  return WORKOUT_GOALS.find((g) => g.id === id)?.label ?? id;
}

export function getWorkoutById(id) {
  return workouts.find((w) => w.id === id);
}
