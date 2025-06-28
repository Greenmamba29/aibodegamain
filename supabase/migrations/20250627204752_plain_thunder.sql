/*
  # Seed Data for AI Indie App Store

  1. Categories
    - AI/ML categories for app organization
  
  2. Sample Apps
    - Diverse AI tools for demonstration
  
  3. Collections
    - Curated app collections
*/

-- Insert categories
INSERT INTO categories (name, slug, description, icon, color) VALUES
  ('Natural Language Processing', 'nlp', 'Apps that understand and generate human language', 'MessageSquare', '#8B5CF6'),
  ('Computer Vision', 'computer-vision', 'Apps that analyze and process images and videos', 'Eye', '#3B82F6'),
  ('Machine Learning Tools', 'ml-tools', 'Tools for building and deploying ML models', 'Brain', '#14B8A6'),
  ('Data Analytics', 'data-analytics', 'Apps for data analysis and visualization', 'BarChart3', '#F59E0B'),
  ('Content Generation', 'content-generation', 'AI-powered content creation tools', 'PenTool', '#EF4444'),
  ('Automation', 'automation', 'AI-driven automation and workflow tools', 'Zap', '#8B5CF6'),
  ('Voice & Audio', 'voice-audio', 'Speech recognition and audio processing apps', 'Mic', '#06B6D4'),
  ('Development Tools', 'dev-tools', 'AI-powered tools for developers', 'Code', '#10B981'),
  ('Research & Analysis', 'research-analysis', 'Tools for research and data analysis', 'Search', '#F97316'),
  ('Creative AI', 'creative-ai', 'AI tools for creative projects', 'Palette', '#EC4899')
ON CONFLICT (slug) DO NOTHING;

-- Note: Sample apps and collections will be created through the admin interface
-- This ensures proper user associations and realistic data flow