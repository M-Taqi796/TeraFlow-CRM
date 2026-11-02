export interface WorldCity {
  city: string;
  country: string;
  state?: string;
  tz: string; // IANA timezone
  abbr: string; // Display abbreviation
}

export const WORLD_CITIES: WorldCity[] = [
  // United States - Major Metros & Tech/Business Hubs
  { city: 'New York', country: 'United States', state: 'NY', tz: 'America/New_York', abbr: 'EST' },
  { city: 'Los Angeles', country: 'United States', state: 'CA', tz: 'America/Los_Angeles', abbr: 'PST' },
  { city: 'Chicago', country: 'United States', state: 'IL', tz: 'America/Chicago', abbr: 'CST' },
  { city: 'Houston', country: 'United States', state: 'TX', tz: 'America/Chicago', abbr: 'CST' },
  { city: 'Phoenix', country: 'United States', state: 'AZ', tz: 'America/Phoenix', abbr: 'MST' },
  { city: 'Philadelphia', country: 'United States', state: 'PA', tz: 'America/New_York', abbr: 'EST' },
  { city: 'San Antonio', country: 'United States', state: 'TX', tz: 'America/Chicago', abbr: 'CST' },
  { city: 'San Diego', country: 'United States', state: 'CA', tz: 'America/Los_Angeles', abbr: 'PST' },
  { city: 'Dallas', country: 'United States', state: 'TX', tz: 'America/Chicago', abbr: 'CST' },
  { city: 'Austin', country: 'United States', state: 'TX', tz: 'America/Chicago', abbr: 'CST' },
  { city: 'San Jose', country: 'United States', state: 'CA', tz: 'America/Los_Angeles', abbr: 'PST' },
  { city: 'Fort Worth', country: 'United States', state: 'TX', tz: 'America/Chicago', abbr: 'CST' },
  { city: 'Jacksonville', country: 'United States', state: 'FL', tz: 'America/New_York', abbr: 'EST' },
  { city: 'Columbus', country: 'United States', state: 'OH', tz: 'America/New_York', abbr: 'EST' },
  { city: 'Charlotte', country: 'United States', state: 'NC', tz: 'America/New_York', abbr: 'EST' },
  { city: 'Indianapolis', country: 'United States', state: 'IN', tz: 'America/Indiana/Indianapolis', abbr: 'EST' },
  { city: 'San Francisco', country: 'United States', state: 'CA', tz: 'America/Los_Angeles', abbr: 'PST' },
  { city: 'Seattle', country: 'United States', state: 'WA', tz: 'America/Los_Angeles', abbr: 'PST' },
  { city: 'Denver', country: 'United States', state: 'CO', tz: 'America/Denver', abbr: 'MST' },
  { city: 'Oklahoma City', country: 'United States', state: 'OK', tz: 'America/Chicago', abbr: 'CST' },
  { city: 'Nashville', country: 'United States', state: 'TN', tz: 'America/Chicago', abbr: 'CST' },
  { city: 'Washington', country: 'United States', state: 'DC', tz: 'America/New_York', abbr: 'EST' },
  { city: 'El Paso', country: 'United States', state: 'TX', tz: 'America/Denver', abbr: 'MST' },
  { city: 'Las Vegas', country: 'United States', state: 'NV', tz: 'America/Los_Angeles', abbr: 'PST' },
  { city: 'Boston', country: 'United States', state: 'MA', tz: 'America/New_York', abbr: 'EST' },
  { city: 'Portland', country: 'United States', state: 'OR', tz: 'America/Los_Angeles', abbr: 'PST' },
  { city: 'Detroit', country: 'United States', state: 'MI', tz: 'America/Detroit', abbr: 'EST' },
  { city: 'Memphis', country: 'United States', state: 'TN', tz: 'America/Chicago', abbr: 'CST' },
  { city: 'Louisville', country: 'United States', state: 'KY', tz: 'America/Kentucky/Louisville', abbr: 'EST' },
  { city: 'Baltimore', country: 'United States', state: 'MD', tz: 'America/New_York', abbr: 'EST' },
  { city: 'Milwaukee', country: 'United States', state: 'WI', tz: 'America/Chicago', abbr: 'CST' },
  { city: 'Albuquerque', country: 'United States', state: 'NM', tz: 'America/Denver', abbr: 'MST' },
  { city: 'Tucson', country: 'United States', state: 'AZ', tz: 'America/Phoenix', abbr: 'MST' },
  { city: 'Fresno', country: 'United States', state: 'CA', tz: 'America/Los_Angeles', abbr: 'PST' },
  { city: 'Sacramento', country: 'United States', state: 'CA', tz: 'America/Los_Angeles', abbr: 'PST' },
  { city: 'Mesa', country: 'United States', state: 'AZ', tz: 'America/Phoenix', abbr: 'MST' },
  { city: 'Kansas City', country: 'United States', state: 'MO', tz: 'America/Chicago', abbr: 'CST' },
  { city: 'Atlanta', country: 'United States', state: 'GA', tz: 'America/New_York', abbr: 'EST' },
  { city: 'Omaha', country: 'United States', state: 'NE', tz: 'America/Chicago', abbr: 'CST' },
  { city: 'Colorado Springs', country: 'United States', state: 'CO', tz: 'America/Denver', abbr: 'MST' },
  { city: 'Raleigh', country: 'United States', state: 'NC', tz: 'America/New_York', abbr: 'EST' },
  { city: 'Miami', country: 'United States', state: 'FL', tz: 'America/New_York', abbr: 'EST' },
  { city: 'Tampa', country: 'United States', state: 'FL', tz: 'America/New_York', abbr: 'EST' },
  { city: 'Orlando', country: 'United States', state: 'FL', tz: 'America/New_York', abbr: 'EST' },
  { city: 'Minneapolis', country: 'United States', state: 'MN', tz: 'America/Chicago', abbr: 'CST' },
  { city: 'Cleveland', country: 'United States', state: 'OH', tz: 'America/New_York', abbr: 'EST' },
  { city: 'New Orleans', country: 'United States', state: 'LA', tz: 'America/Chicago', abbr: 'CST' },
  { city: 'Salt Lake City', country: 'United States', state: 'UT', tz: 'America/Denver', abbr: 'MST' },
  { city: 'Honolulu', country: 'United States', state: 'HI', tz: 'Pacific/Honolulu', abbr: 'HST' },
  { city: 'Anchorage', country: 'United States', state: 'AK', tz: 'America/Anchorage', abbr: 'AKST' },

  // Canada
  { city: 'Toronto', country: 'Canada', state: 'ON', tz: 'America/Toronto', abbr: 'EST' },
  { city: 'Montreal', country: 'Canada', state: 'QC', tz: 'America/Toronto', abbr: 'EST' },
  { city: 'Vancouver', country: 'Canada', state: 'BC', tz: 'America/Vancouver', abbr: 'PST' },
  { city: 'Calgary', country: 'Canada', state: 'AB', tz: 'America/Edmonton', abbr: 'MST' },
  { city: 'Edmonton', country: 'Canada', state: 'AB', tz: 'America/Edmonton', abbr: 'MST' },
  { city: 'Ottawa', country: 'Canada', state: 'ON', tz: 'America/Toronto', abbr: 'EST' },
  { city: 'Winnipeg', country: 'Canada', state: 'MB', tz: 'America/Winnipeg', abbr: 'CST' },
  { city: 'Quebec City', country: 'Canada', state: 'QC', tz: 'America/Toronto', abbr: 'EST' },
  { city: 'Halifax', country: 'Canada', state: 'NS', tz: 'America/Halifax', abbr: 'AST' },

  // United Kingdom & Ireland
  { city: 'London', country: 'United Kingdom', tz: 'Europe/London', abbr: 'GMT' },
  { city: 'Manchester', country: 'United Kingdom', tz: 'Europe/London', abbr: 'GMT' },
  { city: 'Birmingham', country: 'United Kingdom', tz: 'Europe/London', abbr: 'GMT' },
  { city: 'Leeds', country: 'United Kingdom', tz: 'Europe/London', abbr: 'GMT' },
  { city: 'Glasgow', country: 'United Kingdom', tz: 'Europe/London', abbr: 'GMT' },
  { city: 'Edinburgh', country: 'United Kingdom', tz: 'Europe/London', abbr: 'GMT' },
  { city: 'Liverpool', country: 'United Kingdom', tz: 'Europe/London', abbr: 'GMT' },
  { city: 'Bristol', country: 'United Kingdom', tz: 'Europe/London', abbr: 'GMT' },
  { city: 'Dublin', country: 'Ireland', tz: 'Europe/Dublin', abbr: 'GMT' },
  { city: 'Belfast', country: 'United Kingdom', tz: 'Europe/Belfast', abbr: 'GMT' },

  // Europe (CET / Western & Eastern Europe)
  { city: 'Paris', country: 'France', tz: 'Europe/Paris', abbr: 'CET' },
  { city: 'Berlin', country: 'Germany', tz: 'Europe/Berlin', abbr: 'CET' },
  { city: 'Frankfurt', country: 'Germany', tz: 'Europe/Berlin', abbr: 'CET' },
  { city: 'Munich', country: 'Germany', tz: 'Europe/Berlin', abbr: 'CET' },
  { city: 'Hamburg', country: 'Germany', tz: 'Europe/Berlin', abbr: 'CET' },
  { city: 'Amsterdam', country: 'Netherlands', tz: 'Europe/Amsterdam', abbr: 'CET' },
  { city: 'Rotterdam', country: 'Netherlands', tz: 'Europe/Amsterdam', abbr: 'CET' },
  { city: 'Brussels', country: 'Belgium', tz: 'Europe/Brussels', abbr: 'CET' },
  { city: 'Madrid', country: 'Spain', tz: 'Europe/Madrid', abbr: 'CET' },
  { city: 'Barcelona', country: 'Spain', tz: 'Europe/Madrid', abbr: 'CET' },
  { city: 'Rome', country: 'Italy', tz: 'Europe/Rome', abbr: 'CET' },
  { city: 'Milan', country: 'Italy', tz: 'Europe/Rome', abbr: 'CET' },
  { city: 'Vienna', country: 'Austria', tz: 'Europe/Vienna', abbr: 'CET' },
  { city: 'Zurich', country: 'Switzerland', tz: 'Europe/Zurich', abbr: 'CET' },
  { city: 'Geneva', country: 'Switzerland', tz: 'Europe/Zurich', abbr: 'CET' },
  { city: 'Stockholm', country: 'Sweden', tz: 'Europe/Stockholm', abbr: 'CET' },
  { city: 'Oslo', country: 'Norway', tz: 'Europe/Oslo', abbr: 'CET' },
  { city: 'Copenhagen', country: 'Denmark', tz: 'Europe/Copenhagen', abbr: 'CET' },
  { city: 'Helsinki', country: 'Finland', tz: 'Europe/Helsinki', abbr: 'EET' },
  { city: 'Warsaw', country: 'Poland', tz: 'Europe/Warsaw', abbr: 'CET' },
  { city: 'Prague', country: 'Czech Republic', tz: 'Europe/Prague', abbr: 'CET' },
  { city: 'Budapest', country: 'Hungary', tz: 'Europe/Budapest', abbr: 'CET' },
  { city: 'Bucharest', country: 'Romania', tz: 'Europe/Bucharest', abbr: 'EET' },
  { city: 'Athens', country: 'Greece', tz: 'Europe/Athens', abbr: 'EET' },
  { city: 'Lisbon', country: 'Portugal', tz: 'Europe/Lisbon', abbr: 'WET' },
  { city: 'Istanbul', country: 'Turkey', tz: 'Europe/Istanbul', abbr: 'TRT' },

  // Middle East & Gulf
  { city: 'Dubai', country: 'United Arab Emirates', tz: 'Asia/Dubai', abbr: 'GST' },
  { city: 'Abu Dhabi', country: 'United Arab Emirates', tz: 'Asia/Dubai', abbr: 'GST' },
  { city: 'Sharjah', country: 'United Arab Emirates', tz: 'Asia/Dubai', abbr: 'GST' },
  { city: 'Riyadh', country: 'Saudi Arabia', tz: 'Asia/Riyadh', abbr: 'AST' },
  { city: 'Jeddah', country: 'Saudi Arabia', tz: 'Asia/Riyadh', abbr: 'AST' },
  { city: 'Doha', country: 'Qatar', tz: 'Asia/Qatar', abbr: 'AST' },
  { city: 'Kuwait City', country: 'Kuwait', tz: 'Asia/Kuwait', abbr: 'AST' },
  { city: 'Manama', country: 'Bahrain', tz: 'Asia/Bahrain', abbr: 'AST' },
  { city: 'Muscat', country: 'Oman', tz: 'Asia/Muscat', abbr: 'GST' },
  { city: 'Beirut', country: 'Lebanon', tz: 'Asia/Beirut', abbr: 'EET' },
  { city: 'Amman', country: 'Jordan', tz: 'Asia/Amman', abbr: 'AST' },
  { city: 'Cairo', country: 'Egypt', tz: 'Africa/Cairo', abbr: 'EET' },

  // Pakistan & South Asia
  { city: 'Karachi', country: 'Pakistan', tz: 'Asia/Karachi', abbr: 'PKT' },
  { city: 'Lahore', country: 'Pakistan', tz: 'Asia/Karachi', abbr: 'PKT' },
  { city: 'Islamabad', country: 'Pakistan', tz: 'Asia/Karachi', abbr: 'PKT' },
  { city: 'Rawalpindi', country: 'Pakistan', tz: 'Asia/Karachi', abbr: 'PKT' },
  { city: 'Faisalabad', country: 'Pakistan', tz: 'Asia/Karachi', abbr: 'PKT' },
  { city: 'Multan', country: 'Pakistan', tz: 'Asia/Karachi', abbr: 'PKT' },
  { city: 'Peshawar', country: 'Pakistan', tz: 'Asia/Karachi', abbr: 'PKT' },
  { city: 'Quetta', country: 'Pakistan', tz: 'Asia/Karachi', abbr: 'PKT' },
  { city: 'Sialkot', country: 'Pakistan', tz: 'Asia/Karachi', abbr: 'PKT' },
  { city: 'Mumbai', country: 'India', tz: 'Asia/Kolkata', abbr: 'IST' },
  { city: 'Delhi', country: 'India', tz: 'Asia/Kolkata', abbr: 'IST' },
  { city: 'Bangalore', country: 'India', tz: 'Asia/Kolkata', abbr: 'IST' },
  { city: 'Hyderabad', country: 'India', tz: 'Asia/Kolkata', abbr: 'IST' },
  { city: 'Chennai', country: 'India', tz: 'Asia/Kolkata', abbr: 'IST' },
  { city: 'Dhaka', country: 'Bangladesh', tz: 'Asia/Dhaka', abbr: 'BST' },
  { city: 'Colombo', country: 'Sri Lanka', tz: 'Asia/Colombo', abbr: 'IST' },

  // Asia Pacific
  { city: 'Singapore', country: 'Singapore', tz: 'Asia/Singapore', abbr: 'SGT' },
  { city: 'Kuala Lumpur', country: 'Malaysia', tz: 'Asia/Kuala_Lumpur', abbr: 'MYT' },
  { city: 'Hong Kong', country: 'Hong Kong', tz: 'Asia/Hong_Kong', abbr: 'HKT' },
  { city: 'Tokyo', country: 'Japan', tz: 'Asia/Tokyo', abbr: 'JST' },
  { city: 'Osaka', country: 'Japan', tz: 'Asia/Tokyo', abbr: 'JST' },
  { city: 'Seoul', country: 'South Korea', tz: 'Asia/Seoul', abbr: 'KST' },
  { city: 'Taipei', country: 'Taiwan', tz: 'Asia/Taipei', abbr: 'CST' },
  { city: 'Bangkok', country: 'Thailand', tz: 'Asia/Bangkok', abbr: 'ICT' },
  { city: 'Jakarta', country: 'Indonesia', tz: 'Asia/Jakarta', abbr: 'WIB' },
  { city: 'Manila', country: 'Philippines', tz: 'Asia/Manila', abbr: 'PST' },
  { city: 'Sydney', country: 'Australia', tz: 'Australia/Sydney', abbr: 'AEST' },
  { city: 'Melbourne', country: 'Australia', tz: 'Australia/Melbourne', abbr: 'AEST' },
  { city: 'Brisbane', country: 'Australia', tz: 'Australia/Brisbane', abbr: 'AEST' },
  { city: 'Perth', country: 'Australia', tz: 'Australia/Perth', abbr: 'AWST' },
  { city: 'Adelaide', country: 'Australia', tz: 'Australia/Adelaide', abbr: 'ACST' },
  { city: 'Auckland', country: 'New Zealand', tz: 'Pacific/Auckland', abbr: 'NZST' },
  { city: 'Wellington', country: 'New Zealand', tz: 'Pacific/Auckland', abbr: 'NZST' },

  // Latin America & Africa
  { city: 'Sao Paulo', country: 'Brazil', tz: 'America/Sao_Paulo', abbr: 'BRT' },
  { city: 'Rio de Janeiro', country: 'Brazil', tz: 'America/Sao_Paulo', abbr: 'BRT' },
  { city: 'Buenos Aires', country: 'Argentina', tz: 'America/Argentina/Buenos_Aires', abbr: 'ART' },
  { city: 'Santiago', country: 'Chile', tz: 'America/Santiago', abbr: 'CLT' },
  { city: 'Bogota', country: 'Colombia', tz: 'America/Bogota', abbr: 'COT' },
  { city: 'Mexico City', country: 'Mexico', tz: 'America/Mexico_City', abbr: 'CST' },
  { city: 'Guadalajara', country: 'Mexico', tz: 'America/Mexico_City', abbr: 'CST' },
  { city: 'Monterrey', country: 'Mexico', tz: 'America/Monterrey', abbr: 'CST' },
  { city: 'Johannesburg', country: 'South Africa', tz: 'Africa/Johannesburg', abbr: 'SAST' },
  { city: 'Cape Town', country: 'South Africa', tz: 'Africa/Johannesburg', abbr: 'SAST' },
  { city: 'Nairobi', country: 'Kenya', tz: 'Africa/Nairobi', abbr: 'EAT' },
  { city: 'Lagos', country: 'Nigeria', tz: 'Africa/Lagos', abbr: 'WAT' },
];

