"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import {
  createCourseVideo,
  createCourseWithVideos,
  deleteCourseForUser,
  deleteCourseVideo,
  updateCourseVideo,
  updateCourseWithVideos,
  getCourseSlugById,
} from "@/lib/course-service";
import {
  courseInputSchema,
  courseUpdateSchema,
  type CourseInput,
  type CourseUpdateInput,
  type CourseVideoInput,
} from "@/lib/course-schemas";
import type { CourseDeleteState, CourseFormState } from "@/types/course-form";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

type JsonObject = { [key: string]: JsonValue };

type JsonArray = JsonValue[];

function parseJson(value: FormDataEntryValue | null): unknown {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return undefined;
  }
}

function mapZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    if (!issue.path.length) {
      errors.form = issue.message;
      continue;
    }

    const key = issue.path
      .map((segment) =>
        typeof segment === "number" ? `[${segment}]` : `${segment}`
      )
      .join(".")
      .replace(/\.\[/g, "[");

    errors[key] ??= issue.message;
  }

  return errors;
}

function coerceCourseInput(formData: FormData): CourseInput | z.ZodError {
  const rawVideos = parseJson(formData.get("videos"));

  const payload = {
    title: formData.get("title"),
    summary: formData.get("summary") ?? undefined,
    description: formData.get("description") ?? undefined,
    provider: formData.get("provider") ?? undefined,
    providerUrl: formData.get("providerUrl") ?? undefined,
    thumbnailUrl: formData.get("thumbnailUrl") ?? undefined,
    externalId: formData.get("externalId") ?? undefined,
    videos: Array.isArray(rawVideos) ? rawVideos : [],
  } satisfies Partial<CourseInput> & JsonObject;

  const result = courseInputSchema.safeParse(payload);
  return result.success ? result.data : result.error;
}

function coerceCourseUpdateInput(
  formData: FormData
): CourseUpdateInput | z.ZodError {
  const rawVideos = parseJson(formData.get("videos"));
  const removedVideoIds = parseJson(formData.get("removedVideoIds"));

  const payload = {
    title: formData.get("title"),
    summary: formData.get("summary") ?? undefined,
    description: formData.get("description") ?? undefined,
    provider: formData.get("provider") ?? undefined,
    providerUrl: formData.get("providerUrl") ?? undefined,
    thumbnailUrl: formData.get("thumbnailUrl") ?? undefined,
    externalId: formData.get("externalId") ?? undefined,
    videos: Array.isArray(rawVideos) ? rawVideos : [],
    removedVideoIds: Array.isArray(removedVideoIds) ? removedVideoIds : [],
  } satisfies Partial<CourseUpdateInput> & JsonObject;

  const result = courseUpdateSchema.safeParse(payload);
  return result.success ? result.data : result.error;
}

function coerceVideoInput(formData: FormData): CourseVideoInput | z.ZodError {
  const payload = parseJson(formData.get("video"));
  const result = courseUpdateSchema.shape.videos.element.safeParse(payload);
  return result.success ? result.data : result.error;
}

function ensureSessionUserId(userId?: string | null): asserts userId is string {
  if (!userId) {
    throw new Error("You must be signed in to perform this action");
  }
}

function handleCoerceResult<T>(
  value: T | z.ZodError
): { ok: true; data: T } | { ok: false; errors: Record<string, string> } {
  if (value instanceof z.ZodError) {
    return { ok: false, errors: mapZodErrors(value) };
  }

  return { ok: true, data: value };
}

export async function createCourse(
  prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  try {
    const session = await auth();
    ensureSessionUserId(session?.user?.id);

    const result = handleCoerceResult(coerceCourseInput(formData));
    if (!result.ok) {
      return { errors: result.errors };
    }

    const course = await createCourseWithVideos(session.user.id, result.data);

    revalidatePath("/courses");
    revalidatePath("/studio/courses");

    return {
      message: "Course created",
      redirectTo: `/studio/courses/${course.slug}`,
    };
  } catch (error) {
    console.error("Failed to create course", error);
    return {
      errors: { form: "Failed to create course" },
    };
  }
}

const idSchema = z.string().uuid({ message: "Invalid identifier" });

