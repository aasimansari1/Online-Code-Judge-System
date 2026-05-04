import { api } from '@/lib/api';
import { ProblemWorkspace } from '@/components/ProblemWorkspace';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProblemPage({ params }: { params: { id: string } }) {
  let problem;
  let languages;
  try {
    [problem, languages] = await Promise.all([
      api.problems.get(params.id),
      api.meta.languages(),
    ]);
  } catch {
    notFound();
  }
  return (
    <ProblemWorkspace problem={problem!} languages={languages!.languages} />
  );
}
