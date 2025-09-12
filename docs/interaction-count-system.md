# Interaction Count System

This system manages realistic interaction counts for chatbots with automatic daily updates.

## Components

### 1. Database Migration
- Added `interaction_count` column to `catbots` table
- Added index for performance when sorting by popularity
- Default value: 0

### 2. Scripts (`src/scripts/`)

#### `interactionCounts.ts`
Two main functions:
- `assignInteractionCounts()` - Initial assignment based on factors like age, quality, personality
- `updateDailyInteractions()` - Daily increases to simulate ongoing activity

#### `seedData.ts` 
Generates 50 diverse test chatbots with realistic data

### 3. Edge Function (`supabase/functions/daily-interaction-update/`)
Automated daily update function that:
- Fetches all public catbots
- Calculates realistic daily increases
- Updates interaction counts in batches
- Logs progress and statistics

### 4. UI Updates
- **CatbotCard**: Shows interaction count with message icon
- **BrowseCharacters**: Added sorting by popularity, newest, oldest
- **MyCatbots**: Shows interaction counts for user's own bots
- **Character Queries**: Optimized database queries for different use cases

## Setup Instructions

### 1. Initial Data Population
Run in browser console:
```javascript
// First populate with seed data (if needed)
seedDatabase()

// Then assign interaction counts
assignInteractionCounts()
```

### 2. Enable Daily Updates
Set up a cron job to run the edge function daily at midnight:

```sql
-- Run this in Supabase SQL Editor
select cron.schedule(
  'daily-interaction-update',
  '0 0 * * *', -- every day at midnight UTC
  $$
  select
    net.http_post(
        url:='https://akbmcsjeityrozgsibng.supabase.co/functions/v1/daily-interaction-update',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrYm1jc2plaXR5cm96Z3NpYm5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTY1NDYsImV4cCI6MjA3Mjk5MjU0Nn0.p77zO8q7hlp8KyGdn0vb1VuvU9VQu_CZY9_4GphlXBA"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);
```

### 3. Manual Testing
Test the daily update function:
```javascript
// In browser console
updateDailyInteractions()
```

## Algorithm Details

### Initial Count Calculation
Based on multiple factors:
- **Age Factor**: Older bots get more interactions (up to 500)
- **Quality Factor**: Well-written profiles get bonuses (up to 200)
- **Personality Factor**: Popular personalities get bonuses (150 vs 75)
- **Random Variance**: ±200 for realism
- **Range Control**: Most bots end up in 100-800 range, max 3000

### Daily Increases
- **Base Increase**: 1% of current count
- **Random Bonus**: 0-9 additional interactions
- **Minimum**: At least 1 interaction per day
- **Maximum**: Capped at 50 per day

## Monitoring

### Check Cron Jobs
```sql
SELECT * FROM cron.job WHERE jobname = 'daily-interaction-update';
```

### View Logs
Check the edge function logs in Supabase dashboard for daily update results.

### Manual Statistics
```javascript
// Get current stats
supabase
  .from('catbots')
  .select('interaction_count')
  .then(({data}) => {
    const counts = data.map(d => d.interaction_count);
    console.log({
      total: counts.length,
      average: Math.round(counts.reduce((a,b) => a+b, 0) / counts.length),
      max: Math.max(...counts),
      min: Math.min(...counts)
    });
  });
```

## Future Enhancements

- Track actual user interactions and blend with simulated counts
- Add interaction trends (weekly/monthly views)
- Implement interaction type tracking (likes, shares, etc.)
- Add popularity categories/badges for highly interactive bots