/*
  # Add Sample Data for Vibe Store

  1. Categories
    - Insert sample app categories with icons and colors
  
  2. Sample Apps
    - Insert sample apps with dynamic developer assignment
    - Use existing users from auth.users table
  
  3. Reviews
    - Add sample reviews for the apps
*/

-- Insert sample categories if they don't exist
INSERT INTO categories (name, slug, description, icon, color) VALUES
  ('AI Image Generation', 'ai-image-generation', 'Create stunning visuals with AI', 'Image', '#FF6B6B'),
  ('Text Processing', 'text-processing', 'Advanced text analysis and generation', 'FileText', '#4ECDC4'),
  ('Voice & Audio', 'voice-audio', 'AI-powered voice and audio tools', 'Mic', '#45B7D1'),
  ('Code Assistance', 'code-assistance', 'AI coding companions and tools', 'Code', '#96CEB4'),
  ('Data Analytics', 'data-analytics', 'Intelligent data analysis and insights', 'BarChart3', '#FFEAA7'),
  ('Productivity', 'productivity', 'AI tools to boost your productivity', 'Zap', '#DDA0DD')
ON CONFLICT (slug) DO NOTHING;

-- Create a function to get or create a sample developer user
CREATE OR REPLACE FUNCTION get_sample_developer() RETURNS uuid AS $$
DECLARE
  sample_user_id uuid;
BEGIN
  -- Try to get an existing user from auth.users
  SELECT id INTO sample_user_id 
  FROM auth.users 
  LIMIT 1;
  
  -- If no user exists, return NULL
  IF sample_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Check if this user already has a profile
  DECLARE
    profile_exists boolean;
  BEGIN
    SELECT EXISTS(
      SELECT 1 FROM profiles WHERE id = sample_user_id
    ) INTO profile_exists;
    
    -- If profile doesn't exist, create one
    IF NOT profile_exists THEN
      INSERT INTO profiles (
        id, 
        email, 
        full_name, 
        role, 
        followers_count, 
        following_count
      )
      SELECT 
        id, 
        email, 
        COALESCE(raw_user_meta_data->>'full_name', 'Sample Developer'), 
        'developer', 
        1247, 
        89
      FROM auth.users
      WHERE id = sample_user_id;
    ELSE
      -- Update existing profile to be a developer
      UPDATE profiles 
      SET 
        role = 'developer',
        followers_count = 1247,
        following_count = 89
      WHERE id = sample_user_id;
    END IF;
  END;
  
  RETURN sample_user_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample apps using existing developer
DO $$
DECLARE
  developer_id uuid;
  image_gen_category_id uuid;
  text_proc_category_id uuid;
  voice_category_id uuid;
  code_category_id uuid;
  data_category_id uuid;
  productivity_category_id uuid;
BEGIN
  -- Get a developer ID from existing users
  SELECT get_sample_developer() INTO developer_id;
  
  -- Only proceed if we have a valid developer
  IF developer_id IS NOT NULL THEN
    -- Get category IDs
    SELECT id INTO image_gen_category_id FROM categories WHERE slug = 'ai-image-generation' LIMIT 1;
    SELECT id INTO text_proc_category_id FROM categories WHERE slug = 'text-processing' LIMIT 1;
    SELECT id INTO voice_category_id FROM categories WHERE slug = 'voice-audio' LIMIT 1;
    SELECT id INTO code_category_id FROM categories WHERE slug = 'code-assistance' LIMIT 1;
    SELECT id INTO data_category_id FROM categories WHERE slug = 'data-analytics' LIMIT 1;
    SELECT id INTO productivity_category_id FROM categories WHERE slug = 'productivity' LIMIT 1;

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
        developer_id,
        image_gen_category_id,
        'approved',
        'freemium',
        0,
        'https://dreamcanvas.ai',
        'https://github.com/sarahdev/dreamcanvas',
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
        developer_id,
        text_proc_category_id,
        'approved',
        'one_time',
        29.99,
        'https://textmind.pro',
        'https://github.com/mikedev/textmind',
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
        developer_id,
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
        developer_id,
        code_category_id,
        'approved',
        'freemium',
        0,
        'https://codegenius.ai',
        'https://github.com/jasondev/codegenius',
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
        developer_id,
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
        developer_id,
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

    -- Add sample reviews for the apps
    INSERT INTO reviews (app_id, user_id, rating, title, content) VALUES
      ('660e8400-e29b-41d4-a716-446655440001', developer_id, 5, 'Amazing AI Art Tool!', 'DreamCanvas AI has completely transformed my creative workflow. The quality of generated images is incredible!'),
      ('660e8400-e29b-41d4-a716-446655440002', developer_id, 5, 'Best text processing tool', 'TextMind Pro has saved me hours of work. The summarization feature is incredibly accurate.'),
      ('660e8400-e29b-41d4-a716-446655440003', developer_id, 5, 'Voice cloning is mind-blowing', 'The quality of voice synthesis is unreal. Perfect for my podcast production workflow.'),
      ('660e8400-e29b-41d4-a716-446655440004', developer_id, 5, 'Coding assistant that actually works', 'CodeGenius AI has improved my coding speed by 40%. The suggestions are spot-on.')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Clean up the helper function
DROP FUNCTION IF EXISTS get_sample_developer();