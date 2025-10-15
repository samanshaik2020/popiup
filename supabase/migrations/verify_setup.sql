-- Verification script to check if all migrations are applied correctly
-- Run this in Supabase SQL Editor to verify your setup

-- 1. Check if all required tables exist
SELECT 
    'Tables Check' AS check_type,
    CASE 
        WHEN COUNT(*) = 3 THEN '✓ PASS - All tables exist'
        ELSE '✗ FAIL - Missing tables: ' || (3 - COUNT(*))::text
    END AS status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('popups', 'short_links', 'analytics');

-- 2. Check if clicks column exists in short_links
SELECT 
    'Clicks Column Check' AS check_type,
    CASE 
        WHEN COUNT(*) = 1 THEN '✓ PASS - Clicks column exists'
        ELSE '✗ FAIL - Clicks column missing'
    END AS status
FROM information_schema.columns 
WHERE table_name = 'short_links' AND column_name = 'clicks';

-- 3. Check if analytics table has correct columns
SELECT 
    'Analytics Columns Check' AS check_type,
    CASE 
        WHEN COUNT(*) >= 11 THEN '✓ PASS - Analytics table properly configured'
        ELSE '✗ FAIL - Missing columns in analytics table'
    END AS status
FROM information_schema.columns 
WHERE table_name = 'analytics';

-- 4. Check if trigger exists for auto-syncing clicks
SELECT 
    'Trigger Check' AS check_type,
    CASE 
        WHEN COUNT(*) >= 1 THEN '✓ PASS - Click sync trigger exists'
        ELSE '✗ FAIL - Click sync trigger missing (run migration 03)'
    END AS status
FROM pg_trigger 
WHERE tgname = 'sync_clicks_on_analytics_insert';

-- 5. Check if view exists
SELECT 
    'View Check' AS check_type,
    CASE 
        WHEN COUNT(*) = 1 THEN '✓ PASS - Analytics summary view exists'
        ELSE '✗ FAIL - Analytics summary view missing (run migration 03)'
    END AS status
FROM information_schema.views 
WHERE table_name = 'link_analytics_summary';

-- 6. Check RLS policies
SELECT 
    'RLS Policies Check' AS check_type,
    COUNT(*)::text || ' policies found' AS status
FROM pg_policies 
WHERE tablename IN ('popups', 'short_links', 'analytics');

-- 7. Check storage buckets
SELECT 
    'Storage Buckets Check' AS check_type,
    CASE 
        WHEN COUNT(*) >= 2 THEN '✓ PASS - Storage buckets configured'
        ELSE '✗ FAIL - Missing storage buckets'
    END AS status
FROM storage.buckets 
WHERE id IN ('images', 'popup');

-- 8. List all indexes for performance
SELECT 
    'Indexes Check' AS check_type,
    COUNT(*)::text || ' indexes found' AS status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('popups', 'short_links', 'analytics');

-- Detailed breakdown of what exists
SELECT '--- DETAILED BREAKDOWN ---' AS info;

-- List all tables with row counts
SELECT 
    'Table: ' || table_name AS info,
    (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name)::text || ' columns' AS details
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('popups', 'short_links', 'analytics')
ORDER BY table_name;

-- List all RLS policies
SELECT 
    'Policy: ' || policyname AS info,
    'on ' || tablename AS details
FROM pg_policies 
WHERE tablename IN ('popups', 'short_links', 'analytics')
ORDER BY tablename, policyname;

-- List all triggers
SELECT 
    'Trigger: ' || trigger_name AS info,
    'on ' || event_object_table AS details
FROM information_schema.triggers 
WHERE event_object_table IN ('popups', 'short_links', 'analytics')
ORDER BY event_object_table, trigger_name;

-- Show sample data counts (if any)
SELECT '--- DATA COUNTS ---' AS info;

SELECT 
    'short_links' AS table_name,
    COUNT(*)::text AS row_count
FROM short_links
UNION ALL
SELECT 
    'popups' AS table_name,
    COUNT(*)::text AS row_count
FROM popups
UNION ALL
SELECT 
    'analytics' AS table_name,
    COUNT(*)::text AS row_count
FROM analytics;
