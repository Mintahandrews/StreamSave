import React from 'react';
import { Download, Link } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useVideoStore } from '@/store/useVideoStore';
import { isValidUrl } from '@/lib/utils';
import { fetchVideoInfo } from '@/lib/api/video';
import { LoadingSpinner } from './LoadingSpinner';

export function VideoUrlInput() {
  const { url, status, setUrl, setVideoInfo, setStatus } = useVideoStore();
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    if (!isValidUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }
    
    setError('');
    setStatus('loading');
    
    try {
      const info = await fetchVideoInfo(url);
      setVideoInfo(info);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch video info');
      setStatus('error');
      setVideoInfo(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Link className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError('');
          }}
          placeholder="Paste video URL here..."
          className="pl-10"
          error={!!error}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <Button
        type="submit"
        disabled={!url || status === 'loading'}
        className="w-full"
        size="lg"
      >
        {status === 'loading' ? (
          <div className="flex items-center space-x-2">
            <LoadingSpinner size="sm" />
            <span>Processing...</span>
          </div>
        ) : (
          <>
            <Download className="mr-2 h-5 w-5" />
            Download Video
          </>
        )}
      </Button>
    </form>
  );
}