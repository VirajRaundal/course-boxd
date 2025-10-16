"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateProfile, type ProfileFormState } from "@/actions/profile";

const INITIAL_STATE: ProfileFormState = { errors: {} };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Saving..." : "Save changes"}
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

type ProfileFormProps = {
  user: {
    name: string | null;
    avatarUrl: string | null;
    defaultVisibility: string;
  };
  visibilityOptions: string[];
};

export function ProfileForm({ user, visibilityOptions }: ProfileFormProps) {
  const [state, formAction] = useFormState(updateProfile, INITIAL_STATE);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (state.message) {
      setShowMessage(true);
      const timeout = setTimeout(() => setShowMessage(false), 4000);
      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [state.message]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Display name
          </label>
          <input
            id="name"
            name="name"
            defaultValue={user.name ?? ""}
            required
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm outline-none ring-primary transition focus:ring"
          />
          {state.errors?.name && (
            <p className="text-sm text-red-500">{state.errors.name}</p>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="avatarUrl"
            className="text-sm font-medium text-foreground"
          >
            Avatar URL
          </label>
          <input
            id="avatarUrl"
            name="avatarUrl"
            type="url"
            placeholder="https://example.com/avatar.png"
            defaultValue={user.avatarUrl ?? ""}
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm outline-none ring-primary transition focus:ring"
          />
          {state.errors?.avatarUrl && (
            <p className="text-sm text-red-500">{state.errors.avatarUrl}</p>
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
          defaultValue={user.defaultVisibility}
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

      <div className="flex items-center gap-3">
        <SubmitButton />
        {showMessage && state.message ? (
          <span className="text-sm text-foreground">{state.message}</span>
        ) : null}
      </div>
    </form>
  );
}
