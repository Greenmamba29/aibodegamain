/*
  # Add app drafts table and GitHub integration

  1. New Tables
    - `app_drafts`
      - `id` (uuid, primary key)
      - `developer_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `description` (text)
      - `long_description` (text)
      - `category_id` (uuid, foreign key to categories)
      - `pricing_type` (app_pricing_type)
      - `price` (numeric)
      - `app_url` (text)
      - `github_url` (text)
      - `demo_url` (text)
      - `repository_url` (text)
      - `documentation_url` (text)
      - `tags` (text array)
      - `files` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `app_drafts` table
    - Add policy for developers to manage their own drafts

  3. Sample Data
    - Insert sample categories if they don't exist
    - Insert sample developer profiles (using auth.users table properly)
    - Insert sample apps with proper relationships
    - Add sample reviews
*/

-- Create app_drafts table
CREATE TABLE IF NOT EXISTS app_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text,
  description text,
  long_description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  pricing_type app_pricing_type DEFAULT 'free',
  price numeric(10,2) DEFAULT 0,
  app_url text,
  github_url text,
  demo_url text,
  repository_url text,
  documentation_url text,
  tags text[] DEFAULT '{}',
  files jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE app_drafts ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Developers can manage own drafts"
  ON app_drafts
  FOR ALL
  TO authenticated
  USING (developer_id = auth.uid())
  WITH CHECK (developer_id = auth.uid());

-- Add updated_at trigger
CREATE TRIGGER update_app_drafts_updated_at
  BEFORE UPDATE ON app_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample categories if they don't exist
INSERT INTO categories (name, slug, description, icon, color) VALUES
  ('AI Image Generation', 'ai-image-generation', 'Create stunning visuals with AI', 'Image', '#FF6B6B'),
  ('Text Processing', 'text-processing', 'Advanced text analysis and generation', 'FileText', '#4ECDC4'),
  ('Voice & Audio', 'voice-audio', 'AI-powered voice and audio tools', 'Mic', '#45B7D1'),
  ('Code Assistance', 'code-assistance', 'AI coding companions and tools', 'Code', '#96CEB4'),
  ('Data Analytics', 'data-analytics', 'Intelligent data analysis and insights', 'BarChart3', '#FFEAA7'),
  ('Productivity', 'productivity', 'AI tools to boost your productivity', 'Zap', '#DDA0DD')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample apps with proper relationships
DO $$
DECLARE
  sample_user_id uuid;
  image_gen_category_id uuid;
  text_proc_category_id uuid;
  voice_category_id uuid;
  code_category_id uuid;
  data_category_id uuid;
  productivity_category_id uuid;
