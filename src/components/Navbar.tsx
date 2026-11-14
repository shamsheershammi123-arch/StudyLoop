'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  FileText,
  CalendarCheck,
  Timer,
  RefreshCw,
  Sparkles,
  Settings,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { StudyStore } from '@/lib/store';

export function Navbar() {
  const pathname = usePathname();
  const [needsRecovery, setNeedsRecovery] = useState(false);
  const [profileName, setProfileName] = useState('Alex Chen');

  useEffect(() => {
    const checkState = () => {
      const schedule = StudyStore.getSchedule();
      const profile = StudyStore.getProfile();
      setProfileName(profile.name || 'Alex');

      // Check if any scheduled session has passed without completion
      const today = new Date().toISOString().split('T')[0];
      const hasMissed = schedule.some(
        (s) => s.status === 'missed' || (s.scheduledDate < today && s.status === 'scheduled')
      );
      setNeedsRecovery(hasMissed);
    };

    checkState();
    window.addEventListener('studyloop:update', checkState);
    return () => window.removeEventListener('studyloop:update', checkState);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: Compass },
    { href: '/materials', label: 'Materials', icon: FileText },
    { href: '/tasks', label: 'Plan & Tasks', icon: CalendarCheck },
    { href: '/focus', label: 'Focus Coach', icon: Timer },
    {
      href: '/recovery',
      label: 'Plan Recovery',
      icon: RefreshCw,
      badge: needsRecovery ? 'Action' : undefined,
    },
    { href: '/coach', label: 'Patterns', icon: Sparkles },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <RefreshCw className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                StudyLoop
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                AI Coach
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User quick profile */}
        <div className="flex items-center gap-3">
          <Link
            href="/focus"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Timer className="w-4 h-4" />
            <span>Focus Now</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1.5 rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
              {profileName.charAt(0)}
            </div>
            <span className="font-medium hidden sm:inline">{profileName}</span>
          </Link>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 px-2 py-2 bg-white/95 dark:bg-slate-900/95 overflow-x-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {link.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}

