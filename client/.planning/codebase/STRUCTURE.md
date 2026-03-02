# Codebase Structure

**Analysis Date:** 2026-03-02

## Directory Layout

```
myyachtsinsurance/ (client root)
├── public/                     # Static assets (favicon.svg, logo.svg, images)
├── src/
│   ├── app/                    # Next.js App Router - all routes and pages
│   │   ├── api/                # Backend API routes (v1 endpoints)
│   │   │   ├── v1/
│   │   │   │   ├── auth/       # Authentication endpoints
│   │   │   │   ├── profile/    # User profile management
│   │   │   │   ├── posts/      # Posts CRUD and detail route
│   │   │   │   ├── comments/   # Comments endpoints
│   │   │   │   ├── reactions/  # Post/comment reactions (like, dislike)
│   │   │   │   ├── categories/ # Category listing
│   │   │   │   ├── companies/  # Company database
│   │   │   │   ├── scraper/    # Web scraper for content ingestion
│   │   │   │   ├── vessels/    # Vessel/yacht data
│   │   │   │   └── bulk-import/# Batch import of data
│   │   │   ├── admin/          # Admin-only operations
│   │   │   ├── cron/           # Scheduled jobs
│   │   │   ├── health/         # Health check endpoint
│   │   │   └── test/           # Test utilities (admin user creation)
│   │   ├── learn/              # Educational guides (named-storm, agreed-value, etc.)
│   │   │   ├── named-storm-deductible/
│   │   │   ├── agreed-value-vs-acv/
│   │   │   └── navigation-limits-and-layup-warranty/
│   │   ├── tools/              # Interactive calculators
│   │   │   └── named-storm-deductible-calculator/
│   │   ├── posts/              # Community questions listing and detail
│   │   │   └── [id]/           # Dynamic post detail page
│   │   ├── category/           # Category-filtered posts
│   │   │   └── [slug]/         # Category detail page
│   │   ├── papers/             # Research papers and articles
│   │   │   └── [slug]/         # Paper detail page
│   │   ├── companies/          # Yacht insurance company directory
│   │   ├── experts/            # Expert profiles
│   │   ├── auth/               # Auth flow pages (login, signup, forgot-password)
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── forgot-password/
│   │   ├── yacht-insurance/    # Main insurance guide/hub
│   │   ├── yacht-insurance-broker/ # Broker-specific guide
│   │   ├── topics/             # Topic taxonomy and browsing
│   │   ├── insights/           # Data insights and trends
│   │   ├── knowledge/          # Knowledge base hub
│   │   ├── resources/          # Learning resources
│   │   ├── onboarding/         # User onboarding flow
│   │   ├── faq/                # Frequently asked questions
│   │   ├── glossary/           # Insurance terminology glossary
│   │   ├── methodology/        # Research methodology explanation
│   │   ├── editorial-policy/   # Content editorial guidelines
│   │   ├── about/              # About page
│   │   ├── providers/          # Service providers directory
│   │   ├── contact/            # Contact form
│   │   ├── privacy/            # Privacy policy
│   │   ├── terms/              # Terms of service
│   │   ├── layout.tsx          # Root layout with AuthProvider and Header
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global Tailwind styles and design tokens
│   │   └── sitemap.ts          # SEO sitemap generator
│   ├── components/             # React components
│   │   ├── ui/                 # Shadcn-style UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── avatar.tsx
│   │   │   └── badge.tsx
│   │   ├── layout/             # Layout wrapper components
│   │   │   └── Header.tsx      # Navigation header with auth UI
│   │   └── posts/              # Post-related components
│   │       ├── PostCard.tsx    # Post list item
│   │       ├── VotingButtons.tsx # Up/down vote component
│   │       └── CommentThread.tsx # Nested comment renderer
│   ├── contexts/               # React Context providers
│   │   └── AuthContext.tsx     # Authentication state + useAuth hook
│   ├── lib/                    # Utilities and backend services
│   │   ├── supabase/           # Supabase client initialization
│   │   │   ├── client.ts       # Browser client factory
│   │   │   ├── server.ts       # Server client factory with cookie handling
│   │   │   └── middleware.ts   # Request/response middleware
│   │   ├── utils.ts            # Shared helpers (formatDate, formatNumber, cn)
│   │   ├── companyContacts.ts  # Company contact data
│   │   ├── qa-generator/       # Q&A content generation pipeline
│   │   ├── papers-pipeline/    # Research papers processing
│   │   ├── topics-pipeline/    # Topic taxonomy generation
│   │   ├── case-study-generator/ # Case study content generation
│   │   ├── scraper/            # Web scraper utilities
│   │   └── pipeline-orchestrator/ # Coordinate content pipelines
│   ├── types/                  # TypeScript type definitions
│   │   └── database.types.ts   # Auto-generated Supabase schema (241 lines)
│   └── middleware.ts           # Next.js middleware for request interception
├── supabase/                   # Supabase local development
│   ├── migrations/             # Database schema migrations
│   └── .temp/                  # Temp files during dev
├── e2e/                        # Playwright end-to-end tests
├── .github/
│   └── workflows/              # CI/CD pipelines (GitHub Actions)
├── .next/                      # Next.js build output (generated)
├── .planning/                  # GSD planning documentation
│   └── codebase/               # This analysis directory
├── .eslintrc.json              # ESLint configuration
├── next.config.js              # Next.js configuration (image domains, server actions)
├── tsconfig.json               # TypeScript configuration (paths: @/* -> src/*)
├── tailwind.config.ts          # Tailwind design system setup
├── postcss.config.js           # PostCSS with Tailwind plugin
├── playwright.config.ts        # E2E test configuration
├── package.json                # Dependencies and scripts
└── vercel.json                 # Vercel deployment configuration

```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router directory - defines all routes, pages, and API endpoints
- Contains: Page.tsx files, layout.tsx, API route handlers (route.ts), dynamic routes ([param])
- Key files: `layout.tsx` (root layout), `page.tsx` (home), `sitemap.ts` (SEO)

