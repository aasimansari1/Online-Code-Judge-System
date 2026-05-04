# CodeJudge — Online Code Judge System

A production-ready, full-stack online judge inspired by LeetCode/HackerRank. Browse problems, write code in a Monaco editor, run against samples, submit for hidden-test evaluation, and climb a leaderboard. **No login required** — users enter a display name at submit time.

---

## Stack

| Layer            | Tech                                                              |
|------------------|-------------------------------------------------------------------|
| Frontend         | Next.js 14 (App Router) · TypeScript · Tailwind · Monaco Editor   |
| Backend          | Node.js 18+ · Express · Zod validation · helmet/compression/cors  |
| Code execution   | [Judge0](https://judge0.com/) (RapidAPI **or** self-hosted Docker)|
| Storage          | File-backed JSON store (atomic writes; pluggable layer)           |
| Theming          | Dark/light mode via `next-themes`                                 |
| Notifications    | `sonner` toasts                                                   |

---

## Folder Structure

```
Online Code Judge System/
├── backend/
│   ├── src/
│   │   ├── config/index.js          # env-driven config
│   │   ├── data/
│   │   │   ├── seed.js              # 5 starter problems w/ hidden tests
│   │   │   ├── storage.js           # atomic JSON read/write
│   │   │   └── store/               # runtime data (problems.json, submissions.json)
│   │   ├── middleware/admin.js      # x-admin-token guard
│   │   ├── routes/
│   │   │   ├── problems.js          # GET /problems, GET /problems/:id
│   │   │   ├── run.js               # POST /run
│   │   │   ├── submit.js            # POST /submit
│   │   │   ├── leaderboard.js       # GET /leaderboard
│   │   │   ├── admin.js             # /admin CRUD (token-protected)
│   │   │   └── meta.js              # /health, /languages
│   │   ├── services/
│   │   │   ├── languages.js         # cpp/java/python/javascript ↔ Judge0 IDs
│   │   │   ├── judge0.js            # Judge0 client (base64 + wait=true)
│   │   │   ├── mockEngine.js        # zero-config dev fallback
│   │   │   ├── executor.js          # engine selector
│   │   │   └── evaluator.js         # runs N tests, normalizes & compares
│   │   ├── scripts/seed.js          # `npm run seed`
│   │   └── server.js                # entrypoint (auto-seeds on boot)
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx               # global shell + theme + toaster
│   │   ├── page.tsx                 # homepage: problem list w/ filters
│   │   ├── problems/[id]/page.tsx   # detail + editor split layout
│   │   ├── leaderboard/page.tsx
│   │   ├── admin/page.tsx           # token-gated CRUD UI
│   │   ├── not-found.tsx
│   │   └── globals.css              # design tokens, components
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ThemeProvider.tsx
│   │   ├── ProblemsBrowser.tsx
│   │   ├── ProblemWorkspace.tsx     # core editor + tabs + dialogs
│   │   ├── CodeEditor.tsx           # Monaco wrapper
│   │   ├── DifficultyBadge.tsx
│   │   ├── Markdown.tsx
│   │   └── Verdict.tsx
│   ├── lib/
│   │   ├── api.ts                   # typed fetch wrappers + localStorage helpers
│   │   ├── starter.ts               # per-language starter snippets
│   │   └── types.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── docker-compose.judge0.yml        # optional self-hosted Judge0
├── judge0.conf.example              # config for the above
├── package.json                     # convenience scripts
└── README.md
```

---

## Quick Start (zero-config dev)

The backend ships with a **mock execution engine** so the whole stack works even without a Judge0 key — you can browse, run, submit, and see the leaderboard, just without real code execution. Swap to Judge0 when you're ready.

```bash
# 1) Install both projects
npm run install:all

# 2) Configure env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3) (Optional) explicitly seed; the backend also auto-seeds on first boot
npm run seed

# 4) Run dev servers in two terminals
npm run dev:backend    # http://localhost:4000
npm run dev:frontend   # http://localhost:3000
```

Open http://localhost:3000 and you'll see the seeded problems.

> Real execution is OFF by default until you set `EXECUTION_ENGINE=judge0` and provide credentials — see below.

---

## Enabling real code execution

### Option A — RapidAPI (fastest)

1. Subscribe to **Judge0 CE** on RapidAPI: <https://rapidapi.com/judge0-official/api/judge0-ce>
2. In `backend/.env`:
   ```env
   EXECUTION_ENGINE=judge0
   JUDGE0_URL=https://judge0-ce.p.rapidapi.com
   JUDGE0_RAPIDAPI_KEY=<your-rapidapi-key>
   JUDGE0_RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
   ```
3. Restart the backend.

### Option B — Self-hosted Judge0 (Docker)

```bash
cp judge0.conf.example judge0.conf
docker compose -f docker-compose.judge0.yml up -d
```

Then in `backend/.env`:
```env
EXECUTION_ENGINE=judge0
JUDGE0_URL=http://localhost:2358
JUDGE0_RAPIDAPI_KEY=
```

Self-hosted Judge0 already runs each submission in an **isolate** sandbox (cgroups + namespaces) with the time and memory limits we forward from each problem, which keeps malicious code contained.

---

## API Reference

Base URL: `http://localhost:4000`

| Method | Path                  | Body / Query                                             | Description                              |
|--------|-----------------------|----------------------------------------------------------|------------------------------------------|
| GET    | `/health`             | —                                                        | Health + active engine                   |
| GET    | `/languages`          | —                                                        | Supported languages                      |
| GET    | `/problems`           | `?difficulty=&tag=&q=`                                   | List problems (no hidden tests)          |
| GET    | `/problems/:id`       | —                                                        | Problem detail (samples only)            |
| POST   | `/run`                | `{ problemId, language, source, customInput? }`          | Run against samples or custom stdin      |
| POST   | `/submit`             | `{ problemId, language, source, username }`              | Run all tests, record submission, score  |
| GET    | `/leaderboard`        | `?limit=`                                                | Aggregated per-user rankings             |
| GET    | `/admin/problems`     | header `x-admin-token`                                   | Full problem records incl. hidden tests  |
| POST   | `/admin/problems`     | header `x-admin-token`, body = problem                   | Create                                   |
| PUT    | `/admin/problems/:id` | header `x-admin-token`, body = problem                   | Update                                   |
| DELETE | `/admin/problems/:id` | header `x-admin-token`                                   | Delete                                   |

Verdicts returned: `Accepted`, `Wrong Answer`, `Time Limit Exceeded`, `Compilation Error`, `Runtime Error`, `Internal Error`.

### Submission payload (example)

```json
POST /submit
{
  "problemId": "two-sum",
  "language": "python",
  "username": "ada",
  "source": "import sys\n# ..."
}
```

Returns:
```json
{
  "submission": { "verdict": "Accepted", "passed": 5, "total": 5, "score": 117, "..." },
  "sampleResults": [ /* per-test details for samples */ ],
  "hiddenSummary":  [ /* pass/fail/time only — no inputs leaked */ ]
}
```

---

## Data Model

Everything lives in `backend/src/data/store/*.json`. Two collections:

### `problems.json`
```ts
{
  id: string;             // kebab-case slug
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  description: string;    // Markdown
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  timeLimit: number;      // seconds
  memoryLimit: number;    // KB
  samples: { input: string; output: string; explanation?: string }[];
  hiddenTests: { input: string; output: string }[];
}
```

### `submissions.json`
```ts
{
  id: string;             // 10-char nanoid
  username: string;
  problemId: string;
  problemTitle: string;
  language: string;
  verdict: string;
  passed: number;
  total: number;
  time: number;
  memory: number;
  score: number;
  createdAt: string;      // ISO timestamp
}
```

### Migrating to MongoDB / Postgres

`backend/src/data/storage.js` exposes just `read(name)` / `write(name, data)`. Replace these two functions with Mongo collections or a Postgres table — every route already goes through this layer.

---

## Scoring Logic

```
score = base(difficulty) * (passed / total)
        + (correctness == 1 ? speedBonus : 0)

base:        Easy=100, Medium=200, Hard=400
speedBonus:  base * 0.25 * max(0, 1 - time / timeLimit)
```

Leaderboard sums each user's **best score per problem**, ties broken by problems solved, then by lower average accepted-time.

---

## Security Hardening

- `helmet`, `compression`, `cors` (origin allowlist via `CORS_ORIGIN`).
- `express-rate-limit`: 30 requests/min per IP on `/run` and `/submit`.
- Zod schema validation on every write endpoint.
- `MAX_CODE_LENGTH` cap (default 64 KB) to prevent oversized payloads.
- Admin endpoints require `x-admin-token` header (compare against `ADMIN_TOKEN` env).
- Hidden test inputs/outputs **never leave the server** — the submit response only returns pass/fail + timing per hidden test.
- Code execution is delegated to Judge0's isolate sandbox (kernel-level isolation, time + memory limits, no network unless explicitly enabled). The backend never `eval()`s or shells out to user code.

---

## Admin Panel

1. Set `ADMIN_TOKEN` to a long random value in `backend/.env`.
2. Visit `/admin` on the frontend, paste the token. It's stored in `localStorage` for that browser only.
3. Create/edit/delete problems, including their sample and hidden tests.

---

## Bonus Features (built-in)

- **AI-style feedback**: contextual hints based on verdict (TLE, WA, RE, CE) on the results panel.
- **Per-problem submission history**: stored in `localStorage`, shown in the "History" tab.
- **Auto-saved code**: editor contents are persisted per `(problem, language)` pair.
- **Tags + difficulty filters** + free-text title search on the homepage.
- **Speed bonus** integrated into scoring for accepted submissions.

---

## Deployment

### Frontend → Vercel

1. Push the repo; "Import Project" on Vercel and point it at the `frontend/` folder.
2. Set env: `NEXT_PUBLIC_API_URL=https://your-backend.example.com`
3. Build command `next build`, output `.next` (auto-detected).

### Backend → Render or Railway

- **Render**: New → Web Service → repo → root dir `backend`. Build `npm install`, start `npm start`. Add env from `.env.example`.
- **Railway**: New project → deploy from repo → set service root `backend`. Add env vars. Persistent data: mount a volume at `/app/src/data/store` if you want JSON persistence; otherwise plug in MongoDB/Postgres via the storage layer.

Required production env:

```env
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://your-frontend.vercel.app
ADMIN_TOKEN=<long random>
EXECUTION_ENGINE=judge0
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_RAPIDAPI_KEY=<your key>
JUDGE0_RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
```

---

## License

MIT — use it, fork it, ship it.
