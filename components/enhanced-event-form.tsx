'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { generateICS, downloadICS } from '@/lib/api';
import { Calendar, RotateCcw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { EventData } from '@/lib/types';

export function EnhancedEventForm() {
  const { eventData, setEventData, resetEventData, setCurrentImage } =
    useAppStore();
  const [formData, setFormData] = useState<Partial<EventData>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (eventData) {
      setFormData(eventData);
    }
  }, [eventData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time) {
      return;
    }

    const ics = generateICS(formData as EventData);
    downloadICS(ics, formData.title || 'event');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleReset = () => {
    resetEventData();
    setCurrentImage(null);
    setFormData({});
    setSubmitted(false);
  };

  if (!eventData) return null;

  return (
    <div className="mt-10 pt-10 border-t border-slate-200">
      <h2 className="text-2xl font-semibold text-slate-900 mb-8">
        Event Details
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-slate-700">
            Event Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="host" className="text-sm font-medium text-slate-700">
            Host
          </Label>
          <Input
            id="host"
            value={formData.host || ''}
            onChange={(e) =>
              setFormData({ ...formData, host: e.target.value })
            }
            className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-slate-700">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date || ''}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
              className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className="text-sm font-medium text-slate-700">
              Start Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="time"
              type="time"
              value={formData.time || ''}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              required
              className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium text-slate-700">
              End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate || formData.date || ''}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime" className="text-sm font-medium text-slate-700">
              End Time
            </Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime || ''}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium text-slate-700">
            Location
          </Label>
          <Input
            id="location"
            value={formData.location || ''}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-slate-700">
            Description
          </Label>
          <Textarea
            id="description"
            rows={4}
            value={formData.description || ''}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            size="lg"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
            disabled={submitted}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.span
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
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
                  Add to Calendar
                </motion.span>
              )}
            </AnimatePresence>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleReset}
            className="border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Start Over
          </Button>
        </div>
      </form>
    </div>
  );
}
