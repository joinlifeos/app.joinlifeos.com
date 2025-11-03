'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import type { ExtractedResult, EventData, SongData, VideoData, RestaurantData, LinkData, SocialPostData } from '@/lib/types';
import { generateICS, downloadICS } from '@/lib/api';
import {
  initiateGoogleAuth,
  isGoogleCalendarAuthenticated,
  createGoogleCalendarEvent,
  formatEventForGoogleCalendar,
} from '@/lib/google-calendar';
import { Calendar, RotateCcw, CheckCircle2, LogOut, Loader2, Music, Video, MapPin, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { ActionButtons } from './action-buttons';

export function EnhancedDataForm() {
  const { extractedData, setExtractedData, resetExtractedData, setCurrentImage } =
    useAppStore();
  const [formData, setFormData] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (extractedData?.data) {
      setFormData(extractedData.data);
    }
  }, [extractedData]);

  if (!extractedData) return null;

  const { type, data } = extractedData;

  const handleReset = () => {
    resetExtractedData();
    setCurrentImage(null);
    setFormData({});
    setSubmitted(false);
  };

  const handleUpdateData = (updates: any) => {
    setFormData({ ...formData, ...updates });
    setExtractedData({
      ...extractedData,
      data: { ...data, ...updates } as typeof data,
    });
  };

  // Type-specific form rendering
  const renderEventForm = () => {
    const eventData = data as EventData;
    const eventFormData = formData as Partial<EventData>;

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
          className="text-2xl font-semibold text-slate-900 mb-8 flex items-center gap-3"
        >
          <Calendar className="h-6 w-6 text-blue-600" />
          Event Details
        </motion.h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!eventFormData.title || !eventFormData.date || !eventFormData.time) {
              return;
            }

            const ics = generateICS(eventFormData as EventData);
            downloadICS(ics, eventFormData.title || 'event');
            setSubmitted(true);

            // Trigger confetti
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'],
            });

            setTimeout(() => setSubmitted(false), 3000);
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={eventFormData.title || ''}
                onChange={(e) => handleUpdateData({ title: e.target.value })}
                required
                className={cn(
                  'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                  focusedField === 'title' && 'ring-2 ring-blue-500/20'
                )}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="host">Host/Organizer</Label>
              <Input
                id="host"
                value={eventFormData.host || ''}
                onChange={(e) => handleUpdateData({ host: e.target.value })}
                className={cn(
                  'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                  focusedField === 'host' && 'ring-2 ring-blue-500/20'
                )}
                onFocus={() => setFocusedField('host')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={eventFormData.date || ''}
                onChange={(e) => handleUpdateData({ date: e.target.value })}
                required
                className={cn(
                  'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                  focusedField === 'date' && 'ring-2 ring-blue-500/20'
                )}
                onFocus={() => setFocusedField('date')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Start Time</Label>
              <Input
                id="time"
                type="time"
                value={eventFormData.time || ''}
                onChange={(e) => handleUpdateData({ time: e.target.value })}
                required
                className={cn(
                  'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                  focusedField === 'time' && 'ring-2 ring-blue-500/20'
                )}
                onFocus={() => setFocusedField('time')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={eventFormData.endDate || eventFormData.date || ''}
                onChange={(e) => handleUpdateData({ endDate: e.target.value })}
                className={cn(
                  'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                  focusedField === 'endDate' && 'ring-2 ring-blue-500/20'
                )}
                onFocus={() => setFocusedField('endDate')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time (Optional)</Label>
              <Input
                id="endTime"
                type="time"
                value={eventFormData.endTime || ''}
                onChange={(e) => handleUpdateData({ endTime: e.target.value })}
                className={cn(
                  'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                  focusedField === 'endTime' && 'ring-2 ring-blue-500/20'
                )}
                onFocus={() => setFocusedField('endTime')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={eventFormData.location || ''}
              onChange={(e) => handleUpdateData({ location: e.target.value })}
              className={cn(
                'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                focusedField === 'location' && 'ring-2 ring-blue-500/20'
              )}
              onFocus={() => setFocusedField('location')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={eventFormData.description || ''}
              onChange={(e) => handleUpdateData({ description: e.target.value })}
              rows={4}
              className={cn(
                'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 resize-none transition-all duration-200',
                focusedField === 'description' && 'ring-2 ring-blue-500/20'
              )}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <ActionButtons type={type} data={data} />
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
          </div>
        </form>
      </motion.div>
    );
  };

  const renderSongForm = () => {
    const songData = data as SongData;
    const songFormData = formData as Partial<SongData>;

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
          className="text-2xl font-semibold text-slate-900 mb-8 flex items-center gap-3"
        >
          <Music className="h-6 w-6 text-green-600" />
          Song Details
        </motion.h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Song Title</Label>
              <Input
                id="title"
                value={songFormData.title || ''}
                onChange={(e) => handleUpdateData({ title: e.target.value })}
                className={cn(
                  'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                  focusedField === 'title' && 'ring-2 ring-blue-500/20'
                )}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artist</Label>
              <Input
                id="artist"
                value={songFormData.artist || ''}
                onChange={(e) => handleUpdateData({ artist: e.target.value })}
                className={cn(
                  'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                  focusedField === 'artist' && 'ring-2 ring-blue-500/20'
                )}
                onFocus={() => setFocusedField('artist')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="album">Album (Optional)</Label>
            <Input
              id="album"
              value={songFormData.album || ''}
              onChange={(e) => handleUpdateData({ album: e.target.value })}
              className={cn(
                'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                focusedField === 'album' && 'ring-2 ring-blue-500/20'
              )}
              onFocus={() => setFocusedField('album')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <ActionButtons type={type} data={data} />
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
          </div>
        </div>
      </motion.div>
    );
  };

  const renderVideoForm = () => {
    const videoData = data as VideoData;
    const videoFormData = formData as Partial<VideoData>;

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
          className="text-2xl font-semibold text-slate-900 mb-8 flex items-center gap-3"
        >
          <Video className="h-6 w-6 text-red-600" />
          Video Details
        </motion.h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                value={videoFormData.title || ''}
                onChange={(e) => handleUpdateData({ title: e.target.value })}
                className={cn(
                  'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                  focusedField === 'title' && 'ring-2 ring-blue-500/20'
                )}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Input
                id="channel"
                value={videoFormData.channel || ''}
                onChange={(e) => handleUpdateData({ channel: e.target.value })}
                className={cn(
                  'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                  focusedField === 'channel' && 'ring-2 ring-blue-500/20'
                )}
                onFocus={() => setFocusedField('channel')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Video URL</Label>
            <Input
              id="url"
              type="url"
              value={videoFormData.url || ''}
              onChange={(e) => handleUpdateData({ url: e.target.value })}
              className={cn(
                'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                focusedField === 'url' && 'ring-2 ring-blue-500/20'
              )}
              onFocus={() => setFocusedField('url')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={videoFormData.description || ''}
              onChange={(e) => handleUpdateData({ description: e.target.value })}
              rows={4}
              className={cn(
                'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 resize-none transition-all duration-200',
                focusedField === 'description' && 'ring-2 ring-blue-500/20'
              )}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <ActionButtons type={type} data={data} />
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
          </div>
        </div>
      </motion.div>
    );
  };

  const renderRestaurantForm = () => {
    const restaurantData = data as RestaurantData;
    const restaurantFormData = formData as Partial<RestaurantData>;

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
          className="text-2xl font-semibold text-slate-900 mb-8 flex items-center gap-3"
        >
          <MapPin className="h-6 w-6 text-orange-600" />
          Restaurant Details
        </motion.h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name</Label>
              <Input
                id="name"
                value={restaurantFormData.name || ''}
                onChange={(e) => handleUpdateData({ name: e.target.value })}
                className={cn(
                  'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                  focusedField === 'name' && 'ring-2 ring-blue-500/20'
                )}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuisine">Cuisine Type</Label>
              <Input
                id="cuisine"
                value={restaurantFormData.cuisine || ''}
                onChange={(e) => handleUpdateData({ cuisine: e.target.value })}
                className={cn(
                  'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                  focusedField === 'cuisine' && 'ring-2 ring-blue-500/20'
                )}
                onFocus={() => setFocusedField('cuisine')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={restaurantFormData.address || ''}
              onChange={(e) => handleUpdateData({ address: e.target.value })}
              className={cn(
                'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                focusedField === 'address' && 'ring-2 ring-blue-500/20'
              )}
              onFocus={() => setFocusedField('address')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={restaurantFormData.phone || ''}
                onChange={(e) => handleUpdateData({ phone: e.target.value })}
                className={cn(
                  'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                  focusedField === 'phone' && 'ring-2 ring-blue-500/20'
                )}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={restaurantFormData.rating || ''}
                onChange={(e) => handleUpdateData({ rating: parseFloat(e.target.value) || undefined })}
                className={cn(
                  'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                  focusedField === 'rating' && 'ring-2 ring-blue-500/20'
                )}
                onFocus={() => setFocusedField('rating')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <ActionButtons type={type} data={data} />
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
          </div>
        </div>
      </motion.div>
    );
  };

  const renderLinkForm = () => {
    const linkData = data as LinkData;
    const linkFormData = formData as Partial<LinkData>;

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
          className="text-2xl font-semibold text-slate-900 mb-8 flex items-center gap-3"
        >
          <LinkIcon className="h-6 w-6 text-blue-600" />
          Link Details
        </motion.h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={linkFormData.title || ''}
              onChange={(e) => handleUpdateData({ title: e.target.value })}
              className={cn(
                'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                focusedField === 'title' && 'ring-2 ring-blue-500/20'
              )}
              onFocus={() => setFocusedField('title')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={linkFormData.url || ''}
              onChange={(e) => handleUpdateData({ url: e.target.value })}
              className={cn(
                'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                focusedField === 'url' && 'ring-2 ring-blue-500/20'
              )}
              onFocus={() => setFocusedField('url')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={linkFormData.description || ''}
              onChange={(e) => handleUpdateData({ description: e.target.value })}
              rows={4}
              className={cn(
                'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 resize-none transition-all duration-200',
                focusedField === 'description' && 'ring-2 ring-blue-500/20'
              )}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <ActionButtons type={type} data={data} />
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
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSocialPostForm = () => {
    const socialData = data as SocialPostData;
    const socialFormData = formData as Partial<SocialPostData>;

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
          className="text-2xl font-semibold text-slate-900 mb-8 flex items-center gap-3"
        >
          <MessageSquare className="h-6 w-6 text-purple-600" />
          Social Post Details
        </motion.h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Input
                id="platform"
                value={socialFormData.platform || ''}
                onChange={(e) => handleUpdateData({ platform: e.target.value })}
                className={cn(
                  'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                  focusedField === 'platform' && 'ring-2 ring-blue-500/20'
                )}
                onFocus={() => setFocusedField('platform')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={socialFormData.author || ''}
                onChange={(e) => handleUpdateData({ author: e.target.value })}
                className={cn(
                  'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                  focusedField === 'author' && 'ring-2 ring-blue-500/20'
                )}
                onFocus={() => setFocusedField('author')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={socialFormData.content || ''}
              onChange={(e) => handleUpdateData({ content: e.target.value })}
              rows={6}
              className={cn(
                'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 resize-none transition-all duration-200',
                focusedField === 'content' && 'ring-2 ring-blue-500/20'
              )}
              onFocus={() => setFocusedField('content')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Post URL</Label>
            <Input
              id="url"
              type="url"
              value={socialFormData.url || ''}
              onChange={(e) => handleUpdateData({ url: e.target.value })}
              className={cn(
                'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200',
                focusedField === 'url' && 'ring-2 ring-blue-500/20'
              )}
              onFocus={() => setFocusedField('url')}
              onBlur={() => setFocusedField(null)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <ActionButtons type={type} data={data} />
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
          </div>
        </div>
      </motion.div>
    );
  };

  // Route to appropriate form based on type
  switch (type) {
    case 'event':
      return renderEventForm();
    case 'song':
      return renderSongForm();
    case 'video':
      return renderVideoForm();
    case 'restaurant':
      return renderRestaurantForm();
    case 'link':
      return renderLinkForm();
    case 'social_post':
      return renderSocialPostForm();
    default:
      return null;
  }
}

