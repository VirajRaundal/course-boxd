import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in | CourseBoxd",
};

function safeRedirect(target?: string | string[] | null) {
  if (!target || typeof target !== "string") {
    return "/studio";
  }

  return target.startsWith("/") ? target : "/studio";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const session = await auth();
  const callbackUrl = searchParams?.callbackUrl;

  if (session?.user) {
    redirect(safeRedirect(callbackUrl));
  }

  return (
    <section className="mx-auto max-w-lg space-y-6 rounded-xl border border-border bg-background/70 p-8 shadow-sm">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to access your courses and workspace.
        </p>
      </header>
      <LoginForm callbackUrl={callbackUrl} />
    </section>
  );
}
