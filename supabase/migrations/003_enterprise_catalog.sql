-- ============================================================================
-- ThokSale — Enterprise Catalog Migration (003)
-- ============================================================================
-- Purpose : Introduce Industries → Categories → Subcategories → Attributes →
--           Brands, plus first-class Units / Business Types / Warehouses.
-- Policy  : 100% additive. No column drops. No table drops. No renames.
--           Every FK column added to existing tables is NULLABLE, so old
--           rows and old code continue to work unchanged.
-- ============================================================================

-- ---------- 1. INDUSTRIES ---------------------------------------------------
create table if not exists industries (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  slug          text not null unique,
  description   text,
  icon_name     text,
  icon_url      text,
  image_url     text,
  sort_order    integer default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index if not exists idx_industries_slug        on industries(slug) where deleted_at is null;
create index if not exists idx_industries_active_sort on industries(is_active, sort_order) where deleted_at is null;

-- ---------- 2. CATEGORIES: link to industry --------------------------------
alter table categories add column if not exists industry_id uuid references industries(id) on delete set null;
alter table categories add column if not exists deleted_at timestamptz;
create index if not exists idx_categories_industry on categories(industry_id);

-- ---------- 3. BRANDS -------------------------------------------------------
create table if not exists brands (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null,
  brand_type    text not null default 'global'
                check (brand_type in ('global','seller','oem','private_label')),
  seller_id     uuid references profiles(id) on delete cascade,
  logo_url      text,
  description   text,
  country       text,
  website       text,
  is_active     boolean not null default true,
  is_verified   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create unique index if not exists uq_brands_slug_global on brands(slug) where seller_id is null and deleted_at is null;
create unique index if not exists uq_brands_slug_seller on brands(seller_id, slug) where seller_id is not null and deleted_at is null;
create index if not exists idx_brands_active on brands(is_active) where deleted_at is null;
create index if not exists idx_brands_type   on brands(brand_type) where deleted_at is null;

-- ---------- 4. ATTRIBUTE TEMPLATES -----------------------------------------
create table if not exists attribute_definitions (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references categories(id) on delete cascade,
  key           text not null,
  label         text not null,
  attr_type     text not null
                check (attr_type in ('text','number','boolean','select','multi_select','date','color','dimension','weight','measurement','unit')),
  options       jsonb,
  unit          text,
  placeholder   text,
  helper_text   text,
  is_required   boolean not null default false,
  is_filterable boolean not null default false,
  is_variant    boolean not null default false,
  sort_order    integer default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  unique(category_id, key)
);
create index if not exists idx_attr_def_category   on attribute_definitions(category_id) where deleted_at is null;
create index if not exists idx_attr_def_filterable on attribute_definitions(category_id, is_filterable) where deleted_at is null and is_filterable = true;

create table if not exists product_attributes (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references products(id) on delete cascade,
  attribute_id   uuid not null references attribute_definitions(id) on delete cascade,
  value_text     text,
  value_number   numeric,
  value_boolean  boolean,
  value_json     jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique(product_id, attribute_id)
);
create index if not exists idx_prod_attr_product on product_attributes(product_id);
create index if not exists idx_prod_attr_attr    on product_attributes(attribute_id);
create index if not exists idx_prod_attr_text_search on product_attributes using gin (value_text gin_trgm_ops);

-- ---------- 5. UNITS (measurement + packaging) ------------------------------
create table if not exists units (
  id             uuid primary key default gen_random_uuid(),
  code           text not null,
  name           text not null,
  symbol         text,
  unit_type      text not null check (unit_type in ('measurement','packaging')),
  base_multiplier numeric,
  base_unit_code text,
  sort_order     integer default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz,
  unique(unit_type, code)
);
create index if not exists idx_units_active_type_sort on units(unit_type, is_active, sort_order) where deleted_at is null;

-- ---------- 6. BUSINESS TYPES ----------------------------------------------
create table if not exists business_types (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  name         text not null,
  description  text,
  sort_order   integer default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
create index if not exists idx_biz_types_active_sort on business_types(is_active, sort_order) where deleted_at is null;

-- ---------- 7. COMPANY PROFILE EXTENSIONS ----------------------------------
alter table company_profiles add column if not exists business_type_id     uuid references business_types(id) on delete set null;
alter table company_profiles add column if not exists pan                  text;
alter table company_profiles add column if not exists msme_number          text;
alter table company_profiles add column if not exists udyam_number         text;
alter table company_profiles add column if not exists factory_address      jsonb;
alter table company_profiles add column if not exists bank_account_holder  text;
alter table company_profiles add column if not exists bank_account_number  text;
alter table company_profiles add column if not exists bank_ifsc            text;
alter table company_profiles add column if not exists bank_name            text;
alter table company_profiles add column if not exists bank_branch          text;
alter table company_profiles add column if not exists verified_by          uuid references profiles(id);
alter table company_profiles add column if not exists verification_notes   text;

-- ---------- 8. SELLER WAREHOUSES -------------------------------------------
create table if not exists seller_warehouses (
  id             uuid primary key default gen_random_uuid(),
  seller_id      uuid not null references profiles(id) on delete cascade,
  name           text not null,
  address_line1  text,
  address_line2  text,
  city           text,
  state          text,
  postal_code    text,
  country        text default 'India',
  contact_person text,
  contact_phone  text,
  contact_email  text,
  gstin          text,
  is_primary     boolean not null default false,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);
create index if not exists idx_wh_seller on seller_warehouses(seller_id) where deleted_at is null;
create unique index if not exists uq_wh_primary_seller on seller_warehouses(seller_id) where is_primary = true and deleted_at is null;

-- ---------- 9. SELLER BUSINESS PHOTOS --------------------------------------
create table if not exists seller_business_photos (
  id             uuid primary key default gen_random_uuid(),
  seller_id      uuid not null references profiles(id) on delete cascade,
  url            text not null,
  caption        text,
  photo_type     text default 'other'
                 check (photo_type in ('factory','warehouse','office','product','team','certificate','other')),
  sort_order     integer default 0,
  created_at     timestamptz not null default now()
);
create index if not exists idx_biz_photos_seller on seller_business_photos(seller_id);

-- ---------- 10. PRODUCT EXTENSIONS -----------------------------------------
alter table products add column if not exists industry_id         uuid references industries(id) on delete set null;
alter table products add column if not exists subcategory_id      uuid references categories(id) on delete set null;
alter table products add column if not exists brand_id            uuid references brands(id)     on delete set null;
alter table products add column if not exists packaging_unit_id   uuid references units(id)      on delete set null;
alter table products add column if not exists measurement_unit_id uuid references units(id)      on delete set null;
alter table products add column if not exists deleted_at          timestamptz;
create index if not exists idx_products_industry     on products(industry_id);
create index if not exists idx_products_subcategory  on products(subcategory_id);
create index if not exists idx_products_brand        on products(brand_id);

-- ---------- 11. updated_at triggers ----------------------------------------
do $$
declare tbl text;
begin
  for tbl in select unnest(array['industries','brands','attribute_definitions','product_attributes','units','business_types','seller_warehouses'])
  loop
    execute format($f$
      drop trigger if exists trg_%1$s_updated_at on %1$s;
      create trigger trg_%1$s_updated_at
        before update on %1$s
        for each row execute function set_updated_at();
    $f$, tbl);
  end loop;
end $$;

-- ---------- 12. RLS ---------------------------------------------------------
alter table industries              enable row level security;
alter table brands                  enable row level security;
alter table attribute_definitions   enable row level security;
alter table product_attributes      enable row level security;
alter table units                   enable row level security;
alter table business_types          enable row level security;
alter table seller_warehouses       enable row level security;
alter table seller_business_photos  enable row level security;

-- helper: is_admin
do $$
begin
  if not exists (select 1 from pg_proc where proname = 'is_admin') then
    create function is_admin(uid uuid) returns boolean language sql stable as $f$
      select exists (select 1 from profiles p where p.id = uid and p.role = 'admin' and coalesce(p.is_active,true))
    $f$;
  end if;
end $$;

-- Global read for reference data
drop policy if exists industries_read      on industries;
create policy industries_read      on industries      for select using (deleted_at is null and (is_active or is_admin(auth.uid())));
drop policy if exists industries_admin     on industries;
create policy industries_admin     on industries      for all    using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

drop policy if exists brands_read          on brands;
create policy brands_read          on brands          for select using (deleted_at is null and (is_active or is_admin(auth.uid()) or seller_id = auth.uid()));
drop policy if exists brands_admin         on brands;
create policy brands_admin         on brands          for all    using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
drop policy if exists brands_seller_own    on brands;
create policy brands_seller_own    on brands          for all    using (seller_id = auth.uid()) with check (seller_id = auth.uid());

drop policy if exists attrs_def_read       on attribute_definitions;
create policy attrs_def_read       on attribute_definitions for select using (deleted_at is null);
drop policy if exists attrs_def_admin      on attribute_definitions;
create policy attrs_def_admin      on attribute_definitions for all    using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

drop policy if exists prod_attr_read       on product_attributes;
create policy prod_attr_read       on product_attributes for select using (true);
drop policy if exists prod_attr_owner      on product_attributes;
create policy prod_attr_owner      on product_attributes for all    using (
  exists (select 1 from products p where p.id = product_attributes.product_id and (p.seller_id = auth.uid() or is_admin(auth.uid())))
) with check (
  exists (select 1 from products p where p.id = product_attributes.product_id and (p.seller_id = auth.uid() or is_admin(auth.uid())))
);

drop policy if exists units_read           on units;
create policy units_read           on units           for select using (deleted_at is null and (is_active or is_admin(auth.uid())));
drop policy if exists units_admin          on units;
create policy units_admin          on units           for all    using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

drop policy if exists biz_types_read       on business_types;
create policy biz_types_read       on business_types  for select using (deleted_at is null and (is_active or is_admin(auth.uid())));
drop policy if exists biz_types_admin      on business_types;
create policy biz_types_admin      on business_types  for all    using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

drop policy if exists wh_read              on seller_warehouses;
create policy wh_read              on seller_warehouses for select using (deleted_at is null);
drop policy if exists wh_owner             on seller_warehouses;
create policy wh_owner             on seller_warehouses for all    using (seller_id = auth.uid() or is_admin(auth.uid())) with check (seller_id = auth.uid() or is_admin(auth.uid()));

drop policy if exists biz_photos_read      on seller_business_photos;
create policy biz_photos_read      on seller_business_photos for select using (true);
drop policy if exists biz_photos_owner     on seller_business_photos;
create policy biz_photos_owner     on seller_business_photos for all    using (seller_id = auth.uid() or is_admin(auth.uid())) with check (seller_id = auth.uid() or is_admin(auth.uid()));

-- ============================================================================
-- 13. SEED DATA
-- ============================================================================

-- Industries (12)
insert into industries (name, slug, sort_order, icon_name, description) values
  ('Fashion, Textile & Lifestyle',          'fashion-textile-lifestyle',    10, 'Shirt',    'Apparel, fabrics, footwear, accessories & lifestyle goods'),
  ('FMCG, Food & Grocery',                  'fmcg-food-grocery',            20, 'Wheat',    'Packaged foods, staples, beverages, personal care & household'),
  ('Electronics, Electrical & Technology',  'electronics-electrical-tech',  30, 'Cpu',      'Consumer electronics, appliances, components & IT hardware'),
  ('Automobile & EV',                       'automobile-ev',                40, 'Car',      'Vehicles, auto components, tyres, batteries & EV supply chain'),
  ('Building Materials & Hardware',         'building-materials-hardware',  50, 'HardHat',  'Cement, steel, tiles, sanitaryware, tools & fasteners'),
  ('Industrial Machinery & Manufacturing',  'industrial-machinery',         60, 'Wrench',   'Machine tools, automation, industrial equipment & spares'),
  ('Agriculture & Allied Products',         'agriculture-allied',           70, 'Sprout',   'Seeds, fertilizers, farm equipment, dairy & animal feed'),
  ('Healthcare, Medical & Pharma',          'healthcare-medical-pharma',    80, 'HeartPulse','Medical devices, pharma, surgical, wellness & diagnostics'),
  ('Home, Furniture & Kitchen',             'home-furniture-kitchen',       90, 'Sofa',     'Furniture, decor, kitchenware, appliances & home essentials'),
  ('Packaging & Printing',                  'packaging-printing',          100, 'Package',  'Cartons, films, labels, packaging machinery & print services'),
  ('Chemicals & Raw Materials',             'chemicals-raw-materials',     110, 'FlaskConical','Industrial chemicals, polymers, dyes, adhesives & raw inputs'),
  ('Business & Retail Supplies',            'business-retail-supplies',    120, 'ShoppingBag','Stationery, office supplies, POS gear, uniforms & retail fittings')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  icon_name = excluded.icon_name;

-- Business Types (8)
insert into business_types (code, name, description, sort_order) values
  ('manufacturer', 'Manufacturer', 'Produces goods in-house at owned/leased factories',            10),
  ('wholesaler',   'Wholesaler',   'Bulk resale of goods to retailers and distributors',           20),
  ('distributor',  'Distributor',  'Regional distribution rights for specific brands/products',     30),
  ('supplier',     'Supplier',     'Sources and supplies goods across categories',                  40),
  ('retailer',     'Retailer',     'Sells to end businesses in smaller lot sizes',                  50),
  ('importer',     'Importer',     'Imports goods into India for domestic wholesale',               60),
  ('exporter',     'Exporter',     'Exports Indian goods to international buyers',                  70),
  ('trader',       'Trader',       'General trading of goods without manufacturing',                80)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- Measurement Units
insert into units (code, name, symbol, unit_type, sort_order) values
  ('piece',      'Piece',           'pc',   'measurement', 10),
  ('kg',         'Kilogram',        'kg',   'measurement', 20),
  ('gram',       'Gram',            'g',    'measurement', 25),
  ('ton',        'Ton',             't',    'measurement', 30),
  ('quintal',    'Quintal',         'qtl',  'measurement', 32),
  ('litre',      'Litre',           'L',    'measurement', 40),
  ('millilitre', 'Millilitre',      'ml',   'measurement', 42),
  ('metre',      'Metre',           'm',    'measurement', 50),
  ('centimetre', 'Centimetre',      'cm',   'measurement', 52),
  ('sqm',        'Square Metre',    'm²',   'measurement', 55),
  ('sqft',       'Square Foot',     'ft²',  'measurement', 56),
  ('yard',       'Yard',            'yd',   'measurement', 60),
  ('dozen',      'Dozen',           'dz',   'measurement', 70),
  ('gross',      'Gross',           'gr',   'measurement', 72),
  ('pair',       'Pair',            'pr',   'measurement', 75),
  ('set',        'Set',             'set',  'measurement', 80),
  ('unit',       'Unit',            'u',    'measurement', 90)
on conflict (unit_type, code) do update set name = excluded.name, symbol = excluded.symbol;

-- Packaging Units
insert into units (code, name, symbol, unit_type, sort_order) values
  ('carton',   'Carton',   'ctn',  'packaging', 10),
  ('box',      'Box',      'box',  'packaging', 20),
  ('bag',      'Bag',      'bag',  'packaging', 30),
  ('sack',     'Sack',     'sack', 'packaging', 40),
  ('roll',     'Roll',     'roll', 'packaging', 50),
  ('bundle',   'Bundle',   'bdl',  'packaging', 60),
  ('crate',    'Crate',    'crate','packaging', 70),
  ('pallet',   'Pallet',   'plt',  'packaging', 80),
  ('drum',     'Drum',     'drum', 'packaging', 90),
  ('bottle',   'Bottle',   'btl',  'packaging', 100),
  ('can',      'Can',      'can',  'packaging', 110),
  ('pack',     'Pack',     'pack', 'packaging', 120),
  ('container','Container','cont', 'packaging', 130)
on conflict (unit_type, code) do update set name = excluded.name, symbol = excluded.symbol;

-- ============================================================================
-- END OF MIGRATION 003
-- ============================================================================
