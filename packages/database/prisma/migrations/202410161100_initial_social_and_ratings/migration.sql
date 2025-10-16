-- Create required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnums
CREATE TYPE "InteractionTargetType" AS ENUM ('REVIEW', 'LIST', 'DIARY_ENTRY');

-- CreateTable: User
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateTable: Courses
CREATE TABLE "Courses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "creatorId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Courses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Courses_slug_key" ON "Courses"("slug");
CREATE INDEX "Courses_creatorId_idx" ON "Courses"("creatorId");

-- CreateTable: Videos
CREATE TABLE "Videos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "courseId" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "durationSeconds" INTEGER,
    "creatorId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Videos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Videos_slug_key" ON "Videos"("slug");
CREATE INDEX "Videos_courseId_idx" ON "Videos"("courseId");
CREATE INDEX "Videos_creatorId_idx" ON "Videos"("creatorId");

-- CreateTable: Reviews
CREATE TABLE "Reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "authorId" UUID NOT NULL,
    "courseId" UUID,
    "videoId" UUID,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Reviews_authorId_idx" ON "Reviews"("authorId");
CREATE INDEX "Reviews_courseId_idx" ON "Reviews"("courseId");
CREATE INDEX "Reviews_videoId_idx" ON "Reviews"("videoId");

-- CreateTable: Lists
CREATE TABLE "Lists" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "authorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "items" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lists_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Lists_authorId_idx" ON "Lists"("authorId");

-- CreateTable: DiaryEntries
CREATE TABLE "DiaryEntries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "authorId" UUID NOT NULL,
    "courseId" UUID,
    "videoId" UUID,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "reflections" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiaryEntries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DiaryEntries_authorId_idx" ON "DiaryEntries"("authorId");
CREATE INDEX "DiaryEntries_courseId_idx" ON "DiaryEntries"("courseId");
CREATE INDEX "DiaryEntries_videoId_idx" ON "DiaryEntries"("videoId");

-- CreateTable: CourseRatings
CREATE TABLE "CourseRatings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "rating" NUMERIC(2, 1) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseRatings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CourseRatings_userId_courseId_key" ON "CourseRatings"("userId", "courseId");
CREATE INDEX "CourseRatings_userId_idx" ON "CourseRatings"("userId");
CREATE INDEX "CourseRatings_courseId_idx" ON "CourseRatings"("courseId");

-- CreateTable: VideoRatings
CREATE TABLE "VideoRatings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "videoId" UUID NOT NULL,
    "rating" NUMERIC(2, 1) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoRatings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VideoRatings_userId_videoId_key" ON "VideoRatings"("userId", "videoId");
CREATE INDEX "VideoRatings_userId_idx" ON "VideoRatings"("userId");
CREATE INDEX "VideoRatings_videoId_idx" ON "VideoRatings"("videoId");

-- CreateTable: Follows
CREATE TABLE "Follows" (
    "followerId" UUID NOT NULL,
    "followingId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Follows_pkey" PRIMARY KEY ("followerId", "followingId")
);

CREATE INDEX "Follows_followingId_idx" ON "Follows"("followingId");

-- CreateTable: Likes
CREATE TABLE "Likes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "targetType" "InteractionTargetType" NOT NULL,
    "targetId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Likes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Likes_userId_targetType_targetId_key" ON "Likes"("userId", "targetType", "targetId");
CREATE INDEX "Likes_targetType_targetId_idx" ON "Likes"("targetType", "targetId");
CREATE INDEX "Likes_userId_idx" ON "Likes"("userId");

-- CreateTable: Comments
CREATE TABLE "Comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "targetType" "InteractionTargetType" NOT NULL,
    "targetId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Comments_targetType_targetId_idx" ON "Comments"("targetType", "targetId");
CREATE INDEX "Comments_parentId_idx" ON "Comments"("parentId");
CREATE INDEX "Comments_userId_idx" ON "Comments"("userId");

-- AddForeignKeys
ALTER TABLE "Courses" ADD CONSTRAINT "Courses_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Videos" ADD CONSTRAINT "Videos_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Videos" ADD CONSTRAINT "Videos_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Lists" ADD CONSTRAINT "Lists_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DiaryEntries" ADD CONSTRAINT "DiaryEntries_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiaryEntries" ADD CONSTRAINT "DiaryEntries_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DiaryEntries" ADD CONSTRAINT "DiaryEntries_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CourseRatings" ADD CONSTRAINT "CourseRatings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseRatings" ADD CONSTRAINT "CourseRatings_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseRatings" ADD CONSTRAINT "CourseRatings_rating_step" CHECK ("rating" >= 0 AND "rating" <= 5 AND floor("rating" * 2) = "rating" * 2);

ALTER TABLE "VideoRatings" ADD CONSTRAINT "VideoRatings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VideoRatings" ADD CONSTRAINT "VideoRatings_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VideoRatings" ADD CONSTRAINT "VideoRatings_rating_step" CHECK ("rating" >= 0 AND "rating" <= 5 AND floor("rating" * 2) = "rating" * 2);

ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Likes" ADD CONSTRAINT "Likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Comments" ADD CONSTRAINT "Comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
