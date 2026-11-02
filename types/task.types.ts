export interface TeamMember {
  id: string;
  name: string;
  role: string;
  isCurrentUser?: boolean;
}

export const CURRENT_USER: TeamMember = {
  id: 'u-taqi',
  name: 'Muhammad Taqi',
  role: 'CEO',
  isCurrentUser: true,
};

export const TEAM_MEMBERS: TeamMember[] = [
  CURRENT_USER,
  { id: 'u-mustafa', name: 'Mustafa', role: 'BDE' },
  { id: 'u-kamran',  name: 'Kamran',  role: 'HR' },
  { id: 'u-zainab',  name: 'Zainab',  role: 'Sales Lead' },
  { id: 'u-hamza',   name: 'Hamza',   role: 'Developer' },
  { id: 'u-sara',    name: 'Sara',    role: 'Customer Success' },
];

export interface Task {
  id: string;
  title: string;
  assignedBy: string; // Name of person who assigned the task, e.g. "Muhammad Taqi"
  assignedTo: string; // Name of person task is assigned to, e.g. "Muhammad Taqi", "Mustafa", "Kamran"
  dueDate: string;    // YYYY-MM-DD
  dueTime: string;    // HH:mm
  dueAt: string;      // Formatted display string e.g. "Today, 05:00 PM"
  status: 'TODO' | 'COMPLETED';
  completionComment?: string;
  completedAt?: string;
}
