import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="max-w-3xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CourseBoxd
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Your launchpad for building and shipping high-quality learning
            experiences. Create, manage, and share courses with ease.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/courses"
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition hover:bg-primary/90 sm:w-auto"
          >
            Explore Courses
          </Link>
          <Link
            href="/studio"
            className="inline-flex w-full items-center justify-center rounded-full border border-border px-8 py-4 text-base font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground sm:w-auto"
          >
            Get Started
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 pt-12 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/40 p-6">
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Build
            </h3>
            <p className="text-sm text-muted-foreground">
              Create engaging courses with our intuitive studio tools and
              templates.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-6">
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Manage
            </h3>
            <p className="text-sm text-muted-foreground">
              Organize content, track progress, and manage learners all in one
              place.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-6">
            <h3 className="mb-2 text-lg font-semibold text-foreground">Ship</h3>
            <p className="text-sm text-muted-foreground">
              Publish courses quickly and share them with your audience
              instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
