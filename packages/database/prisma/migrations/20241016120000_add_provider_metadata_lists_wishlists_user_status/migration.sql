-- CreateEnum
CREATE TYPE "VisibilityPreference" AS ENUM ('PUBLIC', 'FOLLOWERS', 'PRIVATE');
CREATE TYPE "CourseStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED');

-- AlterTable: Add authentication fields to User
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT,
ADD COLUMN "emailVerified" TIMESTAMP(3),
ADD COLUMN "defaultVisibility" "VisibilityPreference" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable: Add provider metadata to Courses
ALTER TABLE "Courses" ADD COLUMN "provider" TEXT,
ADD COLUMN "providerUrl" TEXT,
ADD COLUMN "thumbnailUrl" TEXT,
ADD COLUMN "externalId" TEXT;

-- AlterTable: Add provider metadata to Videos
ALTER TABLE "Videos" ADD COLUMN "provider" TEXT,
ADD COLUMN "externalId" TEXT,
ADD COLUMN "thumbnailUrl" TEXT;

-- AlterTable: Remove items JSON field from Lists
ALTER TABLE "Lists" DROP COLUMN "items";

-- CreateTable: ListCourses junction table
CREATE TABLE "ListCourses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListCourses_pkey" PRIMARY KEY ("id")
);

-- CreateTable: DiaryEntryItems
CREATE TABLE "DiaryEntryItems" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "diaryEntryId" UUID NOT NULL,
    "courseId" UUID,
    "videoId" UUID,
    "notes" TEXT,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiaryEntryItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Wishlists
CREATE TABLE "Wishlists" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Wishlist',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable: WishlistCourses junction table
CREATE TABLE "WishlistCourses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "wishlistId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistCourses_pkey" PRIMARY KEY ("id")
);

-- CreateTable: UserCourseStatuses
CREATE TABLE "UserCourseStatuses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "status" "CourseStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCourseStatuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: ListCourses
CREATE UNIQUE INDEX "ListCourses_listId_courseId_key" ON "ListCourses"("listId", "courseId");
CREATE INDEX "ListCourses_listId_idx" ON "ListCourses"("listId");
CREATE INDEX "ListCourses_courseId_idx" ON "ListCourses"("courseId");

-- CreateIndex: DiaryEntryItems
CREATE INDEX "DiaryEntryItems_diaryEntryId_idx" ON "DiaryEntryItems"("diaryEntryId");
CREATE INDEX "DiaryEntryItems_courseId_idx" ON "DiaryEntryItems"("courseId");
CREATE INDEX "DiaryEntryItems_videoId_idx" ON "DiaryEntryItems"("videoId");

-- CreateIndex: Wishlists
CREATE INDEX "Wishlists_userId_idx" ON "Wishlists"("userId");

-- CreateIndex: WishlistCourses
CREATE UNIQUE INDEX "WishlistCourses_wishlistId_courseId_key" ON "WishlistCourses"("wishlistId", "courseId");
CREATE INDEX "WishlistCourses_wishlistId_idx" ON "WishlistCourses"("wishlistId");
CREATE INDEX "WishlistCourses_courseId_idx" ON "WishlistCourses"("courseId");

-- CreateIndex: UserCourseStatuses
CREATE UNIQUE INDEX "UserCourseStatuses_userId_courseId_key" ON "UserCourseStatuses"("userId", "courseId");
CREATE INDEX "UserCourseStatuses_userId_idx" ON "UserCourseStatuses"("userId");
CREATE INDEX "UserCourseStatuses_courseId_idx" ON "UserCourseStatuses"("courseId");
CREATE INDEX "UserCourseStatuses_status_idx" ON "UserCourseStatuses"("status");

-- CreateIndex: Add provider indexes
CREATE INDEX "Courses_provider_idx" ON "Courses"("provider");
CREATE INDEX "Videos_provider_idx" ON "Videos"("provider");

-- AddForeignKey
ALTER TABLE "ListCourses" ADD CONSTRAINT "ListCourses_listId_fkey" FOREIGN KEY ("listId") REFERENCES "Lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ListCourses" ADD CONSTRAINT "ListCourses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaryEntryItems" ADD CONSTRAINT "DiaryEntryItems_diaryEntryId_fkey" FOREIGN KEY ("diaryEntryId") REFERENCES "DiaryEntries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiaryEntryItems" ADD CONSTRAINT "DiaryEntryItems_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DiaryEntryItems" ADD CONSTRAINT "DiaryEntryItems_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlists" ADD CONSTRAINT "Wishlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistCourses" ADD CONSTRAINT "WishlistCourses_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WishlistCourses" ADD CONSTRAINT "WishlistCourses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourseStatuses" ADD CONSTRAINT "UserCourseStatuses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserCourseStatuses" ADD CONSTRAINT "UserCourseStatuses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Accounts (NextAuth)
CREATE TABLE "Accounts" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Accounts_provider_providerAccountId_key" ON "Accounts"("provider", "providerAccountId");

-- CreateTable: Sessions (NextAuth)
CREATE TABLE "Sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Sessions_sessionToken_key" ON "Sessions"("sessionToken");

-- CreateTable: VerificationTokens (NextAuth)
CREATE TABLE "VerificationTokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "VerificationTokens_token_key" ON "VerificationTokens"("token");
CREATE UNIQUE INDEX "VerificationTokens_identifier_token_key" ON "VerificationTokens"("identifier", "token");

-- AddForeignKey for auth tables
ALTER TABLE "Accounts" ADD CONSTRAINT "Accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
