-- ============================================
-- MyYachtsInsurance MVP Database Schema
-- ============================================

-- 1. CREATE TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  website TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  yacht_type TEXT,
  yacht_length NUMERIC,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post tags junction table
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

-- Reactions table
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'helpful', 'insightful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT reaction_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  CONSTRAINT unique_post_reaction UNIQUE(user_id, post_id, type),
  CONSTRAINT unique_comment_reaction UNIQUE(user_id, comment_id, type)
);

-- FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_company_id ON posts(company_id);
CREATE INDEX IF NOT EXISTS idx_posts_location_id ON posts(location_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Reactions indexes
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_comment_id ON reactions(comment_id);

-- Post tags indexes
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);

-- Categories index
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- FAQs indexes
CREATE INDEX IF NOT EXISTS idx_faqs_display_order ON faqs(display_order);
CREATE INDEX IF NOT EXISTS idx_faqs_category_id ON faqs(category_id);

-- 3. CREATE FUNCTIONS
-- ============================================

-- Function to increment post view count
CREATE OR REPLACE FUNCTION increment_post_views(post_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET view_count = view_count + 1
  WHERE id = post_uuid;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 4. CREATE TRIGGERS
-- ============================================

-- Profiles updated_at trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Posts updated_at trigger
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments updated_at trigger
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Categories updated_at trigger
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Companies updated_at trigger
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- FAQs updated_at trigger
DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES
-- ============================================

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- POSTS POLICIES
DROP POLICY IF EXISTS "Published posts are viewable by everyone" ON posts;
CREATE POLICY "Published posts are viewable by everyone" ON posts
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = author_id);

-- COMMENTS POLICIES
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own comments" ON comments;
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = author_id);

-- REACTIONS POLICIES
DROP POLICY IF EXISTS "Reactions are viewable by everyone" ON reactions;
CREATE POLICY "Reactions are viewable by everyone" ON reactions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create reactions" ON reactions;
CREATE POLICY "Authenticated users can create reactions" ON reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reactions" ON reactions;
CREATE POLICY "Users can delete own reactions" ON reactions
  FOR DELETE USING (auth.uid() = user_id);

-- CATEGORIES POLICIES (Read-only for regular users)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- COMPANIES POLICIES (Read-only for regular users)
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON companies;
CREATE POLICY "Companies are viewable by everyone" ON companies
  FOR SELECT USING (true);

-- LOCATIONS POLICIES (Read-only for regular users)
DROP POLICY IF EXISTS "Locations are viewable by everyone" ON locations;
CREATE POLICY "Locations are viewable by everyone" ON locations
  FOR SELECT USING (true);

-- TAGS POLICIES
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON tags;
CREATE POLICY "Tags are viewable by everyone" ON tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create tags" ON tags;
CREATE POLICY "Authenticated users can create tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- POST_TAGS POLICIES
DROP POLICY IF EXISTS "Post tags are viewable by everyone" ON post_tags;
CREATE POLICY "Post tags are viewable by everyone" ON post_tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Post authors can manage their post tags" ON post_tags;
CREATE POLICY "Post authors can manage their post tags" ON post_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_tags.post_id
      AND posts.author_id = auth.uid()
    )
  );

-- FAQS POLICIES (Read-only for regular users)
DROP POLICY IF EXISTS "FAQs are viewable by everyone" ON faqs;
CREATE POLICY "FAQs are viewable by everyone" ON faqs
  FOR SELECT USING (true);

-- 7. INSERT SEED DATA
-- ============================================

-- Insert default categories
INSERT INTO categories (name, slug, description, display_order) VALUES
('Claims', 'claims', 'Insurance claims discussions and experiences', 1),
('Policies', 'policies', 'Policy coverage and recommendations', 2),
('Regulations', 'regulations', 'Maritime regulations and compliance', 3),
('Maintenance', 'maintenance', 'Yacht maintenance best practices', 4),
('Safety', 'safety', 'Safety equipment and procedures', 5),
('General', 'general', 'General yacht insurance discussions', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample companies
INSERT INTO companies (name, slug, description, verified) VALUES
('Pantaenius', 'pantaenius', 'International yacht insurance specialist with global coverage', true),
('Bluewater Insurance', 'bluewater-insurance', 'Specialist yacht insurance broker', true),
('Navigators & General', 'navigators-general', 'Marine insurance provider', true),
('Falvey Insurance', 'falvey-insurance', 'Yacht insurance specialists', true),
('BOAT International Insurance', 'boat-international', 'Luxury yacht insurance', false)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample locations
INSERT INTO locations (name, country, region) VALUES
('Mediterranean', 'Multiple', 'Europe'),
('Caribbean', 'Multiple', 'Americas'),
('Pacific Northwest', 'USA', 'North America'),
('French Riviera', 'France', 'Europe'),
('British Virgin Islands', 'BVI', 'Caribbean'),
('Florida', 'USA', 'North America'),
('Bahamas', 'Bahamas', 'Caribbean'),
('Greece', 'Greece', 'Europe'),
('Croatia', 'Croatia', 'Europe'),
('Thailand', 'Thailand', 'Asia')
ON CONFLICT DO NOTHING;

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category_id, display_order) VALUES
(
  'What does yacht insurance typically cover?',
  'Yacht insurance typically covers hull damage, machinery breakdown, third-party liability, personal injury, theft, and salvage costs. Coverage varies by policy and location.',
  (SELECT id FROM categories WHERE slug = 'policies' LIMIT 1),
  1
),
(
  'How is my yacht insurance premium calculated?',
  'Premiums are based on factors including yacht value, age, size, cruising area, usage (private vs charter), crew qualifications, and claims history. Higher-risk areas and vessels typically have higher premiums.',
  (SELECT id FROM categories WHERE slug = 'policies' LIMIT 1),
  2
),
(
  'What should I do immediately after an incident?',
  'Contact your insurer immediately, document everything with photos and videos, collect witness statements if applicable, and avoid admitting fault. Do not authorize repairs without insurer approval.',
  (SELECT id FROM categories WHERE slug = 'claims' LIMIT 1),
  3
),
(
  'Do I need separate coverage for different cruising areas?',
  'Yes, many policies restrict coverage by geographic area. If you plan to cruise outside your policy''s designated area, you must notify your insurer and may need to pay additional premium.',
  (SELECT id FROM categories WHERE slug = 'general' LIMIT 1),
  4
)
ON CONFLICT DO NOTHING;

-- ============================================
-- Migration Complete
-- ============================================
