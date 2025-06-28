/*
  # User Following System and Enhanced File Support

  1. New Tables
    - `user_follows` - Track user following relationships
    - `app_files` - Store various file types for apps
    - `user_settings` - Extended user preferences and settings
    
  2. Enhanced Tables
    - Add social auth fields to profiles
    - Add file management capabilities
    
  3. Security
    - Enable RLS on all new tables
    - Add policies for user following and file access
*/

-- User following system
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- App files for various upload types
CREATE TABLE IF NOT EXISTS app_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  file_type text NOT NULL CHECK (file_type IN ('logo', 'screenshot', 'video', 'documentation', 'package', 'readme')),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  mime_type text,
  description text,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enhanced user settings
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  github_url text,
  website_url text,
  twitter_handle text,
  linkedin_url text,
  bio text,
  location text,
  company text,
  notification_preferences jsonb DEFAULT '{"email": true, "push": true, "follows": true, "reviews": true}'::jsonb,
  privacy_settings jsonb DEFAULT '{"profile_public": true, "email_public": false, "show_followers": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add follower counts to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0;

-- Add git repository support to apps
ALTER TABLE apps ADD COLUMN IF NOT EXISTS repository_url text;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS documentation_url text;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_app_files_app_id ON app_files(app_id);
CREATE INDEX IF NOT EXISTS idx_app_files_type ON app_files(file_type);

-- Enable RLS
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_follows
CREATE POLICY "Anyone can read public follows"
  ON user_follows
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can manage own follows"
  ON user_follows
  FOR ALL
  TO authenticated
  USING (follower_id = auth.uid())
  WITH CHECK (follower_id = auth.uid());

-- RLS Policies for app_files
CREATE POLICY "Anyone can read app files"
  ON app_files
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "App developers can manage app files"
  ON app_files
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM apps 
      WHERE apps.id = app_files.app_id 
      AND apps.developer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM apps 
      WHERE apps.id = app_files.app_id 
      AND apps.developer_id = auth.uid()
    )
  );

-- RLS Policies for user_settings
CREATE POLICY "Users can read public settings"
  ON user_settings
  FOR SELECT
  TO authenticated, anon
  USING (
    (privacy_settings->>'profile_public')::boolean = true
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can manage own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following count for follower
    UPDATE profiles 
    SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
    -- Increment followers count for followed user
    UPDATE profiles 
    SET followers_count = followers_count + 1 
    WHERE id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following count for follower
    UPDATE profiles 
    SET following_count = following_count - 1 
    WHERE id = OLD.follower_id;
    
    -- Decrement followers count for followed user
    UPDATE profiles 
    SET followers_count = followers_count - 1 
    WHERE id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for follower counts
CREATE TRIGGER update_follower_counts_trigger
  AFTER INSERT OR DELETE ON user_follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follower_counts();

-- Function to create user settings on profile creation
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create user settings
CREATE TRIGGER create_user_settings_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_settings();