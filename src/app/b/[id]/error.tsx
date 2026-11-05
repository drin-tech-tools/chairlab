"use client";

import Link from "next/link";

/** The store is unreachable or misconfigured (a missing build renders not-found.tsx instead). */
export default function BuildError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Couldn&apos;t load this build</h1>
      <p className="max-w-sm text-muted-foreground">Saved builds are temporarily unavailable. Try again in a moment.</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-lg px-4 text-sm font-medium ring-1 ring-border hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Start a new build
        </Link>
      </div>
    </main>
  );
}
