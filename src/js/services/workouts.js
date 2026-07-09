import { getSupabaseOrThrow } from '../supabaseClient.js';

export async function fetchUserWorkouts() {
  const { data, error } = await getSupabaseOrThrow()
    .from('user_workouts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return attachAuthorNames(data);
}

export async function fetchUserWorkoutById(id) {
  const { data, error } = await getSupabaseOrThrow()
    .from('user_workouts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  const [workout] = await attachAuthorNames([data]);
  return workout;
}

export async function createUserWorkout(workout, authorId) {
  const { data, error } = await getSupabaseOrThrow()
    .from('user_workouts')
    .insert({
      author_id: authorId,
      title: workout.title,
      description: workout.description,
      difficulty: workout.difficulty,
      goal: workout.goal,
      duration: workout.duration,
      calories: workout.calories,
      exercises: workout.exercises,
      image_url: workout.image_url || null,
      is_public: workout.is_public,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserWorkout(id, workout) {
  const { data, error } = await getSupabaseOrThrow()
    .from('user_workouts')
    .update({
      title: workout.title,
      description: workout.description,
      difficulty: workout.difficulty,
      goal: workout.goal,
      duration: workout.duration,
      calories: workout.calories,
      exercises: workout.exercises,
      image_url: workout.image_url || null,
      is_public: workout.is_public,
    })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Тренировката не беше намерена или нямате права за редакция.');
  return data;
}

export async function deleteUserWorkout(id) {
  const { error } = await getSupabaseOrThrow().from('user_workouts').delete().eq('id', id);
  if (error) throw error;
}

async function attachAuthorNames(rows) {
  if (!rows.length) return [];

  const client = getSupabaseOrThrow();
  const authorIds = [...new Set(rows.map((r) => r.author_id))];
  const { data: profiles, error } = await client
    .from('profiles')
    .select('id, full_name')
    .in('id', authorIds);

  if (error) throw error;

  const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

  return rows.map((row) => mapUserWorkout({
    ...row,
    profiles: profileMap[row.author_id] || null,
  }));
}

function mapUserWorkout(row) {
  return {
    ...row,
    authorName: row.profiles?.full_name || 'Потребител',
    image: row.image_url,
    isUserCreated: true,
  };
}
