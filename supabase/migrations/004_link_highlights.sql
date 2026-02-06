-- Add highlight field to links for featured animations
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS highlight TEXT DEFAULT null;

-- Possible values: null, 'pulse', 'shine', 'shake', 'glow', 'featured'
COMMENT ON COLUMN public.links.highlight IS 'Animation effect for link: pulse, shine, shake, glow, featured';
