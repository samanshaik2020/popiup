# Database Migrations

This directory contains SQL migration files for the Popiup application.

## Migration Files

1. **01_initial_schema.sql** - Initial database schema including:
   - `popups` table for popup configurations
   - `short_links` table for URL shortening with clicks tracking
   - `analytics` table for detailed event tracking
   - Row Level Security (RLS) policies
   - Storage buckets for images

2. **02_storage_buckets.sql** - Additional storage bucket configurations

3. **03_add_clicks_tracking.sql** - Enhanced click tracking features:
   - Adds `clicks` column to `short_links` table
   - Creates automatic sync trigger from analytics to clicks
   - Creates `link_analytics_summary` view for reporting
   - Backfills existing analytics data

## How to Apply Migrations

### Option 1: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref rpwcxkbubficduwofqhw

# Apply all migrations
supabase db push
```

### Option 2: Using Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/rpwcxkbubficduwofqhw
2. Navigate to **SQL Editor**
3. Copy and paste the contents of each migration file in order:
   - First: `01_initial_schema.sql`
   - Second: `02_storage_buckets.sql`
   - Third: `03_add_clicks_tracking.sql`
4. Click **Run** for each file

### Option 3: Direct SQL Execution

```bash
# Using psql (if you have direct database access)
psql "postgresql://postgres:[YOUR-PASSWORD]@db.rpwcxkbubficduwofqhw.supabase.co:5432/postgres" \
  -f supabase/migrations/01_initial_schema.sql

psql "postgresql://postgres:[YOUR-PASSWORD]@db.rpwcxkbubficduwofqhw.supabase.co:5432/postgres" \
  -f supabase/migrations/02_storage_buckets.sql

psql "postgresql://postgres:[YOUR-PASSWORD]@db.rpwcxkbubficduwofqhw.supabase.co:5432/postgres" \
  -f supabase/migrations/03_add_clicks_tracking.sql
```

## Click Tracking System

The application uses a dual-tracking approach:

### 1. Analytics Table (Primary Source)
- Records every click event with detailed metadata
- Stores: referrer, browser, device, OS, location, etc.
- Event types: 'click', 'view', 'conversion'

### 2. Clicks Column (Cached Count)
- Stores aggregated click count in `short_links.clicks`
- Automatically synced via database trigger
- Provides fast access without counting analytics records

### How It Works

1. **When a user clicks a link:**
   - Frontend calls `trackEvent()` to insert into `analytics` table
   - Database trigger automatically updates `short_links.clicks`

2. **Dashboard displays:**
   - Total clicks from aggregated analytics data
   - Average clicks per link
   - Individual link clicks from the cached `clicks` column

3. **Benefits:**
   - Fast dashboard queries (uses cached clicks)
   - Detailed analytics available when needed
   - Automatic synchronization via triggers

## Verifying the Setup

After applying migrations, verify with these queries:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('popups', 'short_links', 'analytics');

-- Check if clicks column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'short_links' AND column_name = 'clicks';

-- Check if trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'sync_clicks_on_analytics_insert';

-- Check if view exists
SELECT table_name FROM information_schema.views 
WHERE table_name = 'link_analytics_summary';
```

## Troubleshooting

### Issue: Clicks not updating
- Check if the trigger is active: `SELECT * FROM pg_trigger WHERE tgname = 'sync_clicks_on_analytics_insert';`
- Manually sync: `UPDATE short_links SET clicks = (SELECT COUNT(*) FROM analytics WHERE short_link_id = short_links.id AND event_type = 'click');`

### Issue: Permission denied
- Ensure RLS policies are correctly set
- Check if user is authenticated: `SELECT auth.uid();`

### Issue: Analytics not inserting
- Verify the "Public can insert analytics" policy exists
- Check browser console for errors

## Database Schema Overview

```
┌─────────────┐
│   popups    │
│  (configs)  │
└──────┬──────┘
       │
       │ popup_id (FK)
       │
┌──────▼──────────┐         ┌─────────────┐
│  short_links    │◄────────│  analytics  │
│  (URLs + cache) │         │  (events)   │
└─────────────────┘         └─────────────┘
     clicks (cached)         event_type: 'click'
```

## Next Steps

After applying migrations:
1. Test creating a short link in the dashboard
2. Visit the short link URL
3. Verify the click is recorded in analytics
4. Check that the dashboard shows updated click counts
