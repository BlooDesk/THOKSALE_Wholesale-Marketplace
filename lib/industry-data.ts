// ============================================================
// THOKSALE — Master Industry Metadata & Fallback Catalog Data
// Full 12 industries with high-res imagery, badges & products
// ============================================================

export type IndustryMeta = {
  name: string
  slug: string
  tagline: string
  description: string
  icon: string
  accentColor: string
  bannerImage: string
  badge: string
}

export const INDUSTRY_METADATA: Record<string, IndustryMeta> = {
  'agri-food': {
    name: 'Agri & Food',
    slug: 'agri-food',
    tagline: 'Farm-Gate Commodities & Food Processing Direct',
    description: 'Bulk grains, spices, seeds, organic produce, processed foods and dairy sourced directly from verified farmer producer companies, mills and processing plants across India.',
    icon: 'agriculture',
    accentColor: '#2d6a4f',
    bannerImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80',
    badge: 'Farm Direct & APMC Verified'
  },
  'fmcg-personal-care': {
    name: 'FMCG & Personal Care',
    slug: 'fmcg-personal-care',
    tagline: 'Daily Essentials, Beauty & Institutional Supplies',
    description: 'Direct manufacturer wholesale on soaps, hair care, cosmetics, detergents, hygiene disposables, packaged beverages and convenience consumer staples.',
    icon: 'local_mall',
    accentColor: '#1d3557',
    bannerImage: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1200&auto=format&fit=crop&q=80',
    badge: 'GMP & FDA Certified'
  },
  'fashion-lifestyle': {
    name: 'Fashion & Lifestyle',
    slug: 'fashion-lifestyle',
    tagline: 'Textile Mills, Garment Manufacturers & Footwear',
    description: 'Wholesale apparel, fabrics, yarns, ethnic wear, denim, leather footwear and fashion accessories direct from Tiruppur, Surat, Ludhiana and Jaipur hubs.',
    icon: 'checkroom',
    accentColor: '#6a0572',
    bannerImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop&q=80',
    badge: 'Tiruppur & Surat Hub Direct'
  },
  'construction-building': {
    name: 'Construction & Building',
    slug: 'construction-building',
    tagline: 'Structural Steel, Cement, Tiles & Infrastructure Hardware',
    description: 'TMT bars, structural steel, ceramic tiles, sanitaryware, CPVC plumbing pipes, building electricals and architectural hardware direct from verified plants.',
    icon: 'construction',
    accentColor: '#b45309',
    bannerImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&auto=format&fit=crop&q=80',
    badge: 'BIS & ISO Certified Mills'
  },
  'electronics-electrical': {
    name: 'Electronics & Electrical',
    slug: 'electronics-electrical',
    tagline: 'Industrial Electrical, Cables, Lighting & Components',
    description: 'High-voltage switchgear, copper cables, industrial LED lighting, power banks, PCBs, solar components and commercial electrical installations.',
    icon: 'bolt',
    accentColor: '#0284c7',
    bannerImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    badge: 'OEM & CE Certified'
  },
  'automotive-mobility': {
    name: 'Automotive & Mobility',
    slug: 'automotive-mobility',
    tagline: 'Auto Components, Bearings, Tyres & EV Supply Chain',
    description: 'Precision auto parts, heavy vehicle brake systems, deep groove bearings, radial tyres, automotive batteries and EV powertrain components.',
    icon: 'directions_car',
    accentColor: '#334155',
    bannerImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&auto=format&fit=crop&q=80',
    badge: 'Tier-1 & Tier-2 OEM Suppliers'
  },
  'industrial-engineering': {
    name: 'Industrial & Engineering',
    slug: 'industrial-engineering',
    tagline: 'Machinery, Process Equipment, Valves & Fasteners',
    description: 'CNC machinery, hydraulic pumps, industrial valves, high-tensile fasteners, welding equipment, and automated process plant systems.',
    icon: 'precision_manufacturing',
    accentColor: '#475569',
    bannerImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80',
    badge: 'Precision Engineering'
  },
  'chemicals-materials': {
    name: 'Chemicals & Materials',
    slug: 'chemicals-materials',
    tagline: 'Industrial Chemicals, Polymers, Resins & Solvents',
    description: 'Bulk industrial chemicals, virgin polymer granules, synthetic rubber, specialty adhesives, coatings, and laboratory reagents with test COAs.',
    icon: 'science',
    accentColor: '#0f766e',
    bannerImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&auto=format&fit=crop&q=80',
    badge: 'COA & MSDS Compliant'
  },
  'healthcare-wellness': {
    name: 'Healthcare & Wellness',
    slug: 'healthcare-wellness',
    tagline: 'Pharma Wholesale, Medical Devices & Surgical Consumables',
    description: 'Generic pharmaceuticals, surgical instruments, hospital disposables, diagnostics, diagnostic kits, ayurvedic extracts and clinic equipment.',
    icon: 'health_and_safety',
    accentColor: '#047857',
    bannerImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&auto=format&fit=crop&q=80',
    badge: 'WHO-GMP & CDSCO Verified'
  },
  'home-living': {
    name: 'Home & Living',
    slug: 'home-living',
    tagline: 'Solid Wood Furniture, Furnishings & Home Decor',
    description: 'Sheesham & teak furniture, artisanal home textiles, commercial kitchenware, hotel linen, and lighting fixtures direct from artisan clusters.',
    icon: 'chair',
    accentColor: '#854d0e',
    bannerImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format&fit=crop&q=80',
    badge: 'Direct Craft & Factory Sourced'
  },
  'consumer-general': {
    name: 'Consumer & General Goods',
    slug: 'consumer-general',
    tagline: 'Packaging, Stationery, Toys & General Merchandise',
    description: 'Corrugated cartons, BOPP packing tapes, thermal paper, school & office stationery, sporting goods, toys, and wholesale giftwares.',
    icon: 'category',
    accentColor: '#4f46e5',
    bannerImage: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=1200&auto=format&fit=crop&q=80',
    badge: 'Institutional & Retail Ready'
  },
  'energy-infrastructure': {
    name: 'Energy & Infrastructure',
    slug: 'energy-infrastructure',
    tagline: 'Solar Panels, Power Inverters & Heavy Grid Infrastructure',
    description: 'High-efficiency Mono PERC solar modules, hybrid inverters, HT underground cables, tubular solar batteries, and substation infrastructure equipment.',
    icon: 'solar_power',
    accentColor: '#ca8a04',
    bannerImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&auto=format&fit=crop&q=80',
    badge: 'MNRE & BIS Certified'
  },
}

