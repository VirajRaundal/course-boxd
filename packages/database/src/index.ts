export { prisma } from "./client";
export {
  getCourseAverageRating,
  getCourseRatingSummary,
  getVideoAverageRating,
  getVideoRatingSummary,
} from "./aggregations";
export type { RatingSummary } from "./aggregations";
