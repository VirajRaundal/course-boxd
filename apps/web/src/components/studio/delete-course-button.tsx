"use client";

import type { FormEvent } from "react";
import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import type { CourseDeleteState } from "@/actions/courses";
import { deleteCourse } from "@/actions/courses";

const INITIAL_STATE: CourseDeleteState = {};

function DeleteButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex items-center rounded-full border border-red-400 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Deleting..." : label}
    </button>
  );
}

type DeleteCourseButtonProps = {
  courseId: string;
  courseTitle?: string;
};

export function DeleteCourseButton({
  courseId,
  courseTitle,
}: DeleteCourseButtonProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(deleteCourse, INITIAL_STATE);

  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state.redirectTo, router]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (
      !window.confirm(
        `Are you sure you want to delete “${courseTitle ?? "this course"}”?`
      )
    ) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-2">
      <input type="hidden" name="courseId" value={courseId} />
      <DeleteButton label="Delete course" />
      {state.error ? (
        <p className="text-xs text-red-500">{state.error}</p>
      ) : null}
    </form>
  );
}
