import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  createCourseVideo,
  getCourseWithVideosBySlug,
} from "@/lib/course-service";
import { videoInputSchema } from "@/lib/course-schemas";

function mapZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path
      .map((segment) =>
        typeof segment === "number" ? `[${segment}]` : `${segment}`
      )
      .join(".")
      .replace(/\.\[/g, "[");

    errors[key || "form"] = issue.message;
  }

  return errors;
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const course = await getCourseWithVideosBySlug(params.slug);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course.videos);
  } catch (error) {
    console.error("Failed to load course videos", error);
    return NextResponse.json(
      { error: "Failed to load videos" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const course = await getCourseWithVideosBySlug(params.slug);

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (course.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = videoInputSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", errors: mapZodErrors(result.error) },
      { status: 400 }
    );
  }

  try {
    const video = await createCourseVideo(
      course.id,
      session.user.id,
      result.data
    );

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Failed to create video", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}
