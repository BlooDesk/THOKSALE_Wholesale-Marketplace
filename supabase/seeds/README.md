# ThokSale — Enterprise Demo Seed

Generates a **realistic, idempotent development dataset** covering the whole
ThokSale B2B stack:

* 10 verified buyers  (retail, hardware, medical, fashion, electronics, furniture, construction, grocery, auto, wholesale)
* 10 verified sellers (manufacturers / wholesalers / distributors / OEMs / private-label)
* 40 brands (global + fictional Indian wholesale)
* 120 products distributed 10-per-industry across all 12 industries
* Dynamic attributes per category (via `attribute_definitions`)
* Orders + order-items (2 per buyer with various statuses)
* RFQs + responses (1 RFQ per buyer with 2 seller responses each)
* Notifications (3 per user)
* Wishlist + Recently-Viewed rows
* Active carts + cart items

> ⚠️  **DEV / UI-TESTING ONLY.** Do NOT run against a production project.
> Everything is namespaced under deterministic UUIDs so re-runs converge to
> the same rows (no duplicates). Rows are inserted with `on conflict do nothing` /
> `.upsert({ onConflict: 'id' })`.

---

## Files

```
supabase/seeds/
├── seed_enterprise_demo.sql        ← SQL: additive tables + 40 brands + attribute templates
├── seed_enterprise_demo.ts         ← TS : auth users, profiles, products, orders, etc.
└── README.md                       ← (this file)
```

---

## Prerequisites

1. Migrations already applied (in order):
   * `supabase/schema.sql`
   * `supabase/triggers.sql`
   * `supabase/indexes.sql`
   * `supabase/rls_policies.sql`
   * `supabase/seed_categories.sql`
   * `supabase/orders_status_extension_v2.sql` (for freight statuses)
   * `supabase/migrations/003_enterprise_catalog.sql`  ← **required** (industries, brands, attribute_definitions, units, business_types, seller_warehouses, seller_business_photos)

2. Environment variables in `/app/.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   ```

3. `@supabase/supabase-js` and `uuid` already in `package.json` (they are).

---

## Execute

### Option A — Full setup (recommended)

**Step 1** — Open Supabase Dashboard → **SQL Editor** → paste
`seed_enterprise_demo.sql` → **Run**.
This creates `public.wishlists` and `public.recently_viewed` (plus RLS) and
also inserts 40 brands + attribute templates (redundant with the TS but
provides a pure-SQL reference for DBAs).

**Step 2** — from the repo root:

```bash
npx tsx supabase/seeds/seed_enterprise_demo.ts
```

You will see (approx):

```
▶ Brands & attribute templates …
  ✓ brands: 40 row(s) (upsert)
  ✓ attribute_definitions: 73 row(s) (upsert)
▶ Buyers …
  ✓ profiles: 10 row(s)
  ✓ company_profiles: 10 row(s)
▶ Sellers …
  ✓ profiles: 10 row(s)
  ✓ company_profiles: 10 row(s)
  ✓ seller_warehouses: 10 row(s)
  ✓ seller_business_photos: 30 row(s)
▶ Products …
  ✓ products: 120 row(s)
  ✓ product_images: 360 row(s)
  ✓ product_attributes: 364 row(s)
▶ Buyer commerce data …
  ✓ wishlists: 50 row(s)
  ✓ recently_viewed: 80 row(s)
  ✓ carts: 10 row(s)
  ✓ cart_items: 20 row(s)
  ✓ orders: 20 row(s)
  ✓ order_items: 40 row(s)
  ✓ rfqs: 10 row(s)
  ✓ rfq_responses: 20 row(s)
  ✓ notifications: 60 row(s)
```

### Option B — TS-only quick bootstrap

The TS script now **also** upserts the 40 brands and per-category attribute
templates (mirroring the SQL file), so you can skip Step 1 IF you don't need
wishlist/recently_viewed. In that case:

```bash
npx tsx supabase/seeds/seed_enterprise_demo.ts
```

You'll see a friendly warning:
```
⚠ wishlists: skipped (table not present — run seed_enterprise_demo.sql first)
⚠ recently_viewed: skipped (table not present — run seed_enterprise_demo.sql first)
```
Everything else seeds correctly.

---

## Login credentials

| Role   | Emails                                | Password              |
|--------|---------------------------------------|-----------------------|
| Buyer  | `buyer01@thoksale.demo` → `buyer10@thoksale.demo` | `ThokSale#Buyer1`  |
| Seller | `seller01@thoksale.demo` → `seller10@thoksale.demo` | `ThokSale#Seller1` |

