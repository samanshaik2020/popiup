-- Migration to add clicks column and improve analytics tracking
-- This ensures backward compatibility with existing code

-- Add clicks column to short_links table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'short_links' AND column_name = 'clicks'
    ) THEN
        ALTER TABLE short_links ADD COLUMN clicks INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create a function to get click count from analytics table
CREATE OR REPLACE FUNCTION get_link_clicks(link_id UUID)
RETURNS INTEGER AS $$
DECLARE
    click_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO click_count
    FROM analytics
    WHERE short_link_id = link_id AND event_type = 'click';
    
    RETURN COALESCE(click_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Create a function to sync clicks from analytics to short_links
CREATE OR REPLACE FUNCTION sync_link_clicks()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the clicks count in short_links table
    UPDATE short_links
    SET clicks = (
        SELECT COUNT(*)
        FROM analytics
        WHERE short_link_id = NEW.short_link_id AND event_type = 'click'
    )
    WHERE id = NEW.short_link_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync clicks when analytics are inserted
DROP TRIGGER IF EXISTS sync_clicks_on_analytics_insert ON analytics;
CREATE TRIGGER sync_clicks_on_analytics_insert
AFTER INSERT ON analytics
FOR EACH ROW
WHEN (NEW.event_type = 'click')
EXECUTE FUNCTION sync_link_clicks();

-- Backfill existing clicks data from analytics to short_links
UPDATE short_links
SET clicks = (
    SELECT COUNT(*)
    FROM analytics
    WHERE analytics.short_link_id = short_links.id 
    AND analytics.event_type = 'click'
);

-- Create a view for easy analytics aggregation
CREATE OR REPLACE VIEW link_analytics_summary AS
SELECT 
    sl.id AS link_id,
    sl.slug,
    sl.title,
    sl.user_id,
    COUNT(DISTINCT a.id) FILTER (WHERE a.event_type = 'click') AS total_clicks,
    COUNT(DISTINCT a.visitor_id) AS unique_visitors,
    COUNT(DISTINCT a.id) FILTER (WHERE a.event_type = 'view') AS total_views,
    MAX(a.created_at) AS last_activity,
    sl.created_at AS link_created_at
FROM short_links sl
LEFT JOIN analytics a ON sl.id = a.short_link_id
GROUP BY sl.id, sl.slug, sl.title, sl.user_id, sl.created_at;

-- Grant access to the view
GRANT SELECT ON link_analytics_summary TO authenticated;
GRANT SELECT ON link_analytics_summary TO anon;

-- Add RLS policy for the view
ALTER VIEW link_analytics_summary SET (security_invoker = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_short_link_event ON analytics(short_link_id, event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON analytics(visitor_id);

-- Add comment for documentation
COMMENT ON COLUMN short_links.clicks IS 'Cached count of clicks from analytics table, auto-synced via trigger';
COMMENT ON FUNCTION get_link_clicks IS 'Returns the total number of clicks for a given short link from analytics table';
COMMENT ON FUNCTION sync_link_clicks IS 'Automatically syncs click count from analytics to short_links table';
COMMENT ON VIEW link_analytics_summary IS 'Aggregated analytics data per short link for easy reporting';
