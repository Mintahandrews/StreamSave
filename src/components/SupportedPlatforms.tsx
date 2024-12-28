import React from 'react';
import { PlatformIndicator } from './PlatformIndicator';
import type { Platform } from '@/types';

const platforms: Platform[] = ['youtube', 'instagram', 'tiktok', 'twitter'];

export function SupportedPlatforms() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-12">
      {platforms.map((platform) => (
        <PlatformIndicator key={platform} platform={platform} />
      ))}
    </div>
  );
}