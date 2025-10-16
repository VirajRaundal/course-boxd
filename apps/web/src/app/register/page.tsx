import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VisibilityPreference } from "@prisma/client";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create an account | CourseBoxd",
};

function safeRedirect(target?: string | string[] | null) {
  if (!target || typeof target !== "string") {
    return "/studio";
  }

  return target.startsWith("/") ? target : "/studio";
}

const visibilityOptions = Object.values(VisibilityPreference);

export default async function RegisterPage({
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
    <section className="mx-auto max-w-2xl space-y-6 rounded-xl border border-border bg-background/70 p-8 shadow-sm">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Create your CourseBoxd account
        </h1>
        <p className="text-sm text-muted-foreground">
          Join the community, build courses, and manage your learning hub.
        </p>
      </header>
      <RegisterForm
        callbackUrl={callbackUrl}
        visibilityOptions={visibilityOptions}
      />
    </section>
  );
}
