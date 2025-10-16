import { Prisma, PrismaClient, InteractionTargetType } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.courseRating.deleteMany();
  await prisma.videoRating.deleteMany();
  await prisma.review.deleteMany();
  await prisma.diaryEntry.deleteMany();
  await prisma.list.deleteMany();
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
      creatorId: alice.id,
    },
  });

  const introVideo = await prisma.video.create({
    data: {
      slug: "getting-started-with-foundations",
      title: "Getting Started with Full Stack Foundations",
      description: "Overview of the curriculum and setup instructions.",
      url: "https://videos.example.com/full-stack/getting-started",
      durationSeconds: 720,
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
      courseId: fullStackCourse.id,
      creatorId: alice.id,
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
      description: "Chapters I revisit when I need a backend refresher.",
      items: {
        videos: [introVideo.id, apiPatternsVideo.id],
      },
    },
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

  console.log("Seeded users, social graph, ratings, and engagement data.");
}

main()
  .catch((error) => {
    console.error("Failed to seed database", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
