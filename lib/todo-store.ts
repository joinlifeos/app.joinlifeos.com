'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Task, TaskFilter, TaskPriority } from './types';
import { sortTasks, isToday, isOverdue } from './todo-utils';

interface TodoState {
  tasks: Task[];
  filter: TaskFilter;
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setFilter: (filter: TaskFilter) => void;
  
  // Computed getters
  getFilteredTasks: () => Task[];
  getTodayTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getAllTasks: () => Task[];
  getTaskCount: (filter: TaskFilter) => number;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filter: 'today',
      
      addTask: (taskData) => {
        const now = new Date().toISOString();
        const newTask: Task = {
          ...taskData,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          tasks: sortTasks([...state.tasks, newTask]),
        }));
      },
      
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: sortTasks(
            state.tasks.map((task) =>
              task.id === id
                ? { ...task, ...updates, updatedAt: new Date().toISOString() }
                : task
            )
          ),
        }));
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },
      
      toggleTask: (id) => {
        set((state) => ({
          tasks: sortTasks(
            state.tasks.map((task) =>
              task.id === id
                ? {
                    ...task,
                    completed: !task.completed,
                    updatedAt: new Date().toISOString(),
                  }
                : task
            )
          ),
        }));
      },
      
      setFilter: (filter) => {
        set({ filter });
      },
      
      getFilteredTasks: () => {
        const { tasks, filter } = get();
        switch (filter) {
          case 'today':
            return get().getTodayTasks();
          case 'upcoming':
            return get().getUpcomingTasks();
          case 'all':
            return get().getAllTasks();
          default:
            return tasks;
        }
      },
      
      getTodayTasks: () => {
        const { tasks } = get();
        return sortTasks(
          tasks.filter(
            (task) =>
              !task.completed &&
              task.dueDate &&
              (isToday(task.dueDate) || isOverdue(task.dueDate))
          )
        );
      },
      
      getUpcomingTasks: () => {
        const { tasks } = get();
        return sortTasks(
          tasks.filter(
            (task) =>
              !task.completed &&
              task.dueDate &&
              !isToday(task.dueDate) &&
              !isOverdue(task.dueDate)
          )
        );
      },
      
      getAllTasks: () => {
        const { tasks } = get();
        return sortTasks(tasks.filter((task) => !task.completed));
      },
      
      getTaskCount: (filter) => {
        switch (filter) {
          case 'today':
            return get().getTodayTasks().length;
          case 'upcoming':
            return get().getUpcomingTasks().length;
          case 'all':
            return get().getAllTasks().length;
          default:
            return 0;
        }
      },
    }),
    {
      name: 'lifecapture-todos',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
      partialize: (state) => ({
        tasks: state.tasks,
        filter: state.filter,
      }),
    }
  )
);

