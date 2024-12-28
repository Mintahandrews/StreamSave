import React from 'react';
import { Youtube, Instagram, Twitter } from 'lucide-react';
import type { Platform } from '@/types';

const platformIcons: Record<Platform, React.ComponentType<{ className?: string }>> = {
  youtube: Youtube,
  instagram: Instagram,
  twitter: Twitter,
  tiktok: (props) => (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
        fill="currentColor"
      />
    </svg>
  ),
};

interface PlatformIndicatorProps {
  platform: Platform;
}

export function PlatformIndicator({ platform }: PlatformIndicatorProps) {
  const Icon = platformIcons[platform];
  
  return (
    <div className="flex items-center justify-center px-4 py-2 rounded-lg bg-white shadow-sm space-x-2">
      <Icon className="h-5 w-5 text-gray-600" />
      <span className="text-sm font-medium text-gray-600 capitalize">
        {platform}
      </span>
    </div>
  );
}