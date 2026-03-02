# Coding Conventions

**Analysis Date:** 2026-03-02

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `PostCard.tsx`, `AuthContext.tsx`)
- Utilities and helpers: camelCase (e.g., `utils.ts`, `auth.ts`, `client.ts`)
- Route handlers: `route.ts` in Next.js app directory structure
- API utilities: camelCase in `_utils/` directories (e.g., `_utils/auth.ts`)
- Type files: PascalCase with `.types.ts` suffix (e.g., `database.types.ts`)

**Functions:**
- camelCase naming throughout (e.g., `formatDate()`, `verifyApiKey()`, `createClient()`)
- Exported context hook functions use `use` prefix (e.g., `useAuth()`)
- Handler functions in API routes are named by HTTP method (e.g., `export async function POST()`, `export async function GET()`)

**Variables:**
- Local variables and state use camelCase (e.g., `apiKey`, `newSources`, `existingUrls`)
- React state variables use camelCase with setter functions (e.g., `const [loading, setLoading] = useState()`)
- Constants use camelCase even for module-level constants (not SCREAMING_SNAKE_CASE)

**Types:**
- TypeScript interfaces: PascalCase (e.g., `ButtonProps`, `PostCardProps`, `AuthState`)
- Discriminated union types use camelCase for field names (e.g., `{ valid: boolean; error?: string }`)
- Database type files auto-generated from Supabase (see `src/types/database.types.ts`)

## Code Style

**Formatting:**
- No explicit linter/formatter configuration files detected
- Next.js default ESLint included (`eslint-config-next`)
- Indentation: 2 spaces (observed throughout codebase)
- Line length: No strict limit enforced, but appears to stay under 120 characters in most cases
- Quote style: Single quotes for imports and strings (observed consistently)

**Linting:**
- ESLint is configured via `eslint-config-next` (see `package.json`)
- Command: `npm run lint` runs `next lint`
- Default Next.js rules applied; no custom `.eslintrc` override detected

**Component Structure:**
- React components use `React.forwardRef` for components that expose DOM refs (e.g., `Button`, `Card`, `CardHeader`)
- Components set `displayName` property explicitly (e.g., `Button.displayName = "Button"`)
- Functional components preferred; class components not observed in codebase

## Import Organization

**Order:**
1. External dependencies (React, Next.js, third-party libraries)
2. Internal absolute imports using `@/` alias
3. Type imports separated at top when needed

**Example from `PostCard.tsx`:**
```typescript
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, formatNumber } from '@/lib/utils'
import { MessageSquare, Eye, CheckCircle2 } from 'lucide-react'
import { Post } from '@/types/database.types'
```

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- All imports use absolute `@/` paths, no relative imports for cross-directory navigation

## Error Handling

**Patterns:**
- Fetch-based routes use try-catch blocks with generic catch-all (see `src/app/api/v1/scraper/init/route.ts`)
- Supabase client operations check both `error` and `data` fields:
  ```typescript
  const { data, error } = await supabase.from('table').select()
  if (error || !data) {
    // Handle error
  }
  ```
- API route handlers return `NextResponse.json()` with status codes
- Helper functions return structured objects with `{ success, data, error }` pattern (see `parseRequestBody()`)
- Error responses include optional `details` field for debugging

**Error Response Pattern:**
```typescript
export function errorResponse(
  message: string,
  statusCode: number = 400,
  details?: any
) {
  return NextResponse.json(
    { error: message, ...(details && { details }) },
    { status: statusCode }
  )
}
```

## Logging

**Framework:** Native `console` methods used throughout

**Patterns:**
- `console.error()` for error logging (e.g., `console.error('Failed to create post:', error)`)
- Custom logging helper in `_utils/auth.ts`:
  ```typescript
  function log(message: string, level: 'info' | 'error' = 'info'): void
  ```
- API route handlers call `log()` helper at key points (initialization, success, errors)

**When to Log:**
- Log at API route entry points for debugging
- Log errors and exceptions to console.error()
- Avoid logging in component render methods
- Use error boundaries implicitly via Next.js error handling

## Comments

**When to Comment:**
- Function-level documentation using JSDoc-style comments (e.g., in `_utils/auth.ts`)
- Explain complex business logic or non-obvious conditionals
- Mark TODO items inline (observed in codebase: `// TODO: implement accepted answer logic`)
- Explain security decisions (e.g., in `verifyApiKey()` function header)

**JSDoc/TSDoc:**
- JSDoc comments used for exported functions in utility files
- Format: Multi-line comments with `/**` opening (seen in `_utils/auth.ts`)
- Example:
  ```typescript
  /**
   * Verify x-api-key header (accepts any non-empty key, validation happens at database layer)
   * This is safe because: ...
   */
  export function verifyApiKey(request: NextRequest) { ... }
  ```

**Inline Comments:**
- Use for documenting non-obvious code or security considerations
- Avoid over-commenting obvious code

## Function Design

**Size:**
- Functions stay focused on single responsibility
- Route handlers in `route.ts` files typically 50-100 lines (includes try-catch, validation, database operations)
- Utility functions stay under 50 lines

**Parameters:**
- Named parameters preferred for clarity
- Type annotations required (TypeScript strict mode enabled)
- Destructuring used for object parameters (e.g., `{ className, variant, size, ...props }`)

**Return Values:**
- API routes return `NextResponse` objects with appropriate status codes
- Utility functions return typed objects or discriminated unions
- React components return JSX.Element

## Module Design

**Exports:**
- Named exports preferred (e.g., `export { Button, buttonVariants }`)
- Default exports used for pages (Next.js convention)
- Re-export patterns seen in component index files

**Barrel Files:**
- Component compound exports (e.g., `Card`, `CardHeader`, `CardTitle`, all from `card.tsx`)
- Utilities grouped in single files (e.g., `utils.ts` contains `cn()`, `formatDate()`, `formatNumber()`)
- API utilities in `_utils/` directories to prevent route collision with Next.js app router

## TypeScript Configuration

**Key Settings:**
- `strict: true` - Full type checking enabled
- `esModuleInterop: true` - CommonJS/ESM compatibility
- `moduleResolution: "bundler"` - Uses bundler resolution for path aliases
- `jsx: "preserve"` - Preserves JSX for Next.js to handle
- Path alias: `@/*` → `./src/*`

---

*Convention analysis: 2026-03-02*
