# MyYachtsInsurance Platform

Welcome to the **MyYachtsInsurance** project repository. This platform aims to be the first dedicated community and intelligence hub for yacht insurance. It combines forum, Q&A and social features with structured data capture and analytics to provide actionable insights for yacht owners, brokers, insurers and providers.

## Vision

- **Community-first**: Empower users to discuss yacht insurance topics, share experiences and ask questions.
- **Data-driven**: Collect structured data from user interactions to extract trends and develop proprietary insights.
- **Scalable foundation**: Build on open-source technology with clear schema, permissions and extensible APIs.

## Repository Structure

- `myyachtsinsurance_blueprint.xlsx`: Excel workbook containing detailed schema, routes, API specs, permissions, rate limits, events, notifications, SEO guidance and privacy map.
- `docs/`: Supplementary documentation (architecture, data schema, API spec, permissions).
- `README.md`: This file.

## Tech Stack

- **Frontend**: Next.js (React) hosted on Vercel.
- **Backend**: Supabase (Postgres) for database, auth and storage.
- **UI**: Tailwind CSS & shadcn/ui.
- **Auth**: Supabase Auth (email + OAuth).
- **Storage**: Supabase Storage for media assets.
- **Analytics**: Vercel analytics & PostHog (optional).
- **Deployment**: Vercel.

## Getting Started

1. **Initialize Supabase**:
   - Create a Supabase project.
   - Run SQL migrations generated from `myyachtsinsurance_blueprint.xlsx` (see docs/data_schema.md).
   - Configure RLS policies according to defined roles.

2. **Set up the Next.js app**:
   - Scaffold a new Next.js project.
   - Install dependencies for Supabase client, Tailwind and shadcn/ui.
   - Configure Supabase keys and environment variables.

3. **Implement core pages and components**:
   - Feed, Post detail, New post, Profile, Company page, Category/Tag/Location feeds, FAQ and Search.
   - Auth pages (Signup, Login, Onboarding).
   - Admin/moderator dashboard with moderation queue and taxonomy/company management.

4. **Implement API routes**:
   - Follow the specification in `docs/api_spec.md`.
   - Respect role-based permissions defined in `docs/permissions.md`.

5. **Seed initial data**:
   - Categories, tags, locations and companies.
   - FAQ entries.

6. **Launch**:
   - Monitor performance and user feedback.
   - Iterate on features, analytics and monetization strategies.

For detailed specifications and guidance, refer to the documents in the `docs/` folder and the blueprint workbook.
  
