-- Add status column to analyses table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'analyses' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE analyses 
        ADD COLUMN status VARCHAR(20) DEFAULT 'pending' NOT NULL;
    END IF;
END $$;
