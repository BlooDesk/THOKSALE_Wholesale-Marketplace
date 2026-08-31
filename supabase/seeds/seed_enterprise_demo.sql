-- ============================================================================
-- ThokSale — Enterprise Demo Seed (SQL portion)
-- ============================================================================
-- Scope   : Development & UI-testing dataset (DO NOT run in production).
-- Policy  : 100% idempotent (uses ON CONFLICT DO NOTHING / DO UPDATE).
-- Handles : Additive tables (wishlist / recently_viewed) + 40 brands +
--           per-category attribute_definitions used by dynamic product form.
--
-- Companion : /app/supabase/seeds/seed_enterprise_demo.ts
--   The TS script inserts auth users, profiles, company_profiles, products,
--   product_attributes, orders, RFQs, notifications, cart items, wishlist and
--   recently_viewed rows.  Run the SQL first, then the TS.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. ADDITIVE TABLES  (wishlists + recently_viewed)
-- ---------------------------------------------------------------------------
create table if not exists public.wishlists (
    id           uuid primary key default gen_random_uuid(),
    buyer_id     uuid not null references public.profiles(id) on delete cascade,
    product_id   uuid not null references public.products(id) on delete cascade,
    notes        text,
    created_at   timestamptz not null default timezone('utc', now()),
    unique (buyer_id, product_id)
);
create index if not exists idx_wishlists_buyer   on public.wishlists(buyer_id);
create index if not exists idx_wishlists_product on public.wishlists(product_id);

create table if not exists public.recently_viewed (
    id           uuid primary key default gen_random_uuid(),
    buyer_id     uuid not null references public.profiles(id) on delete cascade,
    product_id   uuid not null references public.products(id) on delete cascade,
    viewed_at    timestamptz not null default timezone('utc', now()),
    unique (buyer_id, product_id)
);
create index if not exists idx_rv_buyer_viewed on public.recently_viewed(buyer_id, viewed_at desc);

-- RLS: buyers can read/write their own rows only
alter table public.wishlists       enable row level security;
alter table public.recently_viewed enable row level security;

drop policy if exists wishlists_owner on public.wishlists;
create policy wishlists_owner on public.wishlists
    for all using (buyer_id = auth.uid()) with check (buyer_id = auth.uid());

drop policy if exists rv_owner on public.recently_viewed;
create policy rv_owner on public.recently_viewed
    for all using (buyer_id = auth.uid()) with check (buyer_id = auth.uid());


-- ---------------------------------------------------------------------------
-- 2. BRANDS (40 total — mix of global + fictional Indian wholesale)
-- ---------------------------------------------------------------------------
-- Global brands (brand_type = 'global') — no seller_id
insert into public.brands (name, slug, brand_type, country, is_active, is_verified, description) values
    ('Samsung',          'samsung',          'global', 'South Korea', true, true, 'Global electronics and appliances leader'),
    ('LG',               'lg',               'global', 'South Korea', true, true, 'Home appliances and consumer electronics'),
    ('Sony',             'sony',             'global', 'Japan',       true, true, 'Consumer electronics and imaging'),
    ('Philips',          'philips',          'global', 'Netherlands', true, true, 'Lighting, appliances and healthcare'),
    ('Bosch',            'bosch',            'global', 'Germany',     true, true, 'Power tools, appliances and automotive'),
    ('Panasonic',        'panasonic',        'global', 'Japan',       true, true, 'Electronics and battery'),
    ('Whirlpool',        'whirlpool',        'global', 'USA',         true, true, 'Home appliances'),
    ('Havells',          'havells',          'global', 'India',       true, true, 'Electricals, fans, lighting'),
    ('Anchor',           'anchor',           'global', 'India',       true, true, 'Electrical switches & wiring accessories'),
    ('Legrand',          'legrand',          'global', 'France',      true, true, 'Electrical & digital infrastructure'),
    ('Schneider',        'schneider',        'global', 'France',      true, true, 'Energy management & automation'),
    ('Godrej',           'godrej',           'global', 'India',       true, true, 'Appliances, furniture, security'),
    ('Bajaj',            'bajaj',            'global', 'India',       true, true, 'Appliances, lighting, EVs'),
    ('Prestige',         'prestige',         'global', 'India',       true, true, 'Kitchenware & small appliances'),
    ('Cello',            'cello',            'global', 'India',       true, true, 'Housewares and kitchenware'),
    ('Milton',           'milton',           'global', 'India',       true, true, 'Insulated ware and hydration'),
    ('Asian Paints',     'asian-paints',     'global', 'India',       true, true, 'Decorative paints and coatings'),
    ('Berger Paints',    'berger-paints',    'global', 'India',       true, true, 'Paints and industrial coatings'),
    ('JK Cement',        'jk-cement',        'global', 'India',       true, true, 'Grey and white cement'),
    ('UltraTech',        'ultratech',        'global', 'India',       true, true, 'India''s largest cement producer'),
    ('Pidilite',         'pidilite',         'global', 'India',       true, true, 'Adhesives, sealants & construction chemicals'),
    ('Amul',             'amul',             'global', 'India',       true, true, 'Dairy and food products'),
    ('Britannia',        'britannia',        'global', 'India',       true, true, 'Biscuits, bakery, dairy'),
    ('Parle',            'parle',            'global', 'India',       true, true, 'Biscuits, confectionery, snacks'),
    ('Tata Consumer',    'tata-consumer',    'global', 'India',       true, true, 'Tea, coffee, staples'),
    ('Dabur',            'dabur',            'global', 'India',       true, true, 'Ayurveda, healthcare, FMCG')
