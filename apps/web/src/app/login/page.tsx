import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | CourseBoxd",
};

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-lg space-y-4 rounded-xl border border-border bg-background/70 p-8 shadow-sm">
      <header className="space-y-1 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to access your courses and workspace.
        </p>
      </header>
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Authentication will be handled in a future iteration. For now, this is
          a placeholder to verify routing and layout rendering.
        </p>
      </div>
    </section>
  );
}
