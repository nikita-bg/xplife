-- ============================================================
-- XPLife Analytics System Migration
-- ============================================================
-- This migration creates three tables for self-hosted analytics:
-- 1. analytics_sessions - Unique visitor sessions
-- 2. analytics_page_views - Individual page view events
-- 3. analytics_rate_limits - Rate limiting for API endpoints
-- ============================================================

-- Drop existing tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS analytics_page_views CASCADE;
DROP TABLE IF EXISTS analytics_rate_limits CASCADE;
DROP TABLE IF EXISTS analytics_sessions CASCADE;

-- ============================================================
-- TABLE 1: Analytics Sessions
-- ============================================================
-- Tracks unique visitor sessions using hash-based identification
-- (IP + User-Agent + Date) to avoid cookies and maintain privacy
-- ============================================================

CREATE TABLE analytics_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Session identification
    session_hash TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT,

    -- Geographic data
    country TEXT DEFAULT 'Unknown',
    city TEXT DEFAULT 'Unknown',

    -- Device and browser info
    device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'bot')),
    browser TEXT,
    os TEXT,

    -- Traffic source tracking
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,

    -- Session timing
    first_seen_at TIMESTAMPTZ DEFAULT now(),
    last_seen_at TIMESTAMPTZ DEFAULT now(),
    page_view_count INT DEFAULT 1,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_analytics_sessions_hash ON analytics_sessions(session_hash);
CREATE INDEX idx_analytics_sessions_created_at ON analytics_sessions(created_at DESC);
CREATE INDEX idx_analytics_sessions_first_seen ON analytics_sessions(first_seen_at DESC);
CREATE INDEX idx_analytics_sessions_country ON analytics_sessions(country);
CREATE INDEX idx_analytics_sessions_device ON analytics_sessions(device_type);
CREATE INDEX idx_analytics_sessions_utm_source ON analytics_sessions(utm_source);

-- Unique constraint: one session per hash
CREATE UNIQUE INDEX idx_analytics_sessions_unique ON analytics_sessions(session_hash);

COMMENT ON TABLE analytics_sessions IS 'Tracks unique visitor sessions without cookies using hash-based identification';
COMMENT ON COLUMN analytics_sessions.session_hash IS 'SHA-256 hash of IP + UserAgent + date for daily session uniqueness';
COMMENT ON COLUMN analytics_sessions.page_view_count IS 'Number of pages viewed in this session';

-- ============================================================
-- TABLE 2: Analytics Page Views
-- ============================================================
-- Tracks individual page view events with full context
-- ============================================================

CREATE TABLE analytics_page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign key to session
    session_id UUID REFERENCES analytics_sessions(id) ON DELETE CASCADE,

    -- Page information
    path TEXT NOT NULL,
    query_params JSONB DEFAULT '{}'::jsonb,

    -- Traffic source
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,

    -- Device and location (denormalized for fast queries)
    device_type TEXT,
    country TEXT DEFAULT 'Unknown',

    -- Performance metrics
    load_time_ms INT,

    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for analytics queries
CREATE INDEX idx_analytics_page_views_session ON analytics_page_views(session_id);
CREATE INDEX idx_analytics_page_views_path ON analytics_page_views(path);
CREATE INDEX idx_analytics_page_views_created_at ON analytics_page_views(created_at DESC);
CREATE INDEX idx_analytics_page_views_country ON analytics_page_views(country);
CREATE INDEX idx_analytics_page_views_device ON analytics_page_views(device_type);
CREATE INDEX idx_analytics_page_views_utm_source ON analytics_page_views(utm_source);

-- Composite index for popular queries (time-based path analysis)
CREATE INDEX idx_analytics_page_views_date_path ON analytics_page_views(created_at DESC, path);
CREATE INDEX idx_analytics_page_views_path_date ON analytics_page_views(path, created_at DESC);

