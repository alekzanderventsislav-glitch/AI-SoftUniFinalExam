-- Fix broken Unsplash image URLs in existing recipes

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&h=500&fit=crop'
WHERE title = 'Протеинова овесена каша с банан'
   OR image_url LIKE '%1517673400267%';

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1754894992043-d51f1d75ea3b?w=800&h=500&fit=crop'
WHERE title = 'Омлет със спанак и извара'
   AND image_url LIKE '%1525351484163%';