export async function updateCourse(
  prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  try {
    const session = await auth();
    ensureSessionUserId(session?.user?.id);

    const courseId = formData.get("courseId");
    const idResult = idSchema.safeParse(courseId);
    if (!idResult.success) {
      return { errors: { courseId: "Missing course identifier" } };
    }

    const result = handleCoerceResult(coerceCourseUpdateInput(formData));
    if (!result.ok) {
      return { errors: result.errors };
    }

    const course = await updateCourseWithVideos(
      idResult.data,
      session.user.id,
      result.data
    );

    revalidatePath("/courses");
    revalidatePath(`/courses/${course.slug}`);
    revalidatePath("/studio/courses");
    revalidatePath(`/studio/courses/${course.slug}`);

    return {
      message: "Course updated",
      redirectTo: `/studio/courses/${course.slug}`,
    };
  } catch (error) {
    console.error("Failed to update course", error);
    return {
      errors: { form: "Failed to update course" },
    };
  }
}

export async function deleteCourse(
  prevState: CourseDeleteState,
  formData: FormData
): Promise<CourseDeleteState> {
  try {
    const session = await auth();
    ensureSessionUserId(session?.user?.id);

    const courseId = formData.get("courseId");
    const idResult = idSchema.safeParse(courseId);
    if (!idResult.success) {
      return { error: "Missing course identifier" };
    }

    await deleteCourseForUser(idResult.data, session.user.id);

    revalidatePath("/courses");
    revalidatePath("/studio/courses");

    return {
      success: true,
      redirectTo: "/studio/courses",
    };
  } catch (error) {
    console.error("Failed to delete course", error);
    return {
      error: "Failed to delete course",
    };
  }
}

export async function deleteCourseVideoAction(
  prevState: CourseDeleteState,
  formData: FormData
): Promise<CourseDeleteState> {
  try {
    const session = await auth();
    ensureSessionUserId(session?.user?.id);

    const videoId = formData.get("videoId");
    const idResult = idSchema.safeParse(videoId);
    if (!idResult.success) {
      return { error: "Missing video identifier" };
    }

    const { courseSlug } = await deleteCourseVideo(
      idResult.data,
      session.user.id
    );

    revalidatePath("/courses");
    revalidatePath("/studio/courses");

    if (courseSlug) {
      revalidatePath(`/courses/${courseSlug}`);
      revalidatePath(`/studio/courses/${courseSlug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to delete course video", error);
    return { error: "Failed to delete video" };
  }
}

export async function createCourseVideoAction(
  prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  try {
    const session = await auth();
    ensureSessionUserId(session?.user?.id);

    const courseIdResult = idSchema.safeParse(formData.get("courseId"));
    if (!courseIdResult.success) {
      return { errors: { courseId: "Missing course identifier" } };
    }

    const videoResult = handleCoerceResult(coerceVideoInput(formData));
    if (!videoResult.ok) {
      return { errors: videoResult.errors };
    }

    const video = await createCourseVideo(
      courseIdResult.data,
      session.user.id,
      videoResult.data
    );

    revalidatePath("/courses");
    revalidatePath("/studio/courses");

    const courseSlug = await getCourseSlugById(video.courseId);

    if (courseSlug) {
      revalidatePath(`/courses/${courseSlug}`);
      revalidatePath(`/studio/courses/${courseSlug}`);
    }

    return { message: "Video added" };
  } catch (error) {
    console.error("Failed to create course video", error);
    return {
      errors: { form: "Failed to create video" },
    };
  }
}

export async function updateCourseVideoAction(
  prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  try {
    const session = await auth();
    ensureSessionUserId(session?.user?.id);

    const videoIdResult = idSchema.safeParse(formData.get("videoId"));
    if (!videoIdResult.success) {
      return { errors: { videoId: "Missing video identifier" } };
    }

    const videoResult = handleCoerceResult(coerceVideoInput(formData));
    if (!videoResult.ok) {
      return { errors: videoResult.errors };
    }

    const video = await updateCourseVideo(
      videoIdResult.data,
      session.user.id,
      videoResult.data
    );

    revalidatePath("/courses");
    revalidatePath("/studio/courses");

    const courseSlug = await getCourseSlugById(video.courseId);

    if (courseSlug) {
      revalidatePath(`/courses/${courseSlug}`);
      revalidatePath(`/studio/courses/${courseSlug}`);
    }

    return { message: "Video updated" };
  } catch (error) {
    console.error("Failed to update course video", error);
    return {
      errors: { form: "Failed to update video" },
    };
  }
}
