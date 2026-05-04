'use client';

import { useEffect, useState } from 'react';
import { Trash2, Plus, Save, X, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';

import { api } from '@/lib/api';
import type { AdminProblem, Difficulty, SampleTest } from '@/lib/types';
import { DifficultyBadge } from '@/components/DifficultyBadge';

const TOKEN_KEY = 'cj_admin_token_v1';

const EMPTY: AdminProblem = {
  id: '',
  title: '',
  difficulty: 'Easy',
  tags: [],
  description: '',
  inputFormat: '',
  outputFormat: '',
  constraints: [],
  timeLimit: 2,
  memoryLimit: 256000,
  samples: [{ input: '', output: '' }],
  hiddenTests: [{ input: '', output: '' }],
};

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [problems, setProblems] = useState<AdminProblem[]>([]);
  const [editing, setEditing] = useState<AdminProblem | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(TOKEN_KEY);
    if (saved) {
      setToken(saved);
      setTokenInput(saved);
    }
  }, []);

  const load = async (t: string) => {
    setLoading(true);
    try {
      const res = await api.admin.list(t);
      setProblems(res.problems);
      setToken(t);
      window.localStorage.setItem(TOKEN_KEY, t);
    } catch (e: any) {
      toast.error(e?.message || 'Authentication failed');
      setToken('');
      window.localStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!token) {
    return (
      <div className="max-w-md mx-auto card p-6 mt-12 animate-fade-up">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={20} className="text-accent" />
          <h1 className="text-lg font-semibold">Admin access</h1>
        </div>
        <p className="text-sm text-fg-muted mb-4">
          Enter the <code className="font-mono">ADMIN_TOKEN</code> from your backend
          <code className="font-mono"> .env</code>.
        </p>
        <div className="relative">
          <input
            type={showToken ? 'text' : 'password'}
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Admin token"
            className="input pr-10"
            onKeyDown={(e) => e.key === 'Enter' && tokenInput && load(tokenInput)}
          />
          <button
            type="button"
            onClick={() => setShowToken((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg"
          >
            {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <button
          onClick={() => tokenInput && load(tokenInput)}
          className="btn-primary w-full mt-3"
          disabled={!tokenInput || loading}
        >
          {loading ? 'Verifying…' : 'Unlock'}
        </button>
      </div>
    );
  }

  const onCreate = () => {
    setEditing({ ...EMPTY });
    setCreating(true);
  };

  const onEdit = (p: AdminProblem) => {
    setEditing(JSON.parse(JSON.stringify(p)));
    setCreating(false);
  };

  const onDelete = async (id: string) => {
    if (!confirm(`Delete problem "${id}"? This cannot be undone.`)) return;
    try {
      await api.admin.remove(token, id);
      toast.success('Deleted');
      load(token);
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed');
    }
  };

  const onSave = async (p: AdminProblem) => {
    try {
      if (creating) {
        await api.admin.create(token, p);
        toast.success('Created');
      } else {
        await api.admin.update(token, p.id, p);
        toast.success('Saved');
      }
      setEditing(null);
      setCreating(false);
      load(token);
    } catch (e: any) {
      toast.error(e?.message || 'Save failed');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield size={20} className="text-accent" /> Problem Admin
        </h1>
        <span className="text-xs text-fg-muted">{problems.length} problems</span>
        <div className="ml-auto flex gap-2">
          <button onClick={onCreate} className="btn-primary">
            <Plus size={14} /> New Problem
          </button>
          <button
            onClick={() => {
              window.localStorage.removeItem(TOKEN_KEY);
              setToken('');
              setTokenInput('');
            }}
            className="btn-ghost"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-subtle text-xs uppercase tracking-wide text-fg-muted">
            <tr>
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3 w-24">Difficulty</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Tests</th>
              <th className="text-right px-4 py-3 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-bg-subtle/50">
                <td className="px-4 py-3 font-mono text-xs text-fg-muted">{p.id}</td>
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3"><DifficultyBadge value={p.difficulty} /></td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-fg-muted">
                  {p.samples.length} sample · {p.hiddenTests.length} hidden
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onEdit(p)} className="btn-ghost !py-1 !px-2 text-xs">
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="btn-ghost !py-1 !px-2 text-xs text-rose-500 hover:text-rose-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProblemEditor
          problem={editing}
          isNew={creating}
          onCancel={() => setEditing(null)}
          onSave={onSave}
        />
      )}
    </div>
  );
}

function ProblemEditor({
  problem,
  isNew,
  onCancel,
  onSave,
}: {
  problem: AdminProblem;
  isNew: boolean;
  onCancel: () => void;
  onSave: (p: AdminProblem) => void;
}) {
  const [p, setP] = useState<AdminProblem>(problem);
  const update = <K extends keyof AdminProblem>(k: K, v: AdminProblem[K]) =>
    setP((prev) => ({ ...prev, [k]: v }));

  const updateTest = (which: 'samples' | 'hiddenTests', i: number, t: SampleTest) =>
    setP((prev) => {
      const arr = [...prev[which]];
      arr[i] = t;
      return { ...prev, [which]: arr };
    });

  const addTest = (which: 'samples' | 'hiddenTests') =>
    setP((prev) => ({ ...prev, [which]: [...prev[which], { input: '', output: '' }] }));

  const removeTest = (which: 'samples' | 'hiddenTests', i: number) =>
    setP((prev) => ({ ...prev, [which]: prev[which].filter((_, idx) => idx !== i) }));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="card w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-up">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">{isNew ? 'New problem' : `Edit: ${p.title}`}</h2>
          <button onClick={onCancel} className="btn-ghost !p-2"><X size={16} /></button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="ID (kebab-case)">
              <input
                value={p.id}
                onChange={(e) => update('id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                disabled={!isNew}
                className="input"
                placeholder="two-sum"
              />
            </Field>
            <Field label="Title">
              <input value={p.title} onChange={(e) => update('title', e.target.value)} className="input" />
            </Field>
            <Field label="Difficulty">
              <select
                value={p.difficulty}
                onChange={(e) => update('difficulty', e.target.value as Difficulty)}
                className="input"
              >
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </Field>
            <Field label="Tags (comma-separated)">
              <input
                value={p.tags.join(', ')}
                onChange={(e) => update('tags', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                className="input"
              />
            </Field>
            <Field label="Time limit (seconds)">
              <input
                type="number" step="0.5" min="0.5" max="15"
                value={p.timeLimit}
                onChange={(e) => update('timeLimit', parseFloat(e.target.value))}
                className="input"
              />
            </Field>
            <Field label="Memory limit (KB)">
              <input
                type="number" step="1024" min="16000" max="1024000"
                value={p.memoryLimit}
                onChange={(e) => update('memoryLimit', parseInt(e.target.value, 10))}
                className="input"
              />
            </Field>
          </div>

          <Field label="Description (Markdown)">
            <textarea
              value={p.description}
              onChange={(e) => update('description', e.target.value)}
              rows={6}
              className="input font-mono text-xs"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Input format">
              <textarea
                value={p.inputFormat}
                onChange={(e) => update('inputFormat', e.target.value)}
                rows={3}
                className="input font-mono text-xs"
              />
            </Field>
            <Field label="Output format">
              <textarea
                value={p.outputFormat}
                onChange={(e) => update('outputFormat', e.target.value)}
                rows={3}
                className="input font-mono text-xs"
              />
            </Field>
          </div>

          <Field label="Constraints (one per line)">
            <textarea
              value={p.constraints.join('\n')}
              onChange={(e) => update('constraints', e.target.value.split('\n').filter(Boolean))}
              rows={3}
              className="input font-mono text-xs"
            />
          </Field>

          <TestList
            label="Sample tests (visible)"
            tests={p.samples}
            onAdd={() => addTest('samples')}
            onRemove={(i) => removeTest('samples', i)}
            onChange={(i, t) => updateTest('samples', i, t)}
          />

          <TestList
            label="Hidden tests (used for scoring)"
            tests={p.hiddenTests}
            onAdd={() => addTest('hiddenTests')}
            onRemove={(i) => removeTest('hiddenTests', i)}
            onChange={(i, t) => updateTest('hiddenTests', i, t)}
          />
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button onClick={() => onSave(p)} className="btn-primary">
            <Save size={14} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-fg-muted mb-1">{label}</div>
      {children}
    </label>
  );
}

function TestList({
  label,
  tests,
  onAdd,
  onRemove,
  onChange,
}: {
  label: string;
  tests: SampleTest[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onChange: (i: number, t: SampleTest) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-fg-muted">{label}</span>
        <button onClick={onAdd} className="btn-ghost !py-1 !px-2 text-xs">
          <Plus size={12} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {tests.map((t, i) => (
          <div key={i} className={clsx('card p-3 grid sm:grid-cols-2 gap-2 relative')}>
            <button
              onClick={() => onRemove(i)}
              className="absolute top-2 right-2 text-fg-muted hover:text-rose-500"
              title="Remove"
            >
              <X size={14} />
            </button>
            <Field label={`Input #${i + 1}`}>
              <textarea
                value={t.input}
                onChange={(e) => onChange(i, { ...t, input: e.target.value })}
                rows={3}
                className="input font-mono text-xs"
              />
            </Field>
            <Field label={`Output #${i + 1}`}>
              <textarea
                value={t.output}
                onChange={(e) => onChange(i, { ...t, output: e.target.value })}
                rows={3}
                className="input font-mono text-xs"
              />
            </Field>
          </div>
        ))}
      </div>
    </div>
  );
}
