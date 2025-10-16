import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VisibilityPreference } from "@prisma/client";
import { prisma } from "@course-boxd/database";
import { auth } from "@/auth";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata: Metadata = {
  title: "Account settings | CourseBoxd",
  description: "Manage your profile details and visibility preferences.",
};

const visibilityOptions = Object.values(VisibilityPreference);

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      avatarUrl: true,
      defaultVisibility: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Account settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Update your profile information and choose who can view your activity
          by default.
        </p>
      </header>
      <ProfileForm user={user} visibilityOptions={visibilityOptions} />
    </section>
  );
}
