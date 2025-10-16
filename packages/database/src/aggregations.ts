import type { PrismaClient } from "@prisma/client";
import { prisma } from "./client";

export type RatingSummary = {
  average: number;
  count: number;
};

const emptySummary: RatingSummary = {
  average: 0,
  count: 0,
};

function normalizeAverage(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (typeof value === "object" && value !== null && "toNumber" in value) {
    try {
      const numeric = (value as { toNumber: () => number }).toNumber();
      return Number.isFinite(numeric) ? numeric : 0;
    } catch (error) {
      console.warn("Unable to convert rating aggregate to number", error);
      return 0;
    }
  }

  return 0;
}

export async function getCourseRatingSummary(
  courseId: string,
  client: PrismaClient = prisma
): Promise<RatingSummary> {
  if (!courseId) {
    return emptySummary;
  }

  const result = await client.courseRating.aggregate({
    _avg: { rating: true },
    _count: true,
    where: { courseId },
  });

  const average = normalizeAverage(result._avg.rating);
  const count = typeof result._count === "number" ? result._count : 0;

  return {
    average,
    count,
  };
}

export async function getCourseAverageRating(
  courseId: string,
  client: PrismaClient = prisma
): Promise<number> {
  const { average } = await getCourseRatingSummary(courseId, client);
  return average;
}

export async function getVideoRatingSummary(
  videoId: string,
  client: PrismaClient = prisma
): Promise<RatingSummary> {
  if (!videoId) {
    return emptySummary;
  }

  const result = await client.videoRating.aggregate({
    _avg: { rating: true },
    _count: true,
    where: { videoId },
  });

  const average = normalizeAverage(result._avg.rating);
  const count = typeof result._count === "number" ? result._count : 0;

  return {
    average,
    count,
  };
}

export async function getVideoAverageRating(
  videoId: string,
  client: PrismaClient = prisma
): Promise<number> {
  const { average } = await getVideoRatingSummary(videoId, client);
  return average;
}
