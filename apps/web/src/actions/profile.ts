"use server";

import { prisma } from "@course-boxd/database";
import { VisibilityPreference } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { z } from "zod";

export type ProfileFormState = {
  errors?: Partial<Record<string, string>>;
  message?: string;
};

const profileSchema = z.object({
  name: z
    .string({ required_error: "Display name is required" })
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(80, "Display name must be at most 80 characters"),
  avatarUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  defaultVisibility: z.nativeEnum(VisibilityPreference),
});

export async function updateProfile(
  prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { errors: { form: "You must be signed in to update your profile" } };
  }

  const result = profileSchema.safeParse({
    name: formData.get("name"),
    avatarUrl: formData.get("avatarUrl"),
    defaultVisibility: formData.get("defaultVisibility"),
  });

  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !errors[key]) {
        errors[key] = issue.message;
      }
    }

    return { errors };
  }

  const { name, avatarUrl, defaultVisibility } = result.data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      avatarUrl,
      defaultVisibility,
    },
  });

  revalidatePath("/account");

  return { message: "Profile updated" };
}
