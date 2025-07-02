-- Create storage buckets for the application
-- This migration adds the necessary storage buckets and policies for image uploads

-- Create the images bucket for all image uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create the popup bucket for popup-specific uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('popup', 'popup', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the images bucket
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'images' AND
  auth.uid() = owner
);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images' AND
  auth.uid() = owner
);

-- Set up security policies for the popup bucket
CREATE POLICY "Popup images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'popup');

CREATE POLICY "Authenticated users can upload popup images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'popup' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own popup images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'popup' AND
  auth.uid() = owner
);

CREATE POLICY "Users can delete their own popup images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'popup' AND
  auth.uid() = owner
);
