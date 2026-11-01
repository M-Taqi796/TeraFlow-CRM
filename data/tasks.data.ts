import type { Task } from '../types/task.types';

export const SEED_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Prepare demo slide deck for Apex Solutions meeting',
    assignedBy: 'Ali Raza',
    dueAt: 'Today, 02:00 PM',
    status: 'TODO',
  },
  {
    id: 't2',
    title: 'Send customized pricing sheet to Sarah Jenkins',
    assignedBy: 'Muhammad Taqi',
    dueAt: 'Today, 05:00 PM',
    status: 'TODO',
  },
  {
    id: 't3',
    title: 'Verify domain and SPF/DKIM records for shared Gmail',
    assignedBy: 'System Admin',
    dueAt: 'Tomorrow, 12:00 PM',
    status: 'TODO',
  },
  {
    id: 't4',
    title: 'Review scrapers batch #14 duplicate resolutions',
    assignedBy: 'Muhammad Taqi',
    dueAt: 'Oct 23, 2026',
    status: 'TODO',
  },
];