// Curated high-res images for Level 1 categories
export const CATEGORY_IMAGES: Record<string, { image: string; bg: string }> = {
  // Agri & Food
  'agri--agriculture-farming': {
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&auto=format&fit=crop&q=80',
    bg: '#254320'
  },
  'agri--food-grains': {
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    bg: '#3b2f15'
  },
  'agri--processed-food': {
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&auto=format&fit=crop&q=80',
    bg: '#422817'
  },
  'agri--dairy-beverages': {
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    bg: '#1a334f'
  },

  // FMCG
  'fmcg--personal-care': {
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&auto=format&fit=crop&q=80',
    bg: '#1c3144'
  },
  'fmcg--beauty-cosmetics': {
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    bg: '#471828'
  },
  'fmcg--home-care': {
    image: 'https://images.unsplash.com/photo-1584824486516-0555a07fc511?w=500&auto=format&fit=crop&q=80',
    bg: '#1b3b2b'
  },
  'fmcg--hygiene-disposable': {
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80',
    bg: '#1e3838'
  },

  // Fashion
  'fashion--apparel': {
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop&q=80',
    bg: '#3b1c32'
  },
  'fashion--textiles': {
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=80',
    bg: '#251b3b'
  },
  'fashion--footwear': {
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=80',
    bg: '#332318'
  },
  'fashion--accessories': {
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
    bg: '#1e2d3d'
  },

  // Construction
  'const--building-materials': {
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&auto=format&fit=crop&q=80',
    bg: '#47321a'
  },
  'const--steel-structural': {
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=80',
    bg: '#2d3748'
  },
  'const--tiles-surfaces': {
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=80',
    bg: '#374151'
  },
  'const--plumbing': {
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&auto=format&fit=crop&q=80',
    bg: '#1e3a5f'
  },
  'const--sanitaryware': {
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=80',
    bg: '#1f2937'
  },
  'const--building-electrical': {
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop&q=80',
    bg: '#1e293b'
  },
  'const--doors-windows-glass': {
    image: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?w=500&auto=format&fit=crop&q=80',
    bg: '#334155'
  },
  'const--paints-finishing': {
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=80',
    bg: '#1e3a40'
  },
  'const--hardware': {
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=80',
    bg: '#374151'
  },

  // Electronics
  'elec--electrical-equipment': {
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
    bg: '#0f172a'
  },
  'elec--industrial-electrical': {
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=500&auto=format&fit=crop&q=80',
    bg: '#1e293b'
  },
  'elec--consumer-electronics': {
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=80',
    bg: '#172554'
  },
  'elec--lighting': {
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop&q=80',
    bg: '#1e1b4b'
  },
  'elec--security-surveillance': {
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500&auto=format&fit=crop&q=80',
    bg: '#0f172a'
  },
  'elec--electronic-components': {
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
    bg: '#09090b'
  },

  // Automotive
  'auto--vehicles': {
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&auto=format&fit=crop&q=80',
    bg: '#18181b'
  },
  'auto--auto-components': {
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=80',
    bg: '#27272a'
  },
  'auto--tyres-tubes': {
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=500&auto=format&fit=crop&q=80',
    bg: '#09090b'
  },
  'auto--batteries': {
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=80',
    bg: '#172554'
  },
  'auto--accessories': {
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80',
    bg: '#262626'
  },
  'auto--ev-supply': {
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=500&auto=format&fit=crop&q=80',
    bg: '#064e3b'
  },

  // Industrial
  'ind--machinery': {
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=80',
    bg: '#1e293b'
  },
  'ind--process-equipment': {
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=80',
    bg: '#1f2937'
  },
  'ind--tools-cutting': {
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=80',
    bg: '#334155'
  },
  'ind--hydraulics-pneumatics': {
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
    bg: '#1e3a5f'
  },
  'ind--material-handling': {
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80',
    bg: '#292524'
  },
  'ind--automation-robotics': {
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop&q=80',
    bg: '#0f172a'
  },
  'ind--welding-equipment': {
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=80',
    bg: '#451a03'
  },

  // Chemicals
  'chem--industrial-chemicals': {
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500&auto=format&fit=crop&q=80',
    bg: '#134e4a'
  },
  'chem--polymers-plastics': {
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80',
    bg: '#1e3a5f'
  },
  'chem--rubber-elastomers': {
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=500&auto=format&fit=crop&q=80',
    bg: '#1c1917'
  },
  'chem--adhesives-sealants': {
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80',
    bg: '#2e1065'
  },
  'chem--coatings-paints': {
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=80',
    bg: '#1e293b'
  },
  'chem--water-treatment': {
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    bg: '#083344'
  },

  // Healthcare
  'health--pharmaceuticals': {
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    bg: '#064e3b'
  },
  'health--medical-devices': {
    image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=500&auto=format&fit=crop&q=80',
    bg: '#1e3a5f'
  },
  'health--surgical-supplies': {
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80',
    bg: '#1f2937'
  },
  'health--diagnostics': {
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500&auto=format&fit=crop&q=80',
    bg: '#0f172a'
  },
  'health--ayurveda-herbal': {
    image: 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=500&auto=format&fit=crop&q=80',
    bg: '#14532d'
  },
  'health--dental-optical': {
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80',
    bg: '#0e7490'
  },

  // Home & Living
  'home--furniture': {
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80',
    bg: '#3b2f15'
  },
  'home--kitchen': {
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=80',
    bg: '#292524'
  },
  'home--decor': {
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80',
    bg: '#3f2c20'
  },
  'home--furnishing': {
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&auto=format&fit=crop&q=80',
    bg: '#1c2833'
  },
  'home--improvement': {
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
    bg: '#2c3e50'
  },

  // Consumer
  'consumer--stationery': {
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=80',
    bg: '#1e293b'
  },
  'consumer--packaging': {
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80',
    bg: '#3b2f15'
  },
  'consumer--toys-baby': {
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=80',
    bg: '#4c1d95'
  },
  'consumer--sports-fitness': {
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80',
    bg: '#1e3a5f'
  },
  'consumer--gifts-handicrafts': {
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80',
    bg: '#3f1a30'
  },

  // Energy
  'energy--solar': {
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=500&auto=format&fit=crop&q=80',
    bg: '#713f12'
  },
  'energy--energy-storage': {
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=80',
    bg: '#1e3a5f'
  },
  'energy--power-infra': {
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
    bg: '#1e293b'
  },
  'energy--renewable': {
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=500&auto=format&fit=crop&q=80',
    bg: '#14532d'
  },
  'energy--heavy-infra': {
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=80',
    bg: '#374151'
  },
  'energy--aerospace-defence': {
    image: 'https://images.unsplash.com/photo-1517976487507-5b3b4b45f922?w=500&auto=format&fit=crop&q=80',
    bg: '#0f172a'
  },

  // Additional explicit category mappings
  'elec--electronics-components': {
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
    bg: '#09090b'
  },
  'elec--mobile-computer-acc': {
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=80',
    bg: '#172554'
  },
  'auto--components': {
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=80',
    bg: '#27272a'
  },
  'auto--body-exterior': {
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=80',
    bg: '#262626'
  },
  'auto--tyres-wheels': {
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=500&auto=format&fit=crop&q=80',
    bg: '#09090b'
  },
  'ind--process-machinery': {
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=80',
    bg: '#1f2937'
  },
  'ind--industrial-equipment': {
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=80',
    bg: '#1e293b'
  },
  'ind--engineering-components': {
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=80',
    bg: '#334155'
  },
  'ind--fabrication': {
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=80',
    bg: '#451a03'
  },
  'chem--plastics-polymers': {
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80',
    bg: '#1e3a5f'
  },
  'chem--paints-coatings-inks': {
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=80',
    bg: '#1e293b'
  },
  'chem--industrial-materials': {
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    bg: '#083344'
  },
  'health--surgical-consumables': {
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80',
    bg: '#1f2937'
  },
  'health--laboratory': {
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500&auto=format&fit=crop&q=80',
    bg: '#0f172a'
  },
  'health--wellness': {
    image: 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=500&auto=format&fit=crop&q=80',
    bg: '#14532d'
  },
  'cons--toys-games': {
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&auto=format&fit=crop&q=80',
    bg: '#4c1d95'
  },
  'cons--sports-fitness': {
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80',
    bg: '#1e3a5f'
  },
  'cons--stationery-office': {
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=80',
    bg: '#1e293b'
  },
  'cons--packaging': {
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80',
    bg: '#3b2f15'
  },
  'cons--gifts-merchandise': {
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80',
    bg: '#3f1a30'
  },
  'energy--storage': {
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=80',
    bg: '#1e3a5f'
  },
}

