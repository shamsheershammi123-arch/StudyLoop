import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'StudyLoop | AI Study Planner & Focus Coach',
  description:
    'Turn course materials and deadlines into a realistic study plan, focus on one task at a time, and recover when your schedule slips without guilt or cramming.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-800 dark:selection:text-emerald-200">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">StudyLoop</span>
              <span>•</span>
              <span>The Guilt-Free AI Study Planner & Focus Coach</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Core Loop: Plan → Focus → Reflect → Adjust</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Powered by Gemini 3.8 Flash</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

