import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Target, Heart, ChefHat, Dumbbell, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getWorkoutById } from '../data/workouts';
import { resolveRecipeImage } from '../utils/imageUtils';

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { profile, updateProfile, favorites, getFavoriteRecipes } = useApp();
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);

  const favoriteRecipes = getFavoriteRecipes();
  const favoriteWorkouts = favorites.workouts
    .map((id) => getWorkoutById(id))
    .filter(Boolean);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: Number(value) || 0 }));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(form);
    setSaved(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
            <User className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Профил</h1>
          <p className="mt-2 text-gray-600">
            Влезте в акаунта си, за да персонализирате целите си и да управлявате любимите си рецепти и тренировки.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/login" className="btn-primary">Вход</Link>
            <Link to="/register" className="btn-secondary">Регистрация</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="page-title">Профил</h1>
        <p className="page-subtitle">Управлявайте целите си и преглеждайте любимите си съдържания.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between rounded-lg bg-emerald-50 px-3 py-2">
              <span className="text-gray-600">Любими рецепти</span>
              <span className="font-semibold text-emerald-700">{favoriteRecipes.length}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-emerald-50 px-3 py-2">
              <span className="text-gray-600">Любими тренировки</span>
              <span className="font-semibold text-emerald-700">{favoriteWorkouts.length}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="card lg:col-span-2">
          <div className="mb-6 flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">Дневни цели</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field" htmlFor="targetCalories">Целеви калории</label>
              <input
                id="targetCalories"
                type="number"
                min="0"
                value={form.targetCalories}
                onChange={(e) => handleChange('targetCalories', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field" htmlFor="waterGoal">Цел вода (чаши)</label>
              <input
                id="waterGoal"
                type="number"
                min="1"
                max="20"
                value={form.waterGoal}
                onChange={(e) => handleChange('waterGoal', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field" htmlFor="targetProtein">Целеви протеини (г)</label>
              <input
                id="targetProtein"
                type="number"
                min="0"
                value={form.targetProtein}
                onChange={(e) => handleChange('targetProtein', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field" htmlFor="targetCarbs">Целеви въглехидрати (г)</label>
              <input
                id="targetCarbs"
                type="number"
                min="0"
                value={form.targetCarbs}
                onChange={(e) => handleChange('targetCarbs', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field" htmlFor="targetFat">Целеви мазнини (г)</label>
              <input
                id="targetFat"
                type="number"
                min="0"
                value={form.targetFat}
                onChange={(e) => handleChange('targetFat', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary mt-6">
            <Save className="h-4 w-4" />
            Запази целите
          </button>
          {saved && (
            <p className="mt-2 text-sm text-emerald-600">Целите са запазени успешно!</p>
          )}
        </form>
      </div>

      <section className="mt-12">
        <div className="mb-6 flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900">Любими</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">Рецепти ({favoriteRecipes.length})</h3>
            </div>
            {favoriteRecipes.length === 0 ? (
              <p className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30 px-4 py-8 text-center text-sm text-gray-500">
                Все още нямате любими рецепти.
              </p>
            ) : (
              <div className="space-y-3">
                {favoriteRecipes.map((recipe) => (
                  <Link
                    key={recipe.id}
                    to={`/recepti/${recipe.id}`}
                    className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3 transition hover:bg-emerald-50"
                  >
                    <img
                      src={resolveRecipeImage(recipe.image)}
                      alt={recipe.title}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{recipe.title}</p>
                      <p className="text-sm text-emerald-600">{recipe.macros.calories} kcal</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">Тренировки ({favoriteWorkouts.length})</h3>
            </div>
            {favoriteWorkouts.length === 0 ? (
              <p className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30 px-4 py-8 text-center text-sm text-gray-500">
                Все още нямате любими тренировки.
              </p>
            ) : (
              <div className="space-y-3">
                {favoriteWorkouts.map((workout) => (
                  <Link
                    key={workout.id}
                    to={`/trenirovki/${workout.id}`}
                    className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3 transition hover:bg-emerald-50"
                  >
                    <img
                      src={workout.image}
                      alt={workout.title}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{workout.title}</p>
                      <p className="text-sm text-gray-500">{workout.duration} мин</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
