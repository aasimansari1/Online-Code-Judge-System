export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface ProblemSummary {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
}

export interface SampleTest {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem extends ProblemSummary {
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  timeLimit: number;
  memoryLimit: number;
  samples: SampleTest[];
  hiddenTestCount: number;
}

export interface AdminProblem extends Omit<Problem, 'hiddenTestCount'> {
  hiddenTests: SampleTest[];
}

export interface TestRunResult {
  index: number;
  verdict: string;
  passed: boolean;
  time: number | null;
  memory: number | null;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  expected?: string;
  input?: string;
}

export interface RunResponse {
  mode: 'samples' | 'custom';
  verdict: string;
  passed: number;
  total: number;
  time: number;
  memory: number;
  results: TestRunResult[];
}

export interface SubmissionRecord {
  id: string;
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
  createdAt: string;
}

export interface SubmitResponse {
  submission: SubmissionRecord;
  sampleResults: TestRunResult[];
  hiddenSummary: { index: number; passed: boolean; verdict: string; time: number | null; memory: number | null }[];
}

export interface LeaderboardRow {
  username: string;
  score: number;
  problemsSolved: number;
  submissions: number;
  accepted: number;
  avgTime: number;
}

export interface LanguageOption {
  key: string;
  label: string;
  mode: string;
}
