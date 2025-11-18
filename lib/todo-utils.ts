import type { Task, TaskPriority } from './types';

export function isToday(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Parse date string (YYYY-MM-DD format)
  const taskDate = new Date(date + 'T00:00:00');
  taskDate.setHours(0, 0, 0, 0);
  
  return taskDate.getTime() === today.getTime();
}

export function isOverdue(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Parse date string (YYYY-MM-DD format)
  const taskDate = new Date(date + 'T00:00:00');
  taskDate.setHours(0, 0, 0, 0);
  
  return taskDate < today;
}

export function formatDueDate(date: string): string {
  // Parse date string (YYYY-MM-DD format)
  const taskDate = new Date(date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (isToday(date)) {
    return 'Today';
  }
  
  // Check if it's tomorrow
  const taskDateNormalized = new Date(date + 'T00:00:00');
  taskDateNormalized.setHours(0, 0, 0, 0);
  if (taskDateNormalized.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }
  
  if (isOverdue(date)) {
    const daysDiff = Math.floor((today.getTime() - taskDateNormalized.getTime()) / (1000 * 60 * 60 * 24));
    return `${daysDiff} day${daysDiff > 1 ? 's' : ''} overdue`;
  }
  
  // Format as "Mon, Jan 15" or "Jan 15, 2025" if different year
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };
  
  if (taskDate.getFullYear() !== today.getFullYear()) {
    options.year = 'numeric';
  }
  
  return taskDate.toLocaleDateString('en-US', options);
}

export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case 'p1':
      return 'text-red-500'; // Highest priority - red
    case 'p2':
      return 'text-orange-500'; // High priority - orange
    case 'p3':
      return 'text-yellow-500'; // Medium priority - yellow
    case 'p4':
    default:
      return 'text-muted-foreground'; // Low/no priority - muted
  }
}

export function getPriorityBgColor(priority: TaskPriority): string {
  switch (priority) {
    case 'p1':
      return 'bg-red-500/20 border-red-500/50';
    case 'p2':
      return 'bg-orange-500/20 border-orange-500/50';
    case 'p3':
      return 'bg-yellow-500/20 border-yellow-500/50';
    case 'p4':
    default:
      return 'bg-muted/50 border-border';
  }
}

export function getPriorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case 'p1':
      return 'Priority 1';
    case 'p2':
      return 'Priority 2';
    case 'p3':
      return 'Priority 3';
    case 'p4':
    default:
      return 'Priority 4';
  }
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // First, sort by completion (incomplete first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then, sort by due date (earlier dates first, null last)
    if (a.dueDate && b.dueDate) {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      if (dateA !== dateB) {
        return dateA - dateB;
      }
    } else if (a.dueDate && !b.dueDate) {
      return -1;
    } else if (!a.dueDate && b.dueDate) {
      return 1;
    }
    
    // Finally, sort by priority (p1 first, p4 last)
    const priorityOrder = { p1: 1, p2: 2, p3: 3, p4: 4 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function getDueDateColor(date: string | null): string {
  if (!date) return 'text-muted-foreground';
  
  if (isOverdue(date)) {
    return 'text-red-500';
  }
  
  if (isToday(date)) {
    return 'text-yellow-500';
  }
  
  return 'text-muted-foreground';
}

export function getDueDateBgColor(date: string | null): string {
  if (!date) return 'bg-muted/30 border-border';
  
  if (isOverdue(date)) {
    return 'bg-red-500/20 border-red-500/50';
  }
  
  if (isToday(date)) {
    return 'bg-yellow-500/20 border-yellow-500/50';
  }
  
  return 'bg-muted/30 border-border';
}

