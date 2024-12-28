import { create } from 'zustand';
import { VideoInfo, DownloadStatus } from '@/types';

interface VideoStore {
  url: string;
  videoInfo: VideoInfo | null;
  status: DownloadStatus;
  setUrl: (url: string) => void;
  setVideoInfo: (info: VideoInfo | null) => void;
  setStatus: (status: DownloadStatus) => void;
  reset: () => void;
}

export const useVideoStore = create<VideoStore>((set) => ({
  url: '',
  videoInfo: null,
  status: 'idle',
  setUrl: (url) => set({ url }),
  setVideoInfo: (info) => set({ videoInfo: info }),
  setStatus: (status) => set({ status }),
  reset: () => set({ url: '', videoInfo: null, status: 'idle' }),
}));