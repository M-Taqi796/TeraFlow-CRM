'use client';

import { useState, useMemo } from 'react';
import {
  EnvelopeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import { EMAIL_TYPE_OPTIONS, type EmailTypeOption } from '@/types/person.types';
import { LogEmailModal, type EmailLogRecord } from '../LogEmailModal/LogEmailModal';

export function OutreachView() {
  const { theme, isDarkMode } = useThemeContext();
  const { people, onDeleteEmailLog } = useCRM();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<EmailLogRecord | null>(null);

  // Flatten email activities from all people
  const allEmailLogs: EmailLogRecord[] = useMemo(() => {
    const list: EmailLogRecord[] = [];
    people.forEach((p) => {
      (p.activities || []).forEach((act) => {
        if (act.type === 'email') {
          list.push({
            id: act.id,
            personId: p.id,
            businessName: p.businessName,
            contactName: p.contactName || '',
            email: p.emails[0] || '—',
            emailType: act.emailType || 'Sent',
            subject: act.emailSubject || act.title || 'Untitled Email',
            comment: act.description || '—',
            timestamp: act.timestamp,
            relativeTime: act.relativeTime,
            author: act.author,
          });
        }
      });
    });
    return list;
  }, [people]);

  // Filtered & Sorted Logs
  const filteredLogs = useMemo(() => {
    return allEmailLogs
      .filter((log) => {
        if (typeFilter !== 'All' && log.emailType !== typeFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchBusiness = log.businessName.toLowerCase().includes(q);
          const matchContact  = log.contactName.toLowerCase().includes(q);
          const matchEmail    = log.email.toLowerCase().includes(q);
          const matchSubject  = log.subject.toLowerCase().includes(q);
          const matchComment  = log.comment.toLowerCase().includes(q);
          return matchBusiness || matchContact || matchEmail || matchSubject || matchComment;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [allEmailLogs, searchQuery, typeFilter, sortOrder]);

  const handleOpenNewModal = () => {
    setEditingLog(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (log: EmailLogRecord) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const handleDelete = (log: EmailLogRecord) => {
    if (confirm(`Delete email log "${log.subject}" for ${log.businessName}?`)) {
      onDeleteEmailLog(log.id);
    }
  };

  const getTypeTextColor = (type: string) => {
    if (type === 'Reply') {
      return 'text-emerald-600 dark:text-emerald-400 font-semibold';
    }
    return 'text-blue-600 dark:text-blue-400 font-semibold';
  };

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <EnvelopeIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-lg font-bold tracking-tight ${theme.textMain}`}>
                Email Outreach
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary">
                {allEmailLogs.length}
              </span>
            </div>
            <p className={`text-xs ${theme.textSubtle}`}>
              All outbound and inbound email communications across your contacts
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenNewModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-600 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Log Email</span>
        </button>
      </div>

      {/* Filter Row: Search, Type, Sort */}
      <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgPanel} flex flex-col md:flex-row md:items-center justify-between gap-2.5 shadow-xs`}>
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${theme.textSubtle}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search business, person, email, subject, or comment..."
            className={`w-full pl-9 pr-8 py-1.5 rounded-lg text-xs border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} placeholder:${theme.textSubtle} focus:outline-none focus:border-primary`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full ${theme.textSubtle} hover:${theme.textMain} cursor-pointer`}
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Type & Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-lg border ${theme.border} ${theme.bgPanel} ${theme.textMain} text-xs focus:outline-none focus:border-primary cursor-pointer`}
          >
            <option value="All">Type: All</option>
            {EMAIL_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t === 'Sent' ? 'Sent' : 'Received'}
              </option>
            ))}
          </select>

          {/* Sort order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
            className={`px-3 py-1.5 rounded-lg border ${theme.border} ${theme.bgPanel} ${theme.textMain} text-xs focus:outline-none focus:border-primary cursor-pointer`}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          {(searchQuery || typeFilter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('All');
              }}
              className="text-xs text-rose-500 font-semibold hover:underline cursor-pointer px-1.5"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Emails Table */}
      <div className={`rounded-xl border ${theme.border} ${theme.bgPanel} shadow-xs overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className={`${theme.bgSubtle} text-[11px] uppercase font-bold ${theme.textSubtle} tracking-wider border-b ${theme.border}`}>
                <th className="py-3 px-4 min-w-[170px] whitespace-nowrap">Business Name</th>
                <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Person Name</th>
                <th className="py-3 px-4 min-w-[170px] whitespace-nowrap">Email Address</th>
                <th className="py-3 px-4 min-w-[90px] whitespace-nowrap">Type</th>
                <th className="py-3 px-4 min-w-[200px] whitespace-nowrap">Subject</th>
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Date & Time</th>
                <th className="py-3 px-4 min-w-[200px] whitespace-nowrap">Comment / Summary</th>
                <th className="py-3 px-4 w-20 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`py-12 text-center ${theme.textSubtle}`}>
                    <p className="text-sm font-semibold mb-1">No email logs found.</p>
                    <p className="text-xs">
                      {searchQuery || typeFilter !== 'All'
                        ? 'Try clearing your search or type filter.'
                        : 'Click "Log Email" above to record your first email.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`transition-colors border-b border-slate-200 dark:border-zinc-800 ${theme.rowHover}`}
                  >
                    {/* Business Name */}
                    <td className={`py-3 px-4 font-semibold ${theme.textMain} whitespace-nowrap`}>
                      {log.businessName}
                    </td>

                    {/* Person Name */}
                    <td className={`py-3 px-4 ${theme.textMuted} whitespace-nowrap`}>
                      {log.contactName || '—'}
                    </td>

                    {/* Email */}
                    <td className={`py-3 px-4 font-medium ${theme.textMain}`}>
                      {log.email !== '—' ? (
                        <a
                          href={`mailto:${log.email}`}
                          className="hover:text-primary transition-colors hover:underline"
                        >
                          {log.email}
                        </a>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-xs ${getTypeTextColor(log.emailType)}`}>
                        {log.emailType === 'Sent' ? 'Sent' : 'Received'}
                      </span>
                    </td>

                    {/* Subject */}
                    <td className={`py-3 px-4 font-semibold ${theme.textMain} max-w-xs truncate`}>
                      {log.subject}
                    </td>

                    {/* Date & Time */}
                    <td suppressHydrationWarning className={`py-3 px-4 whitespace-nowrap ${theme.textMuted}`}>
                      {formatDateTime(log.timestamp)}
                    </td>

                    {/* Comment */}
                    <td className={`py-3 px-4 ${theme.textMuted} max-w-xs`}>
                      <p className="line-clamp-2 leading-relaxed">
                        {log.comment}
                      </p>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(log)}
                          className="p-1 rounded text-slate-400 hover:text-primary transition-colors cursor-pointer"
                          title="Edit email log"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(log)}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Delete email log"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log / Edit Email Modal */}
      <LogEmailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialLog={editingLog}
      />
    </div>
  );
}
