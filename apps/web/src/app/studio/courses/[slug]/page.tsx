import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCourseWithVideosBySlug } from "@/lib/course-service";
import { DeleteCourseButton } from "@/components/studio/delete-course-button";

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

export default async function StudioCourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/studio/courses/${params.slug}`);
  }

  const course = await getCourseWithVideosBySlug(params.slug);

  if (!course || course.creatorId !== session.user.id) {
    notFound();
  }

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {course.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {course.provider ? (
                <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                  {course.provider}
                </span>
              ) : null}
              <span>
                Updated {dateFormatter.format(course.updatedAt)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/studio/courses/${course.slug}/edit`}
              className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Edit course
            </Link>
            <DeleteCourseButton
              courseId={course.id}
              courseTitle={course.title}
            />
          </div>
        </div>
        {course.summary ? (
          <p className="max-w-3xl text-sm text-muted-foreground">
            {course.summary}
          </p>
        ) : null}
      </header>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <article className="space-y-4 rounded-lg border border-border bg-background/70 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            Course overview
          </h2>
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={`${course.title} thumbnail`}
              className="h-48 w-full rounded-md object-cover"
            />
          ) : null}
          {course.description ? (
            <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
              {course.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Add a detailed description to introduce learners to this course.
            </p>
          )}
        </article>
        <aside className="space-y-4 rounded-lg border border-border bg-muted/40 p-6">
          <h2 className="text-lg font-semibold text-foreground">Metadata</h2>
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
            These details power your public course listings and will inform
            upcoming features like wishlists, custom lists, and learner tracking.
          </div>
        </aside>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Ordered videos
            </h2>
            <p className="text-sm text-muted-foreground">
              Learners will see these videos in the sequence listed below.
            </p>
          </div>
          <Link
            href={`/studio/courses/${course.slug}/edit#videos`}
            className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-secondary hover:text-secondary-foreground"
          >
            Update videos
          </Link>
        </div>
        {course.videos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
            No videos have been added yet. When you create a course, attach at
            least one video to share with learners.
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
                      Open video
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
