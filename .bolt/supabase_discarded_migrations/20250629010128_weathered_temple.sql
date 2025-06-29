/*
  # Fix Notifications Table and Policies

  This migration ensures the notifications table exists with proper structure
  and policies, using conditional checks to avoid conflicts with existing objects.
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

-- Add constraint for notification types using DO block
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

-- Create function to create follow notification if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'create_follow_notification'
  ) THEN
    CREATE OR REPLACE FUNCTION create_follow_notification()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (
        NEW.following_id,
        'follow',
        'New Follower',
        (SELECT full_name FROM profiles WHERE id = NEW.follower_id) || ' started following you',
        jsonb_build_object('follower_id', NEW.follower_id)
      );
      RETURN NEW;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but don't fail the follow operation
        RAISE LOG 'Error creating follow notification: %', SQLERRM;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Create trigger for follow notifications if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'follow_notification_trigger'
  ) THEN
    CREATE TRIGGER follow_notification_trigger
      AFTER INSERT ON user_follows
      FOR EACH ROW
      EXECUTE FUNCTION create_follow_notification();
  END IF;
END $$;

-- Create function to create review notification if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'create_review_notification'
  ) THEN
    CREATE OR REPLACE FUNCTION create_review_notification()
    RETURNS TRIGGER AS $$
    DECLARE
      app_developer_id uuid;
      app_title text;
      reviewer_name text;
    BEGIN
      -- Get app developer and title
      SELECT developer_id, title INTO app_developer_id, app_title
      FROM apps WHERE id = NEW.app_id;
      
      -- Get reviewer name
      SELECT full_name INTO reviewer_name
      FROM profiles WHERE id = NEW.user_id;
      
      -- Don't notify if developer is reviewing their own app
      IF app_developer_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
          app_developer_id,
          'review',
          'New Review',
          reviewer_name || ' left a ' || NEW.rating || '-star review on "' || app_title || '"',
          jsonb_build_object('app_id', NEW.app_id, 'review_id', NEW.id, 'rating', NEW.rating)
        );
      END IF;
      
      RETURN NEW;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but don't fail the review operation
        RAISE LOG 'Error creating review notification: %', SQLERRM;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Create trigger for review notifications if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'review_notification_trigger'
  ) THEN
    CREATE TRIGGER review_notification_trigger
      AFTER INSERT ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION create_review_notification();
  END IF;
END $$;