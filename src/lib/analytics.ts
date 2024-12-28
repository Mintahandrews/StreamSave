import { supabase } from './supabase';
import { Platform, VideoFormat } from '@/types';

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  user_id?: string;
  session_id: string;
  timestamp: string;
}

let sessionId = crypto.randomUUID();

export async function trackEvent(
  eventName: string,
  properties: Record<string, any> = {}
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const event: AnalyticsEvent = {
      event: eventName,
      properties,
      user_id: user?.id,
      session_id: sessionId,
      timestamp: new Date().toISOString(),
    };

    await supabase.from('analytics_events').insert([event]);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

export async function trackDownload(
  platform: Platform,
  format: VideoFormat,
  quality: string
) {
  await trackEvent('download', {
    platform,
    format: format.format,
    quality,
    size: format.size,
  });
}

export async function trackSearch(
  query: string,
  platform: Platform | null,
  success: boolean
) {
  await trackEvent('search', {
    query,
    platform,
    success,
  });
}

export async function trackSubscription(
  plan: string,
  interval: 'month' | 'year',
  amount: number
) {
  await trackEvent('subscription', {
    plan,
    interval,
    amount,
  });
}

export async function getAnalytics() {
  const { data: downloads } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('event', 'download');

  const { data: searches } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('event', 'search');

  const { data: subscriptions } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('event', 'subscription');

  return {
    downloads: downloads || [],
    searches: searches || [],
    subscriptions: subscriptions || [],
  };
}