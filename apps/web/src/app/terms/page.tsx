import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | CourseBoxd",
};

export default function TermsPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Terms of Service
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          The terms that govern the use of CourseBoxd as a service.
        </p>
      </header>
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Terms of Service documentation is in progress and will be added before
          public launch. This is a routing placeholder for now.
        </p>
        <p>
          Our focus is building fair, clear agreements that respect both users
          and the platform as we grow.
        </p>
      </div>
    </section>
  );
}
