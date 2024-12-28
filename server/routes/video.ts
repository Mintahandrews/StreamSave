import { Router, Request, Response } from "express";
import { spawn } from "child_process";
import rateLimit from "express-rate-limit";
import { VideoDownloader } from "../services/video-downloader";

const router = Router();
const downloader = new VideoDownloader();

// Specific rate limit for video downloads
const downloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 downloads per hour
  message: "Download limit reached. Please try again later.",
});

router.get("/info", async (req: Request, res: Response) => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL is required" });
    }

    const info = await downloader.getVideoInfo(url);
    res.json(info);
  } catch (error) {
    console.error("Error fetching video info:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to fetch video info",
    });
  }
});

router.get(
  "/download",
  downloadLimiter,
  async (req: Request, res: Response) => {
    try {
      const { url, format, quality } = req.query;
      if (!url || !format || !quality) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const downloadUrl = await downloader.getDownloadUrl(
        url as string,
        format as string,
        quality as string
      );

      res.json({ url: downloadUrl });
    } catch (error) {
      console.error("Error getting download URL:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to get download URL",
      });
    }
  }
);

export const videoRouter = router;
