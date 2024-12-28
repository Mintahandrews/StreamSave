import axios, { AxiosError } from "axios";
import type { VideoInfo } from "@/types";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function retryRequest<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function getYoutubeInfo(url: string): Promise<VideoInfo> {
  return retryRequest(async () => {
    try {
      const response = await axios.get<VideoInfo>(
        `/api/youtube/info?url=${encodeURIComponent(url)}`,
        {
          timeout: 10000,
          validateStatus: (status: number) => status === 200,
        }
      );

      return {
        platform: "youtube",
        url,
        ...response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch YouTube video info"
        );
      }
      throw error as Error;
    }
  });
}
