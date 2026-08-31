# ThokSale — Supabase Database (MVP)

Complete PostgreSQL schema for the **ThokSale B2B Wholesale Marketplace**, designed for **Supabase** (PostgreSQL 15+).

## Files

| File | Purpose |
|------|---------|
| `schema.sql`         | Tables, enums, triggers, functions |
| `indexes.sql`        | Performance indexes (btree, gin, trigram, FTS) |
| `rls_policies.sql`   | Row Level Security policies for admin / seller / buyer |
| `seed_categories.sql`| Seed data — 12 top-level + 48 sub-categories |

## Apply order

```bash
psql "$SUPABASE_DB_URL" -f schema.sql
psql "$SUPABASE_DB_URL" -f indexes.sql
psql "$SUPABASE_DB_URL" -f rls_policies.sql
psql "$SUPABASE_DB_URL" -f seed_categories.sql
```

Or paste each file into the Supabase SQL Editor in the same order.

---

## 1. ERD — Entity Relationship Explanation

### Actors (via `auth.users`)
Supabase Auth (`auth.users`) is the single source of authentication. Every business user has **one row in `profiles`** whose `id` equals `auth.users.id`. `profiles.role` distinguishes **admin / seller / buyer**.

### Relationship map

```
auth.users (Supabase)
   └──1:1── profiles ─────────────────────────────────┐
                │                                     │
                ├──1:1── company_profiles             │
                │                                     │
                │   ┌──────────── CATALOG ─────────┐  │
                ├──1:N── products ── N:1 ── categories (self-ref tree)
                │            │                        │
                │            └──1:N── product_images  │
                │                                     │
                │   ┌──────────── PRICING ─────────┐  │
                ├──1:N── partner_codes ── N:1 ── products / categories / buyers
                │                                     │
                │   ┌──────────── COMMERCE ────────┐  │
                ├──1:N── carts ─────1:N── cart_items ── N:1 ── products
                │            └── N:1 ── partner_codes │
                │                                     │
                │   ┌──────────── ORDERS ──────────┐  │
                ├──1:N── orders (buyer)               │
                │            └── N:1 seller (profiles)│
                │            └──1:N── order_items ── N:1 ── products
                │            └── N:1 ── partner_codes │
                │            └── N:1 ── freight_quotes│
                │                                     │
                │   ┌──────────── FREIGHT ─────────┐  │
                └──1:N── freight_quotes ── N:1 ── orders / carts
                                                      │
                    ┌──────────── RFQ ─────────────┐  │
                    rfqs (buyer) ──1:N── rfq_responses ── N:1 ── sellers
                             └── N:1 ── categories / products
                                                      │
                    ┌────────── COMMUNICATION ─────┐  │
                    notifications ── N:1 ── profiles ─┘
```

### Domain summary
- **User Management** — `profiles` (role + auth link), `company_profiles` (KYC, legal info).
- **Catalog** — `categories` (hierarchical tree), `products` (multi-tenant per seller with tier pricing + FTS), `product_images`.
- **Pricing** — `partner_codes` for **private/negotiated wholesale pricing** — can be seller-wide, category-scoped, product-scoped, or buyer-scoped.
- **Commerce** — `carts` (one active per buyer-seller pair) with `cart_items`.
- **Orders** — `orders` (snapshot of buyer + seller companies) with immutable `order_items` (product name/sku snapshot preserved for auditing).
- **Freight** — `freight_quotes` for shipping estimates; linked to a `cart` (pre-checkout) and later attached to an `order`.
- **RFQ** — Buyers post `rfqs` (public or restricted to `invited_sellers`); sellers submit `rfq_responses` (unique per rfq+seller).
- **Communication** — `notifications` typed via `notification_type` enum with a `data` JSONB payload for deep-linking.

### Design principles
1. **UUID PKs** everywhere (Supabase-friendly, unguessable, mergeable).
2. **`created_at` + `updated_at`** on every table, auto-managed via a single `set_updated_at()` trigger.
3. **Soft delete** (`deleted_at timestamptz`) on catalog, users, companies, orders, RFQs, freight, partner codes — high-value data never lost.
4. **Foreign keys** with intentional `ON DELETE` semantics: `cascade` for child rows, `restrict` on orders/products (prevent history loss), `set null` where relationships are optional.
5. **Scalability**:
   - Composite indexes for common access paths (`buyer + status`, `seller + status`).
   - Partial indexes filtering out `deleted_at is null` reduce index size.
   - GIN indexes for full-text search (`search_vector`) and trigram search (name, legal_name).
   - JSONB for flexible payloads (`specifications`, `dimensions`, `shipping_address`, `provider_payload`) — indexable when needed.
   - Generated column `cart_items.subtotal` for consistency.
   - `citext` for case-insensitive emails.
6. **RLS-first** — every table has RLS enabled with role-aware policies.

---

## 2. Row Level Security summary

All policies use three `SECURITY DEFINER` helpers:
- `is_admin()`
- `is_seller()`
- `is_buyer()`

Key policy patterns:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles           | self OR admin OR active users | self | self OR admin | admin |
| company_profiles   | active / owner / admin | owner | owner / admin | admin |
| categories         | public (active) | admin | admin | admin |
| products           | active OR seller OR admin | seller (owner) | owner / admin | owner / admin |
| product_images     | inherit from product | seller (owner) | owner / admin | owner / admin |
| partner_codes      | seller / target buyer / global / admin | seller | owner / admin | owner / admin |
| carts / cart_items | buyer / admin | buyer | buyer / admin | buyer / admin |
| orders / order_items | buyer OR seller OR admin | buyer | party / admin | admin |
| freight_quotes     | party / admin | party / admin | party / admin | admin |
| rfqs               | buyer OR admin OR (public + seller) OR invited seller | buyer | owner / admin | owner / admin |
| rfq_responses      | seller OR admin OR RFQ owner | seller | party / admin | owner / admin |
| notifications      | owner / admin | admin / self | owner / admin | owner / admin |

---

## 3. Indexes summary

- **B-tree** on all FKs and common filter columns (`status`, `role`, `is_active`, `kyc_status`).
- **Partial indexes** on `deleted_at is null` for hot rows.
- **Composite** on `(buyer_id, status)`, `(seller_id, status)` for dashboards.
- **GIN**:
  - `products.search_vector` — full-text search.
  - `products.name`, `company_profiles.legal_name` — trigram fuzzy search.
  - `rfqs.invited_sellers` — array membership for private RFQ discovery.
- **Descending** on `orders.created_at`, `notifications.created_at` — feed queries.

---

## 4. Seed categories

12 industry-level parents (Electronics, Apparel & Textiles, Food & Beverages, Industrial & Machinery, Home & Furniture, Health & Beauty, Construction, Automotive, Agriculture, Packaging, Chemicals, Office & Stationery) plus 4 curated sub-categories each (48 sub-categories total) — reflecting the Indian B2B wholesale market. Fully idempotent via `ON CONFLICT (slug) DO NOTHING`.
