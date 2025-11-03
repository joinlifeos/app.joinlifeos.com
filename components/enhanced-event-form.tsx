'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { generateICS, downloadICS } from '@/lib/api';
import {
  initiateGoogleAuth,
  isGoogleCalendarAuthenticated,
  createGoogleCalendarEvent,
  formatEventForGoogleCalendar,
  storeAuth,
  clearAuth,
} from '@/lib/google-calendar';
import { Calendar, RotateCcw, CheckCircle2, LogOut, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import type { EventData } from '@/lib/types';
import confetti from 'canvas-confetti';

export function EnhancedEventForm() {
  const { extractedData, setExtractedData, resetExtractedData, setCurrentImage } =
    useAppStore();
  // For now, only handle events - will be replaced with generic form later
  const eventData = extractedData?.type === 'event' ? (extractedData.data as EventData) : null;
  const [formData, setFormData] = useState<Partial<EventData>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isAddingToGoogle, setIsAddingToGoogle] = useState(false);
  const [googleEventLink, setGoogleEventLink] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (eventData) {
      setFormData(eventData);
    }
    setIsGoogleConnected(isGoogleCalendarAuthenticated());
  }, [eventData]);

  // Check for Google auth callback in URL
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const googleAuth = urlParams.get('google_auth');
    const error = urlParams.get('error');

    if (error) {
      alert(`Google Calendar authentication failed: ${error}`);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (googleAuth) {
      try {
        const authData = JSON.parse(decodeURIComponent(googleAuth));
        storeAuth(authData);
        setIsGoogleConnected(true);
        window.history.replaceState({}, '', window.location.pathname);
      } catch (err) {
        console.error('Failed to parse Google auth data:', err);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time) {
      return;
    }

    const ics = generateICS(formData as EventData);
    downloadICS(ics, formData.title || 'event');
    setSubmitted(true);
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'],
    });

    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleAddToGoogleCalendar = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      return;
    }

    if (!isGoogleCalendarAuthenticated()) {
      initiateGoogleAuth();
      return;
    }

    setIsAddingToGoogle(true);
    setGoogleEventLink(null);

    try {
      const googleEvent = formatEventForGoogleCalendar(formData as EventData);
      const result = await createGoogleCalendarEvent(googleEvent);
      setGoogleEventLink(result.htmlLink);
      setSubmitted(true);
      
      // Trigger confetti celebration
      const duration = 3000;
      const end = Date.now() + duration;

      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }

        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#3b82f6', '#10b981', '#8b5cf6'],
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#3b82f6', '#10b981', '#8b5cf6'],
        });
      }, 200);

      setTimeout(() => {
        setSubmitted(false);
        setGoogleEventLink(null);
      }, 5000);
    } catch (error) {
      alert(
        `Failed to add event to Google Calendar: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsAddingToGoogle(false);
    }
  };

  const handleDisconnectGoogle = () => {
    if (
      confirm(
        'Are you sure you want to disconnect from Google Calendar? You will need to reconnect to add events directly.'
      )
    ) {
      clearAuth();
      setIsGoogleConnected(false);
    }
  };

  const handleReset = () => {
    resetExtractedData();
    setCurrentImage(null);
    setFormData({});
    setSubmitted(false);
    setGoogleEventLink(null);
  };

  if (!eventData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
      className="mt-10 pt-10 border-t border-slate-200"
    >
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-semibold text-slate-900 mb-8"
      >
        Event Details
      </motion.h2>

      {/* Google Calendar Connection Status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, type: 'spring' }}
        className="mb-6 p-4 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30 shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="h-10 w-10 rounded-lg bg-white flex items-center justify-center border border-slate-200 shadow-sm"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Calendar className="h-5 w-5 text-blue-600" />
            </motion.div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                Google Calendar Integration
              </p>
              <p className="text-xs text-slate-600">
                {isGoogleConnected
                  ? 'Connected - Events can be added directly to your calendar'
                  : 'Not connected - Connect to add events directly to Google Calendar'}
              </p>
            </div>
          </div>
          {isGoogleConnected ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectGoogle}
                className="text-slate-600 hover:text-slate-900 border-slate-300 hover:border-slate-400 transition-all"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                onClick={initiateGoogleAuth}
                className="bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-all"
              >
                Connect Google Calendar
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {[
          { id: 'title', label: 'Event Title', required: true, placeholder: 'Enter event title' },
          { id: 'host', label: 'Host', required: false, placeholder: 'Enter host name' },
        ].map((field, index) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="space-y-2"
          >
            <Label
              htmlFor={field.id}
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <motion.div
              whileFocus={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Input
                id={field.id}
                value={formData[field.id as keyof typeof formData] || ''}
                onChange={(e) =>
                  setFormData({ ...formData, [field.id]: e.target.value })
                }
                onFocus={() => setFocusedField(field.id)}
                onBlur={() => setFocusedField(null)}
                required={field.required}
                placeholder={field.placeholder}
                className={cn(
                  'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                  focusedField === field.id && 'ring-2 ring-blue-500/20'
                )}
              />
            </motion.div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {[
            { id: 'date', label: 'Date', required: true, type: 'date' },
            { id: 'time', label: 'Start Time', required: true, type: 'time' },
          ].map((field) => (
            <div key={field.id} className="space-y-2">
              <Label
                htmlFor={field.id}
                className="text-sm font-medium text-slate-700 flex items-center gap-2"
              >
                {field.label} <span className="text-red-500">*</span>
              </Label>
              <motion.div whileFocus={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400 }}>
                <Input
                  id={field.id}
                  type={field.type}
                  value={formData[field.id as keyof typeof formData] || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.id]: e.target.value })
                  }
                  onFocus={() => setFocusedField(field.id)}
                  onBlur={() => setFocusedField(null)}
                  required={field.required}
                  className={cn(
                    'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                    focusedField === field.id && 'ring-2 ring-blue-500/20'
                  )}
                />
              </motion.div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {[
            { id: 'endDate', label: 'End Date', type: 'date' },
            { id: 'endTime', label: 'End Time', type: 'time' },
          ].map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className="text-sm font-medium text-slate-700">
                {field.label}
              </Label>
              <motion.div whileFocus={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400 }}>
                <Input
                  id={field.id}
                  type={field.type}
                  value={
                    field.id === 'endDate'
                      ? formData.endDate || formData.date || ''
                      : formData.endTime || ''
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, [field.id]: e.target.value })
                  }
                  onFocus={() => setFocusedField(field.id)}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                    focusedField === field.id && 'ring-2 ring-blue-500/20'
                  )}
                />
              </motion.div>
            </div>
          ))}
        </motion.div>

        {[
          { id: 'location', label: 'Location', type: 'text' },
          { id: 'description', label: 'Description', type: 'textarea' },
        ].map((field, index) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            className="space-y-2"
          >
            <Label htmlFor={field.id} className="text-sm font-medium text-slate-700">
              {field.label}
            </Label>
            {field.type === 'textarea' ? (
              <motion.div whileFocus={{ scale: 1.005 }} transition={{ type: 'spring', stiffness: 400 }}>
                <Textarea
                  id={field.id}
                  rows={4}
                  value={formData[field.id as keyof typeof formData] || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.id]: e.target.value })
                  }
                  onFocus={() => setFocusedField(field.id)}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 resize-none transition-all duration-200',
                    focusedField === field.id && 'ring-2 ring-blue-500/20'
                  )}
                />
              </motion.div>
            ) : (
              <motion.div whileFocus={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400 }}>
                <Input
                  id={field.id}
                  value={formData[field.id as keyof typeof formData] || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.id]: e.target.value })
                  }
                  onFocus={() => setFocusedField(field.id)}
                  onBlur={() => setFocusedField(null)}
                  className={cn(
                    'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                    focusedField === field.id && 'ring-2 ring-blue-500/20'
                  )}
                />
              </motion.div>
            )}
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          <div className="flex-1 flex gap-4">
            <motion.div
              className="flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                disabled={submitted}
              >
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.span
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Downloaded!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="download"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-5 w-5" />
                      Download ICS
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {isGoogleConnected && (
              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  type="button"
                  onClick={handleAddToGoogleCalendar}
                  disabled={isAddingToGoogle || submitted}
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <AnimatePresence mode="wait">
                    {googleEventLink ? (
                      <motion.a
                        key="success"
                        href={googleEventLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        View in Calendar
                      </motion.a>
                    ) : isAddingToGoogle ? (
                      <motion.span
                        key="loading"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Adding...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Calendar className="h-5 w-5" />
                        Add to Google
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleReset}
              className="border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Start Over
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  );
}
