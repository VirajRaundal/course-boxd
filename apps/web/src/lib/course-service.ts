import { prisma } from "@course-boxd/database";
import type { Prisma } from "@prisma/client";
import { slugifyWithFallback } from "@/lib/slug";
import {
  courseInputSchema,
  courseUpdateSchema,
  type CourseInput,
  type CourseUpdateInput,
  type CourseVideoInput,
} from "@/lib/course-schemas";

export type CourseWithVideos = Prisma.CourseGetPayload<{
  include: {
    videos: true;
  };
}>;

export type CourseListOptions = {
  search?: string;
  creatorId?: string;
  provider?: string;
};

const MAX_SLUG_ATTEMPTS = 50;

type SlugEntity = "course" | "video";

async function ensureUniqueSlug(
  baseTitle: string,
  entity: SlugEntity,
  excludeId?: string
): Promise<string> {
  const baseSlug = slugifyWithFallback(baseTitle);
  let candidate = baseSlug;
  let attempt = 1;

  while (attempt <= MAX_SLUG_ATTEMPTS) {
    const existing =
      entity === "course"
        ? await prisma.course.findUnique({
            where: { slug: candidate },
            select: { id: true },
          })
        : await prisma.video.findUnique({
            where: { slug: candidate },
            select: { id: true },
          });

    if (!existing || existing.id === excludeId) {
      return candidate;
    }

    attempt += 1;
    candidate = `${baseSlug}-${attempt}`;
  }

  throw new Error("Unable to generate a unique slug");
}

export async function createCourseWithVideos(
  userId: string,
  rawInput: CourseInput
): Promise<CourseWithVideos> {
  const input = courseInputSchema.parse(rawInput);

  const slug = await ensureUniqueSlug(input.title, "course");
  const videosData = await Promise.all(
    input.videos.map(async (video, index) => {
      const videoSlug = await ensureUniqueSlug(video.title, "video");

      return {
        slug: videoSlug,
        title: video.title,
        description: video.description,
        url: video.url,
        durationSeconds:
          typeof video.durationSeconds === "number"
            ? video.durationSeconds
            : null,
        provider: video.provider,
        externalId: video.externalId,
        thumbnailUrl: video.thumbnailUrl,
        position: video.position ?? index + 1,
        creatorId: userId,
      };
    })
  );

  const course = await prisma.course.create({
    data: {
      slug,
      title: input.title,
      summary: input.summary,
      description: input.description,
      provider: input.provider,
      providerUrl: input.providerUrl,
      thumbnailUrl: input.thumbnailUrl,
      externalId: input.externalId,
      creatorId: userId,
      videos:
        videosData.length > 0
          ? {
              create: videosData,
            }
          : undefined,
    },
    include: {
      videos: {
        orderBy: { position: "asc" },
      },
    },
  });

  return course;
}

async function assertCourseOwnership(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, creatorId: true },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  if (course.creatorId !== userId) {
    throw new Error("You do not have permission to modify this course");
  }
}

export async function updateCourseWithVideos(
  courseId: string,
  userId: string,
  rawInput: CourseUpdateInput
): Promise<CourseWithVideos> {
  const input = courseUpdateSchema.parse(rawInput);

  await assertCourseOwnership(courseId, userId);

  const existingVideos = await prisma.video.findMany({
    where: { courseId },
    select: { id: true, title: true },
  });
  const existingVideoIds = new Set(existingVideos.map((video) => video.id));

  const slug = await ensureUniqueSlug(input.title, "course", courseId);
  const removedVideoIds = input.removedVideoIds ?? [];
  const updates = input.videos ?? [];

  await prisma.$transaction(async (tx) => {
    await tx.course.update({
      where: { id: courseId },
      data: {
        slug,
        title: input.title,
        summary: input.summary,
        description: input.description,
        provider: input.provider,
        providerUrl: input.providerUrl,
        thumbnailUrl: input.thumbnailUrl,
        externalId: input.externalId,
      },
    });

    if (removedVideoIds.length > 0) {
      await tx.video.deleteMany({
        where: {
          id: { in: removedVideoIds },
          courseId,
        },
      });
    }

    for (const [index, video] of updates.entries()) {
      const position = video.position ?? index + 1;

      if (video.id) {
        if (!existingVideoIds.has(video.id)) {
          throw new Error("Video does not belong to this course");
        }

        const videoSlug = await ensureUniqueSlug(
          video.title,
          "video",
          video.id
        );

        await tx.video.update({
          where: { id: video.id },
          data: {
            slug: videoSlug,
            title: video.title,
            description: video.description,
            url: video.url,
            durationSeconds:
              typeof video.durationSeconds === "number"
                ? video.durationSeconds
                : null,
            provider: video.provider,
            externalId: video.externalId,
            thumbnailUrl: video.thumbnailUrl,
            position,
          },
        });
      } else {
        const videoSlug = await ensureUniqueSlug(video.title, "video");

        await tx.video.create({
          data: {
            courseId,
            creatorId: userId,
            slug: videoSlug,
            title: video.title,
            description: video.description,
            url: video.url,
            durationSeconds:
              typeof video.durationSeconds === "number"
                ? video.durationSeconds
                : null,
            provider: video.provider,
            externalId: video.externalId,
            thumbnailUrl: video.thumbnailUrl,
            position,
          },
        });
      }
    }
  });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      videos: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course) {
    throw new Error("Course not found after update");
  }

  return course;
}

