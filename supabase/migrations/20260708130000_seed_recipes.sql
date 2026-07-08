-- Seed sample recipes for the community recipes page
-- Requires an existing auth user (default: admin@zdravosloven.bg)

DO $$
DECLARE
  seed_author_id UUID;
  author_email TEXT := 'admin@zdravosloven.bg';
BEGIN
  SELECT id INTO seed_author_id
  FROM auth.users
  WHERE email = author_email
  LIMIT 1;

  IF seed_author_id IS NULL THEN
    RAISE NOTICE 'Seed skipped: no user with email %. Register first, then re-run this script.', author_email;
    RETURN;
  END IF;

  UPDATE public.user_roles
  SET role = 'admin'
  WHERE user_id = seed_author_id AND role <> 'admin';

  IF EXISTS (
    SELECT 1 FROM public.recipes
    WHERE author_id = seed_author_id AND title = 'Протеинова овесена каша с банан'
  ) THEN
    RAISE NOTICE 'Seed skipped: sample recipes already exist.';
    RETURN;
  END IF;

  INSERT INTO public.recipes (
    author_id, title, description, ingredients, steps,
    calories, protein, carbs, fat, category, dietary, image_url
  ) VALUES
  (
    seed_author_id,
    'Протеинова овесена каша с банан',
    'Бърза и питателна закуска с овес, банан и гръцко кисело мляко.',
    '["80 г овесени ядки","250 мл вода или мляко","1 банан","100 г гръцко кисело мляко","1 ч.л. мед","Щипка канела"]'::jsonb,
    '["Сварете овесените ядки с течността 5–7 минути.","Нарежете банана на кръгчета.","Сервирайте кашата с мляко, банан и мед.","Поръсете с канела."]'::jsonb,
    420, 18, 62, 12, 'breakfast', ARRAY['high-protein','gluten-free'],
    'https://images.unsplash.com/photo-1517673400267-025144f4420a?w=800&h=500&fit=crop'
  ),
  (
    seed_author_id,
    'Салата с киноа и авокадо',
    'Свежа веган салата с киноа, авокадо, домати и лимонов дресинг.',
    '["150 г варена киноа","1 авокадо","150 г чери домати","1 краставица","2 с.л. зехтин","Сок от 1/2 лимон","Сол и магданоз"]'::jsonb,
    '["Смесете киноата с нарязаните зеленчуци.","Пригответе дресинг от зехтин, лимон и сол.","Добавете авокадо на кубчета.","Поръсете с магданоз и сервирайте."]'::jsonb,
    380, 12, 34, 22, 'lunch', ARRAY['vegan','gluten-free'],
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop'
  ),
  (
    seed_author_id,
    'Пилешко филе с броколи',
    'Леко и протеиново ястие – идеално за вечеря след тренировка.',
    '["200 г пилешко филе","200 г броколи","1 скилидка чесън","1 с.л. зехтин","Сол, черен пипер","Лимонов сок"]'::jsonb,
    '["Нарежете пилешкото на ивици и овкусете.","Запържете в тиган с зехтин 6–8 минути.","Добавете броколи и чесън, гответе още 5 минути.","Поръсете с лимон и сервирайте."]'::jsonb,
    340, 42, 12, 14, 'dinner', ARRAY['high-protein','gluten-free'],
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&h=500&fit=crop'
  ),
  (
    seed_author_id,
    'Авокадо тост с яйце',
    'Класическа здравословна закуска с пълнозърнест хляб и авокадо.',
    '["2 филии пълнозърнест хляб","1 авокадо","2 яйца","Черен пипер","Чили на люспи (по желание)"]'::jsonb,
    '["Изпечете хляба.","Намачкайте авокадото с вилица и намажете върху тоста.","Пригответе яйцата по желание (варени или на тиган).","Сервирайте с пипер и чили."]'::jsonb,
    410, 16, 36, 24, 'breakfast', ARRAY['high-protein'],
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=500&fit=crop'
  ),
  (
    seed_author_id,
    'Сьомга на фурна с лимон',
    'Богата на омега-3 вечеря с минимални съставки.',
    '["200 г филе сьомга","1 лимон","1 с.л. зехтин","Копър","Сол и пипер","200 г спанак"]'::jsonb,
    '["Овкусете рибата със сол, пипер и зехтин.","Печете на 190°C около 15 минути.","Задушете спанака в тиган 2–3 минути.","Сервирайте с лимон и копър."]'::jsonb,
    360, 34, 6, 22, 'dinner', ARRAY['keto','high-protein','gluten-free'],
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=500&fit=crop'
  ),
  (
    seed_author_id,
    'Гръцка салата',
    'Традиционна средиземноморска салата с домати, краставица и сирене.',
    '["2 домата","1 краставица","100 г сирене","1/2 червен лук","10 маслини","3 с.л. зехтин","Орегано"]'::jsonb,
    '["Нарежете зеленчуците на едри парчета.","Добавете сирене и маслини.","Поръсете с орегано и полейте с зехтин.","Разбъркайте нежно и сервирайте."]'::jsonb,
    290, 11, 14, 22, 'lunch', ARRAY['gluten-free'],
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=500&fit=crop'
  ),
  (
    seed_author_id,
    'Енергийни топки с фъстъци',
    'Здравословна закуска без печене – идеална преди или след тренировка.',
    '["100 г овесени ядки","3 с.л. фъстъчено масло","2 с.л. мед","30 г шоколадови чипсове","1 с.л. чиа"]'::jsonb,
    '["Смесете всички съставки в купа.","Оформете 10–12 топки.","Охладете в хладилник 30 минути.","Съхранявайте в затворен съд до 5 дни."]'::jsonb,
    180, 6, 22, 8, 'snack', ARRAY['vegan'],
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=500&fit=crop'
  ),
  (
    seed_author_id,
    'Омлет със спанак и извара',
    'Високопротеинова закуска за сила и ситост през деня.',
    '["3 яйца","80 г извара","100 г спанак","1 с.л. зехтин","Сол и пипер"]'::jsonb,
    '["Задушете спанака 2 минути.","Разбийте яйцата с извара.","Изсипете в загрят тиган и гответе на среден огън.","Сгънете омлета и сервирайте топъл."]'::jsonb,
    320, 28, 4, 20, 'breakfast', ARRAY['high-protein','gluten-free','keto'],
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=500&fit=crop'
  );

  RAISE NOTICE 'Seed complete: 8 sample recipes inserted for %.', author_email;
END $$;
