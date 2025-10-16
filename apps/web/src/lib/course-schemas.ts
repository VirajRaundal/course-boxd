import { z } from "zod";

function isValidUrl(value: string): boolean {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return Boolean(url.protocol && url.host);
  } catch (error) {
    return false;
  }
}

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || isValidUrl(value), {
    message: "Enter a valid URL",
  })
  .transform((value) => {
    if (!value) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

const optionalIdentifier = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

const durationSchema = z
  .union([
    z
      .number({ invalid_type_error: "Duration must be a number" })
      .int("Duration must be a whole number of seconds")
      .min(1, "Duration must be at least one second"),
    z.null(),
    z.undefined(),
  ])
  .transform((value) => {
    if (typeof value === "number") {
      return value;
    }

    return null;
  });

export const videoInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string({ required_error: "Video title is required" })
    .trim()
    .min(3, "Video title must be at least 3 characters"),
  description: optionalText,
  url: z
    .string({ required_error: "Video URL is required" })
    .trim()
    .refine((value) => isValidUrl(value), {
      message: "Enter a valid URL",
    }),
  durationSeconds: durationSchema,
  provider: optionalText,
  externalId: optionalIdentifier,
  thumbnailUrl: optionalUrl,
  position: z
    .union([
      z
        .number({ invalid_type_error: "Position must be a number" })
        .int("Position must be a whole number")
        .min(1, "Position must be at least 1"),
      z.undefined(),
      z.null(),
    ])
    .transform((value) => {
      if (typeof value === "number") {
        return value;
      }

      return undefined;
    }),
});

export const courseInputSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(3, "Title must be at least 3 characters"),
  summary: optionalText,
  description: optionalText,
  provider: optionalText,
  providerUrl: optionalUrl,
  thumbnailUrl: optionalUrl,
  externalId: optionalIdentifier,
  videos: z.array(videoInputSchema).default([]),
});

export const courseUpdateSchema = courseInputSchema.extend({
  removedVideoIds: z.array(z.string().uuid()).optional(),
});

export type CourseInput = z.infer<typeof courseInputSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
export type CourseVideoInput = z.infer<typeof videoInputSchema>;
