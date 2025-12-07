'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Mail, Loader2 } from 'lucide-react';
import { Starfield } from '@/components/ui/starfield';
import { Button } from '@/components/ui/button';
import { TaskFilters } from '@/components/todo/task-filters';
import { TaskList } from '@/components/todo/task-list';
import { TaskForm } from '@/components/todo/task-form';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { useAppStore } from '@/lib/store';
import { useTodoStore } from '@/lib/todo-store';
import {
  isGmailAuthenticated,
  initiateGmailAuth,
  storeAuth,
  pullTasksFromGmail
} from '@/lib/gmail';
import { fetchLinkedInMessages, convertLinkedInToTasks } from '@/lib/linkedin';
import type { Task } from '@/lib/types';
import confetti from 'canvas-confetti';
import { Linkedin, CreditCard } from 'lucide-react';

export default function LifeSyncPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isPullingTasks, setIsPullingTasks] = useState(false);
  const { settings } = useAppStore();
  const { addTask } = useTodoStore();

  // Handle Gmail OAuth callback
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const gmailAuth = urlParams.get('gmail_auth');
    const error = urlParams.get('error');

    if (error && error.includes('gmail')) {
      window.history.replaceState({}, '', window.location.pathname);
      alert(`Gmail authentication error: ${error}`);
      return;
    }

    if (gmailAuth) {
      try {
        const authData = JSON.parse(decodeURIComponent(gmailAuth));
        storeAuth(authData);
        window.history.replaceState({}, '', window.location.pathname);
        // Optionally show success message
      } catch (err) {
        console.error('Failed to parse Gmail auth data:', err);
      }
    }
  }, []);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handlePullFromGmail = async () => {
    // Check if authenticated
    if (!isGmailAuthenticated()) {
      // Check if API keys are configured
      const hasApiKey = !!settings.openaiKey.trim() || !!settings.openrouterKey.trim();
      if (!hasApiKey) {
        alert('Please configure your API key in settings first to use AI-powered task extraction.');
        return;
      }

      // Initiate OAuth flow
      initiateGmailAuth();
      return;
    }

    // Check if API keys are configured
    const hasApiKey = !!settings.openaiKey.trim() || !!settings.openrouterKey.trim();
    if (!hasApiKey) {
      alert('Please configure your API key in settings first to use AI-powered task extraction.');
      return;
    }

    setIsPullingTasks(true);
    try {
      const tasks = await pullTasksFromGmail(settings, undefined, 10, true);

      if (tasks.length === 0) {
        alert('No tasks found in your Gmail. Try adjusting the search query or check if you have any unread emails with task-related keywords.');
        return;
      }

      // Add tasks to the store
      let addedCount = 0;
      for (const task of tasks) {
        addTask({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          completed: false,
        });
        addedCount++;
      }

      // Celebrate!
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#a855f7', '#9333ea', '#ec4899'],
      });

      alert(`Successfully added ${addedCount} task${addedCount > 1 ? 's' : ''} from Gmail!`);
    } catch (error) {
      console.error('Failed to pull tasks from Gmail:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to pull tasks from Gmail'}`);
    } finally {
      setIsPullingTasks(false);
    }
  };

  const [isPullingLinkedIn, setIsPullingLinkedIn] = useState(false);

  const handlePullFromLinkedIn = async () => {
    setIsPullingLinkedIn(true);
    try {
      const messages = await fetchLinkedInMessages();
      const tasks = convertLinkedInToTasks(messages);

      if (tasks.length === 0) {
        alert('No new unread messages found on LinkedIn.');
        return;
      }

      let addedCount = 0;
      for (const task of tasks) {
        addTask({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          completed: false,
        });
        addedCount++;
      }

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0077b5', '#00a0dc', '#ffffff'], // LinkedIn colors
      });

      alert(`Successfully added ${addedCount} message${addedCount > 1 ? 's' : ''} from LinkedIn!`);
    } catch (error) {
      console.error('Failed to pull from LinkedIn:', error);
      alert('Failed to pull messages from LinkedIn.');
    } finally {
      setIsPullingLinkedIn(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to start subscription.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription.');
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, oklch(0.08 0.06 270), oklch(0.09 0.07 265), oklch(0.07 0.06 275))' }}>
      {/* Starfield background */}
      <Starfield starCount={250} speed={0.2} className="opacity-40" />
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-5xl relative z-10">
        {/* Header */}
        <header className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="text-5xl md:text-6xl font-bold text-foreground mb-4 tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
          >
            LifeSync
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
            className="text-lg md:text-xl text-muted-foreground font-medium"
          >
            Manage your tasks and stay organized
          </motion.p>
        </header>

        {/* Main Content Card */}
        <motion.main
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 150 }}
          className="bg-card rounded-2xl shadow-2xl border-0 p-6 md:p-10 backdrop-blur-sm relative"
        >
          <GlowingEffect
            disabled={false}
            blur={25}
            spread={140}
            proximity={200}
            variant="space"
            glow={true}
            borderWidth={3}
            movementDuration={3}
            inactiveZone={0}
            autoAnimate={true}
            animationDuration={3}
          />

          {/* Filters and Action Buttons */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <TaskFilters />
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Button
                  onClick={handlePullFromGmail}
                  disabled={isPullingTasks}
                  variant="outline"
                  className="border-border hover:border-primary/50 hover:bg-muted text-foreground shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {isPullingTasks ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Pulling...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Pull from Gmail
                    </>
                  )}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Button
                  onClick={handlePullFromLinkedIn}
                  disabled={isPullingLinkedIn}
                  variant="outline"
                  className="border-border hover:border-[#0077b5]/50 hover:bg-[#0077b5]/10 text-foreground shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {isPullingLinkedIn ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Linkedin className="h-4 w-4 mr-2 text-[#0077b5]" />
                      LinkedIn
                    </>
                  )}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Button
                  onClick={handleSubscribe}
                  variant="outline"
                  className="border-border hover:border-primary/50 hover:bg-primary/10 text-foreground shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <CreditCard className="h-4 w-4 mr-2 text-primary" />
                  Upgrade (Early Bird $1/mo)
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Button
                  onClick={handleAddTask}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Task List */}
          <TaskList onEditTask={handleEditTask} />
        </motion.main>

        {/* Task Form Modal */}
        <TaskForm
          open={isFormOpen}
          onOpenChange={handleCloseForm}
          task={editingTask}
        />
      </div>
    </div>
  );
}