on conflict do nothing;

-- Fictional Indian wholesale / OEM / private-label brands (14)
insert into public.brands (name, slug, brand_type, country, is_active, is_verified, description) values
    ('Orion Mills',        'orion-mills',        'oem',           'India', true, true, 'Textile manufacturing brand — fabrics, yarns, uniforms'),
    ('BhaskarMetals',      'bhaskar-metals',     'oem',           'India', true, true, 'Steel fabrication and hardware components'),
    ('GreenSpice',         'greenspice',         'private_label', 'India', true, true, 'Spices, staples and food essentials'),
    ('VoltaCore',          'voltacore',          'oem',           'India', true, true, 'Consumer electronics OEM & IT accessories'),
    ('TitanAuto',          'titan-auto',         'oem',           'India', true, true, 'Auto components & aftermarket parts'),
    ('BharatCem',          'bharatcem',          'private_label', 'India', true, true, 'Cement, RMC and dry mix products'),
    ('IndoMech',           'indomech',           'oem',           'India', true, true, 'Industrial machinery and spares'),
    ('HarvestGold',        'harvest-gold',       'private_label', 'India', true, true, 'Farm inputs, seeds and agri equipment'),
    ('MediPure',           'medipure',           'private_label', 'India', true, true, 'Medical devices and pharma distribution'),
    ('Kanchan Home',       'kanchan-home',       'private_label', 'India', true, true, 'Furniture, decor and kitchenware'),
    ('ProPack',            'propack',            'oem',           'India', true, true, 'Packaging, cartons and printing solutions'),
    ('ChemBharat',         'chembharat',         'oem',           'India', true, true, 'Industrial chemicals and raw materials'),
    ('OfficeMax India',    'officemax-india',    'private_label', 'India', true, true, 'Business supplies, stationery and office gear'),
    ('SwadeshiFab',        'swadeshi-fab',       'private_label', 'India', true, true, 'Handloom and Indian craft textiles')
on conflict do nothing;


-- ---------------------------------------------------------------------------
-- 3. ATTRIBUTE DEFINITIONS
--    Populate a realistic per-category attribute template so the seller
--    product-form AttributesEditor has fields to render, and the TS seed
--    can populate product_attributes for each product.
-- ---------------------------------------------------------------------------
-- Helper CTE approach: we look up category ids by slug (from seed_categories.sql
-- + backfilled subcategories). Every insert is wrapped so it silently skips if
-- the category slug doesn't exist in this DB.

