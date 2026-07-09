import { getSupabaseOrThrow } from '../supabaseClient.js';
import { getAuthorDisplayName } from '../utils/helpers.js';

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

export async function fetchAllUserWorkoutsAdmin() {
  const client = getSupabaseOrThrow();
  const { data: workouts, error } = await client
    .from('user_workouts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!workouts.length) return [];

  const authorIds = [...new Set(workouts.map((w) => w.author_id))];
  const { data: profiles, error: profilesError } = await client
    .from('profiles')
    .select('id, full_name')
    .in('id', authorIds);

  if (profilesError) throw profilesError;

  const { data: roles, error: rolesError } = await client
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', authorIds);

  if (rolesError) throw rolesError;

  const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
  const roleMap = {};
  (roles || []).forEach((row) => {
    if (row.role === 'admin') roleMap[row.user_id] = 'admin';
    else if (!roleMap[row.user_id]) roleMap[row.user_id] = row.role;
  });

  return workouts.map((row) => ({
    ...row,
    profiles: profileMap[row.author_id]
      ? { full_name: profileMap[row.author_id].full_name, id: row.author_id }
      : null,
    authorRole: roleMap[row.author_id] || 'user',
    authorName: getAuthorDisplayName(profileMap[row.author_id]?.full_name, roleMap[row.author_id]),
    image: row.image_url,
    isUserCreated: true,
  }));
}

async function attachAuthorNames(rows) {
  if (!rows.length) return [];

  const client = getSupabaseOrThrow();
  const authorIds = [...new Set(rows.map((r) => r.author_id))];
  if (!authorIds.length) {
    return rows.map((row) => mapUserWorkout({ ...row, profiles: null, authorRole: 'user' }));
  }

  const { data: profiles, error } = await client
    .from('profiles')
    .select('id, full_name')
    .in('id', authorIds);

  if (error) throw error;

  const { data: roles, error: rolesError } = await client
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', authorIds);

  if (rolesError) throw rolesError;

  const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
  const roleMap = {};
  (roles || []).forEach((row) => {
    if (row.role === 'admin') roleMap[row.user_id] = 'admin';
    else if (!roleMap[row.user_id]) roleMap[row.user_id] = row.role;
  });

  return rows.map((row) => mapUserWorkout({
    ...row,
    profiles: profileMap[row.author_id] || null,
    authorRole: roleMap[row.author_id] || 'user',
  }));
}

function mapUserWorkout(row) {
  return {
    ...row,
    authorName: getAuthorDisplayName(row.profiles?.full_name, row.authorRole),
    image: row.image_url,
    isUserCreated: true,
  };
}
