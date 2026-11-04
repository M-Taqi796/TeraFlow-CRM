'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  UsersIcon,
  PhoneIcon,
  CheckCircleIcon,
  CalendarIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type { UserProfile, UserPermissions } from '@/types/user.types';
import { DEFAULT_MEMBER_PERMISSIONS } from '@/types/user.types';

interface EditPermissionsModalProps {
  member: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditPermissionsModal({ member, isOpen, onClose }: EditPermissionsModalProps) {
  const { theme } = useThemeContext();
  const { onUpdateTeamMember } = useCRM();

  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_MEMBER_PERMISSIONS);

  useEffect(() => {
    if (member) {
      setPermissions(member.permissions || DEFAULT_MEMBER_PERMISSIONS);
    }
  }, [member]);

  const hasChanges = useMemo(() => {
    if (!member) return false;
    const initial = member.permissions || DEFAULT_MEMBER_PERMISSIONS;
    return Object.keys(permissions).some(
      (k) => permissions[k as keyof UserPermissions] !== initial[k as keyof UserPermissions]
    );
  }, [member, permissions]);

  if (!isOpen || !member) return null;

  const togglePermission = (key: keyof UserPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    onUpdateTeamMember(member.id, { permissions });
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
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-bold ${theme.textMain}`}>
                Permissions — {member.name}
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

        {/* Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
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
              disabled={!hasChanges}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                hasChanges
                  ? 'bg-primary hover:bg-primary/90 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-border/40'
              }`}
            >
              <CheckIcon className="w-3.5 h-3.5" />
              Save Permissions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
