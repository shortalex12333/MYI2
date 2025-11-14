# Supabase Setup Instructions

## 1. Run the Migration

Go to your Supabase dashboard:
1. Navigate to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)

## 2. Verify Tables Created

Go to **Table Editor** and verify these tables exist:
- profiles
- posts
- comments
- reactions
- categories
- companies
- locations
- tags
- post_tags
- faqs

## 3. Verify RLS Policies

Go to **Authentication > Policies** and verify policies exist for all tables.

## 4. Test Authentication

1. Go to **Authentication > Users**
2. You can manually create a test user or use the signup flow on your site
3. After signup, verify the profile is created in the `profiles` table

## 5. Verify Seed Data

Go to **Table Editor** and check:
- **categories** table should have 6 categories (Claims, Policies, etc.)
- **companies** table should have 5 companies
- **locations** table should have 10 locations
- **faqs** table should have 4 FAQs

## 6. Environment Variables

Ensure your `.env.local` file has:
```
NEXT_PUBLIC_SUPABASE_URL=https://gelaikvydtlktpsryucc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbGFpa3Z5ZHRsa3Rwc3J5dWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTA5NzQsImV4cCI6MjA3ODU2Njk3NH0.HgchaODdllquzPHW5E5W7fYh0dGhrYuFdpzUEBLT354
```

## 7. Test Functionality

After running the migration, test these user flows:

### Anonymous User
- ✅ Browse posts at `/posts`
- ✅ View individual post at `/posts/[id]`
- ✅ View categories at `/categories`
- ✅ View companies at `/companies`
- ✅ View FAQ at `/faq`

### Authenticated User
1. Sign up at `/signup`
2. Verify profile created in `profiles` table
3. Create a post at `/posts/new`
4. Edit your post
5. Add a comment on a post
6. React to a post (like/helpful/insightful)
7. Delete your post

## 8. Troubleshooting

### Profile Not Created on Signup
- Check the `profiles` table RLS policies
- Verify the signup API route is inserting correctly
- Check browser console for errors

### Can't See Posts
- Verify posts have `status = 'published'`
- Check RLS policies on `posts` table

### View Count Not Incrementing
- Verify the `increment_post_views` function exists
- Check function permissions (SECURITY DEFINER)

## Database Schema Overview

### User Journey Tables
- `auth.users` (managed by Supabase Auth)
- `profiles` (user profile data)
- `posts` (user-created content)
- `comments` (threaded comments on posts)
- `reactions` (likes/helpful/insightful on posts & comments)

### Reference Data Tables
- `categories` (post categories)
- `companies` (insurance providers)
- `locations` (geographic locations)
- `tags` (post tags)
- `post_tags` (many-to-many junction)
- `faqs` (frequently asked questions)

### Key Features Enabled
- ✅ Row Level Security (RLS) on all tables
- ✅ Auto-updating `updated_at` timestamps
- ✅ Post view counter function
- ✅ Indexes for query performance
- ✅ Referential integrity with foreign keys
- ✅ Seed data for MVP launch
