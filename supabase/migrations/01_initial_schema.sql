-- Note: Supabase already handles user authentication with the built-in 'auth.users' table
-- This schema focuses on the additional tables needed for the Popiup application

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for popup configurations
CREATE TABLE IF NOT EXISTS popups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'modal', 'banner', 'notification'
    position VARCHAR(50), -- e.g., 'top', 'bottom', 'center'
    trigger_type VARCHAR(50) NOT NULL, -- e.g., 'time_delay', 'scroll_percentage', 'exit_intent'
    trigger_value JSONB, -- Stores trigger-specific values (seconds delay, scroll %, etc.)
    styles JSONB, -- Custom CSS styles
    active BOOLEAN DEFAULT true,
    frequency_cap INT DEFAULT NULL, -- How many times to show to same user
    targeting_rules JSONB DEFAULT NULL, -- Rules for targeting specific users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for short links
CREATE TABLE IF NOT EXISTS short_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    popup_id UUID REFERENCES popups(id) ON DELETE CASCADE,
    slug VARCHAR(50) UNIQUE NOT NULL, -- Short, unique identifier for the URL
    destination_url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_short_links_slug ON short_links(slug);

-- Table for click analytics
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    short_link_id UUID NOT NULL REFERENCES short_links(id) ON DELETE CASCADE,
    popup_id UUID REFERENCES popups(id) ON DELETE SET NULL,
    visitor_id VARCHAR(255), -- Anonymous identifier for unique visitors
    referrer TEXT,
    browser VARCHAR(100),
    device VARCHAR(100),
    os VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    ip_address VARCHAR(50),
    event_type VARCHAR(50) NOT NULL, -- 'view', 'click', 'conversion', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_short_link_id ON analytics(short_link_id);
CREATE INDEX IF NOT EXISTS idx_analytics_popup_id ON analytics(popup_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);

-- Add RLS policies
ALTER TABLE popups ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Policies for popups table
DROP POLICY IF EXISTS "Users can view their own popups" ON popups;
CREATE POLICY "Users can view their own popups" 
    ON popups FOR SELECT
    USING (auth.uid() = user_id);
    
DROP POLICY IF EXISTS "Users can insert their own popups" ON popups;
CREATE POLICY "Users can insert their own popups" 
    ON popups FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
DROP POLICY IF EXISTS "Users can update their own popups" ON popups;
CREATE POLICY "Users can update their own popups" 
    ON popups FOR UPDATE
    USING (auth.uid() = user_id);
    
DROP POLICY IF EXISTS "Users can delete their own popups" ON popups;
CREATE POLICY "Users can delete their own popups" 
    ON popups FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for short_links table
DROP POLICY IF EXISTS "Users can view their own short links" ON short_links;
CREATE POLICY "Users can view their own short links" 
    ON short_links FOR SELECT
    USING (auth.uid() = user_id);
    
DROP POLICY IF EXISTS "Users can insert their own short links" ON short_links;
CREATE POLICY "Users can insert their own short links" 
    ON short_links FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
DROP POLICY IF EXISTS "Users can update their own short links" ON short_links;
CREATE POLICY "Users can update their own short links" 
    ON short_links FOR UPDATE
    USING (auth.uid() = user_id);
    
DROP POLICY IF EXISTS "Users can delete their own short links" ON short_links;
CREATE POLICY "Users can delete their own short links" 
    ON short_links FOR DELETE
    USING (auth.uid() = user_id);

-- Public can view short_links when looking up by slug (needed for redirects)
DROP POLICY IF EXISTS "Anyone can view short links by slug" ON short_links;
CREATE POLICY "Anyone can view short links by slug" 
    ON short_links FOR SELECT
    USING (true);

-- Analytics policies
DROP POLICY IF EXISTS "Users can view their own analytics" ON analytics;
CREATE POLICY "Users can view their own analytics" 
    ON analytics FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM short_links 
        WHERE short_links.id = analytics.short_link_id 
        AND short_links.user_id = auth.uid()
    ));
    
DROP POLICY IF EXISTS "Public can insert analytics" ON analytics;
CREATE POLICY "Public can insert analytics" 
    ON analytics FOR INSERT
    WITH CHECK (true);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_popups_timestamp ON popups;
CREATE TRIGGER update_popups_timestamp
BEFORE UPDATE ON popups
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_short_links_timestamp ON short_links;
CREATE TRIGGER update_short_links_timestamp
BEFORE UPDATE ON short_links
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Storage bucket configurations for image uploads

-- Create the images bucket for all image uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create the popup bucket for popup-specific uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('popup', 'popup', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the images bucket
DROP POLICY IF EXISTS "Images are publicly accessible" ON storage.objects;
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images' AND
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'images' AND
  auth.uid() = owner
);

DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images' AND
  auth.uid() = owner
);

-- Set up security policies for the popup bucket
DROP POLICY IF EXISTS "Popup images are publicly accessible" ON storage.objects;
CREATE POLICY "Popup images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'popup');

DROP POLICY IF EXISTS "Authenticated users can upload popup images" ON storage.objects;
CREATE POLICY "Authenticated users can upload popup images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'popup' AND
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users can update their own popup images" ON storage.objects;
CREATE POLICY "Users can update their own popup images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'popup' AND
  auth.uid() = owner
);

DROP POLICY IF EXISTS "Users can delete their own popup images" ON storage.objects;
CREATE POLICY "Users can delete their own popup images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'popup' AND
  auth.uid() = owner
);
