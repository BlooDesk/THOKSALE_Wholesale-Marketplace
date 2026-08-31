-- =====================================================================
-- ThokSale - Seed Categories (B2B Wholesale)
-- =====================================================================
-- Top-level categories + representative sub-categories.
-- Idempotent via ON CONFLICT (slug).
-- =====================================================================

-- Top-level parents ----------------------------------------------------
insert into public.categories (id, parent_id, name, slug, description, sort_order) values
    ('11111111-1111-1111-1111-111111111001', null, 'Electronics & Appliances', 'electronics-appliances', 'Consumer electronics, home appliances, components', 1),
    ('11111111-1111-1111-1111-111111111002', null, 'Apparel & Textiles',        'apparel-textiles',        'Clothing, fabrics, garments, accessories',       2),
    ('11111111-1111-1111-1111-111111111003', null, 'Food & Beverages',          'food-beverages',          'Packaged food, beverages, groceries',            3),
    ('11111111-1111-1111-1111-111111111004', null, 'Industrial & Machinery',    'industrial-machinery',    'Industrial equipment, tools, machinery',         4),
    ('11111111-1111-1111-1111-111111111005', null, 'Home & Furniture',          'home-furniture',          'Furniture, home decor, kitchenware',             5),
    ('11111111-1111-1111-1111-111111111006', null, 'Health & Beauty',           'health-beauty',           'Personal care, cosmetics, wellness',             6),
    ('11111111-1111-1111-1111-111111111007', null, 'Construction & Building',   'construction-building',   'Construction materials, hardware, fixtures',     7),
    ('11111111-1111-1111-1111-111111111008', null, 'Automotive & Parts',        'automotive-parts',        'Vehicles, spare parts, accessories',             8),
    ('11111111-1111-1111-1111-111111111009', null, 'Agriculture',               'agriculture',             'Seeds, fertilisers, farming equipment',          9),
    ('11111111-1111-1111-1111-111111111010', null, 'Packaging & Printing',      'packaging-printing',      'Boxes, bags, labels, printing supplies',        10),
    ('11111111-1111-1111-1111-111111111011', null, 'Chemicals & Plastics',      'chemicals-plastics',      'Industrial chemicals, polymers, raw materials', 11),
    ('11111111-1111-1111-1111-111111111012', null, 'Office & Stationery',       'office-stationery',       'Office supplies, stationery, IT peripherals',   12)
on conflict (slug) do nothing;

