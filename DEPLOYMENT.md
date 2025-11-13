# MyYachtsInsurance - Deployment Guide

This guide provides step-by-step instructions for deploying the MyYachtsInsurance platform to production.

## Prerequisites

Before deploying, ensure you have:
- A GitHub account
- A Vercel account (free tier works)
- A Supabase account (free tier works)
- Your codebase ready in a Git repository

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization (or create one)
4. Fill in project details:
   - **Name:** MyYachtsInsurance
   - **Database Password:** Generate a strong password and save it
   - **Region:** Choose closest to your users
5. Click "Create new project"

### 1.2 Run Database Migrations

1. Once your project is created, go to the SQL Editor
2. Open the file `supabase_schema.sql` from the repository root
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click "Run" to execute the migration
6. Verify that all tables, indexes, and policies were created:
   - Go to Table Editor to see your tables
   - Check that seed data was inserted (categories, tags, locations, companies, FAQs)

### 1.3 Get Supabase Credentials

1. Go to Project Settings > API
2. Copy the following values (you'll need them for Vercel):
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbGc...`
   - **service_role key:** `eyJhbGc...` (keep this secret!)

### 1.4 Configure Auth (Optional)

1. Go to Authentication > Providers
2. Enable email authentication (enabled by default)
3. Optional: Enable OAuth providers (Google, GitHub, etc.)
4. Configure email templates under Authentication > Email Templates

### 1.5 Configure Storage (Optional)

1. Go to Storage
2. Create a new bucket named `avatars` for user profile pictures
3. Set the bucket to public if you want avatars to be publicly accessible
4. Create a bucket named `attachments` for post media

## Step 2: Deploy to Vercel

### 2.1 Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." > "Project"
3. Import your Git repository:
   - If using GitHub, authorize Vercel to access your repos
   - Select the `MYI2` repository
4. Configure project settings:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `client`
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `.next` (auto-filled)

### 2.2 Configure Environment Variables

In the "Environment Variables" section, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Important:** Replace the placeholder values with your actual Supabase credentials from Step 1.3.

### 2.3 Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. Once deployed, Vercel will provide you with a URL: `https://your-app.vercel.app`
4. Click the URL to visit your live site

### 2.4 Update App URL

After your first deployment:
1. Copy your production URL from Vercel
2. Go back to Vercel project settings
3. Update the `NEXT_PUBLIC_APP_URL` environment variable with your actual URL
4. Redeploy (or it will auto-deploy on next push)

## Step 3: Configure Custom Domain (Optional)

### 3.1 Add Domain in Vercel

1. Go to your Vercel project
2. Click "Settings" > "Domains"
3. Click "Add"
4. Enter your domain (e.g., `myyachtsinsurance.com`)
5. Follow the instructions to configure DNS

### 3.2 Update DNS Records

Add the following records at your domain registrar:

**For root domain:**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`

**For www subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

### 3.3 Update Environment Variables

1. Go back to Vercel project settings
2. Update `NEXT_PUBLIC_APP_URL` to your custom domain
3. Redeploy if necessary

## Step 4: Configure Supabase for Production

### 4.1 Update Auth URLs

1. Go to Supabase project settings
2. Navigate to Authentication > URL Configuration
3. Update the following:
   - **Site URL:** `https://your-domain.com`
   - **Redirect URLs:** Add `https://your-domain.com/auth/callback`

### 4.2 Configure Email Settings (Optional)

1. Go to Authentication > Email Templates
2. Customize confirmation and password reset emails
3. Configure custom SMTP (recommended for production):
   - Go to Settings > Auth > SMTP Settings
   - Enter your SMTP credentials

### 4.3 Review RLS Policies

1. Go to Authentication > Policies
2. Review all Row Level Security policies
3. Ensure they match the documented permissions in `docs/permissions.md`

## Step 5: Post-Deployment Verification

### 5.1 Test Core Functionality

Visit your deployed site and test:

✅ **Homepage loads correctly**
- All sections render
- Navigation works
- Links are functional

✅ **Authentication**
- Sign up with a new account
- Verify email confirmation (if enabled)
- Log in with credentials
- Log out

✅ **Onboarding**
- Complete profile setup
- Add vessel information

✅ **Posts**
- Create a new post
- View post detail page
- Edit your post
- Delete your post

✅ **Comments**
- Add a comment to a post
- Reply to a comment
- View threaded comments

✅ **Reactions**
- Like/unlike a post
- Like/unlike a comment

✅ **Navigation**
- Browse by category
- View FAQ page
- Check static pages (Terms, Privacy, Contact)

### 5.2 Check Database

1. Go to Supabase Table Editor
2. Verify that data is being created:
   - New profiles in `profiles` table
   - New posts in `posts` table
   - New comments in `comments` table

### 5.3 Monitor Logs

**Vercel Logs:**
1. Go to your Vercel project
2. Click "Deployments" > Latest deployment
3. Click "Functions" to view logs
4. Check for any errors

**Supabase Logs:**
1. Go to Supabase project
2. Click "Logs"
3. Review API and database logs for errors

## Step 6: Set Up Continuous Deployment

Vercel automatically deploys on git push. To configure:

### 6.1 Production Branch

1. Go to Vercel project settings
2. Click "Git"
3. Set production branch (e.g., `main` or `master`)
4. Every push to this branch will deploy to production

### 6.2 Preview Deployments

- Every pull request gets its own preview URL
- Test features before merging to production
- Share preview URLs with team members

## Step 7: Performance and Monitoring

### 7.1 Enable Vercel Analytics (Optional)

1. Go to your Vercel project
2. Click "Analytics"
3. Enable Web Analytics
4. View performance metrics

### 7.2 Set Up Error Monitoring (Optional)

Consider integrating:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **PostHog** for product analytics

### 7.3 Database Performance

1. Monitor query performance in Supabase
2. Review slow query log
3. Add indexes if needed
4. Set up database backups

## Step 8: Security Checklist

Before going live, verify:

- [ ] All environment variables are set correctly
- [ ] Service role key is kept secret (not exposed to client)
- [ ] RLS policies are enabled on all tables
- [ ] Auth redirect URLs are configured
- [ ] CORS is properly configured
- [ ] Rate limiting is in place (Supabase default)
- [ ] Email confirmations are enabled (if desired)
- [ ] Custom domain has SSL certificate (automatic with Vercel)

## Step 9: Launch Checklist

- [ ] Database migrations completed
- [ ] Seed data loaded
- [ ] Environment variables configured
- [ ] Application deployed successfully
- [ ] Custom domain configured (if applicable)
- [ ] Auth flows tested
- [ ] Core features verified
- [ ] Error monitoring set up
- [ ] Backup strategy in place
- [ ] Team members have access

## Troubleshooting

### Build Fails on Vercel

**Problem:** Build fails with module not found errors

**Solution:**
1. Ensure all dependencies are in `package.json`
2. Run `npm install` locally to verify
3. Check that `client` is set as root directory in Vercel

### Database Connection Errors

**Problem:** Can't connect to Supabase

**Solution:**
1. Verify environment variables are correct
2. Check that Supabase project is active
3. Ensure API keys are copied correctly (no extra spaces)

### Authentication Not Working

**Problem:** Users can't sign up or log in

**Solution:**
1. Check Supabase Auth settings
2. Verify redirect URLs include your production domain
3. Check browser console for errors
4. Review Supabase auth logs

### 404 on Dynamic Routes

**Problem:** Post detail pages return 404

**Solution:**
1. Ensure `[id]` folder structure is correct
2. Check that data is being fetched correctly
3. Verify Supabase RLS policies allow reading posts

## Maintenance

### Regular Tasks

**Weekly:**
- Review error logs
- Check database size and performance
- Monitor API usage

**Monthly:**
- Update dependencies (`npm outdated`)
- Review and optimize slow queries
- Backup database (Supabase automatic)
- Review security policies

**As Needed:**
- Scale database (Supabase dashboard)
- Upgrade Vercel plan if hitting limits
- Review and respond to user feedback

## Scaling Considerations

As your platform grows:

1. **Database:** Upgrade Supabase plan for more connections
2. **CDN:** Vercel automatically scales
3. **Media Storage:** Consider CDN for images (Cloudinary, Imgix)
4. **Search:** Implement Algolia for better search performance
5. **Caching:** Add Redis for session caching
6. **Email:** Use dedicated email service (SendGrid, Postmark)

## Support

If you encounter issues:
- Check Vercel deployment logs
- Review Supabase logs
- Consult Next.js documentation
- Reach out to the team

## Congratulations!

Your MyYachtsInsurance platform is now live! 🎉

Monitor your application, gather user feedback, and iterate on features to build the best yacht insurance community platform.
