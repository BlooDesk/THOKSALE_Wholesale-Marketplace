-- =====================================================================
-- ThokSale - Row Level Security Policies
-- =====================================================================
-- Model:
--   - auth.uid() = current authenticated user
--   - profiles.role determines admin/seller/buyer authorization
--   - Admin sees/edits everything.
--   - Sellers manage their own catalog, orders, RFQ responses.
--   - Buyers manage their own carts, orders, RFQs, notifications.
-- =====================================================================

-- Helper functions -----------------------------------------------------
create or replace function public.current_role()
returns user_role
language sql stable security definer set search_path = public
as $$
    select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin' and is_active = true
    );
$$;

create or replace function public.is_seller()
returns boolean
language sql stable security definer set search_path = public
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'seller' and is_active = true
    );
$$;

create or replace function public.is_buyer()
returns boolean
language sql stable security definer set search_path = public
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'buyer' and is_active = true
    );
$$;

-- Enable RLS -----------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.company_profiles  enable row level security;
alter table public.categories        enable row level security;
alter table public.products          enable row level security;
alter table public.product_images    enable row level security;
alter table public.partner_codes     enable row level security;
alter table public.carts             enable row level security;
alter table public.cart_items        enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.freight_quotes    enable row level security;
alter table public.rfqs              enable row level security;
alter table public.rfq_responses     enable row level security;
alter table public.notifications     enable row level security;

-- =====================================================================
-- profiles
-- =====================================================================
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin" on public.profiles
    for select using (
        id = auth.uid() or public.is_admin() or is_active = true
    );

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
    for insert with check (id = auth.uid());

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin" on public.profiles
    for update using (id = auth.uid() or public.is_admin())
    with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin" on public.profiles
    for delete using (public.is_admin());

-- =====================================================================
-- company_profiles
-- =====================================================================
drop policy if exists "company_select_all" on public.company_profiles;
create policy "company_select_all" on public.company_profiles
    for select using (
        deleted_at is null or profile_id = auth.uid() or public.is_admin()
    );

drop policy if exists "company_insert_owner" on public.company_profiles;
create policy "company_insert_owner" on public.company_profiles
    for insert with check (profile_id = auth.uid());

drop policy if exists "company_update_owner_or_admin" on public.company_profiles;
create policy "company_update_owner_or_admin" on public.company_profiles
    for update using (profile_id = auth.uid() or public.is_admin())
    with check (profile_id = auth.uid() or public.is_admin());

drop policy if exists "company_delete_admin" on public.company_profiles;
create policy "company_delete_admin" on public.company_profiles
    for delete using (public.is_admin());

-- =====================================================================
-- categories (public read, admin write)
-- =====================================================================
drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public" on public.categories
    for select using (deleted_at is null or public.is_admin());

drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all" on public.categories
    for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- products
-- =====================================================================
drop policy if exists "products_select_active_or_owner" on public.products;
create policy "products_select_active_or_owner" on public.products
    for select using (
        (status = 'active' and deleted_at is null)
        or seller_id = auth.uid()
        or public.is_admin()
    );

drop policy if exists "products_insert_seller" on public.products;
create policy "products_insert_seller" on public.products
    for insert with check (seller_id = auth.uid() and public.is_seller());

drop policy if exists "products_update_owner_or_admin" on public.products;
create policy "products_update_owner_or_admin" on public.products
    for update using (seller_id = auth.uid() or public.is_admin())
    with check (seller_id = auth.uid() or public.is_admin());

drop policy if exists "products_delete_owner_or_admin" on public.products;
create policy "products_delete_owner_or_admin" on public.products
    for delete using (seller_id = auth.uid() or public.is_admin());

-- =====================================================================
-- product_images
-- =====================================================================
drop policy if exists "product_images_select_public" on public.product_images;
create policy "product_images_select_public" on public.product_images
    for select using (
        exists (
            select 1 from public.products p
            where p.id = product_images.product_id
              and ((p.status = 'active' and p.deleted_at is null)
                   or p.seller_id = auth.uid()
                   or public.is_admin())
        )
    );

