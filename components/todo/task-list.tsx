'use client';

import { AnimatePresence } from 'motion/react';
import { useTodoStore } from '@/lib/todo-store';
import { TaskItem } from './task-item';
import { CheckCircle2 } from 'lucide-react';
import type { Task } from '@/lib/types';

interface TaskListProps {
  onEditTask: (task: Task) => void;
}

export function TaskList({ onEditTask }: TaskListProps) {
  const { getFilteredTasks, filter } = useTodoStore();
  const tasks = getFilteredTasks();

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 p-4 rounded-full bg-muted/30">
          <CheckCircle2 className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {filter === 'today' && 'No tasks for today'}
          {filter === 'upcoming' && 'No upcoming tasks'}
          {filter === 'all' && 'No tasks'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {filter === 'today' && 'All caught up! Enjoy your day.'}
          {filter === 'upcoming' && 'No upcoming tasks scheduled. Add one to get started!'}
          {filter === 'all' && 'Create your first task to get started with LifeSync.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onEdit={onEditTask} />
        ))}
      </AnimatePresence>
    </div>
  );
}

