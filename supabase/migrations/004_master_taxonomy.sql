-- ============================================================================
-- ThokSale — Master Industry Taxonomy (Migration 004)
-- ============================================================================
-- Purpose : Replace basic 12-industry seed with the full PRD taxonomy.
--           Industry → Category → Sub-Category (3 levels, all via categories
--           table with parent_id — same pattern as before).
--           Also adds all PRD-required product listing fields.
-- Policy  : 100% additive. Uses ON CONFLICT DO UPDATE so safe to re-run.
-- Structure:
--   industries   — 12 top-level industry buckets
--   categories   — Level-1 categories, FK → industry_id
--   categories   — Level-2 sub-categories, FK → parent_id (level-1 category)
-- ============================================================================

-- ============================================================================
-- PART 1: ENUMS — Supplier Type & Buyer Type
-- ============================================================================

do $$ begin
  create type supplier_type as enum (
    'manufacturer', 'oem_manufacturer', 'odm_manufacturer',
    'contract_manufacturer', 'private_label_manufacturer',
    'wholesaler', 'distributor', 'importer', 'exporter', 'trader'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type buyer_type as enum (
    'retailer', 'wholesaler', 'distributor',
    'amazon_seller', 'flipkart_seller', 'meesho_seller',
    'd2c_brand', 'online_seller', 'exporter',
    'institutional_buyer', 'corporate_buyer', 'government_buyer'
  );
exception when duplicate_object then null; end $$;

-- ============================================================================
-- PART 2: PRODUCT TABLE EXTENSIONS (PRD listing fields)
-- ============================================================================

-- Supplier classification
alter table products add column if not exists supplier_type      supplier_type;
alter table products add column if not exists factory_gate_price numeric(14,2);   -- authoritative price
alter table products add column if not exists price_min          numeric(14,2);   -- price range min
alter table products add column if not exists price_max          numeric(14,2);   -- price range max
alter table products add column if not exists available_quantity integer;
alter table products add column if not exists mfg_capacity       text;            -- "10,000 units/month"

-- Location & logistics
alter table products add column if not exists mfg_location_city  text;
alter table products add column if not exists mfg_location_state text;
alter table products add column if not exists warehouse_locations jsonb default '[]'::jsonb;
alter table products add column if not exists delivery_locations  jsonb default '[]'::jsonb; -- states/pincodes
alter table products add column if not exists lead_time_days      integer;
alter table products add column if not exists payment_terms       text;

-- Certifications & compliance
alter table products add column if not exists certifications      jsonb default '[]'::jsonb; -- [{name, number, url}]
alter table products add column if not exists hsn_code            text;
alter table products add column if not exists gst_rate            numeric(5,2);
alter table products add column if not exists country_of_origin   text default 'India';

-- B2B flags
alter table products add column if not exists sample_available    boolean not null default false;
alter table products add column if not exists oem_available       boolean not null default false;
alter table products add column if not exists odm_available       boolean not null default false;
alter table products add column if not exists private_label_avail boolean not null default false;

-- Packaging
alter table products add column if not exists packaging_details   text;
alter table products add column if not exists package_size        jsonb;  -- {l, w, h, unit}

-- Product media (video support)
alter table products add column if not exists video_url           text;

-- ============================================================================
-- PART 3: EXTENDED product_images → product_media (new table, keeps compat)
-- ============================================================================

create table if not exists product_media (
  id                      uuid primary key default gen_random_uuid(),
  product_id              uuid not null references products(id) on delete cascade,
  media_type              text not null default 'image' check (media_type in ('image','video','document','certificate')),
  public_url_or_reference text not null,
  storage_path            text,
  alt_text                text,
  caption                 text,
  is_primary              boolean not null default false,
  sort_order              integer not null default 0,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index if not exists idx_product_media_product  on product_media(product_id);
create index if not exists idx_product_media_primary  on product_media(product_id, is_primary) where is_primary = true;

do $$ begin
  drop trigger if exists trg_product_media_updated_at on product_media;
  create trigger trg_product_media_updated_at
    before update on product_media
    for each row execute function set_updated_at();
end $$;

alter table product_media enable row level security;
drop policy if exists product_media_read  on product_media;
create policy product_media_read  on product_media for select using (true);
drop policy if exists product_media_owner on product_media;
create policy product_media_owner on product_media for all using (
  exists (select 1 from products p where p.id = product_media.product_id
          and (p.seller_id = auth.uid() or is_admin(auth.uid())))
) with check (
  exists (select 1 from products p where p.id = product_media.product_id
          and (p.seller_id = auth.uid() or is_admin(auth.uid())))
);

-- ============================================================================
-- PART 4: INDUSTRIES — Replace with full PRD taxonomy (12 industries)
-- ============================================================================

insert into industries (name, slug, sort_order, icon_name, description) values
  ('Agri & Food',                  'agri-food',              10,  'Sprout',         'Agriculture, farming, food grains, processed food, dairy & beverages'),
  ('FMCG & Personal Care',         'fmcg-personal-care',     20,  'ShoppingBag',    'Personal care, beauty & cosmetics, home care, hygiene & disposables'),
  ('Fashion & Lifestyle',          'fashion-lifestyle',       30,  'Shirt',          'Apparel, textiles, footwear, fashion accessories'),
  ('Construction & Building',      'construction-building',   40,  'HardHat',        'Building materials, steel, tiles, plumbing, doors, paints, hardware'),
  ('Electronics & Electrical',     'electronics-electrical',  50,  'Cpu',            'Electrical equipment, industrial electrical, electronics, lighting'),
  ('Automotive & Mobility',        'automotive-mobility',     60,  'Car',            'Vehicles, auto components, tyres, batteries, EV supply chain'),
  ('Industrial & Engineering',     'industrial-engineering',  70,  'Wrench',         'Machinery, process equipment, tools, engineering components, automation'),
  ('Chemicals & Materials',        'chemicals-materials',     80,  'FlaskConical',   'Industrial chemicals, plastics, rubber, adhesives, paints, coatings'),
  ('Healthcare & Wellness',        'healthcare-wellness',     90,  'HeartPulse',     'Pharmaceuticals, medical devices, surgical supplies, laboratory, dental'),
  ('Home & Living',                'home-living',            100,  'Sofa',           'Furniture, kitchen, home décor, furnishing, home improvement'),
  ('Consumer & General Goods',     'consumer-general',       110,  'Package',        'Toys, sports, stationery, packaging, gifts & general merchandise'),
  ('Energy & Infrastructure',      'energy-infrastructure',  120,  'Zap',            'Solar, energy storage, power infrastructure, renewable energy, aerospace')
on conflict (slug) do update set
  name       = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  icon_name  = excluded.icon_name;

-- ============================================================================
-- PART 5: LEVEL-1 CATEGORIES (linked to industries)
-- Slug pattern: {industry-slug}--{category-slug}
-- ============================================================================

-- We use a DO block to look up industry IDs dynamically
do $$
declare
  -- Industry IDs
  ind_agri        uuid;
  ind_fmcg        uuid;
  ind_fashion     uuid;
  ind_construction uuid;
  ind_electronics  uuid;
  ind_automotive   uuid;
  ind_industrial   uuid;
  ind_chemicals    uuid;
  ind_healthcare   uuid;
  ind_home         uuid;
  ind_consumer     uuid;
  ind_energy       uuid;
begin
  select id into ind_agri         from industries where slug = 'agri-food';
  select id into ind_fmcg         from industries where slug = 'fmcg-personal-care';
  select id into ind_fashion      from industries where slug = 'fashion-lifestyle';
  select id into ind_construction from industries where slug = 'construction-building';
  select id into ind_electronics  from industries where slug = 'electronics-electrical';
  select id into ind_automotive   from industries where slug = 'automotive-mobility';
  select id into ind_industrial   from industries where slug = 'industrial-engineering';
  select id into ind_chemicals    from industries where slug = 'chemicals-materials';
  select id into ind_healthcare   from industries where slug = 'healthcare-wellness';
  select id into ind_home         from industries where slug = 'home-living';
  select id into ind_consumer     from industries where slug = 'consumer-general';
  select id into ind_energy       from industries where slug = 'energy-infrastructure';

  -- -----------------------------------------------------------------------
  -- 1. AGRI & FOOD — Level 1 Categories
  -- -----------------------------------------------------------------------
  insert into categories (parent_id, industry_id, name, slug, sort_order) values
    (null, ind_agri, 'Agriculture & Farming',  'agri--agriculture-farming',   10),
    (null, ind_agri, 'Food & Grains',          'agri--food-grains',           20),
    (null, ind_agri, 'Processed Food',         'agri--processed-food',        30),
    (null, ind_agri, 'Dairy & Beverages',      'agri--dairy-beverages',       40)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, industry_id = excluded.industry_id;

  -- -----------------------------------------------------------------------
  -- 2. FMCG & PERSONAL CARE — Level 1 Categories
  -- -----------------------------------------------------------------------
  insert into categories (parent_id, industry_id, name, slug, sort_order) values
    (null, ind_fmcg, 'Personal Care',          'fmcg--personal-care',         10),
    (null, ind_fmcg, 'Beauty & Cosmetics',     'fmcg--beauty-cosmetics',      20),
    (null, ind_fmcg, 'Home Care',              'fmcg--home-care',             30),
    (null, ind_fmcg, 'Hygiene & Disposable',   'fmcg--hygiene-disposable',    40)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, industry_id = excluded.industry_id;

  -- -----------------------------------------------------------------------
  -- 3. FASHION & LIFESTYLE — Level 1 Categories
  -- -----------------------------------------------------------------------
  insert into categories (parent_id, industry_id, name, slug, sort_order) values
    (null, ind_fashion, 'Apparel',              'fashion--apparel',            10),
    (null, ind_fashion, 'Textiles',             'fashion--textiles',           20),
    (null, ind_fashion, 'Footwear',             'fashion--footwear',           30),
    (null, ind_fashion, 'Fashion Accessories',  'fashion--accessories',        40)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, industry_id = excluded.industry_id;

  -- -----------------------------------------------------------------------
  -- 4. CONSTRUCTION & BUILDING — Level 1 Categories
  -- -----------------------------------------------------------------------
  insert into categories (parent_id, industry_id, name, slug, sort_order) values
    (null, ind_construction, 'Building Materials',    'const--building-materials',    10),
    (null, ind_construction, 'Steel & Structural',    'const--steel-structural',      20),
    (null, ind_construction, 'Tiles & Surfaces',      'const--tiles-surfaces',        30),
    (null, ind_construction, 'Plumbing',               'const--plumbing',              40),
    (null, ind_construction, 'Sanitaryware',           'const--sanitaryware',          50),
    (null, ind_construction, 'Building Electrical',    'const--building-electrical',   60),
    (null, ind_construction, 'Doors, Windows & Glass', 'const--doors-windows-glass',   70),
    (null, ind_construction, 'Paints & Finishing',     'const--paints-finishing',      80),
    (null, ind_construction, 'Hardware',                'const--hardware',              90)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, industry_id = excluded.industry_id;

  -- -----------------------------------------------------------------------
  -- 5. ELECTRONICS & ELECTRICAL — Level 1 Categories
  -- -----------------------------------------------------------------------
  insert into categories (parent_id, industry_id, name, slug, sort_order) values
    (null, ind_electronics, 'Electrical Equipment',       'elec--electrical-equipment',        10),
    (null, ind_electronics, 'Industrial Electrical',      'elec--industrial-electrical',       20),
    (null, ind_electronics, 'Electronics Components',     'elec--electronics-components',      30),
    (null, ind_electronics, 'Consumer Electronics',       'elec--consumer-electronics',        40),
    (null, ind_electronics, 'Mobile & Computer Accessories', 'elec--mobile-computer-acc',      50),
    (null, ind_electronics, 'Lighting',                   'elec--lighting',                    60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, industry_id = excluded.industry_id;

  -- -----------------------------------------------------------------------
  -- 6. AUTOMOTIVE & MOBILITY — Level 1 Categories
  -- -----------------------------------------------------------------------
  insert into categories (parent_id, industry_id, name, slug, sort_order) values
    (null, ind_automotive, 'Vehicles',            'auto--vehicles',            10),
    (null, ind_automotive, 'Auto Components',     'auto--components',          20),
    (null, ind_automotive, 'Body & Exterior',     'auto--body-exterior',       30),
    (null, ind_automotive, 'Tyres & Wheels',      'auto--tyres-wheels',        40),
    (null, ind_automotive, 'Batteries',           'auto--batteries',           50),
    (null, ind_automotive, 'EV',                  'auto--ev',                  60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, industry_id = excluded.industry_id;

  -- -----------------------------------------------------------------------
  -- 7. INDUSTRIAL & ENGINEERING — Level 1 Categories
  -- -----------------------------------------------------------------------
  insert into categories (parent_id, industry_id, name, slug, sort_order) values
    (null, ind_industrial, 'Machinery',               'ind--machinery',              10),
    (null, ind_industrial, 'Process Machinery',       'ind--process-machinery',      20),
    (null, ind_industrial, 'Industrial Equipment',    'ind--industrial-equipment',   30),
    (null, ind_industrial, 'Tools',                   'ind--tools',                  40),
    (null, ind_industrial, 'Engineering Components',  'ind--engineering-components', 50),
    (null, ind_industrial, 'Automation',              'ind--automation',             60),
    (null, ind_industrial, 'Fabrication',             'ind--fabrication',            70)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, industry_id = excluded.industry_id;

  -- -----------------------------------------------------------------------
  -- 8. CHEMICALS & MATERIALS — Level 1 Categories
  -- -----------------------------------------------------------------------
  insert into categories (parent_id, industry_id, name, slug, sort_order) values
    (null, ind_chemicals, 'Industrial Chemicals',      'chem--industrial-chemicals',  10),
    (null, ind_chemicals, 'Plastics & Polymers',       'chem--plastics-polymers',     20),
    (null, ind_chemicals, 'Rubber',                    'chem--rubber',                30),
    (null, ind_chemicals, 'Adhesives & Sealants',      'chem--adhesives-sealants',    40),
    (null, ind_chemicals, 'Paints, Coatings & Inks',   'chem--paints-coatings-inks',  50),
    (null, ind_chemicals, 'Industrial Materials',      'chem--industrial-materials',  60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, industry_id = excluded.industry_id;

  -- -----------------------------------------------------------------------
  -- 9. HEALTHCARE & WELLNESS — Level 1 Categories
  -- -----------------------------------------------------------------------
  insert into categories (parent_id, industry_id, name, slug, sort_order) values
    (null, ind_healthcare, 'Pharmaceuticals',                  'health--pharma',               10),
    (null, ind_healthcare, 'Medical Devices',                  'health--medical-devices',      20),
    (null, ind_healthcare, 'Surgical & Medical Consumables',   'health--surgical-consumables', 30),
    (null, ind_healthcare, 'Laboratory',                       'health--laboratory',           40),
    (null, ind_healthcare, 'Dental',                           'health--dental',               50),
    (null, ind_healthcare, 'Wellness',                         'health--wellness',             60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, industry_id = excluded.industry_id;

  -- -----------------------------------------------------------------------
  -- 10. HOME & LIVING — Level 1 Categories
  -- -----------------------------------------------------------------------
  insert into categories (parent_id, industry_id, name, slug, sort_order) values
    (null, ind_home, 'Furniture',          'home--furniture',          10),
    (null, ind_home, 'Kitchen',            'home--kitchen',            20),
    (null, ind_home, 'Home Décor',         'home--decor',              30),
    (null, ind_home, 'Home Furnishing',    'home--furnishing',         40),
    (null, ind_home, 'Home Improvement',   'home--improvement',        50)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, industry_id = excluded.industry_id;

  -- -----------------------------------------------------------------------
  -- 11. CONSUMER & GENERAL GOODS — Level 1 Categories
  -- -----------------------------------------------------------------------
  insert into categories (parent_id, industry_id, name, slug, sort_order) values
    (null, ind_consumer, 'Toys & Games',             'cons--toys-games',          10),
    (null, ind_consumer, 'Sports & Fitness',         'cons--sports-fitness',      20),
    (null, ind_consumer, 'Stationery & Office',      'cons--stationery-office',   30),
    (null, ind_consumer, 'Packaging',                'cons--packaging',           40),
    (null, ind_consumer, 'Gifts & General Merchandise', 'cons--gifts-merchandise', 50)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, industry_id = excluded.industry_id;

  -- -----------------------------------------------------------------------
  -- 12. ENERGY & INFRASTRUCTURE — Level 1 Categories
  -- -----------------------------------------------------------------------
  insert into categories (parent_id, industry_id, name, slug, sort_order) values
    (null, ind_energy, 'Solar',                  'energy--solar',            10),
    (null, ind_energy, 'Energy Storage',         'energy--storage',          20),
    (null, ind_energy, 'Power Infrastructure',   'energy--power-infra',      30),
    (null, ind_energy, 'Renewable Energy',       'energy--renewable',        40),
    (null, ind_energy, 'Heavy Infrastructure',   'energy--heavy-infra',      50),
    (null, ind_energy, 'Aerospace & Defence',    'energy--aerospace-defence',60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, industry_id = excluded.industry_id;

end $$;

-- ============================================================================
-- PART 6: LEVEL-2 SUB-CATEGORIES
-- Pattern: look up parent by slug, insert children
-- ============================================================================

do $$
declare
  cat uuid;
begin

  -- =========================================================================
  -- 1. AGRI & FOOD sub-categories
  -- =========================================================================

  -- Agriculture & Farming
  select id into cat from categories where slug = 'agri--agriculture-farming';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Seeds',              'agri--agri-seeds',         10),
    (cat, 'Fertilizers',        'agri--fertilizers',        20),
    (cat, 'Crop Protection',    'agri--crop-protection',    30),
    (cat, 'Irrigation',         'agri--irrigation',         40),
    (cat, 'Farm Equipment',     'agri--farm-equipment',     50),
    (cat, 'Agricultural Tools', 'agri--agri-tools',         60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  -- Food & Grains
  select id into cat from categories where slug = 'agri--food-grains';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Rice',               'agri--rice',               10),
    (cat, 'Wheat',              'agri--wheat',              20),
    (cat, 'Maize',              'agri--maize',              30),
    (cat, 'Millets',            'agri--millets',            40),
    (cat, 'Pulses',             'agri--pulses',             50),
    (cat, 'Flour',              'agri--flour',              60),
    (cat, 'Spices',             'agri--spices',             70),
    (cat, 'Dry Fruits',         'agri--dry-fruits',         80),
    (cat, 'Edible Oils',        'agri--edible-oils',        90),
    (cat, 'Sugar & Sweeteners', 'agri--sugar-sweeteners',  100)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  -- Processed Food
  select id into cat from categories where slug = 'agri--processed-food';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Snacks',              'agri--snacks',             10),
    (cat, 'Biscuits',            'agri--biscuits',           20),
    (cat, 'Bakery Products',     'agri--bakery',             30),
    (cat, 'Ready-to-Eat Food',   'agri--rte-food',           40),
    (cat, 'Frozen Food',         'agri--frozen-food',        50),
    (cat, 'Instant Food',        'agri--instant-food',       60),
    (cat, 'Pickles',             'agri--pickles',            70),
    (cat, 'Sauces',              'agri--sauces',             80),
    (cat, 'Confectionery',       'agri--confectionery',      90)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  -- Dairy & Beverages
  select id into cat from categories where slug = 'agri--dairy-beverages';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Milk',             'agri--milk',               10),
    (cat, 'Paneer',           'agri--paneer',             20),
    (cat, 'Cheese',           'agri--cheese',             30),
    (cat, 'Butter',           'agri--butter',             40),
    (cat, 'Ghee',             'agri--ghee',               50),
    (cat, 'Tea',              'agri--tea',                60),
    (cat, 'Coffee',           'agri--coffee',             70),
    (cat, 'Juices',           'agri--juices',             80),
    (cat, 'Packaged Water',   'agri--packaged-water',     90),
    (cat, 'Soft Drinks',      'agri--soft-drinks',       100)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  -- =========================================================================
  -- 2. FMCG & PERSONAL CARE sub-categories
  -- =========================================================================

  select id into cat from categories where slug = 'fmcg--personal-care';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Soaps',              'fmcg--soaps',              10),
    (cat, 'Shampoo',            'fmcg--shampoo',            20),
    (cat, 'Conditioner',        'fmcg--conditioner',        30),
    (cat, 'Hair Oil',           'fmcg--hair-oil',           40),
    (cat, 'Face Wash',          'fmcg--face-wash',          50),
    (cat, 'Moisturizers',       'fmcg--moisturizers',       60),
    (cat, 'Body Lotion',        'fmcg--body-lotion',        70),
    (cat, 'Oral Care',          'fmcg--oral-care',          80),
    (cat, 'Shaving & Grooming', 'fmcg--shaving-grooming',   90)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'fmcg--beauty-cosmetics';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Makeup',             'fmcg--makeup',             10),
    (cat, 'Lipsticks',          'fmcg--lipsticks',          20),
    (cat, 'Foundation',         'fmcg--foundation',         30),
    (cat, 'Nail Care',          'fmcg--nail-care',          40),
    (cat, 'Beauty Tools',       'fmcg--beauty-tools',       50),
    (cat, 'Perfumes',           'fmcg--perfumes',           60),
    (cat, 'Deodorants',         'fmcg--deodorants',         70),
    (cat, 'Attars',             'fmcg--attars',             80)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'fmcg--home-care';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Detergents',           'fmcg--detergents',         10),
    (cat, 'Dishwashing Products', 'fmcg--dishwashing',        20),
    (cat, 'Floor Cleaners',       'fmcg--floor-cleaners',     30),
    (cat, 'Toilet Cleaners',      'fmcg--toilet-cleaners',    40),
    (cat, 'Surface Cleaners',     'fmcg--surface-cleaners',   50),
    (cat, 'Air Fresheners',       'fmcg--air-fresheners',     60),
    (cat, 'Pest Control',         'fmcg--pest-control',       70)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'fmcg--hygiene-disposable';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Handwash',           'fmcg--handwash',           10),
    (cat, 'Sanitizers',         'fmcg--sanitizers',         20),
    (cat, 'Tissues',            'fmcg--tissues',            30),
    (cat, 'Wet Wipes',          'fmcg--wet-wipes',          40),
    (cat, 'Sanitary Products',  'fmcg--sanitary-products',  50),
    (cat, 'Baby Diapers',       'fmcg--baby-diapers',       60),
    (cat, 'Baby Wipes',         'fmcg--baby-wipes',         70)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  -- =========================================================================
  -- 3. FASHION & LIFESTYLE sub-categories
  -- =========================================================================

  select id into cat from categories where slug = 'fashion--apparel';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Men''s Clothing',  'fashion--mens-clothing',   10),
    (cat, 'Women''s Clothing','fashion--womens-clothing',  20),
    (cat, 'Kids Clothing',    'fashion--kids-clothing',   30),
    (cat, 'Infant Wear',      'fashion--infant-wear',     40),
    (cat, 'Ethnic Wear',      'fashion--ethnic-wear',     50),
    (cat, 'Sportswear',       'fashion--sportswear',      60),
    (cat, 'Workwear',         'fashion--workwear',        70),
    (cat, 'Uniforms',         'fashion--uniforms',        80)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'fashion--textiles';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Cotton Fabric',       'fashion--cotton-fabric',    10),
    (cat, 'Silk Fabric',         'fashion--silk-fabric',      20),
    (cat, 'Linen',               'fashion--linen',            30),
    (cat, 'Polyester',           'fashion--polyester',        40),
    (cat, 'Denim',               'fashion--denim',            50),
    (cat, 'Wool',                'fashion--wool',             60),
    (cat, 'Synthetic Fabric',    'fashion--synthetic-fabric', 70),
    (cat, 'Yarn',                'fashion--yarn',             80),
    (cat, 'Technical Textiles',  'fashion--technical-textiles',90),
    (cat, 'Home Textiles',       'fashion--home-textiles',   100)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'fashion--footwear';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Shoes',          'fashion--shoes',           10),
    (cat, 'Sandals',        'fashion--sandals',         20),
    (cat, 'Slippers',       'fashion--slippers',        30),
    (cat, 'Sports Shoes',   'fashion--sports-shoes',    40),
    (cat, 'Safety Shoes',   'fashion--safety-shoes',    50),
    (cat, 'School Shoes',   'fashion--school-shoes',    60),
    (cat, 'Boots',          'fashion--boots',           70)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'fashion--accessories';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Bags',                 'fashion--bags',               10),
    (cat, 'Handbags',             'fashion--handbags',           20),
    (cat, 'Backpacks',            'fashion--backpacks',          30),
    (cat, 'Wallets',              'fashion--wallets',            40),
    (cat, 'Belts',                'fashion--belts',              50),
    (cat, 'Caps',                 'fashion--caps',               60),
    (cat, 'Sunglasses',           'fashion--sunglasses',         70),
    (cat, 'Watches',              'fashion--watches',            80),
    (cat, 'Fashion Jewellery',    'fashion--fashion-jewellery',  90),
    (cat, 'Artificial Jewellery', 'fashion--artificial-jewellery',100)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  -- =========================================================================
  -- 4. CONSTRUCTION & BUILDING sub-categories
  -- =========================================================================

  select id into cat from categories where slug = 'const--building-materials';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Cement',                 'const--cement',            10),
    (cat, 'Concrete',               'const--concrete',          20),
    (cat, 'Bricks',                 'const--bricks',            30),
    (cat, 'AAC Blocks',             'const--aac-blocks',        40),
    (cat, 'Sand',                   'const--sand',              50),
    (cat, 'Aggregates',             'const--aggregates',        60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'const--steel-structural';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'TMT Bars',           'const--tmt-bars',          10),
    (cat, 'Structural Steel',   'const--structural-steel',  20),
    (cat, 'Angles',             'const--angles',            30),
    (cat, 'Channels',           'const--channels',          40),
    (cat, 'Beams',              'const--beams',             50),
    (cat, 'Roofing Sheets',     'const--roofing-sheets',    60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'const--tiles-surfaces';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Ceramic Tiles',      'const--ceramic-tiles',     10),
    (cat, 'Vitrified Tiles',    'const--vitrified-tiles',   20),
    (cat, 'Wall Tiles',         'const--wall-tiles',        30),
    (cat, 'Floor Tiles',        'const--floor-tiles',       40),
    (cat, 'Marble',             'const--marble',            50),
    (cat, 'Granite',            'const--granite',           60),
    (cat, 'Quartz',             'const--quartz',            70),
    (cat, 'Natural Stone',      'const--natural-stone',     80)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'const--plumbing';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'PVC Pipes',          'const--pvc-pipes',         10),
    (cat, 'CPVC Pipes',         'const--cpvc-pipes',        20),
    (cat, 'UPVC Pipes',         'const--upvc-pipes',        30),
    (cat, 'HDPE Pipes',         'const--hdpe-pipes',        40),
    (cat, 'Pipe Fittings',      'const--pipe-fittings',     50),
    (cat, 'Valves',             'const--valves',            60),
    (cat, 'Water Tanks',        'const--water-tanks',       70),
    (cat, 'Faucets',            'const--faucets',           80),
    (cat, 'Bathroom Fittings',  'const--bathroom-fittings', 90)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'const--sanitaryware';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Toilets',               'const--toilets',           10),
    (cat, 'Wash Basins',           'const--wash-basins',       20),
    (cat, 'Urinals',               'const--urinals',           30),
    (cat, 'Bathtubs',              'const--bathtubs',          40),
    (cat, 'Showers',               'const--showers',           50),
    (cat, 'Bathroom Accessories',  'const--bathroom-acc',      60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'const--building-electrical';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Electrical Wires',       'const--elec-wires',        10),
    (cat, 'Building Cables',        'const--building-cables',   20),
    (cat, 'Switches & Sockets',     'const--switches-sockets',  30),
    (cat, 'Modular Switches',       'const--modular-switches',  40),
    (cat, 'MCBs',                   'const--mcbs',              50),
    (cat, 'Distribution Boards',    'const--dist-boards',       60),
    (cat, 'Electrical Conduits',    'const--conduits',          70),
    (cat, 'Building Lighting',      'const--building-lighting', 80),
    (cat, 'Ceiling Fans',           'const--ceiling-fans',      90),
    (cat, 'Exhaust Fans',           'const--exhaust-fans',     100),
    (cat, 'Smart Home Electrical',  'const--smart-home-elec',  110)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'const--doors-windows-glass';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Wooden Doors',         'const--wooden-doors',       10),
    (cat, 'Metal Doors',          'const--metal-doors',        20),
    (cat, 'Aluminium Doors',      'const--aluminium-doors',    30),
    (cat, 'UPVC Doors',           'const--upvc-doors',         40),
    (cat, 'Windows',              'const--windows',            50),
    (cat, 'Glass',                'const--glass',              60),
    (cat, 'Toughened Glass',      'const--toughened-glass',    70),
    (cat, 'Architectural Glass',  'const--arch-glass',         80)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'const--paints-finishing';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Interior Paint',          'const--interior-paint',     10),
    (cat, 'Exterior Paint',          'const--exterior-paint',     20),
    (cat, 'Waterproofing',           'const--waterproofing',      30),
    (cat, 'Construction Chemicals',  'const--constr-chemicals',   40),
    (cat, 'Sealants',                'const--sealants',           50),
    (cat, 'Adhesives',               'const--adhesives',          60),
    (cat, 'Wall Putty',              'const--wall-putty',         70)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'const--hardware';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Locks',                'const--locks',               10),
    (cat, 'Hinges',               'const--hinges',              20),
    (cat, 'Handles',              'const--handles',             30),
    (cat, 'Door Fittings',        'const--door-fittings',       40),
    (cat, 'Cabinet Hardware',     'const--cabinet-hardware',    50),
    (cat, 'Construction Hardware','const--constr-hardware',     60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  -- =========================================================================
  -- 5. ELECTRONICS & ELECTRICAL sub-categories
  -- =========================================================================

  select id into cat from categories where slug = 'elec--electrical-equipment';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Motors',               'elec--motors',               10),
    (cat, 'Transformers',         'elec--transformers',         20),
    (cat, 'Generators',           'elec--generators',           30),
    (cat, 'UPS',                  'elec--ups',                  40),
    (cat, 'Inverters',            'elec--inverters',            50),
    (cat, 'Industrial Batteries', 'elec--industrial-batteries', 60),
    (cat, 'Power Supplies',       'elec--power-supplies',       70)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'elec--industrial-electrical';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Switchgear',                   'elec--switchgear',           10),
    (cat, 'MCCB',                         'elec--mccb',                 20),
    (cat, 'Industrial MCB',               'elec--industrial-mcb',       30),
    (cat, 'Contactors',                   'elec--contactors',           40),
    (cat, 'Relays',                       'elec--relays',               50),
    (cat, 'Control Panels',               'elec--control-panels',       60),
    (cat, 'Busbars',                      'elec--busbars',              70),
    (cat, 'Industrial Cables',            'elec--industrial-cables',    80),
    (cat, 'Power Distribution Equipment', 'elec--power-dist-equipment', 90)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'elec--electronics-components';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'ICs',             'elec--ics',             10),
    (cat, 'Resistors',       'elec--resistors',       20),
    (cat, 'Capacitors',      'elec--capacitors',      30),
    (cat, 'Diodes',          'elec--diodes',          40),
    (cat, 'Transistors',     'elec--transistors',     50),
    (cat, 'Sensors',         'elec--sensors',         60),
    (cat, 'Connectors',      'elec--connectors',      70),
    (cat, 'PCBs',            'elec--pcbs',            80),
    (cat, 'Electronic Modules','elec--elec-modules',  90)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'elec--consumer-electronics';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'TVs',            'elec--tvs',              10),
    (cat, 'Speakers',       'elec--speakers',         20),
    (cat, 'Audio Systems',  'elec--audio-systems',    30),
    (cat, 'Cameras',        'elec--cameras',          40),
    (cat, 'Smart Devices',  'elec--smart-devices',    50)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'elec--mobile-computer-acc';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Chargers',           'elec--chargers',           10),
    (cat, 'USB & Data Cables',  'elec--usb-data-cables',    20),
    (cat, 'Power Banks',        'elec--power-banks',        30),
    (cat, 'Mobile Cases',       'elec--mobile-cases',       40),
    (cat, 'Computer Keyboards', 'elec--keyboards',          50),
    (cat, 'Mice',               'elec--mice',               60),
    (cat, 'Webcams',            'elec--webcams',            70),
    (cat, 'Hubs & Adapters',    'elec--hubs-adapters',      80)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'elec--lighting';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'LED Bulbs',          'elec--led-bulbs',          10),
    (cat, 'LED Panels',         'elec--led-panels',         20),
    (cat, 'LED Tubes',          'elec--led-tubes',          30),
    (cat, 'Flood Lights',       'elec--flood-lights',       40),
    (cat, 'Industrial Lights',  'elec--industrial-lights',  50),
    (cat, 'Decorative Lighting','elec--decorative-lighting',60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  -- =========================================================================
  -- 6. AUTOMOTIVE & MOBILITY sub-categories
  -- =========================================================================

  select id into cat from categories where slug = 'auto--vehicles';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Cars',            'auto--cars',            10),
    (cat, 'SUVs',            'auto--suvs',            20),
    (cat, 'Trucks',          'auto--trucks',          30),
    (cat, 'Buses',           'auto--buses',           40),
    (cat, 'Motorcycles',     'auto--motorcycles',     50),
    (cat, 'Scooters',        'auto--scooters',        60),
    (cat, 'Three-Wheelers',  'auto--three-wheelers',  70)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'auto--components';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Engine Parts',       'auto--engine-parts',     10),
    (cat, 'Brake Parts',        'auto--brake-parts',      20),
    (cat, 'Suspension Parts',   'auto--suspension-parts', 30),
    (cat, 'Steering Parts',     'auto--steering-parts',   40),
    (cat, 'Transmission Parts', 'auto--transmission',     50),
    (cat, 'Filters',            'auto--filters',          60),
    (cat, 'Gaskets',            'auto--gaskets',          70),
    (cat, 'Bearings',           'auto--bearings',         80),
    (cat, 'Auto Electrical',    'auto--auto-electrical',  90)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'auto--body-exterior';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Bumpers',           'auto--bumpers',          10),
    (cat, 'Mirrors',           'auto--mirrors',          20),
    (cat, 'Lights',            'auto--lights',           30),
    (cat, 'Panels',            'auto--panels',           40),
    (cat, 'Body Accessories',  'auto--body-acc',         50)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'auto--tyres-wheels';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Car Tyres',        'auto--car-tyres',        10),
    (cat, 'Truck Tyres',      'auto--truck-tyres',      20),
    (cat, 'Bike Tyres',       'auto--bike-tyres',       30),
    (cat, 'Industrial Tyres', 'auto--industrial-tyres', 40),
    (cat, 'Tubes',            'auto--tubes',            50),
    (cat, 'Wheels & Rims',    'auto--wheels-rims',      60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'auto--batteries';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Automotive Batteries',  'auto--automotive-batteries',  10),
    (cat, 'Commercial Batteries',  'auto--commercial-batteries',  20),
    (cat, 'EV Batteries',          'auto--ev-batteries',          30)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'auto--ev';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'EV Motors',          'auto--ev-motors',        10),
    (cat, 'Controllers',        'auto--ev-controllers',   20),
    (cat, 'Battery Packs',      'auto--ev-battery-packs', 30),
    (cat, 'EV Chargers',        'auto--ev-chargers',      40),
    (cat, 'EV Accessories',     'auto--ev-accessories',   50)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  -- =========================================================================
  -- 7. INDUSTRIAL & ENGINEERING sub-categories
  -- =========================================================================

  select id into cat from categories where slug = 'ind--machinery';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'CNC Machines',          'ind--cnc-machines',         10),
    (cat, 'Lathe Machines',        'ind--lathe-machines',       20),
    (cat, 'Milling Machines',      'ind--milling-machines',     30),
    (cat, 'Drilling Machines',     'ind--drilling-machines',    40),
    (cat, 'Cutting Machines',      'ind--cutting-machines',     50),
    (cat, 'Grinding Machines',     'ind--grinding-machines',    60),
    (cat, 'Manufacturing Machinery','ind--mfg-machinery',       70)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'ind--process-machinery';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Food Processing Machinery',   'ind--food-proc-machinery',   10),
    (cat, 'Textile Machinery',           'ind--textile-machinery',     20),
    (cat, 'Printing Machinery',          'ind--printing-machinery',    30),
    (cat, 'Packaging Machinery',         'ind--packaging-machinery',   40),
    (cat, 'Pharmaceutical Machinery',    'ind--pharma-machinery',      50),
    (cat, 'Plastic Machinery',           'ind--plastic-machinery',     60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'ind--industrial-equipment';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Pumps',                   'ind--pumps',               10),
    (cat, 'Compressors',             'ind--compressors',         20),
    (cat, 'Boilers',                 'ind--boilers',             30),
    (cat, 'Conveyors',               'ind--conveyors',           40),
    (cat, 'Cranes',                  'ind--cranes',              50),
    (cat, 'Hoists',                  'ind--hoists',              60),
    (cat, 'Material Handling Equipment','ind--material-handling', 70)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'ind--tools';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Hand Tools',       'ind--hand-tools',       10),
    (cat, 'Power Tools',      'ind--power-tools',      20),
    (cat, 'Cutting Tools',    'ind--cutting-tools',    30),
    (cat, 'Measuring Tools',  'ind--measuring-tools',  40),
    (cat, 'Workshop Tools',   'ind--workshop-tools',   50)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'ind--engineering-components';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Bearings',             'ind--bearings',           10),
    (cat, 'Gears',                'ind--gears',              20),
    (cat, 'Shafts',               'ind--shafts',             30),
    (cat, 'Springs',              'ind--springs',            40),
    (cat, 'Fasteners',            'ind--fasteners',          50),
    (cat, 'Couplings',            'ind--couplings',          60),
    (cat, 'Valves',               'ind--valves',             70),
    (cat, 'Precision Components', 'ind--precision-components',80)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'ind--automation';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'PLC',               'ind--plc',               10),
    (cat, 'HMI',               'ind--hmi',               20),
    (cat, 'Industrial Sensors','ind--ind-sensors',       30),
    (cat, 'Servo Motors',      'ind--servo-motors',      40),
    (cat, 'Drives',            'ind--drives',            50),
    (cat, 'Robotics',          'ind--robotics',          60),
    (cat, 'Automation Systems','ind--automation-systems', 70)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'ind--fabrication';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Sheet Metal',           'ind--sheet-metal',     10),
    (cat, 'CNC Components',        'ind--cnc-components',  20),
    (cat, 'Castings',              'ind--castings',        30),
    (cat, 'Forgings',              'ind--forgings',        40),
    (cat, 'Welding Products',      'ind--welding-products',50),
    (cat, 'Fabricated Components', 'ind--fab-components',  60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  -- =========================================================================
  -- 8. CHEMICALS & MATERIALS sub-categories
  -- =========================================================================

  select id into cat from categories where slug = 'chem--industrial-chemicals';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Acids',               'chem--acids',               10),
    (cat, 'Alkalis',             'chem--alkalis',             20),
    (cat, 'Solvents',            'chem--solvents',            30),
    (cat, 'Industrial Gases',    'chem--industrial-gases',    40),
    (cat, 'Specialty Chemicals', 'chem--specialty-chemicals', 50)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'chem--plastics-polymers';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Plastic Granules',    'chem--plastic-granules',  10),
    (cat, 'PVC',                 'chem--pvc',               20),
    (cat, 'PP',                  'chem--pp',                30),
    (cat, 'PE',                  'chem--pe',                40),
    (cat, 'PET',                 'chem--pet',               50),
    (cat, 'Engineering Plastics','chem--engineering-plastics',60),
    (cat, 'Polymer Compounds',   'chem--polymer-compounds', 70)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'chem--rubber';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Natural Rubber',          'chem--natural-rubber',       10),
    (cat, 'Synthetic Rubber',        'chem--synthetic-rubber',     20),
    (cat, 'Rubber Sheets',           'chem--rubber-sheets',        30),
    (cat, 'Rubber Components',       'chem--rubber-components',    40),
    (cat, 'Industrial Rubber Products','chem--industrial-rubber',  50)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'chem--adhesives-sealants';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Industrial Adhesives',   'chem--industrial-adhesives',  10),
    (cat, 'Construction Adhesives', 'chem--construction-adhesives',20),
    (cat, 'Sealants',               'chem--sealants',              30),
    (cat, 'Epoxy',                  'chem--epoxy',                 40),
    (cat, 'Resins',                 'chem--resins',                50)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'chem--paints-coatings-inks';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Industrial Paints',   'chem--industrial-paints',    10),
    (cat, 'Powder Coatings',     'chem--powder-coatings',      20),
    (cat, 'Protective Coatings', 'chem--protective-coatings',  30),
    (cat, 'Printing Inks',       'chem--printing-inks',        40),
    (cat, 'Pigments',            'chem--pigments',             50)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'chem--industrial-materials';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Water Treatment Chemicals','chem--water-treatment',    10),
    (cat, 'Textile Chemicals',        'chem--textile-chemicals',  20),
    (cat, 'Construction Chemicals',   'chem--const-chemicals',    30),
    (cat, 'Dyes',                     'chem--dyes',               40),
    (cat, 'Industrial Additives',     'chem--industrial-additives',50)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  -- =========================================================================
  -- 9. HEALTHCARE & WELLNESS sub-categories
  -- =========================================================================

  select id into cat from categories where slug = 'health--pharma';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Generic Medicines',        'health--generic-medicines',  10),
    (cat, 'OTC Products',             'health--otc',                20),
    (cat, 'Pharmaceutical Ingredients','health--pharma-ingredients',30),
    (cat, 'Ayurvedic Products',       'health--ayurvedic',          40),
    (cat, 'Herbal Products',          'health--herbal',             50)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'health--medical-devices';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Diagnostic Equipment',   'health--diagnostic-equipment',  10),
    (cat, 'Monitoring Equipment',   'health--monitoring-equipment',  20),
    (cat, 'Hospital Equipment',     'health--hospital-equipment',    30),
    (cat, 'Medical Instruments',    'health--medical-instruments',   40)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'health--surgical-consumables';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Surgical Instruments', 'health--surgical-instruments', 10),
    (cat, 'Syringes',             'health--syringes',             20),
    (cat, 'Gloves',               'health--gloves',               30),
    (cat, 'Masks',                'health--masks',                40),
    (cat, 'Dressings',            'health--dressings',            50),
    (cat, 'Medical Disposables',  'health--medical-disposables',  60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'health--laboratory';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Lab Equipment',          'health--lab-equipment',        10),
    (cat, 'Lab Glassware',          'health--lab-glassware',        20),
    (cat, 'Testing Equipment',      'health--testing-equipment',    30),
    (cat, 'Diagnostic Kits',        'health--diagnostic-kits',      40),
    (cat, 'Laboratory Consumables', 'health--lab-consumables',      50)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'health--dental';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Dental Instruments',  'health--dental-instruments', 10),
    (cat, 'Dental Equipment',    'health--dental-equipment',   20),
    (cat, 'Dental Consumables',  'health--dental-consumables', 30)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'health--wellness';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Personal Wellness Products','health--personal-wellness', 10),
    (cat, 'Fitness & Recovery',        'health--fitness-recovery',  20),
    (cat, 'Ayurvedic Wellness',        'health--ayurvedic-wellness',30),
    (cat, 'Health Accessories',        'health--health-acc',        40)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  -- =========================================================================
  -- 10. HOME & LIVING sub-categories
  -- =========================================================================

  select id into cat from categories where slug = 'home--furniture';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Beds',             'home--beds',             10),
    (cat, 'Sofas',            'home--sofas',            20),
    (cat, 'Tables',           'home--tables',           30),
    (cat, 'Chairs',           'home--chairs',           40),
    (cat, 'Wardrobes',        'home--wardrobes',        50),
    (cat, 'Cabinets',         'home--cabinets',         60),
    (cat, 'Office Furniture', 'home--office-furniture', 70),
    (cat, 'Modular Furniture','home--modular-furniture',80)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'home--kitchen';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Cookware',         'home--cookware',         10),
    (cat, 'Kitchenware',      'home--kitchenware',      20),
    (cat, 'Utensils',         'home--utensils',         30),
    (cat, 'Containers',       'home--containers',       40),
    (cat, 'Cutlery',          'home--cutlery',          50),
    (cat, 'Kitchen Tools',    'home--kitchen-tools',    60),
    (cat, 'Storage Products', 'home--storage-products', 70)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'home--decor';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Wall Décor',           'home--wall-decor',          10),
    (cat, 'Mirrors',              'home--mirrors',             20),
    (cat, 'Clocks',               'home--clocks',              30),
    (cat, 'Decorative Items',     'home--decorative-items',    40),
    (cat, 'Artificial Flowers',   'home--artificial-flowers',  50),
    (cat, 'Candles',              'home--candles',             60),
    (cat, 'Decorative Accessories','home--decorative-acc',     70)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'home--furnishing';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Bedsheets',  'home--bedsheets',  10),
    (cat, 'Curtains',   'home--curtains',   20),
    (cat, 'Cushions',   'home--cushions',   30),
    (cat, 'Blankets',   'home--blankets',   40),
    (cat, 'Carpets',    'home--carpets',    50),
    (cat, 'Rugs',       'home--rugs',       60),
    (cat, 'Towels',     'home--towels',     70)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'home--improvement';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Flooring',          'home--flooring',          10),
    (cat, 'Wallpapers',        'home--wallpapers',        20),
    (cat, 'Interior Panels',   'home--interior-panels',   30),
    (cat, 'Home Organizers',   'home--home-organizers',   40),
    (cat, 'Storage Solutions', 'home--storage-solutions', 50)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  -- =========================================================================
  -- 11. CONSUMER & GENERAL GOODS sub-categories
  -- =========================================================================

  select id into cat from categories where slug = 'cons--toys-games';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Educational Toys',  'cons--educational-toys',  10),
    (cat, 'Plastic Toys',      'cons--plastic-toys',      20),
    (cat, 'Electronic Toys',   'cons--electronic-toys',   30),
    (cat, 'Dolls',             'cons--dolls',             40),
    (cat, 'Board Games',       'cons--board-games',       50),
    (cat, 'Outdoor Toys',      'cons--outdoor-toys',      60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'cons--sports-fitness';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Cricket Equipment',      'cons--cricket-equipment',    10),
    (cat, 'Football Equipment',     'cons--football-equipment',   20),
    (cat, 'Gym Equipment',          'cons--gym-equipment',        30),
    (cat, 'Yoga Products',          'cons--yoga-products',        40),
    (cat, 'Fitness Accessories',    'cons--fitness-accessories',  50),
    (cat, 'Outdoor Sports Equipment','cons--outdoor-sports',      60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'cons--stationery-office';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Pens',          'cons--pens',           10),
    (cat, 'Pencils',       'cons--pencils',        20),
    (cat, 'Notebooks',     'cons--notebooks',      30),
    (cat, 'Files & Folders','cons--files-folders', 40),
    (cat, 'School Supplies','cons--school-supplies',50),
    (cat, 'Art & Craft',   'cons--art-craft',      60),
    (cat, 'Office Supplies','cons--office-supplies',70)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'cons--packaging';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Corrugated Boxes',   'cons--corrugated-boxes',   10),
    (cat, 'Cartons',            'cons--cartons',            20),
    (cat, 'Plastic Packaging',  'cons--plastic-packaging',  30),
    (cat, 'Bottles',            'cons--bottles',            40),
    (cat, 'Jars',               'cons--jars',               50),
    (cat, 'Flexible Packaging', 'cons--flexible-packaging', 60),
    (cat, 'Labels',             'cons--labels',             70),
    (cat, 'Tapes',              'cons--tapes',              80)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'cons--gifts-merchandise';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Corporate Gifts',      'cons--corporate-gifts',     10),
    (cat, 'Promotional Products', 'cons--promotional-products',20),
    (cat, 'Party Supplies',       'cons--party-supplies',      30),
    (cat, 'Travel Accessories',   'cons--travel-accessories',  40),
    (cat, 'Utility Products',     'cons--utility-products',    50),
    (cat, 'Seasonal Products',    'cons--seasonal-products',   60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  -- =========================================================================
  -- 12. ENERGY & INFRASTRUCTURE sub-categories
  -- =========================================================================

  select id into cat from categories where slug = 'energy--solar';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Solar Panels',         'energy--solar-panels',       10),
    (cat, 'Solar Inverters',      'energy--solar-inverters',    20),
    (cat, 'Solar Structures',     'energy--solar-structures',   30),
    (cat, 'Solar Batteries',      'energy--solar-batteries',    40),
    (cat, 'Solar Water Heaters',  'energy--solar-water-heaters',50),
    (cat, 'Solar Accessories',    'energy--solar-accessories',  60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'energy--storage';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Lithium Batteries',      'energy--lithium-batteries',    10),
    (cat, 'Battery Packs',          'energy--battery-packs',        20),
    (cat, 'Battery Cells',          'energy--battery-cells',        30),
    (cat, 'Energy Storage Systems', 'energy--ess',                  40),
    (cat, 'Industrial Battery Systems','energy--industrial-battery', 50)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'energy--power-infra';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Power Transformers',     'energy--power-transformers',   10),
    (cat, 'Power Distribution',     'energy--power-distribution',   20),
    (cat, 'High Voltage Equipment', 'energy--high-voltage',         30),
    (cat, 'Power Cables',           'energy--power-cables',         40),
    (cat, 'Substation Equipment',   'energy--substation-equipment', 50)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'energy--renewable';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Solar Equipment',          'energy--solar-equipment',      10),
    (cat, 'Wind Components',          'energy--wind-components',      20),
    (cat, 'Bioenergy Equipment',      'energy--bioenergy-equipment',  30),
    (cat, 'Renewable Energy Systems', 'energy--re-systems',           40)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'energy--heavy-infra';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Heavy Equipment',         'energy--heavy-equipment',       10),
    (cat, 'Infrastructure Machinery','energy--infra-machinery',       20),
    (cat, 'Industrial Structures',   'energy--industrial-structures', 30),
    (cat, 'Railway Equipment',       'energy--railway-equipment',     40),
    (cat, 'Metro Components',        'energy--metro-components',      50),
    (cat, 'Marine Equipment',        'energy--marine-equipment',      60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

  select id into cat from categories where slug = 'energy--aerospace-defence';
  insert into categories (parent_id, name, slug, sort_order) values
    (cat, 'Aerospace Components',        'energy--aerospace-components',    10),
    (cat, 'Aircraft Components',         'energy--aircraft-components',     20),
    (cat, 'Drone/UAV Components',        'energy--drone-uav',               30),
    (cat, 'Aviation Equipment',          'energy--aviation-equipment',      40),
    (cat, 'Defence Manufacturing Components','energy--defence-mfg',         50),
    (cat, 'Precision Defence Components','energy--precision-defence',       60)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;

end $$;

-- ============================================================================
-- PART 7: EXTENDED BUSINESS TYPES (PRD Supplier & Buyer Classification)
-- ============================================================================

insert into business_types (code, name, description, sort_order) values
  ('oem_manufacturer',       'OEM Manufacturer',        'Manufactures products for other brands',                  15),
  ('odm_manufacturer',       'ODM Manufacturer',        'Designs and manufactures products for other brands',       17),
  ('contract_manufacturer',  'Contract Manufacturer',   'Manufactures based on buyer specifications',               19),
  ('private_label_manufacturer','Private Label Manufacturer','Manufactures private label products for buyers',      21)
on conflict (code) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

-- ============================================================================
-- PART 8: INDEXES for new product columns
-- ============================================================================

create index if not exists idx_products_supplier_type  on products(supplier_type) where deleted_at is null;
create index if not exists idx_products_location_state on products(mfg_location_state) where deleted_at is null;
create index if not exists idx_products_lead_time      on products(lead_time_days) where deleted_at is null;
create index if not exists idx_products_sample_avail   on products(sample_available) where sample_available = true and deleted_at is null;
create index if not exists idx_products_oem_avail      on products(oem_available) where oem_available = true and deleted_at is null;

-- ============================================================================
-- END OF MIGRATION 004
-- ============================================================================
