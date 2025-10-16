import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@course-boxd/database";
import {
  deleteCourseVideo,
  getCourseSlugById,
  updateCourseVideo,
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
  { params }: { params: { videoId: string } }
) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: params.videoId },
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error("Failed to fetch video", error);
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { videoId: string } }
) {
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

  const result = videoInputSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", errors: mapZodErrors(result.error) },
      { status: 400 }
    );
  }

  try {
    const video = await updateCourseVideo(
      params.videoId,
      session.user.id,
      result.data
    );

    const courseSlug = await getCourseSlugById(video.courseId);

    return NextResponse.json({ ...video, courseSlug });
  } catch (error) {
    console.error("Failed to update video", error);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { videoId: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await deleteCourseVideo(params.videoId, session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to delete video", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
