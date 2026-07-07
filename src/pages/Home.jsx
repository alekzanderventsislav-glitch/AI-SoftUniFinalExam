import { Link } from 'react-router-dom';
import {
  Droplets,
  Flame,
  Lightbulb,
  ArrowRight,
  Dumbbell,
  ChefHat,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getRandomTip } from '../data/tips';
import { workouts } from '../data/workouts';
import { resolveRecipeImage } from '../utils/imageUtils';

export default function Home() {
  const { recipes, profile, dailyTracker, addWater, addCalories } = useApp();
  const tip = getRandomTip();
  const featuredRecipes = recipes.slice(0, 3);
  const featuredWorkouts = workouts.slice(0, 3);

  const caloriePercent = Math.min(
    Math.round((dailyTracker.calories / profile.targetCalories) * 100),
    100
  );
  const waterPercent = Math.min(
    Math.round((dailyTracker.water / profile.waterGoal) * 100),
    100
  );

  return (
    <div className="page-container">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-6 py-12 text-white shadow-lg sm:px-10 sm:py-16">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold sm:text-5xl">Добре дошли в Здравословен Живот</h1>
          <p className="mt-4 text-lg text-emerald-50">
            Вашият личен портал за балансирано хранене, активен начин на живот и здравословни навици.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/recepti" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow transition hover:bg-emerald-50">
              <ChefHat className="h-4 w-4" />
              Разгледай рецепти
            </Link>
            <Link to="/trenirovki" className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
              <Dumbbell className="h-4 w-4" />
              Започни тренировка
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-20 h-48 w-48 rounded-full bg-white/5" />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Съвет за деня</h2>
              <p className="mt-1 text-gray-600">{tip}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-emerald-700">
            <TrendingUp className="h-5 w-5" />
            <h2 className="font-semibold">Бърза статистика</h2>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{recipes.length} рецепти</p>
          <p className="text-sm text-gray-500">{workouts.length} тренировки в библиотеката</p>
        </div>
      </section>

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <h2 className="font-semibold text-gray-900">Калории днес</h2>
            </div>
            <span className="text-sm text-gray-500">
              {dailyTracker.calories} / {profile.targetCalories} kcal
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[100, 250, 500].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => addCalories(amount)}
                className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 transition hover:bg-orange-100"
              >
                +{amount} kcal
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold text-gray-900">Вода днес</h2>
            </div>
            <span className="text-sm text-gray-500">
              {dailyTracker.water} / {profile.waterGoal} чаши
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 transition-all"
              style={{ width: `${waterPercent}%` }}
            />
          </div>
          <button
            type="button"
            onClick={addWater}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
          >
            <Plus className="h-4 w-4" />
            Добави чаша вода
          </button>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Препоръчани рецепти</h2>
          <Link to="/recepti" className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
            Виж всички <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredRecipes.map((recipe) => (
            <Link key={recipe.id} to={`/recepti/${recipe.id}`} className="card-hover group overflow-hidden p-0">
              <img
                src={resolveRecipeImage(recipe.image)}
                alt={recipe.title}
                className="h-44 w-full object-cover transition group-hover:scale-105"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700">{recipe.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{recipe.description}</p>
                <p className="mt-2 text-sm font-medium text-emerald-600">{recipe.macros.calories} kcal</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Популярни тренировки</h2>
          <Link to="/trenirovki" className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
            Виж всички <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredWorkouts.map((workout) => (
            <Link key={workout.id} to={`/trenirovki/${workout.id}`} className="card-hover group overflow-hidden p-0">
              <img
                src={workout.image}
                alt={workout.title}
                className="h-44 w-full object-cover transition group-hover:scale-105"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700">{workout.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{workout.duration} мин · {workout.calories} kcal</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
