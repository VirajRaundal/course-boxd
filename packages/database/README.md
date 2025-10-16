# @course-boxd/database

Prisma-based database package for CourseBoxd, providing schema definitions, migrations, and database utilities.

## Overview

This package manages the PostgreSQL database schema using Prisma ORM. It includes:

- **Prisma Schema**: Complete data model definitions
- **Migrations**: Version-controlled database migrations
- **Seed Scripts**: Sample data for development and testing
- **Database Utilities**: Helper functions for common queries

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (local or Supabase)

## Setup

### Option 1: Local PostgreSQL

1. **Install PostgreSQL**:

   ```bash
   # macOS
   brew install postgresql@14
   brew services start postgresql@14

   # Ubuntu/Debian
   sudo apt install postgresql-14
   sudo systemctl start postgresql

   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**:

   ```bash
   createdb courseboxd_dev
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root (copy from `.env.example`):
   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/courseboxd_dev"
   DIRECT_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/courseboxd_dev"
   ```

### Option 2: Supabase PostgreSQL

1. **Create a Supabase Project**:
   - Visit [supabase.com](https://supabase.com) and create a new project
   - Note your project reference ID and database password

2. **Configure Environment Variables**:
   Update `.env` file with your Supabase credentials:
   ```bash
   DATABASE_URL="postgresql://postgres:<db-password>@db.<project-ref>.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
   DIRECT_DATABASE_URL="postgresql://postgres:<db-password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require"
   ```

## Database Schema

### Core Entities

#### Users

User accounts with authentication support (NextAuth compatible).

**Fields**: email, username, name, avatarUrl, bio, passwordHash, emailVerified, defaultVisibility

#### Courses

Course catalog with provider metadata for tracking external content sources.

**Fields**: slug, title, summary, description, provider, providerUrl, thumbnailUrl, externalId, creatorId

**Provider Examples**: Udemy, Coursera, YouTube, LinkedIn Learning, or internal CourseBoxd courses

#### Videos (CourseVideos)

Individual video lessons within courses.

**Fields**: slug, title, description, url, durationSeconds, provider, externalId, thumbnailUrl, courseId, creatorId

#### CourseRatings & VideoRatings

Star ratings (0-5 in 0.5 increments) for courses and videos.

**Fields**: userId, courseId/videoId, rating (enforced 0.5 increments via DB constraint)

#### Reviews

Text reviews for courses or videos.

**Fields**: authorId, courseId, videoId, title, body

#### Lists & ListCourses

User-curated course collections with ordering.

**Lists Fields**: authorId, title, description
**ListCourses Fields**: listId, courseId, position, notes

#### DiaryEntries & DiaryEntryItems

Learning journal entries tracking course/video completion.

**DiaryEntries Fields**: authorId, entryDate, reflections, courseId, videoId
**DiaryEntryItems Fields**: diaryEntryId, courseId, videoId, position, notes

#### Wishlists & WishlistCourses

User course wishlists with priority ordering.

**Wishlists Fields**: userId, name, description
**WishlistCourses Fields**: wishlistId, courseId, priority, notes

#### UserCourseStatus

Track user progress through courses.

**Fields**: userId, courseId, status (NOT_STARTED | IN_PROGRESS | COMPLETED | DROPPED), progress (0-100), lastAccessedAt, startedAt, completedAt

#### Social Features

- **Follow**: User follower/following relationships
- **Like**: Polymorphic likes on reviews, lists, diary entries
- **Comment**: Threaded comments on reviews, lists, diary entries

## Commands

### Generate Prisma Client

Generates TypeScript types and client from the schema:

```bash
npm run db:generate
```

### Run Migrations

Apply pending migrations to your database:

```bash
npm run db:migrate
```

This command:

- Applies pending migrations
- Generates the Prisma client
- Creates a new migration if schema changes are detected

### Deploy Migrations (Production)

Apply migrations without prompts (for CI/CD):

```bash
npm run db:deploy
```

### Seed Database

Populate the database with sample data:

```bash
npm run seed:db
```

**Sample Data Includes**:

- 3 users (alice, bob, carol)
- 2 courses with provider metadata (CourseBoxd, Udemy)
- 3 videos with external provider info (YouTube, Vimeo)
- Course ratings and video ratings
- Reviews for courses and videos
- User lists with course associations
- Diary entries with multiple items
- Wishlists with course priorities
- User course status tracking (in progress, completed)
- Social graph (followers, likes, comments)

## Usage

### Importing the Prisma Client

```typescript
import { prisma } from "@course-boxd/database";

