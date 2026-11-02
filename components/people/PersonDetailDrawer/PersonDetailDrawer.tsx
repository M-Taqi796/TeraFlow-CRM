'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClockIcon,
  TrashIcon,
  PencilSquareIcon,
  PlusIcon,
  CheckIcon,
  GlobeAltIcon,
  MapPinIcon,
  FunnelIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { ScheduleMeetingModal } from '@/components/meetings/ScheduleMeetingModal/ScheduleMeetingModal';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type {
  Person,
  PersonStage,
  ActivityType,
  ContactFieldType,
  ContactInfoField,
} from '@/types/person.types';
import { PERSON_STAGES, DEFAULT_NICHES, DEFAULT_CITIES } from '@/types/person.types';

interface PersonDetailDrawerProps {
  person: Person | null;
  onClose: () => void;
  onUpdatePerson: (updated: Person) => void;
  onDeletePerson: (id: string) => void;
}

type ActionMode = 'call' | 'email' | 'note' | 'none';

export function PersonDetailDrawer({
  person,
  onClose,
  onUpdatePerson,
  onDeletePerson,
}: PersonDetailDrawerProps) {
  const { theme, isDarkMode } = useThemeContext();
  const {
    allTags,
    onAddGlobalTag,
    customNiches,
    onAddCustomNiche,
    customCities,
    onAddCustomCity,
  } = useCRM();

  // Mode: none, call, email, note
  const [actionMode, setActionMode] = useState<ActionMode>('none');
  const [isScheduleMeetingOpen, setIsScheduleMeetingOpen] = useState(false);

  // Editing Company & Person Name
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [editBusinessName, setEditBusinessName] = useState(person?.businessName || '');
  const [editContactName, setEditContactName] = useState(person?.contactName || '');

  // Notes editing state
  const [notesDraft, setNotesDraft] = useState(person?.notes || '');
  const [notesSaved, setNotesSaved] = useState(false);

  // Call logging form
  const [callStatus, setCallStatus] = useState<'Answered' | 'Not answered' | 'Call failed' | 'Busy' | 'Left Voicemail' | 'Wrong Number'>('Answered');
  const [callComment, setCallComment] = useState('');
  const [callDateTime, setCallDateTime] = useState('');

  // Email logging form
  const [emailType, setEmailType] = useState<'Sent' | 'Reply'>('Sent');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailComment, setEmailComment] = useState('');
  const [emailDateTime, setEmailDateTime] = useState('');

  // Populate default date-time client side only to avoid prerender mismatch
  useEffect(() => {
    const now = new Date().toISOString().slice(0, 16);
    setCallDateTime(now);
    setEmailDateTime(now);
  }, []);

  // Add Contact Field form
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldType, setNewFieldType] = useState<ContactFieldType>('phone');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');

  // Inline Contact Info Editing states
  const [editingPhoneIdx, setEditingPhoneIdx] = useState<number | null>(null);
  const [editingPhoneVal, setEditingPhoneVal] = useState('');

  const [editingEmailIdx, setEditingEmailIdx] = useState<number | null>(null);
  const [editingEmailVal, setEditingEmailVal] = useState('');

  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editingFieldLabel, setEditingFieldLabel] = useState('');
  const [editingFieldVal, setEditingFieldVal] = useState('');

  // Niche & City Editing state
  const [isEditingNicheCity, setIsEditingNicheCity] = useState(false);
  const [editNiche, setEditNiche] = useState(person?.niche || 'Dentists');
  const [isCustomEditNiche, setIsCustomEditNiche] = useState(false);
  const [customEditNiche, setCustomEditNiche] = useState('');
  const [editCity, setEditCity] = useState(person?.city || 'New York');
  const [isCustomEditCity, setIsCustomEditCity] = useState(false);
  const [customEditCity, setCustomEditCity] = useState('');

  // Combined Niches & Cities
  const combinedNiches = useMemo(
    () => Array.from(new Set([...DEFAULT_NICHES, ...customNiches])),
    [customNiches]
  );
  const combinedCities = useMemo(
    () => Array.from(new Set([...DEFAULT_CITIES, ...customCities])),
    [customCities]
  );

  // Add Tag input
  const [newTagInput, setNewTagInput] = useState('');

  // Tag Suggestions: all tags in DB that are not assigned to this person
  const suggestedTags = useMemo(() => {
    if (!person) return [];
    return allTags.filter((t) => !person.tags.includes(t));
  }, [allTags, person?.tags]);

  // Timeline Filter (multi-select checkboxes)
  const [timelineFilterOpen, setTimelineFilterOpen] = useState(false);
  const [selectedTimelineTypes, setSelectedTimelineTypes] = useState<ActivityType[]>([
    'call',
    'email',
    'stage_change',
    'tag_added',
    'tag_removed',
    'note',
    'contact_info',
    'name_change',
  ]);

  const filteredActivities = useMemo(() => {
    if (!person) return [];
    return (person.activities || []).filter((act) => {
      if (act.type === 'tag_removed' && !selectedTimelineTypes.includes('tag_added')) return false;
      return selectedTimelineTypes.includes(act.type);
    });
  }, [person?.activities, selectedTimelineTypes]);

  if (!person) return null;

  // Format date helper
  const formatDateTimeDisplay = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // 1. Stage change
  const handleStageChange = (newStage: PersonStage) => {
    const act = {
      id: `act-${Date.now()}`,
      type: 'stage_change' as const,
      title: `Stage Changed to "${newStage}"`,
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

  // 2. Save Names
  const handleSaveNames = () => {
    const trimmedBusiness = editBusinessName.trim();
    const trimmedContact = editContactName.trim();
    if (!trimmedBusiness) {
      alert('Company/Business Name cannot be empty.');
      return;
    }
    const act = {
      id: `act-${Date.now()}`,
      type: 'name_change' as const,
      title: 'Company / Contact Name Updated',
      description: `Updated name to: ${trimmedBusiness}${trimmedContact ? ` (${trimmedContact})` : ''}`,
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      author: 'Muhammad Taqi',
    };
    onUpdatePerson({
      ...person,
      businessName: trimmedBusiness,
      contactName: trimmedContact,
      activities: [act, ...(person.activities || [])],
    });
    setIsEditingNames(false);
  };

  // 3. Save Overview Notes
  const handleSaveNotes = () => {
    const act = {
      id: `act-${Date.now()}`,
      type: 'note' as const,
      title: 'Overview Notes Updated',
      description: notesDraft.trim() || 'Notes cleared.',
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      author: 'Muhammad Taqi',
    };
    onUpdatePerson({
      ...person,
      notes: notesDraft.trim(),
      activities: [act, ...(person.activities || [])],
    });
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  // 4. Log Manual Call
  const handleLogCall = (e: React.FormEvent) => {
    e.preventDefault();
    const targetDate = callDateTime ? new Date(callDateTime) : new Date();
    const formattedDate = formatDateTimeDisplay(targetDate.toISOString());
    const summary = callComment.trim() || `Call status: ${callStatus}`;
    const act = {
      id: `act-${Date.now()}`,
      type: 'call' as const,
      title: `Phone Call (${callStatus})`,
      callStatus,
      description: callComment.trim() || undefined,
      timestamp: targetDate.toISOString(),
      relativeTime: formattedDate,
      author: 'Muhammad Taqi',
    };
    onUpdatePerson({
      ...person,
      lastActivity: {
        type: 'call',
        summary: `Call: ${callStatus} — ${summary.slice(0, 40)}`,
        timestamp: targetDate.toISOString(),
        relativeTime: formattedDate,
      },
      activities: [act, ...(person.activities || [])],
    });
    setCallComment('');
    setActionMode('none');
  };

  // 5. Log Email
  const handleLogEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim()) {
      alert('Please provide an email subject.');
      return;
    }
    const targetDate = emailDateTime ? new Date(emailDateTime) : new Date();
    const formattedDate = formatDateTimeDisplay(targetDate.toISOString());
    const act = {
      id: `act-${Date.now()}`,
      type: 'email' as const,
      title: `Email ${emailType}: ${emailSubject.trim()}`,
      emailType,
      emailSubject: emailSubject.trim(),
      description: emailComment.trim() || undefined,
      timestamp: targetDate.toISOString(),
      relativeTime: formattedDate,
      author: 'Muhammad Taqi',
    };
    onUpdatePerson({
      ...person,
      lastActivity: {
        type: 'email',
        summary: `Email ${emailType}: ${emailSubject.trim()}`,
        timestamp: targetDate.toISOString(),
        relativeTime: formattedDate,
      },
      activities: [act, ...(person.activities || [])],
    });
    setEmailSubject('');
    setEmailComment('');
    setActionMode('none');
  };

  // 6. Add Contact Field
  const handleAddContactField = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newFieldValue.trim();
    if (!val) return;

    const defaultLabels: Record<ContactFieldType, string> = {
      phone: 'Phone',
      email: 'Email',
      linkedin: 'LinkedIn',
      facebook: 'Facebook',
      instagram: 'Instagram',
      website: 'Website',
      address: 'Address',
    };

    const newField: ContactInfoField = {
      id: `cf-${Date.now()}`,
      type: newFieldType,
      label: newFieldLabel.trim() || defaultLabels[newFieldType],
      value: val,
    };

    let updatedPhones = [...person.phones];
    let updatedEmails = [...person.emails];
    if (newFieldType === 'phone' && !updatedPhones.includes(val)) {
      updatedPhones.push(val);
    }
    if (newFieldType === 'email' && !updatedEmails.includes(val)) {
      updatedEmails.push(val);
    }

    const act = {
      id: `act-${Date.now()}`,
      type: 'contact_info' as const,
      title: `Added Contact Field (${newField.label})`,
      description: `${newField.label}: ${val}`,
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      author: 'Muhammad Taqi',
    };

    onUpdatePerson({
      ...person,
      phones: updatedPhones,
      emails: updatedEmails,
      contactFields: [...(person.contactFields || []), newField],
      activities: [act, ...(person.activities || [])],
    });

    setNewFieldValue('');
    setNewFieldLabel('');
    setIsAddingField(false);
  };

  // 7. Remove Contact Field
  const handleRemoveContactField = (fieldId: string) => {
    const field = person.contactFields?.find((f) => f.id === fieldId);
    const act = {
      id: `act-${Date.now()}`,
      type: 'contact_info' as const,
      title: 'Removed Contact Field',
      description: field ? `${field.label}: ${field.value}` : 'Contact field removed',
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      author: 'Muhammad Taqi',
    };
    onUpdatePerson({
      ...person,
      contactFields: (person.contactFields || []).filter((f) => f.id !== fieldId),
      activities: [act, ...(person.activities || [])],
    });
  };

  // 7a. Edit & Save Phone
  const handleSavePhoneEdit = (idx: number) => {
    const newVal = editingPhoneVal.trim();
    if (!newVal) return;
    const oldVal = person.phones[idx];
    const updatedPhones = [...person.phones];
    updatedPhones[idx] = newVal;

    const act = {
      id: `act-${Date.now()}`,
      type: 'contact_info' as const,
      title: 'Phone Updated',
      description: `Phone changed from "${oldVal}" to "${newVal}".`,
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      author: 'Muhammad Taqi',
    };

    onUpdatePerson({
      ...person,
      phones: updatedPhones,
      activities: [act, ...(person.activities || [])],
    });
    setEditingPhoneIdx(null);
  };

  const handleDeletePhone = (idx: number) => {
    if (person.phones.length <= 1) {
      alert('A contact must have at least one phone field (it can be empty).');
      return;
    }
    const oldVal = person.phones[idx];
    const updatedPhones = person.phones.filter((_, i) => i !== idx);

    const act = {
      id: `act-${Date.now()}`,
      type: 'contact_info' as const,
      title: 'Phone Removed',
      description: `Removed phone "${oldVal}".`,
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      author: 'Muhammad Taqi',
    };

    onUpdatePerson({
      ...person,
      phones: updatedPhones,
      activities: [act, ...(person.activities || [])],
    });
  };

  // 7b. Edit & Save Email
  const handleSaveEmailEdit = (idx: number) => {
    const newVal = editingEmailVal.trim();
    if (!newVal) return;
    const oldVal = person.emails[idx];
    const updatedEmails = [...person.emails];
    updatedEmails[idx] = newVal;

    const act = {
      id: `act-${Date.now()}`,
      type: 'contact_info' as const,
      title: 'Email Updated',
      description: `Email changed from "${oldVal}" to "${newVal}".`,
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      author: 'Muhammad Taqi',
    };

    onUpdatePerson({
      ...person,
      emails: updatedEmails,
      activities: [act, ...(person.activities || [])],
    });
    setEditingEmailIdx(null);
  };

  const handleDeleteEmail = (idx: number) => {
    if (person.emails.length <= 1) {
      alert('A contact must have at least one email field (it can be empty).');
      return;
    }
    const oldVal = person.emails[idx];
    const updatedEmails = person.emails.filter((_, i) => i !== idx);

    const act = {
      id: `act-${Date.now()}`,
      type: 'contact_info' as const,
      title: 'Email Removed',
      description: `Removed email "${oldVal}".`,
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      author: 'Muhammad Taqi',
    };

    onUpdatePerson({
      ...person,
      emails: updatedEmails,
      activities: [act, ...(person.activities || [])],
    });
  };

  // 7c. Edit & Save Custom Field
  const handleSaveCustomFieldEdit = (fieldId: string) => {
    const newVal = editingFieldVal.trim();
    const newLabel = editingFieldLabel.trim();
    if (!newVal) return;

    const updatedFields = (person.contactFields || []).map((f) =>
      f.id === fieldId ? { ...f, label: newLabel || f.label, value: newVal } : f
    );

    const act = {
      id: `act-${Date.now()}`,
      type: 'contact_info' as const,
      title: 'Contact Field Updated',
      description: `Updated ${newLabel || 'field'} to "${newVal}".`,
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      author: 'Muhammad Taqi',
    };

    onUpdatePerson({
      ...person,
      contactFields: updatedFields,
      activities: [act, ...(person.activities || [])],
    });
    setEditingFieldId(null);
  };

  // 7d. Edit & Save Niche & City
  const handleSaveNicheCity = () => {
    const effectiveNiche = isCustomEditNiche && customEditNiche.trim()
      ? customEditNiche.trim()
      : editNiche;
    const effectiveCity = isCustomEditCity && customEditCity.trim()
      ? customEditCity.trim()
      : editCity;

    if (isCustomEditNiche && customEditNiche.trim()) onAddCustomNiche(customEditNiche.trim());
    if (isCustomEditCity && customEditCity.trim()) onAddCustomCity(customEditCity.trim());

    const act = {
      id: `act-${Date.now()}`,
      type: 'note' as const,
      title: 'Niche & Location Updated',
      description: `Niche set to "${effectiveNiche}", City set to "${effectiveCity}".`,
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      author: 'Muhammad Taqi',
    };

    onUpdatePerson({
      ...person,
      niche: effectiveNiche,
      city: effectiveCity,
      activities: [act, ...(person.activities || [])],
    });
    setIsEditingNicheCity(false);
  };

  // 8. Add Tag (No # symbol, single word)
  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().replace(/^#/, '');
    if (!clean || person.tags.includes(clean)) return;
    onAddGlobalTag(clean);

    const act = {
      id: `act-${Date.now()}`,
      type: 'tag_added' as const,
      title: `Tag Added ("${clean}")`,
      description: `Added "${clean}"`,
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

  // 9. Remove Tag (No # symbol)
  const handleRemoveTag = (tagToRemove: string) => {
    const clean = tagToRemove.replace(/^#/, '');
    const act = {
      id: `act-${Date.now()}`,
      type: 'tag_removed' as const,
      title: `Tag Removed ("${clean}")`,
      description: `Removed "${clean}"`,
      timestamp: new Date().toISOString(),
      relativeTime: 'Just now',
      author: 'Muhammad Taqi',
    };
    onUpdatePerson({
      ...person,
      tags: person.tags.filter((t) => t.replace(/^#/, '') !== clean),
      activities: [act, ...(person.activities || [])],
    });
  };

  // Timeline Filtering
  const timelineCategories: { type: ActivityType; label: string }[] = [
    { type: 'call',         label: 'Calls' },
    { type: 'email',        label: 'Emails' },
    { type: 'stage_change', label: 'Stages' },
    { type: 'tag_added',    label: 'Tags' },
    { type: 'note',         label: 'Notes' },
    { type: 'contact_info', label: 'Contact Info' },
    { type: 'name_change',  label: 'Name Change' },
  ];

  const handleToggleTimelineType = (type: ActivityType) => {
    setSelectedTimelineTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSelectAllTimelineTypes = () => {
    setSelectedTimelineTypes([
      'call',
      'email',
      'stage_change',
      'tag_added',
      'tag_removed',
      'note',
      'contact_info',
      'name_change',
    ]);
  };

  // Icons for timeline events
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'call':         return <PhoneIcon className="w-3.5 h-3.5 text-blue-500" />;
      case 'email':        return <EnvelopeIcon className="w-3.5 h-3.5 text-amber-500" />;
      case 'stage_change': return <ClockIcon className="w-3.5 h-3.5 text-primary" />;
      case 'tag_added':
      case 'tag_removed':  return <PlusIcon className="w-3.5 h-3.5 text-emerald-500" />;
      case 'note':         return <DocumentTextIcon className="w-3.5 h-3.5 text-violet-500" />;
      case 'contact_info': return <GlobeAltIcon className="w-3.5 h-3.5 text-cyan-500" />;
      case 'name_change':  return <PencilSquareIcon className="w-3.5 h-3.5 text-teal-500" />;
    }
  };

  // Helper for field icon
  const getFieldIcon = (type: ContactFieldType) => {
    switch (type) {
      case 'phone':     return <PhoneIcon className="w-4 h-4 text-blue-500" />;
      case 'email':     return <EnvelopeIcon className="w-4 h-4 text-amber-500" />;
      case 'linkedin':  return <span className="text-xs font-bold text-blue-600">in</span>;
      case 'facebook':  return <span className="text-xs font-bold text-blue-500">fb</span>;
      case 'instagram': return <span className="text-xs font-bold text-pink-500">ig</span>;
      case 'website':   return <GlobeAltIcon className="w-4 h-4 text-emerald-500" />;
      case 'address':   return <MapPinIcon className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Centered Popup Dialog with Rounded Corners */}
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] ${theme.bgPanel} border ${theme.border} rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden animate-in zoom-in-95 fade-in duration-200`}
      >
        {/* Top Header */}
        <div className={`px-6 py-4 border-b ${theme.border} flex items-center justify-between shrink-0 ${theme.bgPanel}`}>
          {/* Company & Name (Company on Top) */}
          <div className="flex-1 min-w-0 pr-4">
            {isEditingNames ? (
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={editBusinessName}
                  onChange={(e) => setEditBusinessName(e.target.value)}
                  placeholder="Company / Business Name"
                  className={`text-sm font-bold px-2.5 py-1 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} w-1/2`}
                />
                <input
                  type="text"
                  value={editContactName}
                  onChange={(e) => setEditContactName(e.target.value)}
                  placeholder="Person Name (optional)"
                  className={`text-xs px-2.5 py-1 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} w-1/2`}
                />
                <button
                  type="button"
                  onClick={handleSaveNames}
                  className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary-600"
                  title="Save name"
                >
                  <CheckIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingNames(false)}
                  className={`p-1.5 rounded-lg ${theme.textMuted} hover:${theme.textMain}`}
                  title="Cancel"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <div className="overflow-hidden">
                  <h2 className={`text-lg sm:text-xl font-bold ${theme.textMain} truncate leading-tight`}>
                    {person.businessName}
                  </h2>
                  {person.contactName ? (
                    <p className={`text-xs font-medium ${theme.textMuted} truncate mt-0.5`}>
                      Contact: {person.contactName}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditBusinessName(person.businessName);
                    setEditContactName(person.contactName || '');
                    setIsEditingNames(true);
                  }}
                  title="Edit company / person name"
                  className={`p-1.5 rounded-lg text-slate-400 hover:${theme.textMain} hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0`}
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right Header Controls: Schedule Meeting + Stage + Bin + Close */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Schedule Meeting Button in Header */}
            <button
              type="button"
              onClick={() => setIsScheduleMeetingOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 transition-colors cursor-pointer shadow-xs"
              title="Schedule a meeting with this contact"
            >
              <CalendarDaysIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Schedule Meeting</span>
              <span className="sm:hidden">Meeting</span>
            </button>

            {/* Stage Selector */}
            <select
              value={person.stage}
              onChange={(e) => handleStageChange(e.target.value as PersonStage)}
              className={`text-xs font-semibold py-1.5 px-3 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40 ${theme.bgPanel} ${theme.border} ${theme.textMain}`}
            >
              {PERSON_STAGES.map((stg) => (
                <option key={stg} value={stg} className="bg-white text-gray-900 dark:bg-zinc-800 dark:text-zinc-100">
                  {stg}
                </option>
              ))}
            </select>

            {/* Trash / Bin Icon */}
            <button
              type="button"
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${person.businessName}?`)) {
                  onDeletePerson(person.id);
                  onClose();
                }
              }}
              title="Delete contact"
              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <TrashIcon className="w-5 h-5" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className={`p-1.5 rounded-lg ${theme.textMuted} hover:${theme.textMain} ${theme.hoverBg} transition-colors cursor-pointer`}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body — 2 Column Layout */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column (5 cols): Contact Info, Tags, Overview Notes, Niche & City */}
          <div className="md:col-span-5 space-y-5">
            {/* Contact Info Card */}
            <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgPanel} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${theme.textMain}`}>
                  Contact Info
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingField((prev) => !prev)}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Add Field</span>
                </button>
              </div>

              {/* Add Field Inline Form */}
              {isAddingField && (
                <form onSubmit={handleAddContactField} className={`p-3 rounded-lg border ${theme.border} ${theme.bgPanel} space-y-2.5 animate-in fade-in`}>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value as ContactFieldType)}
                      className={`text-xs p-1.5 rounded-md border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                    >
                      <option value="phone">Phone Number</option>
                      <option value="email">Email Address</option>
                      <option value="linkedin">LinkedIn URL</option>
                      <option value="facebook">Facebook URL</option>
                      <option value="instagram">Instagram Handle</option>
                      <option value="website">Website Link</option>
                      <option value="address">Physical Address</option>
                    </select>
                    <input
                      type="text"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      placeholder="Label (e.g. Mobile, Office)"
                      className={`text-xs p-1.5 rounded-md border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                    />
                  </div>
                  <input
                    type="text"
                    required
                    value={newFieldValue}
                    onChange={(e) => setNewFieldValue(e.target.value)}
                    placeholder="Enter value..."
                    className={`w-full text-xs p-1.5 rounded-md border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingField(false)}
                      className={`px-2.5 py-1 text-xs ${theme.textMuted} hover:${theme.textMain}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-md text-xs font-semibold bg-primary text-white hover:bg-primary-600"
                    >
                      Save Field
                    </button>
                  </div>
                </form>
              )}

              {/* Displayed Fields with Inline Edit & Delete */}
              <div className="space-y-1 text-xs">
                {/* Primary & Additional Phones */}
                {person.phones.map((ph, idx) => (
                  <div key={`phone-${idx}`} className={`p-2 rounded-lg ${theme.hoverBg} group transition-colors`}>
                    {editingPhoneIdx === idx ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingPhoneVal}
                          onChange={(e) => setEditingPhoneVal(e.target.value)}
                          placeholder="Enter phone number..."
                          className={`flex-1 text-xs p-1.5 rounded-md border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                        />
                        <button
                          type="button"
                          onClick={() => handleSavePhoneEdit(idx)}
                          className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                          title="Save phone"
                        >
                          <CheckIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPhoneIdx(null)}
                          className={`p-1 rounded-md ${theme.textMuted} hover:${theme.textMain} cursor-pointer`}
                          title="Cancel"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <PhoneIcon className="w-4 h-4 text-blue-500 shrink-0" />
                          <div className="truncate">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                              {idx === 0 ? 'Primary Phone' : `Phone ${idx + 1}`}
                            </span>
                            <a href={`tel:${ph}`} className={`font-semibold ${theme.textMain} hover:text-primary`}>
                              {ph || <span className="italic text-slate-400 font-normal">No number added</span>}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPhoneIdx(idx);
                              setEditingPhoneVal(ph);
                            }}
                            className="p-1 text-slate-400 hover:text-primary cursor-pointer rounded"
                            title="Edit phone"
                          >
                            <PencilSquareIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePhone(idx)}
                            className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer rounded"
                            title="Delete phone"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Primary & Additional Emails */}
                {person.emails.map((em, idx) => (
                  <div key={`email-${idx}`} className={`p-2 rounded-lg ${theme.hoverBg} group transition-colors`}>
                    {editingEmailIdx === idx ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="email"
                          value={editingEmailVal}
                          onChange={(e) => setEditingEmailVal(e.target.value)}
                          placeholder="Enter email address..."
                          className={`flex-1 text-xs p-1.5 rounded-md border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEmailEdit(idx)}
                          className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                          title="Save email"
                        >
                          <CheckIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingEmailIdx(null)}
                          className={`p-1 rounded-md ${theme.textMuted} hover:${theme.textMain} cursor-pointer`}
                          title="Cancel"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <EnvelopeIcon className="w-4 h-4 text-amber-500 shrink-0" />
                          <div className="truncate">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                              {idx === 0 ? 'Primary Email' : `Email ${idx + 1}`}
                            </span>
                            <a href={`mailto:${em}`} className={`font-semibold ${theme.textMain} hover:text-primary truncate block`}>
                              {em || <span className="italic text-slate-400 font-normal">No email added</span>}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEmailIdx(idx);
                              setEditingEmailVal(em);
                            }}
                            className="p-1 text-slate-400 hover:text-primary cursor-pointer rounded"
                            title="Edit email"
                          >
                            <PencilSquareIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEmail(idx)}
                            className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer rounded"
                            title="Delete email"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Dynamic Contact Fields (Website, Social, Address, etc.) */}
                {(person.contactFields || []).map((cf) => (
                  <div key={cf.id} className={`p-2 rounded-lg ${theme.hoverBg} group transition-colors`}>
                    {editingFieldId === cf.id ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={editingFieldLabel}
                          onChange={(e) => setEditingFieldLabel(e.target.value)}
                          placeholder="Field label..."
                          className={`w-full text-xs p-1.5 rounded-md border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                        />
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingFieldVal}
                            onChange={(e) => setEditingFieldVal(e.target.value)}
                            placeholder="Field value..."
                            className={`flex-1 text-xs p-1.5 rounded-md border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveCustomFieldEdit(cf.id)}
                            className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                            title="Save field"
                          >
                            <CheckIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingFieldId(null)}
                            className={`p-1 rounded-md ${theme.textMuted} hover:${theme.textMain} cursor-pointer`}
                            title="Cancel"
                          >
                            <XMarkIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-5 flex justify-center shrink-0">
                            {getFieldIcon(cf.type)}
                          </div>
                          <div className="truncate">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                              {cf.label}
                            </span>
                            <span className={`font-semibold ${theme.textMain} truncate block`}>
                              {cf.value}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFieldId(cf.id);
                              setEditingFieldLabel(cf.label);
                              setEditingFieldVal(cf.value);
                            }}
                            className="p-1 text-slate-400 hover:text-primary cursor-pointer rounded"
                            title="Edit field"
                          >
                            <PencilSquareIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveContactField(cf.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer rounded"
                            title="Remove field"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags Box */}
            <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgPanel} space-y-3`}>
              <span className={`text-xs font-bold uppercase tracking-wider ${theme.textMain} block`}>
                Tags
              </span>

              {/* 1. Assigned Tags */}
              <div className="flex items-center gap-1.5 flex-wrap min-h-[24px]">
                {person.tags.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No tags assigned yet.</span>
                ) : (
                  person.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium border ${theme.border} ${theme.bgPanel} ${theme.textMain}`}
                    >
                      <span>{tag.replace(/^#/, '')}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-rose-500 cursor-pointer ml-1 text-slate-400"
                        title="Remove tag"
                      >
                        &times;
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* 2. Suggestions (all other tags in DB) */}
              {suggestedTags.length > 0 && (
                <div className={`space-y-1.5 pt-1 border-t ${theme.border}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Suggestions (Click to add)
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {suggestedTags.slice(0, 10).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag)}
                        className={`text-[11px] px-2 py-0.5 rounded-md border border-dashed border-slate-300 dark:border-zinc-700 ${theme.hoverBg} ${theme.textMuted} hover:text-primary hover:border-primary transition-colors cursor-pointer flex items-center gap-1`}
                      >
                        <PlusIcon className="w-3 h-3" />
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Option to Add a New Tag */}
              <div className="flex items-center gap-1.5 pt-1">
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
                  placeholder="Add a new tag (e.g. VIP, Buyer)..."
                  className={`text-xs px-2.5 py-1.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} w-full focus:outline-none focus:border-primary`}
                />
                <button
                  type="button"
                  onClick={() => handleAddTag(newTagInput)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 shrink-0 cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Niche & Location (Editable) */}
            <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgPanel} space-y-2.5 text-xs`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${theme.textMain}`}>
                  Niche & Location
                </span>
                {!isEditingNicheCity && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingNicheCity(true);
                      setEditNiche(person.niche || 'Dentists');
                      setEditCity(person.city || 'New York');
                      setIsCustomEditNiche(false);
                      setIsCustomEditCity(false);
                    }}
                    className={`p-1 rounded-md text-slate-400 hover:text-primary cursor-pointer`}
                    title="Edit Niche and Location"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isEditingNicheCity ? (
                <div className="space-y-3 pt-1 animate-in fade-in">
                  {/* Edit Niche */}
                  <div className="space-y-1">
                    <label className={`text-[11px] font-medium ${theme.textSubtle}`}>Niche</label>
                    {!isCustomEditNiche ? (
                      <select
                        value={editNiche}
                        onChange={(e) => {
                          if (e.target.value === '__add_new__') {
                            setIsCustomEditNiche(true);
                          } else {
                            setEditNiche(e.target.value);
                          }
                        }}
                        className={`w-full text-xs p-1.5 rounded-md border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                      >
                        {combinedNiches.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                        <option value="__add_new__">+ Add New Niche...</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={customEditNiche}
                          onChange={(e) => setCustomEditNiche(e.target.value)}
                          placeholder="Type custom niche..."
                          className={`w-full text-xs p-1.5 rounded-md border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                        />
                        <button
                          type="button"
                          onClick={() => setIsCustomEditNiche(false)}
                          className="text-xs text-slate-400 p-1"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Edit City */}
                  <div className="space-y-1">
                    <label className={`text-[11px] font-medium ${theme.textSubtle}`}>City / Location</label>
                    {!isCustomEditCity ? (
                      <select
                        value={editCity}
                        onChange={(e) => {
                          if (e.target.value === '__add_new__') {
                            setIsCustomEditCity(true);
                          } else {
                            setEditCity(e.target.value);
                          }
                        }}
                        className={`w-full text-xs p-1.5 rounded-md border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                      >
                        {combinedCities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                        <option value="__add_new__">+ Add New City...</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={customEditCity}
                          onChange={(e) => setCustomEditCity(e.target.value)}
                          placeholder="Type custom city..."
                          className={`w-full text-xs p-1.5 rounded-md border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                        />
                        <button
                          type="button"
                          onClick={() => setIsCustomEditCity(false)}
                          className="text-xs text-slate-400 p-1"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingNicheCity(false)}
                      className={`px-2.5 py-1 text-xs ${theme.textMuted} hover:${theme.textMain} cursor-pointer`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNicheCity}
                      className="px-3 py-1 rounded-md text-xs font-semibold bg-primary text-white hover:bg-primary-600 cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pt-1">
                    <span className={theme.textSubtle}>Niche</span>
                    <span className={`font-semibold ${theme.textMain}`}>{person.niche || 'General'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={theme.textSubtle}>City / Region</span>
                    <span className={`font-semibold ${theme.textMain}`}>{person.city || 'United States'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={theme.textSubtle}>Created Date</span>
                    <span className={theme.textMuted}>{person.createdAt}</span>
                  </div>
                </>
              )}
            </div>

            {/* Overview Notes Box: High-Contrast, Clean, Editable & Saveable */}
            <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgPanel} space-y-2.5 shadow-xs`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${theme.textMain}`}>
                  Overview Notes
                </span>
                {notesSaved && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckIcon className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </span>
                )}
              </div>
              <textarea
                rows={3}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Write general notes, account background, or context..."
                className={`w-full text-xs p-3 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none`}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 transition-colors cursor-pointer shadow-xs"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Manual Phone Call / Email Logging & Activity Timeline */}
          <div className="md:col-span-7 space-y-5">
            {/* Quick Logging Buttons */}
            <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgPanel} shadow-xs space-y-3`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${theme.textMain}`}>
                  Log Communication
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (actionMode !== 'call') {
                        setCallDateTime(new Date().toISOString().slice(0, 16));
                        setActionMode('call');
                      } else {
                        setActionMode('none');
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      actionMode === 'call'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                    }`}
                  >
                    <PhoneIcon className="w-3.5 h-3.5" />
                    <span>Log Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (actionMode !== 'email') {
                        setEmailDateTime(new Date().toISOString().slice(0, 16));
                        setActionMode('email');
                      } else {
                        setActionMode('none');
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      actionMode === 'email'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                    }`}
                  >
                    <EnvelopeIcon className="w-3.5 h-3.5" />
                    <span>Log Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsScheduleMeetingOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary/30 text-primary hover:bg-primary/5 dark:hover:bg-primary/20 transition-colors cursor-pointer"
                    title="Schedule a meeting with this contact"
                  >
                    <CalendarDaysIcon className="w-3.5 h-3.5" />
                    <span>Schedule Meeting</span>
                  </button>
                </div>
              </div>

              {/* Call Logging Form */}
              {actionMode === 'call' && (
                <form onSubmit={handleLogCall} className={`p-3.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20 space-y-3 animate-in fade-in`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className={`block text-[11px] font-bold uppercase ${theme.textMain} mb-1`}>
                        Call Status
                      </label>
                      <select
                        value={callStatus}
                        onChange={(e) => setCallStatus(e.target.value as any)}
                        className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                      >
                        <option>Answered</option>
                        <option>Not answered</option>
                        <option>Call failed</option>
                        <option>Busy</option>
                        <option>Left Voicemail</option>
                        <option>Wrong Number</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-[11px] font-bold uppercase ${theme.textMain} mb-1`}>
                        Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={callDateTime}
                        onChange={(e) => setCallDateTime(e.target.value)}
                        className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold uppercase ${theme.textMain} mb-1`}>
                      Call Comment / Outcome Summary
                    </label>
                    <textarea
                      rows={2}
                      value={callComment}
                      onChange={(e) => setCallComment(e.target.value)}
                      placeholder="Write what was discussed or next steps..."
                      className={`w-full text-xs p-2.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActionMode('none')}
                      className={`px-3 py-1.5 text-xs ${theme.textMuted} hover:${theme.textMain}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                    >
                      Save Call
                    </button>
                  </div>
                </form>
              )}

              {/* Email Logging Form */}
              {actionMode === 'email' && (
                <form onSubmit={handleLogEmail} className={`p-3.5 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20 space-y-3 animate-in fade-in`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className={`block text-[11px] font-bold uppercase ${theme.textMain} mb-1`}>
                        Email Type
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEmailType('Sent')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                            emailType === 'Sent'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : `${theme.bgPanel} ${theme.border} ${theme.textMuted}`
                          }`}
                        >
                          Sent (Outbound)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmailType('Reply')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                            emailType === 'Reply'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : `${theme.bgPanel} ${theme.border} ${theme.textMuted}`
                          }`}
                        >
                          Reply (Inbound)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[11px] font-bold uppercase ${theme.textMain} mb-1`}>
                        Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={emailDateTime}
                        onChange={(e) => setEmailDateTime(e.target.value)}
                        className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold uppercase ${theme.textMain} mb-1`}>
                      Subject Line *
                    </label>
                    <input
                      type="text"
                      required
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="e.g. Following up on dental CRM demo"
                      className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold uppercase ${theme.textMain} mb-1`}>
                      Comment / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={emailComment}
                      onChange={(e) => setEmailComment(e.target.value)}
                      placeholder="Summary or copy of message sent/received..."
                      className={`w-full text-xs p-2.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActionMode('none')}
                      className={`px-3 py-1.5 text-xs ${theme.textMuted} hover:${theme.textMain}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 shadow-xs cursor-pointer"
                    >
                      Save Email
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Activity Timeline Header with Multi-Select Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between relative">
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.textMain}`}>
                    Activity Timeline ({filteredActivities.length})
                  </h3>
                </div>

                {/* Filter Dropdown with Checkboxes */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTimelineFilterOpen((prev) => !prev)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${theme.border} ${theme.bgPanel} ${theme.textMain} hover:border-primary/50 transition-colors cursor-pointer shadow-xs`}
                  >
                    <FunnelIcon className="w-3.5 h-3.5 text-primary" />
                    <span>Filter Timeline</span>
                  </button>

                  {timelineFilterOpen && (
                    <div
                      className={`absolute right-0 mt-1.5 w-56 rounded-xl border ${theme.border} ${theme.bgPanel} shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100`}
                    >
                      <div className={`flex items-center justify-between pb-2 mb-2 border-b ${theme.border}`}>
                        <span className={`text-[11px] font-bold ${theme.textMain} uppercase tracking-wider`}>
                          Timeline Filters
                        </span>
                        <button
                          type="button"
                          onClick={handleSelectAllTimelineTypes}
                          className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                        >
                          Select All
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {timelineCategories.map((cat) => (
                          <label
                            key={cat.type}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-md text-xs cursor-pointer ${theme.hoverBg}`}
                          >
                            <span className={theme.textMain}>{cat.label}</span>
                            <input
                              type="checkbox"
                              checked={selectedTimelineTypes.includes(cat.type)}
                              onChange={() => handleToggleTimelineType(cat.type)}
                              className="rounded text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline Feed */}
              {filteredActivities.length === 0 ? (
                <div className={`p-8 rounded-xl border ${theme.border} text-center ${theme.textSubtle} text-xs`}>
                  No activities matching your selected filters.
                </div>
              ) : (
                <div className={`relative pl-6 space-y-3.5 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-[#333338]`}>
                  {filteredActivities.map((act) => (
                    <div key={act.id} className="relative group">
                      {/* Node icon */}
                      <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full ${theme.bgPanel} border ${theme.border} flex items-center justify-center shrink-0`}>
                        {getActivityIcon(act.type)}
                      </div>

                      {/* Content Card */}
                      <div className={`p-3 rounded-xl border ${theme.border} ${theme.bgPanel} shadow-2xs space-y-1`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${theme.textMain}`}>
                            {act.title}
                          </span>
                          <span className={`text-[10px] ${theme.textSubtle}`}>
                            {act.relativeTime || formatDateTimeDisplay(act.timestamp)}
                          </span>
                        </div>
                        {act.description && (
                          <p className={`text-xs ${theme.textMuted} whitespace-pre-wrap leading-relaxed`}>
                            {act.description}
                          </p>
                        )}
                        <span className={`text-[10px] ${theme.textSubtle} block pt-0.5`}>
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

      {/* Schedule Meeting Popup from inside Contact Profile */}
      {isScheduleMeetingOpen && (
        <ScheduleMeetingModal
          isOpen={isScheduleMeetingOpen}
          onClose={() => setIsScheduleMeetingOpen(false)}
          initialPerson={person}
        />
      )}
    </div>
  );
}
