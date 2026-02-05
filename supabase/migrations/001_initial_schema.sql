-- Enable RLS
alter table if exists public.profiles enable row level security;
alter table if exists public.links enable row level security;
alter table if exists public.page_views enable row level security;

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Meu Perfil',
  bio TEXT DEFAULT 'Minha página de links',
  avatar_url TEXT,
  pix_key TEXT,
  pix_enabled BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'brand',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Links table
CREATE TABLE IF NOT EXISTS public.links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'link' CHECK (type IN ('link', 'whatsapp', 'instagram', 'tiktok', 'youtube', 'email', 'pix')),
  icon TEXT,
  clicks INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page views analytics
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Public can view profiles by slug" 
  ON public.profiles FOR SELECT 
  TO anon 
  USING (true);

-- RLS Policies for links
CREATE POLICY "Users can CRUD own links" 
  ON public.links FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view active links" 
  ON public.links FOR SELECT 
  TO anon 
  USING (active = true);

-- RLS Policies for page_views
CREATE POLICY "Users can view own analytics" 
  ON public.page_views FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can insert page views" 
  ON public.page_views FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Functions
CREATE OR REPLACE FUNCTION increment_link_clicks(link_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE links SET clicks = clicks + 1 WHERE id = link_id;
END;
$$ LANGUAGE plpgsql;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_links_user_id ON public.links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_position ON public.links(position);
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON public.page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at);