// Query courses with provider info
const courses = await prisma.course.findMany({
  where: {
    provider: "Udemy",
  },
  include: {
    videos: true,
    creator: true,
  },
});

// Get user's wishlist with courses
const wishlist = await prisma.wishlist.findFirst({
  where: { userId },
  include: {
    wishlistCourses: {
      include: {
        course: true,
      },
      orderBy: {
        priority: "asc",
      },
    },
  },
});

// Track course progress
await prisma.userCourseStatus.upsert({
  where: {
    userId_courseId: { userId, courseId },
  },
  create: {
    userId,
    courseId,
    status: "IN_PROGRESS",
    progress: 25,
    startedAt: new Date(),
  },
  update: {
    progress: 25,
    lastAccessedAt: new Date(),
  },
});
```

### Using Aggregation Helpers

```typescript
import {
  getCourseAverageRating,
  getVideoRatingSummary,
} from "@course-boxd/database";

// Get average course rating
const avgRating = await getCourseAverageRating(courseId);
// Returns: number (e.g., 4.5)

// Get video rating summary
const videoSummary = await getVideoRatingSummary(videoId);
// Returns: { average: number, count: number }
```

## Schema Highlights

### Provider Metadata

Courses and Videos include provider-specific fields for tracking content from external platforms:

- `provider`: Platform name (e.g., "Udemy", "YouTube", "Coursera")
- `providerUrl`: Direct link to content on provider platform
- `externalId`: Provider's internal ID for the content
- `thumbnailUrl`: Thumbnail image URL

### Relational Integrity

- All junction tables (ListCourses, WishlistCourses, DiaryEntryItems) use foreign keys with `CASCADE DELETE`
- Unique constraints prevent duplicate entries (e.g., one rating per user per course)
- Position/priority fields enable ordered collections

### Polymorphic Interactions

Likes and Comments use an `InteractionTargetType` enum to support multiple target types:

- REVIEW
- LIST
- DIARY_ENTRY

### Rating Constraints

Database-level constraints enforce:

- Ratings between 0 and 5
- 0.5 increment steps (0, 0.5, 1.0, 1.5, ... 5.0)

## Migrations

Migrations are stored in `prisma/migrations/` and are version-controlled. Each migration:

- Has a timestamp-based directory name
- Contains a `migration.sql` file with DDL statements
- Is tracked in the `_prisma_migrations` table

### Current Migrations

1. **202410161100_initial_social_and_ratings**: Initial schema with users, courses, videos, reviews, ratings, and social features
2. **20241016120000_add_provider_metadata_lists_wishlists_user_status**: Added provider metadata, proper junction tables, wishlists, and user progress tracking

## Environment Variables

| Variable              | Description                    | Example                           |
| --------------------- | ------------------------------ | --------------------------------- |
| `DATABASE_URL`        | Pooled connection (runtime)    | `postgresql://...?pgbouncer=true` |
| `DIRECT_DATABASE_URL` | Direct connection (migrations) | `postgresql://...`                |

**Note**: Supabase requires two URLs because pgBouncer (used in `DATABASE_URL`) doesn't support migration commands.

## Troubleshooting

### Migration Fails

```bash
# Reset database and reapply all migrations
npm run db:migrate reset
```

### Prisma Client Out of Sync

```bash
# Regenerate client
npm run db:generate
```

### Type Errors After Schema Changes

1. Update the schema in `prisma/schema.prisma`
2. Generate client: `npm run db:generate`
3. Create migration: `npm run db:migrate`
4. Restart TypeScript server in your editor

## Contributing

When modifying the schema:

1. Update `prisma/schema.prisma`
2. Run `npm run db:migrate` to create a migration
3. Update `prisma/seed.ts` if needed
4. Test with `npm run seed:db`
5. Document significant changes in this README

## License

Private repository - All rights reserved.
