-- Fix incorrect Unsplash image URLs for seeded recipes

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1550461716-dbf266b2a8a7?w=800&h=500&fit=crop'
WHERE title = 'Протеинова овесена каша с банан'
   OR image_url LIKE '%1517673400267%'
   OR image_url LIKE '%1528207776546%';

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1763000215238-38350d3e41ac?w=800&h=500&fit=crop'
WHERE title = 'Салата с киноа и авокадо'
   OR image_url LIKE '%1512621776951%';

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800&h=500&fit=crop'
WHERE title = 'Пилешко филе с броколи'
   OR image_url LIKE '%1604908176997%';

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1745126010010-da1c6f5300a9?w=800&h=500&fit=crop'
WHERE title = 'Гръцка салата'
   OR image_url LIKE '%1540189549336%';

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1678554500191-3885a6fbf8c2?w=800&h=500&fit=crop'
WHERE title = 'Енергийни топки с фъстъци'
   OR image_url LIKE '%1606313564200%';

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1754894992043-d51f1d75ea3b?w=800&h=500&fit=crop'
WHERE title = 'Омлет със спанак и извара'
   AND image_url LIKE '%1525351484163%';
