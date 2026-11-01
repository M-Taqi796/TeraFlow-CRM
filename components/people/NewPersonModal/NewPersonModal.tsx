'use client';

import { useState, useRef } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  UserPlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type { Person, PersonStage } from '@/types/person.types';
import {
  PERSON_STAGES,
  DEFAULT_NICHES,
  DEFAULT_CITIES,
} from '@/types/person.types';
import { parseLeadsFile, type ParsedLeadPreview } from '@/lib/leadParser';

interface NewPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (person: Person) => void;
  onBulkCreate?: (people: Person[]) => void;
}

type ModalTab = 'import' | 'manual';

export function NewPersonModal({
  isOpen,
  onClose,
  onCreate,
  onBulkCreate,
}: NewPersonModalProps) {
  const { theme } = useThemeContext();
  const {
    allTags,
    onAddGlobalTag,
    customNiches,
    onAddCustomNiche,
    customCities,
    onAddCustomCity,
    onCreatePerson,
    onBulkCreatePeople,
  } = useCRM();

  // Active tab: 'import' is Default / Primary
  const [activeTab, setActiveTab] = useState<ModalTab>('import');

  // ---------- TAB 1: FILE IMPORT STATE ----------
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedLeads, setParsedLeads] = useState<Person[]>([]);
  const [previewRows, setPreviewRows] = useState<ParsedLeadPreview[]>([]);

  // Import Options: Niche & City & Stage
  const [importNiche, setImportNiche] = useState('Dentists');
  const [isCustomImportNiche, setIsCustomImportNiche] = useState(false);
  const [customImportNiche, setCustomImportNiche] = useState('');

  const [importCity, setImportCity] = useState('New York');
  const [isCustomImportCity, setIsCustomImportCity] = useState(false);
  const [customImportCity, setCustomImportCity] = useState('');

  const [importStage, setImportStage] = useState<PersonStage>('New Leads');

  // Combined Niches & Cities
  const combinedNiches = Array.from(new Set([...DEFAULT_NICHES, ...customNiches]));
  const combinedCities = Array.from(new Set([...DEFAULT_CITIES, ...customCities]));

  // File change handler
  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setParseError(null);
    setIsParsing(true);

    const effectiveNiche = isCustomImportNiche && customImportNiche.trim()
      ? customImportNiche.trim()
      : importNiche;

    const effectiveCity = isCustomImportCity && customImportCity.trim()
      ? customImportCity.trim()
      : importCity;

    const res = await parseLeadsFile(file, effectiveNiche, effectiveCity, importStage);
    setIsParsing(false);

    if (!res.success) {
      setParseError(res.error || 'Failed to parse file.');
      setParsedLeads([]);
      setPreviewRows([]);
    } else {
      setParsedLeads(res.leads);
      setPreviewRows(res.previewRows);
    }
  };

  // Trigger import
  const handleExecuteImport = () => {
    if (parsedLeads.length === 0) return;

    // Save custom niche/city to context if created
    if (isCustomImportNiche && customImportNiche.trim()) {
      onAddCustomNiche(customImportNiche.trim());
    }
    if (isCustomImportCity && customImportCity.trim()) {
      onAddCustomCity(customImportCity.trim());
    }

    if (onBulkCreate) {
      onBulkCreate(parsedLeads);
    } else {
      onBulkCreatePeople(parsedLeads);
    }

    onClose();
    resetImportState();
  };

  const resetImportState = () => {
    setSelectedFile(null);
    setParsedLeads([]);
    setPreviewRows([]);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ---------- TAB 2: MANUAL CONTACT STATE ----------
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phones, setPhones] = useState<string[]>(['']);
  const [emails, setEmails] = useState<string[]>(['']);

  const [manualNiche, setManualNiche] = useState('Dentists');
  const [isCustomManualNiche, setIsCustomManualNiche] = useState(false);
  const [customManualNiche, setCustomManualNiche] = useState('');

  const [manualCity, setManualCity] = useState('New York');
  const [isCustomManualCity, setIsCustomManualCity] = useState(false);
  const [customManualCity, setCustomManualCity] = useState('');

  const [manualStage, setManualStage] = useState<PersonStage>('New Leads');
  const [manualNotes, setManualNotes] = useState('');
  const [manualTags, setManualTags] = useState<string[]>(['VIP']);
  const [manualTagInput, setManualTagInput] = useState('');

  // Handle Manual Phone & Email inputs
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

  const handleAddManualTag = (t: string) => {
    const clean = t.trim().replace(/^#/, '');
    if (!clean) return;
    if (!manualTags.includes(clean)) {
      setManualTags([...manualTags, clean]);
      onAddGlobalTag(clean);
    }
    setManualTagInput('');
  };

  const handleRemoveManualTag = (t: string) => {
    setManualTags(manualTags.filter((tag) => tag !== t));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    const effectiveNiche = isCustomManualNiche && customManualNiche.trim()
      ? customManualNiche.trim()
      : manualNiche;

    const effectiveCity = isCustomManualCity && customManualCity.trim()
      ? customManualCity.trim()
      : manualCity;

    if (isCustomManualNiche && customManualNiche.trim()) {
      onAddCustomNiche(customManualNiche.trim());
    }
    if (isCustomManualCity && customManualCity.trim()) {
      onAddCustomCity(customManualCity.trim());
    }

    const cleanPhones = phones.map((p) => p.trim()).filter(Boolean);
    const cleanEmails = emails.map((e) => e.trim()).filter(Boolean);

    const newPerson: Person = {
      id: `p-${Date.now()}`,
      businessName: businessName.trim(),
      contactName: contactName.trim(),
      phones: cleanPhones.length > 0 ? cleanPhones : [''],
      emails: cleanEmails.length > 0 ? cleanEmails : [''],
      niche: effectiveNiche || 'General',
      city: effectiveCity || 'United States',
      stage: manualStage,
      tags: manualTags,
      notes: manualNotes.trim() || 'New contact created manually.',
      createdAt: 'Just now',
      contactFields: [],
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'note',
          title: 'Contact Created',
          description: `Contact added manually under ${manualStage}.`,
          timestamp: new Date().toISOString(),
          relativeTime: 'Just now',
          author: 'Muhammad Taqi',
        },
      ],
    };

    if (onCreate) {
      onCreate(newPerson);
    } else {
      onCreatePerson(newPerson);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border ${theme.border} ${theme.bgPanel} shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 border-b ${theme.border} flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50`}>
          <div>
            <h2 className={`text-lg font-bold ${theme.textMain}`}>
              Add New Leads
            </h2>
            <p className={`text-xs ${theme.textMuted} mt-0.5`}>
              Import lead files in bulk or create an individual contact manually.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg ${theme.textMuted} hover:${theme.textMain} ${theme.hoverBg} transition-colors cursor-pointer`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Primary Import vs Add Single Contact */}
        <div className={`px-5 pt-3 border-b ${theme.border} flex items-center gap-2 bg-slate-50/30 dark:bg-slate-900/30 shrink-0`}>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'border-primary text-primary'
                : `border-transparent ${theme.textMuted} hover:${theme.textMain}`
            }`}
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            <span>Import Leads (Primary)</span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-bold">
              Default
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'border-primary text-primary'
                : `border-transparent ${theme.textMuted} hover:${theme.textMain}`
            }`}
          >
            <UserPlusIcon className="w-4 h-4" />
            <span>Add Single Contact</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* ============================================================== */}
          {/* TAB 1: PRIMARY IMPORT FLOW                                     */}
          {/* ============================================================== */}
          {activeTab === 'import' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Formats Supported Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[11px] font-semibold ${theme.textSubtle}`}>Supported Formats:</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Excel (.xlsx, .xls)
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  CSV (.csv)
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  JSON (.json)
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  vCard (.vcf)
                </span>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed ${
                  selectedFile ? 'border-primary bg-primary/5' : `${theme.border} hover:border-primary/50 ${theme.bgSubtle}`
                } rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.json,.vcf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileChange(f);
                  }}
                />

                <DocumentArrowUpIcon className="w-10 h-10 text-primary/80" />

                {selectedFile ? (
                  <div>
                    <p className={`text-xs font-bold ${theme.textMain}`}>
                      Selected: {selectedFile.name}
                    </p>
                    <p className={`text-[11px] ${theme.textMuted} mt-0.5`}>
                      {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click to choose a different file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className={`text-xs font-semibold ${theme.textMain}`}>
                      Click to upload or drag and drop your leads file here
                    </p>
                    <p className={`text-[11px] ${theme.textMuted} mt-0.5`}>
                      Automatically parses columns, discards junk fields, and matches relevant contacts.
                    </p>
                  </div>
                )}
              </div>

              {/* Parsing Indicator */}
              {isParsing && (
                <div className="flex items-center justify-center gap-2 py-3 text-xs text-primary font-medium">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Parsing and normalizing file data...</span>
                </div>
              )}

              {/* Error Message */}
              {parseError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-medium">
                  {parseError}
                </div>
              )}

              {/* Target Niche, City, and Stage Settings */}
              <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgSubtle} space-y-3`}>
                <span className={`text-xs font-bold uppercase tracking-wider ${theme.textMain} block`}>
                  Import Destination & Categorization
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Niche Selection */}
                  <div className="space-y-1">
                    <label className={`text-xs font-medium ${theme.textMuted} block`}>Niche / Industry</label>
                    {!isCustomImportNiche ? (
                      <select
                        value={importNiche}
                        onChange={(e) => {
                          if (e.target.value === '__add_new__') {
                            setIsCustomImportNiche(true);
                          } else {
                            setImportNiche(e.target.value);
                          }
                        }}
                        className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
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
                          required
                          value={customImportNiche}
                          onChange={(e) => setCustomImportNiche(e.target.value)}
                          placeholder="Type custom niche..."
                          className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                        />
                        <button
                          type="button"
                          onClick={() => setIsCustomImportNiche(false)}
                          className="text-xs text-slate-400 hover:text-slate-600 p-1"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                  </div>

                  {/* City Selection */}
                  <div className="space-y-1">
                    <label className={`text-xs font-medium ${theme.textMuted} block`}>City / Location</label>
                    {!isCustomImportCity ? (
                      <select
                        value={importCity}
                        onChange={(e) => {
                          if (e.target.value === '__add_new__') {
                            setIsCustomImportCity(true);
                          } else {
                            setImportCity(e.target.value);
                          }
                        }}
                        className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
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
                          required
                          value={customImportCity}
                          onChange={(e) => setCustomImportCity(e.target.value)}
                          placeholder="Type custom city..."
                          className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                        />
                        <button
                          type="button"
                          onClick={() => setIsCustomImportCity(false)}
                          className="text-xs text-slate-400 hover:text-slate-600 p-1"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Pipeline Stage */}
                  <div className="space-y-1">
                    <label className={`text-xs font-medium ${theme.textMuted} block`}>Pipeline Stage</label>
                    <select
                      value={importStage}
                      onChange={(e) => setImportStage(e.target.value as PersonStage)}
                      className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                    >
                      {PERSON_STAGES.map((stg) => (
                        <option key={stg} value={stg}>
                          {stg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Parsed Preview Table */}
              {parsedLeads.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Ready to import {parsedLeads.length} valid contacts</span>
                    </span>
                    <span className={theme.textSubtle}>Previewing first {previewRows.length} rows</span>
                  </div>

                  <div className={`rounded-xl border ${theme.border} overflow-hidden`}>
                    <table className="w-full text-left text-xs">
                      <thead className={`border-b ${theme.border} ${theme.bgSubtle} text-slate-500 font-bold uppercase text-[10px]`}>
                        <tr>
                          <th className="py-2 px-3">Company / Business</th>
                          <th className="py-2 px-3">Contact</th>
                          <th className="py-2 px-3">Phone</th>
                          <th className="py-2 px-3">Email</th>
                          <th className="py-2 px-3">Niche • City</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {previewRows.map((row, idx) => (
                          <tr key={idx} className={theme.hoverBg}>
                            <td className={`py-2 px-3 font-semibold ${theme.textMain} truncate max-w-[120px]`}>
                              {row.businessName || '—'}
                            </td>
                            <td className={`py-2 px-3 ${theme.textMuted} truncate max-w-[100px]`}>
                              {row.contactName || '—'}
                            </td>
                            <td className={`py-2 px-3 ${theme.textMain} truncate max-w-[110px]`}>
                              {row.phones[0] || '—'}
                            </td>
                            <td className={`py-2 px-3 ${theme.textMain} truncate max-w-[120px]`}>
                              {row.emails[0] || '—'}
                            </td>
                            <td className={`py-2 px-3 ${theme.textMuted} truncate max-w-[110px]`}>
                              {row.niche} &bull; {row.city}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: MANUAL CONTACT ENTRY FORM                               */}
          {/* ============================================================== */}
          {activeTab === 'manual' && (
            <form id="manual-contact-form" onSubmit={handleManualSubmit} className="space-y-4 animate-in fade-in">
              {/* Company Name On Top (Prominent) */}
              <div className="space-y-1">
                <label className={`text-xs font-bold ${theme.textMain} block`}>
                  Company / Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Skyline Dental Care, Apex Roofing Ltd."
                  className={`w-full text-xs p-2.5 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} font-semibold focus:outline-none focus:border-primary`}
                />
              </div>

              {/* Person / Contact Name (Optional) */}
              <div className="space-y-1">
                <label className={`text-xs font-medium ${theme.textMuted} block`}>
                  Contact / Person Name (Optional if only Company is known)
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Bell, Sarah Jenkins"
                  className={`w-full text-xs p-2.5 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                />
              </div>

              {/* Multiple Phones */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-medium ${theme.textMuted}`}>Phone Number(s)</label>
                  <button
                    type="button"
                    onClick={handleAddPhoneField}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>Add Another Phone</span>
                  </button>
                </div>
                {phones.map((ph, idx) => (
                  <div key={`ph-${idx}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ph}
                      onChange={(e) => handlePhoneChange(idx, e.target.value)}
                      placeholder={idx === 0 ? 'Primary Phone (e.g. +1 555-0192)' : `Secondary Phone ${idx + 1}`}
                      className={`flex-1 text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                    />
                    {phones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhoneField(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Multiple Emails */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-medium ${theme.textMuted}`}>Email Address(es)</label>
                  <button
                    type="button"
                    onClick={handleAddEmailField}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>Add Another Email</span>
                  </button>
                </div>
                {emails.map((em, idx) => (
                  <div key={`em-${idx}`} className="flex items-center gap-2">
                    <input
                      type="email"
                      value={em}
                      onChange={(e) => handleEmailChange(idx, e.target.value)}
                      placeholder={idx === 0 ? 'Primary Email (e.g. contact@business.com)' : `Secondary Email ${idx + 1}`}
                      className={`flex-1 text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                    />
                    {emails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEmailField(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Niche & City & Stage Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Niche */}
                <div className="space-y-1">
                  <label className={`text-xs font-medium ${theme.textMuted} block`}>Niche / Industry</label>
                  {!isCustomManualNiche ? (
                    <select
                      value={manualNiche}
                      onChange={(e) => {
                        if (e.target.value === '__add_new__') {
                          setIsCustomManualNiche(true);
                        } else {
                          setManualNiche(e.target.value);
                        }
                      }}
                      className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
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
                        required
                        value={customManualNiche}
                        onChange={(e) => setCustomManualNiche(e.target.value)}
                        placeholder="Type custom niche..."
                        className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomManualNiche(false)}
                        className="text-xs text-slate-400 hover:text-slate-600 p-1"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className={`text-xs font-medium ${theme.textMuted} block`}>City / Region</label>
                  {!isCustomManualCity ? (
                    <select
                      value={manualCity}
                      onChange={(e) => {
                        if (e.target.value === '__add_new__') {
                          setIsCustomManualCity(true);
                        } else {
                          setManualCity(e.target.value);
                        }
                      }}
                      className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
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
                        required
                        value={customManualCity}
                        onChange={(e) => setCustomManualCity(e.target.value)}
                        placeholder="Type custom city..."
                        className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomManualCity(false)}
                        className="text-xs text-slate-400 hover:text-slate-600 p-1"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>

                {/* Stage */}
                <div className="space-y-1">
                  <label className={`text-xs font-medium ${theme.textMuted} block`}>Initial Stage</label>
                  <select
                    value={manualStage}
                    onChange={(e) => setManualStage(e.target.value as PersonStage)}
                    className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                  >
                    {PERSON_STAGES.map((stg) => (
                      <option key={stg} value={stg}>
                        {stg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags Section with Suggestions */}
              <div className="space-y-2">
                <label className={`text-xs font-medium ${theme.textMuted} block`}>Tags (No # symbol)</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {manualTags.map((t) => (
                    <span
                      key={t}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md font-medium border ${theme.border} ${theme.bgPanel} ${theme.textMain}`}
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveManualTag(t)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                {/* Suggestions */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Suggestions:</span>
                  {allTags
                    .filter((t) => !manualTags.includes(t))
                    .slice(0, 6)
                    .map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleAddManualTag(sug)}
                        className={`text-[11px] px-2 py-0.5 rounded-md border border-dashed ${theme.border} ${theme.hoverBg} ${theme.textMuted} hover:text-primary hover:border-primary cursor-pointer`}
                      >
                        + {sug}
                      </button>
                    ))}
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={manualTagInput}
                    onChange={(e) => setManualTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddManualTag(manualTagInput);
                      }
                    }}
                    placeholder="Type a new tag..."
                    className={`flex-1 text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddManualTag(manualTagInput)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-600 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className={`text-xs font-medium ${theme.textMuted} block`}>Overview Notes / Initial Comment</label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Add any initial notes or account context..."
                  className={`w-full text-xs p-2.5 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                />
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t ${theme.border} flex items-center justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-900/50`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-medium border ${theme.border} ${theme.bgPanel} ${theme.textMain} ${theme.hoverBg} cursor-pointer`}
          >
            Cancel
          </button>

          {activeTab === 'import' ? (
            <button
              type="button"
              disabled={parsedLeads.length === 0}
              onClick={handleExecuteImport}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-xs ${
                parsedLeads.length > 0
                  ? 'bg-primary hover:bg-primary-600 cursor-pointer'
                  : 'bg-slate-400 opacity-50 cursor-not-allowed'
              }`}
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              <span>Import {parsedLeads.length > 0 ? `${parsedLeads.length} Leads` : 'Leads'}</span>
            </button>
          ) : (
            <button
              type="submit"
              form="manual-contact-form"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary-600 cursor-pointer shadow-xs"
            >
              <UserPlusIcon className="w-4 h-4" />
              <span>Save Contact</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
