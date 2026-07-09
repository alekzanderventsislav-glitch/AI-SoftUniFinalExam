-- User-created workouts (private or public)

CREATE TABLE public.user_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'beginner'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  goal TEXT NOT NULL DEFAULT 'weight-loss'
    CHECK (goal IN ('weight-loss', 'muscle-gain', 'endurance', 'flexibility')),
  duration INTEGER NOT NULL DEFAULT 30 CHECK (duration > 0),
  calories INTEGER NOT NULL DEFAULT 0 CHECK (calories >= 0),
  exercises JSONB NOT NULL DEFAULT '[]',
  image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_workouts_author ON public.user_workouts(author_id);
CREATE INDEX idx_user_workouts_public ON public.user_workouts(is_public) WHERE is_public = true;

CREATE TRIGGER user_workouts_updated_at
  BEFORE UPDATE ON public.user_workouts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public workouts are viewable by everyone"
  ON public.user_workouts FOR SELECT
  USING (is_public = true OR auth.uid() = author_id);

CREATE POLICY "Authenticated users can create workouts"
  ON public.user_workouts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own workouts"
  ON public.user_workouts FOR UPDATE
  USING (auth.uid() = author_id OR public.is_admin())
  WITH CHECK (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Authors and admins can delete workouts"
  ON public.user_workouts FOR DELETE
  USING (auth.uid() = author_id OR public.is_admin());

INSERT INTO storage.buckets (id, name, public)
VALUES ('workout-images', 'workout-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read workout images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'workout-images');

CREATE POLICY "Authenticated users upload workout images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'workout-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users delete own workout images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'workout-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
