-- Add embed fields to links for social media embedding
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS is_embed BOOLEAN DEFAULT false;
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS embed_html TEXT;

-- Comments for documentation
COMMENT ON COLUMN public.links.is_embed IS 'Whether this link should be rendered as an embed instead of a link';
COMMENT ON COLUMN public.links.embed_html IS 'Custom embed HTML (for Instagram) or generated from URL';
