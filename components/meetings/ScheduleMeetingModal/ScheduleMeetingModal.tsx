'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useThemeContext } from '@/context/ThemeContext';
import { useCRM } from '@/context/CRMContext';
import type { Meeting } from '@/types/meeting.types';
import type { Person } from '@/types/person.types';
import { WORLD_CITIES, type WorldCity, getLiveTimeForZone } from '@/data/worldCities.data';

const PKT_OFFSET_MINUTES = 300; // PKT is UTC+5 = 300 minutes

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMeeting?: Meeting | null;
  initialPerson?: Person | null;
}

export function ScheduleMeetingModal({
  isOpen,
  onClose,
  initialMeeting,
  initialPerson,
}: ScheduleMeetingModalProps) {
  const { theme } = useThemeContext();
  const { people, onAddMeeting, onEditMeeting } = useCRM();

  const isEditing = Boolean(initialMeeting);

  // Search contact state
  const [contactSearch, setContactSearch] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Auto-filled Contact Info
  const [businessName, setBusinessName] = useState('');
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Searchable City State
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<WorldCity>(() => WORLD_CITIES[0]); // Default: New York
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Current Time There (Editable input, like their time)
  const [clientLiveTime24, setClientLiveTime24] = useState('10:00');
  const [clientLiveTime12, setClientLiveTime12] = useState('');
  const [manualOffsetAdjustment, setManualOffsetAdjustment] = useState(0); // in minutes

  // Meeting Date & Scheduled Time
  const [meetingDate, setMeetingDate] = useState('');
  const [clientMeetingTime24, setClientMeetingTime24] = useState('10:00'); // 24h format
  const [theirTimeFormatted, setTheirTimeFormatted] = useState('');
  const [ourPktTimeFormatted, setOurPktTimeFormatted] = useState('');

  // Handle outside click to close city dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set default city live time
  const applyCityTime = useCallback((city: WorldCity) => {
    setSelectedCity(city);
    setCitySearchQuery(`${city.city}, ${city.state ? city.state + ', ' : ''}${city.country}`);
    const live = getLiveTimeForZone(city.tz);
    setClientLiveTime24(live.time24);
    setClientLiveTime12(live.time12);
    setManualOffsetAdjustment(0);
  }, []);

  // Select contact & auto-fetch city from city OR NICHE section
  const handleSelectContact = useCallback((p: Person) => {
    setSelectedPersonId(p.id);
    setBusinessName(p.businessName);
    setClientName(p.contactName || '');
    setPhone(p.phones[0] || '');
    setEmail(p.emails[0] || '');
    setContactSearch(`${p.businessName}${p.contactName ? ` (${p.contactName})` : ''}`);

    // Check contact.city first
    let matchedCity: WorldCity | undefined;
    if (p.city && p.city.trim()) {
      matchedCity = WORLD_CITIES.find(
        (c) => c.city.toLowerCase() === p.city.trim().toLowerCase()
      );
    }

    // Check contact.niche if not found
    if (!matchedCity && p.niche && p.niche.trim()) {
      const nicheLower = p.niche.toLowerCase();
      matchedCity = WORLD_CITIES.find((c) => nicheLower.includes(c.city.toLowerCase()));
    }

    // Also check businessName just in case (e.g. "Austin Roofing Pros")
    if (!matchedCity && p.businessName) {
      const bLower = p.businessName.toLowerCase();
      matchedCity = WORLD_CITIES.find((c) => bLower.includes(c.city.toLowerCase()));
    }

    if (matchedCity) {
      applyCityTime(matchedCity);
    } else {
      applyCityTime(WORLD_CITIES[0]);
    }
  }, [applyCityTime]);

  // Populate state on open or edit
  useEffect(() => {
    if (initialMeeting) {
      setBusinessName(initialMeeting.businessName);
      setClientName(initialMeeting.clientName || '');
      setPhone(initialMeeting.phone || '');
      setEmail(initialMeeting.email || '');
      setMeetingDate(initialMeeting.date || new Date().toISOString().slice(0, 10));
      setOurPktTimeFormatted(initialMeeting.ourTime);
      setTheirTimeFormatted(initialMeeting.theirTime);
      setContactSearch(`${initialMeeting.businessName}`);
      setSelectedPersonId(null);
    } else if (initialPerson) {
      handleSelectContact(initialPerson);
      const today = new Date();
      setMeetingDate(today.toISOString().slice(0, 10));
      setClientMeetingTime24('10:00');
    } else {
      setSelectedPersonId(null);
      setContactSearch('');
      setBusinessName('');
      setClientName('');
      setPhone('');
      setEmail('');

      // Default meeting date: today
      const today = new Date();
      setMeetingDate(today.toISOString().slice(0, 10));
      setClientMeetingTime24('10:00');

      // Default city: New York
      applyCityTime(WORLD_CITIES[0]);
    }
  }, [initialMeeting, initialPerson, isOpen, handleSelectContact, applyCityTime]);

  // Matching contacts for search
  const filteredContacts = useMemo(() => {
    if (!contactSearch.trim() || selectedPersonId) return [];
    const q = contactSearch.toLowerCase();
    return people
      .filter((p) => {
        const matchesBusiness = p.businessName?.toLowerCase().includes(q);
        const matchesName = p.contactName?.toLowerCase().includes(q);
        const matchesPhone = p.phones?.some((ph) => ph.toLowerCase().includes(q));
        const matchesEmail = p.emails?.some((em) => em.toLowerCase().includes(q));
        return matchesBusiness || matchesName || matchesPhone || matchesEmail;
      })
      .slice(0, 6);
  }, [contactSearch, people, selectedPersonId]);

  // Matching cities for city search
  const filteredCities = useMemo(() => {
    if (!citySearchQuery.trim()) return WORLD_CITIES.slice(0, 15);
    const q = citySearchQuery.toLowerCase();
    return WORLD_CITIES.filter((c) => {
      const matchCity = c.city.toLowerCase().includes(q);
      const matchCountry = c.country.toLowerCase().includes(q);
      const matchState = c.state?.toLowerCase().includes(q);
      const matchAbbr = c.abbr.toLowerCase().includes(q);
      return matchCity || matchCountry || matchState || matchAbbr;
    }).slice(0, 15);
  }, [citySearchQuery]);

  // When user selects a city from search dropdown
  const handleSelectCity = (c: WorldCity) => {
    applyCityTime(c);
    setIsCityDropdownOpen(false);
  };

  // When user edits Current Time (24h input)
  const handleCurrentTimeChange = (new24Str: string) => {
    setClientLiveTime24(new24Str);
    if (!new24Str) return;

    try {
      const [newH, newM] = new24Str.split(':').map(Number);
      if (isNaN(newH) || isNaN(newM)) return;

      // Update 12-hour formatted string
      const period = newH >= 12 ? 'PM' : 'AM';
      const h12 = newH % 12 === 0 ? 12 : newH % 12;
      const h12Str = h12 < 10 ? '0' + h12 : h12;
      const mStr = newM < 10 ? '0' + newM : newM;
      setClientLiveTime12(`${h12Str}:${mStr} ${period}`);

      // Calculate adjustment relative to theoretical city live time
      const liveTheoretical = getLiveTimeForZone(selectedCity.tz);
      const [theoH, theoM] = liveTheoretical.time24.split(':').map(Number);
      const theoreticalTotalMinutes = theoH * 60 + theoM;
      const enteredTotalMinutes = newH * 60 + newM;

      let diffMinutes = enteredTotalMinutes - theoreticalTotalMinutes;
      // Handle day rollover bounds
      if (diffMinutes > 720) diffMinutes -= 1440;
      if (diffMinutes < -720) diffMinutes += 1440;

      setManualOffsetAdjustment(diffMinutes);
    } catch {
      // ignore
    }
  };

  // Calculate Our Time (PKT) and Their Time whenever client meeting time changes
  useEffect(() => {
    if (!clientMeetingTime24) return;

    try {
      const [hStr, mStr] = clientMeetingTime24.split(':');
      const hours = parseInt(hStr, 10);
      const minutes = parseInt(mStr, 10);
      if (isNaN(hours) || isNaN(minutes)) return;

      // 12-hour formatted client time
      const clientPeriod = hours >= 12 ? 'PM' : 'AM';
      const client12 = hours % 12 === 0 ? 12 : hours % 12;
      const client12Str = client12 < 10 ? '0' + client12 : client12;
      const clientMStr = minutes < 10 ? '0' + minutes : minutes;
      const theirFormatted = `${client12Str}:${clientMStr} ${clientPeriod} ${selectedCity.abbr}`;
      setTheirTimeFormatted(theirFormatted);

      // Base offset for selected city from UTC
      const live = getLiveTimeForZone(selectedCity.tz);
      const effectiveClientOffset = live.offsetMinutes + manualOffsetAdjustment;

      // Difference between PKT (+300) and Client
      const diffToPktMinutes = PKT_OFFSET_MINUTES - effectiveClientOffset;
      const clientTotalMinutes = hours * 60 + minutes;
      let pktTotalMinutes = (clientTotalMinutes + diffToPktMinutes) % 1440;
      if (pktTotalMinutes < 0) pktTotalMinutes += 1440;

      const pktH24 = Math.floor(pktTotalMinutes / 60);
      const pktM = pktTotalMinutes % 60;
      const pktPeriod = pktH24 >= 12 ? 'PM' : 'AM';
      const pkt12 = pktH24 % 12 === 0 ? 12 : pktH24 % 12;
      const pkt12Str = pkt12 < 10 ? '0' + pkt12 : pkt12;
      const pktMStr = pktM < 10 ? '0' + pktM : pktM;

      setOurPktTimeFormatted(`${pkt12Str}:${pktMStr} ${pktPeriod} PKT`);
    } catch {
      // safe fallback
    }
  }, [clientMeetingTime24, selectedCity, manualOffsetAdjustment]);

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      alert('Please select or enter a contact.');
      return;
    }

    if (isEditing && initialMeeting) {
      onEditMeeting(initialMeeting.id, {
        businessName: businessName.trim(),
        clientName: clientName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        date: meetingDate,
        ourTime: ourPktTimeFormatted || initialMeeting.ourTime,
        theirTime: theirTimeFormatted || initialMeeting.theirTime,
      });
    } else {
      onAddMeeting({
        businessName: businessName.trim(),
        clientName: clientName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        date: meetingDate,
        ourTime: ourPktTimeFormatted || '08:00 PM PKT',
        theirTime: theirTimeFormatted || '10:00 AM EST',
        status: 'Scheduled',
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-md flex flex-col rounded-xl border ${theme.border} ${theme.bgPanel} shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-4 py-3 border-b ${theme.border} flex items-center justify-between shrink-0`}>
          <h2 className={`text-sm font-bold tracking-tight ${theme.textMain}`}>
            {isEditing ? 'Edit Meeting' : 'Schedule Meeting'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded-md ${theme.textMuted} hover:${theme.textMain} transition-colors cursor-pointer`}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form id="schedule-meeting-form" onSubmit={handleSubmit} className="p-4 space-y-3.5">
          {/* Step 1: Search Contact (Name, Phone, Email) */}
          <div className="space-y-1 relative">
            <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
              Contact (Search by name, phone, or email)
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
              <input
                type="text"
                value={contactSearch}
                onChange={(e) => {
                  setContactSearch(e.target.value);
                  setSelectedPersonId(null);
                  setBusinessName(e.target.value);
                }}
                placeholder="Type contact name, phone or email..."
                className={`w-full text-xs pl-8 pr-7 py-1.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none focus:border-slate-400`}
                autoFocus
              />
              {selectedPersonId && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPersonId(null);
                    setContactSearch('');
                    setBusinessName('');
                    setClientName('');
                    setPhone('');
                    setEmail('');
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown search results */}
            {filteredContacts.length > 0 && !selectedPersonId && (
              <div className={`absolute z-20 left-0 right-0 top-full mt-1 rounded-lg border ${theme.border} ${theme.bgPanel} shadow-lg overflow-hidden divide-y ${theme.divide}`}>
                {filteredContacts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectContact(p)}
                    className={`w-full px-3 py-2 text-left text-xs ${theme.hoverBg} flex items-center justify-between cursor-pointer`}
                  >
                    <div>
                      <span className={`font-semibold ${theme.textMain}`}>
                        {p.businessName}
                      </span>
                      {p.contactName && (
                        <span className={`text-[11px] ${theme.textMuted} ml-1.5`}>
                          · {p.contactName}
                        </span>
                      )}
                      <p className={`text-[10px] ${theme.textMuted}`}>
                        {p.phones[0] || p.emails[0] || p.niche || p.city || 'No direct phone'}
                      </p>
                    </div>
                    {(p.city || p.niche) && (
                      <span className="text-[10px] text-slate-400 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
                        {p.city || p.niche}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auto-filled details in single clean line if contact selected */}
          {businessName && (
            <div className={`px-2.5 py-1.5 rounded-md border ${theme.border} text-[11px] ${theme.textMuted} flex items-center justify-between`}>
              <span className="truncate">
                <strong className={theme.textMain}>{businessName}</strong>
                {clientName && ` · ${clientName}`}
                {phone && ` · ${phone}`}
              </span>
              <CheckIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-2" />
            </div>
          )}

          {/* Step 2: Searchable City by Name & Editable Current Time */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Searchable City Input */}
            <div className="space-y-1 relative" ref={cityDropdownRef}>
              <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
                Search Client City
              </label>
              <input
                type="text"
                value={citySearchQuery}
                onFocus={() => setIsCityDropdownOpen(true)}
                onChange={(e) => {
                  setCitySearchQuery(e.target.value);
                  setIsCityDropdownOpen(true);
                }}
                placeholder="Search city (e.g. New York, London)..."
                className={`w-full text-xs p-1.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none`}
              />

              {/* City Autocomplete Dropdown */}
              {isCityDropdownOpen && filteredCities.length > 0 && (
                <div className={`absolute z-30 left-0 right-0 top-full mt-1 max-h-48 rounded-lg border ${theme.border} ${theme.bgPanel} shadow-xl overflow-y-auto divide-y ${theme.divide}`}>
                  {filteredCities.map((c) => (
                    <button
                      key={`${c.city}-${c.country}-${c.tz}`}
                      type="button"
                      onClick={() => handleSelectCity(c)}
                      className={`w-full px-2.5 py-1.5 text-left text-xs ${theme.hoverBg} flex items-center justify-between cursor-pointer`}
                    >
                      <span className={`font-medium ${theme.textMain}`}>
                        {c.city}, <span className="text-slate-400">{c.state ? `${c.state}, ` : ''}{c.country}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.abbr}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Editable Current Time Input */}
            <div className="space-y-1">
              <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
                Current Time There (Editable)
              </label>
              <input
                type="time"
                value={clientLiveTime24}
                onChange={(e) => handleCurrentTimeChange(e.target.value)}
                className={`w-full text-xs p-1.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} font-mono focus:outline-none`}
              />
            </div>
          </div>

          {/* Call Prompt Verification */}
          <p className={`text-[11px] ${theme.textMuted} italic`}>
            Ask client: &quot;Hey, is it like <span className={`font-semibold not-italic ${theme.textMain}`}>{clientLiveTime12 || clientLiveTime24}</span> there?&quot;
          </p>

          {/* Step 3: Meeting Date & Scheduled Time (Their Time) */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="space-y-1">
              <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
                Date
              </label>
              <input
                type="date"
                required
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className={`w-full text-xs p-1.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none`}
              />
            </div>

            <div className="space-y-1">
              <label className={`text-[11px] font-medium ${theme.textMuted} block`}>
                Their Time ({selectedCity.abbr})
              </label>
              <input
                type="time"
                required
                value={clientMeetingTime24}
                onChange={(e) => setClientMeetingTime24(e.target.value)}
                className={`w-full text-xs p-1.5 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.textMain} focus:outline-none`}
              />
            </div>
          </div>

          {/* Resulting Equivalent Times in single clean line */}
          <div className={`p-2.5 rounded-lg border ${theme.border} space-y-1 text-xs`}>
            <div className="flex items-center justify-between">
              <span className={theme.textMuted}>Their Scheduled Time:</span>
              <span className={`font-medium ${theme.textMain}`}>
                {theirTimeFormatted || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={theme.textMuted}>Our Time (PKT):</span>
              <span className={`font-bold ${theme.textMain}`}>
                {ourPktTimeFormatted || '—'}
              </span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={`px-4 py-2.5 border-t ${theme.border} flex items-center justify-end gap-2 shrink-0`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${theme.border} ${theme.textMuted} hover:${theme.textMain} cursor-pointer`}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="schedule-meeting-form"
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-600 transition-colors cursor-pointer"
          >
            {isEditing ? 'Save Changes' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}
