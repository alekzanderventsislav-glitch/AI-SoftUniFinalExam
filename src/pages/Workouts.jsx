import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Flame, Heart, Dumbbell } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { workouts, DIFFICULTY_LEVELS, WORKOUT_GOALS, getDifficultyLabel, getGoalLabel } from '../data/workouts';

export default function Workouts() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [goal, setGoal] = useState('all');
  const { toggleFavoriteWorkout, isWorkoutFavorite } = useApp();
  const { isAuthenticated } = useAuth();

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((w) => {
      const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase());
      const matchesDifficulty = difficulty === 'all' || w.difficulty === difficulty;
      const matchesGoal = goal === 'all' || w.goal === goal;
      return matchesSearch && matchesDifficulty && matchesGoal;
    });
  }, [search, difficulty, goal]);

  const handleFavorite = (e, workoutId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    toggleFavoriteWorkout(workoutId);
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="page-title">Тренировки</h1>
        <p className="page-subtitle">
          Библиотека с тренировъчни програми – филтрирайте по ниво и цел.
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Търсене на тренировка..."
        />

        <div className="flex flex-wrap gap-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Ниво</p>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_LEVELS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    difficulty === d.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-emerald-50'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Цел</p>
            <div className="flex flex-wrap gap-2">
              {WORKOUT_GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    goal === g.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-emerald-50'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-500">
        {filteredWorkouts.length} тренировки
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredWorkouts.map((workout) => (
          <Link key={workout.id} to={`/trenirovki/${workout.id}`} className="card-hover group relative overflow-hidden p-0">
            <div className="relative">
              <img
                src={workout.image}
                alt={workout.title}
                className="h-48 w-full object-cover transition group-hover:scale-105"
              />
              <button
                type="button"
                onClick={(e) => handleFavorite(e, workout.id)}
                className={`absolute right-3 top-3 rounded-full p-2 shadow transition ${
                  isWorkoutFavorite(workout.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 text-gray-400 hover:text-red-500'
                } ${!isAuthenticated ? 'cursor-not-allowed opacity-60' : ''}`}
                title={isAuthenticated ? 'Добави в любими' : 'Влезте за да добавите в любими'}
              >
                <Heart className={`h-4 w-4 ${isWorkoutFavorite(workout.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-emerald-100 text-emerald-700">
                  {getDifficultyLabel(workout.difficulty)}
                </span>
                <span className="badge bg-blue-100 text-blue-700">
                  {getGoalLabel(workout.goal)}
                </span>
              </div>
              <h3 className="mt-2 font-semibold text-gray-900 group-hover:text-emerald-700">
                {workout.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">{workout.description}</p>
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {workout.duration} мин
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" /> {workout.calories} kcal
                </span>
                <span className="flex items-center gap-1">
                  <Dumbbell className="h-4 w-4" /> {workout.exercises.length} упр.
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredWorkouts.length === 0 && (
        <div className="py-16 text-center text-gray-500">
          Няма намерени тренировки по зададените критерии.
        </div>
      )}
    </div>
  );
}