For a full mapping to companies, GSTs, states, cities → open
`supabase/seeds/seed_enterprise_demo.ts` and read the `BUYERS` / `SELLERS`
constants at the top.

---

## Idempotency & re-runs

Both scripts are safe to re-run:

* **SQL** — every `insert` uses `on conflict do nothing` (or
  `do update set …` for reference data like industries/units where we want to
  refresh labels).
* **TS** — every UUID is derived via `uuid v5` over a private namespace, so a
  second run finds the same rows and calls `.upsert(..., { onConflict: 'id' })`
  which is a no-op if content is unchanged.

If you want to **wipe** the seed:

```sql
-- run in Supabase SQL editor
delete from public.notifications      where user_id in
    (select id from public.profiles where email like '%@thoksale.demo');
delete from public.rfq_responses      where seller_id in
    (select id from public.profiles where email like '%@thoksale.demo');
delete from public.rfqs               where buyer_id in
    (select id from public.profiles where email like '%@thoksale.demo');
delete from public.order_items        where order_id in
    (select id from public.orders where notes like '%seed=enterprise_demo%');
delete from public.orders             where notes like '%seed=enterprise_demo%';
delete from public.cart_items         where cart_id in
    (select id from public.carts where notes like '%demo cart%');
delete from public.carts              where notes like '%demo cart%';
delete from public.recently_viewed    where buyer_id in
    (select id from public.profiles where email like '%@thoksale.demo');
delete from public.wishlists          where buyer_id in
    (select id from public.profiles where email like '%@thoksale.demo');
delete from public.product_attributes where product_id in
    (select id from public.products where specifications->>'source' = 'seed_enterprise_demo');
delete from public.product_images     where product_id in
    (select id from public.products where specifications->>'source' = 'seed_enterprise_demo');
delete from public.products           where specifications->>'source' = 'seed_enterprise_demo';
delete from public.seller_business_photos where seller_id in
    (select id from public.profiles where email like 'seller%@thoksale.demo');
delete from public.seller_warehouses  where seller_id in
    (select id from public.profiles where email like 'seller%@thoksale.demo');
delete from public.company_profiles   where profile_id in
    (select id from public.profiles where email like '%@thoksale.demo');
delete from public.profiles           where email like '%@thoksale.demo';
-- finally the auth users
delete from auth.users                where email like '%@thoksale.demo';
```

To also drop the seeded brands / attribute templates (usually you don't
want this):
```sql
delete from public.attribute_definitions where sort_order between 10 and 60;
delete from public.brands where slug in (
  'samsung','lg','sony','philips','bosch','panasonic','whirlpool','havells',
  'anchor','legrand','schneider','godrej','bajaj','prestige','cello','milton',
  'asian-paints','berger-paints','jk-cement','ultratech','pidilite','amul',
  'britannia','parle','tata-consumer','dabur',
  'orion-mills','bhaskar-metals','greenspice','voltacore','titan-auto',
  'bharatcem','indomech','harvest-gold','medipure','kanchan-home','propack',
  'chembharat','officemax-india','swadeshi-fab'
);
```

---

## Data distribution

* **Products** — 10 per industry × 12 industries = 120 products.
* **Seller assignment** — round-robin: product `i → SELLERS[i % 10]`.
  Each seller ends up owning **12 products across 12 industries**.
* **Pricing** — Indian wholesale realistic bands:
  * Electronics ₹1,000–₹50,000
  * Fashion     ₹150–₹2,500
  * Cement      ₹320–₹550
  * Furniture   ₹2,000–₹25,000 …etc (see per-industry `priceRange`).
  * Automatic 3-tier volume pricing (`1.12x / 1.08x / 1.05x`).
* **Images** — 3 Unsplash images per product; the seed uses deterministic
  `signal` params so URLs stay stable across runs.
* **Dynamic attributes** — every product carries only the attribute-defs that
  match its category (see the `INDUSTRIES[*].templates[*].attrs` map). If an
  attribute_definition doesn't exist for that category, that value is silently
  skipped — no error.

---

## Extending

To add a new industry / product template:

1. Edit `INDUSTRIES` in `seed_enterprise_demo.ts`.
2. Add corresponding `attribute_definitions` insert to `seed_enterprise_demo.sql`
   under section 3.
3. Re-run both files — new rows will land without touching existing ones.
