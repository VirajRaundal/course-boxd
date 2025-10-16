"use server";

import { prisma } from "@course-boxd/database";
import { VisibilityPreference } from "@prisma/client";
import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { z } from "zod";

const usernameSchema = z
  .string({ required_error: "Username is required" })
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(24, "Username must be at most 24 characters")
  .regex(/^[a-z0-9_]+$/i, "Use letters, numbers, or underscores only")
  .transform((value) => value.toLowerCase());

const registerSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Enter a valid email address"),
    username: usernameSchema,
    name: z
      .string()
      .trim()
      .min(2, "Display name must be at least 2 characters")
      .max(80, "Display name must be at most 80 characters")
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : null)),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string({ required_error: "Confirm your password" })
      .min(8, "Confirm your password"),
    defaultVisibility: z
      .nativeEnum(VisibilityPreference)
      .default(VisibilityPreference.PUBLIC),
    callbackUrl: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
  callbackUrl: z.string().optional(),
});

export type AuthFormState = {
  errors?: Partial<Record<string, string>>;
};

function safeRedirect(target?: string | null) {
  if (!target) {
    return "/studio";
  }

  if (!target.startsWith("/")) {
    return "/studio";
  }

  return target;
}

export async function registerUser(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const result = registerSchema.safeParse({
    email: formData.get("email"),
    username: formData.get("username"),
    name: formData.get("name"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    defaultVisibility:
      formData.get("defaultVisibility") ?? VisibilityPreference.PUBLIC,
    callbackUrl: formData.get("callbackUrl"),
  });

  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const pathKey = issue.path[0];
      if (typeof pathKey === "string" && !errors[pathKey]) {
        errors[pathKey] = issue.message;
      }
    }

    return { errors };
  }

  const { email, username, name, password, defaultVisibility, callbackUrl } =
    result.data;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return { errors: { email: "An account with this email already exists" } };
    }

    if (existingUser.username === username) {
      return { errors: { username: "This username is already taken" } };
    }

    return { errors: { form: "Account already exists" } };
  }

  const passwordHash = await hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      username,
      name,
      passwordHash,
      defaultVisibility,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError && error.type === "CredentialsSignin") {
      return {
        errors: {
          form: "Account created, please sign in to continue",
        },
      };
    }

    throw error;
  }

  redirect(safeRedirect(callbackUrl));
}

export async function authenticate(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    callbackUrl: formData.get("callbackUrl"),
  });

  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const pathKey = issue.path[0];
      if (typeof pathKey === "string" && !errors[pathKey]) {
        errors[pathKey] = issue.message;
      }
    }

    return { errors };
  }

  const { email, password, callbackUrl } = result.data;

  try {
    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (response?.error) {
      return { errors: { form: "Invalid email or password" } };
    }
  } catch (error) {
    if (error instanceof AuthError && error.type === "CredentialsSignin") {
      return { errors: { form: "Invalid email or password" } };
    }

    throw error;
  }

  redirect(safeRedirect(callbackUrl));
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
