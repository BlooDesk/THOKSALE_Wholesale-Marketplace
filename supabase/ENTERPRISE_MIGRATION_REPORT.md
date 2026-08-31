# ThokSale — Enterprise Catalog Migration Report

**Version:** 003 · Enterprise Catalog Architecture  
**Type:** Fully additive · Zero destructive changes · 100% backward compatible

---

## ⚠️ REQUIRED USER ACTION

Before the new admin modules will function, you **must apply the SQL migration**:

1. Open **Supabase Dashboard → SQL Editor**
2. Paste the contents of `/app/supabase/migrations/003_enterprise_catalog.sql`
3. Run it (idempotent — safe to re-run)

The migration creates 8 new tables, adds nullable columns to existing tables, applies RLS, and seeds:
- **12 industries** (Fashion & Textile, FMCG, Electronics, Automobile & EV, Building Materials, Industrial Machinery, Agriculture, Healthcare, Home & Furniture, Packaging & Printing, Chemicals, Business & Retail Supplies)
- **8 business types** (Manufacturer, Wholesaler, Distributor, Supplier, Retailer, Importer, Exporter, Trader)
- **17 measurement units** + **13 packaging units**

All existing tables, data, and functionality remain untouched.

---

## ✓ New Tables (8)

| Table | Purpose |
|---|---|
| `industries` | Top-level catalog root (12 seeded) |
| `brands` | Global / Seller / OEM / Private-label brand registry |
| `attribute_definitions` | Per-category attribute template schema |
| `product_attributes` | Typed attribute values for products (text/number/bool/json) |
| `units` | Unified measurement + packaging unit registry |
| `business_types` | Controlled vocabulary for seller onboarding |
| `seller_warehouses` | Multi-location model with primary-warehouse guard |
| `seller_business_photos` | Factory / warehouse / certificate imagery for trust |

## ✓ Modified Tables (additive columns only, all NULLABLE)

**`categories`**
- `industry_id uuid → industries(id)` — links category to industry

**`company_profiles`**
- `business_type_id uuid → business_types(id)`
- `pan`, `msme_number`, `udyam_number` (text)
- `factory_address jsonb`
- `bank_account_holder`, `bank_account_number`, `bank_ifsc`, `bank_name`, `bank_branch` (text)
- `verified_by uuid → profiles(id)`
- `verification_notes text`

**`products`**
- `industry_id uuid → industries(id)`
- `subcategory_id uuid → categories(id)`
- `brand_id uuid → brands(id)`
- `packaging_unit_id uuid → units(id)`
- `measurement_unit_id uuid → units(id)`

## ✓ New Server Actions

| File | Purpose |
|---|---|
| `app/actions/industries.ts` | create / update / toggle / delete industries |
| `app/actions/brands.ts` | create / update / toggle / verify / delete brands |
| `app/actions/units.ts` | create / update / toggle / delete units |
| `app/actions/business-types.ts` | create / update / toggle / delete business types |
| `app/actions/attribute-templates.ts` | create / update / delete per-category attributes |
| `app/actions/admin.ts` | **Extended:** `upsertCategory` now accepts `industry_id` |

Every server action enforces `requireAdmin()` (admin role + is_active) and calls `revalidatePath` for cache freshness.

## ✓ New Admin Pages (5 modules)

| Route | Description |
|---|---|
| `/admin/industries` | Full CRUD + toggle + soft-delete for the 12 industry rails |
| `/admin/brands` | Card-grid CRUD with type filter (global/seller/OEM/private-label), search, verify, toggle |
| `/admin/attribute-templates` | Category picker + per-category attribute editor (11 attribute types, options, filter/variant flags) |
| `/admin/units` | Grouped tables (measurement + packaging), CRUD, toggle |
| `/admin/business-types` | Controlled-vocabulary CRUD |

## ✓ Modified Admin Pages

- **`/admin/layout.tsx`** — Two-tier nav: Primary (Dashboard/Users/Orders/RFQs/Products) → Catalog (Industries/Categories/Attributes/Brands) → Config (Units/Business Types), with hairline dividers between groups
- **`/admin/categories/page.tsx`** — Now shows the Industry column and passes industries into the form for assignment
- **`/admin/categories/categories-client.tsx`** — Form gained an Industry select

## ✓ New Components

