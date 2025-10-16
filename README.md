# CourseBoxd

Your launchpad for building and shipping high-quality learning experiences.

## Project Structure

This is a monorepo using npm workspaces:

- `apps/web` - Next.js 15+ web application
- `packages/database` - Prisma schema, migrations, and database helpers

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm run start
```

## Available Scripts

### Root Scripts

- `npm run dev` - Start the Next.js dev server
- `npm run build` - Build the Next.js application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check formatting without making changes
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate the Prisma client for the Supabase schema
- `npm run db:migrate` - Run pending Prisma migrations against your database
- `npm run db:deploy` - Apply migrations in environments where `prisma migrate dev` is unavailable
- `npm run seed:db` - Seed the database with sample social data

### Web App Scripts (from root)

- `npm run dev --workspace web`
- `npm run build --workspace web`
- `npm run start --workspace web`
- `npm run lint --workspace web`
- `npm run type-check --workspace web`

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged

## Database & Prisma

The `@course-boxd/database` workspace houses the Prisma schema, generated client, migrations, and utility helpers for working with Supabase PostgreSQL.

### Schema highlights

- `Courses` and `Videos` include provider metadata fields (`provider`, `providerUrl`, `externalId`, `thumbnailUrl`) for tracking content from external platforms like Udemy, YouTube, etc.
- `CourseRatings` and `VideoRatings` store star ratings in 0.5 increments out of five and restrict duplicate ratings per user.
- `ListCourses` is a junction table connecting Lists to Courses with position ordering and notes.
- `DiaryEntryItems` allows a diary entry to track multiple courses/videos with position ordering.
- `Wishlists` and `WishlistCourses` enable users to save courses they want to take later with priority ordering.
- `UserCourseStatus` tracks each user's progress through courses (NOT_STARTED, IN_PROGRESS, COMPLETED, DROPPED) with progress percentage and timestamps.
- `Follows` models the follower/following graph with a composite primary key.
- `Likes` and `Comments` use a polymorphic `InteractionTargetType` enum, allowing users to react to reviews, lists, or diary entries while maintaining indexed lookups.

### Common commands

1. Configure `DATABASE_URL` and `DIRECT_DATABASE_URL` in your `.env` file with Supabase connection strings (see `.env.example` for reference).
2. `npm run db:generate` — generate the typed Prisma client.
3. `npm run db:migrate` — apply pending migrations locally.
4. `npm run seed:db` — populate example data including users, courses with provider metadata, videos, wishlists, user progress tracking, lists, diary entries, followers, likes, comments, and ratings.

### Aggregation helpers

```ts
import {
  getCourseAverageRating,
  getVideoRatingSummary,
} from "@course-boxd/database";

const courseAverage = await getCourseAverageRating(courseId);
const videoSummary = await getVideoRatingSummary(videoId);
// videoSummary = { average: number, count: number }
```

## Project Structure

```
course-boxd/
├── apps/
│   └── web/              # Next.js application
│       ├── src/
│       │   └── app/      # App Router pages
│       ├── public/       # Static assets
│       └── package.json
├── packages/
│   └── database/         # Prisma schema, migrations, and helpers
├── .husky/               # Git hooks
├── package.json          # Root package configuration
└── README.md
```

## Environment Variables

Copy `.env.example` to `.env` at the repository root (and create `.env.local` inside `apps/web` for frontend-only overrides) and adjust the values as needed. The database connection strings should point at your Supabase PostgreSQL instance:

- `DATABASE_URL` — pooled connection string (pgBouncer) for runtime application traffic
- `DIRECT_DATABASE_URL` — direct connection string for running migrations, seeding, and local tooling

## Contributing

This project uses:

- **Prettier** for code formatting
- **ESLint** for code quality
- **Husky** for pre-commit hooks
- **lint-staged** for running checks on staged files

All code changes will be automatically formatted and linted before commit.

## License

Private repository - All rights reserved.
