import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { defaultRecipes } from '../data/tips';
import { STORAGE_KEYS, loadFromStorage, saveToStorage, generateId, getTodayKey } from '../utils/storage';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

const defaultProfile = {
  targetCalories: 2000,
  targetProtein: 120,
  targetCarbs: 250,
  targetFat: 65,
  waterGoal: 8,
};

const defaultFavorites = { recipes: [], workouts: [] };

export function AppProvider({ children }) {
  const { user } = useAuth();

  const [recipes, setRecipes] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEYS.RECIPES);
    return stored ?? defaultRecipes;
  });

  const [favorites, setFavorites] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEYS.FAVORITES, {});
    return { ...defaultFavorites, ...stored };
  });

  const [profile, setProfile] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEYS.PROFILE, {});
    return { ...defaultProfile, ...stored };
  });

  const [dailyTracker, setDailyTracker] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEYS.DAILY_TRACKER, {});
    const today = getTodayKey();
    return stored[today] ?? { calories: 0, water: 0, date: today };
  });

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RECIPES, recipes);
  }, [recipes]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
  }, [favorites]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PROFILE, profile);
  }, [profile]);

  useEffect(() => {
    const stored = loadFromStorage(STORAGE_KEYS.DAILY_TRACKER, {});
    const today = getTodayKey();
    saveToStorage(STORAGE_KEYS.DAILY_TRACKER, {
      ...stored,
      [today]: dailyTracker,
    });
  }, [dailyTracker]);

  const showToast = useCallback((message, type = 'success') => {
    const id = generateId('toast');
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const addRecipe = useCallback((recipeData) => {
    const newRecipe = {
      ...recipeData,
      id: generateId('recipe'),
      authorId: user?.id ?? 'guest',
      authorName: user?.name ?? 'Гост',
      createdAt: new Date().toISOString(),
    };
    setRecipes((prev) => [newRecipe, ...prev]);
    showToast('Рецептата е добавена успешно!');
    return newRecipe;
  }, [user, showToast]);

  const updateRecipe = useCallback((id, recipeData) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...recipeData, updatedAt: new Date().toISOString() } : r))
    );
    showToast('Рецептата е обновена успешно!');
  }, [showToast]);

  const deleteRecipe = useCallback((id) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setFavorites((prev) => ({
      ...prev,
      recipes: prev.recipes.filter((fid) => fid !== id),
    }));
    showToast('Рецептата е изтрита.', 'info');
  }, [showToast]);

  const toggleFavoriteRecipe = useCallback((recipeId) => {
    setFavorites((prev) => {
      const isFav = prev.recipes.includes(recipeId);
      if (isFav) {
        showToast('Премахнато от любими.', 'info');
        return { ...prev, recipes: prev.recipes.filter((id) => id !== recipeId) };
      }
      showToast('Добавено в любими!');
      return { ...prev, recipes: [...prev.recipes, recipeId] };
    });
  }, [showToast]);

  const toggleFavoriteWorkout = useCallback((workoutId) => {
    setFavorites((prev) => {
      const isFav = prev.workouts.includes(workoutId);
      if (isFav) {
        showToast('Тренировката е премахната от любими.', 'info');
        return { ...prev, workouts: prev.workouts.filter((id) => id !== workoutId) };
      }
      showToast('Тренировката е добавена в любими!');
      return { ...prev, workouts: [...prev.workouts, workoutId] };
    });
  }, [showToast]);

  const isRecipeFavorite = useCallback(
    (id) => favorites.recipes.includes(id),
    [favorites.recipes]
  );

  const isWorkoutFavorite = useCallback(
    (id) => favorites.workouts.includes(id),
    [favorites.workouts]
  );

  const updateProfile = useCallback((updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    showToast('Профилът е запазен!');
  }, [showToast]);

  const addCalories = useCallback((amount) => {
    setDailyTracker((prev) => ({
      ...prev,
      calories: Math.min(prev.calories + amount, 5000),
      date: getTodayKey(),
    }));
  }, []);

  const addWater = useCallback(() => {
    setDailyTracker((prev) => ({
      ...prev,
      water: Math.min(prev.water + 1, 20),
      date: getTodayKey(),
    }));
    showToast('Чаша вода добавена!', 'info');
  }, [showToast]);

  const getRecipeById = useCallback(
    (id) => recipes.find((r) => r.id === id),
    [recipes]
  );

  const getFavoriteRecipes = useCallback(
    () => recipes.filter((r) => favorites.recipes.includes(r.id)),
    [recipes, favorites.recipes]
  );

  return (
    <AppContext.Provider
      value={{
        recipes,
        favorites,
        profile,
        dailyTracker,
        toasts,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        toggleFavoriteRecipe,
        toggleFavoriteWorkout,
        isRecipeFavorite,
        isWorkoutFavorite,
        updateProfile,
        addCalories,
        addWater,
        getRecipeById,
        getFavoriteRecipes,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp трябва да се използва в AppProvider');
  }
  return context;
}
