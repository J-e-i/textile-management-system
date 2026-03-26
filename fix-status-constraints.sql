-- SQL Migration: Fix Order and Quotation Status Constraints
-- This script ensures all necessary statuses are allowed in the check constraints.

-- 1. Fix 'orders' table status constraint
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS orders_status_check;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

ALTER TABLE IF EXISTS orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('PENDING', 'CONFIRMED', 'QUOTED', 'AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'IN_PRODUCTION', 'SHIPPED'));

-- 2. Fix 'quotation' table status constraint (just in case)
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS quotation DROP CONSTRAINT IF EXISTS quotation_status_check;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

ALTER TABLE IF EXISTS quotation 
ADD CONSTRAINT quotation_status_check 
CHECK (status IN ('ACTIVE', 'ACCEPTED', 'EXPIRED', 'REJECTED'));
