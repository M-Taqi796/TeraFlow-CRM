-- ═══════════════════════════════════════════════════════════════════════════
-- TeraFlow CRM — Production Database Schema Migration
-- Target: PostgreSQL 15+ / Supabase
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. EXTENSIONS & CORE FUNCTIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. ENUMS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('Team Lead', 'Team Member');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('active', 'invited', 'inactive');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'theme_mode') THEN
        CREATE TYPE theme_mode AS ENUM ('light', 'dark');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_stage') THEN
        CREATE TYPE contact_stage AS ENUM ('New Leads', 'Contacted', 'Booked', 'Closed', 'Follow-Up', 'Denied', 'Past Clients');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_priority') THEN
        CREATE TYPE contact_priority AS ENUM ('Low', 'Medium', 'High');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type') THEN
        CREATE TYPE activity_type AS ENUM ('call', 'email', 'note', 'stage_change', 'tag_added', 'tag_removed', 'contact_info', 'name_change', 'task');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meeting_status') THEN
        CREATE TYPE meeting_status AS ENUM ('Scheduled', 'Not attended', 'Deal Done', 'Deal Denied', 'Other');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('TODO', 'COMPLETED');
    END IF;
END $$;

-- 3. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    custom_niches TEXT[] NOT NULL DEFAULT '{}',
    custom_cities TEXT[] NOT NULL DEFAULT '{}',
    global_tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON organizations;
CREATE TRIGGER trg_organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. PROFILES (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'Team Member',
    title VARCHAR(100) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    avatar_url TEXT,
    status user_status NOT NULL DEFAULT 'active',
    theme theme_mode NOT NULL DEFAULT 'dark',

    can_manage_leads BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_outreach BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_tasks BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_meetings BOOLEAN NOT NULL DEFAULT FALSE,
    can_import_data BOOLEAN NOT NULL DEFAULT FALSE,
    can_export_data BOOLEAN NOT NULL DEFAULT FALSE,

    ui_preferences JSONB NOT NULL DEFAULT '{"navExpanded": true, "taskbarExpanded": true}'::jsonb,
    unread_nav JSONB NOT NULL DEFAULT '{"Meetings": false, "Tasks": false, "People": false, "Call Log": false, "Email Outreach": false, "Imports": false, "Teams": false, "Settings": false, "Dashboard": false}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_org_single_team_lead 
ON profiles (org_id) 
WHERE role = 'Team Lead';

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5. CONTACTS / PEOPLE
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) DEFAULT '',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    primary_email VARCHAR(255),
    primary_phone VARCHAR(50),
    phones TEXT[] NOT NULL DEFAULT '{}',
    emails TEXT[] NOT NULL DEFAULT '{}',
    contact_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    stage contact_stage NOT NULL DEFAULT 'New Leads',
    priority contact_priority NOT NULL DEFAULT 'Medium',
    source VARCHAR(100) NOT NULL DEFAULT 'Cold Outreach',
    deal_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    niche VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT DEFAULT '',
    last_contacted_at TIMESTAMPTZ,
    last_activity_type VARCHAR(50),
    last_activity_summary TEXT,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_contacts_updated_at ON contacts;
CREATE TRIGGER trg_contacts_updated_at
BEFORE UPDATE ON contacts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 6. ACTIVITIES (Audited Timeline, Calls, Emails)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL DEFAULT 'Muhammad Taqi',
    type activity_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    business_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    call_status VARCHAR(50),
    call_duration_seconds INT,
    email_type VARCHAR(20),
    email_subject VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_activities_updated_at ON activities;
CREATE TRIGGER trg_activities_updated_at
BEFORE UPDATE ON activities
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 7. MEETINGS
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    city VARCHAR(100) DEFAULT 'New York',
    timezone VARCHAR(100) DEFAULT 'America/New_York',
    meeting_date DATE NOT NULL,
    start_at TIMESTAMPTZ,
    our_time VARCHAR(50) NOT NULL,
    their_time VARCHAR(50) NOT NULL,
    status meeting_status NOT NULL DEFAULT 'Scheduled',
    notes TEXT DEFAULT '',
    meeting_link TEXT,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_meetings_updated_at ON meetings;
CREATE TRIGGER trg_meetings_updated_at
BEFORE UPDATE ON meetings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 8. TASKS
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_by_name VARCHAR(255) NOT NULL DEFAULT 'Muhammad Taqi',
    assigned_to_name VARCHAR(255) NOT NULL DEFAULT 'Muhammad Taqi',
    due_date DATE NOT NULL,
    due_time VARCHAR(10) NOT NULL DEFAULT '17:00',
    due_at TIMESTAMPTZ NOT NULL,
    status task_status NOT NULL DEFAULT 'TODO',
    completion_comment TEXT,
    completed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON tasks;
