import axios from 'axios';
import type { VideoInfo } from '@/types';

export async function getInstagramInfo(url: string): Promise<VideoInfo> {
  try {
    const response = await axios.get(`/api/instagram/info?url=${encodeURIComponent(url)}`);
    return {
      platform: 'instagram',
      url,
      ...response.data,
    };
  } catch (error) {
    throw new Error('Failed to fetch Instagram video info');
  }
}