import { api } from '@/lib/api';
import { ProblemsBrowser } from '@/components/ProblemsBrowser';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let initialProblems: Awaited<ReturnType<typeof api.problems.list>> | null = null;
  let error: string | null = null;
  try {
    initialProblems = await api.problems.list();
  } catch (e: any) {
    error = e?.message || 'Failed to reach the backend';
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="card p-6 sm:p-10 bg-gradient-to-br from-bg-card to-bg-subtle">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Solve coding challenges. Climb the leaderboard.
        </h1>
        <p className="mt-3 text-fg-muted max-w-2xl">
          Pick a problem, write your solution in C++, Java, Python, or JavaScript, and let the
          judge run it against the test suite. No login required — just enter a name when you
          submit.
        </p>
      </section>

      {error ? (
        <div className="card p-6 text-sm text-rose-500">
          <p className="font-semibold">Backend unreachable</p>
          <p className="mt-1 text-fg-muted">
            {error}. Start the backend with <code className="font-mono">npm run dev</code> in the
            <code className="font-mono"> backend/</code> folder.
          </p>
        </div>
      ) : initialProblems ? (
        <ProblemsBrowser
          initialProblems={initialProblems.problems}
          allTags={initialProblems.tags}
        />
      ) : null}
    </div>
  );
}
