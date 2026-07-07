import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Heart, Pencil, Trash2 } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import RecipeForm from '../components/recipes/RecipeForm';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { RECIPE_CATEGORIES, DIETARY_TAGS, getCategoryLabel, getDietaryLabel } from '../data/tips';
import { resolveRecipeImage } from '../utils/imageUtils';

export default function Recipes() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [dietary, setDietary] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  const { recipes, addRecipe, updateRecipe, deleteRecipe, toggleFavoriteRecipe, isRecipeFavorite } = useApp();
  const { isAuthenticated, user } = useAuth();

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(search.toLowerCase()) ||
        recipe.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || recipe.category === category;
      const matchesDietary = dietary === 'all' || recipe.dietary?.includes(dietary);
      return matchesSearch && matchesCategory && matchesDietary;
    });
  }, [recipes, search, category, dietary]);

  const handleAddRecipe = (data) => {
    addRecipe(data);
    setShowForm(false);
  };

  const handleUpdateRecipe = (data) => {
    updateRecipe(editingRecipe.id, data);
    setEditingRecipe(null);
  };

  const handleDelete = (recipeId) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете тази рецепта?')) {
      deleteRecipe(recipeId);
    }
  };

  const canEdit = (recipe) => isAuthenticated && recipe.authorId === user?.id;

  return (
    <div className="page-container">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Споделени Рецепти</h1>
          <p className="page-subtitle">
            Общност от здравословни рецепти – споделете своите любими ястия.
          </p>
        </div>
        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => {
              setEditingRecipe(null);
              setShowForm(!showForm);
            }}
            className="btn-primary shrink-0"
          >
            <Plus className="h-4 w-4" />
            Качи рецепта
          </button>
        ) : (
          <Link to="/login" className="btn-primary shrink-0">
            Влезте за да качите рецепта
          </Link>
        )}
      </div>

      {(showForm || editingRecipe) && isAuthenticated && (
        <div className="mb-8">
          <RecipeForm
            initialData={editingRecipe}
            onSubmit={editingRecipe ? handleUpdateRecipe : handleAddRecipe}
            onCancel={() => {
              setShowForm(false);
              setEditingRecipe(null);
            }}
            submitLabel={editingRecipe ? 'Запази промените' : 'Публикувай рецепта'}
          />
        </div>
      )}

      <div className="mb-6 space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Търсене на рецепта..."
        />

        <div className="flex flex-wrap gap-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Категория</p>
            <div className="flex flex-wrap gap-2">
              {RECIPE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    category === cat.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-emerald-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Диета</p>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setDietary(tag.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    dietary === tag.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-emerald-50'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-500">{filteredRecipes.length} рецепти</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRecipes.map((recipe) => (
          <article key={recipe.id} className="card-hover group relative overflow-hidden p-0">
            <Link to={`/recepti/${recipe.id}`} className="block">
              <div className="relative">
                <img
                  src={resolveRecipeImage(recipe.image)}
                  alt={recipe.title}
                  className="h-48 w-full object-cover transition group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (isAuthenticated) toggleFavoriteRecipe(recipe.id);
                  }}
                  className={`absolute right-3 top-3 rounded-full p-2 shadow transition ${
                    isRecipeFavorite(recipe.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 text-gray-400 hover:text-red-500'
                  } ${!isAuthenticated ? 'cursor-not-allowed opacity-60' : ''}`}
                  title={isAuthenticated ? 'Любими' : 'Влезте за любими'}
                >
                  <Heart className={`h-4 w-4 ${isRecipeFavorite(recipe.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  <span className="badge bg-emerald-100 text-emerald-700">
                    {getCategoryLabel(recipe.category)}
                  </span>
                  {recipe.dietary?.slice(0, 2).map((tag) => (
                    <span key={tag} className="badge bg-blue-100 text-blue-700">
                      {getDietaryLabel(tag)}
                    </span>
                  ))}
                </div>
                <h3 className="mt-2 font-semibold text-gray-900 group-hover:text-emerald-700">
                  {recipe.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{recipe.description}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-medium text-emerald-600">{recipe.macros.calories} kcal</span>
                  <span className="text-gray-400">от {recipe.authorName}</span>
                </div>
              </div>
            </Link>

            {canEdit(recipe) && (
              <div className="flex gap-2 border-t border-emerald-50 px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRecipe(recipe);
                  }}
                  className="btn-ghost flex-1 text-sm"
                >
                  <Pencil className="h-4 w-4" />
                  Редактирай
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(recipe.id)}
                  className="btn-ghost flex-1 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Изтрий
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="py-16 text-center text-gray-500">
          Няма намерени рецепти по зададените критерии.
        </div>
      )}
    </div>
  );
}
