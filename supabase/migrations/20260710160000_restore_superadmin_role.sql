-- Restore superadmin role if it was lost during a failed client-side role update

DO $$
DECLARE
  superadmin_id UUID;
BEGIN
  SELECT id INTO superadmin_id
  FROM auth.users
  WHERE email = 'superadmin@zdravosloven.bg'
  LIMIT 1;

  IF superadmin_id IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = superadmin_id AND role = 'admin'
  ) THEN
    DELETE FROM public.user_roles WHERE user_id = superadmin_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (superadmin_id, 'admin');
  END IF;
END $$;
