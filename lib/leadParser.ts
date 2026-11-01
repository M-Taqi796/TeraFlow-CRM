import * as XLSX from 'xlsx';
import type { Person, PersonStage, ContactInfoField } from '@/types/person.types';

export type ParsedLeadPreview = Person;

export interface ParseResult {
  success: boolean;
  totalParsed: number;
  previewRows: ParsedLeadPreview[];
  leads: Person[];
  error?: string;
}

// Clean helper
function cleanStr(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

// Helper to extract phones from string or array
function extractPhones(row: Record<string, any>): string[] {
  const phones: string[] = [];
  const phoneKeys = ['phone', 'mobile', 'tel', 'cell', 'telephone', 'phone_number', 'phone1', 'phone2', 'contact_number'];

  for (const [key, val] of Object.entries(row)) {
    const k = key.toLowerCase().replace(/[\s_-]/g, '');
    if (phoneKeys.some((pk) => k.includes(pk.replace(/[\s_-]/g, '')))) {
      if (Array.isArray(val)) {
        phones.push(...val.map(cleanStr).filter(Boolean));
      } else {
        const str = cleanStr(val);
        if (str) {
          // Check if multiple numbers separated by comma or slash
          const parts = str.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean);
          phones.push(...parts);
        }
      }
    }
  }

  // Deduplicate and return at least empty fallback
  const unique = Array.from(new Set(phones));
  return unique.length > 0 ? unique : [''];
}

// Helper to extract emails from string or array
function extractEmails(row: Record<string, any>): string[] {
  const emails: string[] = [];
  const emailKeys = ['email', 'mail', 'e-mail', 'emailaddress', 'email1', 'email2'];

  for (const [key, val] of Object.entries(row)) {
    const k = key.toLowerCase().replace(/[\s_-]/g, '');
    if (emailKeys.some((ek) => k.includes(ek.replace(/[\s_-]/g, '')))) {
      if (Array.isArray(val)) {
        emails.push(...val.map(cleanStr).filter(Boolean));
      } else {
        const str = cleanStr(val);
        if (str) {
          const parts = str.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean);
          emails.push(...parts);
        }
      }
    }
  }

  const unique = Array.from(new Set(emails));
  return unique.length > 0 ? unique : [''];
}

