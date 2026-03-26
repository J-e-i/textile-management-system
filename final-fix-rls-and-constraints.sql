-- SQL Migration: Fix RLS Policies and Status Constraints
-- This script ensures buyers can update their own orders/quotations and all statuses are allowed.

-- 1. Fix 'orders' table
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS orders_status_check;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

ALTER TABLE IF EXISTS orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('PENDING', 'CONFIRMED', 'QUOTED', 'AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'IN_PRODUCTION', 'SHIPPED'));

-- Allow buyers to update their own orders (needed for status changes)
DROP POLICY IF EXISTS "Buyers can update own orders" ON orders;
CREATE POLICY "Buyers can update own orders"
ON orders FOR UPDATE
USING (buyer_id = auth.uid())
WITH CHECK (buyer_id = auth.uid());

-- Allow admins to update all orders
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
CREATE POLICY "Admins can update all orders"
ON orders FOR UPDATE
USING (get_user_role() = 'admin');


-- 2. Fix 'quotation' table
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS quotation DROP CONSTRAINT IF EXISTS quotation_status_check;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

ALTER TABLE IF EXISTS quotation 
ADD CONSTRAINT quotation_status_check 
CHECK (status IN ('ACTIVE', 'ACCEPTED', 'EXPIRED', 'REJECTED'));

-- Allow buyers to update their own quotations (needed for accept/reject)
-- Note: quotation table uses order_id to link to buyer, or has buyer_id directly.
-- In 'create-real-database-tables.sql', it has buyer_id.
-- In 'supabase.ts', it only has order_id. 
-- Let's check both possibilities.

DROP POLICY IF EXISTS "Buyers can update own quotations" ON quotation;
CREATE POLICY "Buyers can update own quotations"
ON quotation FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = quotation.order_id 
        AND orders.buyer_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = quotation.order_id 
        AND orders.buyer_id = auth.uid()
    )
);

-- Allow admins to update all quotations
DROP POLICY IF EXISTS "Admins can update all quotations" ON quotation;
CREATE POLICY "Admins can update all quotations"
ON quotation FOR UPDATE
USING (get_user_role() = 'admin');
