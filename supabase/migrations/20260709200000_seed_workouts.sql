-- Seed catalog workouts into user_workouts (same model as recipes)

DO $$
DECLARE
  seed_author_id UUID;
BEGIN
  IF (SELECT COUNT(*) FROM public.user_workouts) > 0 THEN
    RAISE NOTICE 'Workout seed skipped: workouts already exist.';
    RETURN;
  END IF;

  SELECT id INTO seed_author_id
  FROM auth.users
  WHERE email IN ('superadmin@zdravosloven.bg', 'admin@zdravosloven.bg')
  ORDER BY CASE email WHEN 'superadmin@zdravosloven.bg' THEN 0 ELSE 1 END
  LIMIT 1;

  IF seed_author_id IS NULL THEN
    SELECT id INTO seed_author_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  END IF;

  IF seed_author_id IS NULL THEN
    RAISE NOTICE 'Workout seed skipped: no auth users found.';
    RETURN;
  END IF;

  INSERT INTO public.user_workouts (
    author_id, title, description, difficulty, goal, duration, calories, exercises, image_url, is_public
  ) VALUES
  (seed_author_id, 'Сутрешна енергия', 'Лека кардио тренировка за активно начало на деня.', 'beginner', 'weight-loss', 25, 180,
    '[{"name":"Разгрявка – ходене на място","duration":"3 мин"},{"name":"Jumping Jacks","duration":"2 мин"},{"name":"Клекове","duration":"3 x 12"},{"name":"Планк","duration":"3 x 30 сек"},{"name":"Бърпи (опростени)","duration":"3 x 8"},{"name":"Стречинг","duration":"5 мин"}]'::jsonb,
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop', true),
  (seed_author_id, 'HIIT за изгаряне', 'Интензивна интервална тренировка за максимално изгаряне на калории.', 'intermediate', 'weight-loss', 30, 320,
    '[{"name":"Спринт на място","duration":"45 сек / 15 сек почивка x 5"},{"name":"Планк с ротация","duration":"3 x 10"},{"name":"Планински катерачи","duration":"3 x 20"},{"name":"Скокове с клек","duration":"3 x 12"},{"name":"Върбели","duration":"3 x 30 сек"},{"name":"Охлаждане","duration":"5 мин"}]'::jsonb,
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop', true),
  (seed_author_id, 'Сила за горна част', 'Тренировка за гърди, рамене и трицепс с собствено тегло.', 'intermediate', 'muscle-gain', 40, 280,
    '[{"name":"Лицеви опори","duration":"4 x 12"},{"name":"Diamond Push-ups","duration":"3 x 10"},{"name":"Pike Push-ups","duration":"3 x 10"},{"name":"Tricep Dips (стол)","duration":"3 x 12"},{"name":"Plank to Downward Dog","duration":"3 x 10"},{"name":"Разтягане","duration":"5 мин"}]'::jsonb,
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop', true),
  (seed_author_id, 'Долна част – мускулна маса', 'Интензивна тренировка за крака и седалище.', 'advanced', 'muscle-gain', 45, 350,
    '[{"name":"Български клек","duration":"4 x 10 на крак"},{"name":"Румънска мъртва тяга","duration":"4 x 12"},{"name":"Клекове с скок","duration":"3 x 15"},{"name":"Walking Lunges","duration":"3 x 20"},{"name":"Wall Sit","duration":"3 x 45 сек"},{"name":"Стречинг","duration":"8 мин"}]'::jsonb,
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop', true),
  (seed_author_id, 'Кардио издръжливост', 'Продължителна кардио сесия за подобряване на издръжливостта.', 'intermediate', 'endurance', 35, 300,
    '[{"name":"Бързо ходене / лек джог","duration":"10 мин"},{"name":"Скачане на въже","duration":"5 x 2 мин"},{"name":"High Knees","duration":"4 x 1 мин"},{"name":"Butt Kicks","duration":"4 x 1 мин"},{"name":"Side Shuffles","duration":"3 x 1 мин"},{"name":"Охлаждане","duration":"5 мин"}]'::jsonb,
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop', true),
  (seed_author_id, 'Йога за гъвкавост', 'Спокойна йога сесия за гъвкавост и възстановяване.', 'beginner', 'flexibility', 30, 120,
    '[{"name":"Cat-Cow Stretch","duration":"2 мин"},{"name":"Downward Dog","duration":"3 x 30 сек"},{"name":"Warrior I & II","duration":"3 x 30 сек на страна"},{"name":"Child''s Pose","duration":"2 мин"},{"name":"Pigeon Pose","duration":"2 x 1 мин на страна"},{"name":"Savasana","duration":"5 мин"}]'::jsonb,
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop', true),
  (seed_author_id, 'Табата бласт', '20-минутна табата тренировка с максимална интензивност.', 'advanced', 'weight-loss', 20, 250,
    '[{"name":"Табата: Burpees","duration":"4 мин (20/10)"},{"name":"Табата: Squat Jumps","duration":"4 мин (20/10)"},{"name":"Табата: Mountain Climbers","duration":"4 мин (20/10)"},{"name":"Табата: High Knees","duration":"4 мин (20/10)"},{"name":"Охлаждане","duration":"4 мин"}]'::jsonb,
    'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=600&h=400&fit=crop', true),
  (seed_author_id, 'Core & стабилност', 'Фокус върху коремните мускули и стабилност на тялото.', 'beginner', 'muscle-gain', 20, 150,
    '[{"name":"Dead Bug","duration":"3 x 10"},{"name":"Bicycle Crunches","duration":"3 x 15"},{"name":"Plank","duration":"3 x 40 сек"},{"name":"Side Plank","duration":"2 x 30 сек на страна"},{"name":"Leg Raises","duration":"3 x 12"},{"name":"Разтягане","duration":"3 мин"}]'::jsonb,
    'https://images.unsplash.com/photo-1571019613454-1cb75f6bddd3?w=600&h=400&fit=crop', true),
  (seed_author_id, 'Пилатес за баланс', 'Пилатес програма за по-добър баланс, стойка и контрол върху тялото.', 'intermediate', 'flexibility', 35, 200,
    '[{"name":"The Hundred","duration":"2 мин"},{"name":"Roll Up","duration":"3 x 8"},{"name":"Single Leg Stretch","duration":"3 x 10 на страна"},{"name":"Spine Stretch Forward","duration":"3 x 10"},{"name":"Swimming","duration":"3 x 20 сек"},{"name":"Охлаждане","duration":"5 мин"}]'::jsonb,
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop', true);

  RAISE NOTICE 'Workout seed complete: 9 workouts inserted.';
END $$;

-- Allow admins to list all workouts in the admin panel
CREATE POLICY "Admins can view all workouts"
  ON public.user_workouts FOR SELECT
  USING (public.is_admin());
