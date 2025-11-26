-- Add Open Graph metadata columns to short_links table for social media previews
-- This allows storing destination URL's metadata for proper social media link previews

ALTER TABLE short_links
ADD COLUMN IF NOT EXISTS og_title TEXT,
ADD COLUMN IF NOT EXISTS og_description TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT;

-- Add comments to document the purpose of these columns
COMMENT ON COLUMN short_links.og_title IS 'Open Graph title for social media preview (from destination URL)';
COMMENT ON COLUMN short_links.og_description IS 'Open Graph description for social media preview (from destination URL)';
COMMENT ON COLUMN short_links.og_image IS 'Open Graph image URL for social media preview (from destination URL)';
