export type ScreenshotType = 'event' | 'song' | 'video' | 'restaurant' | 'link' | 'social_post' | 'note';

export interface EventData {
  title: string;
  host: string;
  date: string;
  time: string;
  endDate?: string;
  endTime?: string;
  location?: string;
  description?: string;
}

export interface SongData {
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  spotifyId?: string;
  youtubeId?: string;
  appleMusicId?: string;
}

export interface VideoData {
  title: string;
  channel: string;
  url?: string;
  description?: string;
  thumbnail?: string;
  videoId?: string;
}

export interface RestaurantData {
  name: string;
  address: string;
  cuisine?: string;
  rating?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  phone?: string;
  website?: string;
}

export interface LinkData {
  title: string;
  url: string;
  description?: string;
  favicon?: string;
}

export interface SocialPostData {
  platform: string;
  author: string;
  content: string;
  url?: string;
  timestamp?: string;
  imageUrl?: string;
}

export interface NoteData {
  title: string;
  content: string;
  tags?: string[];
  source?: string;
}

export type ExtractedData = EventData | SongData | VideoData | RestaurantData | LinkData | SocialPostData | NoteData;

export interface ExtractedResult {
  type: ScreenshotType;
  data: ExtractedData;
  confidence?: number;
}

export interface AppSettings {
  provider: 'openai' | 'openrouter';
  openaiKey: string;
  openrouterKey: string;
  model: string;
}

export interface OCRResult {
  text: string;
  confidence?: number;
}

export type TaskPriority = 'p1' | 'p2' | 'p3' | 'p4';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export type TaskFilter = 'today' | 'upcoming' | 'all';

