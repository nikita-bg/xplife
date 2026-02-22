-- ============================================================
-- XPLife 2.0 — Quest Proofs Storage Bucket
-- Run this in Supabase SQL Editor
-- ============================================================

-- Create the quest-proofs bucket (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'quest-proofs',
  'quest-proofs',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload quest proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'quest-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can view quest proofs (public bucket)
CREATE POLICY "Quest proofs are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'quest-proofs');

-- Policy: Users can delete their own proofs
CREATE POLICY "Users can delete own quest proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'quest-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
