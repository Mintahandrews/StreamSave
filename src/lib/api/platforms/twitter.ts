import axios from 'axios';
import type { VideoInfo } from '@/types';

export async function getTwitterInfo(url: string): Promise<VideoInfo> {
  try {
    const response = await axios.get(`/api/twitter/info?url=${encodeURIComponent(url)}`);
    return {
      platform: 'twitter',
      url,
      ...response.data,
    };
  } catch (error) {
    throw new Error('Failed to fetch Twitter video info');
  }
}