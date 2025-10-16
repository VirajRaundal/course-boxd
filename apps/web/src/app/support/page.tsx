import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | CourseBoxd",
};

export default function SupportPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Support
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Need help? Our team is here to support you as you build courses with
          CourseBoxd.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-muted/40 p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Documentation
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse how-to guides and best practices (coming soon).
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/40 p-6">
          <h2 className="text-lg font-semibold text-foreground">Contact us</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reach out at support@courseboxd.com and we’ll get back to you within
            one business day.
          </p>
        </div>
      </div>
    </section>
  );
}