**`src/app/api/v1/`:**
- Purpose: RESTful backend API endpoints for frontend consumption
- Contains: POST/GET/PUT/DELETE handlers for auth, data management, webhooks
- Key files: `/auth/{login,signup,signout}`, `/profile`, `/posts`, `/comments`, `/reactions`

**`src/app/learn/` and `/tools/`:**
- Purpose: Static educational content and interactive tools for yacht insurance learning
- Contains: Page components with hardcoded or CMS-fetched content (guides, calculators)
- Key files: Named storm deductible guide, ACV vs agreed value comparison, navigation limits guide

**`src/components/ui/`:**
- Purpose: Design system primitives - unstyled, reusable UI building blocks
- Contains: Button, Card, Input, Avatar, Badge, Label, Textarea components
- Pattern: Shadcn-style components composed with Tailwind classes

**`src/components/layout/`:**
- Purpose: Layout wrapper components that appear on multiple pages
- Contains: Header.tsx (navigation, auth UI, search)
- Used by: Root layout.tsx

**`src/components/posts/`:**
- Purpose: Post/comment-related components for the Q&A feature
- Contains: PostCard (list item), VotingButtons (voting UI), CommentThread (threaded comments)

**`src/contexts/`:**
- Purpose: React Context providers for global state management
- Contains: AuthContext.tsx - manages user session state and provides useAuth() hook
- Used by: All client components needing auth state

**`src/lib/supabase/`:**
- Purpose: Supabase client factories with proper cookie handling for SSR
- Contains: client.ts (browser), server.ts (server components/API), middleware.ts
- Pattern: Supabase SSR best practices using @supabase/ssr package

**`src/lib/` pipelines:**
- Purpose: Background processes for content generation and publishing
- Contains: qa-generator (Q&A generation), papers-pipeline (article processing), topics-pipeline (taxonomy)
- Triggered by: Admin endpoints, cron jobs, manual CLI invocations

**`src/types/`:**
- Purpose: TypeScript type definitions
- Contains: database.types.ts (auto-generated from Supabase schema)

**`e2e/`:**
- Purpose: Playwright end-to-end tests for user flow validation
- Contains: Test suites for auth, posts, comments, etc.

**`supabase/`:**
- Purpose: Local Supabase development setup and database migrations
- Contains: Migration files (SQL schema), .temp working directory

## Key File Locations

**Entry Points:**

- `src/app/layout.tsx`: Root layout; wraps entire app with AuthProvider and renders Header
- `src/app/page.tsx`: Home page with hero, guides grid, CTA sections
- `src/middleware.ts`: Next.js middleware; currently pass-through with no session management
- `src/app/sitemap.ts`: Dynamic sitemap generator for SEO

**Configuration:**

- `tsconfig.json`: Path alias `@/*` maps to `./src/*` for clean imports
- `next.config.js`: Image domain whitelist (supabase.co), server action body limit (2mb), TypeScript ignore build errors
- `tailwind.config.ts`: Design system tokens (colors, typography, border radius); extends with HSL variables
- `playwright.config.ts`: E2E test runner configuration
- `.env.local`: Contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (runtime)

**Core Logic:**