export async function deleteCourseForUser(courseId: string, userId: string) {
  await assertCourseOwnership(courseId, userId);

  await prisma.course.delete({
    where: { id: courseId },
  });
}

export async function createCourseVideo(
  courseId: string,
  userId: string,
  rawInput: CourseVideoInput
) {
  const input = courseUpdateSchema.shape.videos.element.parse(rawInput);

  await assertCourseOwnership(courseId, userId);

  const slug = await ensureUniqueSlug(input.title, "video");
  const maxPosition = await prisma.video.aggregate({
    where: { courseId },
    _max: { position: true },
  });
  const nextPosition = (maxPosition._max.position ?? 0) + 1;

  return prisma.video.create({
    data: {
      courseId,
      creatorId: userId,
      slug,
      title: input.title,
      description: input.description,
      url: input.url,
      durationSeconds:
        typeof input.durationSeconds === "number"
          ? input.durationSeconds
          : null,
      provider: input.provider,
      externalId: input.externalId,
      thumbnailUrl: input.thumbnailUrl,
      position: input.position ?? nextPosition,
    },
  });
}

export async function updateCourseVideo(
  videoId: string,
  userId: string,
  rawInput: CourseVideoInput
) {
  const input = courseUpdateSchema.shape.videos.element.parse(rawInput);

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: { id: true, courseId: true, course: { select: { creatorId: true } } },
  });

  if (!video) {
    throw new Error("Video not found");
  }

  if (video.course.creatorId !== userId) {
    throw new Error("You do not have permission to modify this video");
  }

  const slug = await ensureUniqueSlug(input.title, "video", videoId);

  return prisma.video.update({
    where: { id: videoId },
    data: {
      slug,
      title: input.title,
      description: input.description,
      url: input.url,
      durationSeconds:
        typeof input.durationSeconds === "number"
          ? input.durationSeconds
          : null,
      provider: input.provider,
      externalId: input.externalId,
      thumbnailUrl: input.thumbnailUrl,
      position: input.position ?? undefined,
    },
  });
}

export async function deleteCourseVideo(videoId: string, userId: string) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: {
      id: true,
      courseId: true,
      course: { select: { creatorId: true, slug: true } },
    },
  });

  if (!video) {
    throw new Error("Video not found");
  }

  if (video.course.creatorId !== userId) {
    throw new Error("You do not have permission to delete this video");
  }

  await prisma.video.delete({
    where: { id: videoId },
  });

  return { courseId: video.courseId, courseSlug: video.course.slug };
}

export async function getCourseWithVideosBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      videos: {
        orderBy: { position: "asc" },
      },
      creator: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });
}

export async function getCourseSlugById(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { slug: true },
  });

  return course?.slug ?? null;
}

export async function listCoursesWithVideoCounts(
  options: CourseListOptions = {}
) {
  const { search, creatorId, provider } = options;

  const where: Prisma.CourseWhereInput = {};

  if (search) {
    const query = search.trim();
    if (query.length > 0) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }
  }

  if (creatorId) {
    where.creatorId = creatorId;
  }

  if (provider) {
    where.provider = provider;
  }

  return prisma.course.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { videos: true },
      },
    },
  });
}