CREATE TRIGGER trg_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 9. IMPORT BATCHES
CREATE TABLE IF NOT EXISTS import_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    imported_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_url TEXT,
    total_records INT NOT NULL DEFAULT 0,
    successful_records INT NOT NULL DEFAULT 0,
    failed_records INT NOT NULL DEFAULT 0,
    default_niche VARCHAR(100),
    default_city VARCHAR(100),
    default_stage contact_stage NOT NULL DEFAULT 'New Leads',
    applied_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_contacts_org_stage_active 
ON contacts (org_id, stage, created_at DESC) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_org_assigned 
ON contacts (org_id, assigned_to, stage) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_tags_gin 
ON contacts USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_contacts_biz_trgm 
ON contacts USING GIN (business_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_contacts_name_trgm 
ON contacts USING GIN (contact_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_contacts_email_lower 
ON contacts (org_id, LOWER(primary_email)) 
WHERE primary_email IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_phone 
ON contacts (org_id, primary_phone) 
WHERE primary_phone IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_org_active_due 
ON tasks (org_id, due_at ASC) 
WHERE status = 'TODO' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_activities_org_type_created 
ON activities (org_id, type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activities_contact_created 
ON activities (contact_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_meetings_org_date_status 
ON meetings (org_id, meeting_date, status) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_meetings_org_start_at 
ON meetings (org_id, start_at ASC) 
WHERE deleted_at IS NULL;

-- 11. ROW LEVEL SECURITY (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_current_profile()
RETURNS profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT * FROM profiles WHERE id = (SELECT auth.uid());
$$;

DROP POLICY IF EXISTS "Organizations Org Read" ON organizations;
CREATE POLICY "Organizations Org Read" ON organizations
FOR SELECT USING (id = (get_current_profile()).org_id);

DROP POLICY IF EXISTS "Profiles Org Read" ON profiles;
CREATE POLICY "Profiles Org Read" ON profiles
FOR SELECT USING (org_id = (get_current_profile()).org_id);

DROP POLICY IF EXISTS "Profiles Update Scope" ON profiles;
CREATE POLICY "Profiles Update Scope" ON profiles
FOR UPDATE USING (
    org_id = (get_current_profile()).org_id
    AND (
        (get_current_profile()).role = 'Team Lead'
        OR id = (SELECT auth.uid())
    )
);

DROP POLICY IF EXISTS "Contacts MultiTenant Access" ON contacts;
CREATE POLICY "Contacts MultiTenant Access" ON contacts
FOR ALL USING (
    org_id = (get_current_profile()).org_id
    AND (
        (get_current_profile()).role = 'Team Lead'
        OR (get_current_profile()).can_manage_leads = TRUE
    )
);

DROP POLICY IF EXISTS "Activities Access" ON activities;
CREATE POLICY "Activities Access" ON activities
FOR ALL USING (
    org_id = (get_current_profile()).org_id
    AND (
        (get_current_profile()).role = 'Team Lead'
        OR (get_current_profile()).can_manage_outreach = TRUE
    )
);

DROP POLICY IF EXISTS "Meetings Access" ON meetings;
CREATE POLICY "Meetings Access" ON meetings
FOR ALL USING (
    org_id = (get_current_profile()).org_id
    AND (
        (get_current_profile()).role = 'Team Lead'
        OR (get_current_profile()).can_manage_meetings = TRUE
    )
);

DROP POLICY IF EXISTS "Tasks Access" ON tasks;
CREATE POLICY "Tasks Access" ON tasks
FOR ALL USING (
    org_id = (get_current_profile()).org_id
    AND (
        (get_current_profile()).role = 'Team Lead'
        OR (get_current_profile()).can_manage_tasks = TRUE
        OR assigned_to = (SELECT auth.uid())
    )
);

DROP POLICY IF EXISTS "Imports Access" ON import_batches;
CREATE POLICY "Imports Access" ON import_batches
FOR ALL USING (
    org_id = (get_current_profile()).org_id
    AND (
        (get_current_profile()).role = 'Team Lead'
        OR (get_current_profile()).can_import_data = TRUE
    )
);

-- 12. REALTIME REPLICATION
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE meetings;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE contacts;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE activities;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE organizations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 13. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    TRUE,
    3145728,
    ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'import-files',
    'import-files',
    FALSE,
    26214400,
    ARRAY['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/vcard', 'text/x-vcard']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Avatar Read" ON storage.objects;
CREATE POLICY "Public Avatar Read" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users Can Upload Own Avatar" ON storage.objects;
CREATE POLICY "Users Can Upload Own Avatar" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
);

-- 14. SEED INITIAL ORGANIZATION (TeraOnic)
INSERT INTO organizations (name, slug, custom_niches, custom_cities, global_tags)
VALUES (
    'TeraOnic',
    'teraonic',
    ARRAY['Real Estate', 'Solar Energy', 'Roofing', 'Med Spa', 'Legal', 'HVAC', 'Dentistry', 'Insurance'],
    ARRAY['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'Dallas', 'Atlanta', 'Phoenix'],
    ARRAY['VIP', 'Urgent', 'High-Ticket', 'Warm Lead', 'Follow-Up', 'Qualified', 'Decision Maker']
)
ON CONFLICT (slug) DO NOTHING;

