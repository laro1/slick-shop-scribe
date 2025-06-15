
-- Add missing columns to the 'items' table
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now() NOT NULL;

-- Add missing columns to the 'sales' table
ALTER TABLE public.sales
ADD COLUMN IF NOT EXISTS article_name TEXT,
ADD COLUMN IF NOT EXISTS unit_price NUMERIC,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC;

-- Create the storage bucket for article images if it doesn't exist
INSERT into storage.buckets (id, name, public)
values ('article_images', 'article_images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up policies for the bucket to allow public access.
-- We drop existing policies to avoid errors if they are run multiple times.
DROP POLICY IF EXISTS "Allow public read access on article_images" ON storage.objects;
CREATE POLICY "Allow public read access on article_images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'article_images');

DROP POLICY IF EXISTS "Allow authenticated users to upload to article_images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload to article_images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article_images');

DROP POLICY IF EXISTS "Allow authenticated users to update their own images" ON storage.objects;
CREATE POLICY "Allow authenticated users to update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner);

DROP POLICY IF EXISTS "Allow authenticated users to delete their own images" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner);
