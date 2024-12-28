import { VideoService } from "./video-service";
import type { VideoFormat, Platform } from "@/types";
import { getCurrentUser } from "./auth";
import { isSupabaseConfigured } from "../supabase";
import { supabase } from "../supabase";

const DAILY_LIMIT_FREE = 3;
const FORMAT_LIMITS: Record<string, string[]> = {
  free: ["480p", "720p"],
  premium: ["480p", "720p", "1080p", "4k"],
};

interface DownloadStats {
  downloads_today: number;
  is_premium: boolean;
}

async function getDownloadStats(): Promise<DownloadStats | null> {
  if (!isSupabaseConfigured()) {
    return { downloads_today: 0, is_premium: true };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { downloads_today: 0, is_premium: false };
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    const [downloadsResponse, subscriptionResponse] = await Promise.all([
      supabase
        .from("downloads")
        .select("count")
        .eq("user_id", user.id)
        .gte("created_at", today)
        .single(),
      supabase
        .from("subscriptions")
        .select("is_premium")
        .eq("user_id", user.id)
        .single(),
    ]);

    if (downloadsResponse.error) throw downloadsResponse.error;
    if (subscriptionResponse.error) throw subscriptionResponse.error;

    return {
      downloads_today: downloadsResponse.data?.count || 0,
      is_premium: subscriptionResponse.data?.is_premium || false,
    };
  } catch (error) {
    console.error("Failed to fetch download stats:", error);
    return null;
  }
}

async function incrementDownloadCount() {
  if (!isSupabaseConfigured()) return;

  const user = await getCurrentUser();
  if (!user) return;

  const today = new Date().toISOString().split("T")[0];

  await supabase.from("downloads").upsert(
    {
      user_id: user.id,
      count: 1,
      created_at: today,
    },
    {
      onConflict: "user_id,created_at",
    }
  );
}

export async function downloadVideo(
  url: string,
  format: VideoFormat,
  platform: Platform,
  onProgress?: (progress: number) => void
): Promise<string> {
  if (!navigator.onLine) {
    throw new Error(
      "No internet connection. Please check your network and try again."
    );
  }

  if (!url || !format || !platform) {
    throw new Error("Missing required parameters");
  }

  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      if (!isSupabaseConfigured()) {
        return VideoService.getDownloadUrl(url, format.format, format.quality);
      }

      const stats = await getDownloadStats();
      if (!stats) {
        throw new Error("Failed to fetch download stats. Please try again.");
      }

      if (!stats.is_premium && stats.downloads_today >= DAILY_LIMIT_FREE) {
        throw new Error(
          "Daily download limit reached. Upgrade to premium for unlimited downloads!"
        );
      }

      const allowedFormats =
        FORMAT_LIMITS[stats.is_premium ? "premium" : "free"];
      if (!allowedFormats.includes(format.quality)) {
        throw new Error(
          `${format.quality} quality is only available for premium users`
        );
      }

      const downloadUrl = await VideoService.getDownloadUrl(
        url,
        format.format,
        format.quality
      );

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const contentLength = Number(response.headers.get("content-length"));
      let downloaded = 0;

      const reader = response.body!.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        if (!navigator.onLine) {
          throw new Error("Download interrupted: Lost internet connection");
        }

        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        downloaded += value.length;

        if (onProgress && contentLength) {
          onProgress(downloaded / contentLength);
        }
      }

      const blob = new Blob(chunks);
      await incrementDownloadCount();
      return URL.createObjectURL(blob);
    } catch (error) {
      retryCount++;

      if (!navigator.onLine) {
        throw new Error(
          "No internet connection. Please check your network and try again."
        );
      }

      if (retryCount === maxRetries) {
        if (error instanceof Error) {
          throw new Error(
            `Download failed after ${maxRetries} attempts: ${error.message}`
          );
        }
        throw new Error(`Download failed after ${maxRetries} attempts`);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000 * retryCount));
    }
  }

  throw new Error("Download failed after maximum retry attempts");
}