-- ---- Fashion / Apparel ----------------------------------------------------
insert into public.attribute_definitions (category_id, key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
select c.id, x.key, x.label, x.attr_type, x.options::jsonb, x.unit, x.is_required, x.is_filterable, x.sort_order
from (values
    ('fabric',       'Fabric',        'select',       '[{"value":"cotton","label":"Cotton"},{"value":"linen","label":"Linen"},{"value":"polyester","label":"Polyester"},{"value":"silk","label":"Silk"},{"value":"denim","label":"Denim"},{"value":"wool","label":"Wool"}]', null,     true,  true, 10),
    ('size',         'Size',          'multi_select', '[{"value":"XS","label":"XS"},{"value":"S","label":"S"},{"value":"M","label":"M"},{"value":"L","label":"L"},{"value":"XL","label":"XL"},{"value":"XXL","label":"XXL"}]', null, true, true, 20),
    ('color',        'Color',         'color',        null,             null,     false, true, 30),
    ('gsm',          'Fabric GSM',    'number',       null,             'g/m²',  false, true, 40),
    ('pattern',      'Pattern',       'select',       '[{"value":"solid","label":"Solid"},{"value":"striped","label":"Striped"},{"value":"printed","label":"Printed"},{"value":"checked","label":"Checked"}]', null, false, true, 50)
) x(key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
join public.categories c on c.slug in ('apparel-textiles','apparel','clothing','fabrics-textiles','fabrics','textiles') and c.deleted_at is null
on conflict (category_id, key) do nothing;

-- ---- FMCG / Food & Beverages ---------------------------------------------
insert into public.attribute_definitions (category_id, key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
select c.id, x.key, x.label, x.attr_type, x.options::jsonb, x.unit, x.is_required, x.is_filterable, x.sort_order
from (values
    ('pack_size',    'Pack Size',     'number', null, 'g',   true,  true, 10),
    ('shelf_life',   'Shelf Life',    'number', null, 'days',true,  false,20),
    ('veg_nonveg',   'Veg / Non-Veg', 'select', '[{"value":"veg","label":"Vegetarian"},{"value":"nonveg","label":"Non-Vegetarian"},{"value":"vegan","label":"Vegan"}]', null, true, true, 30),
    ('fssai_no',     'FSSAI License', 'text',   null, null,  true,  false,40),
    ('storage',      'Storage',       'select', '[{"value":"ambient","label":"Ambient"},{"value":"chilled","label":"Chilled"},{"value":"frozen","label":"Frozen"}]', null, false, true, 50)
) x(key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
join public.categories c on c.slug in ('food-beverages','fmcg','grocery','beverages','snacks','staples') and c.deleted_at is null
on conflict (category_id, key) do nothing;

-- ---- Electronics ----------------------------------------------------------
insert into public.attribute_definitions (category_id, key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
select c.id, x.key, x.label, x.attr_type, x.options::jsonb, x.unit, x.is_required, x.is_filterable, x.sort_order
from (values
    ('voltage',      'Voltage',       'number', null, 'V',    true,  true, 10),
    ('warranty',     'Warranty',      'number', null, 'months', true, true, 20),
    ('power',        'Power Rating',  'number', null, 'W',    false, true, 30),
    ('connectivity', 'Connectivity',  'multi_select', '[{"value":"wifi","label":"Wi-Fi"},{"value":"bt","label":"Bluetooth"},{"value":"usb","label":"USB"},{"value":"hdmi","label":"HDMI"},{"value":"ethernet","label":"Ethernet"}]', null, false, true, 40),
    ('display_size', 'Display Size',  'number', null, 'inch', false, true, 50)
) x(key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
join public.categories c on c.slug in ('electronics-appliances','mobile-phones-accessories','tvs-audio','laptops-computing','home-appliances','electrical','electronics') and c.deleted_at is null
on conflict (category_id, key) do nothing;

-- ---- Automobile -----------------------------------------------------------
insert into public.attribute_definitions (category_id, key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
select c.id, x.key, x.label, x.attr_type, x.options::jsonb, x.unit, x.is_required, x.is_filterable, x.sort_order
from (values
    ('vehicle_type', 'Vehicle Type',  'select', '[{"value":"2w","label":"2-Wheeler"},{"value":"3w","label":"3-Wheeler"},{"value":"4w","label":"4-Wheeler"},{"value":"cv","label":"Commercial"},{"value":"ev","label":"EV"}]', null, true, true, 10),
    ('oem_ref',      'OEM Reference', 'text',   null, null,  false, true, 20),
    ('material',     'Material',      'text',   null, null,  false, true, 30),
    ('warranty_km',  'Warranty',      'number', null, 'km',  false, true, 40)
) x(key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
join public.categories c on c.slug in ('automotive','auto-parts','vehicles','tyres','ev-supply-chain') and c.deleted_at is null
on conflict (category_id, key) do nothing;

-- ---- Building Materials --------------------------------------------------
insert into public.attribute_definitions (category_id, key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
select c.id, x.key, x.label, x.attr_type, x.options::jsonb, x.unit, x.is_required, x.is_filterable, x.sort_order
from (values
    ('grade',        'Grade',         'text',   null, null,  true,  true, 10),
    ('bag_weight',   'Bag Weight',    'number', null, 'kg',  true,  true, 20),
    ('bs_code',      'BS Code',       'text',   null, null,  false, false, 30),
    ('is_certified', 'BIS Certified', 'boolean',null, null,  false, true, 40)
) x(key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
join public.categories c on c.slug in ('construction','building-materials','cement','steel','tiles','sanitaryware','hardware') and c.deleted_at is null
on conflict (category_id, key) do nothing;

-- ---- Industrial Machinery ------------------------------------------------
insert into public.attribute_definitions (category_id, key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
select c.id, x.key, x.label, x.attr_type, x.options::jsonb, x.unit, x.is_required, x.is_filterable, x.sort_order
from (values
    ('motor_power',  'Motor Power',   'number', null, 'kW',  true,  true, 10),
    ('phase',        'Phase',         'select', '[{"value":"single","label":"Single-Phase"},{"value":"three","label":"3-Phase"}]', null, true, true, 20),
    ('automation',   'Automation',    'select', '[{"value":"manual","label":"Manual"},{"value":"semi","label":"Semi-Auto"},{"value":"cnc","label":"CNC / Fully Auto"}]', null, false, true, 30),
    ('capacity',     'Capacity',      'number', null, 'units/hr', false, true, 40)
) x(key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
join public.categories c on c.slug in ('industrial-machinery','machine-tools','cnc','pumps-motors') and c.deleted_at is null
on conflict (category_id, key) do nothing;

-- ---- Agriculture ----------------------------------------------------------
insert into public.attribute_definitions (category_id, key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
select c.id, x.key, x.label, x.attr_type, x.options::jsonb, x.unit, x.is_required, x.is_filterable, x.sort_order
from (values
    ('input_type',   'Input Type',    'select', '[{"value":"seed","label":"Seed"},{"value":"fertilizer","label":"Fertilizer"},{"value":"pesticide","label":"Pesticide"},{"value":"equipment","label":"Equipment"}]', null, true, true, 10),
    ('organic',      'Organic Certified', 'boolean', null, null, false, true, 20),
    ('season',       'Growing Season','select', '[{"value":"kharif","label":"Kharif"},{"value":"rabi","label":"Rabi"},{"value":"zaid","label":"Zaid"},{"value":"all","label":"All-season"}]', null, false, true, 30)
) x(key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
join public.categories c on c.slug in ('agriculture','agri','farm-supplies','seeds','fertilizers') and c.deleted_at is null
on conflict (category_id, key) do nothing;

-- ---- Healthcare -----------------------------------------------------------
insert into public.attribute_definitions (category_id, key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
select c.id, x.key, x.label, x.attr_type, x.options::jsonb, x.unit, x.is_required, x.is_filterable, x.sort_order
from (values
    ('device_class', 'Device Class',  'select', '[{"value":"A","label":"Class A"},{"value":"B","label":"Class B"},{"value":"C","label":"Class C"},{"value":"D","label":"Class D"}]', null, false, true, 10),
    ('sterile',      'Sterile',       'boolean', null, null, false, true, 20),
    ('license_no',   'Drug/Device License', 'text', null, null, true, false, 30),
    ('use_type',     'Single/Multi-use', 'select', '[{"value":"single","label":"Single-use"},{"value":"multi","label":"Multi-use"}]', null, false, true, 40)
) x(key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
join public.categories c on c.slug in ('healthcare','medical-devices','pharmaceuticals','surgical','diagnostics') and c.deleted_at is null
on conflict (category_id, key) do nothing;

-- ---- Home & Furniture ----------------------------------------------------
insert into public.attribute_definitions (category_id, key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
select c.id, x.key, x.label, x.attr_type, x.options::jsonb, x.unit, x.is_required, x.is_filterable, x.sort_order
from (values
    ('material',     'Material',      'select', '[{"value":"wood","label":"Wood"},{"value":"metal","label":"Metal"},{"value":"plastic","label":"Plastic"},{"value":"glass","label":"Glass"},{"value":"engineered","label":"Engineered Wood"}]', null, true, true, 10),
    ('finish',       'Finish',        'text',   null, null, false, true, 20),
    ('assembly',     'Assembly',      'select', '[{"value":"pre","label":"Pre-assembled"},{"value":"knockdown","label":"Knock-down"},{"value":"diy","label":"DIY"}]', null, false, true, 30),
    ('seat_capacity','Seat Capacity', 'number', null, 'persons', false, true, 40)
) x(key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
join public.categories c on c.slug in ('home-furniture','furniture','home-decor','kitchen-dining','home-kitchen') and c.deleted_at is null
on conflict (category_id, key) do nothing;

-- ---- Packaging ------------------------------------------------------------
insert into public.attribute_definitions (category_id, key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
select c.id, x.key, x.label, x.attr_type, x.options::jsonb, x.unit, x.is_required, x.is_filterable, x.sort_order
from (values
    ('material',     'Material',      'select', '[{"value":"corrugated","label":"Corrugated"},{"value":"pp","label":"Polypropylene"},{"value":"pe","label":"Polyethylene"},{"value":"paper","label":"Paper"},{"value":"foil","label":"Foil"}]', null, true, true, 10),
    ('ply',          'Ply / Layers',  'number', null, 'ply', false, true, 20),
    ('food_grade',   'Food Grade',    'boolean',null, null, false, true, 30),
    ('printable',    'Printable',     'boolean',null, null, false, true, 40)
) x(key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
join public.categories c on c.slug in ('packaging','printing','packaging-printing','cartons','labels') and c.deleted_at is null
on conflict (category_id, key) do nothing;

-- ---- Chemicals ------------------------------------------------------------
insert into public.attribute_definitions (category_id, key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
select c.id, x.key, x.label, x.attr_type, x.options::jsonb, x.unit, x.is_required, x.is_filterable, x.sort_order
from (values
    ('form',         'Form',          'select', '[{"value":"powder","label":"Powder"},{"value":"liquid","label":"Liquid"},{"value":"granule","label":"Granule"},{"value":"paste","label":"Paste"}]', null, true, true, 10),
    ('purity',       'Purity',        'number', null, '%', false, true, 20),
    ('cas_number',   'CAS Number',    'text',   null, null, false, false, 30),
    ('hazard_class', 'Hazard Class',  'text',   null, null, false, true, 40)
) x(key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
join public.categories c on c.slug in ('chemicals','raw-materials','chemicals-raw-materials','polymers','dyes','adhesives') and c.deleted_at is null
on conflict (category_id, key) do nothing;

-- ---- Business Supplies ---------------------------------------------------
insert into public.attribute_definitions (category_id, key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
select c.id, x.key, x.label, x.attr_type, x.options::jsonb, x.unit, x.is_required, x.is_filterable, x.sort_order
from (values
    ('use_type',     'Use Type',      'select', '[{"value":"office","label":"Office"},{"value":"retail","label":"Retail"},{"value":"school","label":"School"}]', null, true, true, 10),
    ('material',     'Material',      'text',   null, null, false, true, 20),
    ('brandable',    'Brandable',     'boolean',null, null, false, true, 30)
) x(key, label, attr_type, options, unit, is_required, is_filterable, sort_order)
join public.categories c on c.slug in ('business-supplies','stationery','office','retail-supplies') and c.deleted_at is null
on conflict (category_id, key) do nothing;


-- ============================================================================
-- END OF SQL SEED
-- Next step:
--   node --loader ts-node/esm supabase/seeds/seed_enterprise_demo.ts
-- ============================================================================
