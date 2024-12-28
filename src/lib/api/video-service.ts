import axios, { AxiosError } from "axios";
import type { VideoInfo, Platform } from "@/types";
import { axiosConfig, ENDPOINTS } from "./config";

const axiosInstance = axios.create(axiosConfig);

export class VideoService {
  private static async request<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ) {
    const retryConfig = {
      retries: 3,
      backoff: {
        initial: 1000,
        multiplier: 2,
        maxDelay: 10000,
      },
    };

    let lastError: Error | null = null;

    if (!navigator.onLine) {
      throw new Error(
        "No internet connection. Please check your network and try again."
      );
    }

    for (let attempt = 0; attempt <= retryConfig.retries; attempt++) {
      try {
        const response = await axiosInstance.get<T>(endpoint, {
          params,
          headers: {
            ...axiosConfig.headers,
            "X-Request-ID": crypto.randomUUID(),
          },
          timeout: attempt === 0 ? 5000 : axiosConfig.timeout,
        });

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers["retry-after"] || "5");
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000)
          );
          continue;
        }

        if (response.status === 404) {
          throw new Error("Video not found or has been removed.");
        }

        if (response.status !== 200) {
          throw new Error(
            (response.data as any)?.message ||
              `Request failed with status ${response.status}`
          );
        }

        return response.data;
      } catch (err) {
        const error = err as AxiosError | Error;
        lastError = error;

        if (axios.isAxiosError(error)) {
          if (error.code === "ECONNABORTED") {
            lastError = new Error(
              attempt === retryConfig.retries
                ? "Server is not responding. Please try again later."
                : "Request timed out. Retrying..."
            );
          } else if (!navigator.onLine) {
            lastError = new Error(
              "No internet connection. Please check your network and try again."
            );
          } else if (error.response?.data) {
            const data = error.response.data as { message?: string };
            lastError = new Error(
              data.message || `Request failed: ${error.message}`
            );
          } else if (error.request) {
            lastError = new Error(
              "Unable to reach the server. Please check your connection and try again."
            );
          }
        } else {
          lastError = new Error(`Network error: ${error.message}`);
        }

        if (attempt < retryConfig.retries) {
          console.log(`Attempt ${attempt + 1} failed, retrying...`);
          const delay = Math.min(
            retryConfig.backoff.initial *
              Math.pow(retryConfig.backoff.multiplier, attempt),
            retryConfig.backoff.maxDelay
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    throw lastError || new Error("Request failed after retries");
  }

  static async getVideoInfo(
    url: string,
    platform: Platform
  ): Promise<VideoInfo> {
    if (!url || !platform) {
      throw new Error("URL and platform are required");
    }
    return this.request<VideoInfo>(ENDPOINTS.info, {
      url: encodeURIComponent(url),
      platform,
    });
  }

  static async getDownloadUrl(
    videoId: string,
    format: string,
    quality: string
  ): Promise<string> {
    if (!videoId || !format || !quality) {
      throw new Error("VideoId, format and quality are required");
    }
    const response = await this.request<{ downloadUrl: string }>(
      ENDPOINTS.download,
      {
        videoId,
        format,
        quality,
      }
    );

    if (!response.downloadUrl) {
      throw new Error("Invalid download URL received");
    }

    return response.downloadUrl;
  }
}
