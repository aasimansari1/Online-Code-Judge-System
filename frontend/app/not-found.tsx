import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center text-center animate-fade-in">
      <div>
        <div className="text-6xl font-bold text-fg-muted">404</div>
        <p className="mt-2 text-fg-muted">We couldn&apos;t find that page.</p>
        <Link href="/" className="btn-primary mt-5 inline-flex">Back to problems</Link>
      </div>
    </div>
  );
}
