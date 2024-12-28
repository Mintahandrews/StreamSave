import axios from 'axios';
import type { VideoInfo } from '@/types';

export async function getTiktokInfo(url: string): Promise<VideoInfo> {
  try {
    const response = await axios.get(`/api/tiktok/info?url=${encodeURIComponent(url)}`);
    return {
      platform: 'tiktok',
      url,
      ...response.data,
    };
  } catch (error) {
    throw new Error('Failed to fetch TikTok video info');
  }
}