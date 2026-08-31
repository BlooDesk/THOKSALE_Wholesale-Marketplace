-- =====================================================================
-- Atomic stock decrement function
-- Prevents overselling via race conditions (C2)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.decrement_stock(p_id uuid, q integer)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  rows_affected integer;
BEGIN
  UPDATE public.products
  SET stock_quantity = stock_quantity - q
  WHERE id = p_id
    AND stock_quantity >= q
    AND deleted_at IS NULL;

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;

-- =====================================================================
-- Atomic partner code usage increment function
-- Prevents exceeding max_uses via race conditions (C6)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.increment_partner_code_usage(code_id uuid)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  rows_affected integer;
BEGIN
  UPDATE public.partner_codes
  SET used_count = used_count + 1
  WHERE id = code_id
    AND (max_uses IS NULL OR used_count < max_uses)
    AND is_active = true
    AND deleted_at IS NULL;

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;
