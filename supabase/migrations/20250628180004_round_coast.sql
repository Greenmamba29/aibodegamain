/*
  # Add app_likes table for like functionality

  1. New Tables
    - `app_likes` - Track user likes for apps
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `app_id` (uuid, foreign key to apps)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on `app_likes` table
    - Add policies for users to manage their own likes
    - Add policies for public reading of likes
    
  3. Constraints
    - Add unique constraint for user_id and app_id
*/

-- Create app_likes table
CREATE TABLE IF NOT EXISTS app_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  app_id uuid NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, app_id)
);

-- Enable RLS
ALTER TABLE app_likes ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_likes_user_id ON app_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_app_likes_app_id ON app_likes(app_id);

-- RLS Policies
CREATE POLICY "Users can manage own likes"
  ON app_likes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can read likes"
  ON app_likes
  FOR SELECT
  TO anon, authenticated
  USING (true);