COMMENT ON TABLE analytics_page_views IS 'Individual page view events with full tracking context';
COMMENT ON COLUMN analytics_page_views.query_params IS 'URL query parameters stored as JSONB for flexible analysis';
COMMENT ON COLUMN analytics_page_views.load_time_ms IS 'Page load time in milliseconds (if tracked by client)';

-- ============================================================
-- TABLE 3: Analytics Rate Limits
-- ============================================================
-- Tracks API request counts per IP for rate limiting
-- Used as PostgreSQL-based alternative to Redis
-- ============================================================

CREATE TABLE analytics_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Rate limit key
    ip_address TEXT NOT NULL,
    endpoint TEXT NOT NULL,

    -- Counter
    request_count INT DEFAULT 1,

    -- Time window (sliding window approach)
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint: one record per IP per endpoint per time window
CREATE UNIQUE INDEX idx_analytics_rate_limits_unique
ON analytics_rate_limits(ip_address, endpoint, window_start);

-- Index for cleanup of old records
CREATE INDEX idx_analytics_rate_limits_window_end ON analytics_rate_limits(window_end);
CREATE INDEX idx_analytics_rate_limits_ip ON analytics_rate_limits(ip_address);

COMMENT ON TABLE analytics_rate_limits IS 'Request counter for rate limiting without external Redis dependency';
COMMENT ON COLUMN analytics_rate_limits.window_start IS 'Start of the rate limit window (sliding)';
COMMENT ON COLUMN analytics_rate_limits.window_end IS 'End of the rate limit window for cleanup';

-- ============================================================
-- FUNCTION: Auto-cleanup old rate limit records
-- ============================================================
-- Removes rate limit records older than 2 hours to prevent
-- unbounded table growth
-- ============================================================

CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM analytics_rate_limits
    WHERE window_end < now() - interval '2 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_rate_limits IS 'Deletes rate limit records older than 2 hours to prevent table bloat';

-- Optional: Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-rate-limits', '*/30 * * * *', 'SELECT cleanup_rate_limits()');

-- ============================================================
-- FUNCTION: Update session on page view
-- ============================================================
-- Automatically increments page_view_count and updates last_seen_at
-- when a new page view is inserted
-- ============================================================

CREATE OR REPLACE FUNCTION update_session_on_page_view()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE analytics_sessions
    SET
        page_view_count = page_view_count + 1,
        last_seen_at = NEW.created_at,
        updated_at = now()
    WHERE id = NEW.session_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-update session when page view is inserted
CREATE TRIGGER trigger_update_session_on_page_view
AFTER INSERT ON analytics_page_views
FOR EACH ROW
EXECUTE FUNCTION update_session_on_page_view();

COMMENT ON FUNCTION update_session_on_page_view IS 'Trigger function to automatically update session stats when page views are inserted';

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Disable RLS for analytics tables since access control
-- is handled at the API layer via NextAuth
-- ============================================================

ALTER TABLE analytics_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_page_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_rate_limits DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these queries after migration to verify setup:
-- ============================================================

-- Check table creation
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name LIKE 'analytics_%';

-- Check indexes
-- SELECT tablename, indexname FROM pg_indexes
-- WHERE tablename LIKE 'analytics_%';

-- Test insert (should work)
-- INSERT INTO analytics_sessions (session_hash, ip_address, user_agent, device_type, browser, os)
-- VALUES ('test-hash-123', '127.0.0.1', 'Mozilla/5.0', 'desktop', 'Chrome', 'Windows');

-- Test page view insert (should auto-increment session counter)
-- INSERT INTO analytics_page_views (session_id, path, device_type, country)
-- SELECT id, '/test-page', 'desktop', 'US' FROM analytics_sessions WHERE session_hash = 'test-hash-123';

-- Verify session was updated
-- SELECT session_hash, page_view_count, last_seen_at FROM analytics_sessions WHERE session_hash = 'test-hash-123';

-- Cleanup test data
-- DELETE FROM analytics_sessions WHERE session_hash = 'test-hash-123';

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify tables with: \dt analytics_*
-- 3. Check indexes with: \di analytics_*
-- 4. Test with sample inserts above
-- ============================================================