drop policy if exists "product_images_write_owner" on public.product_images;
create policy "product_images_write_owner" on public.product_images
    for all using (
        exists (
            select 1 from public.products p
            where p.id = product_images.product_id
              and (p.seller_id = auth.uid() or public.is_admin())
        )
    ) with check (
        exists (
            select 1 from public.products p
            where p.id = product_images.product_id
              and (p.seller_id = auth.uid() or public.is_admin())
        )
    );

-- =====================================================================
-- partner_codes
--   Sellers manage their codes. Buyers can read codes targeted to them
--   or codes not restricted to a specific buyer.
-- =====================================================================
drop policy if exists "partner_codes_select" on public.partner_codes;
create policy "partner_codes_select" on public.partner_codes
    for select using (
        seller_id = auth.uid()
        or buyer_id = auth.uid()
        or (buyer_id is null and is_active = true and deleted_at is null)
        or public.is_admin()
    );

drop policy if exists "partner_codes_insert_seller" on public.partner_codes;
create policy "partner_codes_insert_seller" on public.partner_codes
    for insert with check (seller_id = auth.uid() and public.is_seller());

drop policy if exists "partner_codes_update_owner" on public.partner_codes;
create policy "partner_codes_update_owner" on public.partner_codes
    for update using (seller_id = auth.uid() or public.is_admin())
    with check (seller_id = auth.uid() or public.is_admin());

drop policy if exists "partner_codes_delete_owner" on public.partner_codes;
create policy "partner_codes_delete_owner" on public.partner_codes
    for delete using (seller_id = auth.uid() or public.is_admin());

-- =====================================================================
-- carts
-- =====================================================================
drop policy if exists "carts_select_owner" on public.carts;
create policy "carts_select_owner" on public.carts
    for select using (buyer_id = auth.uid() or public.is_admin());

drop policy if exists "carts_insert_buyer" on public.carts;
create policy "carts_insert_buyer" on public.carts
    for insert with check (buyer_id = auth.uid());

drop policy if exists "carts_update_owner" on public.carts;
create policy "carts_update_owner" on public.carts
    for update using (buyer_id = auth.uid() or public.is_admin())
    with check (buyer_id = auth.uid() or public.is_admin());

drop policy if exists "carts_delete_owner" on public.carts;
create policy "carts_delete_owner" on public.carts
    for delete using (buyer_id = auth.uid() or public.is_admin());

-- =====================================================================
-- cart_items
-- =====================================================================
drop policy if exists "cart_items_owner_all" on public.cart_items;
create policy "cart_items_owner_all" on public.cart_items
    for all using (
        exists (
            select 1 from public.carts c
            where c.id = cart_items.cart_id
              and (c.buyer_id = auth.uid() or public.is_admin())
        )
    ) with check (
        exists (
            select 1 from public.carts c
            where c.id = cart_items.cart_id
              and (c.buyer_id = auth.uid() or public.is_admin())
        )
    );

-- =====================================================================
-- orders
-- =====================================================================
drop policy if exists "orders_select_party" on public.orders;
create policy "orders_select_party" on public.orders
    for select using (
        buyer_id = auth.uid()
        or seller_id = auth.uid()
        or public.is_admin()
    );

drop policy if exists "orders_insert_buyer" on public.orders;
create policy "orders_insert_buyer" on public.orders
    for insert with check (buyer_id = auth.uid() and public.is_buyer());

drop policy if exists "orders_update_party" on public.orders;
create policy "orders_update_party" on public.orders
    for update using (
        buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin()
    ) with check (
        buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin()
    );

drop policy if exists "orders_delete_admin" on public.orders;
create policy "orders_delete_admin" on public.orders
    for delete using (public.is_admin());

-- =====================================================================
-- order_items
-- =====================================================================
drop policy if exists "order_items_select_party" on public.order_items;
create policy "order_items_select_party" on public.order_items
    for select using (
        exists (
            select 1 from public.orders o
            where o.id = order_items.order_id
              and (o.buyer_id = auth.uid()
                   or o.seller_id = auth.uid()
                   or public.is_admin())
        )
    );

drop policy if exists "order_items_write_party" on public.order_items;
create policy "order_items_write_party" on public.order_items
    for all using (
        exists (
            select 1 from public.orders o
            where o.id = order_items.order_id
              and (o.buyer_id = auth.uid()
                   or o.seller_id = auth.uid()
                   or public.is_admin())
        )
    ) with check (
        exists (
            select 1 from public.orders o
            where o.id = order_items.order_id
              and (o.buyer_id = auth.uid()
                   or o.seller_id = auth.uid()
                   or public.is_admin())
        )
    );

