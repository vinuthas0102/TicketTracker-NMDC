/*
  # Add Manager Due Date to Workflow Steps

  1. Changes
    - Add `manager_due_date` column to `workflow_steps` table
    - This field stores the due date set by users for managers (DO role) to complete steps
    - The existing `due_date` field represents user-set internal deadlines
    - Manager due date will be visible only to DO and EO roles
    - User due date will be hidden from DO role users

  2. Notes
    - Field is nullable to support existing steps
    - Uses timestamptz for consistency with other date fields
    - No default value as this is optional metadata
*/

-- Add manager_due_date column to workflow_steps table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workflow_steps' AND column_name = 'manager_due_date'
  ) THEN
    ALTER TABLE workflow_steps ADD COLUMN manager_due_date timestamptz;
  END IF;
END $$;
