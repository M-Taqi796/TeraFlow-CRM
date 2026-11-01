'use client';

import { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import type { Person, PersonStage } from '@/types/person.types';
import {
  PERSON_STAGES,
  DEFAULT_NICHES,
  DEFAULT_CITIES,
  COMMON_TAGS,
} from '@/types/person.types';

interface NewPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (person: Person) => void;
}

export function NewPersonModal({ isOpen, onClose, onCreate }: NewPersonModalProps) {
  const { theme } = useThemeContext();

  // Company Name on top
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName]   = useState('');

  // Phones (can add multiple)
  const [phones, setPhones] = useState<string[]>(['']);

  // Emails (can add multiple)
  const [emails, setEmails] = useState<string[]>(['']);

  // Niche & City (select existing or type new)
  const [niche, setNiche]               = useState('Dentists');
  const [isCustomNiche, setIsCustomNiche] = useState(false);
  const [customNiche, setCustomNiche]   = useState('');

  const [city, setCity]                 = useState('New York');
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [customCity, setCustomCity]     = useState('');

  // Stage & Notes & Tags
  const [stage, setStage]               = useState<PersonStage>('New Leads');
  const [notes, setNotes]               = useState('');
  const [tags, setTags]                 = useState<string[]>(['Decision Maker']);
  const [tagInput, setTagInput]         = useState('');

  if (!isOpen) return null;

  const handleAddPhoneField = () => setPhones([...phones, '']);
  const handlePhoneChange = (idx: number, val: string) => {
    const updated = [...phones];
    updated[idx] = val;
    setPhones(updated);
  };
  const handleRemovePhoneField = (idx: number) => {
    if (phones.length <= 1) return;
    setPhones(phones.filter((_, i) => i !== idx));
  };

  const handleAddEmailField = () => setEmails([...emails, '']);
  const handleEmailChange = (idx: number, val: string) => {
    const updated = [...emails];
    updated[idx] = val;
    setEmails(updated);
  };
  const handleRemoveEmailField = (idx: number) => {
    if (emails.length <= 1) return;
    setEmails(emails.filter((_, i) => i !== idx));
  };

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
    if (!businessName.trim()) {
      alert('Company/Business Name is required.');
      return;
    }

    const cleanPhones = phones.map((p) => p.trim()).filter(Boolean);
    const cleanEmails = emails.map((m) => m.trim()).filter(Boolean);
    const finalNiche = isCustomNiche ? customNiche.trim() || 'General' : niche;
    const finalCity = isCustomCity ? customCity.trim() || 'United States' : city;

    const newPerson: Person = {
      id: `per-${Date.now()}`,
      businessName: businessName.trim(),
      contactName: contactName.trim() || undefined,
      phones: cleanPhones.length ? cleanPhones : ['Not provided'],
      emails: cleanEmails.length ? cleanEmails : ['Not provided'],
      contactFields: [],
      tags,
      niche: finalNiche,
      city: finalCity,
      stage,
      notes: notes.trim(),
      createdAt: 'Just now',
      lastActivity: {
        type: 'note',
        summary: 'Contact added to CRM',
        timestamp: new Date().toISOString(),
        relativeTime: 'Just now',
      },
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'note',
          title: 'Contact Created',
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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-lg rounded-2xl sm:rounded-3xl border ${theme.border} ${theme.bgPanel} shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          <div>
            <h2 className={`text-lg font-bold ${theme.textMain}`}>Add Contact</h2>
            <p className={`text-xs ${theme.textSubtle}`}>
              Create a new business contact record with phone, niche, and stage.
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
          {/* Company / Business Name (On Top, Required) */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${theme.textMain}`}>
              Company / Business Name *
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Apex Dental Solutions LLC"
              className={`w-full text-xs p-2.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:ring-1 focus:ring-primary font-medium`}
            />
          </div>

          {/* Person's Name (Optional) */}
          <div>
            <label className={`block text-xs font-semibold mb-1 ${theme.textMain}`}>
              Person Name <span className={`text-[10px] ${theme.textSubtle}`}>(optional — leave blank if unknown)</span>
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Dr. Sarah Jenkins"
              className={`w-full text-xs p-2.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:ring-1 focus:ring-primary`}
            />
          </div>

          {/* Phones (Multiple support) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`text-xs font-semibold ${theme.textMain}`}>
                Phone Number(s)
              </label>
              <button
                type="button"
                onClick={handleAddPhoneField}
                className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PlusIcon className="w-3 h-3" />
                <span>Add another phone</span>
              </button>
            </div>
            <div className="space-y-1.5">
              {phones.map((ph, idx) => (
                <div key={`phone-${idx}`} className="flex items-center gap-1.5">
                  <input
                    type="tel"
                    value={ph}
                    onChange={(e) => handlePhoneChange(idx, e.target.value)}
                    placeholder={idx === 0 ? "Primary: +1 (555) 000-0000" : `Alternative phone ${idx + 1}`}
                    className={`flex-1 text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:ring-1 focus:ring-primary`}
                  />
                  {phones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhoneField(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Remove phone"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Emails (Multiple support) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`text-xs font-semibold ${theme.textMain}`}>
                Email Address(es)
              </label>
              <button
                type="button"
                onClick={handleAddEmailField}
                className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PlusIcon className="w-3 h-3" />
                <span>Add another email</span>
              </button>
            </div>
            <div className="space-y-1.5">
              {emails.map((em, idx) => (
                <div key={`email-${idx}`} className="flex items-center gap-1.5">
                  <input
                    type="email"
                    value={em}
                    onChange={(e) => handleEmailChange(idx, e.target.value)}
                    placeholder={idx === 0 ? "Primary: contact@company.com" : `Alternative email ${idx + 1}`}
                    className={`flex-1 text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:ring-1 focus:ring-primary`}
                  />
                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmailField(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Remove email"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Niche & City */}
          <div className="grid grid-cols-2 gap-3">
            {/* Niche */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`text-xs font-semibold ${theme.textMain}`}>
                  Niche
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomNiche(!isCustomNiche)}
                  className="text-[10px] text-primary hover:underline cursor-pointer"
                >
                  {isCustomNiche ? 'Select from list' : '+ Custom'}
                </button>
              </div>
              {isCustomNiche ? (
                <input
                  type="text"
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                  placeholder="e.g. Med Spa, HVAC"
                  className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                />
              ) : (
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                >
                  {DEFAULT_NICHES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* City */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`text-xs font-semibold ${theme.textMain}`}>
                  City
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCity(!isCustomCity)}
                  className="text-[10px] text-primary hover:underline cursor-pointer"
                >
                  {isCustomCity ? 'Select from list' : '+ Custom'}
                </button>
              </div>
              {isCustomCity ? (
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="e.g. San Diego"
                  className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                />
              ) : (
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain}`}
                >
                  {DEFAULT_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Stage */}
          <div>
            <label className={`block text-xs font-semibold mb-1 ${theme.textMain}`}>
              Pipeline Stage
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

          {/* Tags */}
          <div>
            <label className={`block text-xs font-semibold mb-1 ${theme.textMain}`}>
              Tags
            </label>
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-medium border ${theme.border} ${theme.bgSubtle} ${theme.textMain}`}
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:opacity-75 cursor-pointer ml-1 text-slate-400 hover:text-slate-600"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Type tag & Enter..."
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
                className="px-3 py-2 rounded-lg text-xs font-semibold border border-primary text-primary hover:bg-primary/10 cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Comment / Initial Notes */}
          <div>
            <label className={`block text-xs font-semibold mb-1 ${theme.textMain}`}>
              Comment / Initial Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Background context, discussion notes, or requirements..."
              className={`w-full text-xs p-2.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none resize-none`}
            />
          </div>

          {/* Actions */}
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
              Create Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
