"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { registerUser, type AuthFormState } from "@/actions/auth";

const INITIAL_STATE: AuthFormState = { errors: {} };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Creating account..." : "Create account"}
    </button>
  );
}

function formatVisibility(value: string) {
  switch (value) {
    case "FOLLOWERS":
      return "Followers";
    case "PRIVATE":
      return "Private";
    default:
      return "Public";
  }
}

export function RegisterForm({
  callbackUrl,
  visibilityOptions,
}: {
  callbackUrl?: string;
  visibilityOptions: string[];
}) {
  const [state, formAction] = useFormState(registerUser, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Display name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm outline-none ring-primary transition focus:ring"
          />
          {state.errors?.name && (
            <p className="text-sm text-red-500">{state.errors.name}</p>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="username"
            className="text-sm font-medium text-foreground"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="username"
            required
            autoComplete="username"
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm outline-none ring-primary transition focus:ring"
          />
          {state.errors?.username && (
            <p className="text-sm text-red-500">{state.errors.username}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm outline-none ring-primary transition focus:ring"
        />
        {state.errors?.email && (
          <p className="text-sm text-red-500">{state.errors.email}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm outline-none ring-primary transition focus:ring"
          />
          {state.errors?.password && (
            <p className="text-sm text-red-500">{state.errors.password}</p>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-foreground"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm outline-none ring-primary transition focus:ring"
          />
          {state.errors?.confirmPassword && (
            <p className="text-sm text-red-500">
              {state.errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="defaultVisibility"
          className="text-sm font-medium text-foreground"
        >
          Default visibility
        </label>
        <select
          id="defaultVisibility"
          name="defaultVisibility"
          defaultValue={visibilityOptions[0] ?? "PUBLIC"}
          className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm outline-none ring-primary transition focus:ring"
        >
          {visibilityOptions.map((value) => (
            <option key={value} value={value}>
              {formatVisibility(value)}
            </option>
          ))}
        </select>
        {state.errors?.defaultVisibility && (
          <p className="text-sm text-red-500">
            {state.errors.defaultVisibility}
          </p>
        )}
      </div>

      {state.errors?.form && (
        <p className="text-sm text-red-500">{state.errors.form}</p>
      )}

      <SubmitButton />

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in instead
        </Link>
        .
      </p>
    </form>
  );
}