-- =====================================================================
-- freight_quotes
-- =====================================================================
drop policy if exists "freight_select_party" on public.freight_quotes;
create policy "freight_select_party" on public.freight_quotes
    for select using (
        buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin()
    );

drop policy if exists "freight_insert_party" on public.freight_quotes;
create policy "freight_insert_party" on public.freight_quotes
    for insert with check (
        buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin()
    );

drop policy if exists "freight_update_party" on public.freight_quotes;
create policy "freight_update_party" on public.freight_quotes
    for update using (
        buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin()
    ) with check (
        buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin()
    );

drop policy if exists "freight_delete_admin" on public.freight_quotes;
create policy "freight_delete_admin" on public.freight_quotes
    for delete using (public.is_admin());

-- =====================================================================
-- rfqs
--   Public RFQs are visible to any authenticated seller.
--   Private RFQs only visible to invited_sellers and buyer.
-- =====================================================================
drop policy if exists "rfqs_select_visibility" on public.rfqs;
create policy "rfqs_select_visibility" on public.rfqs
    for select using (
        buyer_id = auth.uid()
        or public.is_admin()
        or (
            deleted_at is null
            and (
                (is_public = true and public.is_seller())
                or (auth.uid() = any (invited_sellers))
            )
        )
    );

drop policy if exists "rfqs_insert_buyer" on public.rfqs;
create policy "rfqs_insert_buyer" on public.rfqs
    for insert with check (buyer_id = auth.uid() and public.is_buyer());

drop policy if exists "rfqs_update_owner_or_admin" on public.rfqs;
create policy "rfqs_update_owner_or_admin" on public.rfqs
    for update using (buyer_id = auth.uid() or public.is_admin())
    with check (buyer_id = auth.uid() or public.is_admin());

drop policy if exists "rfqs_delete_owner_or_admin" on public.rfqs;
create policy "rfqs_delete_owner_or_admin" on public.rfqs
    for delete using (buyer_id = auth.uid() or public.is_admin());

-- =====================================================================
-- rfq_responses
-- =====================================================================
drop policy if exists "rfq_responses_select_party" on public.rfq_responses;
create policy "rfq_responses_select_party" on public.rfq_responses
    for select using (
        seller_id = auth.uid()
        or public.is_admin()
        or exists (
            select 1 from public.rfqs r
            where r.id = rfq_responses.rfq_id and r.buyer_id = auth.uid()
        )
    );

drop policy if exists "rfq_responses_insert_seller" on public.rfq_responses;
create policy "rfq_responses_insert_seller" on public.rfq_responses
    for insert with check (seller_id = auth.uid() and public.is_seller());

drop policy if exists "rfq_responses_update_owner" on public.rfq_responses;
create policy "rfq_responses_update_owner" on public.rfq_responses
    for update using (
        seller_id = auth.uid()
        or public.is_admin()
        or exists (
            select 1 from public.rfqs r
            where r.id = rfq_responses.rfq_id and r.buyer_id = auth.uid()
        )
    ) with check (
        seller_id = auth.uid()
        or public.is_admin()
        or exists (
            select 1 from public.rfqs r
            where r.id = rfq_responses.rfq_id and r.buyer_id = auth.uid()
        )
    );

drop policy if exists "rfq_responses_delete_owner" on public.rfq_responses;
create policy "rfq_responses_delete_owner" on public.rfq_responses
    for delete using (seller_id = auth.uid() or public.is_admin());

-- =====================================================================
-- notifications
-- =====================================================================
drop policy if exists "notifications_select_owner" on public.notifications;
create policy "notifications_select_owner" on public.notifications
    for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notifications_insert_system" on public.notifications;
create policy "notifications_insert_system" on public.notifications
    for insert with check (public.is_admin() or user_id = auth.uid());

drop policy if exists "notifications_update_owner" on public.notifications;
create policy "notifications_update_owner" on public.notifications
    for update using (user_id = auth.uid() or public.is_admin())
    with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "notifications_delete_owner" on public.notifications;
create policy "notifications_delete_owner" on public.notifications
    for delete using (user_id = auth.uid() or public.is_admin());
