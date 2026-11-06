export type UserRole = 'Team Lead' | 'Team Member';

export interface UserPermissions {
  manageLeads: boolean;     // View, create, and manage leads & contacts
  manageOutreach: boolean;  // Log phone calls & send email outreach
  manageTasks: boolean;     // Create, complete, and view tasks
  manageMeetings: boolean;  // Schedule, update, and manage meetings
  importData: boolean;      // Upload and import CSV leads
  exportData: boolean;      // Export CRM records & generate reports
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  title?: string;
  password?: string;
  permissions: UserPermissions;
  status: 'active' | 'invited' | 'inactive';
  joinedDate: string;
}

export const DEFAULT_LEAD_PERMISSIONS: UserPermissions = {
  manageLeads: true,
  manageOutreach: true,
  manageTasks: true,
  manageMeetings: true,
  importData: true,
  exportData: true,
};

// All permissions deselected by default for new members - Team Lead decides
export const DEFAULT_MEMBER_PERMISSIONS: UserPermissions = {
  manageLeads: false,
  manageOutreach: false,
  manageTasks: false,
  manageMeetings: false,
  importData: false,
  exportData: false,
};

export const INITIAL_CURRENT_USER: UserProfile = {
  id: 'u-taqi',
  name: 'Muhammad Taqi',
  email: 'itstaqi2919@gmail.com',
  role: 'Team Lead',
  permissions: DEFAULT_LEAD_PERMISSIONS,
  status: 'active',
  joinedDate: 'Jan 2024',
};

export const SEED_TEAM_MEMBERS: UserProfile[] = [
  INITIAL_CURRENT_USER,
  {
    id: 'u-mustafa',
    name: 'Mustafa Khan',
    email: 'mustafa@teraflow.io',
    role: 'Team Member',
    permissions: {
      ...DEFAULT_MEMBER_PERMISSIONS,
      manageLeads: true,
      manageOutreach: true,
      manageTasks: true,
    },
    status: 'active',
    joinedDate: 'Mar 2024',
  },
  {
    id: 'u-zainab',
    name: 'Zainab Ahmed',
    email: 'zainab@teraflow.io',
    role: 'Team Member',
    permissions: {
      ...DEFAULT_MEMBER_PERMISSIONS,
      manageMeetings: true,
      exportData: true,
    },
    status: 'active',
    joinedDate: 'Feb 2024',
  },
  {
    id: 'u-kamran',
    name: 'Kamran Ali',
    email: 'kamran@teraflow.io',
    role: 'Team Member',
    permissions: {
      ...DEFAULT_MEMBER_PERMISSIONS,
      manageTasks: true,
      manageMeetings: true,
    },
    status: 'active',
    joinedDate: 'Apr 2024',
  },
  {
    id: 'u-hamza',
    name: 'Hamza Farooq',
    email: 'hamza@teraflow.io',
    role: 'Team Member',
    permissions: {
      ...DEFAULT_MEMBER_PERMISSIONS,
      importData: true,
    },
    status: 'active',
    joinedDate: 'May 2024',
  },
  {
    id: 'u-sara',
    name: 'Sara Malik',
    email: 'sara@teraflow.io',
    role: 'Team Member',
    permissions: {
      ...DEFAULT_MEMBER_PERMISSIONS,
      manageOutreach: true,
      manageMeetings: true,
    },
    status: 'active',
    joinedDate: 'Jun 2024',
  },
];
