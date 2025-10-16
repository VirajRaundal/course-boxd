import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { auth } from "@/auth";
import { signOutAction } from "@/actions/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CourseBoxd",
  description:
    "CourseBoxd is your launchpad for building and shipping high-quality learning experiences.",
};

const navItems = [
  { href: "/courses", label: "Courses" },
  { href: "/studio", label: "Studio" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="bg-background text-foreground">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold text-primary transition-colors hover:text-primary/80"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  CB
                </span>
                <span>CourseBoxd</span>
              </Link>
              <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              {session?.user ? (
                <div className="flex items-center gap-3">
                  <span className="hidden text-sm text-muted-foreground sm:inline-flex">
                    {session.user.name ?? session.user.username}
                  </span>
                  <Link
                    href="/account"
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground"
                  >
                    Account
                  </Link>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </header>
          <main className="relative flex-1">
            <div className="mx-auto flex h-full w-full max-w-6xl flex-1 flex-col px-6 py-12">
              {children}
            </div>
          </main>
          <footer className="border-t border-border bg-muted/40 py-8 text-sm text-muted-foreground">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 md:flex-row md:items-center md:justify-between">
              <p>
                © {new Date().getFullYear()} CourseBoxd. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-foreground">
                  Terms
                </Link>
                <Link href="/support" className="hover:text-foreground">
                  Support
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
