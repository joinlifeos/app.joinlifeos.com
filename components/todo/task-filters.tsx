'use client';

import { motion } from 'motion/react';
import { useTodoStore } from '@/lib/todo-store';
import type { TaskFilter } from '@/lib/types';

export function TaskFilters() {
  const { filter, setFilter, getTaskCount } = useTodoStore();

  const filters: { key: TaskFilter; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'all', label: 'All' },
  ];

  return (
    <div className="flex gap-1 border-b border-border">
      {filters.map(({ key, label }) => {
        const count = getTaskCount(key);
        const isActive = filter === key;

        return (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`
              relative px-4 py-3 text-sm font-medium transition-colors duration-200
              ${isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {label}
            {count > 0 && (
              <span
                className={`
                  ml-2 px-2 py-0.5 rounded-full text-xs font-semibold
                  ${isActive
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="activeFilter"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

