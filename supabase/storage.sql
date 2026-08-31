-- =====================================================================
-- ThokSale - Supabase Storage bucket for company logos
-- =====================================================================
-- Public read; only authenticated sellers can write their own folder.
-- Bucket is also auto-created by the /api/seller/upload-logo route as a
-- safety net (using the service role key). Applying this SQL is optional
-- but recommended for tighter storage policies.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'company-logos',
    'company-logos',
    true,
    5242880, -- 5MB
    array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Public read (anyone can view logos)
drop policy if exists "company_logos_public_read" on storage.objects;
create policy "company_logos_public_read" on storage.objects
    for select using (bucket_id = 'company-logos');

-- Authenticated seller can insert into their own folder (path starts with their auth.uid())
drop policy if exists "company_logos_seller_insert" on storage.objects;
create policy "company_logos_seller_insert" on storage.objects
    for insert to authenticated with check (
        bucket_id = 'company-logos'
        and (storage.foldername(name))[1] = auth.uid()::text
    );

drop policy if exists "company_logos_seller_update" on storage.objects;
create policy "company_logos_seller_update" on storage.objects
    for update to authenticated using (
        bucket_id = 'company-logos'
        and (storage.foldername(name))[1] = auth.uid()::text
    );

drop policy if exists "company_logos_seller_delete" on storage.objects;
create policy "company_logos_seller_delete" on storage.objects
    for delete to authenticated using (
        bucket_id = 'company-logos'
        and (storage.foldername(name))[1] = auth.uid()::text
    );
