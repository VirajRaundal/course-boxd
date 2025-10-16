import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { updateCourse } from "@/actions/courses";
import { CourseEditor } from "@/components/studio/course-editor";
import { getCourseWithVideosBySlug } from "@/lib/course-service";

export default async function EditCoursePage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/studio/courses/${params.slug}/edit`);
  }

  const course = await getCourseWithVideosBySlug(params.slug);

  if (!course || course.creatorId !== session.user.id) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Edit course
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Update metadata and adjust the order of your videos. Changes go live
            immediately in the public catalog.
          </p>
        </div>
        <Link
          href={`/studio/courses/${course.slug}`}
          className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-secondary hover:text-secondary-foreground"
        >
          Back to details
        </Link>
      </header>
      <CourseEditor
        action={updateCourse}
        submitLabel="Save changes"
        initialCourse={{
          id: course.id,
          title: course.title,
          summary: course.summary,
          description: course.description,
          provider: course.provider,
          providerUrl: course.providerUrl,
          thumbnailUrl: course.thumbnailUrl,
          externalId: course.externalId,
        }}
        initialVideos={course.videos}
      />
    </section>
  );
}
