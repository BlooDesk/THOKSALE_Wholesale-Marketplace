/**
 * ============================================================================
 *  ThokSale — Enterprise Demo Seed  (TypeScript / Node)
 * ============================================================================
 *  Purpose : Idempotent development / UI-test dataset.
 *            NEVER run this against a production Supabase project.
 *
 *  Handles :
 *    • 10 verified buyers   (auth.users + profiles)
 *    • 10 verified sellers  (auth.users + profiles + company_profiles
 *                            + seller_warehouses + seller_business_photos)
 *    • 120 realistic wholesale products, 10 per industry, ~12 per seller,
 *      each with images, tier pricing and dynamic product_attributes
 *      matched to the seed_enterprise_demo.sql attribute templates.
 *    • Orders + order_items
 *    • RFQs + rfq_responses
 *    • Notifications
 *    • Wishlist rows
 *    • Recently viewed rows
 *    • Active carts + cart_items
 *
 *  Idempotency :
 *    • All UUIDs are deterministic (uuid v5 over a private namespace).
 *    • Auth users are looked up before creation, else created via Admin API.
 *    • Every table insert uses .upsert(..., { onConflict: 'id' }) so re-runs
 *      converge to the same row set without duplicates.
 *
 *  Prerequisites :
 *    • Environment variables (auto-loaded from /app/.env if present):
 *        NEXT_PUBLIC_SUPABASE_URL
 *        SUPABASE_SERVICE_ROLE_KEY
 *    • Run seed_enterprise_demo.sql FIRST (creates additive tables + brands +
 *      attribute_definitions).
 *
 *  Execute :
 *    cd /app
 *    npx tsx supabase/seeds/seed_enterprise_demo.ts
 *  (or)
 *    node --loader ts-node/esm supabase/seeds/seed_enterprise_demo.ts
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js'
import { v5 as uuidv5 } from 'uuid'
import * as fs from 'node:fs'
import * as path from 'node:path'

// ----------------------------------------------------------------------------
// 0. ENV / CLIENT
// ----------------------------------------------------------------------------
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return
  const raw = fs.readFileSync(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!m) continue
    const [, k, v] = m
    if (!process.env[k]) process.env[k] = v.replace(/^['"]|['"]$/g, '')
  }
}
loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const supa = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } })

// Private namespace for deterministic UUID generation.
const NS = '3f9c9d0e-1a2b-4c3d-9e5f-6a7b8c9d0e1f'
const uid = (label: string) => uuidv5(label, NS)

const DEMO_TAG = 'seed=enterprise_demo'   // put in metadata for later cleanup

// ----------------------------------------------------------------------------
// 1. STATIC DATA
// ----------------------------------------------------------------------------
type StateCity = { state: string; city: string }
const INDIA_LOCS: StateCity[] = [
  { state: 'Delhi',          city: 'New Delhi'   },
  { state: 'Maharashtra',    city: 'Mumbai'      },
  { state: 'Karnataka',      city: 'Bengaluru'   },
  { state: 'Tamil Nadu',     city: 'Chennai'     },
  { state: 'Haryana',        city: 'Gurugram'    },
  { state: 'Uttar Pradesh',  city: 'Noida'       },
  { state: 'Gujarat',        city: 'Ahmedabad'   },
  { state: 'West Bengal',    city: 'Kolkata'     },
  { state: 'Rajasthan',      city: 'Jaipur'      },
  { state: 'Kerala',         city: 'Kochi'       },
  { state: 'Punjab',         city: 'Ludhiana'    },
  { state: 'Telangana',      city: 'Hyderabad'   },
]

// -------- Buyers ------------------------------------------------------------
type BuyerSeed = {
  key: string           // stable identifier for uuid v5
  email: string
  fullName: string
  businessName: string
  businessType: string
  gst: string
  mobile: string
  state: string
  city: string
}
const BUYERS: BuyerSeed[] = [
  { key: 'buyer01', email: 'buyer01@thoksale.demo', fullName: 'Ramesh Sharma',   businessName: 'Sharma Retail Store',           businessType: 'Retail Shop',          gst: '07AAACS0001A1Z5', mobile: '+919812340001', state: 'Delhi',         city: 'New Delhi'  },
  { key: 'buyer02', email: 'buyer02@thoksale.demo', fullName: 'Vikram Patil',    businessName: 'Krishna Hardware Center',        businessType: 'Hardware Store',       gst: '27AAKCS0002B2Z6', mobile: '+919812340002', state: 'Maharashtra',   city: 'Pune'       },
  { key: 'buyer03', email: 'buyer03@thoksale.demo', fullName: 'Suresh Iyer',     businessName: 'Apollo Medical Store',           businessType: 'Medical Store',        gst: '29AACCA0003C3Z7', mobile: '+919812340003', state: 'Karnataka',     city: 'Bengaluru'  },
  { key: 'buyer04', email: 'buyer04@thoksale.demo', fullName: 'Priya Menon',     businessName: 'Style Studio Fashion',           businessType: 'Fashion Store',        gst: '33AAECS0004D4Z8', mobile: '+919812340004', state: 'Tamil Nadu',    city: 'Chennai'    },
  { key: 'buyer05', email: 'buyer05@thoksale.demo', fullName: 'Amit Malhotra',   businessName: 'Reliable Electronics',           businessType: 'Electronics Shop',     gst: '06AAECR0005E5Z9', mobile: '+919812340005', state: 'Haryana',       city: 'Gurugram'   },
  { key: 'buyer06', email: 'buyer06@thoksale.demo', fullName: 'Neha Gupta',      businessName: 'Modern Furniture Emporium',      businessType: 'Furniture Dealer',     gst: '09AABCM0006F6Z0', mobile: '+919812340006', state: 'Uttar Pradesh', city: 'Noida'      },
  { key: 'buyer07', email: 'buyer07@thoksale.demo', fullName: 'Kirti Patel',     businessName: 'Bharat Construction Supplies',   businessType: 'Construction Supplier',gst: '24AACCB0007G7Z1', mobile: '+919812340007', state: 'Gujarat',       city: 'Ahmedabad'  },
  { key: 'buyer08', email: 'buyer08@thoksale.demo', fullName: 'Rahul Das',       businessName: 'Metro Grocery Bazaar',           businessType: 'Retail Shop',          gst: '19AAECM0008H8Z2', mobile: '+919812340008', state: 'West Bengal',   city: 'Kolkata'    },
  { key: 'buyer09', email: 'buyer09@thoksale.demo', fullName: 'Sandeep Rathore', businessName: 'Ashirwad Auto Parts',            businessType: 'Automobile Dealer',    gst: '08AAACA0009I9Z3', mobile: '+919812340009', state: 'Rajasthan',     city: 'Jaipur'     },
  { key: 'buyer10', email: 'buyer10@thoksale.demo', fullName: 'Meera Nair',      businessName: 'Sunrise Wholesale Trading',      businessType: 'General Trader',       gst: '32AAECS0010J0Z4', mobile: '+919812340010', state: 'Kerala',        city: 'Kochi'      },
]

// -------- Sellers -----------------------------------------------------------
type SellerSeed = {
  key: string
  email: string
  fullName: string
  legalName: string
  displayName: string
  businessType: string      // manufacturer / wholesaler / distributor / oem / private_label
  gst: string
  pan: string
  msme: string
  mobile: string
  state: string
  city: string
  description: string
  logoUrl: string
  warehouse: { name: string; addr: string; city: string; state: string; pin: string }
}
const SELLERS: SellerSeed[] = [
  { key: 'seller01', email: 'seller01@thoksale.demo', fullName: 'Ajay Deshmukh',   legalName: 'Orion Mills Textiles Pvt Ltd',   displayName: 'Orion Mills',      businessType: 'manufacturer',   gst: '27AAOCS1001Q1Z0', pan: 'AAOCS1001Q', msme: 'UDYAM-MH-01-0001001', mobile: '+919820001001', state: 'Maharashtra', city: 'Bhiwandi',  description: 'Vertically-integrated woven & knit fabric manufacturer. 3 mills, 4.5 lakh mtr/day capacity, Oeko-Tex certified.', logoUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&auto=format&fit=crop', warehouse: { name: 'Orion Mills Warehouse — Bhiwandi', addr: 'Plot 42, Textile Cluster, Kalyan Road',  city: 'Bhiwandi',  state: 'Maharashtra', pin: '421302' } },
  { key: 'seller02', email: 'seller02@thoksale.demo', fullName: 'Kavya Reddy',      legalName: 'GreenSpice Foods Pvt Ltd',       displayName: 'GreenSpice',       businessType: 'private_label',  gst: '29AAECG1002R2Z1', pan: 'AAECG1002R', msme: 'UDYAM-KA-02-0001002', mobile: '+919820001002', state: 'Karnataka',   city: 'Bengaluru', description: 'FSSAI-certified spice, staple and beverage brand. 12,000 tpa milling + private-label FMCG programme.',            logoUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop', warehouse: { name: 'GreenSpice DC — Bengaluru',        addr: 'Plot 18, Peenya Industrial Area, Phase 2',  city: 'Bengaluru', state: 'Karnataka',   pin: '560058' } },
  { key: 'seller03', email: 'seller03@thoksale.demo', fullName: 'Rohan Krishnan',   legalName: 'VoltaCore Electronics LLP',      displayName: 'VoltaCore',        businessType: 'oem',            gst: '33AABCV1003S3Z2', pan: 'AABCV1003S', msme: 'UDYAM-TN-03-0001003', mobile: '+919820001003', state: 'Tamil Nadu',  city: 'Chennai',   description: 'Consumer electronics OEM — mobile accessories, IT peripherals, smart lighting. SMT & injection moulding in-house.', logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop', warehouse: { name: 'VoltaCore Assembly — Chennai',     addr: 'Building B, SIPCOT IT Park, Siruseri',       city: 'Chennai',   state: 'Tamil Nadu',  pin: '603103' } },
  { key: 'seller04', email: 'seller04@thoksale.demo', fullName: 'Manish Chauhan',   legalName: 'TitanAuto Components Pvt Ltd',   displayName: 'TitanAuto',        businessType: 'manufacturer',   gst: '06AAKCT1004T4Z3', pan: 'AAKCT1004T', msme: 'UDYAM-HR-04-0001004', mobile: '+919820001004', state: 'Haryana',     city: 'Manesar',   description: 'Tier-1 auto components — brake systems, filters, EV modules. Certified TS 16949 / IATF 16949.',                    logoUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&auto=format&fit=crop', warehouse: { name: 'TitanAuto Plant — Manesar',        addr: 'Sector 8, IMT Manesar Industrial Estate',     city: 'Gurugram',  state: 'Haryana',     pin: '122051' } },
  { key: 'seller05', email: 'seller05@thoksale.demo', fullName: 'Anil Kotecha',     legalName: 'BharatCem Distribution Pvt Ltd', displayName: 'BharatCem',        businessType: 'distributor',    gst: '24AAECB1005U5Z4', pan: 'AAECB1005U', msme: 'UDYAM-GJ-05-0001005', mobile: '+919820001005', state: 'Gujarat',     city: 'Rajkot',    description: 'West-India distribution partner for grey/white cement, RMC and dry-mix products. 400+ dealer network.',            logoUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&auto=format&fit=crop', warehouse: { name: 'BharatCem Yard — Rajkot',          addr: 'Survey 118, Kotharia Solvent Road',           city: 'Rajkot',    state: 'Gujarat',     pin: '360004' } },
  { key: 'seller06', email: 'seller06@thoksale.demo', fullName: 'Harpreet Singh',   legalName: 'IndoMech Industries Pvt Ltd',    displayName: 'IndoMech',         businessType: 'manufacturer',   gst: '03AAECI1006V6Z5', pan: 'AAECI1006V', msme: 'UDYAM-PB-06-0001006', mobile: '+919820001006', state: 'Punjab',      city: 'Ludhiana',  description: 'Precision machine tools, CNC lathes, injection moulding machines and industrial spares — export-ready.',            logoUrl: 'https://images.unsplash.com/photo-1581091012184-7c3f88f11040?w=400&auto=format&fit=crop', warehouse: { name: 'IndoMech Works — Ludhiana',        addr: 'Focal Point Phase 8, Village Sahnewal',       city: 'Ludhiana',  state: 'Punjab',      pin: '141010' } },
  { key: 'seller07', email: 'seller07@thoksale.demo', fullName: 'Balbir Kaur',      legalName: 'HarvestGold AgriPro LLP',        displayName: 'HarvestGold',      businessType: 'wholesaler',     gst: '03AABCH1007W7Z6', pan: 'AABCH1007W', msme: 'UDYAM-PB-07-0001007', mobile: '+919820001007', state: 'Punjab',      city: 'Amritsar',  description: 'Farm inputs wholesaler — seeds, fertilizers, pesticides and farm implements. NOC-certified fumigation.',           logoUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&auto=format&fit=crop', warehouse: { name: 'HarvestGold Depot — Amritsar',     addr: 'GT Road, Rajasansi Mandi Yard',               city: 'Amritsar',  state: 'Punjab',      pin: '143001' } },
  { key: 'seller08', email: 'seller08@thoksale.demo', fullName: 'Farhan Shaikh',    legalName: 'MediPure Health Supplies Pvt Ltd', displayName: 'MediPure',       businessType: 'distributor',    gst: '27AAECM1008X8Z7', pan: 'AAECM1008X', msme: 'UDYAM-MH-08-0001008', mobile: '+919820001008', state: 'Maharashtra', city: 'Mumbai',    description: 'CDSCO-licensed medical device & pharma distributor. Cold-chain enabled, 3PL to 12 states.',                        logoUrl: 'https://images.unsplash.com/photo-1583911650428-a3c7b1c81a06?w=400&auto=format&fit=crop', warehouse: { name: 'MediPure Warehouse — Bhiwandi',    addr: 'Village Purna, Sonale Road',                 city: 'Bhiwandi',  state: 'Maharashtra', pin: '421302' } },
  { key: 'seller09', email: 'seller09@thoksale.demo', fullName: 'Divya Rathi',      legalName: 'Kanchan Home & Furniture Pvt Ltd', displayName: 'Kanchan Home',   businessType: 'private_label',  gst: '08AAECK1009Y9Z8', pan: 'AAECK1009Y', msme: 'UDYAM-RJ-09-0001009', mobile: '+919820001009', state: 'Rajasthan',   city: 'Jodhpur',   description: 'Sheesham & mango-wood furniture manufacturer — home, dining and hospitality collections. Export house.',            logoUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&auto=format&fit=crop', warehouse: { name: 'Kanchan Home Yard — Jodhpur',      addr: 'Boranada Industrial Estate, Phase III',       city: 'Jodhpur',   state: 'Rajasthan',   pin: '342012' } },
  { key: 'seller10', email: 'seller10@thoksale.demo', fullName: 'Yashvant Joshi',   legalName: 'ProPack Print & Packaging Pvt Ltd', displayName: 'ProPack',       businessType: 'manufacturer',   gst: '24AAECP1010Z0Z9', pan: 'AAECP1010Z', msme: 'UDYAM-GJ-10-0001010', mobile: '+919820001010', state: 'Gujarat',     city: 'Ahmedabad', description: 'Corrugated cartons, flexible films, labels & offset printing. FSC-certified fibre sources.',                        logoUrl: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&auto=format&fit=crop', warehouse: { name: 'ProPack Plant — Ahmedabad',        addr: 'Sarkhej-Bavla Highway, Moraiya GIDC',          city: 'Ahmedabad', state: 'Gujarat',     pin: '382213' } },
]

// -------- Industry -> product templates ------------------------------------
type ProdTpl = {
  name: string
  hsn: string
  priceRange: [number, number]
  moqRange: [number, number]
  weightKg: number
  measurementUnit: string   // code lookup in units table
  packagingUnit: string
  attrs: Record<string, any>
  brandSlug: string
}
type IndustrySeed = {
  slug: string              // matches industries.slug in the DB
  categorySlug: string      // preferred category slug to attach; falls back to any leaf under industry
  imageQuery: string        // Unsplash keyword used to build image URL
  templates: ProdTpl[]
}
const INDUSTRIES: IndustrySeed[] = [
  {
    slug: 'fashion-textile-lifestyle',
    categorySlug: 'apparel-textiles',
    imageQuery: 'fashion',
    templates: [
      { name: 'Cotton Round-Neck T-Shirt (Wholesale Lot)',   hsn: '6109', priceRange: [180, 320],   moqRange: [50, 200], weightKg: 0.20, measurementUnit: 'piece', packagingUnit: 'carton', brandSlug: 'orion-mills',  attrs: { fabric: 'cotton',    size: ['M','L','XL'],     color: '#0B1D3A', gsm: 180, pattern: 'solid'    } },
      { name: 'Denim Slim-Fit Jeans (Men)',                  hsn: '6203', priceRange: [420, 950],   moqRange: [24, 100], weightKg: 0.55, measurementUnit: 'piece', packagingUnit: 'carton', brandSlug: 'orion-mills',  attrs: { fabric: 'denim',     size: ['M','L','XL','XXL'], color:'#1E293B', gsm: 340, pattern:'solid'    } },
      { name: 'Handloom Cotton Kurta Set',                   hsn: '6203', priceRange: [550, 1200],  moqRange: [24, 80],  weightKg: 0.45, measurementUnit: 'piece', packagingUnit: 'carton', brandSlug: 'swadeshi-fab', attrs: { fabric: 'cotton',    size: ['S','M','L'],       color:'#8B5E3C', pattern:'printed' } },
      { name: 'Silk Banarasi Saree',                         hsn: '5007', priceRange: [1500, 2500], moqRange: [10, 40],  weightKg: 0.75, measurementUnit: 'piece', packagingUnit: 'box',    brandSlug: 'swadeshi-fab', attrs: { fabric: 'silk',      size: ['M'],                color:'#7B1E3E', pattern:'printed' } },
      { name: 'Formal Full-Sleeve Shirt (Men)',              hsn: '6205', priceRange: [280, 680],   moqRange: [30, 120], weightKg: 0.25, measurementUnit: 'piece', packagingUnit: 'carton', brandSlug: 'orion-mills',  attrs: { fabric: 'polyester', size: ['S','M','L','XL'], color:'#F5F5F5', gsm: 140, pattern:'checked' } },
      { name: 'Casual Chinos Trouser',                       hsn: '6203', priceRange: [390, 850],   moqRange: [24, 80],  weightKg: 0.40, measurementUnit: 'piece', packagingUnit: 'carton', brandSlug: 'orion-mills',  attrs: { fabric: 'cotton',    size: ['M','L','XL'],       color:'#22333B', gsm: 220, pattern:'solid'    } },
      { name: 'Ladies Cotton Nightsuit',                     hsn: '6208', priceRange: [220, 520],   moqRange: [40, 150], weightKg: 0.30, measurementUnit: 'piece', packagingUnit: 'carton', brandSlug: 'orion-mills',  attrs: { fabric: 'cotton',    size: ['S','M','L','XL'], color:'#B39CD0', gsm: 140, pattern:'printed'} },
      { name: 'Poly-Blend Track Pants',                      hsn: '6203', priceRange: [190, 450],   moqRange: [40, 200], weightKg: 0.35, measurementUnit: 'piece', packagingUnit: 'carton', brandSlug: 'orion-mills',  attrs: { fabric: 'polyester', size: ['S','M','L','XL','XXL'], color:'#111111', gsm: 200, pattern:'striped' } },
      { name: 'Kids Cotton Rainbow T-Shirt (Pack of 6)',     hsn: '6109', priceRange: [400, 900],   moqRange: [20, 80],  weightKg: 0.60, measurementUnit: 'set',   packagingUnit: 'carton', brandSlug: 'swadeshi-fab', attrs: { fabric: 'cotton',    size: ['S','M','L'],       color:'#FF7043', pattern:'printed' } },
      { name: 'Winter Puffer Jacket',                        hsn: '6201', priceRange: [890, 2400],  moqRange: [10, 50],  weightKg: 0.80, measurementUnit: 'piece', packagingUnit: 'carton', brandSlug: 'orion-mills',  attrs: { fabric: 'polyester', size: ['M','L','XL','XXL'], color:'#0B0B0B', gsm: 300, pattern:'solid' } },
    ],
  },
  {
    slug: 'fmcg-food-grocery',
    categorySlug: 'food-beverages',
    imageQuery: 'grocery-store',
    templates: [
      { name: 'Basmati Rice Premium — 25 kg Bag',            hsn: '1006', priceRange: [1400, 2400], moqRange: [10, 50],  weightKg: 25.0, measurementUnit: 'kg',   packagingUnit: 'bag',    brandSlug: 'tata-consumer', attrs: { pack_size: 25000, shelf_life: 730, veg_nonveg: 'veg',    fssai_no: '11517001000234', storage: 'ambient' } },
      { name: 'Refined Sunflower Oil — 15 L Tin',            hsn: '1512', priceRange: [1900, 2800], moqRange: [10, 40],  weightKg: 14.5, measurementUnit: 'litre',packagingUnit: 'can',    brandSlug: 'greenspice',    attrs: { pack_size: 15000, shelf_life: 365, veg_nonveg: 'veg',    fssai_no: '11517001000235', storage: 'ambient' } },
      { name: 'Turmeric Powder Premium — 1 kg Pack',         hsn: '0910', priceRange: [180, 320],   moqRange: [50, 300], weightKg: 1.05, measurementUnit: 'kg',   packagingUnit: 'pack',   brandSlug: 'greenspice',    attrs: { pack_size: 1000,  shelf_life: 540, veg_nonveg: 'veg',    fssai_no: '11517001000236', storage: 'ambient' } },
      { name: 'Marie Biscuits — Carton of 96 Packs',         hsn: '1905', priceRange: [850, 1400],  moqRange: [10, 60],  weightKg: 8.60, measurementUnit: 'carton',packagingUnit:'carton', brandSlug: 'britannia',     attrs: { pack_size: 90,    shelf_life: 180, veg_nonveg: 'veg',    fssai_no: '11517001000237', storage: 'ambient' } },
      { name: 'Assam CTC Black Tea — 5 kg Bulk',             hsn: '0902', priceRange: [1400, 2100], moqRange: [10, 50],  weightKg: 5.10, measurementUnit: 'kg',   packagingUnit: 'sack',   brandSlug: 'tata-consumer', attrs: { pack_size: 5000,  shelf_life: 730, veg_nonveg: 'veg',    fssai_no: '11517001000238', storage: 'ambient' } },
      { name: 'Amul Butter Salted — 100g Pack (Carton 30)',  hsn: '0405', priceRange: [1300, 1800], moqRange: [10, 40],  weightKg: 3.10, measurementUnit: 'carton',packagingUnit:'carton', brandSlug: 'amul',          attrs: { pack_size: 100,   shelf_life: 180, veg_nonveg: 'veg',    fssai_no: '11517001000239', storage: 'chilled' } },
      { name: 'Instant Noodles Masala — Case of 48',         hsn: '1902', priceRange: [720, 1100],  moqRange: [20, 100], weightKg: 4.80, measurementUnit: 'carton',packagingUnit:'carton', brandSlug: 'parle',         attrs: { pack_size: 70,    shelf_life: 270, veg_nonveg: 'veg',    fssai_no: '11517001000240', storage: 'ambient' } },
      { name: 'Chyawanprash Immunity 1kg (Carton 12)',       hsn: '2106', priceRange: [2200, 3200], moqRange: [6, 30],   weightKg: 12.5, measurementUnit: 'carton',packagingUnit:'carton', brandSlug: 'dabur',         attrs: { pack_size: 1000,  shelf_life: 730, veg_nonveg: 'veg',    fssai_no: '11517001000241', storage: 'ambient' } },
      { name: 'Frozen Chicken Breast (Case 10 kg)',          hsn: '0207', priceRange: [1800, 2600], moqRange: [5, 20],   weightKg: 10.0, measurementUnit: 'kg',   packagingUnit: 'carton', brandSlug: 'greenspice',    attrs: { pack_size: 10000, shelf_life: 180, veg_nonveg: 'nonveg', fssai_no: '11517001000242', storage: 'frozen'  } },
      { name: 'Toothpaste 200g — Carton of 48',              hsn: '3306', priceRange: [1900, 2600], moqRange: [10, 60],  weightKg: 10.5, measurementUnit: 'carton',packagingUnit:'carton', brandSlug: 'dabur',         attrs: { pack_size: 200,   shelf_life: 730, veg_nonveg: 'veg',    fssai_no: '11517001000243', storage: 'ambient' } },
    ],
  },
  {
    slug: 'electronics-electrical-tech',
    categorySlug: 'electronics-appliances',
    imageQuery: 'electronics',
    templates: [
      { name: 'LED Smart TV 43-inch 4K',                     hsn: '8528', priceRange: [22000, 34000], moqRange: [3, 20], weightKg: 8.5, measurementUnit: 'piece', packagingUnit: 'carton', brandSlug: 'samsung',   attrs: { voltage: 220, warranty: 24, power: 90,  connectivity: ['wifi','bt','hdmi'], display_size: 43 } },
      { name: 'Front-Load Washing Machine 7 kg',             hsn: '8450', priceRange: [26000, 42000], moqRange: [2, 12], weightKg: 65,  measurementUnit: 'piece', packagingUnit: 'carton', brandSlug: 'lg',        attrs: { voltage: 220, warranty: 24, power: 550,  connectivity: [] } },
      { name: 'Split AC 1.5 Ton 3-Star Inverter',            hsn: '8415', priceRange: [28000, 38000], moqRange: [2, 15], weightKg: 48,  measurementUnit: 'piece', packagingUnit: 'carton', brandSlug: 'panasonic', attrs: { voltage: 220, warranty: 60, power: 1450, connectivity: [] } },
      { name: 'Ceiling Fan 1200mm 5-Star',                   hsn: '8414', priceRange: [1400, 2600],   moqRange: [10, 60],weightKg: 4.5, measurementUnit: 'piece', packagingUnit: 'carton', brandSlug: 'havells',   attrs: { voltage: 220, warranty: 24, power: 50 } },
      { name: 'LED Batten Tube 22W (Case of 20)',            hsn: '9405', priceRange: [4200, 6800],   moqRange: [5, 30], weightKg: 8.0, measurementUnit: 'carton',packagingUnit:'carton', brandSlug: 'philips',   attrs: { voltage: 220, warranty: 24, power: 22 } },
      { name: 'Modular Switch 16A (Box of 100)',             hsn: '8536', priceRange: [3500, 5200],   moqRange: [5, 40], weightKg: 4.2, measurementUnit: 'box',   packagingUnit: 'box',    brandSlug: 'anchor',    attrs: { voltage: 240, warranty: 60, power: 4 } },
      { name: 'MCB 32A Single Pole (Pack 50)',               hsn: '8536', priceRange: [2400, 3800],   moqRange: [10, 60],weightKg: 3.0, measurementUnit: 'pack',  packagingUnit: 'box',    brandSlug: 'schneider', attrs: { voltage: 240, warranty: 60, power: 0 } },
      { name: 'Mixer Grinder 750W',                          hsn: '8509', priceRange: [1900, 3400],   moqRange: [5, 40], weightKg: 3.6, measurementUnit: 'piece', packagingUnit: 'carton', brandSlug: 'bajaj',     attrs: { voltage: 220, warranty: 24, power: 750 } },
      { name: 'Bluetooth Wireless Earbuds',                  hsn: '8518', priceRange: [1200, 2800],   moqRange: [10, 80],weightKg: 0.10, measurementUnit: 'piece',packagingUnit: 'box',   brandSlug: 'voltacore', attrs: { voltage: 5,   warranty: 12, power: 1,  connectivity: ['bt','usb'] } },
      { name: 'Solar Panel 100W Poly',                       hsn: '8541', priceRange: [3200, 4600],   moqRange: [5, 30], weightKg: 7.5, measurementUnit: 'piece', packagingUnit: 'pallet', brandSlug: 'voltacore', attrs: { voltage: 18,  warranty: 60, power: 100 } },
    ],
  },
  {
    slug: 'automobile-ev',
    categorySlug: 'automotive',
    imageQuery: 'automobile',
    templates: [
      { name: 'Passenger Car Front Brake Pad Set',           hsn: '8708', priceRange: [420, 950],   moqRange: [10, 60], weightKg: 1.2, measurementUnit: 'set',   packagingUnit: 'box',    brandSlug: 'titan-auto',  attrs: { vehicle_type: '4w', oem_ref: 'FBP-4W-STD', material: 'Semi-metallic ceramic', warranty_km: 40000 } },
      { name: '2W Chain Sprocket Kit',                       hsn: '8714', priceRange: [380, 720],   moqRange: [20, 100], weightKg: 1.5, measurementUnit: 'set',  packagingUnit: 'box',    brandSlug: 'titan-auto',  attrs: { vehicle_type: '2w', oem_ref: 'CSK-2W-125', material: 'EN-19 steel', warranty_km: 25000 } },
      { name: 'Truck Air Filter Element',                    hsn: '8421', priceRange: [280, 580],   moqRange: [20, 100], weightKg: 1.0, measurementUnit: 'piece',packagingUnit: 'carton', brandSlug: 'bosch',       attrs: { vehicle_type: 'cv', oem_ref: 'BAF-CV-3512', material: 'Paper media', warranty_km: 60000 } },
      { name: 'Car Engine Oil 5W-30 (Case 12 × 1L)',         hsn: '2710', priceRange: [3400, 4800], moqRange: [5, 40],   weightKg: 12.5, measurementUnit: 'carton',packagingUnit:'carton', brandSlug: 'bosch',       attrs: { vehicle_type: '4w', oem_ref: 'EO-5W30-12L', material: 'Fully-synthetic', warranty_km: 10000 } },
      { name: 'Motorcycle Tyre 90/90-17',                    hsn: '4011', priceRange: [1400, 2400], moqRange: [10, 40],  weightKg: 3.4, measurementUnit: 'piece', packagingUnit: 'carton', brandSlug: 'titan-auto',  attrs: { vehicle_type: '2w', oem_ref: 'TR-2W-9090', material: 'Rubber compound', warranty_km: 20000 } },
      { name: '3W Auto-Rickshaw Battery 12V 100Ah',          hsn: '8507', priceRange: [8200, 11200],moqRange: [3, 20],   weightKg: 24.0, measurementUnit: 'piece',packagingUnit: 'carton', brandSlug: 'panasonic',   attrs: { vehicle_type: '3w', oem_ref: 'BAT-3W-100', material: 'Lead-acid', warranty_km: 0 } },
      { name: 'EV Scooter Charging Cable 3.3 kW',            hsn: '8544', priceRange: [1900, 3100], moqRange: [5, 40],   weightKg: 2.0, measurementUnit: 'piece', packagingUnit: 'carton', brandSlug: 'voltacore',   attrs: { vehicle_type: 'ev', oem_ref: 'EVC-33-Type2', material: 'PVC + copper', warranty_km: 0 } },
      { name: 'Windshield Wiper Blade Pair 22"+18"',         hsn: '8512', priceRange: [340, 680],   moqRange: [20, 100], weightKg: 0.4, measurementUnit: 'pair', packagingUnit: 'box',    brandSlug: 'bosch',       attrs: { vehicle_type: '4w', oem_ref: 'WB-2218', material: 'Rubber + steel', warranty_km: 20000 } },
      { name: 'HD LED Headlight Bulb H4 (Pair)',             hsn: '8539', priceRange: [420, 780],   moqRange: [20, 100], weightKg: 0.2, measurementUnit: 'pair', packagingUnit: 'box',    brandSlug: 'philips',     attrs: { vehicle_type: '4w', oem_ref: 'HL-H4-LED', material: 'PC lens', warranty_km: 30000 } },
      { name: 'EV Lithium Battery Pack 60V 30Ah',            hsn: '8507', priceRange: [26000, 38000],moqRange: [1, 10],  weightKg: 12.0, measurementUnit: 'piece',packagingUnit: 'carton', brandSlug: 'voltacore',   attrs: { vehicle_type: 'ev', oem_ref: 'LIB-60-30', material: 'Li-ion NMC', warranty_km: 60000 } },
    ],
  },
  {
    slug: 'building-materials-hardware',
    categorySlug: 'construction',
    imageQuery: 'construction',
    templates: [
      { name: 'OPC 53 Grade Cement — 50 kg Bag',             hsn: '2523', priceRange: [340, 490],   moqRange: [50, 500], weightKg: 50.5, measurementUnit: 'bag',  packagingUnit: 'bag',    brandSlug: 'ultratech',   attrs: { grade: 'OPC-53',  bag_weight: 50, is_certified: true } },
      { name: 'White Cement — 25 kg Bag',                    hsn: '2523', priceRange: [520, 720],   moqRange: [20, 200], weightKg: 25.4, measurementUnit: 'bag',  packagingUnit: 'bag',    brandSlug: 'jk-cement',   attrs: { grade: 'White',   bag_weight: 25, is_certified: true } },
      { name: 'TMT Steel Bar Fe500 — 8mm (Bundle 20 kg)',    hsn: '7214', priceRange: [1400, 1900], moqRange: [20, 200], weightKg: 20.5, measurementUnit: 'bundle',packagingUnit:'bundle', brandSlug: 'bharatcem',   attrs: { grade: 'Fe500',   bag_weight: 0,  is_certified: true } },
      { name: 'Vitrified Floor Tile 600×600 mm (Box 4 pcs)', hsn: '6907', priceRange: [420, 680],   moqRange: [50, 500], weightKg: 21.0, measurementUnit: 'box',  packagingUnit: 'box',    brandSlug: 'bharatcem',   attrs: { grade: 'PGVT',    bag_weight: 0,  is_certified: true } },
      { name: 'Wall Paint White 20L Emulsion',               hsn: '3209', priceRange: [3800, 5400], moqRange: [5, 30],   weightKg: 22.0, measurementUnit: 'can',  packagingUnit: 'can',    brandSlug: 'asian-paints',attrs: { grade: 'Premium', bag_weight: 0,  is_certified: false } },
      { name: 'Enamel Paint Ivory 4L',                       hsn: '3208', priceRange: [820, 1300],  moqRange: [10, 60],  weightKg: 4.5, measurementUnit: 'can',  packagingUnit: 'can',    brandSlug: 'berger-paints',attrs:{ grade: 'Enamel',   bag_weight: 0,  is_certified: false } },
      { name: 'Ceramic Wall Tile 300×450 mm (Box 8 pcs)',    hsn: '6907', priceRange: [320, 520],   moqRange: [50, 400], weightKg: 22.5, measurementUnit: 'box',  packagingUnit: 'box',    brandSlug: 'bharatcem',   attrs: { grade: 'Wall',    bag_weight: 0,  is_certified: true } },
      { name: 'PVC Water Pipe 25mm × 6m (Bundle 10)',        hsn: '3917', priceRange: [1600, 2400], moqRange: [10, 80],  weightKg: 6.0, measurementUnit: 'bundle',packagingUnit:'bundle', brandSlug: 'bharatcem',   attrs: { grade: 'ISI-4985',bag_weight: 0,  is_certified: true } },
      { name: 'M-Seal Epoxy Compound (Carton 24)',           hsn: '3506', priceRange: [980, 1400],  moqRange: [10, 60],  weightKg: 3.6, measurementUnit: 'carton',packagingUnit:'carton', brandSlug: 'pidilite',    attrs: { grade: 'Std',     bag_weight: 0,  is_certified: false } },
      { name: 'Wall Putty 40 kg Bag',                        hsn: '3214', priceRange: [880, 1300],  moqRange: [10, 80],  weightKg: 40.5, measurementUnit: 'bag',  packagingUnit: 'bag',    brandSlug: 'asian-paints',attrs: { grade: 'Std',     bag_weight: 40, is_certified: true } },
    ],
  },
  {
    slug: 'industrial-machinery',
    categorySlug: 'industrial-machinery',
    imageQuery: 'machinery',
    templates: [
      { name: 'Bench Drilling Machine 13 mm',                hsn: '8459', priceRange: [8500, 14000],  moqRange: [1, 8],  weightKg: 45,  measurementUnit: 'piece', packagingUnit: 'crate',  brandSlug: 'indomech', attrs: { motor_power: 0.5,  phase: 'single', automation: 'manual', capacity: 30 } },
      { name: '5-Ton Chain Pulley Block',                    hsn: '8425', priceRange: [7200, 11000],  moqRange: [1, 10], weightKg: 22,  measurementUnit: 'piece', packagingUnit: 'crate',  brandSlug: 'indomech', attrs: { motor_power: 0,    phase: 'single', automation: 'manual', capacity: 5000 } },
      { name: 'Air Compressor 100 L Twin-Cylinder',          hsn: '8414', priceRange: [22000, 34000], moqRange: [1, 5],  weightKg: 90,  measurementUnit: 'piece', packagingUnit: 'crate',  brandSlug: 'indomech', attrs: { motor_power: 2.2,  phase: 'single', automation: 'semi',   capacity: 250 } },
      { name: 'Submersible Water Pump 1 HP',                 hsn: '8413', priceRange: [4200, 6800],   moqRange: [3, 20], weightKg: 12,  measurementUnit: 'piece', packagingUnit: 'carton', brandSlug: 'bosch',    attrs: { motor_power: 0.75, phase: 'single', automation: 'manual', capacity: 3000 } },
      { name: 'Angle Grinder 4-inch 850W',                   hsn: '8467', priceRange: [1900, 2800],   moqRange: [5, 40], weightKg: 2.0, measurementUnit: 'piece', packagingUnit: 'box',    brandSlug: 'bosch',    attrs: { motor_power: 0.85, phase: 'single', automation: 'manual', capacity: 12000 } },
      { name: 'CNC Vertical Milling Machine (Compact)',      hsn: '8459', priceRange: [180000,240000],moqRange: [1, 3],  weightKg: 1200,measurementUnit: 'piece', packagingUnit: 'pallet', brandSlug: 'indomech', attrs: { motor_power: 5.5,  phase: 'three',  automation: 'cnc',    capacity: 8 } },
      { name: 'MIG Welding Machine 250A',                    hsn: '8515', priceRange: [24000, 34000], moqRange: [1, 8],  weightKg: 55,  measurementUnit: 'piece', packagingUnit: 'crate',  brandSlug: 'indomech', attrs: { motor_power: 6.0,  phase: 'three',  automation: 'semi',   capacity: 250 } },
      { name: 'Hydraulic Press 25 Ton Manual',               hsn: '8462', priceRange: [45000, 62000], moqRange: [1, 4],  weightKg: 320, measurementUnit: 'piece', packagingUnit: 'pallet', brandSlug: 'indomech', attrs: { motor_power: 0,    phase: 'single', automation: 'manual', capacity: 25000 } },
      { name: 'Injection Moulding Machine 60T',              hsn: '8477', priceRange: [280000,360000],moqRange: [1, 2],  weightKg: 2400,measurementUnit: 'piece', packagingUnit: 'pallet', brandSlug: 'indomech', attrs: { motor_power: 7.5,  phase: 'three',  automation: 'cnc',    capacity: 60 } },
      { name: 'Pneumatic Impact Wrench',                     hsn: '8467', priceRange: [3400, 5200],   moqRange: [3, 30], weightKg: 2.4, measurementUnit: 'piece', packagingUnit: 'box',    brandSlug: 'bosch',    attrs: { motor_power: 0,    phase: 'single', automation: 'manual', capacity: 620 } },
    ],
  },
  {
    slug: 'agriculture-allied',
    categorySlug: 'agriculture',
    imageQuery: 'farming',
    templates: [
      { name: 'Hybrid Tomato Seeds — 250g Pouch',            hsn: '1209', priceRange: [420, 680],   moqRange: [20, 100], weightKg: 0.26, measurementUnit: 'pack',   packagingUnit: 'pack',  brandSlug: 'harvest-gold', attrs: { input_type: 'seed',       organic: false, season: 'all' } },
      { name: 'Urea Fertilizer — 45 kg Bag',                 hsn: '3102', priceRange: [280, 380],   moqRange: [50, 500], weightKg: 45.2, measurementUnit: 'bag',    packagingUnit: 'bag',   brandSlug: 'harvest-gold', attrs: { input_type: 'fertilizer', organic: false, season: 'all' } },
      { name: 'DAP Fertilizer — 50 kg Bag',                  hsn: '3105', priceRange: [1200, 1600], moqRange: [30, 300], weightKg: 50.5, measurementUnit: 'bag',    packagingUnit: 'bag',   brandSlug: 'harvest-gold', attrs: { input_type: 'fertilizer', organic: false, season: 'kharif' } },
      { name: 'Organic Vermicompost — 25 kg Bag',            hsn: '3101', priceRange: [220, 340],   moqRange: [50, 300], weightKg: 25.3, measurementUnit: 'bag',    packagingUnit: 'bag',   brandSlug: 'harvest-gold', attrs: { input_type: 'fertilizer', organic: true,  season: 'all' } },
      { name: 'Bio Pesticide Neem Oil 5L',                   hsn: '3808', priceRange: [1400, 1900], moqRange: [10, 60],  weightKg: 5.2,  measurementUnit: 'can',    packagingUnit: 'can',   brandSlug: 'harvest-gold', attrs: { input_type: 'pesticide',  organic: true,  season: 'all' } },
      { name: 'Cattle Feed Concentrate — 50 kg',             hsn: '2309', priceRange: [1100, 1500], moqRange: [20, 200], weightKg: 50.4, measurementUnit: 'bag',    packagingUnit: 'sack',  brandSlug: 'harvest-gold', attrs: { input_type: 'equipment',  organic: false, season: 'all' } },
      { name: 'Drip Irrigation Kit — 1 Acre',                hsn: '8424', priceRange: [11500, 14500],moqRange: [1, 10],  weightKg: 32,   measurementUnit: 'set',    packagingUnit: 'carton',brandSlug: 'harvest-gold', attrs: { input_type: 'equipment',  organic: false, season: 'all' } },
      { name: 'Knapsack Sprayer 16L Battery',                hsn: '8424', priceRange: [2400, 3400], moqRange: [5, 40],   weightKg: 5.0,  measurementUnit: 'piece',  packagingUnit: 'box',   brandSlug: 'harvest-gold', attrs: { input_type: 'equipment',  organic: false, season: 'all' } },
      { name: 'Paddy Seeds Basmati — 40 kg Bag',             hsn: '1006', priceRange: [3200, 4200], moqRange: [10, 60],  weightKg: 40.3, measurementUnit: 'bag',    packagingUnit: 'bag',   brandSlug: 'harvest-gold', attrs: { input_type: 'seed',       organic: false, season: 'kharif' } },
      { name: 'Cattle Nutrition Blocks — Carton 20',         hsn: '2309', priceRange: [1900, 2500], moqRange: [5, 40],   weightKg: 22,   measurementUnit: 'carton', packagingUnit: 'carton',brandSlug: 'harvest-gold', attrs: { input_type: 'equipment',  organic: false, season: 'all' } },
    ],
  },
  {
    slug: 'healthcare-medical-pharma',
    categorySlug: 'healthcare',
    imageQuery: 'medical',
    templates: [
      { name: 'Digital Thermometer — Carton of 50',          hsn: '9025', priceRange: [3800, 5200],  moqRange: [4, 30], weightKg: 3.5, measurementUnit: 'carton',packagingUnit: 'carton', brandSlug: 'medipure', attrs: { device_class: 'A', sterile: false, license_no: 'MD-XV-102301', use_type: 'multi' } },
      { name: 'BP Monitor Automatic Arm',                    hsn: '9018', priceRange: [1800, 2600],  moqRange: [5, 50], weightKg: 0.6, measurementUnit: 'piece', packagingUnit: 'box',    brandSlug: 'medipure', attrs: { device_class: 'B', sterile: false, license_no: 'MD-XV-102302', use_type: 'multi' } },
      { name: 'Pulse Oximeter Fingertip (Carton 50)',        hsn: '9018', priceRange: [3800, 5200],  moqRange: [4, 30], weightKg: 2.5, measurementUnit: 'carton',packagingUnit: 'carton', brandSlug: 'medipure', attrs: { device_class: 'A', sterile: false, license_no: 'MD-XV-102303', use_type: 'multi' } },
      { name: 'Nitrile Examination Gloves (Case 10 boxes)',  hsn: '4015', priceRange: [3400, 4800],  moqRange: [5, 60], weightKg: 8.5, measurementUnit: 'carton',packagingUnit: 'carton', brandSlug: 'medipure', attrs: { device_class: 'A', sterile: false, license_no: 'MD-XV-102304', use_type: 'single' } },
      { name: 'Surgical Face Mask 3-Ply (Case 2000)',        hsn: '6307', priceRange: [1400, 2200],  moqRange: [5, 100],weightKg: 5.0, measurementUnit: 'carton',packagingUnit: 'carton', brandSlug: 'medipure', attrs: { device_class: 'A', sterile: false, license_no: 'MD-XV-102305', use_type: 'single' } },
      { name: 'IV Cannula 20G (Box 100)',                    hsn: '9018', priceRange: [850, 1300],   moqRange: [10, 80],weightKg: 0.6, measurementUnit: 'box',   packagingUnit: 'box',    brandSlug: 'medipure', attrs: { device_class: 'B', sterile: true,  license_no: 'MD-XV-102306', use_type: 'single' } },
      { name: 'Autoclavable Surgical Kit',                   hsn: '9018', priceRange: [4400, 6200],  moqRange: [2, 20], weightKg: 2.2, measurementUnit: 'set',   packagingUnit: 'box',    brandSlug: 'medipure', attrs: { device_class: 'C', sterile: true,  license_no: 'MD-XV-102307', use_type: 'multi' } },
      { name: 'Multivitamin Tablets — Bottle 60 (Carton 50)',hsn: '3004', priceRange: [4800, 6800],  moqRange: [2, 20], weightKg: 5.0, measurementUnit: 'carton',packagingUnit: 'carton', brandSlug: 'dabur',    attrs: { device_class: 'A', sterile: false, license_no: 'DL-XV-102308', use_type: 'multi' } },
      { name: 'Hand Sanitizer 500 ml (Carton 24)',           hsn: '3808', priceRange: [1600, 2400],  moqRange: [4, 40], weightKg: 12.5,measurementUnit: 'carton',packagingUnit: 'carton', brandSlug: 'dabur',    attrs: { device_class: 'A', sterile: false, license_no: 'DL-XV-102309', use_type: 'multi' } },
      { name: 'Rapid Diagnostic Test Kit (Case 500)',        hsn: '3822', priceRange: [8500, 12000], moqRange: [2, 12], weightKg: 5.5, measurementUnit: 'carton',packagingUnit: 'carton', brandSlug: 'medipure', attrs: { device_class: 'B', sterile: true,  license_no: 'MD-XV-102310', use_type: 'single' } },
    ],
  },
  {
    slug: 'home-furniture-kitchen',
    categorySlug: 'home-furniture',
    imageQuery: 'furniture',
    templates: [
      { name: 'Sheesham 3-Seater Sofa',                      hsn: '9401', priceRange: [18000, 25000], moqRange: [1, 4],  weightKg: 65,  measurementUnit: 'piece', packagingUnit: 'crate', brandSlug: 'kanchan-home', attrs: { material: 'wood',      finish: 'Walnut PU',  assembly: 'pre',       seat_capacity: 3 } },
      { name: 'Engineered Wood Office Desk 4-ft',            hsn: '9403', priceRange: [4200, 6800],  moqRange: [2, 20], weightKg: 22,  measurementUnit: 'piece', packagingUnit: 'crate', brandSlug: 'kanchan-home', attrs: { material: 'engineered',finish: 'Wenge laminate',assembly: 'knockdown', seat_capacity: 1 } },
      { name: 'Metal Bunk Bed Hostel-Grade',                 hsn: '9403', priceRange: [8800, 12500], moqRange: [1, 10], weightKg: 60,  measurementUnit: 'piece', packagingUnit: 'crate', brandSlug: 'godrej',       attrs: { material: 'metal',     finish: 'Powder coat',assembly: 'knockdown', seat_capacity: 2 } },
      { name: 'Dining Table Set 6-Seater Marble Top',        hsn: '9403', priceRange: [22000, 25000],moqRange: [1, 4],  weightKg: 120, measurementUnit: 'set',   packagingUnit: 'crate', brandSlug: 'kanchan-home', attrs: { material: 'wood',      finish: 'Marble + Walnut',assembly:'pre',    seat_capacity: 6 } },
      { name: 'Modular Kitchen Cabinet (Base 24-inch)',      hsn: '9403', priceRange: [6500, 9500],  moqRange: [2, 20], weightKg: 28,  measurementUnit: 'piece', packagingUnit: 'crate', brandSlug: 'kanchan-home', attrs: { material: 'engineered',finish: 'HDF',        assembly: 'knockdown', seat_capacity: 0 } },
      { name: 'Pressure Cooker 5L Aluminium',                hsn: '7615', priceRange: [1400, 1900],  moqRange: [10, 60],weightKg: 2.5, measurementUnit: 'piece', packagingUnit: 'carton',brandSlug: 'prestige',     attrs: { material: 'metal',     finish: 'Polished',   assembly: 'pre',       seat_capacity: 0 } },
      { name: 'Non-Stick Cookware Set 4-pc',                 hsn: '7323', priceRange: [1900, 2800],  moqRange: [10, 60],weightKg: 3.4, measurementUnit: 'set',   packagingUnit: 'box',   brandSlug: 'prestige',     attrs: { material: 'metal',     finish: 'PTFE coat',  assembly: 'pre',       seat_capacity: 0 } },
      { name: 'Insulated Water Bottle 1L (Carton 24)',       hsn: '3924', priceRange: [3400, 4800],  moqRange: [4, 40], weightKg: 8.5, measurementUnit: 'carton',packagingUnit:'carton', brandSlug: 'milton',       attrs: { material: 'metal',     finish: 'Double-wall SS',assembly:'pre',    seat_capacity: 0 } },
      { name: 'Plastic Storage Container Set (Case 30)',     hsn: '3924', priceRange: [2100, 3200],  moqRange: [10, 60],weightKg: 7.0, measurementUnit: 'carton',packagingUnit:'carton', brandSlug: 'cello',        attrs: { material: 'plastic',   finish: 'Food-grade',  assembly:'pre',       seat_capacity: 0 } },
      { name: 'Wall-Mount Bookshelf (5 Layer)',              hsn: '9403', priceRange: [3200, 5200],  moqRange: [5, 20], weightKg: 15,  measurementUnit: 'piece', packagingUnit: 'crate', brandSlug: 'kanchan-home', attrs: { material: 'engineered',finish: 'Oak lam',    assembly: 'diy',       seat_capacity: 0 } },
    ],
  },
  {
    slug: 'packaging-printing',
    categorySlug: 'packaging',
    imageQuery: 'packaging-box',
    templates: [
      { name: 'Corrugated Shipping Carton 3-Ply (Bundle 100)', hsn: '4819', priceRange: [1400, 2200], moqRange: [5, 40], weightKg: 22.0, measurementUnit: 'bundle', packagingUnit: 'bundle', brandSlug: 'propack',  attrs: { material: 'corrugated', ply: 3, food_grade: false, printable: true  } },
      { name: 'Corrugated Shipping Carton 5-Ply (Bundle 100)', hsn: '4819', priceRange: [2400, 3400], moqRange: [5, 40], weightKg: 30.0, measurementUnit: 'bundle', packagingUnit: 'bundle', brandSlug: 'propack',  attrs: { material: 'corrugated', ply: 5, food_grade: false, printable: true  } },
      { name: 'Polypropylene Sacks 50 kg (Bundle 100)',        hsn: '6305', priceRange: [1800, 2600], moqRange: [10, 60],weightKg: 12.0, measurementUnit: 'bundle', packagingUnit: 'bundle', brandSlug: 'propack',  attrs: { material: 'pp',        ply: 1, food_grade: true,  printable: true } },
      { name: 'Food-Grade PE Cling Film 30cm × 300m',          hsn: '3923', priceRange: [280, 420],   moqRange: [20, 200],weightKg: 1.5, measurementUnit: 'roll',   packagingUnit: 'roll',   brandSlug: 'propack',  attrs: { material: 'pe',        ply: 1, food_grade: true,  printable: false } },
      { name: 'Adhesive Label Roll 100 × 50 mm (2000/roll)',   hsn: '4821', priceRange: [340, 520],   moqRange: [20, 200],weightKg: 0.8, measurementUnit: 'roll',   packagingUnit: 'roll',   brandSlug: 'propack',  attrs: { material: 'paper',     ply: 1, food_grade: false, printable: true } },
      { name: 'Kraft Paper Bag with Handle (Bundle 200)',      hsn: '4819', priceRange: [880, 1300],  moqRange: [10, 60], weightKg: 6.5, measurementUnit: 'bundle', packagingUnit: 'bundle', brandSlug: 'propack',  attrs: { material: 'paper',     ply: 1, food_grade: true,  printable: true } },
      { name: 'BOPP Tape 48mm × 65m (Case of 72)',             hsn: '3919', priceRange: [1400, 2100], moqRange: [10, 60], weightKg: 8.5, measurementUnit: 'carton', packagingUnit: 'carton', brandSlug: 'propack',  attrs: { material: 'pp',        ply: 1, food_grade: false, printable: false } },
      { name: 'Aluminium Foil Roll 30cm × 200m (Case 24)',     hsn: '7607', priceRange: [4200, 5800], moqRange: [4, 40],  weightKg: 24.0,measurementUnit: 'carton', packagingUnit: 'carton', brandSlug: 'propack',  attrs: { material: 'foil',      ply: 1, food_grade: true,  printable: false } },
      { name: 'Bubble Wrap Roll 1m × 100m',                    hsn: '3923', priceRange: [1100, 1700], moqRange: [10, 60], weightKg: 6.0, measurementUnit: 'roll',   packagingUnit: 'roll',   brandSlug: 'propack',  attrs: { material: 'pe',        ply: 1, food_grade: false, printable: false } },
      { name: 'Printed Mailer Envelopes A4 (Bundle 500)',      hsn: '4817', priceRange: [1900, 2800], moqRange: [5, 40],  weightKg: 5.5, measurementUnit: 'bundle', packagingUnit: 'bundle', brandSlug: 'propack',  attrs: { material: 'paper',     ply: 1, food_grade: false, printable: true } },
    ],
  },
  {
    slug: 'chemicals-raw-materials',
    categorySlug: 'chemicals',
    imageQuery: 'chemical-industry',
    templates: [
      { name: 'Caustic Soda Flakes — 25 kg Bag',              hsn: '2815', priceRange: [1900, 2800], moqRange: [10, 100],weightKg: 25.2, measurementUnit: 'bag',    packagingUnit: 'bag',   brandSlug: 'chembharat', attrs: { form: 'powder',  purity: 98,  cas_number: '1310-73-2',  hazard_class: 'Class 8' } },
      { name: 'Industrial Sulphuric Acid 98% — 25 L Drum',    hsn: '2807', priceRange: [1400, 2100], moqRange: [10, 60], weightKg: 46,   measurementUnit: 'drum',   packagingUnit: 'drum',  brandSlug: 'chembharat', attrs: { form: 'liquid',  purity: 98,  cas_number: '7664-93-9',  hazard_class: 'Class 8' } },
      { name: 'PP Granules Injection Grade — 25 kg',          hsn: '3902', priceRange: [2200, 3200], moqRange: [40, 400],weightKg: 25.3, measurementUnit: 'bag',    packagingUnit: 'bag',   brandSlug: 'chembharat', attrs: { form: 'granule', purity: 99,  cas_number: '9003-07-0',  hazard_class: 'Non-Haz' } },
      { name: 'LDPE Granules Film Grade — 25 kg',             hsn: '3901', priceRange: [2100, 3200], moqRange: [40, 400],weightKg: 25.3, measurementUnit: 'bag',    packagingUnit: 'bag',   brandSlug: 'chembharat', attrs: { form: 'granule', purity: 99,  cas_number: '9002-88-4',  hazard_class: 'Non-Haz' } },
      { name: 'Reactive Dye Turquoise Blue — 25 kg',          hsn: '3204', priceRange: [8800, 12500],moqRange: [4, 40],  weightKg: 25.0, measurementUnit: 'drum',   packagingUnit: 'drum',  brandSlug: 'chembharat', attrs: { form: 'powder',  purity: 95,  cas_number: '12225-83-1', hazard_class: 'Class 9' } },
      { name: 'Acrylic Emulsion Binder — 200 kg Drum',        hsn: '3906', priceRange: [24000, 34000],moqRange: [1, 10], weightKg: 205,  measurementUnit: 'drum',   packagingUnit: 'drum',  brandSlug: 'chembharat', attrs: { form: 'liquid',  purity: 45,  cas_number: '9003-01-4',  hazard_class: 'Non-Haz' } },
      { name: 'Titanium Dioxide Rutile — 25 kg',              hsn: '3206', priceRange: [4400, 6200], moqRange: [10, 80], weightKg: 25.1, measurementUnit: 'bag',    packagingUnit: 'bag',   brandSlug: 'chembharat', attrs: { form: 'powder',  purity: 94,  cas_number: '13463-67-7', hazard_class: 'Non-Haz' } },
      { name: 'Adhesive Solvent Cement — 500 g (Carton 24)',  hsn: '3506', priceRange: [1800, 2600], moqRange: [10, 60], weightKg: 12.0, measurementUnit: 'carton', packagingUnit: 'carton',brandSlug: 'pidilite',   attrs: { form: 'liquid',  purity: 60,  cas_number: '9002-89-5',  hazard_class: 'Class 3' } },
      { name: 'Sodium Carbonate Soda Ash — 50 kg',            hsn: '2836', priceRange: [1400, 2100], moqRange: [20, 200],weightKg: 50.4, measurementUnit: 'bag',    packagingUnit: 'bag',   brandSlug: 'chembharat', attrs: { form: 'powder',  purity: 99,  cas_number: '497-19-8',   hazard_class: 'Non-Haz' } },
      { name: 'Zinc Oxide Cosmetic Grade — 25 kg',            hsn: '2817', priceRange: [4800, 6800], moqRange: [4, 40],  weightKg: 25.2, measurementUnit: 'bag',    packagingUnit: 'bag',   brandSlug: 'chembharat', attrs: { form: 'powder',  purity: 99,  cas_number: '1314-13-2',  hazard_class: 'Non-Haz' } },
    ],
  },
  {
    slug: 'business-retail-supplies',
    categorySlug: 'business-supplies',
    imageQuery: 'office-supplies',
    templates: [
      { name: 'A4 Copier Paper 75 GSM (Box of 10 Reams)',     hsn: '4802', priceRange: [2200, 3200], moqRange: [4, 40], weightKg: 24.0, measurementUnit: 'box',   packagingUnit: 'box',   brandSlug: 'officemax-india', attrs: { use_type: 'office',  material: 'Wood-pulp paper',  brandable: false } },
      { name: 'Executive Ball-Pen Blue (Box 500)',            hsn: '9608', priceRange: [1200, 1800], moqRange: [4, 40], weightKg: 4.0,  measurementUnit: 'box',   packagingUnit: 'box',   brandSlug: 'officemax-india', attrs: { use_type: 'office',  material: 'ABS plastic',      brandable: true } },
      { name: 'Sticky Note Pad 3×3" (Carton 60 pads)',        hsn: '4820', priceRange: [900, 1400],  moqRange: [10, 40],weightKg: 3.5,  measurementUnit: 'carton',packagingUnit:'carton', brandSlug: 'officemax-india', attrs: { use_type: 'office',  material: 'Recycled paper',   brandable: true } },
      { name: 'Retail Thermal POS Roll 80mm × 80m (Case 50)', hsn: '4823', priceRange: [1800, 2600], moqRange: [4, 40], weightKg: 12.0, measurementUnit: 'carton',packagingUnit:'carton', brandSlug: 'officemax-india', attrs: { use_type: 'retail',  material: 'Thermal paper',    brandable: false } },
      { name: 'File Folder A4 Ring Binder (Box 20)',          hsn: '4820', priceRange: [1400, 2100], moqRange: [10, 40],weightKg: 8.0,  measurementUnit: 'box',   packagingUnit: 'box',   brandSlug: 'officemax-india', attrs: { use_type: 'office',  material: 'PVC',              brandable: true } },
      { name: 'Whiteboard Marker Set — Blue/Red/Black (Box 100)',hsn:'9608',priceRange: [1100, 1600],moqRange: [10, 40],weightKg: 3.6,  measurementUnit: 'box',   packagingUnit: 'box',   brandSlug: 'officemax-india', attrs: { use_type: 'school',  material: 'Ink cartridge',    brandable: true } },
      { name: 'School Uniform Fabric — Grey (Roll 50m)',      hsn: '5407', priceRange: [3200, 4800], moqRange: [4, 40], weightKg: 12.0, measurementUnit: 'roll',  packagingUnit: 'roll',  brandSlug: 'swadeshi-fab',    attrs: { use_type: 'school',  material: 'Polyester-Viscose',brandable: false } },
      { name: 'Retail Shopping Bags Non-Woven (Bundle 500)',  hsn: '5603', priceRange: [1900, 2800], moqRange: [4, 40], weightKg: 8.0,  measurementUnit: 'bundle',packagingUnit: 'bundle',brandSlug: 'propack',         attrs: { use_type: 'retail',  material: 'Non-woven PP',     brandable: true } },
      { name: 'ID Card Lanyard with Holder (Box 200)',        hsn: '3926', priceRange: [1400, 2100], moqRange: [5, 30], weightKg: 3.0,  measurementUnit: 'box',   packagingUnit: 'box',   brandSlug: 'officemax-india', attrs: { use_type: 'office',  material: 'Polyester + PVC',  brandable: true } },
      { name: 'Office Chair Ergonomic Mesh Back',             hsn: '9401', priceRange: [4400, 6800], moqRange: [2, 12], weightKg: 12.0, measurementUnit: 'piece', packagingUnit: 'carton',brandSlug: 'kanchan-home',    attrs: { use_type: 'office',  material: 'Mesh + metal',     brandable: false } },
    ],
  },
]

// ----------------------------------------------------------------------------
// 1.5  BRANDS + ATTRIBUTE TEMPLATES  (mirrors seed_enterprise_demo.sql for
//      environments where DDL was already applied but INSERTs weren't. The
//      SQL file is still authoritative — run it once in the SQL editor to get
//      the wishlists/recently_viewed tables.)
// ----------------------------------------------------------------------------
type BrandRow = { name: string; slug: string; brand_type: 'global'|'seller'|'oem'|'private_label'; country: string; is_verified: boolean; description: string }
const BRANDS_SEED: BrandRow[] = [
  // Global (26)
  { name: 'Samsung',        slug: 'samsung',        brand_type: 'global', country: 'South Korea', is_verified: true, description: 'Global electronics and appliances leader' },
  { name: 'LG',             slug: 'lg',             brand_type: 'global', country: 'South Korea', is_verified: true, description: 'Home appliances and consumer electronics' },
  { name: 'Sony',           slug: 'sony',           brand_type: 'global', country: 'Japan',       is_verified: true, description: 'Consumer electronics and imaging' },
  { name: 'Philips',        slug: 'philips',        brand_type: 'global', country: 'Netherlands', is_verified: true, description: 'Lighting, appliances and healthcare' },
  { name: 'Bosch',          slug: 'bosch',          brand_type: 'global', country: 'Germany',     is_verified: true, description: 'Power tools, appliances and automotive' },
  { name: 'Panasonic',      slug: 'panasonic',      brand_type: 'global', country: 'Japan',       is_verified: true, description: 'Electronics and battery' },
  { name: 'Whirlpool',      slug: 'whirlpool',      brand_type: 'global', country: 'USA',         is_verified: true, description: 'Home appliances' },
  { name: 'Havells',        slug: 'havells',        brand_type: 'global', country: 'India',       is_verified: true, description: 'Electricals, fans, lighting' },
  { name: 'Anchor',         slug: 'anchor',         brand_type: 'global', country: 'India',       is_verified: true, description: 'Electrical switches & wiring accessories' },
  { name: 'Legrand',        slug: 'legrand',        brand_type: 'global', country: 'France',      is_verified: true, description: 'Electrical & digital infrastructure' },
  { name: 'Schneider',      slug: 'schneider',      brand_type: 'global', country: 'France',      is_verified: true, description: 'Energy management & automation' },
  { name: 'Godrej',         slug: 'godrej',         brand_type: 'global', country: 'India',       is_verified: true, description: 'Appliances, furniture, security' },
  { name: 'Bajaj',          slug: 'bajaj',          brand_type: 'global', country: 'India',       is_verified: true, description: 'Appliances, lighting, EVs' },
  { name: 'Prestige',       slug: 'prestige',       brand_type: 'global', country: 'India',       is_verified: true, description: 'Kitchenware & small appliances' },
  { name: 'Cello',          slug: 'cello',          brand_type: 'global', country: 'India',       is_verified: true, description: 'Housewares and kitchenware' },
  { name: 'Milton',         slug: 'milton',         brand_type: 'global', country: 'India',       is_verified: true, description: 'Insulated ware and hydration' },
  { name: 'Asian Paints',   slug: 'asian-paints',   brand_type: 'global', country: 'India',       is_verified: true, description: 'Decorative paints and coatings' },
  { name: 'Berger Paints',  slug: 'berger-paints',  brand_type: 'global', country: 'India',       is_verified: true, description: 'Paints and industrial coatings' },
  { name: 'JK Cement',      slug: 'jk-cement',      brand_type: 'global', country: 'India',       is_verified: true, description: 'Grey and white cement' },
  { name: 'UltraTech',      slug: 'ultratech',      brand_type: 'global', country: 'India',       is_verified: true, description: "India's largest cement producer" },
  { name: 'Pidilite',       slug: 'pidilite',       brand_type: 'global', country: 'India',       is_verified: true, description: 'Adhesives, sealants & construction chemicals' },
  { name: 'Amul',           slug: 'amul',           brand_type: 'global', country: 'India',       is_verified: true, description: 'Dairy and food products' },
  { name: 'Britannia',      slug: 'britannia',      brand_type: 'global', country: 'India',       is_verified: true, description: 'Biscuits, bakery, dairy' },
  { name: 'Parle',          slug: 'parle',          brand_type: 'global', country: 'India',       is_verified: true, description: 'Biscuits, confectionery, snacks' },
  { name: 'Tata Consumer',  slug: 'tata-consumer',  brand_type: 'global', country: 'India',       is_verified: true, description: 'Tea, coffee, staples' },
  { name: 'Dabur',          slug: 'dabur',          brand_type: 'global', country: 'India',       is_verified: true, description: 'Ayurveda, healthcare, FMCG' },
  // Fictional Indian OEM / private-label (14)
  { name: 'Orion Mills',    slug: 'orion-mills',    brand_type: 'oem',           country: 'India', is_verified: true, description: 'Textile manufacturing brand — fabrics, yarns, uniforms' },
  { name: 'BhaskarMetals',  slug: 'bhaskar-metals', brand_type: 'oem',           country: 'India', is_verified: true, description: 'Steel fabrication and hardware components' },
  { name: 'GreenSpice',     slug: 'greenspice',     brand_type: 'private_label', country: 'India', is_verified: true, description: 'Spices, staples and food essentials' },
  { name: 'VoltaCore',      slug: 'voltacore',      brand_type: 'oem',           country: 'India', is_verified: true, description: 'Consumer electronics OEM & IT accessories' },
  { name: 'TitanAuto',      slug: 'titan-auto',     brand_type: 'oem',           country: 'India', is_verified: true, description: 'Auto components & aftermarket parts' },
  { name: 'BharatCem',      slug: 'bharatcem',      brand_type: 'private_label', country: 'India', is_verified: true, description: 'Cement, RMC and dry mix products' },
  { name: 'IndoMech',       slug: 'indomech',       brand_type: 'oem',           country: 'India', is_verified: true, description: 'Industrial machinery and spares' },
  { name: 'HarvestGold',    slug: 'harvest-gold',   brand_type: 'private_label', country: 'India', is_verified: true, description: 'Farm inputs, seeds and agri equipment' },
  { name: 'MediPure',       slug: 'medipure',       brand_type: 'private_label', country: 'India', is_verified: true, description: 'Medical devices and pharma distribution' },
  { name: 'Kanchan Home',   slug: 'kanchan-home',   brand_type: 'private_label', country: 'India', is_verified: true, description: 'Furniture, decor and kitchenware' },
  { name: 'ProPack',        slug: 'propack',        brand_type: 'oem',           country: 'India', is_verified: true, description: 'Packaging, cartons and printing solutions' },
  { name: 'ChemBharat',     slug: 'chembharat',     brand_type: 'oem',           country: 'India', is_verified: true, description: 'Industrial chemicals and raw materials' },
  { name: 'OfficeMax India',slug: 'officemax-india',brand_type: 'private_label', country: 'India', is_verified: true, description: 'Business supplies, stationery and office gear' },
  { name: 'SwadeshiFab',    slug: 'swadeshi-fab',   brand_type: 'private_label', country: 'India', is_verified: true, description: 'Handloom and Indian craft textiles' },
]

// Attribute template rows, keyed by category slug patterns.
// Each entry: { catSlugs: string[], defs: AttributeDef[] }
type AttrDefSeed = { key: string; label: string; attr_type: string; options: any[]|null; unit: string|null; is_required: boolean; is_filterable: boolean; sort_order: number }
const ATTR_TEMPLATES: Array<{ catSlugs: string[]; defs: AttrDefSeed[] }> = [
  { catSlugs: ['apparel-textiles','apparel','clothing','fabrics-textiles','fabrics','textiles','mens-clothing','womens-clothing','footwear'],
    defs: [
      { key: 'fabric',  label: 'Fabric',    attr_type: 'select',       options: [{value:'cotton',label:'Cotton'},{value:'linen',label:'Linen'},{value:'polyester',label:'Polyester'},{value:'silk',label:'Silk'},{value:'denim',label:'Denim'},{value:'wool',label:'Wool'}], unit: null,   is_required: true,  is_filterable: true, sort_order: 10 },
      { key: 'size',    label: 'Size',      attr_type: 'multi_select', options: [{value:'XS',label:'XS'},{value:'S',label:'S'},{value:'M',label:'M'},{value:'L',label:'L'},{value:'XL',label:'XL'},{value:'XXL',label:'XXL'}],  unit: null,   is_required: true,  is_filterable: true, sort_order: 20 },
      { key: 'color',   label: 'Color',     attr_type: 'color',        options: null, unit: null,   is_required: false, is_filterable: true, sort_order: 30 },
      { key: 'gsm',     label: 'Fabric GSM',attr_type: 'number',       options: null, unit: 'g/m²', is_required: false, is_filterable: true, sort_order: 40 },
      { key: 'pattern', label: 'Pattern',   attr_type: 'select',       options: [{value:'solid',label:'Solid'},{value:'striped',label:'Striped'},{value:'printed',label:'Printed'},{value:'checked',label:'Checked'}], unit: null, is_required: false, is_filterable: true, sort_order: 50 },
    ] },
  { catSlugs: ['food-beverages','fmcg','grocery','beverages','snacks','staples'],
    defs: [
      { key: 'pack_size',  label: 'Pack Size',    attr_type: 'number', options: null, unit: 'g',    is_required: true,  is_filterable: true, sort_order: 10 },
      { key: 'shelf_life', label: 'Shelf Life',   attr_type: 'number', options: null, unit: 'days', is_required: true,  is_filterable: false, sort_order: 20 },
      { key: 'veg_nonveg', label: 'Veg / Non-Veg',attr_type: 'select', options: [{value:'veg',label:'Vegetarian'},{value:'nonveg',label:'Non-Vegetarian'},{value:'vegan',label:'Vegan'}], unit: null, is_required: true,  is_filterable: true, sort_order: 30 },
      { key: 'fssai_no',   label: 'FSSAI License',attr_type: 'text',   options: null, unit: null,   is_required: true,  is_filterable: false, sort_order: 40 },
      { key: 'storage',    label: 'Storage',      attr_type: 'select', options: [{value:'ambient',label:'Ambient'},{value:'chilled',label:'Chilled'},{value:'frozen',label:'Frozen'}], unit: null, is_required: false, is_filterable: true, sort_order: 50 },
    ] },
  { catSlugs: ['electronics-appliances','mobile-phones-accessories','tvs-audio','laptops-computing','home-appliances','electrical','electronics'],
    defs: [
      { key: 'voltage',      label: 'Voltage',      attr_type: 'number',       options: null, unit: 'V',      is_required: true,  is_filterable: true, sort_order: 10 },
      { key: 'warranty',     label: 'Warranty',     attr_type: 'number',       options: null, unit: 'months', is_required: true,  is_filterable: true, sort_order: 20 },
      { key: 'power',        label: 'Power Rating', attr_type: 'number',       options: null, unit: 'W',      is_required: false, is_filterable: true, sort_order: 30 },
      { key: 'connectivity', label: 'Connectivity', attr_type: 'multi_select', options: [{value:'wifi',label:'Wi-Fi'},{value:'bt',label:'Bluetooth'},{value:'usb',label:'USB'},{value:'hdmi',label:'HDMI'},{value:'ethernet',label:'Ethernet'}], unit: null, is_required: false, is_filterable: true, sort_order: 40 },
      { key: 'display_size', label: 'Display Size', attr_type: 'number',       options: null, unit: 'inch',   is_required: false, is_filterable: true, sort_order: 50 },
    ] },
  { catSlugs: ['automotive','auto-parts','vehicles','tyres','ev-supply-chain'],
    defs: [
      { key: 'vehicle_type', label: 'Vehicle Type', attr_type: 'select', options: [{value:'2w',label:'2-Wheeler'},{value:'3w',label:'3-Wheeler'},{value:'4w',label:'4-Wheeler'},{value:'cv',label:'Commercial'},{value:'ev',label:'EV'}], unit: null, is_required: true, is_filterable: true, sort_order: 10 },
      { key: 'oem_ref',      label: 'OEM Reference',attr_type: 'text',   options: null, unit: null, is_required: false, is_filterable: true, sort_order: 20 },
      { key: 'material',     label: 'Material',     attr_type: 'text',   options: null, unit: null, is_required: false, is_filterable: true, sort_order: 30 },
      { key: 'warranty_km',  label: 'Warranty',     attr_type: 'number', options: null, unit: 'km', is_required: false, is_filterable: true, sort_order: 40 },
    ] },
  { catSlugs: ['construction','building-materials','cement','steel','tiles','sanitaryware','hardware'],
    defs: [
      { key: 'grade',        label: 'Grade',         attr_type: 'text',    options: null, unit: null, is_required: true,  is_filterable: true, sort_order: 10 },
      { key: 'bag_weight',   label: 'Bag Weight',    attr_type: 'number',  options: null, unit: 'kg', is_required: true,  is_filterable: true, sort_order: 20 },
      { key: 'bs_code',      label: 'BS Code',       attr_type: 'text',    options: null, unit: null, is_required: false, is_filterable: false,sort_order: 30 },
      { key: 'is_certified', label: 'BIS Certified', attr_type: 'boolean', options: null, unit: null, is_required: false, is_filterable: true, sort_order: 40 },
    ] },
  { catSlugs: ['industrial-machinery','machine-tools','cnc','pumps-motors'],
    defs: [
      { key: 'motor_power', label: 'Motor Power', attr_type: 'number', options: null, unit: 'kW',       is_required: true,  is_filterable: true, sort_order: 10 },
      { key: 'phase',       label: 'Phase',       attr_type: 'select', options: [{value:'single',label:'Single-Phase'},{value:'three',label:'3-Phase'}], unit: null, is_required: true, is_filterable: true, sort_order: 20 },
      { key: 'automation',  label: 'Automation',  attr_type: 'select', options: [{value:'manual',label:'Manual'},{value:'semi',label:'Semi-Auto'},{value:'cnc',label:'CNC / Fully Auto'}], unit: null, is_required: false, is_filterable: true, sort_order: 30 },
      { key: 'capacity',    label: 'Capacity',    attr_type: 'number', options: null, unit: 'units/hr', is_required: false, is_filterable: true, sort_order: 40 },
    ] },
  { catSlugs: ['agriculture','agri','farm-supplies','seeds','fertilizers'],
    defs: [
      { key: 'input_type', label: 'Input Type',       attr_type: 'select',  options: [{value:'seed',label:'Seed'},{value:'fertilizer',label:'Fertilizer'},{value:'pesticide',label:'Pesticide'},{value:'equipment',label:'Equipment'}], unit: null, is_required: true, is_filterable: true, sort_order: 10 },
      { key: 'organic',    label: 'Organic Certified',attr_type: 'boolean', options: null, unit: null, is_required: false, is_filterable: true, sort_order: 20 },
      { key: 'season',     label: 'Growing Season',   attr_type: 'select',  options: [{value:'kharif',label:'Kharif'},{value:'rabi',label:'Rabi'},{value:'zaid',label:'Zaid'},{value:'all',label:'All-season'}], unit: null, is_required: false, is_filterable: true, sort_order: 30 },
    ] },
  { catSlugs: ['healthcare','medical-devices','pharmaceuticals','surgical','diagnostics'],
    defs: [
      { key: 'device_class',label: 'Device Class',       attr_type: 'select', options: [{value:'A',label:'Class A'},{value:'B',label:'Class B'},{value:'C',label:'Class C'},{value:'D',label:'Class D'}], unit: null, is_required: false, is_filterable: true, sort_order: 10 },
      { key: 'sterile',     label: 'Sterile',            attr_type: 'boolean',options: null, unit: null, is_required: false, is_filterable: true, sort_order: 20 },
      { key: 'license_no',  label: 'Drug/Device License',attr_type: 'text',   options: null, unit: null, is_required: true,  is_filterable: false,sort_order: 30 },
      { key: 'use_type',    label: 'Single/Multi-use',   attr_type: 'select', options: [{value:'single',label:'Single-use'},{value:'multi',label:'Multi-use'}], unit: null, is_required: false, is_filterable: true, sort_order: 40 },
    ] },
  { catSlugs: ['home-furniture','furniture','home-decor','kitchen-dining','home-kitchen'],
    defs: [
      { key: 'material',      label: 'Material',      attr_type: 'select', options: [{value:'wood',label:'Wood'},{value:'metal',label:'Metal'},{value:'plastic',label:'Plastic'},{value:'glass',label:'Glass'},{value:'engineered',label:'Engineered Wood'}], unit: null, is_required: true, is_filterable: true, sort_order: 10 },
      { key: 'finish',        label: 'Finish',        attr_type: 'text',   options: null, unit: null,      is_required: false, is_filterable: true, sort_order: 20 },
      { key: 'assembly',      label: 'Assembly',      attr_type: 'select', options: [{value:'pre',label:'Pre-assembled'},{value:'knockdown',label:'Knock-down'},{value:'diy',label:'DIY'}], unit: null, is_required: false, is_filterable: true, sort_order: 30 },
      { key: 'seat_capacity', label: 'Seat Capacity', attr_type: 'number', options: null, unit: 'persons', is_required: false, is_filterable: true, sort_order: 40 },
    ] },
  { catSlugs: ['packaging','printing','packaging-printing','cartons','labels'],
    defs: [
      { key: 'material',   label: 'Material',    attr_type: 'select',  options: [{value:'corrugated',label:'Corrugated'},{value:'pp',label:'Polypropylene'},{value:'pe',label:'Polyethylene'},{value:'paper',label:'Paper'},{value:'foil',label:'Foil'}], unit: null, is_required: true, is_filterable: true, sort_order: 10 },
      { key: 'ply',        label: 'Ply / Layers',attr_type: 'number',  options: null, unit: 'ply', is_required: false, is_filterable: true, sort_order: 20 },
      { key: 'food_grade', label: 'Food Grade',  attr_type: 'boolean', options: null, unit: null,  is_required: false, is_filterable: true, sort_order: 30 },
      { key: 'printable',  label: 'Printable',   attr_type: 'boolean', options: null, unit: null,  is_required: false, is_filterable: true, sort_order: 40 },
    ] },
  { catSlugs: ['chemicals','raw-materials','chemicals-raw-materials','polymers','dyes','adhesives'],
    defs: [
      { key: 'form',         label: 'Form',        attr_type: 'select', options: [{value:'powder',label:'Powder'},{value:'liquid',label:'Liquid'},{value:'granule',label:'Granule'},{value:'paste',label:'Paste'}], unit: null, is_required: true, is_filterable: true, sort_order: 10 },
      { key: 'purity',       label: 'Purity',      attr_type: 'number', options: null, unit: '%',   is_required: false, is_filterable: true, sort_order: 20 },
      { key: 'cas_number',   label: 'CAS Number',  attr_type: 'text',   options: null, unit: null,  is_required: false, is_filterable: false,sort_order: 30 },
      { key: 'hazard_class', label: 'Hazard Class',attr_type: 'text',   options: null, unit: null,  is_required: false, is_filterable: true, sort_order: 40 },
    ] },
  { catSlugs: ['business-supplies','stationery','office','retail-supplies'],
    defs: [
      { key: 'use_type',  label: 'Use Type', attr_type: 'select',  options: [{value:'office',label:'Office'},{value:'retail',label:'Retail'},{value:'school',label:'School'}], unit: null, is_required: true, is_filterable: true, sort_order: 10 },
      { key: 'material',  label: 'Material', attr_type: 'text',    options: null, unit: null, is_required: false, is_filterable: true, sort_order: 20 },
      { key: 'brandable', label: 'Brandable',attr_type: 'boolean', options: null, unit: null, is_required: false, is_filterable: true, sort_order: 30 },
    ] },
]

// ----------------------------------------------------------------------------
// 2. HELPERS
// ----------------------------------------------------------------------------
async function ensureUser(email: string, password: string, name: string, role: 'buyer' | 'seller'): Promise<string> {
  // 1. see if already exists
  const list = await supa.auth.admin.listUsers({ perPage: 200 })
  const found = list.data.users.find((u) => u.email === email)
  if (found) return found.id

  const { data, error } = await supa.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, role, seed: 'enterprise_demo' },
  })
  if (error || !data.user) throw new Error(`createUser(${email}) failed: ${error?.message}`)
  return data.user.id
}

async function upsert(table: string, rows: any[], conflict?: string, optional = false) {
  if (!rows.length) return
  const q = conflict
    ? supa.from(table).upsert(rows, { onConflict: conflict, ignoreDuplicates: false })
    : supa.from(table).upsert(rows, { ignoreDuplicates: true })
  const { error } = await q
  if (error) {
    if (optional && /schema cache|does not exist|Could not find the table/i.test(error.message)) {
      console.log(`  ⚠ ${table}: skipped (table not present — run seed_enterprise_demo.sql first)`)
      return
    }
    throw new Error(`upsert ${table}: ${error.message}`)
  }
  console.log(`  ✓ ${table}: ${rows.length} row(s)`)
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
}
function pick<T>(arr: T[], i: number): T { return arr[i % arr.length] }
function priceIn(range: [number, number], idx: number): number {
  const [lo, hi] = range
  const v = lo + Math.round(((hi - lo) * ((idx * 37) % 100)) / 100)
  return Math.round(v / 10) * 10   // round to 10s for realism
}
function tiersFor(base: number) {
  // 3 tiers: 1-50 × 1.12 ; 51-200 × 1.08 ; 201+ × 1.05
  return [
    { min_qty: 1,   max_qty: 50,  unit_price: +(base * 1.12).toFixed(2) },
    { min_qty: 51,  max_qty: 200, unit_price: +(base * 1.08).toFixed(2) },
    { min_qty: 201, max_qty: null,unit_price: +(base * 1.05).toFixed(2) },
  ]
}
function unsplashImg(q: string, seed: number, w = 800): string {
  // Deterministic-ish: uses source.unsplash.com featured queries.
  return `https://source.unsplash.com/featured/${w}x${Math.round(w * 0.75)}/?${encodeURIComponent(q)}&sig=${seed}`
}

// ----------------------------------------------------------------------------
// 3. MAIN
// ----------------------------------------------------------------------------
async function main() {
  console.log('╔════════════════════════════════════════════════════════╗')
  console.log('║      ThokSale Enterprise Demo Seed — starting          ║')
  console.log('╚════════════════════════════════════════════════════════╝')

  // ---- 3a. Reference lookups (from DB) -----------------------------------
  // First: ensure brands exist (idempotent via slug conflict).
  console.log('▶ Brands & attribute templates …')
  // brands has partial unique index on (slug) where seller_id is null — so upsert by id, but ignoreDuplicates on second run.
  const brandsToInsert = BRANDS_SEED.map((b) => ({
    id: uid(`brand-${b.slug}`),
    ...b,
    is_active: true,
  }))
  // Try insert; on conflict on the (slug where seller_id is null) unique index, ignore.
  const { error: bErr } = await supa.from('brands').upsert(brandsToInsert, { onConflict: 'id', ignoreDuplicates: true })
  if (bErr && !/duplicate|unique/i.test(bErr.message)) console.warn('  ⚠ brands upsert:', bErr.message)
  else console.log(`  ✓ brands: ${brandsToInsert.length} row(s) (upsert)`)

  const [indR, catR, brandR, unitR, btR] = await Promise.all([
    supa.from('industries').select('id, slug').eq('is_active', true).is('deleted_at', null),
    supa.from('categories').select('id, slug, parent_id, industry_id').eq('is_active', true).is('deleted_at', null),
    supa.from('brands').select('id, slug, brand_type').eq('is_active', true).is('deleted_at', null),
    supa.from('units').select('id, code, unit_type').eq('is_active', true).is('deleted_at', null),
    supa.from('business_types').select('id, code'),
  ])
  if (indR.error || catR.error || brandR.error || unitR.error || btR.error) {
    throw new Error('Reference lookups failed — did you run seed_enterprise_demo.sql + 003_enterprise_catalog?')
  }
  const industryBySlug = new Map((indR.data || []).map((r: any) => [r.slug, r.id]))
  const brandBySlug    = new Map((brandR.data || []).map((r: any) => [r.slug, r.id]))
  const btByCode       = new Map((btR.data   || []).map((r: any) => [r.code, r.id]))
  const unitByCode     = new Map((unitR.data || []).map((r: any) => [`${r.unit_type}:${r.code}`, r.id]))
  const catBySlug      = new Map((catR.data  || []).map((r: any) => [r.slug, r]))
  const catsById       = new Map((catR.data  || []).map((r: any) => [r.id, r]))

  // Populate attribute_definitions for every matching category (idempotent — unique on (category_id, key)).
  const attrDefRows: any[] = []
  for (const tmpl of ATTR_TEMPLATES) {
    for (const slug of tmpl.catSlugs) {
      const cat = catBySlug.get(slug)
      if (!cat) continue
      for (const d of tmpl.defs) {
        attrDefRows.push({
          id: uid(`attrdef-${cat.id}-${d.key}`),
          category_id: cat.id,
          key: d.key, label: d.label, attr_type: d.attr_type,
          options: d.options, unit: d.unit,
          is_required: d.is_required, is_filterable: d.is_filterable, is_variant: false,
          sort_order: d.sort_order, is_active: true,
        })
      }
    }
  }
  const { error: adErr } = await supa.from('attribute_definitions').upsert(attrDefRows, { onConflict: 'id', ignoreDuplicates: true })
  if (adErr && !/duplicate|unique/i.test(adErr.message)) console.warn('  ⚠ attribute_definitions:', adErr.message)
  else console.log(`  ✓ attribute_definitions: ${attrDefRows.length} row(s) (upsert)`)

  // For each industry, find a viable subcategory (leaf) and parent category
  function resolveCatFor(indSlug: string, prefSlug: string): { parent_id: string | null, sub_id: string | null } {
    const cat = catBySlug.get(prefSlug)
    if (cat) {
      // If cat has a parent → cat itself is a leaf
      if (cat.parent_id) {
        return { parent_id: cat.parent_id, sub_id: cat.id }
      }
      // cat is a root — pick first leaf under it
      const leaf = (catR.data || []).find((c: any) => c.parent_id === cat.id)
      return { parent_id: cat.id, sub_id: leaf?.id || null }
    }
    // Fallback: pick any root category with the industry_id
    const indId = industryBySlug.get(indSlug)
    const root = (catR.data || []).find((c: any) => !c.parent_id && c.industry_id === indId)
    if (!root) return { parent_id: null, sub_id: null }
    const leaf = (catR.data || []).find((c: any) => c.parent_id === root.id)
    return { parent_id: root.id, sub_id: leaf?.id || null }
  }

  // ---- 3b. Buyers -------------------------------------------------------
  console.log('\n▶ Buyers …')
  const buyerAuthIds = new Map<string, string>()
  for (const b of BUYERS) {
    const id = await ensureUser(b.email, 'ThokSale#Buyer1', b.fullName, 'buyer')
    buyerAuthIds.set(b.key, id)
  }
  await upsert('profiles', BUYERS.map((b) => ({
    id: buyerAuthIds.get(b.key), email: b.email, full_name: b.fullName, phone: b.mobile, role: 'buyer', is_active: true,
  })), 'id')
  await upsert('company_profiles', BUYERS.map((b) => ({
    id: uid(`cp-buyer-${b.key}`),
    profile_id: buyerAuthIds.get(b.key),
    legal_name: b.businessName,
    display_name: b.businessName,
    tax_id: b.gst,
    business_type: b.businessType,
    city: b.city, state: b.state, country: 'India',
    contact_phone: b.mobile,
    kyc_status: 'verified',
    verified_at: new Date().toISOString(),
  })), 'id')

  // ---- 3c. Sellers ------------------------------------------------------
  console.log('\n▶ Sellers …')
  const sellerAuthIds = new Map<string, string>()
  for (const s of SELLERS) {
    const id = await ensureUser(s.email, 'ThokSale#Seller1', s.fullName, 'seller')
    sellerAuthIds.set(s.key, id)
  }
  await upsert('profiles', SELLERS.map((s) => ({
    id: sellerAuthIds.get(s.key), email: s.email, full_name: s.fullName, phone: s.mobile, role: 'seller', is_active: true,
  })), 'id')

  await upsert('company_profiles', SELLERS.map((s) => ({
    id: uid(`cp-seller-${s.key}`),
    profile_id: sellerAuthIds.get(s.key),
    legal_name: s.legalName,
    display_name: s.displayName,
    tax_id: s.gst,
    business_type: s.businessType,
    business_type_id: btByCode.get(s.businessType) || null,
    pan: s.pan,
    msme_number: s.msme,
    udyam_number: s.msme,
    website: `https://${s.key}.thoksale.example.com`,
    logo_url: s.logoUrl,
    description: s.description,
    city: s.city, state: s.state, country: 'India',
    address_line1: s.warehouse.addr,
    postal_code: s.warehouse.pin,
    contact_phone: s.mobile,
    contact_email: s.email,
    kyc_status: 'verified',
    verified_at: new Date().toISOString(),
    rating: 4.2 + (Math.random() * 0.7),
  })), 'id')

  // ---- 3d. Warehouses + business photos ---------------------------------
  await upsert('seller_warehouses', SELLERS.map((s) => ({
    id: uid(`wh-${s.key}`),
    seller_id: sellerAuthIds.get(s.key),
    name: s.warehouse.name,
    address_line1: s.warehouse.addr,
    city: s.warehouse.city, state: s.warehouse.state,
    postal_code: s.warehouse.pin,
    country: 'India',
    contact_person: s.fullName,
    contact_phone: s.mobile,
    contact_email: s.email,
    gstin: s.gst,
    is_primary: true,
    is_active: true,
  })), 'id')

  const photos: any[] = []
  for (const s of SELLERS) {
    const seed = parseInt(s.key.replace(/\D/g, ''), 10)
    ;['factory', 'warehouse', 'office'].forEach((type, i) => {
      photos.push({
        id: uid(`bp-${s.key}-${type}`),
        seller_id: sellerAuthIds.get(s.key),
        url: unsplashImg(`${type} india industrial`, seed * 10 + i, 900),
        caption: `${s.displayName} — ${type}`,
        photo_type: type,
        sort_order: i,
      })
    })
  }
  await upsert('seller_business_photos', photos, 'id')

  // ---- 3e. Products (120) ------------------------------------------------
  console.log('\n▶ Products …')
  type ProductRow = any
  const products: ProductRow[] = []
  const productImages: any[] = []
  const productAttrs: any[] = []

  // preload attribute_definitions per category so we can attach values
  const { data: allDefs } = await supa
    .from('attribute_definitions')
    .select('id, category_id, key, attr_type')
    .eq('is_active', true).is('deleted_at', null)
  const defsByCat = new Map<string, any[]>()
  for (const d of (allDefs || [])) {
    const arr = defsByCat.get(d.category_id) || []
    arr.push(d); defsByCat.set(d.category_id, arr)
  }

  let productIndex = 0
  for (const ind of INDUSTRIES) {
    const industry_id = industryBySlug.get(ind.slug)
    if (!industry_id) { console.warn(`  ⚠ industry ${ind.slug} missing — skipping`); continue }
    const { parent_id: category_id, sub_id: subcategory_id } = resolveCatFor(ind.slug, ind.categorySlug)

    for (let t = 0; t < ind.templates.length; t++, productIndex++) {
      const tpl = ind.templates[t]
      const seller = SELLERS[productIndex % SELLERS.length]
      const seller_id = sellerAuthIds.get(seller.key)!
      const pid = uid(`prod-${ind.slug}-${t}`)
      const basePrice = priceIn(tpl.priceRange, productIndex)
      const moq = Math.max(1, tpl.moqRange[0])
      const stockQuantity = Math.round(tpl.moqRange[1] * 8 + ((productIndex * 13) % 500))

      products.push({
        id: pid,
        seller_id,
        category_id,
        industry_id,
        subcategory_id,
        brand_id: brandBySlug.get(tpl.brandSlug) || null,
        packaging_unit_id: unitByCode.get(`packaging:${tpl.packagingUnit}`) || null,
        measurement_unit_id: unitByCode.get(`measurement:${tpl.measurementUnit}`) || null,
        sku: `${ind.slug.split('-')[0].toUpperCase()}-${String(t + 1).padStart(2, '0')}-${seller.key.toUpperCase()}`,
        name: tpl.name,
        slug: `${slugify(tpl.name)}-${pid.slice(0, 6)}`,
        description: `${tpl.name}. Sold by ${seller.displayName} — verified ThokSale seller. B2B wholesale pricing with tier-based volume discounts. MOQ ${moq} ${tpl.measurementUnit}.`,
        brand: null,   // legacy free-text kept null — we use brand_id
        unit: tpl.measurementUnit,
        moq,
        base_price: basePrice,
        currency: 'INR',
        tax_rate: 18,
        tier_pricing: tiersFor(basePrice),
        stock_quantity: stockQuantity,
        weight_kg: tpl.weightKg,
        dimensions: { l: 30 + (t * 2), w: 20 + t, h: 15 + t, unit: 'cm' },
        origin_country: 'India',
        hs_code: tpl.hsn,
        status: 'active',
        is_featured: productIndex % 6 === 0,   // ~20 featured
        specifications: { source: 'seed_enterprise_demo' },
      })

      // Images (3 per product from Unsplash — deterministic)
      for (let i = 0; i < 3; i++) {
        productImages.push({
          id: uid(`img-${pid}-${i}`),
          product_id: pid,
          url: unsplashImg(`${ind.imageQuery} ${tpl.name.split(' ')[0].toLowerCase()}`, productIndex * 10 + i),
          alt_text: `${tpl.name} — image ${i + 1}`,
          is_primary: i === 0,
          sort_order: i,
        })
      }

      // Dynamic attributes based on template
      const defs = subcategory_id ? (defsByCat.get(subcategory_id) || []) : []
      const defsParent = category_id ? (defsByCat.get(category_id) || []) : []
      const allDefsForCat = [...defs, ...defsParent]
      for (const d of allDefsForCat) {
        const v = (tpl.attrs as any)[d.key]
        if (v === undefined || v === null) continue
        const row: any = { id: uid(`pa-${pid}-${d.id}`), product_id: pid, attribute_id: d.id, value_text: null, value_number: null, value_boolean: null, value_json: null }
        switch (d.attr_type) {
          case 'number': case 'weight': case 'dimension': case 'measurement':
            row.value_number = Number(v); break
          case 'boolean':
            row.value_boolean = Boolean(v); break
          case 'multi_select':
            row.value_json = Array.isArray(v) ? v : [String(v)]; break
          default:
            row.value_text = String(v)
        }
        productAttrs.push(row)
      }
    }
  }

  await upsert('products',           products,      'id')
  await upsert('product_images',     productImages, 'id')
  await upsert('product_attributes', productAttrs,  'id')

  // ---- 3f. Buyer commerce data ------------------------------------------
  console.log('\n▶ Buyer commerce data (cart, wishlist, recently_viewed, orders, RFQs, notifications) …')

  const buyerIds = BUYERS.map((b) => buyerAuthIds.get(b.key)!)
  const sellerIds = SELLERS.map((s) => sellerAuthIds.get(s.key)!)

  // WISHLIST: each buyer wishlists 5 products
  const wishlist: any[] = []
  buyerIds.forEach((bid, bi) => {
    for (let i = 0; i < 5; i++) {
      const p = products[(bi * 13 + i * 7) % products.length]
      wishlist.push({ id: uid(`wl-${bid}-${p.id}`), buyer_id: bid, product_id: p.id })
    }
  })
  await upsert('wishlists', wishlist, 'id', true)

  // RECENTLY VIEWED: each buyer viewed 8 products
  const rv: any[] = []
  buyerIds.forEach((bid, bi) => {
    for (let i = 0; i < 8; i++) {
      const p = products[(bi * 17 + i * 11) % products.length]
      rv.push({
        id: uid(`rv-${bid}-${p.id}`), buyer_id: bid, product_id: p.id,
        viewed_at: new Date(Date.now() - (bi * 4 + i) * 3600_000).toISOString(),
      })
    }
  })
  await upsert('recently_viewed', rv, 'id', true)

  // CART + CART ITEMS (each buyer has one active single-seller cart)
  const carts: any[] = []
  const cartItems: any[] = []
  buyerIds.forEach((bid, bi) => {
    // Pick a seller for this cart
    const sellerId = sellerIds[bi % sellerIds.length]
    // Pick 2 products from that seller
    const sellerProducts = products.filter((p) => p.seller_id === sellerId).slice(0, 2)
    if (sellerProducts.length === 0) return
    const cartId = uid(`cart-${bid}`)
    carts.push({ id: cartId, buyer_id: bid, seller_id: sellerId, currency: 'INR', is_active: true, notes: 'Auto-generated demo cart' })
    sellerProducts.forEach((p, i) => {
      const q = p.moq
      cartItems.push({
        id: uid(`ci-${cartId}-${p.id}`), cart_id: cartId, product_id: p.id,
        quantity: q,
        unit_price: +(p.base_price * 1.12).toFixed(2),
        discount: 0, tax_amount: 0,
        metadata: { seed: 'enterprise_demo' },
      })
    })
  })
  await upsert('carts', carts, 'id')
  await upsert('cart_items', cartItems, 'id')

  // ORDERS + ORDER ITEMS  — 2 orders per buyer, various statuses
  const orders: any[] = []
  const orderItems: any[] = []
  const orderStatuses = ['pending_payment', 'paid', 'confirmed', 'processing', 'shipped', 'delivered']
  const payStatuses = ['pending', 'authorized', 'captured', 'captured', 'captured', 'captured']
  buyerIds.forEach((bid, bi) => {
    for (let n = 0; n < 2; n++) {
      const sellerId = sellerIds[(bi + n) % sellerIds.length]
      const seller = SELLERS[(bi + n) % SELLERS.length]
      const b = BUYERS[bi]
      const sellerProducts = products.filter((p) => p.seller_id === sellerId).slice(0, 2)
      if (sellerProducts.length === 0) continue
      const orderId = uid(`ord-${bid}-${n}`)
      const orderNumber = `THK-${String(uid(`ordn-${bid}-${n}`)).replace(/[^0-9a-f]/g, '').slice(0, 10).toUpperCase()}`
      let subtotal = 0
      const items = sellerProducts.map((p, i) => {
        const q = p.moq
        const unit = +(p.base_price * 1.12).toFixed(2)
        const line = q * unit
        subtotal += line
        return {
          id: uid(`oi-${orderId}-${p.id}`), order_id: orderId, product_id: p.id, product_name: p.name, sku: p.sku,
          quantity: q, unit_price: unit, discount: 0, tax_rate: 18, tax_amount: +(line * 0.18).toFixed(2), subtotal: +line.toFixed(2),
        }
      })
      const tax = +(subtotal * 0.18).toFixed(2)
      const freight = 500 + (bi * 20)
      const grand = subtotal + tax + freight
      orders.push({
        id: orderId, order_number: orderNumber, buyer_id: bid, seller_id: sellerId,
        status: orderStatuses[(bi + n) % orderStatuses.length],
        payment_status: payStatuses[(bi + n) % payStatuses.length],
        currency: 'INR', subtotal, discount_total: 0, tax_total: tax, freight_total: freight, grand_total: grand,
        shipping_address: { line1: `${b.businessName}, Main Road`, city: b.city, state: b.state, postal_code: '400001', country: 'India', gstin: b.gst, phone: b.mobile },
        billing_address:  { line1: `${b.businessName}, Main Road`, city: b.city, state: b.state, postal_code: '400001', country: 'India', gstin: b.gst, phone: b.mobile },
        payment_method: 'net_banking',
        tracking_number: n === 1 ? `AWB-${orderNumber}` : null,
        carrier: n === 1 ? 'Delhivery' : null,
        notes: `${DEMO_TAG} — buyer=${b.key} seller=${seller.key}`,
      })
      orderItems.push(...items)
    }
  })
  await upsert('orders',      orders,     'id')
  await upsert('order_items', orderItems, 'id')

  // RFQs + responses  — each buyer posts 1 RFQ, each RFQ gets 2 responses
  const rfqs: any[] = []
  const rfqResponses: any[] = []
  buyerIds.forEach((bid, bi) => {
    const template = pick(INDUSTRIES, bi).templates[0]
    const rfqId = uid(`rfq-${bid}`)
    const cat = catBySlug.get(pick(INDUSTRIES, bi).categorySlug)
    rfqs.push({
      id: rfqId,
      rfq_number: `RFQ-${String(rfqId).replace(/[^0-9a-f]/g, '').slice(0, 10).toUpperCase()}`,
      buyer_id: bid,
      category_id: cat?.id || null,
      title: `Bulk requirement — ${template.name}`,
      description: `Looking for wholesale supply of ${template.name}. Need consistent stock and competitive pricing.`,
      quantity: template.moqRange[1] * 2,
      unit: template.measurementUnit,
      target_price: Math.round(priceIn(template.priceRange, bi) * 0.9),
      currency: 'INR',
      delivery_location: { city: BUYERS[bi].city, state: BUYERS[bi].state, country: 'India', postal_code: '400001' },
      delivery_deadline: new Date(Date.now() + 21 * 86400_000).toISOString().slice(0, 10),
      status: bi < 3 ? 'open' : (bi < 7 ? 'quoted' : 'accepted'),
      is_public: true,
      expires_at: new Date(Date.now() + 30 * 86400_000).toISOString(),
    })

    // 2 responses per RFQ from 2 different sellers
    for (let r = 0; r < 2; r++) {
      const sid = sellerIds[(bi + r + 1) % sellerIds.length]
      rfqResponses.push({
        id: uid(`rfqr-${rfqId}-${r}`),
        rfq_id: rfqId,
        seller_id: sid,
        quoted_price: Math.round(priceIn(template.priceRange, bi + r) * 0.95),
        currency: 'INR',
        quantity_available: template.moqRange[1] * 4,
        lead_time_days: 10 + (r * 5),
        validity_days: 15,
        payment_terms: 'NET-30',
        notes: `Full production capacity available. Sample can be dispatched within 3 business days.`,
        status: bi >= 7 && r === 0 ? 'accepted' : 'submitted',
      })
    }
  })
  await upsert('rfqs',          rfqs,         'id')
  await upsert('rfq_responses', rfqResponses, 'id')

  // NOTIFICATIONS: 3 per buyer, 3 per seller
  const notifications: any[] = []
  buyerIds.forEach((bid, bi) => {
    const ord = orders.find((o) => o.buyer_id === bid)
    notifications.push({ id: uid(`n-${bid}-1`), user_id: bid, type: 'order_created',        title: 'Order placed',           body: `Order ${ord?.order_number || 'THK-XXXXXXXXXX'} was placed successfully.`, data: { order_id: ord?.id }, is_read: false })
    notifications.push({ id: uid(`n-${bid}-2`), user_id: bid, type: 'rfq_response',         title: 'New RFQ response',       body: 'A verified seller has responded to your RFQ. Review the quote to proceed.', data: {}, is_read: bi > 4 })
    notifications.push({ id: uid(`n-${bid}-3`), user_id: bid, type: 'order_status_update',  title: 'Shipment on the way',    body: 'Your order has been dispatched by the seller.', data: { order_id: ord?.id }, is_read: true })
  })
  sellerIds.forEach((sid, si) => {
    notifications.push({ id: uid(`ns-${sid}-1`), user_id: sid, type: 'order_created',       title: 'New order received',     body: 'A buyer has placed an order for your product. Please process it within 24 hours.', data: {}, is_read: false })
    notifications.push({ id: uid(`ns-${sid}-2`), user_id: sid, type: 'rfq_new',              title: 'New RFQ opportunity',    body: 'A buyer has posted an RFQ that matches your catalog. Submit your quote to win the deal.', data: {}, is_read: si > 5 })
    notifications.push({ id: uid(`ns-${sid}-3`), user_id: sid, type: 'kyc_status',           title: 'KYC verified',           body: 'Your company KYC has been approved. You can now access all seller features.', data: {}, is_read: true })
  })
  await upsert('notifications', notifications, 'id')

  console.log('\n══════════════════════════════════════════════════════════')
  console.log('  ✅  Seed complete.')
  console.log(`      Buyers:  ${BUYERS.length}       Sellers: ${SELLERS.length}`)
  console.log(`      Products: ${products.length}   Images: ${productImages.length}`)
  console.log(`      ProductAttrs: ${productAttrs.length}`)
  console.log(`      Orders: ${orders.length}   OrderItems: ${orderItems.length}`)
  console.log(`      RFQs:   ${rfqs.length}     RFQResponses: ${rfqResponses.length}`)
  console.log(`      Wishlist: ${wishlist.length}   RecentlyViewed: ${rv.length}`)
  console.log(`      Carts:  ${carts.length}       CartItems: ${cartItems.length}`)
  console.log(`      Notifications: ${notifications.length}`)
  console.log('══════════════════════════════════════════════════════════\n')
  console.log('  🔑 Default passwords:')
  console.log('       Buyers  → ThokSale#Buyer1')
  console.log('       Sellers → ThokSale#Seller1')
  console.log('══════════════════════════════════════════════════════════\n')
}

main().catch((e) => { console.error('❌', e); process.exit(1) })
