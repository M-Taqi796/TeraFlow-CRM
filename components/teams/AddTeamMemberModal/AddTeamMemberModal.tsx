'use client';

import React, { useState, useMemo } from 'react';
import {
  XMarkIcon,
  UserPlusIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  UsersIcon,
  PhoneIcon,
  CheckCircleIcon,
  CalendarIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type { UserPermissions } from '@/types/user.types';
import { DEFAULT_MEMBER_PERMISSIONS, DEFAULT_LEAD_PERMISSIONS } from '@/types/user.types';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTeamMemberModal({ isOpen, onClose }: AddTeamMemberModalProps) {
  const { theme } = useThemeContext();
  const { onAddTeamMember, toast } = useCRM();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_MEMBER_PERMISSIONS);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation for button state
  const isValid = useMemo(() => {
    return (
      name.trim().length > 0 &&
      email.trim().includes('@') &&
      password.length >= 6
    );
  }, [name, email, password]);

  const areAllSelected = useMemo(() => {
    return Object.values(permissions).every(Boolean);
  }, [permissions]);

  if (!isOpen) return null;

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let generated = '';
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setShowPassword(true);
  };

  const handleCopyCredentials = () => {
    if (!email || !password) return;
    const text = `Email: ${email.trim()}\nPassword: ${password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.info('Email and password copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePermission = (key: keyof UserPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleSelectAll = () => {
    if (areAllSelected) {
      setPermissions(DEFAULT_MEMBER_PERMISSIONS);
    } else {
      setPermissions(DEFAULT_LEAD_PERMISSIONS);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    onAddTeamMember({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'Team Member',
      permissions,
      status: 'active',
    });
    setIsSubmitting(false);

    // Reset form
    setName('');
    setEmail('');
    setPassword('');
    setPermissions(DEFAULT_MEMBER_PERMISSIONS);
    onClose();
  };

  const permissionItems = [
    { key: 'manageLeads' as const, label: 'Leads & Contacts', icon: UsersIcon },
    { key: 'manageOutreach' as const, label: 'Call & Email Outreach', icon: PhoneIcon },
    { key: 'manageTasks' as const, label: 'Task Management', icon: CheckCircleIcon },
    { key: 'manageMeetings' as const, label: 'Meetings & Calendar', icon: CalendarIcon },
    { key: 'importData' as const, label: 'Import CSV Leads', icon: ArrowUpTrayIcon },
    { key: 'exportData' as const, label: 'Export Data & Reports', icon: ArrowDownTrayIcon },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`${theme.bgPanel} rounded-2xl border ${theme.border} shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b ${theme.border} flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <UserPlusIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-bold ${theme.textMain}`}>
                Add Team Member
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${theme.textMuted} hover:${theme.textMain} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className={`block text-xs font-medium ${theme.textMuted}`}>
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Farhan Tariq"
              className={`w-full text-xs p-2.5 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className={`block text-xs font-medium ${theme.textMuted}`}>
              Work Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. farhan@teraflow.io"
              className={`w-full text-xs p-2.5 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-medium ${theme.textMuted}`}>
                Password
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <SparklesIcon className="w-3 h-3" />
                Generate
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className={`w-full text-xs pr-9 pl-3 py-2.5 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Copy Email & Password Secondary Button */}
          <div>
            <button
              type="button"
              onClick={handleCopyCredentials}
              disabled={!email || !password}
              className={`w-full py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                email && password
                  ? `${theme.border} ${theme.textMain} hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer`
                  : 'border-border/30 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
              }`}
            >
              {copied ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Copied Credentials!
                  </span>
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Email & Password</span>
                </>
              )}
            </button>
          </div>

          {/* Permissions (with Select All at top right) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className={`block text-xs font-medium ${theme.textMuted}`}>
                Permissions
              </label>
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
              >
                {areAllSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {permissionItems.map((p) => {
                const Icon = p.icon;
                const isChecked = Boolean(permissions[p.key]);
                return (
                  <label
                    key={p.key}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border ${theme.border} cursor-pointer transition-colors ${
                      isChecked ? 'bg-primary/5 border-primary/30' : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePermission(p.key)}
                      className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    <Icon className={`w-4 h-4 ${isChecked ? 'text-primary' : 'text-slate-400'}`} />
                    <span className={`text-xs ${isChecked ? 'font-semibold ' + theme.textMain : theme.textMuted}`}>
                      {p.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-2 rounded-xl text-xs font-medium ${theme.textMuted} hover:${theme.textMain}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isValid && !isSubmitting
                  ? 'bg-primary hover:bg-primary/90 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-border/40'
              }`}
            >
              <UserPlusIcon className="w-3.5 h-3.5" />
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
