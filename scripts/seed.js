const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ap-northeast-2.pooler.supabase.com',
  port: 5432,
  user: 'postgres.zuoymwjmnqhqymalaxuf',
  password: 'TeraOnic$$796',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

const orgId = 'c74f1503-9d09-4ffc-bf08-aa7f09f12f43';
const authorId = 'a0000000-0000-0000-0000-000000000001';

async function seed() {
  await client.connect();
  console.log('Connected to PG');

  // 1. Seed Meetings
  const meetings = [
    {
      business_name: 'Apex Solutions Ltd',
      client_name: 'Kamran Siddiqui',
      phone: '+92 300 1234567',
      email: 'kamran@apexsolutions.pk',
      meeting_date: '2026-11-02',
      our_time: '03:00 PM PKT',
      their_time: '06:00 AM EST',
      status: 'Scheduled'
    },
    {
      business_name: 'Nexus Cloud Services',
      client_name: 'Sarah Jenkins',
      phone: '+1 415 555 0192',
      email: 'sjenkins@nexuscloud.io',
      meeting_date: '2026-11-02',
      our_time: '08:30 PM PKT',
      their_time: '11:30 AM EST',
      status: 'Scheduled'
    },
    {
      business_name: 'Vertex Technologies',
      client_name: 'David Miller',
      phone: '+44 20 7946 0912',
      email: 'd.miller@vertextech.co.uk',
      meeting_date: '2026-11-03',
      our_time: '09:00 PM PKT',
      their_time: '05:00 PM GMT',
      status: 'Deal Done'
    },
    {
      business_name: 'Crestline Logistics',
      client_name: 'Bilal Farooq',
      phone: '+92 321 9876543',
      email: 'bilal@crestlinelog.com',
      meeting_date: '2026-11-05',
      our_time: '02:00 PM PKT',
      their_time: '02:00 PM PKT',
      status: 'Not attended'
    },
    {
      business_name: 'Solaris Energy Group',
      client_name: 'Elena Rostova',
      phone: '+1 305 555 0144',
      email: 'elena@solarisgroup.com',
      meeting_date: '2026-11-06',
      our_time: '05:00 PM PKT',
      their_time: '08:00 AM EST',
      status: 'Scheduled'
    }
  ];

  for (const m of meetings) {
    await client.query(`
      INSERT INTO meetings (org_id, created_by, business_name, client_name, phone, email, meeting_date, our_time, their_time, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [orgId, authorId, m.business_name, m.client_name, m.phone, m.email, m.meeting_date, m.our_time, m.their_time, m.status]);
  }
  console.log('✅ Meetings seeded');

  // 2. Seed Tasks
  const tasks = [
    {
      title: 'Prepare demo slide deck for Apex Solutions meeting',
      assigned_by_name: 'Mustafa',
      assigned_to_name: 'Muhammad Taqi',
      due_date: '2026-11-02',
      due_time: '14:00',
      status: 'TODO'
    },
    {
      title: 'Send customized pricing sheet to Sarah Jenkins',
      assigned_by_name: 'Muhammad Taqi',
      assigned_to_name: 'Muhammad Taqi',
      due_date: '2026-11-02',
      due_time: '17:00',
      status: 'TODO'
    },
    {
      title: 'Reach out to 50 dental practices in Texas for Q4 outreach',
      assigned_by_name: 'Muhammad Taqi',
      assigned_to_name: 'Mustafa',
      due_date: '2026-11-03',
      due_time: '12:00',
      status: 'TODO'
    },
    {
      title: 'Finalize offer letter and onboarding packet for new junior SDR',
      assigned_by_name: 'Muhammad Taqi',
      assigned_to_name: 'Kamran',
      due_date: '2026-11-04',
      due_time: '15:30',
      status: 'TODO'
    },
    {
      title: 'Review scrapers batch #14 duplicate resolutions',
      assigned_by_name: 'Muhammad Taqi',
      assigned_to_name: 'Muhammad Taqi',
      due_date: '2026-10-23',
      due_time: '18:00',
      status: 'TODO'
    }
  ];

  for (const t of tasks) {
    await client.query(`
      INSERT INTO tasks (org_id, assigned_by, assigned_to, assigned_by_name, assigned_to_name, title, due_date, due_time, due_at, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
    `, [orgId, authorId, authorId, t.assigned_by_name, t.assigned_to_name, t.title, t.due_date, t.due_time, t.status]);
  }
  console.log('✅ Tasks seeded');

  // 3. Seed Contacts & Activities
  const contacts = [
    {
      business_name: 'Manhattan Dental Arts',
      contact_name: 'Dr. Michael Chen',
      first_name: 'Michael',
      last_name: 'Chen',
      phones: ['+1 (212) 555-0192', '+1 (212) 555-0199'],
      emails: ['dr.chen@manhattandentalarts.com', 'frontdesk@manhattandentalarts.com'],
      contact_fields: JSON.stringify([
        { id: 'cf-1', type: 'website', label: 'Website', value: 'https://manhattandentalarts.com' },
        { id: 'cf-2', type: 'address', label: 'Office Address', value: '450 Lexington Ave, New York, NY 10017' },
        { id: 'cf-3', type: 'linkedin', label: 'LinkedIn', value: 'https://linkedin.com/in/michael-chen-dds' }
      ]),
      tags: ['Decision Maker', 'High Priority'],
      niche: 'Dentists',
      city: 'New York',
      stage: 'Booked',
      notes: 'Spoke directly with Dr. Chen. Agreed to 20-min demo on Thursday at 2 PM.',
      last_activity_type: 'call',
      last_activity_summary: 'Call Answered — Demo scheduled for Thursday',
      last_contacted_at: '2026-11-01T18:30:00Z',
      activities: [
        {
          type: 'call',
          title: 'Phone Call (Answered)',
          call_status: 'Answered',
          description: 'Pitch resonated. Agreed to 20-min presentation on Thursday at 2 PM with clinic manager.',
          timestamp: '2026-11-01T18:30:00Z'
        },
        {
          type: 'stage_change',
          title: 'Stage Changed',
          description: 'Moved from Contacted to Booked.',
          timestamp: '2026-11-01T18:32:00Z'
        },
        {
          type: 'email',
          title: 'Calendar Invite Sent',
          email_type: 'Sent',
          email_subject: 'Demo Confirmation — TeraFlow CRM x Manhattan Dental Arts',
          description: 'Sent calendar invite and pre-meeting questionnaire.',
          timestamp: '2026-11-01T18:40:00Z'
        }
      ]
    },
    {
      business_name: 'Lone Star Premier Roofing',
      contact_name: 'James Rodriguez',
      first_name: 'James',
      last_name: 'Rodriguez',
      phones: ['+1 (512) 555-8831'],
      emails: ['james@lonestarpremierroofing.com'],
      contact_fields: JSON.stringify([
        { id: 'cf-4', type: 'website', label: 'Website', value: 'https://lonestarpremierroofing.com' },
        { id: 'cf-5', type: 'facebook', label: 'Facebook', value: 'https://facebook.com/lonestarroofing' }
      ]),
      tags: ['Gatekeeper Reached', 'Call Back Later'],
      niche: 'Roofing',
      city: 'Austin',
      stage: 'Follow-Up',
      notes: 'Receptionist said owner is currently on a job site. Call back Tuesday after 3 PM.',
      last_activity_type: 'call',
      last_activity_summary: 'Spoke with receptionist',
      last_contacted_at: '2026-11-01T14:15:00Z',
      activities: [
        {
          type: 'call',
          title: 'Phone Call (Answered by Gatekeeper)',
          call_status: 'Answered',
          description: 'Spoke with receptionist Sarah. Owner is in field. Follow up next Tuesday.',
          timestamp: '2026-11-01T14:15:00Z'
        }
      ]
    },
    {
      business_name: 'SolarPeak California',
      contact_name: 'Sarah Lin',
      first_name: 'Sarah',
      last_name: 'Lin',
      phones: ['+1 (415) 555-4420'],
      emails: ['sarah@solarpeakcalifornia.com'],
      contact_fields: JSON.stringify([
        { id: 'cf-6', type: 'website', label: 'Website', value: 'https://solarpeakca.com' }
      ]),
      tags: ['Commercial', 'Fast Growing'],
      niche: 'Solar',
      city: 'San Francisco',
      stage: 'Contacted',
      notes: 'Sent cold email sequence on Tuesday. Reached out on LinkedIn as well.',
      last_activity_type: 'email',
      last_activity_summary: 'Cold outreach email sent',
      last_contacted_at: '2026-10-31T09:00:00Z',
      activities: [
        {
          type: 'email',
          title: 'Cold Outreach (Touchpoint #1)',
          email_type: 'Sent',
          email_subject: 'Scaling commercial solar appointments in NorCal',
          description: 'Introduced TeraFlow auto-dialer and appointment booking workflows.',
          timestamp: '2026-10-31T09:00:00Z'
        }
      ]
    },
    {
      business_name: 'Aura MedSpa & Laser',
      contact_name: 'Dr. Kimberly Vance',
      first_name: 'Kimberly',
      last_name: 'Vance',
      phones: ['+1 (305) 555-7729'],
      emails: ['dr.vance@auramedspa.com'],
      contact_fields: JSON.stringify([
        { id: 'cf-7', type: 'website', label: 'Website', value: 'https://auramedspa.com' }
      ]),
      tags: ['High Ticket', 'Decision Maker'],
      niche: 'MedSpa',
      city: 'Miami',
      stage: 'Closed',
      notes: 'Deal closed! Annual subscription on Enterprise tier.',
      last_activity_type: 'stage_change',
      last_activity_summary: 'Deal closed: Enterprise Plan',
      last_contacted_at: '2026-10-29T16:00:00Z',
      activities: [
        {
          type: 'stage_change',
          title: 'Deal Closed',
          description: 'Client signed annual contract for $1,200/mo.',
          timestamp: '2026-10-29T16:00:00Z'
        }
      ]
    }
  ];

  for (const c of contacts) {
    const cRes = await client.query(`
      INSERT INTO contacts (
        org_id, business_name, contact_name, first_name, last_name,
        primary_phone, primary_email, phones, emails, contact_fields,
        tags, niche, city, stage, notes,
        last_activity_type, last_activity_summary, last_contacted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id
    `, [
      orgId, c.business_name, c.contact_name, c.first_name, c.last_name,
      c.phones[0] || null, c.emails[0] || null, c.phones, c.emails, c.contact_fields,
      c.tags, c.niche, c.city, c.stage, c.notes,
      c.last_activity_type, c.last_activity_summary, c.last_contacted_at
    ]);

    const contactId = cRes.rows[0].id;
    for (const a of c.activities) {
      await client.query(`
        INSERT INTO activities (
          org_id, contact_id, author_id, author_name, type, title,
          description, business_name, contact_name, phone, email,
          call_status, email_type, email_subject, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        orgId, contactId, authorId, 'Muhammad Taqi', a.type, a.title,
        a.description, c.business_name, c.contact_name, c.phones[0] || '', c.emails[0] || '',
        a.call_status || null, a.email_type || null, a.email_subject || null, a.timestamp
      ]);
    }
  }
  console.log('✅ Contacts & Activities seeded');

  await client.end();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

