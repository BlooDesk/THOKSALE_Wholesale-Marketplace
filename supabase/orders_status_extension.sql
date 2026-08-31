-- =====================================================================
-- ThokSale - Extend order_status enum with commerce-engine states
-- Run ONCE in Supabase SQL editor.
-- =====================================================================
-- Postgres requires ADD VALUE to be committed before the value can be
-- referenced. Each statement below adds one value if it doesn't already
-- exist. Safe to re-run.
-- =====================================================================

alter type order_status add value if not exists 'pending';
alter type order_status add value if not exists 'accepted';
alter type order_status add value if not exists 'rejected';
alter type order_status add value if not exists 'awaiting_freight_quote';
alter type order_status add value if not exists 'freight_approved';
alter type order_status add value if not exists 'ready_for_payment';
