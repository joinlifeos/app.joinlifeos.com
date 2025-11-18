'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Task, TaskPriority } from '@/lib/types';
import { useTodoStore } from '@/lib/todo-store';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}

export function TaskForm({ open, onOpenChange, task }: TaskFormProps) {
  const { addTask, updateTask } = useTodoStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('p4');
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      // Extract date part (YYYY-MM-DD) from dueDate, which is stored as YYYY-MM-DD or ISO string
      setDueDate(task.dueDate ? task.dueDate.substring(0, 10) : '');
      setPriority(task.priority);
    } else {
      // Reset form for new task
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('p4');
      setErrors({});
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    // Store due date as YYYY-MM-DD format (date input already provides this)
    const dueDateISO: string | null = dueDate || null;

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDateISO,
      priority,
      completed: task?.completed || false,
    };

    if (task) {
      updateTask(task.id, taskData);
    } else {
      addTask(taskData);
    }

    onOpenChange(false);
  };

  const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'p1', label: 'Priority 1 (Highest)', color: 'text-red-500' },
    { value: 'p2', label: 'Priority 2 (High)', color: 'text-orange-500' },
    { value: 'p3', label: 'Priority 3 (Medium)', color: 'text-yellow-500' },
    { value: 'p4', label: 'Priority 4 (Low)', color: 'text-muted-foreground' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors({});
              }}
              placeholder="Enter task title"
              className="bg-input border-border focus:border-primary"
              autoFocus
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              rows={3}
              className="bg-input border-border focus:border-primary resize-none"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-foreground">
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-input border-border focus:border-primary"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-foreground">
              Priority
            </Label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full h-10 px-3 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border hover:border-primary/50 hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