All CRUD dialogs use a shared pattern:
- Server-component page fetches list
- `client.tsx` with `NewXButton`, `XRowActions`, `XEditor` (event-driven Radix Dialog)
- `Switch` + `Select` for the form controls
- Optimistic `toast` + `router.refresh()`

Reused across: industries, brands, units, business-types, attribute-templates.

## ✓ Backward Compatibility Confirmation

| Concern | Status |
|---|---|
| Existing `categories.parent_id` tree | ✓ Untouched — subcategories still work via existing FK |
| Existing `products.brand` free-text | ✓ Untouched — `brand_id` is additional |
| Existing `products.unit` free-text | ✓ Untouched — `packaging_unit_id`/`measurement_unit_id` are additional |
| Existing `company_profiles.business_type` free-text | ✓ Untouched — `business_type_id` is additional |
| Existing `products.category_id` | ✓ Untouched |
| All existing server actions | ✓ Signatures unchanged (only `CategoryInput` gained optional `industry_id`) |
| All existing routes | ✓ Zero routes removed / renamed |
| All existing RLS | ✓ Preserved — new tables get their own additive policies |
| Existing marketplace / cart / orders / RFQ flows | ✓ Zero code paths touched |

## ✓ Testing Checklist

**Post-migration verification (once SQL is applied):**

- [ ] Sign in as admin → visit `/admin/industries` → 12 seeded industries visible
- [ ] Create a new industry → toast success → appears in table
- [ ] Toggle an industry inactive → status pill updates
- [ ] `/admin/business-types` → 8 seeded business types visible
- [ ] `/admin/units` → measurement + packaging tables populated
- [ ] `/admin/brands` → add a global brand → verify + toggle work
- [ ] `/admin/categories` → edit an existing category → assign to an industry → saves
- [ ] `/admin/attribute-templates` → pick a category → create a `select` attribute with options → appears in the template table
- [ ] Anonymous marketplace still loads at `/`
- [ ] Existing product cards still render
- [ ] Buyer login still works
- [ ] Seller login still works
- [ ] `/cart`, `/checkout`, `/orders` flows unaffected

## Migration Order (already executed)

1. ✅ Migration SQL file authored (`003_enterprise_catalog.sql`)
2. ✅ Server actions for all 5 domains
3. ✅ Admin navigation restructured (three-tier)
4. ✅ 5 new admin CRUD modules
5. ✅ Categories admin extended with industry link
6. ⏳ **User action required:** run the SQL migration
7. ⏳ **Next phase (optional):**
    - Extend `seller/company-profile` form UI with the new PAN / MSME / Udyam / Bank / Business-type fields (columns already exist in DB)
    - Extend `seller/products/new` form with Industry → Category → Subcategory → Brand cascading selects + dynamic attribute renderer keyed off the category's attribute template
    - Add Industry filter chip to `/products` marketplace listing
    - Seller Warehouses admin section (rows already writable via API)

## Risk Assessment: LOW

- All schema changes are additive with `IF NOT EXISTS` and nullable FKs
- No existing column dropped, renamed, or type-changed
- No route removed
- All server actions preserve their signatures (only optional fields added)
- RLS is opt-in per table with global-read for public reference data (industries/brands/units/business-types) and owner-write for tenant data (warehouses/photos)

## Files touched in this migration

**Created (18):**
```
supabase/migrations/003_enterprise_catalog.sql
app/actions/industries.ts
app/actions/brands.ts
app/actions/units.ts
app/actions/business-types.ts
app/actions/attribute-templates.ts
app/admin/industries/page.tsx
app/admin/industries/industries-client.tsx
app/admin/brands/page.tsx
app/admin/brands/brands-client.tsx
app/admin/units/page.tsx
app/admin/units/units-client.tsx
app/admin/business-types/page.tsx
app/admin/business-types/business-types-client.tsx
app/admin/attribute-templates/page.tsx
app/admin/attribute-templates/attribute-templates-client.tsx
ENTERPRISE_MIGRATION_REPORT.md (this file)
```

**Modified (3):**
```
app/admin/layout.tsx                       — expanded nav
app/admin/categories/page.tsx              — shows industry column + passes industries
app/admin/categories/categories-client.tsx — form gained Industry select
app/actions/admin.ts                       — CategoryInput + upsertCategory accept industry_id
```

---

**Ready to enable.** Apply the SQL, then all 5 admin modules become live.
