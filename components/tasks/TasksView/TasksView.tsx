'use client';

import { useState, useMemo } from 'react';
import {
  CheckCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type { Task } from '@/types/task.types';
import { TaskModal } from '../TaskModal/TaskModal';

export function TasksView() {
  const { theme, isDarkMode } = useThemeContext();
  const { tasks, activeTasks, completedTasks, onToggleTaskStatus, onDeleteTask } = useCRM();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'ALL' | 'TODO' | 'COMPLETED'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusTab === 'TODO' && t.status !== 'TODO') return false;
      if (statusTab === 'COMPLETED' && t.status !== 'COMPLETED') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchAssignee = t.assignedBy.toLowerCase().includes(q);
        const matchComment = (t.completionComment || '').toLowerCase().includes(q);
        return matchTitle || matchAssignee || matchComment;
      }
      return true;
    });
  }, [tasks, statusTab, searchQuery]);

  const handleOpenNewModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = (task: Task) => {
    if (confirm(`Delete task "${task.title}"?`)) {
      onDeleteTask(task.id);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <CheckCircleIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-lg font-bold tracking-tight ${theme.textMain}`}>
                Tasks & Follow-Ups
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary">
                {activeTasks.length} pending
              </span>
              {completedTasks.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {completedTasks.length} completed
                </span>
              )}
            </div>
            <p className={`text-xs ${theme.textSubtle}`}>
              Manage action items and follow-ups synced live with your task drawer
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenNewModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-600 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgPanel} flex flex-col md:flex-row md:items-center justify-between gap-2.5 shadow-xs`}>
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${theme.textSubtle}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, assigned by, or completion notes..."
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

        {/* Status Tabs */}
        <div className={`flex items-center gap-1 p-0.5 rounded-lg border ${theme.border} ${theme.bgSubtle}`}>
          <button
            type="button"
            onClick={() => setStatusTab('ALL')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              statusTab === 'ALL'
                ? 'bg-primary text-white shadow-xs'
                : `${theme.textMuted} hover:${theme.textMain}`
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('TODO')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              statusTab === 'TODO'
                ? 'bg-primary text-white shadow-xs'
                : `${theme.textMuted} hover:${theme.textMain}`
            }`}
          >
            Pending ({activeTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('COMPLETED')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              statusTab === 'COMPLETED'
                ? 'bg-primary text-white shadow-xs'
                : `${theme.textMuted} hover:${theme.textMain}`
            }`}
          >
            Completed ({completedTasks.length})
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className={`rounded-xl border ${theme.border} ${theme.bgPanel} shadow-xs overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className={`${theme.bgSubtle} text-[11px] uppercase font-bold ${theme.textSubtle} tracking-wider border-b ${theme.border}`}>
                <th className="py-3 px-4 w-12 text-center">Done</th>
                <th className="py-3 px-4 min-w-[260px]">Task Description</th>
                <th className="py-3 px-4 min-w-[140px]">Assigned By</th>
                <th className="py-3 px-4 min-w-[140px]">Due Date</th>
                <th className="py-3 px-4 min-w-[110px]">Status</th>
                <th className="py-3 px-4 w-20 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 text-xs">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`py-12 text-center ${theme.textSubtle}`}>
                    <p className="text-sm font-semibold mb-1">No tasks found.</p>
                    <p className="text-xs">
                      {searchQuery
                        ? 'Try clearing your search query.'
                        : 'Click "New Task" above to add your first task.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const isDone = t.status === 'COMPLETED';
                  return (
                    <tr
                      key={t.id}
                      className={`transition-colors border-b border-slate-200 dark:border-zinc-800 ${theme.rowHover}`}
                    >
                      {/* Done Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleTaskStatus(t.id)}
                          className="cursor-pointer text-slate-400 hover:text-primary transition-colors"
                          title={isDone ? 'Mark as Todo' : 'Mark as Completed'}
                        >
                          {isDone ? (
                            <CheckBadgeIcon className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-md border border-slate-300 dark:border-zinc-600 hover:border-primary transition-colors" />
                          )}
                        </button>
                      </td>

                      {/* Task Title & Completion comment */}
                      <td className="py-3 px-4">
                        <p
                          className={`font-semibold ${
                            isDone ? `line-through ${theme.textSubtle}` : theme.textMain
                          }`}
                        >
                          {t.title}
                        </p>
                        {t.completionComment && (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                            Outcome: {t.completionComment}
                          </p>
                        )}
                      </td>

                      {/* Assigned By */}
                      <td className={`py-3 px-4 ${theme.textMuted}`}>
                        {t.assignedBy}
                      </td>

                      {/* Due Date */}
                      <td className={`py-3 px-4 whitespace-nowrap ${theme.textMuted}`}>
                        {t.dueAt}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                            isDone
                              ? isDarkMode
                                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : isDarkMode
                              ? 'bg-blue-950/70 text-blue-300 border-blue-800'
                              : 'bg-blue-50 text-blue-700 border-blue-300'
                          }`}
                        >
                          {isDone ? 'Completed' : 'Pending'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(t)}
                            className="p-1 rounded text-slate-400 hover:text-primary transition-colors cursor-pointer"
                            title="Edit task"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(t)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Delete task"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New / Edit Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTask={editingTask}
      />
    </div>
  );
}
