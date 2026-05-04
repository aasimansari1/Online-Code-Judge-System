'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Play, Send, RefreshCw, History } from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';

import type { LanguageOption, Problem, RunResponse, SubmitResponse } from '@/lib/types';
import { api, local } from '@/lib/api';
import { starterFor } from '@/lib/starter';
import { CodeEditor } from './CodeEditor';
import { Markdown } from './Markdown';
import { DifficultyBadge } from './DifficultyBadge';
import { Verdict } from './Verdict';

type Tab = 'description' | 'samples' | 'history';

const STORAGE_PREFIX = 'cj_code_v1::';

function codeKey(problemId: string, lang: string) {
  return `${STORAGE_PREFIX}${problemId}::${lang}`;
}

export function ProblemWorkspace({
  problem,
  languages,
}: {
  problem: Problem;
  languages: LanguageOption[];
}) {
  const [language, setLanguage] = useState<string>(languages[0]?.key || 'cpp');
  const [source, setSource] = useState<string>('');
  const [tab, setTab] = useState<Tab>('description');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<RunResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitResponse | null>(null);
  const [username, setUsername] = useState('');
  const [history, setHistory] = useState<ReturnType<typeof local.getHistory>>([]);
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => {
    setUsername(local.getName());
    setHistory(local.getHistory().filter((h) => h.problemId === problem.id));
  }, [problem.id]);

  // Load code per (problem, language) from localStorage; fall back to starter.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(codeKey(problem.id, language));
    setSource(saved ?? starterFor(language));
  }, [problem.id, language]);

  // Persist on change (debounced via microtask is fine for our size).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (source) window.localStorage.setItem(codeKey(problem.id, language), source);
  }, [source, problem.id, language]);

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await api.run({ problemId: problem.id, language, source });
      setRunResult(res);
      setTab('samples');
      toast.success(`Ran samples — ${res.passed}/${res.total} passed`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to run code');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      toast.error('Enter a name before submitting');
      return;
    }
    setSubmitting(true);
    setSubmitResult(null);
    try {
      local.setName(username.trim());
      const res = await api.submit({
        problemId: problem.id,
        language,
        source,
        username: username.trim(),
      });
      setSubmitResult(res);
      local.pushHistory(res.submission);
      setHistory(local.getHistory().filter((h) => h.problemId === problem.id));
      setTab('samples');
      setShowSubmit(false);
      if (res.submission.verdict === 'Accepted') {
        toast.success(`Accepted! +${res.submission.score} points`);
      } else {
        toast.error(`${res.submission.verdict} — ${res.submission.passed}/${res.submission.total}`);
      }
    } catch (e: any) {
      toast.error(e?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetStarter = () => {
    if (confirm('Reset code to starter template?')) {
      setSource(starterFor(language));
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4 animate-fade-in" style={{ minHeight: 'calc(100vh - 7rem)' }}>
      <ProblemPanel
        problem={problem}
        tab={tab}
        setTab={setTab}
        runResult={runResult}
        submitResult={submitResult}
        history={history}
      />

      <div className="card flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border p-2 bg-bg-subtle/40">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input !py-1.5 !w-auto !text-xs"
          >
            {languages.map((l) => (
              <option key={l.key} value={l.key}>{l.label}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={resetStarter}
            className="btn-ghost !px-2 !py-1.5 text-xs"
            title="Reset to starter"
          >
            <RefreshCw size={13} />
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleRun}
              disabled={running || submitting || !source.trim()}
              className="btn-secondary !py-1.5 text-xs"
            >
              <Play size={13} />
              {running ? 'Running…' : 'Run'}
            </button>
            <button
              type="button"
              onClick={() => setShowSubmit(true)}
              disabled={running || submitting || !source.trim()}
              className="btn-primary !py-1.5 text-xs"
            >
              <Send size={13} />
              Submit
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-[400px]">
          <CodeEditor value={source} onChange={setSource} language={language} />
        </div>
      </div>

      {showSubmit && (
        <SubmitDialog
          username={username}
          setUsername={setUsername}
          onClose={() => setShowSubmit(false)}
          onConfirm={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}

function ProblemPanel({
  problem,
  tab,
  setTab,
  runResult,
  submitResult,
  history,
}: {
  problem: Problem;
  tab: Tab;
  setTab: (t: Tab) => void;
  runResult: RunResponse | null;
  submitResult: SubmitResponse | null;
  history: ReturnType<typeof local.getHistory>;
}) {
  const TABS: { id: Tab; label: string; icon?: any }[] = [
    { id: 'description', label: 'Description' },
    { id: 'samples', label: 'Results' },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-border">
        <Link href="/" className="text-xs text-fg-muted hover:text-fg inline-flex items-center gap-1">
          <ArrowLeft size={12} /> All problems
        </Link>
        <h1 className="text-xl font-semibold mt-2 flex items-center gap-3">
          {problem.title}
          <DifficultyBadge value={problem.difficulty} />
        </h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {problem.tags.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
          <span className="tag">⏱ {problem.timeLimit}s</span>
          <span className="tag">🧠 {Math.round(problem.memoryLimit / 1000)}MB</span>
        </div>
      </div>

      <div className="flex border-b border-border bg-bg-subtle/40">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'px-4 py-2 text-xs font-medium border-b-2 transition-colors -mb-px',
              tab === t.id
                ? 'border-accent text-fg'
                : 'border-transparent text-fg-muted hover:text-fg',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {tab === 'description' && <DescriptionTab problem={problem} />}
        {tab === 'samples' && (
          <ResultsTab problem={problem} runResult={runResult} submitResult={submitResult} />
        )}
        {tab === 'history' && <HistoryTab history={history} />}
      </div>
    </div>
  );
}

function DescriptionTab({ problem }: { problem: Problem }) {
  return (
    <div className="space-y-5">
      <Markdown>{problem.description}</Markdown>

      <Section title="Input format">
        <pre className="bg-bg-subtle rounded-lg p-3 text-xs whitespace-pre-wrap font-mono">
          {problem.inputFormat || '—'}
        </pre>
      </Section>

      <Section title="Output format">
        <pre className="bg-bg-subtle rounded-lg p-3 text-xs whitespace-pre-wrap font-mono">
          {problem.outputFormat || '—'}
        </pre>
      </Section>

      {problem.constraints?.length > 0 && (
        <Section title="Constraints">
          <ul className="list-disc pl-5 text-sm space-y-1 text-fg/90">
            {problem.constraints.map((c, i) => (
              <li key={i}><code className="text-xs">{c}</code></li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={`Sample test cases (${problem.samples.length})`}>
        <div className="space-y-3">
          {problem.samples.map((s, i) => (
            <div key={i} className="grid sm:grid-cols-2 gap-2">
              <SampleBox label={`Input ${i + 1}`} content={s.input} />
              <SampleBox label={`Output ${i + 1}`} content={s.output} />
              {s.explanation && (
                <div className="sm:col-span-2 text-xs text-fg-muted">
                  <span className="font-semibold">Explanation:</span> {s.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function SampleBox({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <div className="text-xs text-fg-muted mb-1">{label}</div>
      <pre className="bg-bg-subtle rounded-lg p-3 text-xs font-mono whitespace-pre overflow-x-auto">
        {content || ' '}
      </pre>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wide text-fg-muted font-semibold mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ResultsTab({
  problem,
  runResult,
  submitResult,
}: {
  problem: Problem;
  runResult: RunResponse | null;
  submitResult: SubmitResponse | null;
}) {
  if (!runResult && !submitResult) {
    return (
      <div className="text-sm text-fg-muted text-center py-12">
        Click <strong>Run</strong> to test against samples or <strong>Submit</strong> to run all
        hidden test cases.
      </div>
    );
  }

  if (submitResult) {
    const { submission, sampleResults, hiddenSummary } = submitResult;
    return (
      <div className="space-y-4 animate-fade-up">
        <div className="card p-4 bg-gradient-to-br from-bg-card to-bg-subtle">
          <div className="flex flex-wrap items-center gap-3">
            <Verdict value={submission.verdict} />
            <div className="text-xs text-fg-muted">
              Submitted by <span className="font-semibold text-fg">{submission.username}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
            <Stat label="Tests" value={`${submission.passed}/${submission.total}`} />
            <Stat label="Time" value={`${submission.time?.toFixed(3) ?? '–'} s`} />
            <Stat label="Memory" value={`${submission.memory ? Math.round(submission.memory / 1000) : '–'} MB`} />
            <Stat label="Score" value={`+${submission.score}`} />
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-wide text-fg-muted font-semibold mb-2">
            Sample tests
          </h3>
          <ResultList results={sampleResults} />
        </div>

        {hiddenSummary.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-wide text-fg-muted font-semibold mb-2">
              Hidden tests ({hiddenSummary.filter((h) => h.passed).length}/{hiddenSummary.length} passed)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {hiddenSummary.map((h) => (
                <div
                  key={h.index}
                  className={clsx(
                    'p-3 rounded-lg border text-xs flex flex-col gap-1',
                    h.passed
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-rose-500/30 bg-rose-500/5',
                  )}
                >
                  <div className="font-semibold">Test #{h.index + 1}</div>
                  <Verdict value={h.verdict} className="self-start !text-[10px]" />
                  <div className="text-fg-muted">{h.time?.toFixed(3) ?? '–'}s</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bonus: AI-style hint based on the verdict, lightweight rule-based. */}
        <FeedbackHint verdict={submission.verdict} problem={problem} />
      </div>
    );
  }

  // Run-only result
  const r = runResult!;
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Verdict value={r.verdict} />
          <div className="text-xs text-fg-muted">
            {r.passed}/{r.total} sample tests passed · {r.time?.toFixed(3)}s
          </div>
        </div>
      </div>
      <ResultList results={r.results} />
    </div>
  );
}

function ResultList({ results }: { results: RunResponse['results'] }) {
  return (
    <div className="space-y-2">
      {results.map((r) => (
        <details
          key={r.index}
          className={clsx(
            'card p-3 text-sm group',
            r.passed ? 'border-emerald-500/30' : 'border-rose-500/30',
          )}
          open={!r.passed}
        >
          <summary className="flex flex-wrap items-center gap-2 cursor-pointer list-none">
            <span className="font-semibold">Test #{r.index + 1}</span>
            <Verdict value={r.verdict} />
            {r.time != null && (
              <span className="text-xs text-fg-muted ml-auto">{r.time.toFixed(3)}s</span>
            )}
          </summary>
          <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs">
            {r.input != null && <SampleBox label="Input" content={r.input} />}
            {r.expected != null && <SampleBox label="Expected" content={r.expected} />}
            <SampleBox label="Your output" content={r.stdout || ''} />
            {r.stderr && (
              <div className="sm:col-span-3">
                <div className="text-xs text-rose-400 mb-1">stderr</div>
                <pre className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-3 text-xs font-mono whitespace-pre-wrap text-rose-400">
                  {r.stderr}
                </pre>
              </div>
            )}
            {r.compileOutput && (
              <div className="sm:col-span-3">
                <div className="text-xs text-amber-500 mb-1">compile output</div>
                <pre className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 text-xs font-mono whitespace-pre-wrap text-amber-500">
                  {r.compileOutput}
                </pre>
              </div>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-bg-subtle p-3">
      <div className="text-[10px] uppercase tracking-wide text-fg-muted">{label}</div>
      <div className="text-base font-semibold mt-1">{value}</div>
    </div>
  );
}

function FeedbackHint({ verdict, problem }: { verdict: string; problem: Problem }) {
  const hint = useMemo(() => {
    switch (verdict) {
      case 'Accepted':
        return `Nice work — try optimizing for time below ${problem.timeLimit}s for a higher speed bonus.`;
      case 'Wrong Answer':
        return 'Re-check edge cases: empty input, single element, duplicates, and the largest constraint.';
      case 'Time Limit Exceeded':
        return 'Look for nested loops or repeated work — can you replace an O(n²) scan with a hash map / sorting / two-pointer approach?';
      case 'Runtime Error':
        return 'Common causes: out-of-bounds access, null/undefined dereference, division by zero, or stack overflow on deep recursion.';
      case 'Compilation Error':
        return 'Read the compile output above carefully — usually a missing import, semicolon, or type mismatch.';
      default:
        return null;
    }
  }, [verdict, problem.timeLimit]);
  if (!hint) return null;
  return (
    <div className="card p-4 border-accent/30 bg-accent/5">
      <div className="text-[10px] uppercase tracking-wide text-accent font-semibold mb-1">
        Suggestion
      </div>
      <p className="text-sm text-fg/90">{hint}</p>
    </div>
  );
}

function HistoryTab({ history }: { history: ReturnType<typeof local.getHistory> }) {
  if (history.length === 0) {
    return (
      <div className="text-sm text-fg-muted text-center py-12">
        Your submissions for this problem will appear here.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {history.map((s) => (
        <div key={s.id} className="card p-3 flex flex-wrap items-center gap-3 text-sm">
          <Verdict value={s.verdict} />
          <span className="text-xs text-fg-muted">
            {new Date(s.createdAt).toLocaleString()}
          </span>
          <span className="text-xs text-fg-muted">
            {s.language} · {s.passed}/{s.total} · {s.time?.toFixed(3)}s
          </span>
          <span className="ml-auto text-sm font-semibold">+{s.score}</span>
        </div>
      ))}
    </div>
  );
}

function SubmitDialog({
  username,
  setUsername,
  onClose,
  onConfirm,
  submitting,
}: {
  username: string;
  setUsername: (s: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card w-[90%] max-w-md p-6 animate-fade-up"
      >
        <h3 className="text-lg font-semibold">Submit your solution</h3>
        <p className="text-sm text-fg-muted mt-1">
          Pick a display name — it will appear on the leaderboard.
        </p>
        <input
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your name"
          className="input mt-4"
          maxLength={40}
        />
        <div className="flex gap-2 mt-5 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={submitting || !username.trim()}
            className="btn-primary"
          >
            {submitting ? 'Judging…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
