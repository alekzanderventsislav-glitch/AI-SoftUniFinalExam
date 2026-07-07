import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Heart, Clock, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getCategoryLabel, getDietaryLabel } from '../data/tips';
import { resolveRecipeImage } from '../utils/imageUtils';

export default function RecipeDetail() {
  const { id } = useParams();
  const { getRecipeById, toggleFavoriteRecipe, isRecipeFavorite } = useApp();
  const { isAuthenticated } = useAuth();
  const recipe = getRecipeById(id);

  if (!recipe) {
    return <Navigate to="/recepti" replace />;
  }

  const handleFavorite = () => {
    if (!isAuthenticated) return;
    toggleFavoriteRecipe(recipe.id);
  };

  return (
    <div className="page-container">
      <Link to="/recepti" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700">
        <ArrowLeft className="h-4 w-4" />
        Назад към рецепти
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl">
          <img
            src={resolveRecipeImage(recipe.image)}
            alt={recipe.title}
            className="h-72 w-full object-cover lg:h-full lg:min-h-[400px]"
          />
        </div>

        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-emerald-100 text-emerald-700">
                  {getCategoryLabel(recipe.category)}
                </span>
                {recipe.dietary?.map((tag) => (
                  <span key={tag} className="badge bg-blue-100 text-blue-700">
                    {getDietaryLabel(tag)}
                  </span>
                ))}
              </div>
              <h1 className="mt-3 text-3xl font-bold text-gray-900">{recipe.title}</h1>
              <p className="mt-2 text-gray-600">{recipe.description}</p>
              <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                <User className="h-4 w-4" />
                {recipe.authorName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleFavorite}
              disabled={!isAuthenticated}
              className={`rounded-xl p-3 transition ${
                isRecipeFavorite(recipe.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-emerald-50 text-gray-400 hover:text-red-500'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <Heart className={`h-5 w-5 ${isRecipeFavorite(recipe.id) ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-3">
            <div className="rounded-xl bg-orange-50 p-3 text-center">
              <p className="text-lg font-bold text-orange-600">{recipe.macros.calories}</p>
              <p className="text-xs text-gray-500">kcal</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-center">
              <p className="text-lg font-bold text-blue-600">{recipe.macros.protein}г</p>
              <p className="text-xs text-gray-500">Протеини</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-center">
              <p className="text-lg font-bold text-amber-600">{recipe.macros.carbs}г</p>
              <p className="text-xs text-gray-500">Въглехидрати</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-3 text-center">
              <p className="text-lg font-bold text-purple-600">{recipe.macros.fat}г</p>
              <p className="text-xs text-gray-500">Мазнини</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900">Съставки</h2>
            <ul className="mt-3 space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li
                  key={`${ingredient}-${index}`}
                  className="flex items-center gap-3 rounded-lg bg-emerald-50/50 px-4 py-2 text-gray-700"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900">Стъпки за приготвяне</h2>
            <ol className="mt-4 space-y-3">
              {recipe.steps.map((step, index) => (
                <li
                  key={`${step}-${index}`}
                  className="flex gap-4 rounded-xl border border-emerald-100 bg-white p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="text-gray-700">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {recipe.createdAt && (
            <p className="mt-6 flex items-center gap-1 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              Публикувана на {new Date(recipe.createdAt).toLocaleDateString('bg-BG')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
