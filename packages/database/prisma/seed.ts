import {
  Prisma,
  PrismaClient,
  InteractionTargetType,
  CourseStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.courseRating.deleteMany();
  await prisma.videoRating.deleteMany();
  await prisma.review.deleteMany();
  await prisma.diaryEntryItem.deleteMany();
  await prisma.diaryEntry.deleteMany();
  await prisma.listCourse.deleteMany();
  await prisma.list.deleteMany();
  await prisma.wishlistCourse.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.userCourseStatus.deleteMany();
  await prisma.video.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await clearDatabase();

  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      username: "alice",
      name: "Alice Johnson",
      avatarUrl: "https://example.com/avatars/alice.png",
      bio: "Curriculum designer and lifelong learner.",
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      username: "bobby",
      name: "Bob Hernandez",
      avatarUrl: "https://example.com/avatars/bob.png",
      bio: "Always exploring new frameworks.",
    },
  });

  const carol = await prisma.user.create({
    data: {
      email: "carol@example.com",
      username: "carol",
      name: "Carol Lee",
      avatarUrl: "https://example.com/avatars/carol.png",
      bio: "Documenting my learning journey one course at a time.",
    },
  });

  const fullStackCourse = await prisma.course.create({
    data: {
      slug: "full-stack-foundations",
      title: "Full Stack Foundations",
      summary: "A project-based introduction to full stack development.",
      description:
        "Learn the fundamentals of building full stack applications by shipping features end-to-end.",
      provider: "CourseBoxd",
      providerUrl: "https://courseboxd.app/courses/full-stack-foundations",
      thumbnailUrl: "https://example.com/thumbnails/full-stack.jpg",
      externalId: "fsf-001",
      creatorId: alice.id,
    },
  });

  const reactCourse = await prisma.course.create({
    data: {
      slug: "react-mastery",
      title: "React Mastery",
      summary: "Master React from fundamentals to advanced patterns.",
      description:
        "A comprehensive course covering React hooks, context, performance optimization, and more.",
      provider: "Udemy",
      providerUrl: "https://udemy.com/course/react-mastery",
      thumbnailUrl: "https://example.com/thumbnails/react.jpg",
      externalId: "udemy-react-001",
      creatorId: bob.id,
    },
  });

  const introVideo = await prisma.video.create({
    data: {
      slug: "getting-started-with-foundations",
      title: "Getting Started with Full Stack Foundations",
      description: "Overview of the curriculum and setup instructions.",
      url: "https://videos.example.com/full-stack/getting-started",
      durationSeconds: 720,
      provider: "YouTube",
      externalId: "yt-fsf-intro",
      thumbnailUrl: "https://example.com/thumbnails/intro-video.jpg",
      position: 1,
      courseId: fullStackCourse.id,
      creatorId: alice.id,
    },
  });

  const apiPatternsVideo = await prisma.video.create({
    data: {
      slug: "api-patterns",
      title: "Designing API Patterns",
      description:
        "Dive into designing resilient API boundaries for your project.",
      url: "https://videos.example.com/full-stack/api-patterns",
      durationSeconds: 960,
      provider: "YouTube",
      externalId: "yt-fsf-api",
      thumbnailUrl: "https://example.com/thumbnails/api-video.jpg",
      position: 2,
      courseId: fullStackCourse.id,
      creatorId: alice.id,
    },
  });

  const reactHooksVideo = await prisma.video.create({
    data: {
      slug: "react-hooks-deep-dive",
      title: "React Hooks Deep Dive",
      description: "Understanding useState, useEffect, and custom hooks.",
      url: "https://videos.example.com/react/hooks",
      durationSeconds: 1200,
      provider: "Vimeo",
      externalId: "vimeo-react-hooks",
      thumbnailUrl: "https://example.com/thumbnails/hooks-video.jpg",
      position: 1,
      courseId: reactCourse.id,
      creatorId: bob.id,
    },
  });

  const courseReview = await prisma.review.create({
    data: {
      authorId: bob.id,
      courseId: fullStackCourse.id,
      title: "Fantastic foundation",
      body: "Loved how the course balances theory with real shipping milestones.",
    },
  });

  const videoReview = await prisma.review.create({
    data: {
      authorId: carol.id,
      videoId: apiPatternsVideo.id,
      title: "API section is gold",
      body: "The concrete examples of contract testing were exactly what I needed.",
    },
  });

  const curatedList = await prisma.list.create({
    data: {
      authorId: carol.id,
      title: "Backend Mastery Sprint",
      description: "Courses I revisit when I need a backend refresher.",
    },
  });

  await prisma.listCourse.createMany({
    data: [
      {
        listId: curatedList.id,
        courseId: fullStackCourse.id,
        position: 1,
        notes: "Great for API design patterns",
      },
      {
        listId: curatedList.id,
        courseId: reactCourse.id,
        position: 2,
        notes: "Useful for understanding state management",
      },
    ],
  });

  const diaryEntry = await prisma.diaryEntry.create({
    data: {
      authorId: bob.id,
      courseId: fullStackCourse.id,
      videoId: introVideo.id,
      entryDate: new Date("2024-08-01T13:00:00Z"),
      reflections:
        "Set up the project workspace and deployed the starter app today.",
    },
  });

  await prisma.diaryEntryItem.createMany({
    data: [
      {
        diaryEntryId: diaryEntry.id,
        courseId: fullStackCourse.id,
        position: 1,
        notes: "Completed initial setup",
      },
      {
        diaryEntryId: diaryEntry.id,
        videoId: introVideo.id,
        position: 2,
        notes: "Watched intro and took notes",
      },
    ],
  });

  const diaryEntry2 = await prisma.diaryEntry.create({
    data: {
      authorId: carol.id,
      courseId: reactCourse.id,
      entryDate: new Date("2024-08-05T10:00:00Z"),
      reflections: "Started learning React hooks, very interesting!",
    },
  });

  await prisma.diaryEntryItem.create({
    data: {
      diaryEntryId: diaryEntry2.id,
      videoId: reactHooksVideo.id,
      position: 1,
      notes: "useState and useEffect are powerful",
    },
  });

  await prisma.courseRating.createMany({
    data: [
      {
        userId: bob.id,
        courseId: fullStackCourse.id,
        rating: new Prisma.Decimal(4.5),
      },
      {
        userId: carol.id,
        courseId: fullStackCourse.id,
        rating: new Prisma.Decimal(4.0),
      },
      {
        userId: carol.id,
        courseId: reactCourse.id,
        rating: new Prisma.Decimal(5.0),
      },
    ],
    skipDuplicates: true,
  });

  await prisma.videoRating.createMany({
    data: [
      {
        userId: alice.id,
        videoId: apiPatternsVideo.id,
        rating: new Prisma.Decimal(4.5),
      },
      {
        userId: bob.id,
        videoId: introVideo.id,
        rating: new Prisma.Decimal(5.0),
      },
      {
        userId: carol.id,
        videoId: reactHooksVideo.id,
        rating: new Prisma.Decimal(5.0),
      },
    ],
    skipDuplicates: true,
  });

  await prisma.follow.createMany({
    data: [
      {
        followerId: bob.id,
        followingId: alice.id,
      },
      {
        followerId: carol.id,
        followingId: alice.id,
      },
      {
        followerId: bob.id,
        followingId: carol.id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.like.createMany({
    data: [
      {
        userId: carol.id,
        targetType: InteractionTargetType.REVIEW,
        targetId: courseReview.id,
      },
      {
        userId: alice.id,
        targetType: InteractionTargetType.REVIEW,
        targetId: videoReview.id,
      },
      {
        userId: alice.id,
        targetType: InteractionTargetType.LIST,
        targetId: curatedList.id,
      },
      {
        userId: carol.id,
        targetType: InteractionTargetType.DIARY_ENTRY,
        targetId: diaryEntry.id,
      },
    ],
    skipDuplicates: true,
  });

  const reviewComment = await prisma.comment.create({
    data: {
      userId: carol.id,
      targetType: InteractionTargetType.REVIEW,
      targetId: courseReview.id,
      content: "Loved your breakdown of the pacing!",
    },
  });

  await prisma.comment.create({
    data: {
      userId: alice.id,
      targetType: InteractionTargetType.REVIEW,
      targetId: courseReview.id,
      parentId: reviewComment.id,
      content: "Appreciate the feedback—more deep dives are on the roadmap!",
    },
  });

  await prisma.comment.create({
    data: {
      userId: bob.id,
      targetType: InteractionTargetType.LIST,
      targetId: curatedList.id,
      content: "Adding this list to my weekend study plan!",
    },
  });

  const aliceWishlist = await prisma.wishlist.create({
    data: {
      userId: alice.id,
      name: "Courses to Take",
      description: "My learning wishlist for this year",
    },
  });

  await prisma.wishlistCourse.createMany({
    data: [
      {
        wishlistId: aliceWishlist.id,
        courseId: reactCourse.id,
        priority: 1,
        notes: "Want to learn more about React performance",
      },
    ],
  });

  const bobWishlist = await prisma.wishlist.create({
    data: {
      userId: bob.id,
      name: "My Wishlist",
    },
  });

  await prisma.wishlistCourse.create({
    data: {
      wishlistId: bobWishlist.id,
      courseId: reactCourse.id,
      priority: 2,
      notes: "Recommended by Carol",
    },
  });

  await prisma.userCourseStatus.createMany({
    data: [
      {
        userId: bob.id,
        courseId: fullStackCourse.id,
        status: CourseStatus.IN_PROGRESS,
        progress: 35,
        startedAt: new Date("2024-08-01T10:00:00Z"),
        lastAccessedAt: new Date("2024-08-15T14:30:00Z"),
      },
      {
        userId: carol.id,
        courseId: reactCourse.id,
        status: CourseStatus.IN_PROGRESS,
        progress: 20,
        startedAt: new Date("2024-08-05T09:00:00Z"),
        lastAccessedAt: new Date("2024-08-10T16:00:00Z"),
      },
      {
        userId: alice.id,
        courseId: fullStackCourse.id,
        status: CourseStatus.COMPLETED,
        progress: 100,
        startedAt: new Date("2024-06-01T10:00:00Z"),
        completedAt: new Date("2024-07-15T18:00:00Z"),
        lastAccessedAt: new Date("2024-07-15T18:00:00Z"),
      },
    ],
  });

  console.log(
    "Seeded users, courses, videos, wishlists, user progress, social graph, ratings, and engagement data."
  );
}

main()
  .catch((error) => {
    console.error("Failed to seed database", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
