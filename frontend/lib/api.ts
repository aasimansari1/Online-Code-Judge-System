import type {
  AdminProblem,
  LanguageOption,
  LeaderboardRow,
  Problem,
  ProblemSummary,
  RunResponse,
  SubmissionRecord,
  SubmitResponse,
} from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    let body: any = null;
    try { body = await res.json(); } catch {}
    const msg = body?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  problems: {
    list: (params?: { difficulty?: string; tag?: string; q?: string }) => {
      const qs = new URLSearchParams();
      if (params?.difficulty) qs.set('difficulty', params.difficulty);
      if (params?.tag) qs.set('tag', params.tag);
      if (params?.q) qs.set('q', params.q);
      const suffix = qs.toString() ? `?${qs.toString()}` : '';
      return request<{ problems: ProblemSummary[]; tags: string[] }>(`/problems${suffix}`);
    },
    get: (id: string) => request<Problem>(`/problems/${id}`),
  },
  meta: {
    languages: () => request<{ languages: LanguageOption[] }>(`/languages`),
  },
  run: (body: { problemId: string; language: string; source: string; customInput?: string }) =>
    request<RunResponse>('/run', { method: 'POST', body: JSON.stringify(body) }),
  submit: (body: { problemId: string; language: string; source: string; username: string }) =>
    request<SubmitResponse>('/submit', { method: 'POST', body: JSON.stringify(body) }),
  leaderboard: () => request<{ leaderboard: LeaderboardRow[] }>('/leaderboard'),

  admin: {
    list: (token: string) =>
      request<{ problems: AdminProblem[] }>('/admin/problems', {
        headers: { 'x-admin-token': token },
      }),
    create: (token: string, problem: AdminProblem) =>
      request<AdminProblem>('/admin/problems', {
        method: 'POST',
        headers: { 'x-admin-token': token },
        body: JSON.stringify(problem),
      }),
    update: (token: string, id: string, problem: AdminProblem) =>
      request<AdminProblem>(`/admin/problems/${id}`, {
        method: 'PUT',
        headers: { 'x-admin-token': token },
        body: JSON.stringify(problem),
      }),
    remove: (token: string, id: string) =>
      request<{ ok: true }>(`/admin/problems/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      }),
  },
};

export type Submission = SubmissionRecord;

const HISTORY_KEY = 'cj_submission_history_v1';
const NAME_KEY = 'cj_username_v1';

export const local = {
  getName(): string {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(NAME_KEY) || '';
  },
  setName(name: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(NAME_KEY, name);
  },
  getHistory(): SubmissionRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(window.localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  },
  pushHistory(s: SubmissionRecord) {
    if (typeof window === 'undefined') return;
    const arr = local.getHistory();
    arr.unshift(s);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(0, 50)));
  },
};
