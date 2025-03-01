import axios, { AxiosError } from "axios";
import type { VideoInfo, Platform } from "@/types";
import { axiosConfig, ENDPOINTS } from "./config";

const axiosInstance = axios.create({
  ...axiosConfig,
  headers: {
    ...axiosConfig.headers,
    "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
    "X-RapidAPI-Host": import.meta.env.VITE_RAPID_API_HOST,
  },
});

export class VideoService {
  private static async request<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ) {
    const retryConfig = {
      retries: 5,
      backoff: {
        initial: 500,
        multiplier: 1.5,
        maxDelay: 15000,
      },
    };

    let lastError: Error | null = null;

    if (!navigator.onLine) {
      throw new Error(
        "No internet connection detected. Please check your network connection and try again when you're back online."
      );
    }

    // Add connection quality check
    if (navigator.connection && "effectiveType" in navigator.connection) {
      const connection = navigator.connection as any;
      if (
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g"
      ) {
        console.warn(
          "Slow network connection detected. Request may take longer than usual."
        );
      }
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
          validateStatus: (status) => status === 200,
        });

        if (!response.data) {
          throw new Error("Invalid response received from the server");
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
