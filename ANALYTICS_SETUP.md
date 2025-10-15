# Analytics Setup Guide

## 🎯 Overview

Your Popiup application now has a complete click analytics system that tracks every link click and displays statistics on your dashboard.

## 📋 What Was Fixed

### 1. **Database Schema Issues**
- ✅ Added `clicks` column to `short_links` table (was missing)
- ✅ Created automatic sync trigger from analytics to clicks
- ✅ Created analytics summary view for reporting

### 2. **Application Code**
- ✅ Updated Dashboard to fetch real analytics data
- ✅ Updated RedirectPage to track clicks in analytics table
- ✅ Added utility functions for click statistics

### 3. **New Migration Files**
- ✅ `01_initial_schema.sql` - Updated with clicks column
- ✅ `03_add_clicks_tracking.sql` - New migration for click tracking
- ✅ `verify_setup.sql` - Verification script

## 🚀 Quick Start

### Step 1: Apply Database Migrations

Choose one of these methods:

#### Method A: Supabase Dashboard (Easiest)

1. Go to: https://supabase.com/dashboard/project/rpwcxkbubficduwofqhw/sql
2. Click **New Query**
3. Copy contents of `supabase/migrations/03_add_clicks_tracking.sql`
4. Click **Run**

#### Method B: Supabase CLI

```bash
cd popiup
supabase link --project-ref rpwcxkbubficduwofqhw
supabase db push
```

### Step 2: Verify Setup

1. In Supabase SQL Editor, run: `supabase/migrations/verify_setup.sql`
2. Check that all checks show ✓ PASS

### Step 3: Test the System

1. **Create a link:**
   - Login to your dashboard
   - Click "Create New Link"
   - Fill in the form and save

2. **Generate clicks:**
   - Visit your short link: `http://localhost:5173/r/your-slug`
   - The click should be tracked automatically

3. **View analytics:**
   - Return to dashboard
   - You should see:
     - Total Clicks: 1 (or more)
     - Avg. Clicks: Updated
     - Individual link click counts

## 📊 How It Works

### Architecture

```
User Clicks Link
       ↓
RedirectPage.tsx
       ↓
trackEvent() → Analytics Table
       ↓
Database Trigger → Updates clicks column
       ↓
Dashboard fetches → Displays stats
```

### Database Flow

1. **Click Event Recorded:**
   ```sql
   INSERT INTO analytics (short_link_id, event_type, referrer, browser)
   VALUES ('link-uuid', 'click', 'google.com', 'Chrome');
   ```

2. **Trigger Auto-Updates:**
   ```sql
   -- Automatically runs after insert
   UPDATE short_links 
   SET clicks = (SELECT COUNT(*) FROM analytics WHERE ...)
   WHERE id = 'link-uuid';
   ```

3. **Dashboard Queries:**
   ```typescript
   // Fetches aggregated stats
   const stats = await getClickStats(userId);
   // Returns: { totalClicks: 10, avgClicksPerLink: 2.5, clicksByLink: {...} }
   ```

## 🔍 Troubleshooting

### Issue: Dashboard shows 0 clicks

**Check 1:** Verify analytics table has data
```sql
SELECT * FROM analytics WHERE event_type = 'click';
```

**Check 2:** Verify trigger is working
```sql
SELECT * FROM pg_trigger WHERE tgname = 'sync_clicks_on_analytics_insert';
```

**Check 3:** Manually sync clicks
```sql
UPDATE short_links 
SET clicks = (
    SELECT COUNT(*) FROM analytics 
    WHERE short_link_id = short_links.id 
    AND event_type = 'click'
);
```

### Issue: "Column clicks does not exist"

**Solution:** Run migration 03
```bash
# In Supabase SQL Editor, run:
supabase/migrations/03_add_clicks_tracking.sql
```

### Issue: Analytics not inserting

