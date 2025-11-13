-- MyYachtsInsurance Database Schema
-- This file contains the complete database schema including tables, indexes, foreign keys, and RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Create custom types
CREATE TYPE user_role AS ENUM ('guest', 'user', 'verified_user', 'broker_verified', 'insurer_verified', 'moderator', 'admin');
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived', 'flagged', 'removed');
CREATE TYPE reaction_type AS ENUM ('like', 'dislike', 'share', 'bookmark');
CREATE TYPE company_type AS ENUM ('insurer', 'broker', 'provider');

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    reputation INTEGER DEFAULT 0 NOT NULL,
    yachts_owned INTEGER,
    primary_vessel TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Vessels table
CREATE TABLE vessels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT,
    length_ft DECIMAL(10, 2),
    year_built INTEGER,
    flag_state TEXT,
    home_port TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL
);

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT
);

-- Locations table (hierarchical)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    parent_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    level INTEGER DEFAULT 0 NOT NULL
);

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type company_type NOT NULL,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    yacht_type TEXT,
    yacht_length TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    status post_status DEFAULT 'published' NOT NULL,
    views INTEGER DEFAULT 0 NOT NULL,
    score INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Post-Tag junction table (many-to-many)
CREATE TABLE post_tags (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Comments table (threaded)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    score INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Reactions table
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    type reaction_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT reaction_target CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    ),
    UNIQUE(user_id, post_id, comment_id, type)
);

