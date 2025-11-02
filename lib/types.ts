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

