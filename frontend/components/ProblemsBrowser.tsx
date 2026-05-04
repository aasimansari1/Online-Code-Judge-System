'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import clsx from 'clsx';
import type { ProblemSummary } from '@/lib/types';
import { DifficultyBadge } from './DifficultyBadge';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'] as const;

export function ProblemsBrowser({
  initialProblems,
  allTags,
}: {
  initialProblems: ProblemSummary[];
  allTags: string[];
}) {
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>('All');
  const [tag, setTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return initialProblems.filter((p) => {
      if (difficulty !== 'All' && p.difficulty !== difficulty) return false;
      if (tag && !p.tags.includes(tag)) return false;
      if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [initialProblems, query, difficulty, tag]);

  return (
    <div className="space-y-5">
      <div className="card p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems by title…"
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-bg-subtle border border-border self-start">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={clsx(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                difficulty === d
                  ? 'bg-bg-card text-fg shadow-sm'
                  : 'text-fg-muted hover:text-fg',
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-fg-muted inline-flex items-center gap-1">
            <Filter size={12} /> Tags:
          </span>
          <button
            onClick={() => setTag(null)}
            className={clsx('tag transition-colors', !tag && 'border-accent/60 text-fg')}
          >
            All
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t === tag ? null : t)}
              className={clsx('tag transition-colors', tag === t && 'border-accent/60 text-fg')}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-subtle text-xs uppercase tracking-wide text-fg-muted">
            <tr>
              <th className="text-left font-medium px-4 py-3 w-12">#</th>
              <th className="text-left font-medium px-4 py-3">Title</th>
              <th className="text-left font-medium px-4 py-3 w-28">Difficulty</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Tags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-fg-muted">
                  No problems match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((p, idx) => (
                <tr
                  key={p.id}
                  className="border-t border-border hover:bg-bg-subtle/60 transition-colors group"
                >
                  <td className="px-4 py-3 text-fg-muted">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/problems/${p.id}`}
                      className="hover:text-accent transition-colors"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <DifficultyBadge value={p.difficulty} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <span key={t} className="tag">{t}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
