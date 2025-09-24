/*
  # Add completed_at column to steps table

  1. Schema Changes
    - Add `completed_at` column to `steps` table
    - Column is nullable timestamp with time zone
    - Allows tracking when steps are completed

  2. Notes
    - This resolves the "Could not find the 'completed_at' column" error
    - Existing steps will have NULL completed_at values
    - New completions will populate this field
*/

-- Add completed_at column to steps table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'steps' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE steps ADD COLUMN completed_at timestamptz;
  END IF;
END $$;