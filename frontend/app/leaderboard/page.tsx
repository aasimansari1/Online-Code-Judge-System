import { api } from '@/lib/api';
import { Trophy, Medal, Award } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  let rows: Awaited<ReturnType<typeof api.leaderboard>>['leaderboard'] = [];
  let error: string | null = null;
  try {
    const res = await api.leaderboard();
    rows = res.leaderboard;
  } catch (e: any) {
    error = e?.message || 'Failed to load leaderboard';
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy size={22} className="text-amber-400" /> Leaderboard
        </h1>
        <p className="text-sm text-fg-muted mt-1">
          Ranked by total score, then problems solved, then average time.
        </p>
      </header>

      {error ? (
        <div className="card p-6 text-sm text-rose-500">{error}</div>
      ) : rows.length === 0 ? (
        <div className="card p-12 text-center text-sm text-fg-muted">
          No submissions yet. Be the first!
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-xs uppercase tracking-wide text-fg-muted">
              <tr>
                <th className="text-left px-4 py-3 w-16">Rank</th>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-right px-4 py-3 w-24">Score</th>
                <th className="text-right px-4 py-3 w-24 hidden sm:table-cell">Solved</th>
                <th className="text-right px-4 py-3 w-24 hidden md:table-cell">Accepted</th>
                <th className="text-right px-4 py-3 w-28 hidden md:table-cell">Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.username} className="border-t border-border hover:bg-bg-subtle/50">
                  <td className="px-4 py-3">
                    <RankCell rank={i + 1} />
                  </td>
                  <td className="px-4 py-3 font-medium">{r.username}</td>
                  <td className="px-4 py-3 text-right font-semibold">{r.score}</td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">{r.problemsSolved}</td>
                  <td className="px-4 py-3 text-right hidden md:table-cell text-fg-muted">
                    {r.accepted}/{r.submissions}
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell text-fg-muted">
                    {r.avgTime ? `${r.avgTime.toFixed(3)}s` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RankCell({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold">
        <Trophy size={14} /> 1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center gap-1.5 text-zinc-400 font-semibold">
        <Medal size={14} /> 2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center gap-1.5 text-orange-400 font-semibold">
        <Award size={14} /> 3
      </span>
    );
  }
  return <span className="text-fg-muted">{rank}</span>;
}