/**
 * Accurately calculates the live 12-hour time and 24-hour time for any given IANA timezone.
 */
export function getLiveTimeForZone(ianaTz: string): {
  time12: string; // e.g. "08:30 PM"
  time24: string; // e.g. "20:30"
  offsetMinutes: number; // minutes from UTC
} {
  try {
    const now = new Date();

    const parts12 = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).formatToParts(now);

    let h12 = '';
    let m = '';
    let dayPeriod = 'AM';
    parts12.forEach((p) => {
      if (p.type === 'hour') h12 = p.value;
      if (p.type === 'minute') m = p.value;
      if (p.type === 'dayPeriod') dayPeriod = p.value;
    });

    const parts24 = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(now);

    let h24 = '';
    parts24.forEach((p) => {
      if (p.type === 'hour') h24 = p.value;
    });

    // Handle 24 if returned as "24"
    if (h24 === '24') h24 = '00';

    // Calculate timezone offset from UTC in minutes
    // By comparing ISO UTC string and local target string
    const utcDate = new Date(now.toISOString());
    const targetString = now.toLocaleString('en-US', { timeZone: ianaTz });
    const targetDate = new Date(targetString);
    const offsetMinutes = Math.round((targetDate.getTime() - utcDate.getTime()) / 60000);

    return {
      time12: `${h12}:${m} ${dayPeriod}`,
      time24: `${h24}:${m}`,
      offsetMinutes,
    };
  } catch {
    return {
      time12: '10:00 AM',
      time24: '10:00',
      offsetMinutes: -300,
    };
  }
}
