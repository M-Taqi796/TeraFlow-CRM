'use client';

import { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import type { Person, PersonStage, PersonPriority } from '@/types/person.types';
import { PERSON_STAGES, COMMON_FUB_TAGS } from '@/types/person.types';

interface NewPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (person: Person) => void;
}

export function NewPersonModal({ isOpen, onClose, onCreate }: NewPersonModalProps) {
  const { theme } = useThemeContext();

  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone]               = useState('');
  const [email, setEmail]               = useState('');
  const [stage, setStage]               = useState<PersonStage>('Lead');
  const [priority, setPriority]         = useState<PersonPriority>('Medium');
  const [source, setSource]             = useState('Website');
  const [dealValue, setDealValue]       = useState('25000');
  const [location, setLocation]         = useState('');
  const [notes, setNotes]               = useState('');
  const [tags, setTags]                 = useState<string[]>(['Website Lead']);
  const [tagInput, setTagInput]         = useState('');

  if (!isOpen) return null;

  const handleAddTag = (t: string) => {
    const clean = t.trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((x) => x !== t));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !phone.trim() || !email.trim()) {
      alert('First Name, Phone, and Email are required.');
      return;
    }

    const newPerson: Person = {
      id: `per-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      contactName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      businessName: businessName.trim() || `${firstName.trim()} Holdings`,
      phone: phone.trim(),
      email: email.trim(),
      stage,
      priority,
      tags,
      source,
      dealValue: parseFloat(dealValue) || 0,
      assignedTo: 'Muhammad Taqi',
      location: location.trim() || 'United States',
      notes: notes.trim(),
      createdAt: 'Just now',
      lastActivity: {
        type: 'note',
        summary: 'Contact created',
        timestamp: new Date().toISOString(),
        relativeTime: 'Just now',
      },
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'note',
          title: 'Person Added to CRM',
          description: notes.trim() ? `Initial Notes: ${notes.trim()}` : undefined,
          timestamp: new Date().toISOString(),
          relativeTime: 'Just now',
          author: 'Muhammad Taqi',
        },
      ],
    };

    onCreate(newPerson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-lg rounded-2xl border ${theme.border} ${theme.bgPanel} shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          <div>
            <h2 className={`text-lg font-bold ${theme.textMain}`}>Add New Person</h2>
            <p className={`text-xs ${theme.textSubtle}`}>
              Create a new contact record with stage and tags.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg ${theme.textMuted} hover:${theme.textMain} ${theme.hoverBg}`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${theme.textMain}`}>
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Sarah"
                className={`w-full text-xs p-2.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:ring-1 focus:ring-primary`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${theme.textMain}`}>
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Jenkins"
                className={`w-full text-xs p-2.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:ring-1 focus:ring-primary`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${theme.textMain}`}>
              Company / Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Apex Capital Ventures"
              className={`w-full text-xs p-2.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:ring-1 focus:ring-primary`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${theme.textMain}`}>
                Phone *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={`w-full text-xs p-2.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:ring-1 focus:ring-primary`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${theme.textMain}`}>
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@example.com"
                className={`w-full text-xs p-2.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:ring-1 focus:ring-primary`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${theme.textMain}`}>
                Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as PersonStage)}
                className={`w-full text-xs p-2.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
              >
                {PERSON_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${theme.textMain}`}>
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
              >
                <option>Website</option>
                <option>Referral</option>
                <option>Meta Ads</option>
                <option>Google Ads</option>
                <option>Cold Call</option>
                <option>Zillow</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${theme.textMain}`}>
                Est. Value ($)
              </label>
              <input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={`block text-xs font-semibold mb-1 ${theme.textMain}`}>
              Tags
            </label>
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:opacity-75 cursor-pointer"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Type tag & press enter or click Add..."
                className={`flex-1 text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-3 py-2 rounded-lg text-xs font-semibold border border-primary text-primary hover:bg-primary/10"
              >
                + Add
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${theme.textMain}`}>
              Initial Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Background context, conversation notes, or requirements..."
              className={`w-full text-xs p-2.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border mt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border ${theme.border} ${theme.textMuted} hover:${theme.textMain}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 transition-colors shadow-xs cursor-pointer"
            >
              Create Person
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
