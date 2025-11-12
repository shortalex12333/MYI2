# Architecture Overview

This document describes the high-level architecture of the MyYachtsInsurance platform.

## Components

### 1. Frontend (Next.js on Vercel)
- Uses the App Router of Next.js for pages and dynamic routing.
- Implements pages:
  - Home/feed
  - Post detail
  - Category/Tag/Location feeds
  - Company profiles
  - FAQ
  - Search
  - Contact
  - Terms & Privacy
  - Signup/Login and onboarding
  - User profile & settings
  - New post
  - Moderator and admin dashboards
- Incorporates authentication guards to restrict access to certain pages based on user roles (guest, user, moderator, admin).
- Uses Tailwind CSS and shadcn/ui for UI components.
- Markdown editor for composing posts and comments.

### 2. Backend & Database (Supabase)
- Uses Supabase Postgres for relational data storage.
- Schema defined in `myyachtsinsurance_blueprint.xlsx` and `docs/data_schema.md`.
- Implements Row Level Security (RLS) to enforce permissions based on roles.
- Supabase Auth for handling sign-up, login and session management.
- Supabase Storage for user-uploaded media (images, documents).
- Utilises PostgreSQL full-text search for search features; optional PGVector for embeddings.

### 3. API Layer
- Serves as a thin layer over Supabase functions to enforce business rules and rate limits.
- Provides endpoints for authentication, profiles, posts, comments, reactions, companies, categories, tags, locations, FAQs and search.
- Implements validation, error handling and logging.
- Supports JSON responses.

### 4. Analytics & Events
- Uses PostHog or Vercel analytics for tracking events such as sign-ups, post creation, comments and reactions.
- Event schema defined in `myyachtsinsurance_blueprint.xlsx` (Events sheet) and summarised in docs/events.md.
- Data aggregated for insights and product improvements.

### 5. Moderation & Safety
- Moderation workflow with multiple stages: reported → triaged → action → appeal.
- Moderators have dashboard to review flagged content, take actions (remove, warn, ban) and log decisions.
- Rate limiting rules prevent spam and abuse (see `docs/permissions.md`).
- Content sanitized and validated to prevent injection attacks.

## Deployment

- The project is deployed to Vercel, connecting to Supabase via environment variables.
- CI/CD pipeline can run linting, tests and type checks.
- Use environment variables for Supabase URL, API key, JWT secret and other secrets.
- Automated migrations apply database schema updates.

## Extensibility

- Additional features (e.g., messaging, marketplace, analytics dashboards) can be added by extending the schema and API.
- Embeddings & AI features can be layered to summarise posts, extract metadata and provide personalised recommendations.
