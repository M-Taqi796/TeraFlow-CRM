'use client';

import { useState, useMemo } from 'react';
import {
  CheckCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type { Task } from '@/types/task.types';
import { CURRENT_USER, TEAM_MEMBERS } from '@/types/task.types';
import { TaskModal } from '../TaskModal/TaskModal';

export function TasksView() {
  const { theme } = useThemeContext();
  const { tasks, onToggleTaskStatus, onDeleteTask } = useCRM();

  // Scope Tab: 'ALL' | 'MY_TASKS' | 'ASSIGNED_TO_OTHERS'
  const [scopeTab, setScopeTab] = useState<'ALL' | 'MY_TASKS' | 'ASSIGNED_TO_OTHERS'>('ALL');

  // Status Filter: 'ALL' | 'TODO' | 'COMPLETED'
  const [statusTab, setStatusTab] = useState<'ALL' | 'TODO' | 'COMPLETED'>('ALL');

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Completion note prompt modal
  const [completingTask, setCompletingTask] = useState<Task | null>(null);
  const [completionComment, setCompletionComment] = useState('');

  // Helper to get member role display
  const getMemberRole = (name: string) => {
    const found = TEAM_MEMBERS.find((m) => m.name.toLowerCase() === name.toLowerCase());
    return found ? found.role : '';
  };

  // Split tasks by scope
  // My tasks = tasks assigned to me (Muhammad Taqi)
  const myTasks = useMemo(() => {
    return tasks.filter((t) => t.assignedTo === CURRENT_USER.name || (!t.assignedTo && t.assignedBy === CURRENT_USER.name));
  }, [tasks]);

  // Tasks I assigned to others (assignedBy: Muhammad Taqi, assignedTo != Muhammad Taqi)
  const assignedToOthers = useMemo(() => {
    return tasks.filter((t) => t.assignedBy === CURRENT_USER.name && t.assignedTo && t.assignedTo !== CURRENT_USER.name);
  }, [tasks]);

  // Active list based on scopeTab
  const activeScopeTasks = useMemo(() => {
    if (scopeTab === 'MY_TASKS') return myTasks;
    if (scopeTab === 'ASSIGNED_TO_OTHERS') return assignedToOthers;
    return tasks;
  }, [scopeTab, myTasks, assignedToOthers, tasks]);

  // Filter by status & search
  const filteredTasks = useMemo(() => {
    return activeScopeTasks.filter((t) => {
      if (statusTab === 'TODO' && t.status !== 'TODO') return false;
      if (statusTab === 'COMPLETED' && t.status !== 'COMPLETED') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchAssignedBy = t.assignedBy.toLowerCase().includes(q);
        const matchAssignedTo = (t.assignedTo || '').toLowerCase().includes(q);
        const matchComment = (t.completionComment || '').toLowerCase().includes(q);
        return matchTitle || matchAssignedBy || matchAssignedTo || matchComment;
      }
      return true;
    });
  }, [activeScopeTasks, statusTab, searchQuery]);

  // Counts for status pills
  const statusCounts = useMemo(() => {
    return {
      ALL: activeScopeTasks.length,
      TODO: activeScopeTasks.filter((t) => t.status === 'TODO').length,
      COMPLETED: activeScopeTasks.filter((t) => t.status === 'COMPLETED').length,
    };
  }, [activeScopeTasks]);

  const handleOpenNewModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    // Only allow editing if self-assigned or created by me
    if (task.assignedBy !== CURRENT_USER.name) {
      alert(`Tasks assigned by ${task.assignedBy} cannot be edited.`);
      return;
    }
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = (task: Task) => {
    // Only allow deleting if self-assigned or created by me
    if (task.assignedBy !== CURRENT_USER.name) {
      alert(`Tasks assigned by ${task.assignedBy} cannot be deleted.`);
      return;
    }
    if (confirm(`Delete task "${task.title}"?`)) {
      onDeleteTask(task.id);
    }
  };

  const handleToggleComplete = (task: Task) => {
    if (task.status === 'TODO') {
      setCompletingTask(task);
      setCompletionComment('');
    } else {
      onToggleTaskStatus(task.id);
    }
  };

  const handleConfirmCompletion = () => {
    if (!completingTask) return;
    onToggleTaskStatus(completingTask.id);
    setCompletingTask(null);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Top Header & New Task Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-[#333338]">
        <div>
          <h1 className={`text-base font-bold tracking-tight ${theme.textMain}`}>
            Team Tasks & Assignments
          </h1>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <PlusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
          Assign Task
        </button>
      </div>

      {/* Scope Selector Tabs (All Tasks, My Tasks, Assigned to Others) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#333338] pb-1">
        <button
          onClick={() => setScopeTab('ALL')}
          className={`pb-2 px-1 text-xs font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
            scopeTab === 'ALL'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <span>All Tasks</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
            {tasks.length}
          </span>
        </button>

        <button
          onClick={() => setScopeTab('MY_TASKS')}
          className={`pb-2 px-1 text-xs font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
            scopeTab === 'MY_TASKS'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <span>My Tasks</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
            {myTasks.length}
          </span>
        </button>

        <button
          onClick={() => setScopeTab('ASSIGNED_TO_OTHERS')}
          className={`pb-2 px-1 text-xs font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
            scopeTab === 'ASSIGNED_TO_OTHERS'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          <span>Assigned to Others</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
            {assignedToOthers.length}
          </span>
        </button>
      </div>

      {/* Filters: Search & Status (All, Pending, Completed) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
          <input
            type="text"
            placeholder="Search task title, team member, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} placeholder-slate-400 focus:outline-none focus:border-slate-400`}
          />
        </div>

        {/* Status Filters: All, Pending, Completed */}
        <div className="flex items-center gap-1">
          {(['ALL', 'TODO', 'COMPLETED'] as const).map((tab) => {
            const isActive = statusTab === tab;
            const label = tab === 'ALL' ? 'All' : tab === 'TODO' ? 'Pending' : 'Completed';
            return (
              <button
                key={tab}
                onClick={() => setStatusTab(tab)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  isActive
                    ? 'bg-primary text-white'
                    : `border ${theme.border} ${theme.bgPanel} ${theme.textMuted} hover:${theme.textMain}`
                }`}
              >
                <span>{label}</span>
                <span className={`text-[10px] ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                  ({statusCounts[tab]})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks Table */}
      <div className={`rounded-xl border ${theme.border} ${theme.bgPanel} overflow-hidden`}>
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircleIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-600 stroke-1" />
            <p className={`text-xs font-medium ${theme.textMuted}`}>
              {searchQuery
                ? 'No tasks matching your search.'
                : scopeTab === 'MY_TASKS'
                ? 'No tasks found in My Tasks.'
                : scopeTab === 'ASSIGNED_TO_OTHERS'
                ? 'No tasks currently assigned to others.'
                : 'No tasks found.'}
            </p>
            <button
              type="button"
              onClick={handleOpenNewModal}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-primary text-white hover:bg-primary-600 transition-colors cursor-pointer"
            >
              <PlusIcon className="w-3 h-3" />
              Assign New Task
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead>
                <tr className={`${theme.bgSubtle} text-[11px] uppercase font-bold ${theme.textSubtle} tracking-wider border-b ${theme.border}`}>
                  <th className="py-3 px-3 w-8"></th>
                  <th className="py-3 px-3.5 whitespace-nowrap min-w-[220px]">Task</th>
                  <th className="py-3 px-3.5 whitespace-nowrap min-w-[150px]">Assigned By</th>
                  <th className="py-3 px-3.5 whitespace-nowrap min-w-[150px]">Assigned To</th>
                  <th className="py-3 px-3.5 whitespace-nowrap min-w-[160px]">Due Date & Time</th>
                  <th className="py-3 px-3.5 whitespace-nowrap min-w-[100px]">Status</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme.divide}`}>
                {filteredTasks.map((t) => {
                  const isCompleted = t.status === 'COMPLETED';
                  const isSelfAssigned = t.assignedBy === CURRENT_USER.name && t.assignedTo === CURRENT_USER.name;
                  const isAssignedByMe = t.assignedBy === CURRENT_USER.name;
                  const canEditOrDelete = isAssignedByMe; // Self assigned or assigned by me to others
                  const isAssignedToMe = !t.assignedTo || t.assignedTo === CURRENT_USER.name;

                  // Assigned By text representation:
                  let assignedByText = t.assignedBy;
                  if (isSelfAssigned) {
                    assignedByText = 'Self';
                  } else {
                    const role = getMemberRole(t.assignedBy);
                    if (role) assignedByText = `${t.assignedBy} (${role})`;
                  }

                  // Assigned To text representation:
                  const assignedToRole = getMemberRole(t.assignedTo || '');
                  const assignedToText = t.assignedTo === CURRENT_USER.name
                    ? 'Self'
                    : assignedToRole
                    ? `${t.assignedTo} (${assignedToRole})`
                    : (t.assignedTo || 'Unassigned');

                  return (
                    <tr key={t.id} className={`${theme.rowHover} transition-colors`}>
                      {/* Completion Checkbox - Only the assigned person can mark complete */}
                      <td className="py-2.5 px-3">
                        {!isAssignedToMe ? (
                          <div
                            className="cursor-not-allowed opacity-60"
                            title={`Only ${t.assignedTo || 'assignee'} can mark this task complete`}
                          >
                            {isCompleted ? (
                              <CheckBadgeIcon className="w-4 h-4 text-primary shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded border border-slate-300 dark:border-zinc-600 bg-slate-100 dark:bg-zinc-800" />
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleComplete(t)}
                            className="cursor-pointer"
                            title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                          >
                            {isCompleted ? (
                              <CheckBadgeIcon className="w-4 h-4 text-primary shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded border border-slate-300 dark:border-zinc-600 hover:border-primary transition-colors" />
                            )}
                          </button>
                        )}
                      </td>

                      {/* Task Title - No line-through for clear visibility */}
                      <td className="py-2.5 px-3 whitespace-nowrap max-w-md">
                        <span className={`font-semibold ${theme.textMain}`}>
                          {t.title}
                        </span>
                        {t.completionComment && (
                          <p className="text-[11px] text-primary dark:text-blue-400 mt-0.5 italic">
                            Note: {t.completionComment}
                          </p>
                        )}
                      </td>

                      {/* Assigned By */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-[11px]">
                        <span className={isSelfAssigned ? 'font-medium text-slate-600 dark:text-zinc-300' : 'font-semibold text-primary'}>
                          {assignedByText}
                        </span>
                      </td>

                      {/* Assigned To */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-[11px]">
                        <span className={isAssignedToMe ? 'font-medium text-slate-600 dark:text-zinc-300' : 'font-semibold text-slate-700 dark:text-zinc-200'}>
                          {assignedToText}
                        </span>
                      </td>

                      {/* Due Date & Time */}
                      <td className={`py-2.5 px-3.5 whitespace-nowrap text-xs ${theme.textMain} font-medium`}>
                        {t.dueAt}
                      </td>

                      {/* Status (Color on text only) */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap text-[11px]">
                        {isCompleted ? (
                          <span className="text-primary font-semibold">
                            Completed
                          </span>
                        ) : (
                          <span className="text-blue-500 dark:text-blue-400 font-semibold">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Actions: Edit & Delete allowed ONLY for self-assigned or created by me */}
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        {canEditOrDelete ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(t)}
                              className={`p-1 rounded ${theme.textMuted} hover:${theme.textMain} transition-colors cursor-pointer`}
                              title="Edit Task"
                            >
                              <PencilSquareIcon className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(t)}
                              className={`p-1 rounded ${theme.textMuted} hover:text-rose-500 transition-colors cursor-pointer`}
                              title="Delete Task"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1 text-slate-400 text-[10px]" title={`Assigned by ${t.assignedBy} - cannot be edited or deleted`}>
                            <LockClosedIcon className="w-3 h-3 text-slate-400" />
                            <span>Locked</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Modal (Assign / Edit) */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        initialTask={editingTask}
      />

      {/* Mark Completed Prompt Modal */}
      {completingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-sm rounded-xl border ${theme.border} ${theme.bgPanel} p-4 space-y-3 shadow-xl`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-bold ${theme.textMain}`}>
                Complete Task
              </h3>
              <button
                onClick={() => setCompletingTask(null)}
                className={`p-1 rounded ${theme.textMuted} hover:${theme.textMain}`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            <p className={`text-[11px] ${theme.textMuted}`}>
              &quot;{completingTask.title}&quot;
            </p>
            <div className="space-y-1">
              <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
                Completion Note (Optional)
              </label>
              <textarea
                rows={2}
                value={completionComment}
                onChange={(e) => setCompletionComment(e.target.value)}
                placeholder="What was done or follow-up note..."
                className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none`}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCompletingTask(null)}
                className={`px-2.5 py-1 rounded text-xs border ${theme.border} ${theme.textMuted}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCompletion}
                className="px-3 py-1 rounded text-xs font-semibold bg-primary text-white hover:bg-primary-600 cursor-pointer"
              >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
