'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { generateICS, downloadICS } from '@/lib/api';
import { Calendar, RotateCcw } from 'lucide-react';
import type { EventData } from '@/lib/types';

export function EventForm() {
  const { eventData, setEventData, resetEventData, setCurrentImage } =
    useAppStore();
  const [formData, setFormData] = useState<Partial<EventData>>({});

  useEffect(() => {
    if (eventData) {
      setFormData(eventData);
    }
  }, [eventData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time) {
      alert('Please fill in required fields: Title, Date, and Start Time');
      return;
    }

    const ics = generateICS(formData as EventData);
    downloadICS(ics, formData.title || 'event');
  };

  const handleReset = () => {
    resetEventData();
    setCurrentImage(null);
    setFormData({});
  };

  if (!eventData) return null;

  return (
    <div className="mt-8 border-t pt-6">
      <h2 className="text-2xl font-semibold mb-6">Event Details</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="host">Host</Label>
          <Input
            id="host"
            value={formData.host || ''}
            onChange={(e) =>
              setFormData({ ...formData, host: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date || ''}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Start Time *</Label>
            <Input
              id="time"
              type="time"
              value={formData.time || ''}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate || formData.date || ''}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime || ''}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location || ''}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            value={formData.description || ''}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" size="lg" className="flex-1">
            <Calendar className="mr-2 h-5 w-5" />
            Add to Calendar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleReset}
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Start Over
          </Button>
        </div>
      </form>
    </div>
  );
}

