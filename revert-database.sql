-- 1. DROP RELATIONS & POLICIES (Drop policies FIRST while tables still exist)

-- Products Policies
DROP POLICY IF EXISTS "Buyers can reserve stock" ON public.products;

-- Quotation Policies
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotation') THEN
    DROP POLICY IF EXISTS "Buyers can create quotations" ON public.quotation;
  END IF;
END $$;

-- Orders Policies
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;

-- Inventory Logs Policies
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_logs') THEN
    DROP POLICY IF EXISTS "Buyers can log inventory" ON public.inventory_logs;
  END IF;
END $$;

-- 2. Drop RPC functions
DROP FUNCTION IF EXISTS public.reduce_stock_after_payment(uuid, numeric);

-- 3. Drop new tables
DROP TABLE IF EXISTS public.stock_waitlist CASCADE;
DROP TABLE IF EXISTS public.inventory_logs CASCADE;
DROP TABLE IF EXISTS public.platform_settings CASCADE;

-- 4. Revert products table columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price_per_meter') THEN
    ALTER TABLE public.products RENAME COLUMN price_per_meter TO base_price;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'available_stock_meters') THEN
    ALTER TABLE public.products RENAME COLUMN available_stock_meters TO stock_quantity;
  END IF;
END $$;

ALTER TABLE public.products DROP COLUMN IF EXISTS reserved_stock_meters;

-- 5. Revert quotation table columns
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotation') THEN
    ALTER TABLE public.quotation DROP COLUMN IF EXISTS subtotal;
    ALTER TABLE public.quotation DROP COLUMN IF EXISTS tax_amount;
    ALTER TABLE public.quotation DROP COLUMN IF EXISTS delivery_charge;
    ALTER TABLE public.quotation DROP COLUMN IF EXISTS quantity;
    ALTER TABLE public.quotation DROP COLUMN IF EXISTS price_per_meter;
  END IF;
END $$;

-- 6. Cleanup any corrupted data
UPDATE public.orders 
SET status = 'PENDING' 
WHERE status IN ('WAITLISTED', 'QUOTED', 'INVOICED');
