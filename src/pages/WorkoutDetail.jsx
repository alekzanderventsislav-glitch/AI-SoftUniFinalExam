import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Clock, Flame, Heart, Dumbbell } from 'lucide-react';
import { getWorkoutById, getDifficultyLabel, getGoalLabel } from '../data/workouts';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function WorkoutDetail() {
  const { id } = useParams();
  const workout = getWorkoutById(id);
  const { toggleFavoriteWorkout, isWorkoutFavorite } = useApp();
  const { isAuthenticated } = useAuth();

  if (!workout) {
    return <Navigate to="/trenirovki" replace />;
  }

  const handleFavorite = () => {
    if (!isAuthenticated) return;
    toggleFavoriteWorkout(workout.id);
  };

  return (
    <div className="page-container">
      <Link to="/trenirovki" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700">
        <ArrowLeft className="h-4 w-4" />
        Назад към тренировки
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl">
          <img
            src={workout.image}
            alt={workout.title}
            className="h-72 w-full object-cover lg:h-full lg:min-h-[400px]"
          />
        </div>

        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="badge bg-emerald-100 text-emerald-700">
                  {getDifficultyLabel(workout.difficulty)}
                </span>
                <span className="badge bg-blue-100 text-blue-700">
                  {getGoalLabel(workout.goal)}
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-bold text-gray-900">{workout.title}</h1>
              <p className="mt-2 text-gray-600">{workout.description}</p>
            </div>
            <button
              type="button"
              onClick={handleFavorite}
              disabled={!isAuthenticated}
              className={`rounded-xl p-3 transition ${
                isWorkoutFavorite(workout.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-emerald-50 text-gray-400 hover:text-red-500'
              } disabled:cursor-not-allowed disabled:opacity-50`}
              title={isAuthenticated ? 'Любими' : 'Влезте за да добавите в любими'}
            >
              <Heart className={`h-5 w-5 ${isWorkoutFavorite(workout.id) ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3">
              <Clock className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-xs text-gray-500">Продължителност</p>
                <p className="font-semibold text-gray-900">{workout.duration} минути</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-xs text-gray-500">Калории</p>
                <p className="font-semibold text-gray-900">~{workout.calories} kcal</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3">
              <Dumbbell className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Упражнения</p>
                <p className="font-semibold text-gray-900">{workout.exercises.length}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900">Упражнения</h2>
            <ol className="mt-4 space-y-3">
              {workout.exercises.map((exercise, index) => (
                <li
                  key={`${exercise.name}-${index}`}
                  className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-white p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{exercise.name}</p>
                    <p className="text-sm text-gray-500">{exercise.duration}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
