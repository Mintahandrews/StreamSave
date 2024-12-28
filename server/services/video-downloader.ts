import { spawn } from "child_process";
import { promisify } from "util";
import { exec } from "child_process";
import { VideoInfo, Platform } from "../../src/types";

const execAsync = promisify(exec);

export class VideoDownloader {
  private async executeYtDlp(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      let output = "";
      let errorOutput = "";

      const process = spawn("yt-dlp", args);

      process.stdout.on("data", (data) => {
        output += data.toString();
      });

      process.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      process.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(errorOutput || "yt-dlp command failed"));
        } else {
          resolve(output);
        }
      });
    });
  }

  async getVideoInfo(url: string): Promise<VideoInfo> {
    try {
      const output = await this.executeYtDlp([
        "--dump-json",
        "--no-playlist",
        url,
      ]);

      const info = JSON.parse(output);
      return {
        title: info.title,
        thumbnail: info.thumbnail,
        duration: info.duration_string,
        platform: this.detectPlatform(url),
        url,
        formats: info.formats
          .filter((f: any) => f.vcodec !== "none" || f.acodec !== "none")
          .map((f: any) => ({
            quality: f.height ? `${f.height}p` : "audio",
            format: f.ext,
            size: f.filesize
              ? `${(f.filesize / 1024 / 1024).toFixed(1)} MB`
              : undefined,
          })),
      };
    } catch (error) {
      throw new Error(`Failed to fetch video info: ${error}`);
    }
  }

  async getDownloadUrl(
    url: string,
    format: string,
    quality: string
  ): Promise<string> {
    try {
      const output = await this.executeYtDlp([
        "--format",
        `bestvideo[height<=${quality.replace(
          "p",
          ""
        )}]+bestaudio/best[height<=${quality.replace("p", "")}]`,
        "--get-url",
        url,
      ]);

      return output.trim();
    } catch (error) {
      throw new Error(`Failed to get download URL: ${error}`);
    }
  }

  private detectPlatform(url: string): Platform {
    const hostname = new URL(url).hostname;
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be"))
      return "youtube";
    if (hostname.includes("twitter.com")) return "twitter";
    if (hostname.includes("instagram.com")) return "instagram";
    if (hostname.includes("tiktok.com")) return "tiktok";
    throw new Error("Unsupported platform");
  }
}
