import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createCourse } from "@/actions/courses";
import { CourseEditor } from "@/components/studio/course-editor";

export const metadata: Metadata = {
  title: "Add a course | CourseBoxd",
  description: "Manually add a course and attach ordered videos.",
};

export default async function NewCoursePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/studio/courses/new");
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Add a course
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Capture provider details, write a concise summary, and attach the
          videos your learners will follow.
        </p>
      </header>
      <CourseEditor action={createCourse} submitLabel="Create course" />
    </section>
  );
}
