import Link from "next/link";

export default function BuildNotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Build not found</h1>
      <p className="max-w-sm text-muted-foreground">This link doesn&apos;t match a saved chair. It may be mistyped.</p>
      <Link
        href="/"
        className="inline-flex h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Start a new build
      </Link>
    </main>
  );
}
