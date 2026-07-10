-- Community module: chat, news posts, questions, comments, likes

CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL CHECK (post_type IN ('news', 'question')),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  question_category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_community_posts_type ON public.community_posts(post_type);
CREATE INDEX idx_community_posts_created ON public.community_posts(created_at DESC);

CREATE TABLE public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_community_comments_post ON public.community_comments(post_id);

CREATE TABLE public.community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX idx_community_likes_post ON public.community_post_likes(post_id);

CREATE TABLE public.community_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_community_chat_created ON public.community_chat_messages(created_at);

CREATE TRIGGER community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community posts are public"
  ON public.community_posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users create community posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and admins update community posts"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Authors and admins delete community posts"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Community comments are public"
  ON public.community_comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users create comments"
  ON public.community_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and admins delete comments"
  ON public.community_comments FOR DELETE
  USING (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Community likes are public"
  ON public.community_post_likes FOR SELECT USING (true);

CREATE POLICY "Users manage own likes"
  ON public.community_post_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Chat messages are public"
  ON public.community_chat_messages FOR SELECT USING (true);

CREATE POLICY "Authenticated users send chat messages"
  ON public.community_chat_messages FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and admins delete chat messages"
  ON public.community_chat_messages FOR DELETE
  USING (auth.uid() = author_id OR public.is_admin());

-- Storage for community images
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-images', 'community-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read community images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-images');

CREATE POLICY "Authenticated users upload community images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'community-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users delete own community images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'community-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_chat_messages;

-- Seed sample content (uses first available user as author)
DO $$
DECLARE
  seed_author UUID;
BEGIN
  SELECT id INTO seed_author FROM auth.users ORDER BY created_at LIMIT 1;
  IF seed_author IS NULL THEN RETURN; END IF;

  INSERT INTO public.community_posts (author_id, post_type, title, content, image_url, question_category)
  VALUES
    (
      seed_author,
      'news',
      'Нови насоки за средиземноморска диета през 2026',
      'Световната здравна организация подчертава ползите от средиземноморския хранителен модел – зеленчуци, риба, зехтин и умерени порции. Споделете какви промени сте направили в менюто си!',
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&h=500&fit=crop',
      'general'
    ),
    (
      seed_author,
      'news',
      '5-минутна сутрешна разтяжка за енергия',
      'Кратка мобилност рутина сутрин може да подобри настроението и концентрацията. Опитайте 5 минути леки движения преди работа.',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&h=500&fit=crop',
      'general'
    ),
    (
      seed_author,
      'question',
      'Как да си набавя достатъчно протеин на вегетарианска диета?',
      'Тренирам 4 пъти седмично и се чудя какви комбинации от храни да използвам, за да покрия ~120г протеин на ден без месо.',
      NULL,
      'nutrition'
    ),
    (
      seed_author,
      'question',
      'Колко вода наистина трябва да пия при интензивни тренировки?',
      'През лятото потя много повече. Има ли смислена формула или просто да слушам жаждата си?',
      NULL,
      'fitness'
    ),
    (
      seed_author,
      'question',
      'Споделете здравословна закуска под 300 kcal',
      'Търся идеи за бърза закуска преди офис, която да е ситна, но лека. Какво приготвяте вие?',
      NULL,
      'recipes'
    );

  INSERT INTO public.community_chat_messages (author_id, content)
  VALUES
    (seed_author, 'Здравейте на всички! Добре дошли в общността на Здравословен Живот 🌿'),
    (seed_author, 'Споделяйте новини, задавайте въпроси и си помагайте взаимно.');
END $$;
