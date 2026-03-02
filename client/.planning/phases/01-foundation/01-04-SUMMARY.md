---
phase: 01-foundation
plan: 04
subsystem: seo
tags: [schema.org, faq, breadcrumbs, structured-data, json-ld]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Database with qa_entries table
provides:
  - Schema.org FAQPage generator for Q&A content
  - Schema.org BreadcrumbList generator for navigation
  - Q&A detail page route with structured data
  - Reusable schema module for future pages
affects: [content-publishing, seo-optimization, ai-citations]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Schema.org JSON-LD in Next.js server components
    - Centralized schema generators in /lib/schema
    - Breadcrumb patterns via COMMON_BREADCRUMBS constants

key-files:
  created:
    - src/lib/schema/faq-schema.ts
    - src/lib/schema/breadcrumb-schema.ts
    - src/lib/schema/index.ts
    - src/app/knowledge/[id]/page.tsx
  modified: []

key-decisions:
  - "Used /knowledge/[id] route pattern matching existing /knowledge list page"
  - "Created COMMON_BREADCRUMBS constant for reusable breadcrumb patterns"
  - "Used standard Next.js JSON-LD pattern for Schema.org structured data"

patterns-established:
  - "Schema generators return typed objects for JSON.stringify in script tags"
  - "Each schema module exports generator functions and TypeScript interfaces"
  - "Centralized schema exports via src/lib/schema/index.ts barrel file"

requirements-completed: [FR-5.1, FR-5.2, FR-5.3, FR-5.4]

# Metrics
duration: 3min
completed: 2026-03-02
---

# Phase 01 Plan 04: Schema.org Structured Data Summary

**FAQPage and BreadcrumbList Schema.org generators with Q&A detail pages for AI citation optimization**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-02T17:29:13Z
- **Completed:** 2026-03-02T17:32:09Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Created reusable Schema.org generators for FAQPage and BreadcrumbList
- Built Q&A detail page route at /knowledge/[id] with full structured data
- Verified existing Article schema in papers pages (FR-5.2)
- Verified existing Organization schema in layout (FR-5.3)
- Established pattern for Schema.org implementation across the site

## Task Commits

Each task was committed atomically:

1. **Task 1: Create FAQPage schema generator** - `02efcab` (feat)
2. **Task 2: Create BreadcrumbList schema generator** - `f07f13a` (feat)
3. **Task 3: Create schema module index and integrate FAQPage into Q&A page** - `b6aad94` (feat)

## Files Created/Modified

**Created:**
- `src/lib/schema/faq-schema.ts` - FAQPage Schema.org generator with single and multi-Q&A support
- `src/lib/schema/breadcrumb-schema.ts` - BreadcrumbList Schema.org generator with common patterns
- `src/lib/schema/index.ts` - Centralized schema module exports
- `src/app/knowledge/[id]/page.tsx` - Q&A detail page with FAQPage and BreadcrumbList schemas

## Decisions Made

1. **Route pattern:** Used `/knowledge/[id]` to match existing `/knowledge` list page pattern
2. **Schema rendering:** Used standard Next.js JSON-LD pattern for structured data (matches existing patterns in layout.tsx and papers/[slug]/page.tsx)
3. **Breadcrumb reusability:** Created `COMMON_BREADCRUMBS` constant object for shared navigation patterns
4. **Module organization:** Created barrel export at `src/lib/schema/index.ts` for clean imports

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed as specified.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Schema.org foundation complete and ready for:
- Additional schema types (Product, Service, etc.)
- Bulk Q&A publishing with Schema.org markup
- Enhanced AI citation tracking via structured data

All four functional requirements (FR-5.1 through FR-5.4) are complete:
- FR-5.1: FAQPage schema on Q&A content ✓
- FR-5.2: Article schema on papers (verified existing) ✓
- FR-5.3: Organization schema site-wide (verified existing) ✓
- FR-5.4: BreadcrumbList schema on content pages ✓

## Self-Check: PASSED

All files verified to exist:
- ✓ src/lib/schema/faq-schema.ts
- ✓ src/lib/schema/breadcrumb-schema.ts
- ✓ src/lib/schema/index.ts
- ✓ src/app/knowledge/[id]/page.tsx

All commits verified to exist:
- ✓ 02efcab (Task 1: FAQPage schema generator)
- ✓ f07f13a (Task 2: BreadcrumbList schema generator)
- ✓ b6aad94 (Task 3: Schema module index and Q&A page)

---
*Phase: 01-foundation*
*Completed: 2026-03-02*
