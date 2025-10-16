# CourseBoxd Setup Guide

Complete guide for setting up CourseBoxd locally with PostgreSQL and Prisma.

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+ (or Supabase account)

## Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd course-boxd
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL

1. **Install PostgreSQL**:

   ```bash
   # macOS
   brew install postgresql@14
   brew services start postgresql@14

   # Ubuntu/Debian
   sudo apt install postgresql-14
   sudo systemctl start postgresql

   # Windows - Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**:

   ```bash
   createdb courseboxd_dev
   ```

3. **Configure Environment**:

   Copy `.env.example` to `.env` and update:

   ```bash
   cp .env.example .env
   ```

   Set your database URLs:

   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/courseboxd_dev"
   DIRECT_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/courseboxd_dev"
   ```

#### Option B: Supabase (Cloud PostgreSQL)

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project reference and database password
3. Update `.env` with Supabase connection strings (see `.env.example` for format)

### 3. Run Database Migrations

```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Apply migrations
npm run seed:db      # Seed with sample data
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Schema Overview

### Core Entities

- **Users**: User accounts with authentication support
- **Courses**: Course catalog with provider metadata (Udemy, Coursera, etc.)
- **Videos**: Individual video lessons within courses
- **Reviews**: Text reviews for courses/videos
- **Ratings**: Star ratings (0-5 in 0.5 increments)

### Collections & Lists

- **Lists & ListCourses**: User-curated course collections
- **Wishlists & WishlistCourses**: Course wishlists with priorities
- **DiaryEntries & DiaryEntryItems**: Learning journal entries

### Progress Tracking

- **UserCourseStatus**: Track course progress (NOT_STARTED, IN_PROGRESS, COMPLETED, DROPPED)

### Social Features

- **Follow**: User relationships
- **Like**: Likes on reviews, lists, diary entries
- **Comment**: Threaded comments

## Sample Data

After running `npm run seed:db`, you'll have:

- 3 users (alice, bob, carol)
- 2 courses (one from CourseBoxd, one from Udemy)
- 3 videos (YouTube and Vimeo)
- Ratings, reviews, lists, diary entries
- Wishlists with course priorities
- User progress tracking
- Social interactions (followers, likes, comments)

## Available Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run type-check   # TypeScript type checking

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations (dev)
npm run db:deploy    # Deploy migrations (production)
npm run seed:db      # Seed database
```

## Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

**Solution**:

- Verify PostgreSQL is running: `pg_isready`
- Check connection string in `.env`
- For Supabase, verify credentials in dashboard

### Migration Errors

**Error**: `Migration failed`

**Solution**:

```bash
npm run db:migrate reset  # Reset and reapply all migrations
```

### Prisma Client Not Found

**Error**: `Cannot find module '@prisma/client'`

**Solution**:

```bash
npm run db:generate  # Regenerate Prisma client
```

### TypeScript Errors After Schema Changes

**Solution**:

1. Update schema: `packages/database/prisma/schema.prisma`
2. Generate client: `npm run db:generate`
3. Create migration: `npm run db:migrate`
4. Restart your editor's TypeScript server

## Environment Variables

| Variable               | Description                          | Required |
| ---------------------- | ------------------------------------ | -------- |
| `NODE_ENV`             | Environment (development/production) | Yes      |
| `DATABASE_URL`         | Pooled connection for runtime        | Yes      |
| `DIRECT_DATABASE_URL`  | Direct connection for migrations     | Yes      |
| `AUTH_SECRET`          | NextAuth secret key                  | Yes      |
| `NEXT_PUBLIC_APP_NAME` | Application name                     | No       |
| `NEXT_PUBLIC_APP_URL`  | Application URL                      | No       |

See `.env.example` for complete list and examples.

## Project Structure

```
course-boxd/
├── apps/
│   └── web/              # Next.js application
│       ├── src/
│       │   └── app/      # App Router pages
│       └── public/       # Static assets
├── packages/
│   └── database/         # Prisma schema and migrations
│       ├── prisma/
│       │   ├── schema.prisma    # Database schema
│       │   ├── migrations/      # SQL migrations
│       │   └── seed.ts          # Seed script
│       └── src/          # Database utilities
├── .env                  # Environment variables (create from .env.example)
├── .env.example          # Environment template
└── package.json          # Root package config
```

## Next Steps

1. **Explore the Data**: Use Prisma Studio to browse seeded data

   ```bash
   cd packages/database
   npx prisma studio
   ```

2. **Review the Schema**: Check `packages/database/prisma/schema.prisma`

3. **Read Documentation**:
   - Database: `packages/database/README.md`
   - Main README: `README.md`

4. **Start Building**: Create pages in `apps/web/src/app/`

## Contributing

See main `README.md` for contribution guidelines.

## Support

- Documentation: See `packages/database/README.md` for detailed database docs
- Issues: Use the project issue tracker

## License

Private repository - All rights reserved.
