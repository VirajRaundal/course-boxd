import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the waitlist | CourseBoxd",
};

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-lg space-y-4 rounded-xl border border-border bg-background/70 p-8 shadow-sm">
      <header className="space-y-1 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Join the waitlist
        </h1>
        <p className="text-sm text-muted-foreground">
          Be the first to know when CourseBoxd launches.
        </p>
      </header>
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Registration flow coming soon. This is a placeholder page to confirm
          routing and layout structure are working.
        </p>
      </div>
    </section>
  );
}
