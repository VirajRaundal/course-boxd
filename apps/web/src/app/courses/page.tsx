import type { Metadata } from "next";
import Link from "next/link";
import { listCoursesWithVideoCounts } from "@/lib/course-service";

export const metadata: Metadata = {
  title: "Courses | CourseBoxd",
  description:
    "Browse curated CourseBoxd programs and discover the right path for your learners.",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function CoursesPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const searchQuery = searchParams?.q ?? "";
  const courses = await listCoursesWithVideoCounts({ search: searchQuery });

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Courses
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Discover in-progress and published programs from the CourseBoxd
            community.
          </p>
        </div>
        <form className="flex flex-wrap items-center gap-3" action="/courses">
          <input
            type="text"
            name="q"
            placeholder="Search by title, summary, or description"
            defaultValue={searchQuery}
            className="grow rounded-md border border-border bg-background px-4 py-2 text-sm outline-none ring-primary transition focus:ring"
          />
          <button
            type="submit"
            className="inline-flex items-center rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary hover:text-secondary-foreground"
          >
            Search
          </button>
        </form>
      </header>

      {courses.length === 0 ? (
        <div className="space-y-3 rounded-lg border border-dashed border-border bg-muted/40 p-10 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            No courses found
          </h2>
          <p className="text-sm text-muted-foreground">
            Try a different search term or explore the manual entry tools in the
            Studio to add new courses.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <article
              key={course.id}
              className="flex h-full flex-col justify-between rounded-lg border border-border bg-background/70 p-6 shadow-sm"
            >
              <div className="space-y-3">
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
                  <p className="text-sm text-muted-foreground">{course.summary}</p>
                ) : null}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{course._count.videos} videos</span>
                  <span className="hidden text-border md:inline">•</span>
                  <span>
                    Updated {dateFormatter.format(course.updatedAt)}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Link
                  href={`/courses/${course.slug}`}
                  className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  View course
                </Link>
                {course.providerUrl ? (
                  <a
                    href={course.providerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-primary underline-offset-4 transition hover:underline"
                  >
                    Visit provider
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
