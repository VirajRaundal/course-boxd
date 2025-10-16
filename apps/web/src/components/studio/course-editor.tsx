"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import type { CourseFormState } from "@/types/course-form";

const INITIAL_STATE: CourseFormState = { errors: {} };

type CourseEditorAction = (
  prevState: CourseFormState,
  formData: FormData
) => Promise<CourseFormState>;

type CourseEditorVideo = {
  id?: string;
  title?: string | null;
  url?: string | null;
  description?: string | null;
  durationSeconds?: number | null;
  provider?: string | null;
  externalId?: string | null;
  thumbnailUrl?: string | null;
  position?: number | null;
};

type CourseEditorProps = {
  action: CourseEditorAction;
  submitLabel: string;
  initialCourse?: {
    id?: string;
    title?: string | null;
    summary?: string | null;
    description?: string | null;
    provider?: string | null;
    providerUrl?: string | null;
    thumbnailUrl?: string | null;
    externalId?: string | null;
  };
  initialVideos?: CourseEditorVideo[];
};

type VideoDraft = {
  clientId: string;
  id?: string;
  title: string;
  url: string;
  description: string;
  durationSeconds: string;
  provider: string;
  externalId: string;
  thumbnailUrl: string;
};

function createClientId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `video-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function toDraft(video?: CourseEditorVideo): VideoDraft {
  return {
    clientId: video?.id ?? createClientId(),
    id: video?.id,
    title: video?.title ?? "",
    url: video?.url ?? "",
    description: video?.description ?? "",
    durationSeconds:
      typeof video?.durationSeconds === "number"
        ? String(video?.durationSeconds)
        : "",
    provider: video?.provider ?? "",
    externalId: video?.externalId ?? "",
    thumbnailUrl: video?.thumbnailUrl ?? "",
  };
}

function sanitizeText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sanitizeNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function CourseEditor({
  action,
  submitLabel,
  initialCourse,
  initialVideos,
}: CourseEditorProps) {
  const router = useRouter();
  const [state, formAction] = useFormState(action, INITIAL_STATE);
  const [showMessage, setShowMessage] = useState(false);
  const [removedVideoIds, setRemovedVideoIds] = useState<string[]>([]);
  const [videos, setVideos] = useState<VideoDraft[]>(() => {
    if (initialVideos && initialVideos.length > 0) {
      return [...initialVideos]
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((video) => toDraft(video));
    }

    return [toDraft()];
  });

  useEffect(() => {
    if (state.redirectTo) {
      router.push(state.redirectTo);
      return;
    }

    if (state.message) {
      setShowMessage(true);
      const timeout = setTimeout(() => setShowMessage(false), 4000);
      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [state.message, state.redirectTo, router]);

  useEffect(() => {
    if (state.errors?.form) {
      setShowMessage(true);
      const timeout = setTimeout(() => setShowMessage(false), 4000);
      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [state.errors?.form]);

  const videoPayload = useMemo(
    () =>
      videos.map((video, index) => ({
        id: video.id,
        title: video.title.trim(),
        url: video.url.trim(),
        description: sanitizeText(video.description),
        durationSeconds: sanitizeNumber(video.durationSeconds),
        provider: sanitizeText(video.provider),
        externalId: sanitizeText(video.externalId),
        thumbnailUrl: sanitizeText(video.thumbnailUrl),
        position: index + 1,
      })),
    [videos]
  );

  const removedPayload = useMemo(
    () => removedVideoIds.filter(Boolean),
    [removedVideoIds]
  );

  function updateVideo<K extends keyof VideoDraft>(
    index: number,
    key: K,
    value: VideoDraft[K]
  ) {
    setVideos((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  }

  function addVideo() {
    setVideos((prev) => [...prev, toDraft()]);
  }

  function removeVideo(index: number) {
    setVideos((prev) => {
      const target = prev[index];
      if (target?.id) {
        setRemovedVideoIds((ids) =>
          ids.includes(target.id!) ? ids : [...ids, target.id!]
        );
      }

      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [toDraft()];
    });
  }

  function moveVideo(index: number, direction: "up" | "down") {
    setVideos((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }

      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  }

  function getError(key: string) {
    return state.errors?.[key];
  }

  function getVideoError(index: number, field: string) {
    return state.errors?.[`videos[${index}].${field}`];
  }

  return (
    <form action={formAction} className="space-y-8">
      {initialCourse?.id ? (
        <input type="hidden" name="courseId" value={initialCourse.id} />
      ) : null}
      <input
        type="hidden"
        name="videos"
        value={JSON.stringify(videoPayload)}
      />
      <input
        type="hidden"
        name="removedVideoIds"
        value={JSON.stringify(removedPayload)}
      />

      <section className="space-y-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-foreground">
              Course title
            </label>
            <input
              id="title"
              name="title"
              defaultValue={initialCourse?.title ?? ""}
              required
              className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm outline-none ring-primary transition focus:ring"
            />
            {getError("title") ? (
              <p className="text-sm text-red-500">{getError("title")}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="provider" className="text-sm font-medium text-foreground">
              Provider
            </label>
            <input
              id="provider"
              name="provider"
              defaultValue={initialCourse?.provider ?? ""}
              placeholder="CourseBoxd, Udemy, LinkedIn Learning"
              className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm outline-none ring-primary transition focus:ring"
            />
            {getError("provider") ? (
              <p className="text-sm text-red-500">{getError("provider")}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="providerUrl" className="text-sm font-medium text-foreground">
              Provider URL
            </label>
            <input
              id="providerUrl"
              name="providerUrl"
              type="url"
              defaultValue={initialCourse?.providerUrl ?? ""}
              placeholder="https://provider.example/course"
              className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm outline-none ring-primary transition focus:ring"
            />
            {getError("providerUrl") ? (
              <p className="text-sm text-red-500">{getError("providerUrl")}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="thumbnailUrl" className="text-sm font-medium text-foreground">
              Thumbnail URL
            </label>
            <input
              id="thumbnailUrl"
              name="thumbnailUrl"
              type="url"
              defaultValue={initialCourse?.thumbnailUrl ?? ""}
              placeholder="https://images.example.com/course.png"
              className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm outline-none ring-primary transition focus:ring"
            />
            {getError("thumbnailUrl") ? (
              <p className="text-sm text-red-500">{getError("thumbnailUrl")}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="summary" className="text-sm font-medium text-foreground">
              Summary
            </label>
            <textarea
              id="summary"
              name="summary"
              defaultValue={initialCourse?.summary ?? ""}
              rows={3}
              placeholder="Short description shown in listings"
              className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm outline-none ring-primary transition focus:ring"
            />
            {getError("summary") ? (
              <p className="text-sm text-red-500">{getError("summary")}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="externalId" className="text-sm font-medium text-foreground">
              External ID
            </label>
            <input
              id="externalId"
              name="externalId"
              defaultValue={initialCourse?.externalId ?? ""}
              placeholder="catalog-course-001"
              className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm outline-none ring-primary transition focus:ring"
            />
            {getError("externalId") ? (
              <p className="text-sm text-red-500">{getError("externalId")}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-foreground">
            Detailed description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={initialCourse?.description ?? ""}
            rows={5}
            placeholder="Explain what learners will accomplish"
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm outline-none ring-primary transition focus:ring"
          />
          {getError("description") ? (
            <p className="text-sm text-red-500">{getError("description")}</p>
          ) : null}
        </div>
      </section>

      <section id="videos" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Course videos</h2>
            <p className="text-sm text-muted-foreground">
              Add videos in the order learners should complete them.
            </p>
          </div>
          <button
            type="button"
            onClick={addVideo}
            className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary hover:text-secondary-foreground"
          >
            Add video
          </button>
        </div>

        <div className="space-y-4">
          {videos.map((video, index) => (
            <article
              key={video.clientId}
              className="space-y-4 rounded-lg border border-border bg-muted/40 p-4"
            >
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Video {index + 1}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Drag handles coming soon — use the move buttons to reorder.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveVideo(index, "up")}
                    disabled={index === 0}
                    className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition hover:bg-secondary hover:text-secondary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveVideo(index, "down")}
                    disabled={index === videos.length - 1}
                    className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition hover:bg-secondary hover:text-secondary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="inline-flex items-center rounded-full border border-transparent px-3 py-1 text-xs font-medium text-red-500 transition hover:bg-red-500/10"
                  >
                    Remove
                  </button>
                </div>
              </header>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    Title
                  </label>
                  <input
                    value={video.title}
                    onChange={(event) =>
                      updateVideo(index, "title", event.target.value)
                    }
                    required
                    placeholder="Intro to the journey"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-primary transition focus:ring"
                  />
                  {getVideoError(index, "title") ? (
                    <p className="text-xs text-red-500">
                      {getVideoError(index, "title")}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    Video URL
                  </label>
                  <input
                    value={video.url}
                    onChange={(event) =>
                      updateVideo(index, "url", event.target.value)
                    }
                    required
                    placeholder="https://videos.example.com/module"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-primary transition focus:ring"
                  />
                  {getVideoError(index, "url") ? (
                    <p className="text-xs text-red-500">
                      {getVideoError(index, "url")}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    Duration (seconds)
                  </label>
                  <input
                    value={video.durationSeconds}
                    onChange={(event) =>
                      updateVideo(index, "durationSeconds", event.target.value)
                    }
                    type="number"
                    min={0}
                    step={1}
                    placeholder="900"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-primary transition focus:ring"
                  />
                  {getVideoError(index, "durationSeconds") ? (
                    <p className="text-xs text-red-500">
                      {getVideoError(index, "durationSeconds")}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    Provider
                  </label>
                  <input
                    value={video.provider}
                    onChange={(event) =>
                      updateVideo(index, "provider", event.target.value)
                    }
                    placeholder="YouTube, Vimeo"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-primary transition focus:ring"
                  />
                  {getVideoError(index, "provider") ? (
                    <p className="text-xs text-red-500">
                      {getVideoError(index, "provider")}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    External ID
                  </label>
                  <input
                    value={video.externalId}
                    onChange={(event) =>
                      updateVideo(index, "externalId", event.target.value)
                    }
                    placeholder="video-module-01"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-primary transition focus:ring"
                  />
                  {getVideoError(index, "externalId") ? (
                    <p className="text-xs text-red-500">
                      {getVideoError(index, "externalId")}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    Thumbnail URL
                  </label>
                  <input
                    value={video.thumbnailUrl}
                    onChange={(event) =>
                      updateVideo(index, "thumbnailUrl", event.target.value)
                    }
                    placeholder="https://images.example.com/video.png"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-primary transition focus:ring"
                  />
                  {getVideoError(index, "thumbnailUrl") ? (
                    <p className="text-xs text-red-500">
                      {getVideoError(index, "thumbnailUrl")}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">
                  Description
                </label>
                <textarea
                  value={video.description}
                  onChange={(event) =>
                    updateVideo(index, "description", event.target.value)
                  }
                  rows={3}
                  placeholder="What learners will explore in this video"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-primary transition focus:ring"
                />
                {getVideoError(index, "description") ? (
                  <p className="text-xs text-red-500">
                    {getVideoError(index, "description")}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      {state.errors?.form ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.errors.form}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label={submitLabel} />
        {showMessage && state.message ? (
          <span className="text-sm text-muted-foreground">{state.message}</span>
        ) : null}
      </div>
    </form>
  );
}
