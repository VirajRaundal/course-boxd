import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Studio | CourseBoxd",
  description: "Design and build courses with CourseBoxd Studio.",
};

export default async function StudioPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/studio");
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Studio
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Shape curricula, organise lessons, and publish beautiful learning
          experiences without leaving CourseBoxd.
        </p>
      </header>
      <div className="space-y-4 rounded-lg border border-border bg-muted/40 p-8">
        <div className="space-y-2 text-center">
          <p className="text-lg font-semibold text-foreground">
            Manual course entry is ready
          </p>
          <p className="text-sm text-muted-foreground">
            Create courses, capture provider metadata, and attach videos in the
            exact order learners should follow.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/studio/courses"
            className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Manage courses
          </Link>
          <Link
            href="/studio/courses/new"
            className="inline-flex items-center rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary hover:text-secondary-foreground"
          >
            Add a course
          </Link>
        </div>
      </div>
      <div className="space-y-3 rounded-lg border border-dashed border-border bg-background/50 p-8 text-center">
        <p className="font-medium text-foreground">
          Visual sequencing, assessments, and publishing tools are on the
          roadmap.
        </p>
        <p className="text-sm text-muted-foreground">
          We&apos;re actively building drag-and-drop workflows, collaborative
          editing, and launch tracking. Stay tuned!
        </p>
      </div>
    </section>
  );
}