-- Follow table (user-to-user following)
CREATE TABLE follows (
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    followee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (follower_id, followee_id),
    CONSTRAINT no_self_follow CHECK (follower_id != followee_id)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- FAQs table
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Vessels indexes
CREATE INDEX idx_vessels_user_id ON vessels(user_id);

-- Posts indexes
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_company_id ON posts(company_id);
CREATE INDEX idx_posts_location_id ON posts(location_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_score ON posts(score DESC);
CREATE INDEX idx_posts_title_trgm ON posts USING gin(title gin_trgm_ops);
CREATE INDEX idx_posts_body_trgm ON posts USING gin(body gin_trgm_ops);

-- Comments indexes
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Reactions indexes
CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_reactions_post_id ON reactions(post_id);
CREATE INDEX idx_reactions_comment_id ON reactions(comment_id);
CREATE INDEX idx_reactions_type ON reactions(type);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Follows indexes
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_followee_id ON follows(followee_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update post score based on reactions
CREATE OR REPLACE FUNCTION update_post_score()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.post_id IS NOT NULL THEN
            UPDATE posts
            SET score = score + CASE
                WHEN NEW.type = 'like' THEN 1
                WHEN NEW.type = 'dislike' THEN -1
                ELSE 0
            END
            WHERE id = NEW.post_id;
        ELSIF NEW.comment_id IS NOT NULL THEN
            UPDATE comments
            SET score = score + CASE
                WHEN NEW.type = 'like' THEN 1
                WHEN NEW.type = 'dislike' THEN -1
                ELSE 0
            END
            WHERE id = NEW.comment_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.post_id IS NOT NULL THEN
            UPDATE posts
            SET score = score - CASE
                WHEN OLD.type = 'like' THEN 1
                WHEN OLD.type = 'dislike' THEN -1
                ELSE 0
            END
            WHERE id = OLD.post_id;
        ELSIF OLD.comment_id IS NOT NULL THEN
            UPDATE comments
            SET score = score - CASE
                WHEN OLD.type = 'like' THEN 1
                WHEN OLD.type = 'dislike' THEN -1
                ELSE 0
            END
            WHERE id = OLD.comment_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_score_on_reaction
    AFTER INSERT OR DELETE ON reactions
    FOR EACH ROW EXECUTE FUNCTION update_post_score();

-- Function to increment post views
CREATE OR REPLACE FUNCTION increment_post_views(post_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE posts SET views = views + 1 WHERE id = post_uuid;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Vessels policies
CREATE POLICY "Vessels are viewable by everyone" ON vessels
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own vessels" ON vessels
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vessels" ON vessels
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vessels" ON vessels
    FOR DELETE USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Published posts are viewable by everyone" ON posts
    FOR SELECT USING (status = 'published' OR auth.uid() = author_id);

CREATE POLICY "Authenticated users can create posts" ON posts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (auth.uid() = author_id);

-- Post_tags policies
CREATE POLICY "Post tags are viewable by everyone" ON post_tags
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage post tags" ON post_tags
    FOR ALL USING (
        auth.uid() IN (SELECT author_id FROM posts WHERE id = post_id)
    );

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (auth.uid() = author_id);

-- Reactions policies
CREATE POLICY "Reactions are viewable by everyone" ON reactions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage own reactions" ON reactions
    FOR ALL USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone" ON follows
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage own follows" ON follows
    FOR ALL USING (auth.uid() = follower_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Categories, Tags, Locations, Companies, FAQs policies (read-only for users)
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Tags are viewable by everyone" ON tags
    FOR SELECT USING (true);

CREATE POLICY "Locations are viewable by everyone" ON locations
    FOR SELECT USING (true);

CREATE POLICY "Companies are viewable by everyone" ON companies
    FOR SELECT USING (true);

CREATE POLICY "FAQs are viewable by everyone" ON faqs
    FOR SELECT USING (true);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default categories
INSERT INTO categories (name, slug, description, display_order) VALUES
    ('Claims', 'claims', 'Insurance claims discussions and experiences', 1),
    ('Policies', 'policies', 'Policy coverage, terms, and recommendations', 2),
    ('Regulations', 'regulations', 'Maritime regulations and compliance', 3),
    ('Maintenance', 'maintenance', 'Yacht maintenance and best practices', 4),
    ('Safety', 'safety', 'Safety equipment and procedures', 5),
    ('General', 'general', 'General yacht insurance discussions', 6);

-- Insert default tags
INSERT INTO tags (name, slug, description) VALUES
    ('Hurricane', 'hurricane', 'Hurricane-related discussions'),
    ('Fire', 'fire', 'Fire damage and prevention'),
    ('Hull Damage', 'hull-damage', 'Hull damage claims and repairs'),
    ('Theft', 'theft', 'Theft and security issues'),
    ('Liability', 'liability', 'Liability coverage discussions'),
    ('Salvage', 'salvage', 'Salvage operations and coverage'),
    ('Survey', 'survey', 'Yacht surveys and inspections'),
    ('Premium', 'premium', 'Insurance premium discussions');

-- Insert default locations
INSERT INTO locations (name, slug, level) VALUES
    ('Caribbean', 'caribbean', 0),
    ('Mediterranean', 'mediterranean', 0),
    ('United States', 'united-states', 0),
    ('Europe', 'europe', 0),
    ('Asia Pacific', 'asia-pacific', 0);

-- Insert child locations
INSERT INTO locations (name, slug, parent_id, level) VALUES
    ('Florida', 'florida', (SELECT id FROM locations WHERE slug = 'united-states'), 1),
    ('California', 'california', (SELECT id FROM locations WHERE slug = 'united-states'), 1),
    ('French Riviera', 'french-riviera', (SELECT id FROM locations WHERE slug = 'mediterranean'), 1),
    ('Greek Islands', 'greek-islands', (SELECT id FROM locations WHERE slug = 'mediterranean'), 1);

-- Insert sample companies
INSERT INTO companies (name, slug, type, description, verified) VALUES
    ('Lloyd''s of London', 'lloyds-of-london', 'insurer', 'Leading global insurance marketplace', true),
    ('Pantaenius', 'pantaenius', 'insurer', 'Specialist yacht insurance provider', true),
    ('Ocean Marine', 'ocean-marine', 'broker', 'International yacht insurance broker', true),
    ('Maritime Insurance Group', 'maritime-insurance-group', 'broker', 'Boutique yacht insurance brokerage', false);

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category_id, display_order) VALUES
    ('What does yacht insurance typically cover?', 'Yacht insurance typically covers hull damage, liability, personal injury, and property damage. Coverage varies by policy and may include additional protection for equipment, tenders, and navigational areas.', (SELECT id FROM categories WHERE slug = 'policies'), 1),
    ('How are yacht insurance premiums calculated?', 'Premiums are based on factors including vessel value, age, type, size, navigational area, claims history, and experience of the captain and crew.', (SELECT id FROM categories WHERE slug = 'policies'), 2),
    ('Do I need insurance if my yacht is in storage?', 'Yes, layup or storage insurance is recommended even when your yacht is not in use. It typically costs less than full coverage but protects against fire, theft, and other risks.', (SELECT id FROM categories WHERE slug = 'general'), 3),
    ('What should I do if I need to file a claim?', 'Contact your insurance provider immediately, document all damage with photos and videos, obtain repair estimates, and avoid making permanent repairs until the claim is approved.', (SELECT id FROM categories WHERE slug = 'claims'), 4);
