-- Здравословен Живот – initial database schema
-- Tables: profiles, user_roles, recipes, favorites

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  target_calories INTEGER NOT NULL DEFAULT 2000,
  target_protein INTEGER NOT NULL DEFAULT 120,
  target_carbs INTEGER NOT NULL DEFAULT 250,
  target_fat INTEGER NOT NULL DEFAULT 65,
  water_goal INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER ROLES (RBAC: user | admin)
-- ============================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- ============================================================
-- RECIPES (community recipes with image in Storage)
-- ============================================================
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  ingredients JSONB NOT NULL DEFAULT '[]',
  steps JSONB NOT NULL DEFAULT '[]',
  calories INTEGER NOT NULL DEFAULT 0,
  protein NUMERIC(6,1) NOT NULL DEFAULT 0,
  carbs NUMERIC(6,1) NOT NULL DEFAULT 0,
  fat NUMERIC(6,1) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'lunch',
  dietary TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recipes_author ON public.recipes(author_id);
CREATE INDEX idx_recipes_category ON public.recipes(category);

-- ============================================================
-- FAVORITES (recipes and workouts bookmarked by users)
-- ============================================================
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('recipe', 'workout')),
  item_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, item_type, item_id)
);

CREATE INDEX idx_favorites_user ON public.favorites(user_id);

-- ============================================================
-- HELPER: check if current user is admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- AUTO-CREATE profile + default role on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- UPDATED_AT trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- User roles
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Recipes
CREATE POLICY "Recipes are public"
  ON public.recipes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Authors and admins can delete recipes"
  ON public.recipes FOR DELETE
  USING (auth.uid() = author_id OR public.is_admin());

-- Favorites
CREATE POLICY "Users manage own favorites"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- STORAGE: recipe-images bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read recipe images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recipe-images');

CREATE POLICY "Authenticated users upload recipe images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'recipe-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users delete own recipe images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'recipe-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- SEED: default recipes (optional – run after first admin exists)
-- After creating a user in Supabase Auth, promote to admin:
-- UPDATE user_roles SET role='admin' WHERE user_id = (SELECT id FROM auth.users WHERE email='your-admin@email.bg');
