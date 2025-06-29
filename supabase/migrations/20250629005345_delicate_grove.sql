/*
  # Fix App Functionality

  1. App Likes
    - Ensure app_likes table exists with proper constraints
    - Add proper RLS policies for managing likes
    
  2. User Settings
    - Update user_settings table to include all required preferences
    - Ensure proper saving of profile picture updates
    
  3. Notification Preferences
    - Add app_updates to notification preferences
    - Ensure proper structure for notification settings
    
  4. Privacy Settings
    - Add show_github to privacy settings
    - Ensure proper structure for privacy settings
    
  5. Avatar Updates
    - Create function to handle avatar updates
    - Add trigger for avatar timestamp updates
*/

-- Ensure app_likes table exists
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
  -- Policy for managing own likes
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

  -- Policy for reading likes
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

-- Update user_settings default notification_preferences to include app_updates
DO $$
BEGIN
  -- Check if the column exists and has a default value
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings'
    AND column_name = 'notification_preferences'
  ) THEN
    -- Update the default value for future rows
    ALTER TABLE user_settings 
    ALTER COLUMN notification_preferences 
    SET DEFAULT '{"push": true, "email": true, "follows": true, "reviews": true, "app_updates": true}'::jsonb;
    
    -- Update existing rows
    UPDATE user_settings
    SET notification_preferences = notification_preferences || '{"app_updates": true}'::jsonb
    WHERE notification_preferences->>'app_updates' IS NULL;
  END IF;
END $$;

-- Update user_settings default privacy_settings to include show_github
DO $$
BEGIN
  -- Check if the column exists and has a default value
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings'
    AND column_name = 'privacy_settings'
  ) THEN
    -- Update the default value for future rows
    ALTER TABLE user_settings 
    ALTER COLUMN privacy_settings 
    SET DEFAULT '{"email_public": false, "profile_public": true, "show_followers": true, "show_github": true}'::jsonb;
    
    -- Update existing rows
    UPDATE user_settings
    SET privacy_settings = privacy_settings || '{"show_github": true}'::jsonb
    WHERE privacy_settings->>'show_github' IS NULL;
  END IF;
END $$;

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