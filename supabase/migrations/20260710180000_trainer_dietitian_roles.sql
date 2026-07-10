-- Trainer and Dietitian roles with scoped content permissions

ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('user', 'admin', 'trainer', 'dietitian'));

CREATE OR REPLACE FUNCTION public.is_trainer()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'trainer'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_dietitian()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'dietitian'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_workouts()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR public.is_trainer();
$$;

CREATE OR REPLACE FUNCTION public.can_manage_recipes()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR public.is_dietitian();
$$;

CREATE OR REPLACE FUNCTION public.can_manage_foods()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR public.is_dietitian();
$$;

-- Recipes: dietitians can update/delete any recipe
DROP POLICY IF EXISTS "Authors can update own recipes" ON public.recipes;
CREATE POLICY "Authors can update own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = author_id OR public.can_manage_recipes())
  WITH CHECK (auth.uid() = author_id OR public.can_manage_recipes());

DROP POLICY IF EXISTS "Authors and admins can delete recipes" ON public.recipes;
CREATE POLICY "Authors and admins can delete recipes"
  ON public.recipes FOR DELETE
  USING (auth.uid() = author_id OR public.can_manage_recipes());

-- Workouts: trainers can update/delete any workout
DROP POLICY IF EXISTS "Authors can update own workouts" ON public.user_workouts;
CREATE POLICY "Authors can update own workouts"
  ON public.user_workouts FOR UPDATE
  USING (auth.uid() = author_id OR public.can_manage_workouts())
  WITH CHECK (auth.uid() = author_id OR public.can_manage_workouts());

DROP POLICY IF EXISTS "Authors and admins can delete workouts" ON public.user_workouts;
CREATE POLICY "Authors and admins can delete workouts"
  ON public.user_workouts FOR DELETE
  USING (auth.uid() = author_id OR public.can_manage_workouts());

DROP POLICY IF EXISTS "Admins can view all workouts" ON public.user_workouts;
CREATE POLICY "Staff can view all workouts"
  ON public.user_workouts FOR SELECT
  USING (public.can_manage_workouts());

-- Foods: dietitians manage catalog
DROP POLICY IF EXISTS "Admins can insert foods" ON public.foods;
CREATE POLICY "Staff can insert foods"
  ON public.foods FOR INSERT
  WITH CHECK (public.can_manage_foods());

DROP POLICY IF EXISTS "Admins can update foods" ON public.foods;
CREATE POLICY "Staff can update foods"
  ON public.foods FOR UPDATE
  USING (public.can_manage_foods())
  WITH CHECK (public.can_manage_foods());

DROP POLICY IF EXISTS "Admins can delete foods" ON public.foods;
CREATE POLICY "Staff can delete foods"
  ON public.foods FOR DELETE
  USING (public.can_manage_foods());

DROP POLICY IF EXISTS "Admins upload food images" ON storage.objects;
CREATE POLICY "Staff upload food images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'foods' AND public.can_manage_foods());

DROP POLICY IF EXISTS "Admins update food images" ON storage.objects;
CREATE POLICY "Staff update food images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'foods' AND public.can_manage_foods());

DROP POLICY IF EXISTS "Admins delete food images" ON storage.objects;
CREATE POLICY "Staff delete food images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'foods' AND public.can_manage_foods());

-- Role assignment
CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_user_id UUID, p_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF p_role NOT IN ('user', 'admin', 'trainer', 'dietitian') THEN
    RAISE EXCEPTION 'invalid role: %', p_role;
  END IF;

  DELETE FROM public.user_roles WHERE user_id = p_user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (p_user_id, p_role);
END;
$$;
