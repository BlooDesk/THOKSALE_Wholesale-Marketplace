-- =====================================================================
-- Migration: Align order_status enum with application code
-- =====================================================================
-- The application uses statuses: pending, accepted, rejected,
-- awaiting_freight_quote, freight_quote_sent, freight_approved,
-- ready_for_payment, processing, shipped, delivered, cancelled
--
-- The old enum had: pending_payment, paid, confirmed, processing,
-- shipped, delivered, cancelled, refunded, disputed
-- =====================================================================

-- Step 1: Add missing enum values
DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pending';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'accepted';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'rejected';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'awaiting_freight_quote';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'freight_quote_sent';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'freight_approved';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'ready_for_payment';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Step 2: Update the default value
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'pending';
