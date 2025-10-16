import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | CourseBoxd",
  description: "Learn more about CourseBoxd mission and team.",
};

export default function AboutPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          About CourseBoxd
        </h1>
      </header>
      <article className="space-y-4 text-muted-foreground">
        <p>
          CourseBoxd is your launchpad for building and shipping high-quality
          learning experiences. We empower educators, product teams, and
          organizations to create courses that make an impact.
        </p>
        <p>
          Our mission is to make it simple to build and deliver learning
          programs—so you can spend less time configuring platforms and more
          time designing experiences that matter.
        </p>
        <p>
          Whether you are onboarding users, teaching new skills, or enabling
          teams, CourseBoxd gives you the tools to move fast and iterate as you
          grow.
        </p>
      </article>
    </section>
  );
}
