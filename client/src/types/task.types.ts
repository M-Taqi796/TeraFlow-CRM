export interface Task {
  id: string;
  title: string;
  assignedBy: string;
  dueAt: string;
  status: 'TODO' | 'COMPLETED';
  completionComment?: string;
  completedAt?: string;
}
