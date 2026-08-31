-- =====================================================================
-- Storage bucket and policies for product-images (H1)
-- =====================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    8388608, -- 8MB
    ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read (anyone can view product images)
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

-- Authenticated seller can insert into their own folder
DROP POLICY IF EXISTS "product_images_seller_insert" ON storage.objects;
CREATE POLICY "product_images_seller_insert" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'product-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Authenticated seller can update their own files
DROP POLICY IF EXISTS "product_images_seller_update" ON storage.objects;
CREATE POLICY "product_images_seller_update" ON storage.objects
    FOR UPDATE TO authenticated USING (
        bucket_id = 'product-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Authenticated seller can delete their own files
DROP POLICY IF EXISTS "product_images_seller_delete" ON storage.objects;
CREATE POLICY "product_images_seller_delete" ON storage.objects
    FOR DELETE TO authenticated USING (
        bucket_id = 'product-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
