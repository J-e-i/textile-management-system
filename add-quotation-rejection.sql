-- SQL Migration: Add Rejection Functionality to Quotations
-- This script safely adds the rejection_reason column and updates the status constraint.

-- 1. Add rejection_reason column if it doesn't exist
ALTER TABLE IF EXISTS quotation 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Update the status check constraint to allow 'REJECTED'
-- Note: We first try to drop the likely constraint name.
-- If the constraint name is different, this might need manual adjustment.
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS quotation DROP CONSTRAINT IF EXISTS quotation_status_check;
EXCEPTION
    WHEN undefined_object THEN
        -- Do nothing if the constraint doesn't exist
END $$;

-- 3. Re-add the status constraint with 'REJECTED' included
ALTER TABLE IF EXISTS quotation 
ADD CONSTRAINT quotation_status_check 
CHECK (status IN ('ACTIVE', 'ACCEPTED', 'EXPIRED', 'REJECTED'));
