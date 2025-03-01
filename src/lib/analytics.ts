import { supabase } from "./supabase";
import { Platform, VideoFormat } from "@/types";
import { AnalyticsError, NetworkError } from "./errors";

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
    NetworkError.checkConnection();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const event: AnalyticsEvent = {
      event: eventName,
      properties,
      user_id: user?.id,
      session_id: sessionId,
      timestamp: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from("analytics_events")
      .insert([event]);
    if (insertError) {
      throw new AnalyticsError(
        `Failed to insert analytics event: ${insertError.message}`,
        "INSERT_ERROR"
      );
    }

    // Try to send any failed events from previous sessions
    await retryFailedEvents();
  } catch (error) {
    console.error("Failed to track event:", error);
    // Store failed events in localStorage for retry
    const failedEvents = JSON.parse(
      localStorage.getItem("failedAnalyticsEvents") || "[]"
    );
    failedEvents.push({
      eventName,
      properties,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("failedAnalyticsEvents", JSON.stringify(failedEvents));
  }
}

async function retryFailedEvents() {
  if (!navigator.onLine) return;

  const failedEvents = JSON.parse(
    localStorage.getItem("failedAnalyticsEvents") || "[]"
  );

  if (failedEvents.length === 0) return;

  const successfulRetries: number[] = [];

  for (let i = 0; i < failedEvents.length; i++) {
    try {
      const event = failedEvents[i];
      await trackEvent(event.eventName, event.properties);
      successfulRetries.push(i);
    } catch (error) {
      console.error("Failed to retry event:", error);
    }
  }

  // Remove successful retries from the failed events
  const remainingEvents = failedEvents.filter(
    (_: any, index: number) => !successfulRetries.includes(index)
  );
  localStorage.setItem(
    "failedAnalyticsEvents",
    JSON.stringify(remainingEvents)
  );
}

export async function trackDownload(
  platform: Platform,
  format: VideoFormat,
  quality: string
) {
  await trackEvent("download", {
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
  await trackEvent("search", {
    query,
    platform,
    success,
  });
}

export async function trackSubscription(
  plan: string,
  interval: "month" | "year",
  amount: number
) {
  await trackEvent("subscription", {
    plan,
    interval,
    amount,
  });
}

export async function getAnalytics() {
  const { data: downloads } = await supabase
    .from("analytics_events")
    .select("*")
    .eq("event", "download");

  const { data: searches } = await supabase
    .from("analytics_events")
    .select("*")
    .eq("event", "search");

  const { data: subscriptions } = await supabase
    .from("analytics_events")
    .select("*")
    .eq("event", "subscription");

  return {
    downloads: downloads || [],
    searches: searches || [],
    subscriptions: subscriptions || [],
  };
}
