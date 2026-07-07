import { useMemo, useState } from 'react';
import { Apple } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import { foods, FOOD_CATEGORIES, getCategoryLabel } from '../data/foods';

export default function FoodDatabase() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || food.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="page-title">Каталог на храните</h1>
        <p className="page-subtitle">
          Разгледайте хранителните стойности на различни храни – калории и макронутриенти на 100г.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Търсене по име на храна..."
          className="flex-1"
        />
        <div className="flex flex-wrap gap-2">
          {FOOD_CATEGORIES.map((cat) => (
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

      <p className="mb-4 text-sm text-gray-500">
        Показани {filteredFoods.length} от {foods.length} храни
      </p>

      <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white shadow-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-emerald-100 bg-emerald-50/50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">Храна</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Категория</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Калории</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Протеини (г)</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Въглехидрати (г)</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Мазнини (г)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-50">
            {filteredFoods.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  Няма намерени храни по зададените критерии.
                </td>
              </tr>
            ) : (
              filteredFoods.map((food) => (
                <tr key={food.id} className="transition hover:bg-emerald-50/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <Apple className="h-4 w-4 text-emerald-500" />
                      {food.name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-emerald-100 text-emerald-700">
                      {getCategoryLabel(food.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-orange-600">{food.calories}</td>
                  <td className="px-4 py-3 text-blue-600">{food.protein}</td>
                  <td className="px-4 py-3 text-amber-600">{food.carbs}</td>
                  <td className="px-4 py-3 text-purple-600">{food.fat}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:hidden">
        {filteredFoods.map((food) => (
          <div key={food.id} className="card">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{food.name}</h3>
              <span className="badge bg-emerald-100 text-emerald-700">
                {getCategoryLabel(food.category)}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-lg bg-orange-50 p-2">
                <p className="font-bold text-orange-600">{food.calories}</p>
                <p className="text-gray-500">kcal</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2">
                <p className="font-bold text-blue-600">{food.protein}</p>
                <p className="text-gray-500">П</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2">
                <p className="font-bold text-amber-600">{food.carbs}</p>
                <p className="text-gray-500">В</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-2">
                <p className="font-bold text-purple-600">{food.fat}</p>
                <p className="text-gray-500">М</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
