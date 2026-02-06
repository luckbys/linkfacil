-- Add scheduling fields to links
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMP WITH TIME ZONE DEFAULT null;
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMP WITH TIME ZONE DEFAULT null;

-- Comments for documentation
COMMENT ON COLUMN public.links.scheduled_start IS 'When the link becomes visible (null = always visible)';
COMMENT ON COLUMN public.links.scheduled_end IS 'When the link stops being visible (null = never expires)';

-- Index for efficient date filtering
CREATE INDEX IF NOT EXISTS idx_links_scheduled_start ON public.links(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_links_scheduled_end ON public.links(scheduled_end);
