export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'twitter';

export interface VideoInfo {
  platform: Platform;
  url: string;
  title?: string;
  thumbnail?: string;
  duration?: string;
  formats?: VideoFormat[];
}

export interface VideoFormat {
  quality: string;
  format: string;
  size?: string;
}

export type DownloadStatus = 'idle' | 'loading' | 'success' | 'error';