-- Promote superadmin@zdravosloven.bg and set display name

DO $$
DECLARE
  superadmin_id UUID;
BEGIN
  SELECT id INTO superadmin_id
  FROM auth.users
  WHERE email = 'superadmin@zdravosloven.bg'
  LIMIT 1;

  IF superadmin_id IS NULL THEN
    RAISE NOTICE 'Superadmin user not found. Register superadmin@zdravosloven.bg first.';
    RETURN;
  END IF;

  UPDATE public.profiles
  SET full_name = 'Админ'
  WHERE id = superadmin_id;

  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"full_name":"Админ"}'::jsonb
  WHERE id = superadmin_id;

  DELETE FROM public.user_roles WHERE user_id = superadmin_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (superadmin_id, 'admin');
END $$;
