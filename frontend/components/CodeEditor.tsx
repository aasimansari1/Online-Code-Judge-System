'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const Monaco = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full grid place-items-center text-xs text-fg-muted bg-bg-subtle">
      Loading editor…
    </div>
  ),
});

const LANG_TO_MONACO: Record<string, string> = {
  cpp: 'cpp',
  java: 'java',
  python: 'python',
  javascript: 'javascript',
};

export function CodeEditor({
  value,
  onChange,
  language,
}: {
  value: string;
  onChange: (v: string) => void;
  language: string;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Monaco
      height="100%"
      language={LANG_TO_MONACO[language] ?? 'plaintext'}
      theme={mounted && resolvedTheme === 'light' ? 'light' : 'vs-dark'}
      value={value}
      onChange={(v) => onChange(v ?? '')}
      options={{
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Menlo, Consolas, monospace',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        renderLineHighlight: 'line',
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        padding: { top: 12, bottom: 12 },
      }}
    />
  );
}
