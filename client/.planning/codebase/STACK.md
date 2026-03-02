# Technology Stack

**Analysis Date:** 2026-03-02

## Languages

**Primary:**
- TypeScript 5.5.3 - Main application logic and server components
- JavaScript - Configuration files and scripts

**Secondary:**
- SQL - Supabase database queries via JavaScript client
- CSS - Tailwind CSS for styling

## Runtime

**Environment:**
- Node.js (via Next.js 14.2.5 runtime)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 14.2.5 - React-based full-stack web framework
  - App Router (file-based routing in `/src/app`)
  - Server Components and Actions (with 2mb body size limit)
  - Built-in API routes at `/src/app/api`

**UI:**
- React 18.3.1 - Component library and state management
- React DOM 18.3.1 - DOM rendering
- React Hook Form 7.66.0 - Form handling and validation
- Tailwind CSS 3.4.4 - Utility-first CSS framework
- Lucide React 0.553.0 - Icon library
- Class Variance Authority 0.7.1 - Component styling utilities
- Tailwind Merge 3.4.0 - Intelligent class merging for Tailwind
- @tailwindcss/typography 0.5.19 - Typography plugin for markdown content

**Testing:**
- Playwright 1.40.1 - E2E testing framework
  - Config: `playwright.config.ts`
  - Projects: Chromium, Firefox
  - Test location: `./e2e/` directory

**Build/Dev:**
- PostCSS 8.4.38 - CSS processing pipeline
- Autoprefixer 10.4.22 - Browser vendor prefixing
- TypeScript 5.5.3 - Type checking (strict mode enabled)

## Key Dependencies

**Critical:**
- @supabase/ssr 0.7.0 - Server-side Supabase authentication with cookie management
- @supabase/supabase-js 2.81.1 - Supabase JavaScript client SDK
- @hookform/resolvers 5.2.2 - Form validation integrations (zod resolver)

**Infrastructure:**
- zod 3.23.8 - Runtime type validation schema library
- date-fns 4.1.0 - Date manipulation utility
- react-markdown 10.1.0 - Markdown rendering in React components
- remark-gfm 4.0.1 - GitHub-flavored markdown support
- robots-parser 3.0.1 - robots.txt parser for scraper compliance
- clsx 2.1.1 - Class name utility

**Development:**
- tsx 4.21.0 - TypeScript executor for scripts
- ts-node 10.9.2 - TypeScript Node.js runtime
- eslint 8.57.0 - Linting (extends Next.js config)
- eslint-config-next 14.2.5 - Next.js ESLint configuration

## Configuration

**Environment:**
- Environment variables loaded from `.env.local` (not committed)
- Required vars documented in code:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase instance URL (public)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
  - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role (secret, server-only)
  - `NEXT_PUBLIC_APP_URL` - Application base URL (defaults to http://localhost:3000)
  - `SCRAPER_API_KEY` - Custom API key for scraper endpoints
  - `SCRAPER_DEV_MODE` - Development mode flag for robots.txt checking
  - `ADMIN_API_KEY` - Admin operations authentication
  - `CRON_SECRET` - Authorization for Vercel cron jobs
  - `SUPABASE_URL` - Alternative Supabase URL environment variable
  - `SERVICE_ROLE` - Alternative service role key variable name

**Build:**
- `tsconfig.json` - TypeScript compiler options with path aliases (`@/*` → `./src/*`)
- `next.config.js` - Next.js configuration:
  - Remote image patterns: `*.supabase.co` domains
  - Server Actions body size limit: 2mb
  - Ignores TypeScript build errors
- `tailwind.config.ts` - Tailwind CSS theme customization
- `.eslintrc` - Extends `eslint-config-next` (14.2.5)
- `vercel.json` - Vercel deployment and cron configuration

## Platform Requirements

**Development:**
- Node.js (version not explicitly specified, inferred from Next.js 14.2.5 requirements - Node 18+)
- npm 9+
- Local Supabase connection or cloud instance

**Production:**
- Deployment target: Vercel (configured in `vercel.json`)
- Cron jobs on Vercel:
  - `/api/cron/daily-scrape` - Daily at 2 AM UTC
  - `/api/cron/paper-publish` - Hourly between 7 AM-6 PM UTC
- Docker/Container support: Not indicated in stack

---

*Stack analysis: 2026-03-02*
