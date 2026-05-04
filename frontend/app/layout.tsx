import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'CodeJudge — Online Code Judge',
  description:
    'Modern online judge for solving programming problems in C++, Java, Python, and JavaScript.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: '!bg-bg-card !text-fg !border !border-border',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
