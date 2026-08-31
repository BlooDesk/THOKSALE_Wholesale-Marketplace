-- =====================================================================
-- ThokSale B2B Wholesale Marketplace - Supabase PostgreSQL Schema
-- =====================================================================
-- Version: 1.0 (MVP)
-- Database: PostgreSQL 15+ (Supabase)
-- Auth Source: auth.users (Supabase Auth)
-- =====================================================================

-- ---------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";      -- fuzzy search on products
create extension if not exists "citext";       -- case-insensitive text

-- ---------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------
do $$ begin
    create type user_role as enum ('admin', 'seller', 'buyer');
exception when duplicate_object then null; end $$;

do $$ begin
    create type kyc_status as enum ('pending', 'submitted', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
    create type product_status as enum ('draft', 'active', 'inactive', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
    create type order_status as enum (
        'pending', 'accepted', 'rejected',
        'awaiting_freight_quote', 'freight_quote_sent', 'freight_approved',
        'ready_for_payment', 'processing',
        'shipped', 'delivered', 'cancelled'
    );
exception when duplicate_object then null; end $$;

do $$ begin
    create type payment_status as enum ('pending', 'authorized', 'captured', 'failed', 'refunded', 'partial_refund');
exception when duplicate_object then null; end $$;

do $$ begin
    create type freight_status as enum ('requested', 'quoted', 'accepted', 'expired', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
    create type rfq_status as enum ('open', 'in_review', 'quoted', 'accepted', 'closed', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
    create type rfq_response_status as enum ('submitted', 'accepted', 'rejected', 'withdrawn');
exception when duplicate_object then null; end $$;

do $$ begin
    create type notification_type as enum (
        'order_created', 'order_status_update', 'payment_update',
        'rfq_new', 'rfq_response', 'freight_quote', 'partner_code_shared',
        'kyc_status', 'system'
    );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- HELPER FUNCTION: updated_at trigger
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 1. USER MANAGEMENT
-- ---------------------------------------------------------------------

-- 1a. profiles ---------------------------------------------------------
create table if not exists public.profiles (
    id                uuid primary key references auth.users(id) on delete cascade,
    role              user_role not null default 'buyer',
    full_name         text,
    email             citext unique,
    phone             text,
    avatar_url        text,
    preferred_language text default 'en',
    is_active         boolean not null default true,
    last_login_at     timestamptz,
    created_at        timestamptz not null default timezone('utc', now()),
    updated_at        timestamptz not null default timezone('utc', now()),
    deleted_at        timestamptz
);

create trigger trg_profiles_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();

-- 1b. company_profiles --------------------------------------------------
create table if not exists public.company_profiles (
    id                  uuid primary key default uuid_generate_v4(),
    profile_id          uuid not null unique references public.profiles(id) on delete cascade,
    legal_name          text not null,
    display_name        text,
    tax_id              text,               -- GST / VAT / EIN
    registration_number text,
    business_type       text,               -- LLC, Pvt Ltd, Sole Prop, etc.
    website             text,
    logo_url            text,
    description         text,
    address_line1       text,
    address_line2       text,
    city                text,
    state               text,
    postal_code         text,
    country             text,
    contact_email       citext,
    contact_phone       text,
    kyc_status          kyc_status not null default 'pending',
    kyc_documents       jsonb default '[]'::jsonb, -- [{type, url, uploaded_at}]
    verified_at         timestamptz,
    verified_by         uuid references public.profiles(id) on delete set null,
    rating              numeric(3,2) default 0.00,
    total_sales         numeric(14,2) default 0.00,
    created_at          timestamptz not null default timezone('utc', now()),
    updated_at          timestamptz not null default timezone('utc', now()),
    deleted_at          timestamptz
);

create trigger trg_company_profiles_updated_at
    before update on public.company_profiles
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 2. CATALOG
-- ---------------------------------------------------------------------

-- 2a. categories -------------------------------------------------------
create table if not exists public.categories (
    id           uuid primary key default uuid_generate_v4(),
    parent_id    uuid references public.categories(id) on delete set null,
    name         text not null,
    slug         text not null unique,
    description  text,
    icon_url     text,
    image_url    text,
    sort_order   integer not null default 0,
    is_active    boolean not null default true,
    created_at   timestamptz not null default timezone('utc', now()),
    updated_at   timestamptz not null default timezone('utc', now()),
    deleted_at   timestamptz
);

create trigger trg_categories_updated_at
    before update on public.categories
    for each row execute function public.set_updated_at();

-- 2b. products ---------------------------------------------------------
create table if not exists public.products (
    id                  uuid primary key default uuid_generate_v4(),
    seller_id           uuid not null references public.profiles(id) on delete cascade,
    company_id          uuid references public.company_profiles(id) on delete set null,
    category_id         uuid references public.categories(id) on delete set null,
    sku                 text,
    name                text not null,
    slug                text unique,
    description         text,
    specifications      jsonb default '{}'::jsonb,
    brand               text,
    unit                text default 'piece',   -- piece, kg, box, ton, etc.
    moq                 integer not null default 1,  -- minimum order quantity
    base_price          numeric(14,2) not null check (base_price >= 0),
    currency            char(3) not null default 'INR',
    tax_rate            numeric(5,2) default 0.00,   -- percentage
    tier_pricing        jsonb default '[]'::jsonb,   -- [{min_qty, price}]
    stock_quantity      integer not null default 0,
    weight_kg           numeric(10,3),
    dimensions          jsonb,                        -- {l,w,h,unit}
    origin_country      text,
    hs_code             text,                         -- for cross-border
    status              product_status not null default 'draft',
    is_featured         boolean not null default false,
    view_count          bigint not null default 0,
    search_vector       tsvector,
    created_at          timestamptz not null default timezone('utc', now()),
    updated_at          timestamptz not null default timezone('utc', now()),
    deleted_at          timestamptz
);

create trigger trg_products_updated_at
    before update on public.products
    for each row execute function public.set_updated_at();

-- full-text search vector trigger
create or replace function public.products_search_vector_update()
returns trigger language plpgsql as $$
begin
    new.search_vector :=
        setweight(to_tsvector('simple', coalesce(new.name, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(new.brand, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(new.description, '')), 'C');
    return new;
end $$;

create trigger trg_products_search_vector
    before insert or update of name, brand, description
    on public.products
    for each row execute function public.products_search_vector_update();

-- 2c. product_images ---------------------------------------------------
create table if not exists public.product_images (
    id           uuid primary key default uuid_generate_v4(),
    product_id   uuid not null references public.products(id) on delete cascade,
    url          text not null,
    alt_text     text,
    is_primary   boolean not null default false,
    sort_order   integer not null default 0,
    created_at   timestamptz not null default timezone('utc', now()),
    updated_at   timestamptz not null default timezone('utc', now())
);

create trigger trg_product_images_updated_at
    before update on public.product_images
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. PRICING (Partner Codes)
-- ---------------------------------------------------------------------
create table if not exists public.partner_codes (
    id                  uuid primary key default uuid_generate_v4(),
    code                text not null unique,           -- e.g. "GOLD10"
    seller_id           uuid not null references public.profiles(id) on delete cascade,
    product_id          uuid references public.products(id) on delete cascade,   -- null = seller-wide
    category_id         uuid references public.categories(id) on delete set null,
    buyer_id            uuid references public.profiles(id) on delete cascade,   -- null = any buyer
    discount_type       text not null check (discount_type in ('percentage', 'flat', 'fixed_price')),
    discount_value      numeric(14,2) not null check (discount_value >= 0),
    min_order_amount    numeric(14,2) default 0,
    min_quantity        integer default 1,
    max_uses            integer,          -- null = unlimited
    used_count          integer not null default 0,
    valid_from          timestamptz not null default timezone('utc', now()),
    valid_until         timestamptz,
    is_active           boolean not null default true,
    notes               text,
    created_at          timestamptz not null default timezone('utc', now()),
    updated_at          timestamptz not null default timezone('utc', now()),
    deleted_at          timestamptz
);

create trigger trg_partner_codes_updated_at
    before update on public.partner_codes
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4. COMMERCE (Carts)
-- ---------------------------------------------------------------------

-- 4a. carts ------------------------------------------------------------
create table if not exists public.carts (
    id             uuid primary key default uuid_generate_v4(),
    buyer_id       uuid not null references public.profiles(id) on delete cascade,
    seller_id      uuid references public.profiles(id) on delete cascade, -- single-seller cart pattern
    partner_code_id uuid references public.partner_codes(id) on delete set null,
    currency       char(3) not null default 'INR',
    notes          text,
    is_active      boolean not null default true,
    created_at     timestamptz not null default timezone('utc', now()),
    updated_at     timestamptz not null default timezone('utc', now()),
    deleted_at     timestamptz
);

create trigger trg_carts_updated_at
    before update on public.carts
    for each row execute function public.set_updated_at();

-- 4b. cart_items -------------------------------------------------------
create table if not exists public.cart_items (
    id            uuid primary key default uuid_generate_v4(),
    cart_id       uuid not null references public.carts(id) on delete cascade,
    product_id    uuid not null references public.products(id) on delete cascade,
    quantity      integer not null check (quantity > 0),
    unit_price    numeric(14,2) not null check (unit_price >= 0),
    discount      numeric(14,2) not null default 0,
    tax_amount    numeric(14,2) not null default 0,
    subtotal      numeric(14,2) generated always as
                    ((quantity * unit_price) - discount + tax_amount) stored,
    metadata      jsonb default '{}'::jsonb,
    created_at    timestamptz not null default timezone('utc', now()),
    updated_at    timestamptz not null default timezone('utc', now()),
    unique (cart_id, product_id)
);

create trigger trg_cart_items_updated_at
    before update on public.cart_items
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 5. ORDERS
-- ---------------------------------------------------------------------

-- 5a. orders -----------------------------------------------------------
create table if not exists public.orders (
    id                    uuid primary key default uuid_generate_v4(),
    order_number          text not null unique default ('THK-' || upper(substr(replace(uuid_generate_v4()::text, '-', ''), 1, 10))),
    buyer_id              uuid not null references public.profiles(id) on delete restrict,
    seller_id             uuid not null references public.profiles(id) on delete restrict,
    buyer_company_id      uuid references public.company_profiles(id) on delete set null,
    seller_company_id     uuid references public.company_profiles(id) on delete set null,
    partner_code_id       uuid references public.partner_codes(id) on delete set null,
    freight_quote_id      uuid,   -- FK added after freight_quotes creation
    status                order_status not null default 'pending',
    payment_status        payment_status not null default 'pending',
    currency              char(3) not null default 'INR',
    subtotal              numeric(14,2) not null default 0,
    discount_total        numeric(14,2) not null default 0,
    tax_total             numeric(14,2) not null default 0,
    freight_total         numeric(14,2) not null default 0,
    grand_total           numeric(14,2) not null default 0,
    shipping_address      jsonb not null,
    billing_address       jsonb,
    payment_method        text,
    payment_reference     text,
    tracking_number       text,
    carrier               text,
    estimated_delivery    date,
    delivered_at          timestamptz,
    cancelled_at          timestamptz,
    cancellation_reason   text,
    notes                 text,
    metadata              jsonb default '{}'::jsonb,
    created_at            timestamptz not null default timezone('utc', now()),
    updated_at            timestamptz not null default timezone('utc', now()),
    deleted_at            timestamptz
);

create trigger trg_orders_updated_at
    before update on public.orders
    for each row execute function public.set_updated_at();

-- 5b. order_items ------------------------------------------------------
create table if not exists public.order_items (
    id             uuid primary key default uuid_generate_v4(),
    order_id       uuid not null references public.orders(id) on delete cascade,
    product_id     uuid not null references public.products(id) on delete restrict,
    product_name   text not null,           -- snapshot
    sku            text,                    -- snapshot
    quantity       integer not null check (quantity > 0),
    unit_price     numeric(14,2) not null check (unit_price >= 0),
    discount       numeric(14,2) not null default 0,
    tax_rate       numeric(5,2)  not null default 0,
    tax_amount     numeric(14,2) not null default 0,
    subtotal       numeric(14,2) not null,
    metadata       jsonb default '{}'::jsonb,
    created_at     timestamptz not null default timezone('utc', now()),
    updated_at     timestamptz not null default timezone('utc', now())
);

create trigger trg_order_items_updated_at
    before update on public.order_items
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 6. FREIGHT
-- ---------------------------------------------------------------------
create table if not exists public.freight_quotes (
    id                   uuid primary key default uuid_generate_v4(),
    order_id             uuid references public.orders(id) on delete cascade,
    cart_id              uuid references public.carts(id) on delete set null,
    buyer_id             uuid not null references public.profiles(id) on delete cascade,
    seller_id            uuid references public.profiles(id) on delete set null,
    carrier              text,
    service_type         text,           -- road / air / sea / express
    origin_address       jsonb not null,
    destination_address  jsonb not null,
    weight_kg            numeric(10,3),
    volume_cbm           numeric(10,3),
    package_count        integer,
    quoted_amount        numeric(14,2),
    currency             char(3) not null default 'INR',
    transit_days         integer,
    status               freight_status not null default 'requested',
    quote_reference      text,
    provider_payload     jsonb,          -- raw response from freight provider
    valid_until          timestamptz,
    accepted_at          timestamptz,
    created_at           timestamptz not null default timezone('utc', now()),
    updated_at           timestamptz not null default timezone('utc', now()),
    deleted_at           timestamptz
);

create trigger trg_freight_quotes_updated_at
    before update on public.freight_quotes
    for each row execute function public.set_updated_at();

-- Add deferred FK from orders.freight_quote_id -> freight_quotes.id
alter table public.orders
    drop constraint if exists orders_freight_quote_id_fkey;
alter table public.orders
    add constraint orders_freight_quote_id_fkey
    foreign key (freight_quote_id) references public.freight_quotes(id) on delete set null;

-- ---------------------------------------------------------------------
-- 7. RFQ
-- ---------------------------------------------------------------------

-- 7a. rfqs -------------------------------------------------------------
create table if not exists public.rfqs (
    id                  uuid primary key default uuid_generate_v4(),
    rfq_number          text not null unique default ('RFQ-' || upper(substr(replace(uuid_generate_v4()::text, '-', ''), 1, 10))),
    buyer_id            uuid not null references public.profiles(id) on delete cascade,
    buyer_company_id    uuid references public.company_profiles(id) on delete set null,
    category_id         uuid references public.categories(id) on delete set null,
    product_id          uuid references public.products(id) on delete set null, -- optional
    title               text not null,
    description         text,
    specifications      jsonb default '{}'::jsonb,
    quantity            integer not null check (quantity > 0),
    unit                text default 'piece',
    target_price        numeric(14,2),
    currency            char(3) not null default 'INR',
    delivery_location   jsonb,
    delivery_deadline   date,
    attachments         jsonb default '[]'::jsonb,
    status              rfq_status not null default 'open',
    is_public           boolean not null default true,
    invited_sellers     uuid[] default '{}',  -- targeted RFQ
    expires_at          timestamptz,
    created_at          timestamptz not null default timezone('utc', now()),
    updated_at          timestamptz not null default timezone('utc', now()),
    deleted_at          timestamptz
);

create trigger trg_rfqs_updated_at
    before update on public.rfqs
    for each row execute function public.set_updated_at();

-- 7b. rfq_responses ----------------------------------------------------
create table if not exists public.rfq_responses (
    id               uuid primary key default uuid_generate_v4(),
    rfq_id           uuid not null references public.rfqs(id) on delete cascade,
    seller_id        uuid not null references public.profiles(id) on delete cascade,
    seller_company_id uuid references public.company_profiles(id) on delete set null,
    quoted_price     numeric(14,2) not null check (quoted_price >= 0),
    currency         char(3) not null default 'INR',
    quantity_available integer,
    lead_time_days   integer,
    validity_days    integer,
    payment_terms    text,
    notes            text,
    attachments      jsonb default '[]'::jsonb,
    status           rfq_response_status not null default 'submitted',
    accepted_at      timestamptz,
    created_at       timestamptz not null default timezone('utc', now()),
    updated_at       timestamptz not null default timezone('utc', now()),
    deleted_at       timestamptz,
    unique (rfq_id, seller_id)
);

create trigger trg_rfq_responses_updated_at
    before update on public.rfq_responses
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 8. COMMUNICATION (Notifications)
-- ---------------------------------------------------------------------
create table if not exists public.notifications (
    id            uuid primary key default uuid_generate_v4(),
    user_id       uuid not null references public.profiles(id) on delete cascade,
    type          notification_type not null,
    title         text not null,
    body          text,
    data          jsonb default '{}'::jsonb,   -- {order_id, rfq_id, url, ...}
    is_read       boolean not null default false,
    read_at       timestamptz,
    channel       text default 'in_app',      -- in_app, email, sms, push
    created_at    timestamptz not null default timezone('utc', now()),
    updated_at    timestamptz not null default timezone('utc', now())
);

create trigger trg_notifications_updated_at
    before update on public.notifications
    for each row execute function public.set_updated_at();
