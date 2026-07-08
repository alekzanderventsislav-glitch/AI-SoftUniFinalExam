import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function isSecretKey(key) {
  if (!key || typeof key !== 'string') return false;
  const lower = key.toLowerCase();
  return (
    lower.startsWith('sb_secret_') ||
    lower.includes('service_role') ||
    key === 'your-anon-public-key-here'
  );
}

export const supabaseKeyError = isSecretKey(supabaseAnonKey)
  ? 'Използвате secret ключ в браузъра. В .env сложете anon PUBLIC ключа от Supabase → Settings → API (не secret/service_role).'
  : null;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !isSecretKey(supabaseAnonKey)
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabaseOrThrow() {
  if (supabaseKeyError) {
    throw new Error(supabaseKeyError);
  }
  if (!supabase) {
    throw new Error(
      'Supabase не е конфигуриран. Копирайте .env.example в .env и попълнете ключовете.'
    );
  }
  return supabase;
}
