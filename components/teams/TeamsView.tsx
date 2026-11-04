'use client';

import React, { useState, useMemo } from 'react';
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  TrashIcon,
  AdjustmentsHorizontalIcon,
  EnvelopeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type { UserProfile } from '@/types/user.types';
import { AddTeamMemberModal } from './AddTeamMemberModal/AddTeamMemberModal';
import { EditPermissionsModal } from './EditPermissionsModal/EditPermissionsModal';

export function TeamsView() {
  const { theme, isDarkMode } = useThemeContext();
  const {
    currentUser,
    teamMembers,
    onDeleteTeamMember,
    toast,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<UserProfile | null>(null);

  const isTeamLead = currentUser.role === 'Team Lead';

  // Filtered members by search query
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    });
  }, [teamMembers, searchQuery]);

  const handleDeleteMember = (member: UserProfile) => {
    if (!isTeamLead) return;
    if (member.id === currentUser.id) {
      toast.error('You cannot remove the Team Lead account');
      return;
    }
    if (window.confirm(`Remove ${member.name} from the team?`)) {
      onDeleteTeamMember(member.id);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <h1 className={`text-xl font-bold tracking-tight ${theme.textMain}`}>
            Team
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-border/40">
            {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}
          </span>
        </div>

        {/* Add Member Button — Only rendered for Team Lead (Show DOs, not DONTs) */}
        {isTeamLead && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <UserPlusIcon className="w-4 h-4" />
            Add Member
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search team..."
          className={`w-full text-xs pl-9 pr-3 py-2 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary transition-colors`}
        />
      </div>

      {/* Team Table */}
      <div className={`${theme.bgPanel} rounded-2xl border ${theme.border} shadow-xs overflow-hidden`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#333338] bg-slate-50/80 dark:bg-[#18181C] text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              <th className="py-3 px-4">Member</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              {isTeamLead && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={isTeamLead ? 4 : 3} className="py-10 text-center text-slate-400">
                  <UserGroupIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-1.5" />
                  <p className="text-xs">No team members match your search</p>
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => {
                const isCurrent = member.id === currentUser.id;
                const initials = member.name
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase() ?? '')
                  .join('');

                return (
                  <tr
                    key={member.id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                      isCurrent ? 'bg-primary/5' : ''
                    }`}
                  >
                    {/* Member Name & Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-primary/80 flex items-center justify-center text-white text-[11px] font-bold ring-2 ring-primary/20 shrink-0">
                            {initials}
                          </div>
                        )}
                        <span className={`font-semibold ${theme.textMain} truncate`}>
                          {member.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-medium">
                            You
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono text-xs">
                        <EnvelopeIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          member.role === 'Team Lead'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {member.role === 'Team Lead' && <ShieldCheckIcon className="w-3.5 h-3.5 shrink-0" />}
                        {member.role}
                      </span>
                    </td>

                    {/* Actions — ONLY rendered for Team Lead */}
                    {isTeamLead && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingMember(member)}
                            title="Edit Permissions"
                            className={`p-1.5 rounded-lg border ${theme.border} text-slate-500 hover:${theme.textMain} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer`}
                          >
                            <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
                          </button>

                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(member)}
                              title="Remove Member"
                              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <AddTeamMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Permissions Modal */}
      <EditPermissionsModal
        member={editingMember}
        isOpen={Boolean(editingMember)}
        onClose={() => setEditingMember(null)}
      />
    </div>
  );
}
