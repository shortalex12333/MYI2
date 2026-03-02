# Architecture

**Analysis Date:** 2026-03-02

## Pattern Overview

**Overall:** Next.js 14 Server Components with Client-side Auth Context - Community Q&A platform (Stack Overflow-like) for yacht insurance education and discussion

**Key Characteristics:**
- Server-side rendering for SEO and performance with App Router
- Client-side authentication state management via React Context
- Supabase as backend database with RLS for data isolation
- Static content generation for educational pages (guides, FAQ, glossary)
- Real-time posts and comments with voting/reactions
- API routes for backend operations (auth, profile, content management)

## Layers

**Presentation (UI Components):**
- Purpose: Render user interface with server and client components
- Location: `src/components/` and `src/app/` page files
- Contains: React components, UI primitives (button, card, input, etc.), layout components
- Depends on: Next.js, React, Tailwind CSS, lucide-react icons
- Used by: Page routes in App Router

**Routing & Pages:**
- Purpose: Define URL structure and server-side data fetching per route
- Location: `src/app/` directory following Next.js App Router convention
- Contains: Page components (SSR), API routes, dynamic route handlers
- Depends on: Supabase client (server), Next.js navigation
- Used by: Browser navigation, external links

**Context & State Management:**
- Purpose: Manage global authentication and user session state
- Location: `src/contexts/AuthContext.tsx`
- Contains: Auth context provider, useAuth hook, session refresh logic
- Depends on: Fetch API, `/api/v1/profile` endpoint
- Used by: Header component, protected page routes, client components

**API Routes (Backend):**
- Purpose: Server-side handlers for auth, profile, posts, comments, data operations
- Location: `src/app/api/v1/*` directory
- Contains: POST/GET/PUT/DELETE handlers for auth, profiles, posts, comments, reactions
- Depends on: Supabase server client, authentication middleware
- Used by: Frontend components via fetch, E2E tests

**Database & ORM:**
- Purpose: Provide typed database access with RLS enforcement
- Location: `src/lib/supabase/` for client/server factories; `src/types/database.types.ts` for schema
- Contains: Supabase client initialization, type definitions (241 lines)
- Depends on: @supabase/ssr, @supabase/supabase-js
- Used by: Page components, API routes

**Utilities & Helpers:**
- Purpose: Shared functions for formatting, styling, data transformation
- Location: `src/lib/utils.ts` (formatDate, formatNumber, cn className merger)
- Contains: Date formatting (relative time), number abbreviation (K/M), Tailwind class merging
- Depends on: clsx, tailwind-merge
- Used by: All components that need formatting or styling

**Content Pipelines (Background):**
- Purpose: Generate educational content (Q&A, case studies, topics) and manage publishing workflow
- Location: `src/lib/` subdirectories: `qa-generator/`, `papers-pipeline/`, `topics-pipeline/`, `case-study-generator/`, `scraper/`, `pipeline-orchestrator/`
- Contains: CLI tools, schema validators, data generation orchestration
- Depends on: Supabase, internal utilities
- Used by: Admin endpoints, background jobs

## Data Flow

**User Authentication:**

1. User enters email/password on `/login` page
2. Login form submits to `/api/v1/auth/login` (POST)
3. Route handler calls `supabase.auth.signInWithPassword()`
4. Session stored in HTTP-only cookie (managed by @supabase/ssr)
5. Frontend refetches `/api/v1/profile` to populate AuthContext
6. Header shows authenticated user state (username, reputation, sign-out button)

**Viewing Community Posts:**

1. User navigates to `/posts` (page.tsx)
2. Server-side component calls `supabase.from('posts').select(...)` with joins
3. Fetches posts, authors (via profiles), categories, tags (via join tables)
4. Maps post_tags to extract tag array (flattens nested data)
5. Renders PostCard components showing title, author, category, tags
6. Sidebar shows categories and popular tags from separate queries

**Post Detail with Comments:**

1. User clicks post → navigates to `/posts/[id]`
2. Dynamic route fetches single post with author, category, tags, company, location
3. Separately fetches comments with threaded structure
4. Builds comment tree: maps comments by ID, finds root and reply comments
5. Renders post body as Markdown with react-markdown + remarkGfm
6. Shows voting buttons (VotingButtons component) and comment thread
7. CommentThread component handles nested reply rendering

**State Management Flow:**