-- Sub-categories ------------------------------------------------------------
insert into public.categories (parent_id, name, slug, description, sort_order) values
    -- Electronics
    ('11111111-1111-1111-1111-111111111001', 'Mobile Phones & Accessories', 'mobile-phones-accessories', 'Smartphones, chargers, cases', 1),
    ('11111111-1111-1111-1111-111111111001', 'Home Appliances',             'home-appliances',           'Fridges, ACs, washing machines', 2),
    ('11111111-1111-1111-1111-111111111001', 'Consumer Electronics',        'consumer-electronics',      'TVs, audio, cameras', 3),
    ('11111111-1111-1111-1111-111111111001', 'Electronic Components',       'electronic-components',     'Semiconductors, PCBs, wiring', 4),

    -- Apparel & Textiles
    ('11111111-1111-1111-1111-111111111002', 'Men''s Clothing',    'mens-clothing',    'Shirts, trousers, suits', 1),
    ('11111111-1111-1111-1111-111111111002', 'Women''s Clothing',  'womens-clothing',  'Sarees, dresses, tops',   2),
    ('11111111-1111-1111-1111-111111111002', 'Fabrics & Textiles', 'fabrics-textiles', 'Cotton, silk, synthetic', 3),
    ('11111111-1111-1111-1111-111111111002', 'Footwear',           'footwear',         'Shoes, sandals, boots',   4),

    -- Food & Beverages
    ('11111111-1111-1111-1111-111111111003', 'Grains & Cereals', 'grains-cereals', 'Rice, wheat, pulses', 1),
    ('11111111-1111-1111-1111-111111111003', 'Spices & Masalas', 'spices-masalas', 'Whole and ground spices', 2),
    ('11111111-1111-1111-1111-111111111003', 'Beverages',        'beverages',      'Tea, coffee, juices', 3),
    ('11111111-1111-1111-1111-111111111003', 'Snacks & Confectionery', 'snacks-confectionery', 'Biscuits, chocolates, snacks', 4),

    -- Industrial & Machinery
    ('11111111-1111-1111-1111-111111111004', 'Power Tools',        'power-tools',        'Drills, grinders, saws', 1),
    ('11111111-1111-1111-1111-111111111004', 'Hand Tools',         'hand-tools',         'Wrenches, hammers, pliers', 2),
    ('11111111-1111-1111-1111-111111111004', 'Industrial Machinery','industrial-machinery-eq','CNC, lathes, presses', 3),
    ('11111111-1111-1111-1111-111111111004', 'Safety Equipment',   'safety-equipment',   'PPE, helmets, gloves', 4),

    -- Home & Furniture
    ('11111111-1111-1111-1111-111111111005', 'Office Furniture', 'office-furniture', 'Desks, chairs, cabinets', 1),
    ('11111111-1111-1111-1111-111111111005', 'Home Furniture',   'home-furniture-items', 'Sofas, beds, tables', 2),
    ('11111111-1111-1111-1111-111111111005', 'Kitchenware',      'kitchenware',      'Utensils, cookware', 3),
    ('11111111-1111-1111-1111-111111111005', 'Home Decor',       'home-decor',       'Lighting, rugs, wall art', 4),

    -- Health & Beauty
    ('11111111-1111-1111-1111-111111111006', 'Cosmetics',       'cosmetics',       'Makeup, skincare', 1),
    ('11111111-1111-1111-1111-111111111006', 'Personal Care',   'personal-care',   'Bath, hair, oral care', 2),
    ('11111111-1111-1111-1111-111111111006', 'Health Supplements','health-supplements','Vitamins, protein', 3),
    ('11111111-1111-1111-1111-111111111006', 'Medical Supplies','medical-supplies','Masks, gloves, kits', 4),

    -- Construction
    ('11111111-1111-1111-1111-111111111007', 'Cement & Concrete', 'cement-concrete', 'Cement, RMC, aggregates', 1),
    ('11111111-1111-1111-1111-111111111007', 'Steel & Metals',    'steel-metals',    'TMT bars, rods, sheets', 2),
    ('11111111-1111-1111-1111-111111111007', 'Tiles & Flooring',  'tiles-flooring',  'Ceramic, vitrified, marble', 3),
    ('11111111-1111-1111-1111-111111111007', 'Sanitaryware',      'sanitaryware',    'Faucets, sinks, toilets', 4),

    -- Automotive
    ('11111111-1111-1111-1111-111111111008', 'Two-Wheeler Parts', 'two-wheeler-parts', 'Bike/scooter spares', 1),
    ('11111111-1111-1111-1111-111111111008', 'Car Parts',         'car-parts',         'Filters, batteries, brakes', 2),
    ('11111111-1111-1111-1111-111111111008', 'Commercial Vehicle Parts', 'cv-parts',   'Truck, bus spares', 3),
    ('11111111-1111-1111-1111-111111111008', 'Lubricants & Fluids', 'lubricants-fluids', 'Engine oil, coolants', 4),

    -- Agriculture
    ('11111111-1111-1111-1111-111111111009', 'Seeds & Saplings',    'seeds-saplings',    'Vegetable, crop seeds', 1),
    ('11111111-1111-1111-1111-111111111009', 'Fertilisers',         'fertilisers',       'Organic, chemical', 2),
    ('11111111-1111-1111-1111-111111111009', 'Farm Equipment',      'farm-equipment',    'Tractors, tillers', 3),
    ('11111111-1111-1111-1111-111111111009', 'Irrigation Supplies', 'irrigation-supplies','Pumps, pipes, drip', 4),

    -- Packaging
    ('11111111-1111-1111-1111-111111111010', 'Corrugated Boxes',  'corrugated-boxes', 'Shipping cartons', 1),
    ('11111111-1111-1111-1111-111111111010', 'Plastic Packaging', 'plastic-packaging','Bottles, films, bags', 2),
    ('11111111-1111-1111-1111-111111111010', 'Labels & Tapes',    'labels-tapes',     'Adhesive labels, tapes', 3),
    ('11111111-1111-1111-1111-111111111010', 'Printing Services', 'printing-services','Custom printing', 4),

    -- Chemicals
    ('11111111-1111-1111-1111-111111111011', 'Industrial Chemicals', 'industrial-chemicals', 'Acids, solvents', 1),
    ('11111111-1111-1111-1111-111111111011', 'Polymers & Resins',    'polymers-resins',      'PE, PP, PVC', 2),
    ('11111111-1111-1111-1111-111111111011', 'Dyes & Pigments',      'dyes-pigments',        'Textile, industrial dyes', 3),
    ('11111111-1111-1111-1111-111111111011', 'Rubber Products',      'rubber-products',      'Natural, synthetic rubber', 4),

    -- Office & Stationery
    ('11111111-1111-1111-1111-111111111012', 'Paper & Notebooks',    'paper-notebooks',    'A4 paper, notebooks', 1),
    ('11111111-1111-1111-1111-111111111012', 'Writing Instruments',  'writing-instruments','Pens, pencils, markers', 2),
    ('11111111-1111-1111-1111-111111111012', 'IT Peripherals',       'it-peripherals',     'Keyboards, mice, cables', 3),
    ('11111111-1111-1111-1111-111111111012', 'Office Supplies',      'office-supplies',    'Files, folders, staplers', 4)
on conflict (slug) do nothing;