// Helper to extract tags (splits comma, strips #)
function extractTags(row: Record<string, any>): string[] {
  for (const [key, val] of Object.entries(row)) {
    const k = key.toLowerCase();
    if (k.includes('tag') || k.includes('label')) {
      if (Array.isArray(val)) {
        return val.map((t) => cleanStr(t).replace(/^#/, '')).filter(Boolean);
      }
      const str = cleanStr(val);
      if (str) {
        return str
          .split(/[,;]+/)
          .map((t) => t.trim().replace(/^#/, ''))
          .filter(Boolean);
      }
    }
  }
  return ['New Lead'];
}

// Parse vCard (.vcf) format
function parseVCard(vcfText: string, fallbackNiche: string, fallbackCity: string, defaultStage: PersonStage): Person[] {
  const cards = vcfText.split(/BEGIN:VCARD/i).filter((c) => c.trim().length > 0);
  const people: Person[] = [];

  for (const card of cards) {
    const lines = card.split(/\r?\n/);
    let contactName = '';
    let businessName = '';
    const phones: string[] = [];
    const emails: string[] = [];
    let note = '';
    let address = '';
    let website = '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (/^FN/i.test(line)) {
        contactName = line.replace(/^FN[^:]*:/i, '').trim();
      } else if (/^ORG/i.test(line)) {
        businessName = line.replace(/^ORG[^:]*:/i, '').split(';')[0].trim();
      } else if (/^TEL/i.test(line)) {
        const ph = line.replace(/^TEL[^:]*:/i, '').trim();
        if (ph) phones.push(ph);
      } else if (/^EMAIL/i.test(line)) {
        const em = line.replace(/^EMAIL[^:]*:/i, '').trim();
        if (em) emails.push(em);
      } else if (/^NOTE/i.test(line)) {
        note = line.replace(/^NOTE[^:]*:/i, '').trim();
      } else if (/^ADR/i.test(line)) {
        const adrParts = line.replace(/^ADR[^:]*:/i, '').split(';').filter(Boolean);
        address = adrParts.join(', ').trim();
      } else if (/^URL/i.test(line)) {
        website = line.replace(/^URL[^:]*:/i, '').trim();
      }
    }

    if (!businessName && !contactName) continue;

    const contactFields: ContactInfoField[] = [];
    if (address) {
      contactFields.push({ id: `cf-${Date.now()}-adr`, type: 'address', label: 'Address', value: address });
    }
    if (website) {
      contactFields.push({ id: `cf-${Date.now()}-web`, type: 'website', label: 'Website', value: website });
    }

    people.push({
      id: `lead-vcf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      businessName: businessName || contactName || 'Imported Business',
      contactName: contactName || '',
      phones: phones.length > 0 ? phones : [''],
      emails: emails.length > 0 ? emails : [''],
      niche: fallbackNiche || 'General',
      city: fallbackCity || 'United States',
      stage: defaultStage,
      tags: ['Imported'],
      notes: note || 'Imported from vCard',
      contactFields,
      createdAt: 'Just now',
      activities: [
        {
          id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'note',
          title: 'Lead Imported',
          description: `Imported via vCard. Niche: ${fallbackNiche}, City: ${fallbackCity}.`,
          timestamp: new Date().toISOString(),
          relativeTime: 'Just now',
          author: 'System',
        },
      ],
    });
  }

  return people;
}

// Transform normalized rows into Person objects
function transformRowsToPeople(
  rows: Record<string, any>[],
  fallbackNiche: string,
  fallbackCity: string,
  defaultStage: PersonStage
): Person[] {
  const people: Person[] = [];

  for (const row of rows) {
    // 1. Business Name detection
    let businessName = '';
    const bKeys = ['business', 'company', 'organization', 'org', 'firm', 'account', 'businessname', 'companyname', 'client', 'practice'];
    for (const [k, v] of Object.entries(row)) {
      const cleanK = k.toLowerCase().replace(/[\s_-]/g, '');
      if (bKeys.some((bk) => cleanK === bk || cleanK.includes(bk))) {
        businessName = cleanStr(v);
        if (businessName) break;
      }
    }

    // 2. Contact Name detection
    let contactName = '';
    const nameKeys = ['contact', 'name', 'fullname', 'person', 'contactname', 'owner', 'leadname'];
    for (const [k, v] of Object.entries(row)) {
      const cleanK = k.toLowerCase().replace(/[\s_-]/g, '');
      if (nameKeys.some((nk) => cleanK === nk || cleanK.includes(nk))) {
        contactName = cleanStr(v);
        if (contactName) break;
      }
    }
    // Also check first_name + last_name
    if (!contactName) {
      let firstName = '';
      let lastName = '';
      for (const [k, v] of Object.entries(row)) {
        const cleanK = k.toLowerCase().replace(/[\s_-]/g, '');
        if (cleanK === 'firstname' || cleanK === 'fname') firstName = cleanStr(v);
        if (cleanK === 'lastname' || cleanK === 'lname') lastName = cleanStr(v);
      }
      contactName = [firstName, lastName].filter(Boolean).join(' ');
    }

    // If neither business name nor contact name exists, row is useless -> discard
    if (!businessName && !contactName) continue;
    if (!businessName) businessName = contactName;

    // 3. Extract Phones and Emails
    const phones = extractPhones(row);
    const emails = extractEmails(row);

    // 4. Extract Niche & City (Row value or fallback)
    let niche = '';
    let city = '';
    for (const [k, v] of Object.entries(row)) {
      const cleanK = k.toLowerCase().replace(/[\s_-]/g, '');
      if (cleanK === 'niche' || cleanK === 'industry' || cleanK === 'category') niche = cleanStr(v);
      if (cleanK === 'city' || cleanK === 'location' || cleanK === 'region' || cleanK === 'state') city = cleanStr(v);
    }
    niche = niche || fallbackNiche || 'General';
    city = city || fallbackCity || 'United States';

    // 5. Extract Notes / Comments
    let notes = '';
    for (const [k, v] of Object.entries(row)) {
      const cleanK = k.toLowerCase().replace(/[\s_-]/g, '');
      if (['notes', 'note', 'comment', 'comments', 'description', 'memo'].includes(cleanK)) {
        notes = cleanStr(v);
        if (notes) break;
      }
    }

    // 6. Extract Tags
    const tags = extractTags(row);

    // 7. Extract Custom Contact Fields (Address, Website, Socials)
    const contactFields: ContactInfoField[] = [];
    for (const [k, v] of Object.entries(row)) {
      const cleanK = k.toLowerCase().replace(/[\s_-]/g, '');
      const strVal = cleanStr(v);
      if (!strVal) continue;

      if (cleanK.includes('address') || cleanK === 'street') {
        contactFields.push({ id: `cf-${Date.now()}-${cleanK}`, type: 'address', label: 'Address', value: strVal });
      } else if (cleanK.includes('website') || cleanK.includes('url') || cleanK.includes('web')) {
        contactFields.push({ id: `cf-${Date.now()}-${cleanK}`, type: 'website', label: 'Website', value: strVal });
      } else if (cleanK.includes('linkedin')) {
        contactFields.push({ id: `cf-${Date.now()}-${cleanK}`, type: 'linkedin', label: 'LinkedIn', value: strVal });
      } else if (cleanK.includes('facebook')) {
        contactFields.push({ id: `cf-${Date.now()}-${cleanK}`, type: 'facebook', label: 'Facebook', value: strVal });
      } else if (cleanK.includes('instagram')) {
        contactFields.push({ id: `cf-${Date.now()}-${cleanK}`, type: 'instagram', label: 'Instagram', value: strVal });
      }
    }

    people.push({
      id: `lead-imp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      businessName,
      contactName,
      phones,
      emails,
      niche,
      city,
      stage: defaultStage,
      tags: tags.length > 0 ? tags : ['Imported'],
      notes: notes || `Imported lead (${niche} - ${city})`,
      contactFields,
      createdAt: 'Just now',
      activities: [
        {
          id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'note',
          title: 'Lead Imported',
          description: `Imported to database. Niche: ${niche}, City: ${city}.`,
          timestamp: new Date().toISOString(),
          relativeTime: 'Just now',
          author: 'System',
        },
      ],
    });
  }

  return people;
}

/**
 * Main parser entrypoint.
 * Accepts File, detects extension, parses rows, discards junk, and normalizes into Person[]
 */
export async function parseLeadsFile(
  file: File,
  fallbackNiche: string,
  fallbackCity: string,
  defaultStage: PersonStage = 'New Leads'
): Promise<ParseResult> {
  const fileName = file.name.toLowerCase();

  try {
    // 1. vCard (.vcf)
    if (fileName.endsWith('.vcf')) {
      const text = await file.text();
      const leads = parseVCard(text, fallbackNiche, fallbackCity, defaultStage);
      return {
        success: true,
        totalParsed: leads.length,
        previewRows: leads.slice(0, 5),
        leads,
      };
    }

    // 2. JSON (.json)
    if (fileName.endsWith('.json')) {
      const text = await file.text();
      const parsed = JSON.parse(text);
      let rawArray: Record<string, any>[] = [];

      if (Array.isArray(parsed)) {
        rawArray = parsed;
      } else if (parsed && typeof parsed === 'object') {
        const potentialArray = Object.values(parsed).find((val) => Array.isArray(val));
        if (potentialArray) {
          rawArray = potentialArray as Record<string, any>[];
        } else {
          rawArray = [parsed];
        }
      }

      const leads = transformRowsToPeople(rawArray, fallbackNiche, fallbackCity, defaultStage);
      return {
        success: true,
        totalParsed: leads.length,
        previewRows: leads.slice(0, 5),
        leads,
      };
    }

    // 3. Excel (.xlsx, .xls) & CSV (.csv) via SheetJS
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return {
        success: false,
        totalParsed: 0,
        previewRows: [],
        leads: [],
        error: 'The uploaded spreadsheet is empty.',
      };
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

    const leads = transformRowsToPeople(rawRows, fallbackNiche, fallbackCity, defaultStage);

    return {
      success: true,
      totalParsed: leads.length,
      previewRows: leads.slice(0, 5),
      leads,
    };
  } catch (err: any) {
    return {
      success: false,
      totalParsed: 0,
      previewRows: [],
      leads: [],
      error: err?.message || 'Failed to parse file. Please verify file format.',
    };
  }
}