BEGIN
  -- Get the first user from auth.users to use as sample developer
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
  
  -- Only proceed if we have a user
  IF sample_user_id IS NOT NULL THEN
    -- Get category IDs
    SELECT id INTO image_gen_category_id FROM categories WHERE slug = 'ai-image-generation';
    SELECT id INTO text_proc_category_id FROM categories WHERE slug = 'text-processing';
    SELECT id INTO voice_category_id FROM categories WHERE slug = 'voice-audio';
    SELECT id INTO code_category_id FROM categories WHERE slug = 'code-assistance';
    SELECT id INTO data_category_id FROM categories WHERE slug = 'data-analytics';
    SELECT id INTO productivity_category_id FROM categories WHERE slug = 'productivity';

    -- Ensure the user has a profile
    INSERT INTO profiles (id, email, full_name, role, followers_count, following_count)
    VALUES (
      sample_user_id,
      'developer@example.com',
      'Sample Developer',
      'developer',
      1247,
      89
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'developer',
      followers_count = 1247,
      following_count = 89;

    -- Insert sample apps
    INSERT INTO apps (
      id, title, slug, description, long_description, developer_id, category_id, 
      status, pricing_type, price, app_url, github_url, demo_url, 
      logo_url, screenshots, tags, featured, downloads_count, rating_average, rating_count
    ) VALUES
      (
        '660e8400-e29b-41d4-a716-446655440001',
        'DreamCanvas AI',
        'dreamcanvas-ai',
        'Transform your ideas into stunning artwork with advanced AI image generation',
        'DreamCanvas AI is a revolutionary image generation tool that uses cutting-edge artificial intelligence to transform your creative ideas into stunning visual artwork. Whether you''re a professional designer, artist, or creative enthusiast, DreamCanvas AI empowers you to create high-quality images from simple text descriptions.',
        sample_user_id,
        image_gen_category_id,
        'approved',
        'freemium',
        0,
        'https://dreamcanvas.ai',
        'https://github.com/developer/dreamcanvas',
        'https://demo.dreamcanvas.ai',
        'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
        ARRAY['https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2', 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2'],
        ARRAY['AI', 'Image Generation', 'Art', 'Creative', 'Design'],
        true,
        12847,
        4.8,
        342
      ),
      (
        '660e8400-e29b-41d4-a716-446655440002',
        'TextMind Pro',
        'textmind-pro',
        'Advanced AI text analysis, summarization, and content generation platform',
        'TextMind Pro is your ultimate AI-powered text processing companion. From intelligent summarization to content generation, sentiment analysis to language translation, TextMind Pro handles all your text processing needs with state-of-the-art natural language processing.',
        sample_user_id,
        text_proc_category_id,
        'approved',
        'one_time',
        29.99,
        'https://textmind.pro',
        'https://github.com/developer/textmind',
        'https://demo.textmind.pro',
        'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
        ARRAY['https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2', 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2'],
        ARRAY['NLP', 'Text Analysis', 'AI', 'Productivity', 'Writing'],
        true,
        8923,
        4.6,
        198
      ),
      (
        '660e8400-e29b-41d4-a716-446655440003',
        'VoiceClone Studio',
        'voiceclone-studio',
        'Create realistic AI voice clones and generate speech from text',
        'VoiceClone Studio revolutionizes voice synthesis with advanced AI technology. Create realistic voice clones, generate natural-sounding speech from text, and customize voice characteristics for your projects. Perfect for content creators, developers, and businesses.',
        sample_user_id,
        voice_category_id,
        'approved',
        'subscription',
        19.99,
        'https://voiceclone.studio',
        NULL,
        'https://demo.voiceclone.studio',
        'https://images.pexels.com/photos/3784221/pexels-photo-3784221.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
        ARRAY['https://images.pexels.com/photos/3784221/pexels-photo-3784221.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2', 'https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2'],
        ARRAY['Voice AI', 'Speech Synthesis', 'Audio', 'TTS', 'Voice Cloning'],
        true,
        6547,
        4.7,
        156
      ),
      (
        '660e8400-e29b-41d4-a716-446655440004',
        'CodeGenius AI',
        'codegenius-ai',
        'Your intelligent coding companion for faster, smarter development',
        'CodeGenius AI is an advanced AI-powered coding assistant that helps developers write better code faster. With intelligent code completion, bug detection, optimization suggestions, and multi-language support, CodeGenius AI is your ultimate development companion.',
        sample_user_id,
        code_category_id,
        'approved',
        'freemium',
        0,
        'https://codegenius.ai',
        'https://github.com/developer/codegenius',
        'https://demo.codegenius.ai',
        'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
        ARRAY['https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2', 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2'],
        ARRAY['AI', 'Coding', 'Development', 'Programming', 'Assistant'],
        true,
        15234,
        4.9,
        287
      ),
      (
        '660e8400-e29b-41d4-a716-446655440005',
        'DataViz Intelligence',
        'dataviz-intelligence',
        'Transform raw data into beautiful, interactive visualizations with AI',
        'DataViz Intelligence leverages artificial intelligence to automatically analyze your data and create stunning, interactive visualizations. Whether you''re working with business metrics, research data, or analytics, DataViz Intelligence makes data storytelling effortless.',
        sample_user_id,
        data_category_id,
        'approved',
        'one_time',
        49.99,
        'https://dataviz.intelligence',
        NULL,
        'https://demo.dataviz.intelligence',
        'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
        ARRAY['https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2', 'https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2'],
        ARRAY['Data Visualization', 'Analytics', 'AI', 'Business Intelligence', 'Charts'],
        true,
        4321,
        4.5,
        89
      ),
      (
        '660e8400-e29b-41d4-a716-446655440006',
        'MindMate AI',
        'mindmate-ai',
        'Personal AI assistant that learns your habits and optimizes your workflow',
        'MindMate AI is your intelligent personal assistant that learns from your daily habits and helps optimize your digital life. From smart scheduling to productivity insights, MindMate AI adapts to your unique workflow and helps you achieve more.',
        sample_user_id,
        productivity_category_id,
        'approved',
        'subscription',
        9.99,
        'https://mindmate.ai',
        NULL,
        'https://demo.mindmate.ai',
        'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
        ARRAY['https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2', 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2'],
        ARRAY['AI Assistant', 'Productivity', 'Personal', 'Workflow', 'Automation'],
        false,
        2156,
        4.4,
        67
      )
    ON CONFLICT (id) DO NOTHING;

    -- Add some reviews for the apps
    INSERT INTO reviews (app_id, user_id, rating, title, content) VALUES
      ('660e8400-e29b-41d4-a716-446655440001', sample_user_id, 5, 'Amazing AI Art Tool!', 'DreamCanvas AI has completely transformed my creative workflow. The quality of generated images is incredible!'),
      ('660e8400-e29b-41d4-a716-446655440002', sample_user_id, 5, 'Best text processing tool', 'TextMind Pro has saved me hours of work. The summarization feature is incredibly accurate.'),
      ('660e8400-e29b-41d4-a716-446655440003', sample_user_id, 5, 'Voice cloning is mind-blowing', 'The quality of voice synthesis is unreal. Perfect for my podcast production workflow.'),
      ('660e8400-e29b-41d4-a716-446655440004', sample_user_id, 5, 'Coding assistant that actually works', 'CodeGenius AI has improved my coding speed by 40%. The suggestions are spot-on.')
    ON CONFLICT DO NOTHING;

  END IF;
END $$;