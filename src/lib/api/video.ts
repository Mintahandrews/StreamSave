import type { VideoInfo, Platform } from '@/types';
import { VideoService } from './video-service';

const SUPPORTED_PLATFORMS: Record<string, Platform> = {
  'youtube.com': 'youtube',
  'youtu.be': 'youtube',
  'instagram.com': 'instagram',
  'tiktok.com': 'tiktok',
  'twitter.com': 'twitter',
};

export function detectPlatform(url: string): Platform | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    
    for (const [domain, platform] of Object.entries(SUPPORTED_PLATFORMS)) {
      if (hostname.includes(domain)) {
        return platform;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

export async function fetchVideoInfo(url: string): Promise<VideoInfo> {
  const platform = detectPlatform(url);
  if (!platform) {
    throw new Error('Unsupported platform. Please provide a valid URL from YouTube, Instagram, TikTok, or Twitter.');
  }

  try {
    const videoInfo = await VideoService.getVideoInfo(url, platform);
    return {
      ...videoInfo,
      platform,
      url,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch video info: ${error.message}`);
    }
    throw new Error('Failed to fetch video info. Please try again.');
  }
}