// Default fallback images by industry if a category is missing an explicit image
const INDUSTRY_FALLBACK_IMAGES: Record<string, string> = {
  'agri-food':              'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&auto=format&fit=crop&q=80',
  'fmcg-personal-care':     'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&auto=format&fit=crop&q=80',
  'fashion-lifestyle':      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&auto=format&fit=crop&q=80',
  'construction-building':  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&auto=format&fit=crop&q=80',
  'electronics-electrical': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
  'automotive-mobility':    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&auto=format&fit=crop&q=80',
  'industrial-engineering': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=80',
  'chemicals-materials':    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500&auto=format&fit=crop&q=80',
  'healthcare-wellness':    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
  'home-living':            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80',
  'consumer-general':       'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80',
  'energy-infrastructure':  'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=500&auto=format&fit=crop&q=80',
}

export function getCategoryVisual(slug: string, industrySlug?: string) {
  if (CATEGORY_IMAGES[slug]) {
    return CATEGORY_IMAGES[slug]
  }
  const fallbackImg = (industrySlug && INDUSTRY_FALLBACK_IMAGES[industrySlug]) ||
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80'
  return {
    image: fallbackImg,
    bg: '#1e293b'
  }
}

// Authentic B2B wholesale fallback products for every industry
export const FALLBACK_PRODUCTS_BY_INDUSTRY: Record<string, any[]> = {
  'agri-food': [
    {
      id: 'agri-p1',
      name: 'Organic Basmati Rice Extra Long Grain 1121 Premium',
      base_price: 82,
      moq: 500,
      unit: 'kg',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Amritsar',
      mfg_location_state: 'Punjab',
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Golden Grain Exports Ltd', city: 'Amritsar', kyc_status: 'verified' }
    },
    {
      id: 'agri-p2',
      name: 'High Yield Hybrid Cotton Seeds F1 (Bollgard II)',
      base_price: 490,
      moq: 50,
      unit: 'pkts',
      sample_available: true,
      oem_available: false,
      mfg_location_city: 'Hyderabad',
      mfg_location_state: 'Telangana',
      image_url: 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Deccan Agri Genetics', city: 'Hyderabad', kyc_status: 'verified' }
    },
    {
      id: 'agri-p3',
      name: 'Cold Pressed Pure Mustard Oil 15L Commercial Tin',
      base_price: 1850,
      moq: 20,
      unit: 'tins',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Jaipur',
      mfg_location_state: 'Rajasthan',
      image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Marwar Oil Industries', city: 'Jaipur', kyc_status: 'verified' }
    },
    {
      id: 'agri-p4',
      name: 'Water Soluble NPK 19:19:19 Fertilizer 25kg Bag',
      base_price: 1450,
      moq: 40,
      unit: 'bags',
      sample_available: false,
      oem_available: true,
      mfg_location_city: 'Indore',
      mfg_location_state: 'Madhya Pradesh',
      image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Narmada Agro Chemicals', city: 'Indore', kyc_status: 'verified' }
    },
    {
      id: 'agri-p5',
      name: 'Heavy Duty Inline Drip Irrigation Pipe 16mm 400m Coil',
      base_price: 2600,
      moq: 15,
      unit: 'coils',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Jalgaon',
      mfg_location_state: 'Maharashtra',
      image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Jalgaon Irrigation Corp', city: 'Jalgaon', kyc_status: 'verified' }
    },
    {
      id: 'agri-p6',
      name: 'Grade-A Bold Green Cardamom (Elaichi) 8mm Bold',
      base_price: 2450,
      moq: 25,
      unit: 'kg',
      sample_available: true,
      oem_available: false,
      mfg_location_city: 'Idukki',
      mfg_location_state: 'Kerala',
      image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Cardamom Hills Spices', city: 'Idukki', kyc_status: 'verified' }
    },
  ],

  'fmcg-personal-care': [
    {
      id: 'fmcg-p1',
      name: 'Herbal Neem & Tea Tree Face Wash 100ml Wholesale Pack',
      base_price: 48,
      moq: 120,
      unit: 'pcs',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Haridwar',
      mfg_location_state: 'Uttarakhand',
      image_url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Vedic Naturals Herbals', city: 'Haridwar', kyc_status: 'verified' }
    },
    {
      id: 'fmcg-p2',
      name: 'Pure Virgin Coconut Hair Oil 200ml Flip-Top Bottle',
      base_price: 65,
      moq: 200,
      unit: 'pcs',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Kochi',
      mfg_location_state: 'Kerala',
      image_url: 'https://images.unsplash.com/photo-1608248597359-009139f13d8d?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Malabar Agro Botanicals', city: 'Kochi', kyc_status: 'verified' }
    },
    {
      id: 'fmcg-p3',
      name: 'Commercial Active Enzyme Liquid Detergent 5-Litre Can',
      base_price: 240,
      moq: 50,
      unit: 'cans',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Vapi',
      mfg_location_state: 'Gujarat',
      image_url: 'https://images.unsplash.com/photo-1584824486516-0555a07fc511?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'CleanMax Formulations', city: 'Vapi', kyc_status: 'verified' }
    },
    {
      id: 'fmcg-p4',
      name: 'Ultra Soft Bamboo Wet Wipes 80-Pull Resealable Pack',
      base_price: 38,
      moq: 300,
      unit: 'packs',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Baddi',
      mfg_location_state: 'Himachal Pradesh',
      image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'EcoCare Hygiene Products', city: 'Baddi', kyc_status: 'verified' }
    },
    {
      id: 'fmcg-p5',
      name: 'Long-Lasting Matte Liquid Lipstick Set (12 Shades)',
      base_price: 85,
      moq: 100,
      unit: 'sets',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Mumbai',
      mfg_location_state: 'Maharashtra',
      image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'CosmoGlam Laboratories', city: 'Mumbai', kyc_status: 'verified' }
    },
    {
      id: 'fmcg-p6',
      name: 'Antibacterial Hand Sanitizer 70% IPA 500ml Pump',
      base_price: 45,
      moq: 150,
      unit: 'bottles',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Ahmedabad',
      mfg_location_state: 'Gujarat',
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Sanjeevani Healthcare Ltd', city: 'Ahmedabad', kyc_status: 'verified' }
    },
  ],

  'fashion-lifestyle': [
    {
      id: 'fash-p1',
      name: '100% Combed Cotton Single Jersey Fabric 180 GSM',
      base_price: 240,
      moq: 100,
      unit: 'kg',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Tiruppur',
      mfg_location_state: 'Tamil Nadu',
      image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Tiruppur Spinners & Knitters', city: 'Tiruppur', kyc_status: 'verified' }
    },
    {
      id: 'fash-p2',
      name: 'Men’s Heavy Duty Industrial Workwear Trousers',
      base_price: 320,
      moq: 60,
      unit: 'pcs',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Ludhiana',
      mfg_location_state: 'Punjab',
      image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Apex Workwear Garments', city: 'Ludhiana', kyc_status: 'verified' }
    },
    {
      id: 'fash-p3',
      name: 'Steel Toe Cap Industrial Safety Shoes ISI Certified',
      base_price: 460,
      moq: 50,
      unit: 'pairs',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Kanpur',
      mfg_location_state: 'Uttar Pradesh',
      image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Ganga Leather & Safety Works', city: 'Kanpur', kyc_status: 'verified' }
    },
    {
      id: 'fash-p4',
      name: 'Pure Chanderi Silk Saree with Zari Border Collection',
      base_price: 890,
      moq: 20,
      unit: 'pcs',
      sample_available: true,
      oem_available: false,
      mfg_location_city: 'Surat',
      mfg_location_state: 'Gujarat',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Surat Silk Heritage Mills', city: 'Surat', kyc_status: 'verified' }
    },
  ],

  'construction-building': [
    {
      id: 'const-p1',
      name: 'TMT Fe500D Primary Steel Rebar 12mm 12-Metre Bars',
      base_price: 68,
      moq: 5000,
      unit: 'kg',
      sample_available: false,
      oem_available: false,
      mfg_location_city: 'Bellary',
      mfg_location_state: 'Karnataka',
      image_url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'JSW Steel Stockists Ltd', city: 'Bellary', kyc_status: 'verified' }
    },
    {
      id: 'const-p2',
      name: 'Commercial SS 304 Food Grade Stainless Sheet 1.2mm',
      base_price: 310,
      moq: 25,
      unit: 'sheets',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Chennai',
      mfg_location_state: 'Tamil Nadu',
      image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Jindal Metal Stockists', city: 'Chennai', kyc_status: 'verified' }
    },
    {
      id: 'const-p3',
      name: 'Industrial Grade CPVC Plumbing Pipe 1-inch SDR 11',
      base_price: 45,
      moq: 100,
      unit: 'pcs',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Pune',
      mfg_location_state: 'Maharashtra',
      image_url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Finolex Pipes & Fittings', city: 'Pune', kyc_status: 'verified' }
    },
    {
      id: 'const-p4',
      name: 'Polished Glazed Vitrified Tiles 600x600mm Box (4 Pcs)',
      base_price: 380,
      moq: 150,
      unit: 'boxes',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Morbi',
      mfg_location_state: 'Gujarat',
      image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Morbi Ceramic Exports', city: 'Morbi', kyc_status: 'verified' }
    },
    {
      id: 'const-p5',
      name: 'Portland Pozzolana Cement (PPC) 50kg Bag Lot',
      base_price: 330,
      moq: 200,
      unit: 'bags',
      sample_available: false,
      oem_available: false,
      mfg_location_city: 'Satna',
      mfg_location_state: 'Madhya Pradesh',
      image_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'UltraTech Authorized Supply', city: 'Satna', kyc_status: 'verified' }
    },
    {
      id: 'const-p6',
      name: 'Heavy Duty Brass Concealed Mortise Door Lock 60mm',
      base_price: 420,
      moq: 50,
      unit: 'sets',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Aligarh',
      mfg_location_state: 'Uttar Pradesh',
      image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Aligarh Locksmith Hardware', city: 'Aligarh', kyc_status: 'verified' }
    },
  ],

  'electronics-electrical': [
    {
      id: 'elec-p1',
      name: 'Industrial 50W LED Floodlight IP66 Die-Cast Aluminum',
      base_price: 340,
      moq: 50,
      unit: 'pcs',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Pune',
      mfg_location_state: 'Maharashtra',
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Lumina Industrial Electricals', city: 'Pune', kyc_status: 'verified' }
    },
    {
      id: 'elec-p2',
      name: '10000mAh PD Fast Charging Power Bank Dual USB-C',
      base_price: 480,
      moq: 50,
      unit: 'pcs',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Noida',
      mfg_location_state: 'Uttar Pradesh',
      image_url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'ElectroTech India OEM', city: 'Noida', kyc_status: 'verified' }
    },
    {
      id: 'elec-p3',
      name: 'FR-PVC Copper Flexible Multicore Wire 2.5 sq mm 90m',
      base_price: 1850,
      moq: 20,
      unit: 'coils',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Delhi',
      mfg_location_state: 'Delhi',
      image_url: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Havells Certified Stockists', city: 'Delhi', kyc_status: 'verified' }
    },
    {
      id: 'elec-p4',
      name: 'Smart WiFi Din-Rail 63A Miniature Circuit Breaker (MCB)',
      base_price: 680,
      moq: 30,
      unit: 'pcs',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Bengaluru',
      mfg_location_state: 'Karnataka',
      image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Schneider Distribution Co', city: 'Bengaluru', kyc_status: 'verified' }
    },
  ],

  'automotive-mobility': [
    {
      id: 'auto-p1',
      name: 'Precision 6204-2RS Deep Groove Ball Bearings (Chrome Steel)',
      base_price: 115,
      moq: 100,
      unit: 'pcs',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Rajkot',
      mfg_location_state: 'Gujarat',
      image_url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'SteelMax Bearings India', city: 'Rajkot', kyc_status: 'verified' }
    },
    {
      id: 'auto-p2',
      name: 'Semi-Metallic Heavy Duty Commercial Truck Brake Pads',
      base_price: 640,
      moq: 40,
      unit: 'sets',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Faridabad',
      mfg_location_state: 'Haryana',
      image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Brembo Auto Components', city: 'Faridabad', kyc_status: 'verified' }
    },
    {
      id: 'auto-p3',
      name: '12V 100Ah Maintenance-Free Commercial Truck Battery',
      base_price: 5200,
      moq: 10,
      unit: 'pcs',
      sample_available: false,
      oem_available: true,
      mfg_location_city: 'Chennai',
      mfg_location_state: 'Tamil Nadu',
      image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Amara Raja Direct Stockists', city: 'Chennai', kyc_status: 'verified' }
    },
    {
      id: 'auto-p4',
      name: 'Heavy Duty Commercial Radial Tyre 10.00 R20 16PR',
      base_price: 14800,
      moq: 8,
      unit: 'pcs',
      sample_available: false,
      oem_available: false,
      mfg_location_city: 'Kochi',
      mfg_location_state: 'Kerala',
      image_url: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Apollo Tyres Regional Depot', city: 'Kochi', kyc_status: 'verified' }
    },
  ],

  'industrial-engineering': [
    {
      id: 'ind-p1',
      name: 'High Tensile Hex Head M10 Steel Bolts & Nuts (Grade 8.8)',
      base_price: 8,
      moq: 1000,
      unit: 'sets',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Ludhiana',
      mfg_location_state: 'Punjab',
      image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Aarav Fasteners Ltd', city: 'Ludhiana', kyc_status: 'verified' }
    },
    {
      id: 'ind-p2',
      name: 'Cast Iron Flanged Industrial Ball Valve 2-inch Class 150',
      base_price: 1450,
      moq: 20,
      unit: 'pcs',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Coimbatore',
      mfg_location_state: 'Tamil Nadu',
      image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Coimbatore Foundry & Valves', city: 'Coimbatore', kyc_status: 'verified' }
    },
    {
      id: 'ind-p3',
      name: 'IGBT Inverter Arc Welding Machine 250A Single Phase',
      base_price: 5800,
      moq: 6,
      unit: 'units',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Surat',
      mfg_location_state: 'Gujarat',
      image_url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Shakti Welding Systems', city: 'Surat', kyc_status: 'verified' }
    },
  ],

  'chemicals-materials': [
    {
      id: 'chem-p1',
      name: 'Industrial Grade Caustic Soda Flakes 99.5% 50kg HDPE Bag',
      base_price: 1850,
      moq: 40,
      unit: 'bags',
      sample_available: true,
      oem_available: false,
      mfg_location_city: 'Dahej',
      mfg_location_state: 'Gujarat',
      image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'GACL Chemical Distributors', city: 'Dahej', kyc_status: 'verified' }
    },
    {
      id: 'chem-p2',
      name: 'Virgin Polypropylene (PP) Homopolymer Granules 25kg',
      base_price: 2400,
      moq: 50,
      unit: 'bags',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Vadodara',
      mfg_location_state: 'Gujarat',
      image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Reliance Petro Supply Corp', city: 'Vadodara', kyc_status: 'verified' }
    },
    {
      id: 'chem-p3',
      name: 'Liquid Chlorine 99.8% Commercial Tonner 900kg',
      base_price: 12500,
      moq: 2,
      unit: 'tonners',
      sample_available: false,
      oem_available: false,
      mfg_location_city: 'Vapi',
      mfg_location_state: 'Gujarat',
      image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Atul Chemical Works', city: 'Vapi', kyc_status: 'verified' }
    },
  ],

  'healthcare-wellness': [
    {
      id: 'hlth-p1',
      name: 'Nitrile Examination Gloves Powder-Free Box of 100 Pcs',
      base_price: 180,
      moq: 100,
      unit: 'boxes',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Surat',
      mfg_location_state: 'Gujarat',
      image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'MediShield Surgicals', city: 'Surat', kyc_status: 'verified' }
    },
    {
      id: 'hlth-p2',
      name: 'Digital Upper Arm Blood Pressure Monitor Clinical Grade',
      base_price: 780,
      moq: 25,
      unit: 'units',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Ahmedabad',
      mfg_location_state: 'Gujarat',
      image_url: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'BioCheck Health Instruments', city: 'Ahmedabad', kyc_status: 'verified' }
    },
    {
      id: 'hlth-p3',
      name: 'Sterile Surgical Cotton Gauze Swabs 10x10cm (Pack 100)',
      base_price: 95,
      moq: 150,
      unit: 'packs',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Coimbatore',
      mfg_location_state: 'Tamil Nadu',
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'CottonCare Medi-Fabrics', city: 'Coimbatore', kyc_status: 'verified' }
    },
  ],

  'home-living': [
    {
      id: 'home-p1',
      name: 'Solid Sheesham Wood 6-Seater Dining Table Set',
      base_price: 14500,
      moq: 5,
      unit: 'sets',
      sample_available: false,
      oem_available: true,
      mfg_location_city: 'Jodhpur',
      mfg_location_state: 'Rajasthan',
      image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Marwar Teak & Wood Craft', city: 'Jodhpur', kyc_status: 'verified' }
    },
    {
      id: 'home-p2',
      name: 'Commercial Cast Iron Pre-Seasoned Kadai Pan 28cm',
      base_price: 490,
      moq: 40,
      unit: 'pcs',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Rajkot',
      mfg_location_state: 'Gujarat',
      image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Heritage Cookware Foundry', city: 'Rajkot', kyc_status: 'verified' }
    },
    {
      id: 'home-p3',
      name: 'Heavy Microfiber Luxury Hotel Bed Sheet Set 300 TC',
      base_price: 360,
      moq: 60,
      unit: 'sets',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Panipat',
      mfg_location_state: 'Haryana',
      image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Panipat Handloom Exports', city: 'Panipat', kyc_status: 'verified' }
    },
  ],

  'consumer-general': [
    {
      id: 'cons-p1',
      name: 'Heavy Duty 2-inch Packaging BOPP Tape 65m Roll Lot',
      base_price: 32,
      moq: 300,
      unit: 'rolls',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Surat',
      mfg_location_state: 'Gujarat',
      image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Apex Tape Mills', city: 'Surat', kyc_status: 'verified' }
    },
    {
      id: 'cons-p2',
      name: 'Corrugated 3-Ply Shipping Box 12x10x8-inch Bundle (50 Pcs)',
      base_price: 18,
      moq: 500,
      unit: 'pcs',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Ahmedabad',
      mfg_location_state: 'Gujarat',
      image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'EcoPack Cartons Ltd', city: 'Ahmedabad', kyc_status: 'verified' }
    },
    {
      id: 'cons-p3',
      name: 'A4 Copier Paper 75 GSM High Bright Ream (500 Sheets)',
      base_price: 185,
      moq: 100,
      unit: 'reams',
      sample_available: true,
      oem_available: false,
      mfg_location_city: 'Kolkata',
      mfg_location_state: 'West Bengal',
      image_url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Bengal Paper Mills Depot', city: 'Kolkata', kyc_status: 'verified' }
    },
  ],

  'energy-infrastructure': [
    {
      id: 'enrg-p1',
      name: 'Mono PERC Solar Panel 540W Tier-1 MNRE Approved',
      base_price: 9800,
      moq: 10,
      unit: 'panels',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Surat',
      mfg_location_state: 'Gujarat',
      image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Adani Solar Authorized Distributor', city: 'Surat', kyc_status: 'verified' }
    },
    {
      id: 'enrg-p2',
      name: 'Hybrid Grid-Tie Solar Inverter 5kVA 48V Pure Sine Wave',
      base_price: 34000,
      moq: 2,
      unit: 'units',
      sample_available: false,
      oem_available: true,
      mfg_location_city: 'Bengaluru',
      mfg_location_state: 'Karnataka',
      image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'SunPower Inverter Solutions', city: 'Bengaluru', kyc_status: 'verified' }
    },
    {
      id: 'enrg-p3',
      name: 'Heavy Duty 33kV XLPE Underground Armored Power Cable 1km',
      base_price: 385000,
      moq: 1,
      unit: 'drums',
      sample_available: true,
      oem_available: true,
      mfg_location_city: 'Vadodara',
      mfg_location_state: 'Gujarat',
      image_url: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=500&auto=format&fit=crop&q=80',
      seller: { display_name: 'Polycab Infrastructure Supply', city: 'Vadodara', kyc_status: 'verified' }
    },
  ],
}
