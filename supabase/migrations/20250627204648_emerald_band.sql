/*
  # AI Indie App Store - Initial Database Schema

  1. New Tables
    - `profiles` - User profiles extending auth.users
    - `categories` - AI/ML app categories
    - `apps` - Main application catalog
    - `reviews` - User reviews and ratings
    - `bookmarks` - User favorites
    - `subscriptions` - User subscription plans
    - `transactions` - Payment history
    - `collections` - Curated app collections
    - `collection_apps` - Many-to-many relationship for collections
    - `app_views` - Track app view analytics

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure data access patterns

  3. Storage
    - Create buckets for app assets
    - Set up proper access policies
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE app_status AS ENUM ('pending', 'approved', 'rejected', 'archived');
CREATE TYPE user_role AS ENUM ('consumer', 'developer', 'admin');
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE app_pricing_type AS ENUM ('free', 'one_time', 'subscription', 'freemium');

-- User profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role user_role DEFAULT 'consumer',
  subscription_tier subscription_tier DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  color text DEFAULT '#8B5CF6',
  created_at timestamptz DEFAULT now()
);

-- Apps table
CREATE TABLE IF NOT EXISTS apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  long_description text,
  developer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  status app_status DEFAULT 'pending',
  pricing_type app_pricing_type DEFAULT 'free',
  price decimal(10,2) DEFAULT 0,
  app_url text,
  github_url text,
  demo_url text,
  logo_url text,
  screenshots text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  downloads_count integer DEFAULT 0,
  rating_average decimal(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES apps(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title text,
  content text,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(app_id, user_id)
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  app_id uuid REFERENCES apps(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, app_id)
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  curator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_public boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Collection apps junction table
CREATE TABLE IF NOT EXISTS collection_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  app_id uuid REFERENCES apps(id) ON DELETE CASCADE NOT NULL,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(collection_id, app_id)
);

-- App views for analytics
CREATE TABLE IF NOT EXISTS app_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES apps(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  referrer text,
  created_at timestamptz DEFAULT now()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tier subscription_tier NOT NULL,
  stripe_subscription_id text UNIQUE,
  status text DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  app_id uuid REFERENCES apps(id) ON DELETE SET NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  stripe_payment_intent_id text UNIQUE,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for categories
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (true);

-- RLS Policies for apps
CREATE POLICY "Anyone can read approved apps"
  ON apps FOR SELECT
  TO authenticated, anon
  USING (status = 'approved');

CREATE POLICY "Developers can manage own apps"
  ON apps FOR ALL
  TO authenticated
  USING (developer_id = auth.uid());

CREATE POLICY "Admins can manage all apps"
  ON apps FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for bookmarks
CREATE POLICY "Users can manage own bookmarks"
  ON bookmarks FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for collections
CREATE POLICY "Anyone can read public collections"
  ON collections FOR SELECT
  TO authenticated, anon
  USING (is_public = true);

CREATE POLICY "Users can read own collections"
  ON collections FOR SELECT
  TO authenticated
  USING (curator_id = auth.uid());

CREATE POLICY "Users can manage own collections"
  ON collections FOR ALL
  TO authenticated
  USING (curator_id = auth.uid());

-- RLS Policies for collection_apps
CREATE POLICY "Anyone can read public collection apps"
  ON collection_apps FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE id = collection_id AND is_public = true
    )
  );

CREATE POLICY "Collection curators can manage collection apps"
  ON collection_apps FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE id = collection_id AND curator_id = auth.uid()
    )
  );

-- RLS Policies for app_views
CREATE POLICY "Anyone can insert app views"
  ON app_views FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Developers can read own app views"
  ON app_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM apps 
      WHERE id = app_id AND developer_id = auth.uid()
    )
  );

-- RLS Policies for subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for transactions
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category_id);
CREATE INDEX IF NOT EXISTS idx_apps_developer ON apps(developer_id);
CREATE INDEX IF NOT EXISTS idx_apps_featured ON apps(featured);
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON apps(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_app_id ON reviews(app_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_app_views_app_id ON app_views(app_id);
CREATE INDEX IF NOT EXISTS idx_app_views_created_at ON app_views(created_at);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_apps_updated_at BEFORE UPDATE ON apps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update app ratings
CREATE OR REPLACE FUNCTION update_app_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE apps SET 
    rating_average = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM reviews 
      WHERE app_id = COALESCE(NEW.app_id, OLD.app_id)
    ),
    rating_count = (
      SELECT COUNT(*) 
      FROM reviews 
      WHERE app_id = COALESCE(NEW.app_id, OLD.app_id)
    )
  WHERE id = COALESCE(NEW.app_id, OLD.app_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for updating app ratings
CREATE TRIGGER update_app_ratings_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_app_rating();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();