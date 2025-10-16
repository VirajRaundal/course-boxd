import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy | CourseBoxd",
};

export default function PrivacyPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Privacy policy
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Transparency is important to us. This page outlines how we handle user
          data and privacy.
        </p>
      </header>
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          The complete privacy policy will be published soon. Until then,
          consider this a placeholder for compliance documentation in the
          production app.
        </p>
        <p>
          We are committed to protecting user data, honoring deletion requests,
          and providing clear communication about how CourseBoxd operates.
        </p>
      </div>
    </section>
  );
}
