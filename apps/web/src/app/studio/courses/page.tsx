import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listCoursesWithVideoCounts } from "@/lib/course-service";

export const metadata: Metadata = {
  title: "My courses | CourseBoxd",
  description: "Manage the courses you curate and share with learners.",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function StudioCoursesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/studio/courses");
  }

  const courses = await listCoursesWithVideoCounts({
    creatorId: session.user.id,
  });

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Your courses
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Create new programs, keep metadata up to date, and sequence videos
            exactly how you want learners to progress.
          </p>
        </div>
        <Link
          href="/studio/courses/new"
          className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Add a course
        </Link>
      </header>

      {courses.length === 0 ? (
        <div className="space-y-3 rounded-lg border border-dashed border-border bg-muted/40 p-10 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            You haven&apos;t added any courses yet
          </h2>
          <p className="text-sm text-muted-foreground">
            Start by creating your first course and attach videos, metadata, and
            notes for your learners.
          </p>
          <Link
            href="/studio/courses/new"
            className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary hover:text-secondary-foreground"
          >
            Create your first course
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <article
              key={course.id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-background/70 p-6 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {course.title}
                  </h2>
                  {course.provider ? (
                    <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      {course.provider}
                    </span>
                  ) : null}
                </div>
                {course.summary ? (
                  <p className="max-w-xl text-sm text-muted-foreground">
                    {course.summary}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{course._count.videos} videos</span>
                  <span className="hidden text-border md:inline">•</span>
                  <span>
                    Updated {dateFormatter.format(course.updatedAt)}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/studio/courses/${course.slug}`}
                  className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-secondary hover:text-secondary-foreground"
                >
                  View details
                </Link>
                <Link
                  href={`/studio/courses/${course.slug}/edit`}
                  className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Edit course
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
