import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import { fileToBase64, isValidImageUrl } from '../../utils/imageUtils';
import { RECIPE_CATEGORIES, DIETARY_TAGS } from '../../data/tips';

const emptyForm = {
  title: '',
  description: '',
  ingredients: '',
  steps: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  category: 'lunch',
  dietary: [],
  image: '',
  imageMode: 'url',
};

export default function RecipeForm({ initialData, onSubmit, onCancel, submitLabel = 'Публикувай рецепта' }) {
  const [form, setForm] = useState(() => {
    if (!initialData) return emptyForm;
    return {
      title: initialData.title ?? '',
      description: initialData.description ?? '',
      ingredients: (initialData.ingredients ?? []).join('\n'),
      steps: (initialData.steps ?? []).join('\n'),
      calories: String(initialData.macros?.calories ?? ''),
      protein: String(initialData.macros?.protein ?? ''),
      carbs: String(initialData.macros?.carbs ?? ''),
      fat: String(initialData.macros?.fat ?? ''),
      category: initialData.category ?? 'lunch',
      dietary: initialData.dietary ?? [],
      image: initialData.image ?? '',
      imageMode: initialData.image?.startsWith('data:image') ? 'file' : 'url',
    };
  });
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(initialData?.image ?? '');

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDietary = (tagId) => {
    setForm((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(tagId)
        ? prev.dietary.filter((t) => t !== tagId)
        : [...prev.dietary, tagId],
    }));
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      updateField('image', base64);
      setPreview(base64);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImageUrl = (url) => {
    updateField('image', url);
    if (isValidImageUrl(url)) {
      setPreview(url);
    } else if (!url) {
      setPreview('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.description.trim()) {
      setError('Моля, попълнете заглавие и описание.');
      return;
    }

    const ingredients = form.ingredients.split('\n').map((s) => s.trim()).filter(Boolean);
    const steps = form.steps.split('\n').map((s) => s.trim()).filter(Boolean);

    if (ingredients.length === 0 || steps.length === 0) {
      setError('Добавете поне една съставка и една стъпка.');
      return;
    }

    const macros = {
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    };

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      ingredients,
      steps,
      macros,
      category: form.category,
      dietary: form.dietary,
      image: form.image || preview,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {initialData ? 'Редактирай рецепта' : 'Качи нова рецепта'}
        </h2>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label-field" htmlFor="title">Заглавие</label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="input-field"
            placeholder="напр. Зеленчукова салата"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label-field" htmlFor="description">Описание</label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="input-field min-h-[80px] resize-y"
            placeholder="Кратко описание на рецептата..."
            required
          />
        </div>

        <div>
          <label className="label-field" htmlFor="ingredients">Съставки (по една на ред)</label>
          <textarea
            id="ingredients"
            value={form.ingredients}
            onChange={(e) => updateField('ingredients', e.target.value)}
            className="input-field min-h-[120px] resize-y"
            placeholder="200г спанак&#10;1 домат&#10;Зехтин"
            required
          />
        </div>

        <div>
          <label className="label-field" htmlFor="steps">Стъпки за приготвяне (по една на ред)</label>
          <textarea
            id="steps"
            value={form.steps}
            onChange={(e) => updateField('steps', e.target.value)}
            className="input-field min-h-[120px] resize-y"
            placeholder="Измийте зеленчуците...&#10;Нарежете на кубчета..."
            required
          />
        </div>

        <div>
          <label className="label-field" htmlFor="calories">Калории</label>
          <input
            id="calories"
            type="number"
            min="0"
            value={form.calories}
            onChange={(e) => updateField('calories', e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-field" htmlFor="protein">Протеини (г)</label>
          <input
            id="protein"
            type="number"
            min="0"
            value={form.protein}
            onChange={(e) => updateField('protein', e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-field" htmlFor="carbs">Въглехидрати (г)</label>
          <input
            id="carbs"
            type="number"
            min="0"
            value={form.carbs}
            onChange={(e) => updateField('carbs', e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-field" htmlFor="fat">Мазнини (г)</label>
          <input
            id="fat"
            type="number"
            min="0"
            value={form.fat}
            onChange={(e) => updateField('fat', e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="label-field" htmlFor="category">Категория</label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            className="input-field"
          >
            {RECIPE_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="label-field">Диетични предпочитания</p>
          <div className="flex flex-wrap gap-2">
            {DIETARY_TAGS.filter((t) => t.id !== 'all').map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleDietary(tag.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  form.dietary.includes(tag.id)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-emerald-50'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <p className="label-field">Изображение</p>
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => updateField('imageMode', 'url')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                form.imageMode === 'url' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              URL адрес
            </button>
            <button
              type="button"
              onClick={() => updateField('imageMode', 'file')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                form.imageMode === 'file' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Качи файл
            </button>
          </div>

          {form.imageMode === 'url' ? (
            <input
              type="url"
              value={form.imageMode === 'url' ? form.image : ''}
              onChange={(e) => handleImageUrl(e.target.value)}
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 px-6 py-8 transition hover:border-emerald-400">
              <Upload className="h-8 w-8 text-emerald-500" />
              <span className="mt-2 text-sm font-medium text-emerald-700">Избери изображение</span>
              <span className="mt-1 text-xs text-gray-500">PNG, JPG до 2MB</span>
              <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
            </label>
          )}

          {preview && (
            <div className="mt-3 overflow-hidden rounded-xl">
              <img src={preview} alt="Преглед" className="h-40 w-full object-cover" />
            </div>
          )}
          {!preview && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
              <ImageIcon className="h-4 w-4" />
              Няма избрано изображение
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" className="btn-primary">
          <Plus className="h-4 w-4" />
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Отказ
          </button>
        )}
      </div>
    </form>
  );
}
