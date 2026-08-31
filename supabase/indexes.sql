-- =====================================================================
-- ThokSale - Indexes for Performance
-- =====================================================================

-- profiles
create index if not exists idx_profiles_role         on public.profiles (role) where deleted_at is null;
create index if not exists idx_profiles_email        on public.profiles (email);
create index if not exists idx_profiles_active       on public.profiles (is_active) where deleted_at is null;

-- company_profiles
create index if not exists idx_company_profile_id    on public.company_profiles (profile_id);
create index if not exists idx_company_kyc           on public.company_profiles (kyc_status) where deleted_at is null;
create index if not exists idx_company_country       on public.company_profiles (country);
create index if not exists idx_company_legal_name_trgm on public.company_profiles using gin (legal_name gin_trgm_ops);

-- categories
create index if not exists idx_categories_parent     on public.categories (parent_id);
create index if not exists idx_categories_slug       on public.categories (slug);
create index if not exists idx_categories_active     on public.categories (is_active) where deleted_at is null;

-- products
create index if not exists idx_products_seller       on public.products (seller_id) where deleted_at is null;
create index if not exists idx_products_category     on public.products (category_id) where deleted_at is null;
create index if not exists idx_products_status       on public.products (status) where deleted_at is null;
create index if not exists idx_products_featured     on public.products (is_featured) where status = 'active' and deleted_at is null;
create index if not exists idx_products_slug         on public.products (slug);
create index if not exists idx_products_sku          on public.products (sku);
create index if not exists idx_products_price        on public.products (base_price);
create index if not exists idx_products_search       on public.products using gin (search_vector);
create index if not exists idx_products_name_trgm    on public.products using gin (name gin_trgm_ops);

-- product_images
create index if not exists idx_product_images_pid    on public.product_images (product_id);
create index if not exists idx_product_images_primary on public.product_images (product_id, is_primary);

-- partner_codes
create index if not exists idx_partner_codes_code    on public.partner_codes (code);
create index if not exists idx_partner_codes_seller  on public.partner_codes (seller_id);
create index if not exists idx_partner_codes_buyer   on public.partner_codes (buyer_id);
create index if not exists idx_partner_codes_product on public.partner_codes (product_id);
create index if not exists idx_partner_codes_valid   on public.partner_codes (valid_from, valid_until) where is_active = true and deleted_at is null;

-- carts
create index if not exists idx_carts_buyer           on public.carts (buyer_id) where deleted_at is null;
create index if not exists idx_carts_seller          on public.carts (seller_id) where deleted_at is null;
create index if not exists idx_carts_active          on public.carts (buyer_id, is_active) where deleted_at is null;

-- cart_items
create index if not exists idx_cart_items_cart       on public.cart_items (cart_id);
create index if not exists idx_cart_items_product    on public.cart_items (product_id);

-- orders
create index if not exists idx_orders_buyer          on public.orders (buyer_id) where deleted_at is null;
create index if not exists idx_orders_seller         on public.orders (seller_id) where deleted_at is null;
create index if not exists idx_orders_status         on public.orders (status);
create index if not exists idx_orders_payment_status on public.orders (payment_status);
create index if not exists idx_orders_created        on public.orders (created_at desc);
create index if not exists idx_orders_number         on public.orders (order_number);
create index if not exists idx_orders_buyer_status   on public.orders (buyer_id, status) where deleted_at is null;
create index if not exists idx_orders_seller_status  on public.orders (seller_id, status) where deleted_at is null;

-- order_items
create index if not exists idx_order_items_order    on public.order_items (order_id);
create index if not exists idx_order_items_product  on public.order_items (product_id);

-- freight_quotes
create index if not exists idx_freight_order        on public.freight_quotes (order_id);
create index if not exists idx_freight_buyer        on public.freight_quotes (buyer_id);
create index if not exists idx_freight_seller       on public.freight_quotes (seller_id);
create index if not exists idx_freight_status       on public.freight_quotes (status);

-- rfqs
create index if not exists idx_rfqs_buyer           on public.rfqs (buyer_id) where deleted_at is null;
create index if not exists idx_rfqs_category        on public.rfqs (category_id);
create index if not exists idx_rfqs_status          on public.rfqs (status) where deleted_at is null;
create index if not exists idx_rfqs_public          on public.rfqs (is_public, status) where deleted_at is null;
create index if not exists idx_rfqs_expires         on public.rfqs (expires_at);
create index if not exists idx_rfqs_invited_sellers on public.rfqs using gin (invited_sellers);

-- rfq_responses
create index if not exists idx_rfq_responses_rfq    on public.rfq_responses (rfq_id);
create index if not exists idx_rfq_responses_seller on public.rfq_responses (seller_id);
create index if not exists idx_rfq_responses_status on public.rfq_responses (status);

-- notifications
create index if not exists idx_notifications_user       on public.notifications (user_id, created_at desc);
create index if not exists idx_notifications_unread     on public.notifications (user_id) where is_read = false;
create index if not exists idx_notifications_type       on public.notifications (type);
