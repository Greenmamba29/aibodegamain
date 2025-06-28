/*
  # App Purchases Table

  1. New Table
    - `app_purchases` - Track user app purchases
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `app_id` (uuid, foreign key to apps)
      - `purchase_date` (timestamp)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `app_purchases` table
    - Add policies for users to read their own purchases
*/

-- Create app_purchases table
CREATE TABLE IF NOT EXISTS app_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  app_id uuid NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  purchase_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, app_id)
);

-- Enable RLS
ALTER TABLE app_purchases ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_purchases_user_id ON app_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_app_purchases_app_id ON app_purchases(app_id);

-- RLS Policies
CREATE POLICY "Users can read own purchases"
  ON app_purchases
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Developers can see who purchased their apps
CREATE POLICY "Developers can see purchases of their apps"
  ON app_purchases
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM apps
      WHERE apps.id = app_purchases.app_id
      AND apps.developer_id = auth.uid()
    )
  );