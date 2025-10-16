import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  createCourseWithVideos,
  listCoursesWithVideoCounts,
  type CourseListOptions,
} from "@/lib/course-service";
import { courseInputSchema } from "@/lib/course-schemas";

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

function normalizeQueryValue(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = normalizeQueryValue(url.searchParams.get("q"));
  const provider = normalizeQueryValue(url.searchParams.get("provider"));
  const creatorId = normalizeQueryValue(url.searchParams.get("creatorId"));

  const options: CourseListOptions = {
    search,
    provider,
    creatorId,
  };

  try {
    const courses = await listCoursesWithVideoCounts(options);
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Failed to list courses", error);
    return NextResponse.json(
      { error: "Failed to load courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = courseInputSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", errors: mapZodErrors(result.error) },
      { status: 400 }
    );
  }

  try {
    const course = await createCourseWithVideos(session.user.id, result.data);
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Failed to create course", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
