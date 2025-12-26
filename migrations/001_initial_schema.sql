-- Website Scraper Pro - Paid Version Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Supabase Auth handles passwords)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Management
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_price_id VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL CHECK (tier IN ('free', 'starter', 'professional', 'business', 'enterprise')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Credit System
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    credits_total INTEGER NOT NULL DEFAULT 10,
    credits_used INTEGER DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT credits_remaining_check CHECK (credits_used <= credits_total)
);

-- Usage Tracking
CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id VARCHAR(255),
    pages_scraped INTEGER NOT NULL,
    credits_consumed INTEGER NOT NULL,
    ai_analysis_enabled BOOLEAN DEFAULT FALSE,
    cost_incurred DECIMAL(10, 4),
    url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment History
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blog Posts (for future auto-content)
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id),
    featured_image_url TEXT,
    seo_title VARCHAR(60),
    seo_description VARCHAR(160),
    tags TEXT[],
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blog Categories
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Post-Category Relationship
CREATE TABLE IF NOT EXISTS post_categories (
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_timestamp ON usage_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON user_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed initial blog categories
INSERT INTO blog_categories (name, slug, description) VALUES
    ('Tutorials', 'tutorials', 'Step-by-step guides for using Website Scraper Pro'),
    ('Use Cases', 'use-cases', 'Real-world examples and success stories'),
    ('SEO Tips', 'seo-tips', 'Search engine optimization strategies'),
    ('Industry News', 'industry-news', 'Latest updates in web scraping and AI')
ON CONFLICT (slug) DO NOTHING;

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own credits" ON user_credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

-- Blog posts are public when published
CREATE POLICY "Published posts are public" ON blog_posts
    FOR SELECT USING (status = 'published');

-- Service role can do everything (for backend)
CREATE POLICY "Service role full access users" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access subscriptions" ON subscriptions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access credits" ON user_credits
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access usage" ON usage_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access payments" ON payments
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access blog" ON blog_posts
    FOR ALL USING (auth.role() = 'service_role');

-- Grant public access to blog categories
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blog categories are public" ON blog_categories
    FOR SELECT USING (true);