**Check:** RLS policy allows public inserts
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'analytics' 
AND policyname = 'Public can insert analytics';
```

**Fix:** Re-run the policy creation from `01_initial_schema.sql`

## 📈 Analytics Features

### Dashboard Metrics

1. **Total Clicks**
   - All-time clicks across all links
   - Sourced from analytics table

2. **Avg. Clicks**
   - Average clicks per link
   - Calculated: total_clicks / number_of_links

3. **Per-Link Clicks**
   - Individual click count for each link
   - Displayed in the links table

### Analytics Data Collected

- ✅ Short link ID
- ✅ Popup ID (if applicable)
- ✅ Event type (click, view, conversion)
- ✅ Referrer URL
- ✅ Browser/User agent
- ✅ Timestamp
- ⏳ Device (optional)
- ⏳ OS (optional)
- ⏳ Location (optional)

## 🔐 Security

### Row Level Security (RLS)

- ✅ Users can only view their own analytics
- ✅ Public can insert analytics (for tracking)
- ✅ Users can only modify their own links
- ✅ Public can view links by slug (for redirects)

### Privacy

- No personally identifiable information (PII) is stored
- IP addresses are optional and can be anonymized
- Visitor IDs are anonymous identifiers

## 📝 Database Schema

### Analytics Table

```sql
CREATE TABLE analytics (
    id UUID PRIMARY KEY,
    short_link_id UUID NOT NULL,  -- FK to short_links
    popup_id UUID,                 -- FK to popups
    visitor_id VARCHAR(255),       -- Anonymous visitor ID
    referrer TEXT,                 -- Where they came from
    browser VARCHAR(100),          -- User agent
    device VARCHAR(100),           -- Device type
    os VARCHAR(100),               -- Operating system
    country VARCHAR(100),          -- Country code
    city VARCHAR(100),             -- City name
    ip_address VARCHAR(50),        -- IP (optional)
    event_type VARCHAR(50),        -- 'click', 'view', etc.
    created_at TIMESTAMP           -- When it happened
);
```

### Short Links Table

```sql
CREATE TABLE short_links (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    popup_id UUID,
    slug VARCHAR(50) UNIQUE,
    destination_url TEXT,
    title VARCHAR(255),
    description TEXT,
    active BOOLEAN,
    clicks INTEGER DEFAULT 0,      -- ← Cached count
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🎨 Customization

### Adding More Event Types

Track additional events like popup views or conversions:

```typescript
// Track popup view
await trackEvent({
  short_link_id: linkId,
  popup_id: popupId,
  event_type: 'popup_view'
});

// Track conversion
await trackEvent({
  short_link_id: linkId,
  popup_id: popupId,
  event_type: 'conversion'
});
```

### Custom Analytics Queries

Use the `link_analytics_summary` view:

```sql
SELECT * FROM link_analytics_summary
WHERE user_id = 'your-user-id'
ORDER BY total_clicks DESC;
```

## 📚 Files Modified

### New Files
- `supabase/migrations/03_add_clicks_tracking.sql`
- `supabase/migrations/verify_setup.sql`
- `supabase/migrations/README.md`
- `ANALYTICS_SETUP.md` (this file)

### Modified Files
- `supabase/migrations/01_initial_schema.sql` - Added clicks column
- `src/lib/supabase.ts` - Added getClickStats(), getShortLinkClicks()
- `src/pages/Dashboard.tsx` - Integrated real analytics
- `src/pages/RedirectPage.tsx` - Track clicks in analytics table

## ✅ Verification Checklist

- [ ] Run `03_add_clicks_tracking.sql` migration
- [ ] Run `verify_setup.sql` - all checks pass
- [ ] Create a test link in dashboard
- [ ] Visit the short link URL
- [ ] Check dashboard shows click count
- [ ] Verify analytics table has records
- [ ] Check clicks column is synced

## 🆘 Need Help?

If you encounter issues:

1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Run verification script
4. Review RLS policies
5. Check authentication status

## 🎉 Success Criteria

Your analytics are working when:

✅ Dashboard displays click counts
✅ Clicking a link increments the counter
✅ Analytics table receives new records
✅ Clicks column auto-updates via trigger
✅ No errors in browser console
