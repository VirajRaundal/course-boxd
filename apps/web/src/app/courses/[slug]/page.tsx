import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseWithVideosBySlug } from "@/lib/course-service";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) {
    return "—";
  }

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const parts: string[] = [];

  if (hrs) {
    parts.push(`${hrs}h`);
  }

  if (mins) {
    parts.push(`${mins}m`);
  }

  if (!hrs && remainingSeconds) {
    parts.push(`${remainingSeconds}s`);
  }

  return parts.join(" ") || `${seconds}s`;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const course = await getCourseWithVideosBySlug(params.slug);

  if (!course) {
    return {
      title: "Course not found | CourseBoxd",
    };
  }

  return {
    title: `${course.title} | CourseBoxd`,
    description:
      course.summary ??
      "Explore curated learning journeys from the CourseBoxd community.",
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const course = await getCourseWithVideosBySlug(params.slug);

  if (!course) {
    notFound();
  }

  const creatorName = course.creator?.name ?? course.creator?.username ?? "CourseBoxd";

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>By {creatorName}</span>
            <span className="hidden text-border md:inline">•</span>
            <span>Updated {dateFormatter.format(course.updatedAt)}</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {course.title}
          </h1>
          {course.summary ? (
            <p className="max-w-3xl text-sm text-muted-foreground">
              {course.summary}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled
            className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground opacity-70 disabled:cursor-not-allowed"
          >
            Add to wishlist
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground opacity-70 disabled:cursor-not-allowed"
          >
            Add to list
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground opacity-70 disabled:cursor-not-allowed"
          >
            Track progress
          </button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <article className="space-y-4 rounded-lg border border-border bg-background/70 p-6 shadow-sm">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={`${course.title} thumbnail`}
              className="h-56 w-full rounded-md object-cover"
            />
          ) : null}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">About this course</h2>
            {course.description ? (
              <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
                {course.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                This course is still waiting for a detailed description. Check
                back soon!
              </p>
            )}
          </div>
        </article>
        <aside className="space-y-4 rounded-lg border border-border bg-muted/40 p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Course metadata
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Provider</dt>
              <dd className="text-foreground">
                {course.provider ?? <span className="text-muted-foreground">—</span>}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">External ID</dt>
              <dd className="text-foreground">
                {course.externalId ?? <span className="text-muted-foreground">—</span>}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground">Provider URL</dt>
              <dd>
                {course.providerUrl ? (
                  <a
                    href={course.providerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-primary underline-offset-2 transition hover:underline"
                  >
                    {course.providerUrl}
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </dd>
            </div>
          </dl>
          <div className="rounded-lg border border-dashed border-border bg-background/60 p-4 text-sm text-muted-foreground">
            Wishlist, list building, and progress tracking are coming soon.
            Adding courses now helps shape upcoming features.
          </div>
        </aside>
      </div>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Course videos</h2>
          <p className="text-sm text-muted-foreground">
            Explore the full run of videos curated for this programme.
          </p>
        </div>
        {course.videos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
            Videos will appear here once the creator adds them to the course.
          </div>
        ) : (
          <ol className="space-y-3">
            {course.videos.map((video, index) => (
              <li
                key={video.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-background/70 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {video.title}
                      </p>
                      {video.provider ? (
                        <p className="text-xs text-muted-foreground">
                          {video.provider}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {video.description ? (
                    <p className="text-sm text-muted-foreground">
                      {video.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>Duration: {formatDuration(video.durationSeconds)}</span>
                  {video.url ? (
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-medium text-primary underline-offset-4 transition hover:underline"
                    >
                      Watch
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}
