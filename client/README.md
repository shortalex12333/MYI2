# MyYachtsInsurance - Client Application

A Next.js-based community platform for yacht insurance discussions, built with TypeScript, Tailwind CSS, and Supabase.

## Features

- User authentication and profile management
- Post creation with markdown support
- Threaded comments and reactions
- Category-based organization
- Tag system for content discovery
- Company and location filtering
- FAQ section
- Full-text search capabilities
- Role-based access control (RBAC)

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom components following shadcn/ui patterns
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+
- npm or yarn
- A Supabase account

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/shortalex12333/MYI2.git
cd MYI2/client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the migration script from `../supabase_schema.sql`
4. This will create all tables, indexes, RLS policies, and seed data

### 4. Configure Environment Variables

Create a `.env.local` file in the client directory:

```bash
cp .env.example .env.local
```

Update the values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

You can find these values in your Supabase project settings under API.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
client/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/v1/            # API routes
│   │   ├── posts/             # Post-related pages
│   │   ├── login/             # Authentication pages
│   │   ├── signup/
│   │   ├── onboarding/
│   │   ├── faq/
│   │   ├── contact/
│   │   ├── terms/
│   │   ├── privacy/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components
│   │   ├── layout/           # Layout components
│   │   └── posts/            # Domain-specific components
│   ├── lib/                  # Utility functions
│   │   ├── supabase/         # Supabase clients
│   │   └── utils.ts          # Helper functions
│   ├── types/                # TypeScript type definitions
│   └── middleware.ts         # Next.js middleware
├── public/                   # Static assets
├── .env.example              # Environment variables template
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## API Routes

The application follows the API specification defined in `docs/api_spec.md`:

- `POST /api/v1/auth/signup` - Create new account
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/posts` - List posts (with filters)
- `POST /api/v1/posts` - Create post
- `GET /api/v1/posts/[id]` - Get specific post
- `PUT /api/v1/posts/[id]` - Update post
- `DELETE /api/v1/posts/[id]` - Delete post
- `GET /api/v1/comments` - List comments
- `POST /api/v1/comments` - Create comment
- `POST /api/v1/reactions` - Add/remove reaction
- `GET /api/v1/categories` - List categories

## Key Features Implementation

### Authentication
- Supabase Auth handles user authentication
- Session management via cookies
- Middleware refreshes sessions on each request

### Posts & Comments
- Markdown-based content creation
- Threaded comment system
- Real-time score calculation
- View counter

### Reactions
- Like, dislike, share, and bookmark functionality
- One reaction per type per user
- Automatic score updates via database triggers

### Permissions
- Row Level Security (RLS) policies enforce access control
- Role-based permissions (guest, user, verified_user, moderator, admin)
- Users can only edit/delete their own content

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the root directory to `client`
4. Configure environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your production URL)
5. Deploy

Vercel will automatically:
- Install dependencies
- Build the Next.js application
- Deploy to a global CDN
- Set up automatic deployments on git push

### Custom Domain

1. Go to your Vercel project settings
2. Navigate to Domains
3. Add your custom domain
4. Configure DNS as instructed

## Database Schema

The complete database schema is defined in `../supabase_schema.sql` and includes:

- **profiles** - User profiles extending Supabase auth.users
- **vessels** - User's yacht information
- **posts** - User-created posts
- **comments** - Threaded comments
- **reactions** - Likes, dislikes, shares, bookmarks
- **categories** - Post categories
- **tags** - Post tags
- **locations** - Hierarchical location taxonomy
- **companies** - Insurance companies/brokers
- **faqs** - Frequently asked questions
- **follows** - User following relationships
- **notifications** - User notifications

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |

## Security Considerations

- All API routes verify user authentication
- Row Level Security (RLS) policies protect data at the database level
- Environment variables are never exposed to the client
- CORS is configured appropriately
- Input validation on all forms
- SQL injection prevention via Supabase client
- XSS protection via React's built-in escaping

## Performance Optimizations

- Server-side rendering for SEO and initial load
- Image optimization via Next.js Image component
- Code splitting and lazy loading
- Database indexes on frequently queried columns
- Caching strategies for static content

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
- Create an issue on GitHub
- Email: support@myyachtsinsurance.com
- Community: Browse discussions in the platform

## License

ISC License

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- UI inspired by [shadcn/ui](https://ui.shadcn.com/)
