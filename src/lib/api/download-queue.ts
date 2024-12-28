import type { VideoFormat, Platform } from "@/types";
import { downloadVideo } from "./download";

interface QueuedDownload {
  url: string;
  format: VideoFormat;
  platform: Platform;
  retries: number;
  lastAttempt: number;
}

class DownloadQueue {
  private queue: QueuedDownload[] = [];
  private maxRetries = 3;
  private retryDelay = 5000;

  async add(download: Omit<QueuedDownload, "retries" | "lastAttempt">) {
    this.queue.push({
      ...download,
      retries: 0,
      lastAttempt: Date.now(),
    });
    await this.processQueue();
  }

  private async processQueue() {
    const now = Date.now();
    const item = this.queue.find(
      (item) => now - item.lastAttempt >= this.retryDelay
    );

    if (!item) return;

    try {
      const downloadUrl = await downloadVideo(
        item.url,
        item.format,
        item.platform
      );
      this.queue = this.queue.filter((i) => i !== item);
      return downloadUrl;
    } catch (error) {
      if (item.retries < this.maxRetries) {
        item.retries++;
        item.lastAttempt = now;
      } else {
        this.queue = this.queue.filter((i) => i !== item);
      }
    }
  }
}

export const downloadQueue = new DownloadQueue();
