'use client';

import { useState, useRef, useMemo } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  UserPlusIcon,
  TrashIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type {
  Person,
  PersonStage,
  ContactFieldType,
  ContactInfoField,
} from '@/types/person.types';
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

  // Active tab: 'import' or 'manual'
  const [activeTab, setActiveTab] = useState<ModalTab>('import');

  // ==============================================================
  // TAB 1: FILE IMPORT STATE
  // ==============================================================
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedLeads, setParsedLeads] = useState<Person[]>([]);
  const [previewRows, setPreviewRows] = useState<ParsedLeadPreview[]>([]);

  // Import Options: Niche, City, Stage
  const [importNiche, setImportNiche] = useState('Dentists');
  const [isCustomImportNiche, setIsCustomImportNiche] = useState(false);
  const [customImportNiche, setCustomImportNiche] = useState('');

  const [importCity, setImportCity] = useState('New York');
  const [isCustomImportCity, setIsCustomImportCity] = useState(false);
  const [customImportCity, setCustomImportCity] = useState('');

  const [importStage, setImportStage] = useState<PersonStage>('New Leads');

  // Import Tags: 3-Part System
  const [importTags, setImportTags] = useState<string[]>([]);
  const [importTagInput, setImportTagInput] = useState('');

  const availableImportTags = useMemo(
    () => allTags.filter((t) => !importTags.includes(t)),
    [allTags, importTags]
  );

  const handleAddImportTag = (t: string) => {
    const clean = t.trim().replace(/^#/, '');
    if (!clean) return;
    if (!importTags.includes(clean)) {
      setImportTags([...importTags, clean]);
      onAddGlobalTag(clean);
    }
    setImportTagInput('');
  };

  const handleRemoveImportTag = (t: string) => {
    setImportTags(importTags.filter((tag) => tag !== t));
  };

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

  const handleExecuteImport = () => {
    if (parsedLeads.length === 0) return;

    if (isCustomImportNiche && customImportNiche.trim()) {
      onAddCustomNiche(customImportNiche.trim());
    }
    if (isCustomImportCity && customImportCity.trim()) {
      onAddCustomCity(customImportCity.trim());
    }

    // Attach chosen import tags to all leads from this file
    const finalLeads = parsedLeads.map((lead) => ({
      ...lead,
      tags: Array.from(new Set([...lead.tags, ...importTags])),
    }));

    if (onBulkCreate) {
      onBulkCreate(finalLeads);
    } else {
      onBulkCreatePeople(finalLeads);
    }

    onClose();
    resetImportState();
  };

  const resetImportState = () => {
    setSelectedFile(null);
    setParsedLeads([]);
    setPreviewRows([]);
    setParseError(null);
    setImportTags([]);
    setImportTagInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ==============================================================
  // TAB 2: MANUAL CONTACT STATE
  // ==============================================================
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phones, setPhones] = useState<string[]>(['']);
  const [emails, setEmails] = useState<string[]>(['']);

  // Other Contact Info (Website, LinkedIn, Instagram, Facebook, Address)
  const [extraContactFields, setExtraContactFields] = useState<ContactInfoField[]>([]);

  const [manualNiche, setManualNiche] = useState('Dentists');
  const [isCustomManualNiche, setIsCustomManualNiche] = useState(false);
  const [customManualNiche, setCustomManualNiche] = useState('');

  const [manualCity, setManualCity] = useState('New York');
  const [isCustomManualCity, setIsCustomManualCity] = useState(false);
  const [customManualCity, setCustomManualCity] = useState('');

  const [manualStage, setManualStage] = useState<PersonStage>('New Leads');
  const [manualNotes, setManualNotes] = useState('');

  // Manual Tags: 3-Part System
  const [manualTags, setManualTags] = useState<string[]>(['VIP']);
  const [manualTagInput, setManualTagInput] = useState('');

  const availableManualTags = useMemo(
    () => allTags.filter((t) => !manualTags.includes(t)),
    [allTags, manualTags]
  );

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

  // Add Other Contact (website, linkedin, instagram, facebook, address)
  const handleAddExtraField = (type: ContactFieldType) => {
    const labels: Record<ContactFieldType, string> = {
      website: 'Website',
      linkedin: 'LinkedIn',
      instagram: 'Instagram',
      facebook: 'Facebook',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
    };
    setExtraContactFields([
      ...extraContactFields,
      {
        id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        label: labels[type],
        value: '',
      },
    ]);
  };

  const handleExtraFieldChange = (id: string, value: string) => {
    setExtraContactFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value } : f))
    );
  };

  const handleRemoveExtraField = (id: string) => {
    setExtraContactFields((prev) => prev.filter((f) => f.id !== id));
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

    // Keep only non-empty extra contact fields
    const validExtraFields = extraContactFields
      .map((f) => ({ ...f, value: f.value.trim() }))
      .filter((f) => Boolean(f.value));

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
      contactFields: validExtraFields,
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'note',
          title: 'Contact Created',
          description: `Added under ${manualStage}.`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border ${theme.border} ${theme.bgPanel} shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 py-3.5 border-b ${theme.border} flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-4">
            <h2 className={`text-base font-bold tracking-tight ${theme.textMain}`}>
              New Lead
            </h2>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-zinc-800 pl-4">
              <button
                type="button"
                onClick={() => setActiveTab('import')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'import'
                    ? 'bg-primary text-white shadow-xs'
                    : `${theme.textMuted} hover:${theme.textMain}`
                }`}
              >
                Import Leads
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'manual'
                    ? 'bg-primary text-white shadow-xs'
                    : `${theme.textMuted} hover:${theme.textMain}`
                }`}
              >
                Add Contact
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-lg ${theme.textMuted} hover:${theme.textMain} transition-colors cursor-pointer`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* ============================================================== */}
          {/* TAB 1: IMPORT LEADS                                            */}
          {/* ============================================================== */}
          {activeTab === 'import' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Dropzone with subtle gray dashed border */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed ${
                  selectedFile
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-300 dark:border-zinc-700 hover:border-primary/70'
                } rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5`}
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

                <DocumentArrowUpIcon className="w-8 h-8 text-primary" />

                {selectedFile ? (
                  <div>
                    <p className={`text-xs font-bold ${theme.textMain}`}>
                      {selectedFile.name}
                    </p>
                    <p className={`text-[11px] ${theme.textMuted} mt-0.5`}>
                      {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click to change file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className={`text-xs font-semibold ${theme.textMain}`}>
                      Drop leads file here or click to browse
                    </p>
                    <p className={`text-[11px] ${theme.textMuted} mt-0.5`}>
                      Excel (.xlsx, .xls), CSV, JSON, vCard (.vcf)
                    </p>
                  </div>
                )}
              </div>

              {isParsing && (
                <div className="flex items-center justify-center gap-2 py-2 text-xs text-primary font-medium">
                  <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Parsing file...</span>
                </div>
              )}

              {parseError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                  {parseError}
                </div>
              )}

              {/* Niche, City, Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Niche */}
                <div className="space-y-1">
                  <label className={`text-[11px] font-semibold ${theme.textMain} block`}>Niche</label>
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
                      className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary cursor-pointer`}
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
                        placeholder="Niche name..."
                        className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomImportNiche(false)}
                        className="text-xs text-slate-400 p-1 cursor-pointer"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className={`text-[11px] font-semibold ${theme.textMain} block`}>City</label>
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
                      className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary cursor-pointer`}
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
                        placeholder="City name..."
                        className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomImportCity(false)}
                        className="text-xs text-slate-400 p-1 cursor-pointer"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>

                {/* Stage */}
                <div className="space-y-1">
                  <label className={`text-[11px] font-semibold ${theme.textMain} block`}>Stage</label>
                  <select
                    value={importStage}
                    onChange={(e) => setImportStage(e.target.value as PersonStage)}
                    className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary cursor-pointer`}
                  >
                    {PERSON_STAGES.map((stg) => (
                      <option key={stg} value={stg}>
                        {stg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3-Part Tags for Import */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-zinc-800">
                <label className={`text-[11px] font-semibold ${theme.textMain} block`}>
                  Tags for Imported Leads
                </label>

                {/* 1. Assigned Tags */}
                <div className="flex items-center gap-1.5 flex-wrap min-h-[26px]">
                  {importTags.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No tags selected</span>
                  ) : (
                    importTags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImportTag(t)}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer ml-1"
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* 2. Choose from DB Tags */}
                {availableImportTags.length > 0 && (
                  <div className="space-y-1 pt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Choose from DB Tags:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {availableImportTags.slice(0, 8).map((dbTag) => (
                        <button
                          key={dbTag}
                          type="button"
                          onClick={() => handleAddImportTag(dbTag)}
                          className="text-[11px] px-2 py-0.5 rounded-md border border-dashed border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-primary hover:border-primary transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <PlusIcon className="w-3 h-3" />
                          <span>{dbTag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Add New Tag to DB & Import */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <input
                    type="text"
                    value={importTagInput}
                    onChange={(e) => setImportTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImportTag(importTagInput);
                      }
                    }}
                    placeholder="Type new tag & Enter..."
                    className={`flex-1 text-xs p-1.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImportTag(importTagInput)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-600 cursor-pointer"
                  >
                    + Add Tag
                  </button>
                </div>
              </div>

              {/* Parsed Preview Table */}
              {parsedLeads.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>{parsedLeads.length} contacts found</span>
                    </span>
                    <span className={theme.textSubtle}>First {previewRows.length} shown</span>
                  </div>

                  <div className={`rounded-xl border ${theme.border} overflow-hidden`}>
                    <table className="w-full text-left text-xs">
                      <thead className={`border-b ${theme.border} bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 font-semibold text-[11px]`}>
                        <tr>
                          <th className="py-2 px-3">Company</th>
                          <th className="py-2 px-3">Contact</th>
                          <th className="py-2 px-3">Phone</th>
                          <th className="py-2 px-3">Email</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {previewRows.map((row, idx) => (
                          <tr key={idx} className={theme.hoverBg}>
                            <td className={`py-2 px-3 font-semibold ${theme.textMain} truncate max-w-[130px]`}>
                              {row.businessName || '—'}
                            </td>
                            <td className={`py-2 px-3 ${theme.textMuted} truncate max-w-[110px]`}>
                              {row.contactName || '—'}
                            </td>
                            <td className={`py-2 px-3 ${theme.textMain} truncate max-w-[110px]`}>
                              {row.phones[0] || '—'}
                            </td>
                            <td className={`py-2 px-3 ${theme.textMain} truncate max-w-[130px]`}>
                              {row.emails[0] || '—'}
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
          {/* TAB 2: MANUAL CONTACT ENTRY                                    */}
          {/* ============================================================== */}
          {activeTab === 'manual' && (
            <form id="manual-contact-form" onSubmit={handleManualSubmit} className="space-y-3.5 animate-in fade-in">
              {/* Company on top */}
              <div className="space-y-1">
                <label className={`text-[11px] font-semibold ${theme.textMain} block`}>
                  Company / Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Skyline Dental, Apex Roofing"
                  className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} font-semibold focus:outline-none focus:border-primary`}
                />
              </div>

              {/* Person Name */}
              <div className="space-y-1">
                <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
                  Person Name (Optional)
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Bell"
                  className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                />
              </div>

              {/* Phones */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`text-[11px] font-medium ${theme.textMuted}`}>Phone(s)</label>
                  <button
                    type="button"
                    onClick={handleAddPhoneField}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>Add Phone</span>
                  </button>
                </div>
                {phones.map((ph, idx) => (
                  <div key={`ph-${idx}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ph}
                      onChange={(e) => handlePhoneChange(idx, e.target.value)}
                      placeholder={idx === 0 ? 'Primary Phone' : `Phone ${idx + 1}`}
                      className={`flex-1 text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                    />
                    {phones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhoneField(idx)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Emails */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`text-[11px] font-medium ${theme.textMuted}`}>Email(s)</label>
                  <button
                    type="button"
                    onClick={handleAddEmailField}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>Add Email</span>
                  </button>
                </div>
                {emails.map((em, idx) => (
                  <div key={`em-${idx}`} className="flex items-center gap-2">
                    <input
                      type="email"
                      value={em}
                      onChange={(e) => handleEmailChange(idx, e.target.value)}
                      placeholder={idx === 0 ? 'Primary Email' : `Email ${idx + 1}`}
                      className={`flex-1 text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                    />
                    {emails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEmailField(idx)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Other Contact Info (Website, LinkedIn, Instagram, Facebook, Address) */}
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className={`text-[11px] font-medium ${theme.textMuted}`}>
                    Other Contacts (Website, Social, Address)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddExtraField('website')}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Website
                    </button>
                    <span className="text-slate-300 dark:text-zinc-700">&bull;</span>
                    <button
                      type="button"
                      onClick={() => handleAddExtraField('linkedin')}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      LinkedIn
                    </button>
                    <span className="text-slate-300 dark:text-zinc-700">&bull;</span>
                    <button
                      type="button"
                      onClick={() => handleAddExtraField('instagram')}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Instagram
                    </button>
                    <span className="text-slate-300 dark:text-zinc-700">&bull;</span>
                    <button
                      type="button"
                      onClick={() => handleAddExtraField('facebook')}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Facebook
                    </button>
                    <span className="text-slate-300 dark:text-zinc-700">&bull;</span>
                    <button
                      type="button"
                      onClick={() => handleAddExtraField('address')}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Address
                    </button>
                  </div>
                </div>

                {extraContactFields.map((field) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <select
                      value={field.type}
                      onChange={(e) => {
                        const newType = e.target.value as ContactFieldType;
                        const defaultLabels: Record<ContactFieldType, string> = {
                          website: 'Website',
                          linkedin: 'LinkedIn',
                          instagram: 'Instagram',
                          facebook: 'Facebook',
                          address: 'Address',
                          phone: 'Phone',
                          email: 'Email',
                        };
                        setExtraContactFields((prev) =>
                          prev.map((f) =>
                            f.id === field.id
                              ? { ...f, type: newType, label: defaultLabels[newType] }
                              : f
                          )
                        );
                      }}
                      className={`w-28 text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} cursor-pointer`}
                    >
                      <option value="website">Website</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="address">Address</option>
                    </select>

                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => handleExtraFieldChange(field.id, e.target.value)}
                      placeholder={
                        field.type === 'address'
                          ? '123 Main St, Suite 400...'
                          : `https://${field.type}.com/...`
                      }
                      className={`flex-1 text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveExtraField(field.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Remove field"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Niche & City & Stage Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Niche */}
                <div className="space-y-1">
                  <label className={`text-[11px] font-medium ${theme.textMuted} block`}>Niche</label>
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
                      className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary cursor-pointer`}
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
                        placeholder="Niche..."
                        className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomManualNiche(false)}
                        className="text-xs text-slate-400 p-1 cursor-pointer"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className={`text-[11px] font-medium ${theme.textMuted} block`}>City</label>
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
                      className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary cursor-pointer`}
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
                        placeholder="City..."
                        className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomManualCity(false)}
                        className="text-xs text-slate-400 p-1 cursor-pointer"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>

                {/* Stage */}
                <div className="space-y-1">
                  <label className={`text-[11px] font-medium ${theme.textMuted} block`}>Stage</label>
                  <select
                    value={manualStage}
                    onChange={(e) => setManualStage(e.target.value as PersonStage)}
                    className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary cursor-pointer`}
                  >
                    {PERSON_STAGES.map((stg) => (
                      <option key={stg} value={stg}>
                        {stg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3-Part Tags for Manual Contact */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-zinc-800">
                <label className={`text-[11px] font-semibold ${theme.textMain} block`}>Tags</label>

                {/* 1. Assigned Tags */}
                <div className="flex items-center gap-1.5 flex-wrap min-h-[26px]">
                  {manualTags.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No tags selected</span>
                  ) : (
                    manualTags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
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
                    ))
                  )}
                </div>

                {/* 2. Choose from DB Tags */}
                {availableManualTags.length > 0 && (
                  <div className="space-y-1 pt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Choose from DB Tags:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {availableManualTags.slice(0, 8).map((dbTag) => (
                        <button
                          key={dbTag}
                          type="button"
                          onClick={() => handleAddManualTag(dbTag)}
                          className="text-[11px] px-2 py-0.5 rounded-md border border-dashed border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-primary hover:border-primary transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <PlusIcon className="w-3 h-3" />
                          <span>{dbTag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Add New Tag to DB & Contact */}
                <div className="flex items-center gap-1.5 pt-0.5">
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
                    placeholder="Type new tag & Enter..."
                    className={`flex-1 text-xs p-1.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddManualTag(manualTagInput)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-600 cursor-pointer"
                  >
                    + Add Tag
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className={`text-[11px] font-medium ${theme.textMuted} block`}>Notes</label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Notes..."
                  className={`w-full text-xs p-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-primary`}
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className={`px-5 py-3 border-t ${theme.border} flex items-center justify-end gap-2 shrink-0`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border ${theme.border} ${theme.bgPanel} ${theme.textMain} ${theme.hoverBg} cursor-pointer`}
          >
            Cancel
          </button>

          {activeTab === 'import' ? (
            <button
              type="button"
              disabled={parsedLeads.length === 0}
              onClick={handleExecuteImport}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shadow-xs ${
                parsedLeads.length > 0
                  ? 'bg-primary hover:bg-primary-600 cursor-pointer'
                  : 'bg-slate-400 opacity-50 cursor-not-allowed'
              }`}
            >
              Import Leads
            </button>
          ) : (
            <button
              type="submit"
              form="manual-contact-form"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 cursor-pointer shadow-xs"
            >
              Save Contact
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
