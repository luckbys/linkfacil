-- Enhanced Analytics Schema
-- Adds device type, country, city tracking for page views
-- Creates link_clicks table for individual click tracking

-- Add new columns to page_views
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'unknown';
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS country_code TEXT;

-- Create link_clicks table for tracking individual link clicks
CREATE TABLE IF NOT EXISTS public.link_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT DEFAULT 'unknown',
  country TEXT,
  country_code TEXT,
  city TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on link_clicks
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for link_clicks
CREATE POLICY "Users can view own link clicks" 
  ON public.link_clicks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can insert link clicks" 
  ON public.link_clicks FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON public.link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_user_id ON public.link_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_created_at ON public.link_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_device_type ON public.page_views(device_type);
CREATE INDEX IF NOT EXISTS idx_page_views_country ON public.page_views(country);
