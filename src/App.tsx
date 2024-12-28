import React from 'react';
import { VideoUrlInput } from './components/VideoUrlInput';
import { VideoPreview } from './components/VideoPreview';
import { SupportedPlatforms } from './components/SupportedPlatforms';
import { Settings } from './components/Settings';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Download } from 'lucide-react';
import { useVideoStore } from '@/store/useVideoStore';

export default function App() {
  const { videoInfo, status } = useVideoStore();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 dark:text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-end mb-4">
            <Settings />
          </div>

          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4">
              <div className="inline-block rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                <Download className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                StreamSave
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                Download videos from your favorite social media platforms in seconds.
                Just paste the URL and we'll handle the rest.
              </p>
            </div>

            <VideoUrlInput />
            
            {status === 'success' && videoInfo && (
              <VideoPreview video={videoInfo} />
            )}

            <SupportedPlatforms />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}