-- Foods catalog (managed by admins, same pattern as recipes/workouts)

CREATE TABLE public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'fruits', 'vegetables', 'meats', 'dairy', 'grains', 'nuts', 'legumes', 'fish'
  )),
  calories INTEGER NOT NULL DEFAULT 0,
  protein NUMERIC(6,1) NOT NULL DEFAULT 0,
  carbs NUMERIC(6,1) NOT NULL DEFAULT 0,
  fat NUMERIC(6,1) NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_foods_category ON public.foods(category);
CREATE INDEX idx_foods_name ON public.foods(name);

CREATE TRIGGER foods_updated_at
  BEFORE UPDATE ON public.foods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Foods are public"
  ON public.foods FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert foods"
  ON public.foods FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update foods"
  ON public.foods FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete foods"
  ON public.foods FOR DELETE
  USING (public.is_admin());

-- Storage bucket for food images (if not already created)
INSERT INTO storage.buckets (id, name, public)
VALUES ('foods', 'foods', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read food images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'foods');

CREATE POLICY "Admins upload food images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'foods' AND public.is_admin());

CREATE POLICY "Admins update food images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'foods' AND public.is_admin());

CREATE POLICY "Admins delete food images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'foods' AND public.is_admin());
