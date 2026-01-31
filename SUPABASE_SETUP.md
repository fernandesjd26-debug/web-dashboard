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

⚠️ **Important**: Your public key is visible in the client code. This is safe because Supabase RLS (Row Level Security) protects your data. Before deploying to production, you should:

1. Implement user authentication
2. Enable RLS policies to protect data per-user
3. Consider using a backend API for sensitive operations

For now, with RLS disabled, anyone with your project URL can access the database, so don't put sensitive information in the tables.
