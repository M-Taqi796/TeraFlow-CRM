'use client';

import { useState } from 'react';
import {
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  TagIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import type { Person, PersonStage, ActivityType } from '@/types/person.types';
import { PERSON_STAGES, COMMON_FUB_TAGS } from '@/types/person.types';

interface PersonDetailDrawerProps {
  person: Person | null;
  onClose: () => void;
  onUpdatePerson: (updated: Person) => void;
  onDeletePerson: (id: string) => void;
}

type ActionTab = 'note' | 'call' | 'email' | 'task';

export function PersonDetailDrawer({
  person,
  onClose,
  onUpdatePerson,
  onDeletePerson,
}: PersonDetailDrawerProps) {
  const { isDarkMode, theme } = useThemeContext();

  const [activeTab, setActiveTab] = useState<ActionTab>('note');
  const [noteContent, setNoteContent] = useState('');
  const [callOutcome, setCallOutcome] = useState('Connected — Left Note');
  const [callNotes, setCallNotes] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('Tomorrow');

  const [newTagInput, setNewTagInput] = useState('');

  if (!person) return null;

  const handleStageChange = (newStage: PersonStage) => {
    const act = {
      id: `act-${Date.now()}`,
      type: 'stage_change' as const,
      title: 'Stage Changed',
      description: `Stage moved from ${person.stage} to ${newStage}.`,
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      author: 'Muhammad Taqi',
    };
    onUpdatePerson({
      ...person,
      stage: newStage,
      activities: [act, ...(person.activities || [])],
    });
  };

  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim();
    if (!clean || person.tags.includes(clean)) return;
    const act = {
      id: `act-${Date.now()}`,
      type: 'tag_added' as const,
      title: 'Tag Added',
      description: `Added #${clean}`,
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      author: 'Muhammad Taqi',
    };
    onUpdatePerson({
      ...person,
      tags: [...person.tags, clean],
      activities: [act, ...(person.activities || [])],
    });
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdatePerson({
      ...person,
      tags: person.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'note') {
      if (!noteContent.trim()) return;
      const newAct = {
        id: `act-${Date.now()}`,
        type: 'note' as const,
        title: 'Note Logged',
        description: noteContent.trim(),
        timestamp: new Date().toISOString(),
        relativeTime: 'Just now',
        author: 'Muhammad Taqi',
      };
      onUpdatePerson({
        ...person,
        lastActivity: {
          type: 'note',
          summary: noteContent.trim().slice(0, 40) + '...',
          timestamp: new Date().toISOString(),
          relativeTime: 'Just now',
        },
        activities: [newAct, ...(person.activities || [])],
      });
      setNoteContent('');
    } else if (activeTab === 'call') {
      const summaryText = `${callOutcome}${callNotes ? `: ${callNotes}` : ''}`;
      const newAct = {
        id: `act-${Date.now()}`,
        type: 'call' as const,
        title: `Call: ${callOutcome}`,
        description: callNotes || undefined,
        timestamp: new Date().toISOString(),
        relativeTime: 'Just now',
        author: 'Muhammad Taqi',
      };
      onUpdatePerson({
        ...person,
        lastActivity: {
          type: 'call',
          summary: summaryText.slice(0, 45),
          timestamp: new Date().toISOString(),
          relativeTime: 'Just now',
        },
        activities: [newAct, ...(person.activities || [])],
      });
      setCallNotes('');
    } else if (activeTab === 'email') {
      if (!emailSubject.trim()) return;
      const newAct = {
        id: `act-${Date.now()}`,
        type: 'email' as const,
        title: `Email: ${emailSubject.trim()}`,
        description: emailBody.trim() || undefined,
        timestamp: new Date().toISOString(),
        relativeTime: 'Just now',
        author: 'Muhammad Taqi',
      };
      onUpdatePerson({
        ...person,
        lastActivity: {
          type: 'email',
          summary: `Sent "${emailSubject.trim()}"`,
          timestamp: new Date().toISOString(),
          relativeTime: 'Just now',
        },
        activities: [newAct, ...(person.activities || [])],
      });
      setEmailSubject('');
      setEmailBody('');
    } else if (activeTab === 'task') {
      if (!taskTitle.trim()) return;
      const newAct = {
        id: `act-${Date.now()}`,
        type: 'note' as const,
        title: `Task Created: ${taskTitle.trim()}`,
        description: `Due: ${taskDue}`,
        timestamp: new Date().toISOString(),
        relativeTime: 'Just now',
        author: 'Muhammad Taqi',
      };
      onUpdatePerson({
        ...person,
        activities: [newAct, ...(person.activities || [])],
      });
      setTaskTitle('');
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'call':         return <PhoneIcon className="w-4 h-4 text-blue-500" />;
      case 'email':        return <EnvelopeIcon className="w-4 h-4 text-amber-500" />;
      case 'text':         return <ChatBubbleLeftRightIcon className="w-4 h-4 text-emerald-500" />;
      case 'note':         return <DocumentTextIcon className="w-4 h-4 text-violet-500" />;
      case 'stage_change': return <ClockIcon className="w-4 h-4 text-primary" />;
      case 'tag_added':    return <TagIcon className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div
        className={`relative w-full max-w-4xl ${theme.bgPanel} border-l ${theme.border} shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-300`}
      >
        {/* Top Header */}
        <div className={`p-4 border-b ${theme.border} flex items-center justify-between shrink-0 bg-primary/5`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              {person.firstName[0]}
              {person.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base font-bold ${theme.textMain} leading-tight`}>
                  {person.contactName}
                </h2>
                <select
                  value={person.stage}
                  onChange={(e) => handleStageChange(e.target.value as PersonStage)}
                  className={`text-xs font-semibold py-0.5 px-2 rounded-md border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40 ${theme.bgSubtle} ${theme.border} ${theme.textMain}`}
                >
                  {PERSON_STAGES.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
              </div>
              <p className={`text-xs ${theme.textSubtle}`}>
                {person.businessName} &bull; {person.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete ${person.contactName} permanently?`)) {
                  onDeletePerson(person.id);
                  onClose();
                }
              }}
              className="text-xs text-rose-500 hover:text-rose-600 px-2.5 py-1 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg ${theme.textMuted} hover:${theme.textMain} ${theme.hoverBg} transition-colors cursor-pointer`}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body — 2 Column Layout */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          {/* Left Column: Contact Profile & Meta (1/3) */}
          <div className={`w-full md:w-80 p-5 border-b md:border-b-0 md:border-r ${theme.border} space-y-5 shrink-0 ${theme.bgSubtle}`}>
            {/* Quick Contact Links */}
            <div className="space-y-2">
              <span className={`text-[11px] uppercase font-bold tracking-wider ${theme.textSubtle}`}>
                Contact Info
              </span>
              <div className="space-y-2 text-xs">
                <a
                  href={`tel:${person.phone}`}
                  className={`flex items-center gap-2 p-2 rounded-lg border ${theme.border} ${theme.bgPanel} ${theme.textMain} hover:border-primary transition-colors`}
                >
                  <PhoneIcon className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{person.phone}</span>
                </a>
                <a
                  href={`mailto:${person.email}`}
                  className={`flex items-center gap-2 p-2 rounded-lg border ${theme.border} ${theme.bgPanel} ${theme.textMain} hover:border-primary transition-colors`}
                >
                  <EnvelopeIcon className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{person.email}</span>
                </a>
              </div>
            </div>

            {/* Tags Manager */}
            <div className="space-y-2">
              <span className={`text-[11px] uppercase font-bold tracking-wider ${theme.textSubtle}`}>
                Tags
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {person.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/25"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:opacity-75 cursor-pointer ml-0.5"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Tag form */}
              <div className="flex items-center gap-1.5 mt-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(newTagInput);
                    }
                  }}
                  placeholder="Type tag & Enter..."
                  className={`text-xs px-2.5 py-1.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:ring-1 focus:ring-primary w-full`}
                />
                <button
                  type="button"
                  onClick={() => handleAddTag(newTagInput)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Quick Tag Pills */}
              <div className="flex items-center gap-1 flex-wrap pt-1">
                {COMMON_FUB_TAGS.filter((t) => !person.tags.includes(t))
                  .slice(0, 5)
                  .map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleAddTag(t)}
                      className={`text-[10px] px-2 py-0.5 rounded border ${theme.border} ${theme.bgPanel} ${theme.textMuted} hover:text-primary transition-colors cursor-pointer`}
                    >
                      +{t}
                    </button>
                  ))}
              </div>
            </div>

            {/* Pipeline Attributes */}
            <div className="space-y-3 pt-2 border-t border-border">
              <span className={`text-[11px] uppercase font-bold tracking-wider ${theme.textSubtle}`}>
                Pipeline Data
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className={theme.textSubtle}>Estimated Value</span>
                  <span className={`font-semibold ${theme.textMain}`}>
                    ${person.dealValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={theme.textSubtle}>Source</span>
                  <span className={`font-medium ${theme.textMain}`}>{person.source}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={theme.textSubtle}>Assigned Agent</span>
                  <span className={`font-medium ${theme.textMain}`}>{person.assignedTo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={theme.textSubtle}>Created</span>
                  <span className={theme.textMuted}>{person.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {person.notes && (
              <div className="space-y-1.5 pt-2 border-t border-border">
                <span className={`text-[11px] uppercase font-bold tracking-wider ${theme.textSubtle}`}>
                  Overview Notes
                </span>
                <p className={`text-xs ${theme.textMuted} bg-white dark:bg-zinc-800/60 p-2.5 rounded-lg border ${theme.border} italic`}>
                  "{person.notes}"
                </p>
              </div>
            )}
          </div>

          {/* Right Column: FUB Quick Actions Bar & Activity Feed (2/3) */}
          <div className="flex-1 p-5 space-y-5">
            {/* Action Bar Tabs */}
            <div className={`${theme.bgPanel} rounded-xl border ${theme.border} p-3 shadow-xs space-y-3`}>
              <div className="flex items-center gap-1 border-b border-border pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('note')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'note'
                      ? 'bg-primary text-white shadow-xs'
                      : `${theme.textMuted} hover:${theme.textMain} ${theme.hoverBg}`
                  }`}
                >
                  <DocumentTextIcon className="w-3.5 h-3.5" />
                  <span>Log Note</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('call')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'call'
                      ? 'bg-primary text-white shadow-xs'
                      : `${theme.textMuted} hover:${theme.textMain} ${theme.hoverBg}`
                  }`}
                >
                  <PhoneIcon className="w-3.5 h-3.5" />
                  <span>Log Call</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('email')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'email'
                      ? 'bg-primary text-white shadow-xs'
                      : `${theme.textMuted} hover:${theme.textMain} ${theme.hoverBg}`
                  }`}
                >
                  <EnvelopeIcon className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('task')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === 'task'
                      ? 'bg-primary text-white shadow-xs'
                      : `${theme.textMuted} hover:${theme.textMain} ${theme.hoverBg}`
                  }`}
                >
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  <span>Create Task</span>
                </button>
              </div>

              {/* Action Form */}
              <form onSubmit={handleAddActivity} className="space-y-3">
                {activeTab === 'note' && (
                  <textarea
                    rows={3}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write a note about this contact, discussions, or next steps..."
                    className={`w-full text-xs p-3 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:ring-1 focus:ring-primary`}
                  />
                )}

                {activeTab === 'call' && (
                  <div className="space-y-2">
                    <select
                      value={callOutcome}
                      onChange={(e) => setCallOutcome(e.target.value)}
                      className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none`}
                    >
                      <option>Connected — Left Note</option>
                      <option>Connected — Next Meeting Booked</option>
                      <option>Connected — Not Interested</option>
                      <option>Left Voicemail</option>
                      <option>No Answer / Busy</option>
                      <option>Wrong Number</option>
                    </select>
                    <textarea
                      rows={2}
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      placeholder="Add call notes (optional)..."
                      className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none`}
                    />
                  </div>
                )}

                {activeTab === 'email' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Subject line..."
                      className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none`}
                    />
                    <textarea
                      rows={3}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Type your email message..."
                      className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none`}
                    />
                  </div>
                )}

                {activeTab === 'task' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Follow up task description..."
                      className={`flex-1 text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none`}
                    />
                    <select
                      value={taskDue}
                      onChange={(e) => setTaskDue(e.target.value)}
                      className={`text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                    >
                      <option>Today</option>
                      <option>Tomorrow</option>
                      <option>In 3 Days</option>
                      <option>Next Week</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 transition-colors shadow-xs cursor-pointer"
                  >
                    <PaperAirplaneIcon className="w-3.5 h-3.5" />
                    <span>Save {activeTab === 'note' ? 'Note' : activeTab === 'call' ? 'Call' : activeTab === 'email' ? 'Email' : 'Task'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Activity Stream Feed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs uppercase font-bold tracking-wider ${theme.textSubtle}`}>
                  Activity Timeline ({person.activities?.length || 0})
                </span>
                <span className={`text-[11px] ${theme.textSubtle}`}>
                  Reverse Chronological
                </span>
              </div>

              {(!person.activities || person.activities.length === 0) ? (
                <div className={`p-8 rounded-xl border ${theme.border} text-center ${theme.textSubtle} text-xs`}>
                  No activities recorded yet. Log your first note or call above!
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800">
                  {person.activities.map((act) => (
                    <div key={act.id} className="relative group">
                      {/* Timeline icon node */}
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 flex items-center justify-center shrink-0">
                        {getActivityIcon(act.type)}
                      </div>

                      {/* Content Card */}
                      <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgPanel} shadow-2xs space-y-1`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${theme.textMain}`}>
                            {act.title}
                          </span>
                          <span className={`text-[10px] ${theme.textSubtle}`}>
                            {act.relativeTime}
                          </span>
                        </div>
                        {act.description && (
                          <p className={`text-xs ${theme.textMuted} whitespace-pre-wrap`}>
                            {act.description}
                          </p>
                        )}
                        <span className={`text-[10px] ${theme.textSubtle} block pt-1`}>
                          By {act.author}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
