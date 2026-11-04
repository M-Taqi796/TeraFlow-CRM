'use client';

import { useState, useMemo } from 'react';
import {
  PhoneIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import { CALL_STATUS_OPTIONS, type CallStatusOption } from '@/types/person.types';
import { LogCallModal, type CallLogRecord } from '../LogCallModal/LogCallModal';

export function CallsView() {
  const { theme, isDarkMode } = useThemeContext();
  const { people, onDeleteCallLog } = useCRM();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<CallLogRecord | null>(null);

  // Flatten call activities from all people
  const allCallLogs: CallLogRecord[] = useMemo(() => {
    const list: CallLogRecord[] = [];
    people.forEach((p) => {
      (p.activities || []).forEach((act) => {
        if (act.type === 'call') {
          list.push({
            id: act.id,
            personId: p.id,
            businessName: p.businessName,
            contactName: p.contactName || '',
            phone: p.phones[0] || '—',
            callStatus: act.callStatus || 'Answered',
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
    return allCallLogs
      .filter((log) => {
        if (statusFilter !== 'All' && log.callStatus !== statusFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchBusiness = log.businessName.toLowerCase().includes(q);
          const matchContact  = log.contactName.toLowerCase().includes(q);
          const matchPhone    = log.phone.toLowerCase().includes(q);
          const matchComment  = log.comment.toLowerCase().includes(q);
          return matchBusiness || matchContact || matchPhone || matchComment;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [allCallLogs, searchQuery, statusFilter, sortOrder]);

  const handleOpenNewModal = () => {
    setEditingLog(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (log: CallLogRecord) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const handleDelete = (log: CallLogRecord) => {
    if (confirm(`Delete call log for ${log.businessName}?`)) {
      onDeleteCallLog(log.id);
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'Answered':
        return 'text-emerald-600 dark:text-emerald-400 font-semibold';
      case 'Not answered':
      case 'Missed':
        return 'text-amber-600 dark:text-amber-400 font-semibold';
      case 'Call failed':
      case 'Wrong Number':
        return 'text-rose-600 dark:text-rose-400 font-semibold';
      case 'Busy':
        return 'text-violet-600 dark:text-violet-400 font-semibold';
      case 'Left Voicemail':
        return 'text-blue-600 dark:text-blue-400 font-semibold';
      default:
        return 'text-slate-600 dark:text-zinc-400 font-semibold';
    }
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
            <PhoneIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-lg font-bold tracking-tight ${theme.textMain}`}>
                Call Log
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary">
                {allCallLogs.length}
              </span>
            </div>
            <p className={`text-xs ${theme.textSubtle}`}>
              All phone call records and custom notes from your CRM contacts
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenNewModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-600 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Log Call</span>
        </button>
      </div>

      {/* Filter Row: Search, Status, Sort */}
      <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgPanel} flex flex-col md:flex-row md:items-center justify-between gap-2.5 shadow-xs`}>
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${theme.textSubtle}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search business, person, phone, or comment..."
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

        {/* Status & Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`pl-3 pr-8 py-1.5 rounded-lg border ${theme.border} ${theme.bgPanel} ${theme.textMain} text-xs focus:outline-none focus:border-primary cursor-pointer select-compact`}
          >
            <option value="All">Status: All</option>
            {CALL_STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>

          {/* Sort order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
            className={`pl-3 pr-8 py-1.5 rounded-lg border ${theme.border} ${theme.bgPanel} ${theme.textMain} text-xs focus:outline-none focus:border-primary cursor-pointer select-compact`}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          {(searchQuery || statusFilter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
              }}
              className="text-xs text-rose-500 font-semibold hover:underline cursor-pointer px-1.5"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Calls Table */}
      <div className={`rounded-xl border ${theme.border} ${theme.bgPanel} shadow-xs overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className={`${theme.bgSubtle} text-[11px] uppercase font-bold ${theme.textSubtle} tracking-wider border-b ${theme.border}`}>
                <th className="py-3 px-4 min-w-[180px] whitespace-nowrap">Business Name</th>
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Person Name</th>
                <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">Phone Number</th>
                <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Call Status</th>
                <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">Date & Time</th>
                <th className="py-3 px-4 min-w-[220px] whitespace-nowrap">Comment</th>
                <th className="py-3 px-4 w-20 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`py-12 text-center ${theme.textSubtle}`}>
                    <p className="text-sm font-semibold mb-1">No call logs found.</p>
                    <p className="text-xs">
                      {searchQuery || statusFilter !== 'All'
                        ? 'Try clearing your search or status filter.'
                        : 'Click "Log Call" above to record your first phone call.'}
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

                    {/* Phone Number */}
                    <td className={`py-3 px-4 font-mono font-medium ${theme.textMain}`}>
                      {log.phone !== '—' ? (
                        <a
                          href={`tel:${log.phone}`}
                          className="hover:text-primary transition-colors hover:underline"
                        >
                          {log.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>

                    {/* Call Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-xs ${getStatusTextColor(log.callStatus)}`}>
                        {log.callStatus}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td suppressHydrationWarning className={`py-3 px-4 whitespace-nowrap ${theme.textMuted}`}>
                      {formatDateTime(log.timestamp)}
                    </td>

                    {/* Comment */}
                    <td className={`py-3 px-4 ${theme.textMain} max-w-xs`}>
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
                          title="Edit call log"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(log)}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Delete call log"
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

      {/* Log / Edit Call Modal */}
      <LogCallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialLog={editingLog}
      />
    </div>
  );
}
