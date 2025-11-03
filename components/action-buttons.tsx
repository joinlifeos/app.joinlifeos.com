'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import type { ScreenshotType, ExtractedData, EventData, SongData, VideoData, RestaurantData, LinkData, SocialPostData } from '@/lib/types';
import { generateICS, downloadICS } from '@/lib/api';
import {
  initiateGoogleAuth,
  isGoogleCalendarAuthenticated,
  createGoogleCalendarEvent,
  formatEventForGoogleCalendar,
} from '@/lib/google-calendar';
import {
  initiateSpotifyAuth,
  isSpotifyAuthenticated,
  searchSpotifyTrack,
  addTrackToPlaylist,
  getUserPlaylists,
  storeSpotifyAuth,
} from '@/lib/spotify';
import {
  initiateYouTubeAuth,
  isYouTubeAuthenticated,
  searchYouTubeVideo,
  addVideoToPlaylist,
  getUserPlaylists as getYouTubePlaylists,
  storeYouTubeAuth,
} from '@/lib/youtube';
import {
  openInAppleMusic,
} from '@/lib/apple-music';
import {
  openInGoogleMaps,
  savePlaceToGoogleMaps,
  isGoogleMapsAuthenticated,
} from '@/lib/google-maps';
import {
  openInAppleMaps,
} from '@/lib/apple-maps';
import {
  initiateRaindropAuth,
  isRaindropAuthenticated,
  createRaindropBookmark,
  storeRaindropAuth,
} from '@/lib/raindrop';
import {
  exportSingleBookmark,
} from '@/lib/bookmarks';
import { Calendar, Music, Video, MapPin, Link as LinkIcon, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface ActionButtonsProps {
  type: ScreenshotType;
  data: ExtractedData;
}

export function ActionButtons({ type, data }: ActionButtonsProps) {
  const { setSpotifyAuth, setYouTubeAuth, setRaindropAuth } = useAppStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check for OAuth callbacks
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle Spotify callback
    const spotifyAuth = urlParams.get('spotify_auth');
    if (spotifyAuth) {
      try {
        const authData = JSON.parse(decodeURIComponent(spotifyAuth));
        storeSpotifyAuth(authData);
        setSpotifyAuth(authData);
        window.history.replaceState({}, '', window.location.pathname);
      } catch (err) {
        console.error('Failed to parse Spotify auth data:', err);
      }
    }

    // Handle YouTube callback
    const youtubeAuth = urlParams.get('youtube_auth');
    if (youtubeAuth) {
      try {
        const authData = JSON.parse(decodeURIComponent(youtubeAuth));
        storeYouTubeAuth(authData);
        setYouTubeAuth(authData);
        window.history.replaceState({}, '', window.location.pathname);
      } catch (err) {
        console.error('Failed to parse YouTube auth data:', err);
      }
    }

    // Handle Raindrop callback
    const raindropAuth = urlParams.get('raindrop_auth');
    if (raindropAuth) {
      try {
        const authData = JSON.parse(decodeURIComponent(raindropAuth));
        storeRaindropAuth(authData);
        setRaindropAuth(authData);
        window.history.replaceState({}, '', window.location.pathname);
      } catch (err) {
        console.error('Failed to parse Raindrop auth data:', err);
      }
    }
  }, [setSpotifyAuth, setYouTubeAuth, setRaindropAuth]);

  // Event actions
  if (type === 'event') {
    const eventData = data as EventData;
    const isGoogleConnected = isGoogleCalendarAuthenticated();

    const handleDownloadICS = () => {
      if (!eventData.title || !eventData.date || !eventData.time) {
        alert('Please fill in at least the event title, date, and time.');
        return;
      }

      const ics = generateICS(eventData);
      downloadICS(ics, eventData.title || 'event');
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'],
      });
    };

    const handleAddToGoogleCalendar = async () => {
      if (!eventData.title || !eventData.date || !eventData.time) {
        alert('Please fill in at least the event title, date, and time.');
        return;
      }

      if (!isGoogleConnected) {
        initiateGoogleAuth();
        return;
      }

      setLoading('google');
      try {
        const googleEvent = formatEventForGoogleCalendar(eventData);
        const result = await createGoogleCalendarEvent(googleEvent);
        
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

        setSuccess(`google:${result.htmlLink}`);
        setTimeout(() => setSuccess(null), 5000);
      } catch (error) {
        alert(`Failed to add event to Google Calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(null);
      }
    };

    return (
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            onClick={handleDownloadICS}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Download ICS
          </Button>
        </motion.div>
        {isGoogleConnected ? (
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              onClick={handleAddToGoogleCalendar}
              disabled={loading === 'google'}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <AnimatePresence mode="wait">
                {loading === 'google' ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Adding...
                  </motion.span>
                ) : success?.startsWith('google:') ? (
                  <motion.a
                    key="success"
                    href={success.split(':')[1]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    View in Calendar <ExternalLink className="h-3 w-3" />
                  </motion.a>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Add to Google
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        ) : (
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              onClick={initiateGoogleAuth}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Connect Google Calendar
            </Button>
          </motion.div>
        )}
      </div>
    );
  }

  // Song actions
  if (type === 'song') {
    const songData = data as SongData;
    const isSpotifyConnected = isSpotifyAuthenticated();

    const handleAddToSpotify = async () => {
      if (!isSpotifyConnected) {
        initiateSpotifyAuth();
        return;
      }

      if (!songData.title || !songData.artist) {
        alert('Please enter both song title and artist.');
        return;
      }

      setLoading('spotify');
      try {
        const query = `${songData.title} ${songData.artist}`.trim();
        const tracks = await searchSpotifyTrack(query, 1);
        
        if (tracks.length === 0) {
          alert(`Song "${songData.title}" by "${songData.artist}" not found on Spotify. Please check the title and artist.`);
          setLoading(null);
          return;
        }

        const track = tracks[0];
        
        // Look for existing "SmartCapture" playlist or create it
        const playlists = await getUserPlaylists();
        let playlistId: string;
        
        // Search for existing "SmartCapture" playlist
        const smartCapturePlaylist = playlists.find(
          (playlist) => playlist.name.toLowerCase() === 'smartcapture'
        );
        
        if (smartCapturePlaylist) {
          playlistId = smartCapturePlaylist.id;
        } else {
          // Create a new "SmartCapture" playlist
          const { createSpotifyPlaylist } = await import('@/lib/spotify');
          const newPlaylist = await createSpotifyPlaylist(
            'SmartCapture',
            'Songs saved from SmartCapture'
          );
          playlistId = newPlaylist.id;
        }

        await addTrackToPlaylist(track.uri, playlistId);
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1db954', '#10b981', '#8b5cf6', '#f59e0b'],
        });

        setSuccess('spotify');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        console.error('Spotify error:', error);
        alert(`Failed to add to Spotify: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(null);
      }
    };

    const handleOpenAppleMusic = () => {
      if (!songData.title || !songData.artist) {
        alert('Please enter both song title and artist.');
        return;
      }
      openInAppleMusic(songData.title, songData.artist);
    };

    return (
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        {isSpotifyConnected ? (
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              onClick={handleAddToSpotify}
              disabled={loading === 'spotify'}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <AnimatePresence mode="wait">
                {loading === 'spotify' ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Adding...
                  </motion.span>
                ) : success === 'spotify' ? (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Added to Spotify!
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Music className="mr-2 h-5 w-5" />
                    Add to Spotify
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        ) : (
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              onClick={initiateSpotifyAuth}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Music className="mr-2 h-5 w-5" />
              Connect Spotify
            </Button>
          </motion.div>
        )}
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            onClick={handleOpenAppleMusic}
            size="lg"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Music className="mr-2 h-5 w-5" />
            Open in Apple Music
          </Button>
        </motion.div>
      </div>
    );
  }

  // Video actions
  if (type === 'video') {
    const videoData = data as VideoData;
    const isYouTubeConnected = isYouTubeAuthenticated();

    const handleAddToYouTube = async () => {
      if (!isYouTubeConnected) {
        initiateYouTubeAuth();
        return;
      }

      setLoading('youtube');
      try {
        if (!videoData.videoId && !videoData.url) {
          // Search for the video
          const query = `${videoData.title || ''} ${videoData.channel || ''}`.trim();
          const videos = await searchYouTubeVideo(query, 5);
          
          if (videos.length === 0) {
            alert('Video not found on YouTube. Please check the title and channel.');
            setLoading(null);
            return;
          }

          // Prefer a result whose channel matches (case-insensitive), else use the first
          const video = (videoData.channel
            ? videos.find(v => v.channelTitle?.toLowerCase() === videoData.channel!.toLowerCase()) || videos[0]
            : videos[0]);
          // Look for existing "SmartCapture" playlist or create it
          const playlists = await getYouTubePlaylists();
          let playlistId: string;
          
          const smartCapture = playlists.find((p) => p.title.toLowerCase() === 'smartcapture');
          if (smartCapture) {
            playlistId = smartCapture.id;
          } else {
            // Create a new playlist
            const { createYouTubePlaylist } = await import('@/lib/youtube');
            const newPlaylist = await createYouTubePlaylist('SmartCapture', 'Videos saved from SmartCapture');
            playlistId = newPlaylist.id;
          }

          await addVideoToPlaylist(video.id, playlistId);
        } else {
          const videoId = videoData.videoId || videoData.url?.match(/[?&]v=([^&]+)/)?.[1];
          if (!videoId) {
            alert('Could not extract video ID from URL.');
            setLoading(null);
            return;
          }

          const playlists = await getYouTubePlaylists();
          let playlistId: string;
          
          const smartCapture = playlists.find((p) => p.title.toLowerCase() === 'smartcapture');
          if (smartCapture) {
            playlistId = smartCapture.id;
          } else {
            const { createYouTubePlaylist } = await import('@/lib/youtube');
            const newPlaylist = await createYouTubePlaylist('SmartCapture', 'Videos saved from SmartCapture');
            playlistId = newPlaylist.id;
          }

          await addVideoToPlaylist(videoId, playlistId);
        }
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff0000', '#10b981', '#8b5cf6', '#f59e0b'],
        });

        setSuccess('youtube');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        alert(`Failed to add to YouTube: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(null);
      }
    };

    return (
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        {isYouTubeConnected ? (
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              onClick={handleAddToYouTube}
              disabled={loading === 'youtube'}
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <AnimatePresence mode="wait">
                {loading === 'youtube' ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Adding...
                  </motion.span>
                ) : success === 'youtube' ? (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Added to YouTube!
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Video className="mr-2 h-5 w-5" />
                    Add to YouTube
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        ) : (
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              onClick={initiateYouTubeAuth}
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Video className="mr-2 h-5 w-5" />
              Connect YouTube
            </Button>
          </motion.div>
        )}
      </div>
    );
  }

  // Restaurant actions
  if (type === 'restaurant') {
    const restaurantData = data as RestaurantData;

    const handleSaveToGoogleMaps = async () => {
      setLoading('google-maps');
      try {
        const result = await savePlaceToGoogleMaps(
          restaurantData.name,
          restaurantData.address,
          restaurantData.coordinates
        );
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4285f4', '#10b981', '#fbbc04', '#ea4335'],
        });

        window.open(result.url, '_blank');
        setSuccess('google-maps');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        alert(`Failed to save to Google Maps: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(null);
      }
    };

    const handleOpenAppleMaps = () => {
      openInAppleMaps(
        restaurantData.name,
        restaurantData.address,
        restaurantData.coordinates
      );
      
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#ff6b6b', '#ffa500', '#ffd700'],
      });
    };

    return (
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            onClick={handleSaveToGoogleMaps}
            disabled={loading === 'google-maps'}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <AnimatePresence mode="wait">
              {loading === 'google-maps' ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </motion.span>
              ) : success === 'google-maps' ? (
                <motion.span
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Saved to Maps!
                </motion.span>
              ) : (
                <motion.span
                  key="save"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Save to Google Maps
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            onClick={handleOpenAppleMaps}
            size="lg"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <MapPin className="mr-2 h-5 w-5" />
            Open in Apple Maps
          </Button>
        </motion.div>
      </div>
    );
  }

  // Link actions
  if (type === 'link') {
    const linkData = data as LinkData;
    const isRaindropConnected = isRaindropAuthenticated();

    const handleSaveToRaindrop = async () => {
      if (!isRaindropConnected) {
        initiateRaindropAuth();
        return;
      }

      setLoading('raindrop');
      try {
        await createRaindropBookmark(
          linkData.title,
          linkData.url,
          linkData.description
        );
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4285f4', '#10b981', '#8b5cf6'],
        });

        setSuccess('raindrop');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        alert(`Failed to save to Raindrop: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(null);
      }
    };

    const handleExportBookmark = () => {
      exportSingleBookmark({
        title: linkData.title,
        url: linkData.url,
        description: linkData.description,
      });
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'],
      });
    };

    return (
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        {isRaindropConnected ? (
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              onClick={handleSaveToRaindrop}
              disabled={loading === 'raindrop'}
              size="lg"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <AnimatePresence mode="wait">
                {loading === 'raindrop' ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </motion.span>
                ) : success === 'raindrop' ? (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Saved to Raindrop!
                  </motion.span>
                ) : (
                  <motion.span
                    key="save"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <LinkIcon className="mr-2 h-5 w-5" />
                    Save to Raindrop
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        ) : (
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              onClick={initiateRaindropAuth}
              size="lg"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <LinkIcon className="mr-2 h-5 w-5" />
              Connect Raindrop
            </Button>
          </motion.div>
        )}
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            onClick={handleExportBookmark}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <LinkIcon className="mr-2 h-5 w-5" />
            Export Bookmark
          </Button>
        </motion.div>
      </div>
    );
  }

  // Social post actions
  if (type === 'social_post') {
    const socialData = data as SocialPostData;
    const isRaindropConnected = isRaindropAuthenticated();

    const handleSaveToRaindrop = async () => {
      if (!isRaindropConnected) {
        initiateRaindropAuth();
        return;
      }

      setLoading('raindrop');
      try {
        const url = socialData.url || `https://${socialData.platform.toLowerCase()}.com`;
        await createRaindropBookmark(
          `${socialData.platform} post by ${socialData.author}`,
          url,
          socialData.content
        );
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4285f4', '#10b981', '#8b5cf6'],
        });

        setSuccess('raindrop');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        alert(`Failed to save to Raindrop: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(null);
      }
    };

    const handleExportBookmark = () => {
      const url = socialData.url || `https://${socialData.platform.toLowerCase()}.com`;
      exportSingleBookmark({
        title: `${socialData.platform} post by ${socialData.author}`,
        url,
        description: socialData.content,
      });
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'],
      });
    };

    return (
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        {isRaindropConnected ? (
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              onClick={handleSaveToRaindrop}
              disabled={loading === 'raindrop'}
              size="lg"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <AnimatePresence mode="wait">
                {loading === 'raindrop' ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </motion.span>
                ) : success === 'raindrop' ? (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Saved to Raindrop!
                  </motion.span>
                ) : (
                  <motion.span
                    key="save"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <LinkIcon className="mr-2 h-5 w-5" />
                    Save to Raindrop
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        ) : (
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              onClick={initiateRaindropAuth}
              size="lg"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <LinkIcon className="mr-2 h-5 w-5" />
              Connect Raindrop
            </Button>
          </motion.div>
        )}
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="button"
            onClick={handleExportBookmark}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <LinkIcon className="mr-2 h-5 w-5" />
            Export Bookmark
          </Button>
        </motion.div>
      </div>
    );
  }

  return null;
}