1. AuthContext initialized in root `layout.tsx` as provider
2. useAuth() hook allows any client component to access `{ loading, user, refresh, signOut }`
3. Header component (client) calls useAuth() to show auth UI conditionally
4. Login/signup routes trigger refresh() to update context state
5. Protected pages can check `user` before rendering

## Key Abstractions

**Post Content Model:**

- Purpose: Represent user-generated questions with voting, tags, and discussion
- Examples: `src/app/posts/page.tsx`, `src/app/posts/[id]/page.tsx`, `/api/v1/posts/route.ts`
- Pattern: Server-side fetching with Supabase joins; client-side rendering of Markdown body; nested comment threading

**Authentication State:**

- Purpose: Provide consistent user session access across app without prop drilling
- Examples: `src/contexts/AuthContext.tsx`, `src/components/layout/Header.tsx`
- Pattern: React Context + custom hook; session managed via HTTP-only cookies; refresh triggered on mount and after auth operations

**UI Component System:**

- Purpose: Consistent design tokens and reusable button/card/input/badge/avatar components
- Examples: `src/components/ui/` (7 components), Tailwind design system in `src/app/globals.css`
- Pattern: Shadcn-style unstyled components; CSS variables for theming (light/dark mode); Tailwind utilities for layout

**API Route Handlers:**

- Purpose: Type-safe, authenticated backend operations with error handling
- Examples: `/api/v1/auth/login`, `/api/v1/profile`, `/api/v1/posts`
- Pattern: NextRequest/NextResponse; Supabase server client with cookie management; status codes for error states; JSON request/response

**Content Generation Pipeline:**

- Purpose: Bulk-generate educational Q&A and topic content with quality gates and validation
- Examples: `src/lib/qa-generator/generate.ts`, `src/lib/papers-pipeline/`, `src/lib/pipeline-orchestrator/`
- Pattern: CLI tools triggered manually or via cron; orchestrator manages dependencies; validators check schema compliance; sanitizers clean content before publishing

## Entry Points

**Root Layout:**

- Location: `src/app/layout.tsx`
- Triggers: All page requests (initial HTML)
- Responsibilities: Wrap app with AuthProvider, render Header and footer, load global styles and schema.org metadata

**Home Page:**

- Location: `src/app/page.tsx`
- Triggers: GET `/`
- Responsibilities: Display hero section, key learning resources, CTA buttons linking to guides and tools

**API v1 Auth Endpoints:**

- Location: `src/app/api/v1/auth/{login,signup,signout}/route.ts`
- Triggers: POST /api/v1/auth/{operation}
- Responsibilities: Handle Supabase auth operations, set/clear session cookies, return user/session data or errors

**Dynamic Post Page:**

- Location: `src/app/posts/[id]/page.tsx`
- Triggers: GET /posts/{post-id}
- Responsibilities: Fetch post and comment data, build threaded comment tree, render markdown body with syntax highlighting

## Error Handling

**Strategy:** Mostly manual with notFound() for missing resources; try/catch in API routes returning JSON errors; no global error boundary

**Patterns:**

- 404 Not Found: `notFound()` in dynamic routes when `.single()` query returns error
- 401 Unauthorized: API routes return `{ error: 'Unauthorized' }` with 401 status when no authenticated user
- 400 Bad Request: API routes validate input and return `{ error: message }` for validation failures
- 500 Server Error: Catch-all in API routes logs error and returns generic 500 message
- Silent fallback: Missing joins in queries return null/undefined; components handle gracefully (e.g., posts.map() with || [] fallback)

## Cross-Cutting Concerns

**Logging:** console.error() in API routes for debugging; no structured logging or observability

**Validation:** Supabase types (database.types.ts) provide compile-time validation; no runtime zod/validator schemas for API input

**Authentication:** Supabase Auth handles session via HTTP-only cookies; /api/v1/profile checks `supabase.auth.getUser()` to verify logged-in state; no custom JWT parsing

**Authorization:** RLS (Row Level Security) in Supabase enforces data isolation by user/company at database level; no middleware-level role checks in API routes

**CORS:** Not explicitly configured; relying on same-origin requests (same Next.js domain)

**Markdown Rendering:** React-markdown with remarkGfm for GFM syntax (tables, strikethrough); hardcoded prose-slate Tailwind classes for styling

---

*Architecture analysis: 2026-03-02*
