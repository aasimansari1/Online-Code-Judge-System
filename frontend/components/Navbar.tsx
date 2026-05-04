'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Code2, Trophy, ListChecks, Shield, Sun, Moon } from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { href: '/', label: 'Problems', icon: ListChecks },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/admin', label: 'Admin', icon: Shield },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' || pathname.startsWith('/problems') : pathname.startsWith(href);

  const dark = (mounted ? resolvedTheme : 'dark') === 'dark';

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-bg/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-accent text-accent-fg">
            <Code2 size={18} />
          </span>
          <span className="hidden sm:inline">CodeJudge</span>
        </Link>

        <nav className="flex items-center gap-1 ml-2">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                isActive(href)
                  ? 'bg-bg-subtle text-fg'
                  : 'text-fg-muted hover:text-fg hover:bg-bg-subtle',
              )}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(dark ? 'light' : 'dark')}
            className="btn-ghost !px-2 !py-2"
          >
            {mounted && (dark ? <Sun size={16} /> : <Moon size={16} />)}
          </button>
        </div>
      </div>
    </header>
  );
}
