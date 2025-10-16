import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses | CourseBoxd",
  description:
    "Browse curated CourseBoxd programs and discover the right path for your learners.",
};

export default function CoursesPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Courses
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Preview featured courses and explore what CourseBoxd makes possible
          for modern learning teams.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {[
          "Product Onboarding",
          "AI Fundamentals",
          "Leadership Lab",
          "Support Enablement",
        ].map((course) => (
          <article
            key={course}
            className="rounded-lg border border-border bg-background/70 p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-foreground">{course}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Build a complete learning journey with modular lessons, in-depth
              assessments, and learner analytics.
            </p>
            <div className="mt-4 inline-flex items-center text-sm font-medium text-primary">
              View syllabus
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
