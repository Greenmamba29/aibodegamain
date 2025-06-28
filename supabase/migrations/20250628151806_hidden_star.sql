/*
  # Create notifications system with real-time features

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `type` (text, notification type)
      - `title` (text, notification title)
      - `message` (text, notification message)
      - `data` (jsonb, additional data)
      - `read` (boolean, read status)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `notifications` table
    - Add policies for users to read/update own notifications
    - Add policy for system to create notifications

  3. Indexes
    - Add indexes for performance on user_id, read status, created_at

  4. Constraints
    - Add check constraint for notification types
*/

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Add constraint for notification types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notifications_type_check' 
    AND conrelid = 'notifications'::regclass
  ) THEN
    ALTER TABLE notifications 
    ADD CONSTRAINT notifications_type_check 
    CHECK (type IN ('follow', 'review', 'app_approved', 'app_rejected', 'download'));
  END IF;
END $$;

-- RLS Policies with existence checks
DO $$
BEGIN
  -- Policy for reading own notifications
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Users can read own notifications'
  ) THEN
    CREATE POLICY "Users can read own notifications"
      ON notifications
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  -- Policy for updating own notifications
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Users can update own notifications'
  ) THEN
    CREATE POLICY "Users can update own notifications"
      ON notifications
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  -- Policy for system to create notifications
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'System can create notifications'
  ) THEN
    CREATE POLICY "System can create notifications"
      ON notifications
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;