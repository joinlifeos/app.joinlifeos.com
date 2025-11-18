'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Trash2, Edit2, Flag } from 'lucide-react';
import type { Task } from '@/lib/types';
import { useTodoStore } from '@/lib/todo-store';
import { formatDueDate, getDueDateColor, getDueDateBgColor, getPriorityColor, getPriorityBgColor, getPriorityLabel } from '@/lib/todo-utils';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleTask, deleteTask } = useTodoStore();

  const handleToggle = () => {
    toggleTask(task.id);
    if (!task.completed) {
      // Celebrate completion with confetti
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#a855f7', '#9333ea', '#ec4899'],
      });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(task);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative flex items-center gap-3 p-4 rounded-lg border transition-all duration-200
        ${task.completed
          ? 'bg-muted/30 border-border/50 opacity-60'
          : 'bg-card/50 border-border hover:border-primary/30 hover:bg-card/70'
        }
      `}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={`
          flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
          ${task.completed
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-border hover:border-primary bg-card'
          }
        `}
      >
        <AnimatePresence>
          {task.completed && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Check className="h-3 w-3" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3
            className={`
              text-foreground font-medium transition-all
              ${task.completed ? 'line-through text-muted-foreground' : ''}
            `}
          >
            {task.title}
          </h3>
          
          {/* Priority Indicator */}
          {task.priority !== 'p4' && (
            <div
              className={`
                flex items-center gap-1 px-2 py-0.5 rounded text-xs border
                ${getPriorityBgColor(task.priority)}
              `}
              title={getPriorityLabel(task.priority)}
            >
              <Flag className={`h-3 w-3 ${getPriorityColor(task.priority)}`} />
            </div>
          )}
          
          {/* Due Date Badge */}
          {task.dueDate && (
            <span
              className={`
                px-2 py-0.5 rounded text-xs border
                ${getDueDateBgColor(task.dueDate)}
                ${getDueDateColor(task.dueDate)}
              `}
            >
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>
        
        {/* Description */}
        {task.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <AnimatePresence>
        {isHovered && !task.completed && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={handleEdit}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

