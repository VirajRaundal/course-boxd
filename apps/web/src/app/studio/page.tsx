import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio | CourseBoxd",
  description: "Design and build courses with CourseBoxd Studio.",
};

export default function StudioPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Studio
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          A visual editor for creating learning content, building course
          workflows, and managing everything from drafts to published content.
        </p>
      </header>
      <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-8 text-center">
        <p className="font-medium text-foreground">
          Studio workspace coming soon
        </p>
        <p className="text-sm text-muted-foreground">
          Start building courses with drag-and-drop lessons, inline assessments,
          and rich media.
        </p>
      </div>
    </section>
  );
}
