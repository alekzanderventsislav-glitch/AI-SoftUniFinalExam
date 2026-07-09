-- Fix omelet recipe image (previous URL showed noodles, not an omelet)

UPDATE public.recipes
SET image_url = 'https://images.unsplash.com/photo-1754894992043-d51f1d75ea3b?w=800&h=500&fit=crop'
WHERE title = 'Омлет със спанак и извара'
   OR image_url LIKE '%1612929633738%';
