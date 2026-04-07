# Supabase Setup Guide

This guide will help you set up your Supabase database for your dashboard application.

## Prerequisites
- A Supabase account (sign up at https://supabase.com)
- Your Supabase API URL and public key (already configured in index.html)

## Step 1: Go to Supabase Dashboard

1. Visit https://app.supabase.com
2. Sign in with your account
3. Open your project

## Step 2: Create Tables

Go to the **SQL Editor** and run these queries to create all necessary tables:

### Table 1: todos
```sql
CREATE TABLE todos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  week_key TEXT NOT NULL,
  day_index INTEGER NOT NULL,
  text TEXT NOT NULL,
  note TEXT,
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table 2: budget
```sql
CREATE TABLE budget (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  month_key TEXT NOT NULL UNIQUE,
  income NUMERIC DEFAULT 0,
  expenses JSONB DEFAULT '[]'::jsonb,
  savings NUMERIC DEFAULT 0,
  extra JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table 3: habits
```sql
CREATE TABLE habits (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  week_key TEXT NOT NULL,
  name TEXT NOT NULL,
  days BOOLEAN[] DEFAULT ARRAY[FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table 4: diary_entries
```sql
CREATE TABLE diary_entries (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  date TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table 5: calendar_events
```sql
CREATE TABLE calendar_events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  event_date TEXT NOT NULL,
  title TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Step 3: Set Row Level Security (RLS)

For development, you can disable RLS to allow full access. In production, you should set up proper authentication.

1. Go to **Authentication** > **Policies**
2. For each table:
   - Click on the table name
   - Toggle off "Enable RLS" (for now)

**For Production:** Implement proper authentication with user IDs.

## Step 4: Verify Your API Keys

Your API keys are already in `index.html`:
- **Project URL**: `https://vicxysufdvslqkvoyaky.supabase.co`
- **Public Key**: `sb_publishable_cAf3io_Yx4ltr1bIRyNu3A_U71LlNzM`

If you need to find them again:
1. Go to **Settings** > **API**
2. Copy the **Project URL** and **anon public key**

## Step 5: Test Your Connection

1. Open your dashboard in a browser
2. Open the browser console (F12)
3. You should see messages like:
   - "Loading data from Supabase..."
   - "Todos loaded: ..."
   - "Budget loaded: ..."
   - Etc.

If you see errors, check:
- Your Supabase project is active
- All tables are created
- RLS is disabled (or properly configured)

## Step 6: Start Using Your Dashboard

Your dashboard is now connected to Supabase! All data will be:
- **Saved online** - Accessible from any device
- **Persistent** - Won't be deleted when you clear your browser cache
- **Synchronized** - Updates automatically

## Features Now Available

✅ **Weekly To-Do**: Tasks sync to the cloud  
✅ **Monthly Budget**: Income, expenses, and savings tracked online  
✅ **Habits**: Track daily habits with online persistence  
✅ **Diary**: Write and search entries backed by Supabase  
✅ **Calendar**: Events stored and retrieved from cloud  
✅ **Reminder Scheduler**: Time-based notifications managed locally in the installed app  

## Reminder Scheduler Notes

- Reminder schedules are stored locally on each device because notification delivery is device-specific.
- Use the new `Reminders` section in the app to create the times and messages you want.
- For best results, run the app from a local server, install it as a PWA, and allow notifications.
- Browsers can delay or skip alarms if the app is fully closed, so exact OS-level scheduling is outside the limits of a pure web app.

## Troubleshooting

### "Supabase is not defined"
- Make sure the script tag for Supabase is above your script.js in index.html

### "No data loading"
- Check that all tables are created
- Verify RLS is disabled
- Open browser console (F12) to see error messages

### "Data not saving"
- Check that your Supabase tables have the correct column names
- Verify your API key is correct
- Check browser console for specific error messages

## Security Notes

Your public key is visible in the client code. This is normal — Supabase Row Level Security (RLS) ensures each user can only access their own data, so the public key alone cannot compromise other users' data.

---

## Authentication Setup (Multi-User)

The app now has a login and signup screen. To make each user's data private and separate, run these SQL commands once in the **Supabase SQL Editor** (Dashboard → SQL Editor → New query).

### Step 1 — Add user_id to every table

```sql
ALTER TABLE todos            ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE budget           ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE habits           ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE diary_entries    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE calendar_events  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
```

### Step 2 — Claim your existing data

1. Open the app and sign up with your email to create your account.
2. In Supabase Dashboard go to **Authentication → Users** and copy your UUID.
3. Run this SQL, replacing `YOUR-USER-ID` with that UUID:

```sql
UPDATE todos            SET user_id = 'YOUR-USER-ID' WHERE user_id IS NULL;
UPDATE budget           SET user_id = 'YOUR-USER-ID' WHERE user_id IS NULL;
UPDATE habits           SET user_id = 'YOUR-USER-ID' WHERE user_id IS NULL;
UPDATE diary_entries    SET user_id = 'YOUR-USER-ID' WHERE user_id IS NULL;
UPDATE calendar_events  SET user_id = 'YOUR-USER-ID' WHERE user_id IS NULL;
```

### Step 3 — Enable Row Level Security

```sql
ALTER TABLE todos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget           ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits           ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events  ENABLE ROW LEVEL SECURITY;
```

### Step 4 — Create per-user access policies

```sql
CREATE POLICY "own todos"    ON todos            FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own budget"   ON budget           FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own habits"   ON habits           FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own diary"    ON diary_entries    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own calendar" ON calendar_events  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### Optional — Disable email confirmation (easier for testing)

In Supabase Dashboard → **Authentication → Providers → Email**, turn off "Confirm email" to skip the confirmation step during development.
