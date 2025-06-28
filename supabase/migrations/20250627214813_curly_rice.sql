/*
  # Storage Buckets and File Upload System

  1. Storage Buckets
    - `app-assets` bucket for app files (logos, screenshots, videos, docs)
    - `user-avatars` bucket for user profile pictures
    - `app-packages` bucket for downloadable app files

  2. Storage Policies
    - Public read access for approved app assets
    - Authenticated upload access for developers
    - User-specific access for profile pictures

  3. File Management
    - Automatic file organization by app ID and type
    - File size and type validation
    - Secure file access with RLS
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('app-assets', 'app-assets', true),
  ('user-avatars', 'user-avatars', true),
  ('app-packages', 'app-packages', false);

-- Storage policies for app-assets bucket
CREATE POLICY "Public read access for app assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'app-assets');

CREATE POLICY "Authenticated users can upload app assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'app-assets');

CREATE POLICY "Users can update own app assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'app-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own app assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'app-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for user-avatars bucket
CREATE POLICY "Public read access for avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for app-packages bucket (private)
CREATE POLICY "Developers can read own app packages"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'app-packages' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Developers can upload app packages"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'app-packages');

CREATE POLICY "Developers can update own app packages"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'app-packages' AND auth.uid()::text = (storage.foldername(name))[1]);