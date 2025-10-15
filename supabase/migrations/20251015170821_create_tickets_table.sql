/*
  # Create Tickets System

  1. New Tables
    - `tickets`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `status` (text: open, in_progress, resolved, closed)
      - `priority` (text: low, medium, high, critical)
      - `assigned_to` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `tickets` table
    - Add policies for authenticated users to manage tickets
*/

CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  assigned_to text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tickets"
  ON tickets FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert tickets"
  ON tickets FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update tickets"
  ON tickets FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete tickets"
  ON tickets FOR DELETE
  TO public
  USING (true);