- `src/contexts/AuthContext.tsx`: Authentication state management; useAuth hook
- `src/app/api/v1/auth/login/route.ts`: Email/password login handler
- `src/app/posts/page.tsx`: Posts listing with Supabase queries and sidebar
- `src/app/posts/[id]/page.tsx`: Post detail with threaded comments
- `src/components/layout/Header.tsx`: Navigation and auth UI (client component)
- `src/lib/supabase/server.ts`: Server-side Supabase client factory
- `src/lib/utils.ts`: formatDate, formatNumber, cn helpers

**Testing:**

- `e2e/`: Playwright tests (exact structure varies; typically auth flows, post creation, etc.)
- `playwright.config.ts`: Test runner config with baseURL pointing to localhost

## Naming Conventions

**Files:**

- Page components: `page.tsx` (Next.js convention; no other names)
- Layout components: `layout.tsx` (Next.js convention; only one per directory)
- API routes: `route.ts` (Next.js convention; HTTP verb determined by function name: GET, POST, etc.)
- React components: PascalCase (e.g., `Header.tsx`, `PostCard.tsx`)
- Utilities: camelCase with descriptive names (e.g., `formatDate.ts`, `utils.ts`)
- Types: PascalCase, often name-suffixed with `.types.ts` (e.g., `database.types.ts`)

**Directories:**

- Routes: kebab-case matching URL slug (e.g., `/named-storm-deductible` → `src/app/named-storm-deductible/`)
- Dynamic routes: Wrapped in square brackets (e.g., `/posts/[id]` → `src/app/posts/[id]/`)
- Components: Organized by domain (ui, layout, posts) then PascalCase directory if grouping multiple related files
- Features in lib: kebab-case with dash separators (e.g., `qa-generator`, `papers-pipeline`)

**Imports:**

- Always use `@/` alias (e.g., `import { Header } from '@/components/layout/Header'`)
- No relative imports (../) — maintained for cleanness

## Where to Add New Code

**New Feature (e.g., voting system):**
- Primary code: `src/app/api/v1/reactions/route.ts` (endpoint) + `src/components/posts/VotingButtons.tsx` (UI)
- Tests: `e2e/voting.spec.ts` (Playwright E2E test)

**New Page/Route:**
- Implementation: Create `src/app/[route-name]/page.tsx`
- Layout: If shared header/sidebar needed, add to existing layout.tsx; no separate layout per page currently
- Styling: Use Tailwind classes; extend globals.css only if new design tokens needed

**New Component:**
- UI primitive: Add to `src/components/ui/` as PascalCase file (e.g., `Dialog.tsx`)
- Feature component: Add to domain-specific folder (e.g., `src/components/posts/`, `src/components/layout/`)
- Export: If used across multiple features, create barrel file `index.ts` in component folder

**New API Endpoint:**
- Location: `src/app/api/v1/[resource]/route.ts`
- Pattern: Use NextRequest/NextResponse; create Supabase server client; handle auth check
- Return: JSON response with { data } or { error } + appropriate HTTP status code

**New Utility/Helper:**
- Shared helpers: Add to `src/lib/utils.ts` or new file if large
- Domain-specific utils: Create folder in `src/lib/` (e.g., `src/lib/post-utils.ts`)
- Export: Use named exports for treeshaking

**New Content Pipeline:**
- Location: Create folder in `src/lib/` (e.g., `src/lib/glossary-generator/`)
- Structure: CLI entry point, orchestrator, validators, sanitizers
- Integration: Wire into `/api/cron/` or admin endpoints

**New Database Table/Join:**
- Schema: Add to `supabase/migrations/` as SQL file with timestamp
- Types: Run `supabase gen types typescript --project-id [id] > src/types/database.types.ts`
- Queries: Use new table in page.tsx or API routes via Supabase client

## Special Directories

**`public/`:**
- Purpose: Static assets served as-is (no hashing)
- Generated: No
- Committed: Yes
- Contains: favicon.svg, logo.svg, images for guides

**`.next/`:**
- Purpose: Next.js build output (compiled JavaScript, manifests, etc.)
- Generated: Yes (via `npm run build`)
- Committed: No (.gitignore)
- Size: Large; deleted between deploys

**`node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes (via `npm install`)
- Committed: No (.gitignore)
- Size: Very large

**`supabase/.temp/`:**
- Purpose: Temporary files during local Supabase development
- Generated: Yes (by Supabase CLI)
- Committed: No (.gitignore)

**`.planning/codebase/`:**
- Purpose: GSD planning and codebase analysis documents
- Generated: Yes (by mapping tools)
- Committed: Yes
- Contains: ARCHITECTURE.md, STRUCTURE.md, STACK.md, TESTING.md, CONCERNS.md

**`e2e/`:**
- Purpose: Playwright end-to-end test files
- Generated: No (hand-written)
- Committed: Yes
- Run via: `npm run test:e2e` or `npm run test:e2e:ui`

---

*Structure analysis: 2026-03-02*
