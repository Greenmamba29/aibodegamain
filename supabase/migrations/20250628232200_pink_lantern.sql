/*
  # Fix App Functionality Issues

  1. User Settings
    - Update user_settings to include app_updates in notification_preferences
    - Add show_github to privacy_settings
    - Fix profile picture update functionality

  2. App Likes
    - Ensure app_likes table exists with proper constraints and policies

  3. Avatar Update
    - Create function to handle avatar updates
    - Add trigger for avatar timestamp updates
*/

-- Create app_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS app_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  app_id uuid NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, app_id)
);

-- Enable RLS on app_likes if not already enabled
ALTER TABLE app_likes ENABLE ROW LEVEL SECURITY;

-- Create indexes for app_likes if they don't exist
CREATE INDEX IF NOT EXISTS idx_app_likes_user_id ON app_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_app_likes_app_id ON app_likes(app_id);

-- Add RLS policies for app_likes with existence checks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'app_likes' 
    AND policyname = 'Users can manage own likes'
  ) THEN
    CREATE POLICY "Users can manage own likes"
      ON app_likes
      FOR ALL
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'app_likes' 
    AND policyname = 'Anyone can read likes'
  ) THEN
    CREATE POLICY "Anyone can read likes"
      ON app_likes
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Update user_settings to include app_updates in notification_preferences
UPDATE user_settings
SET notification_preferences = notification_preferences || '{"app_updates": true}'::jsonb
WHERE notification_preferences->>'app_updates' IS NULL;

-- Update user_settings to include show_github in privacy_settings
UPDATE user_settings
SET privacy_settings = privacy_settings || '{"show_github": true}'::jsonb
WHERE privacy_settings->>'show_github' IS NULL;

-- Create function to handle avatar updates
CREATE OR REPLACE FUNCTION handle_avatar_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the updated_at timestamp when avatar_url changes
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for avatar updates if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_avatar_timestamp'
  ) THEN
    CREATE TRIGGER update_avatar_timestamp
      BEFORE UPDATE OF avatar_url ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION handle_avatar_update();
  END IF;
END $$;