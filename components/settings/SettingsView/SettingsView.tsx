'use client';

import React from 'react';
import Link from 'next/link';
import {
  UserCircleIcon,
  UserGroupIcon,
  SwatchIcon,
  ArrowRightIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type { ThemeMode } from '@/hooks/useTheme';

export function SettingsView() {
  const { theme, themeMode, setThemeMode } = useThemeContext();
  const { currentUser, teamMembers } = useCRM();

  const themeOptions: { id: ThemeMode; label: string; icon: React.ElementType; desc: string }[] = [
    { id: 'light', label: 'Light', icon: SunIcon, desc: 'Clean, radiant light appearance' },
    { id: 'dark', label: 'Dark', icon: MoonIcon, desc: 'Sleek, eye-friendly dark theme' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-border/50">
        <h1 className={`text-2xl font-bold tracking-tight ${theme.textMain}`}>
          CRM Settings & Preferences
        </h1>
        <p className={`text-xs ${theme.textMuted} mt-1`}>
          Configure your workspace, team management, account security, and visual preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Profile & Account Card */}
        <Link
          href="/profile"
          className={`${theme.bgPanel} rounded-2xl border ${theme.border} p-5 shadow-xs hover:border-primary/50 transition-all group flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <UserCircleIcon className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Edit Profile <ArrowRightIcon className="w-3.5 h-3.5" />
              </span>
            </div>
            <h2 className={`text-sm font-semibold ${theme.textMain}`}>
              User Profile & Security
            </h2>
            <p className={`text-xs ${theme.textMuted} mt-1 leading-relaxed`}>
              Change your display name, upload a profile avatar, check your assigned role ({currentUser.role}), and update your login password.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
            <span className={theme.textMuted}>Logged in as:</span>
            <span className="font-semibold text-primary">{currentUser.name}</span>
          </div>
        </Link>

        {/* Team & Permissions Card */}
        <Link
          href="/teams"
          className={`${theme.bgPanel} rounded-2xl border ${theme.border} p-5 shadow-xs hover:border-primary/50 transition-all group flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <UserGroupIcon className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Manage Team <ArrowRightIcon className="w-3.5 h-3.5" />
              </span>
            </div>
            <h2 className={`text-sm font-semibold ${theme.textMain}`}>
              Team Roster & Permissions
            </h2>
            <p className={`text-xs ${theme.textMuted} mt-1 leading-relaxed`}>
              View team roster and manage granular permissions. Team Leads can invite colleagues and control access.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
            <span className={theme.textMuted}>Total Members:</span>
            <span className="font-semibold text-primary">{teamMembers.length} active</span>
          </div>
        </Link>

        {/* Theme & Display Preferences (Full Width) */}
        <div className={`md:col-span-2 ${theme.bgPanel} rounded-2xl border ${theme.border} p-5 sm:p-6 shadow-xs flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <SwatchIcon className="w-6 h-6" />
              </div>
              <span suppressHydrationWarning className={`text-xs font-semibold ${theme.textMuted} capitalize`}>
                Active: {themeMode}
              </span>
            </div>
            <h2 className={`text-sm font-semibold ${theme.textMain}`}>
              Theme & Appearance
            </h2>
            <p className={`text-xs ${theme.textMuted} mt-1 leading-relaxed`}>
              Choose your preferred visual theme across your TeraFlow CRM workspace.
            </p>

            {/* 2 Interactive Mode Cards: Light and Dark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = themeMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setThemeMode(opt.id)}
                    className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-xs'
                        : `${theme.border} hover:bg-slate-50 dark:hover:bg-slate-800/60`
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                    <div>
                      <p className={`text-xs font-semibold ${isSelected ? 'text-primary' : theme.textMain}`}>
                        {opt.label}
                      </p>
                      <p className={`text-[10px] ${theme.textMuted} mt-0.5`}>
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
