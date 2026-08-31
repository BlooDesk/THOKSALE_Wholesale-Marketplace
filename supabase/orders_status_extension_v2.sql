-- =====================================================================
-- ThokSale - Add 'freight_quote_sent' to order_status enum
-- Also seed an admin role for the first admin user (manual).
-- =====================================================================
alter type order_status add value if not exists 'freight_quote_sent';

-- =====================================================================
-- Grant an admin role: run manually with your user id:
--   update public.profiles set role='admin' where email='YOUR_ADMIN_EMAIL';
-- =====================================================================
