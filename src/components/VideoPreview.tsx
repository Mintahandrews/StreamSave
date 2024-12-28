import React from "react";
import type { VideoInfo, VideoFormat } from "@/types";
import { PlatformIndicator } from "./PlatformIndicator";
import { Button } from "./ui/Button";
import { downloadVideo } from "@/lib/api/download";
import { trackDownload } from "@/lib/analytics";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthModal } from "./AuthModal";
import { isSupabaseConfigured } from "@/lib/supabase";
import { LoadingSpinner } from "./LoadingSpinner";

interface VideoPreviewProps {
  video: VideoInfo;
}

export function VideoPreview({ video }: VideoPreviewProps) {
  const [downloading, setDownloading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [selectedFormat, setSelectedFormat] =
    React.useState<VideoFormat | null>(video.formats?.[0] ?? null);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const user = useAuthStore((state) => state.user);
  const maxRetries = 3;

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleDownload = async () => {
    if (!selectedFormat) {
      setError("Please select a format");
      return;
    }

    if (!isOnline) {
      setError(
        "No internet connection. Please check your network and try again."
      );
      return;
    }

    if (isSupabaseConfigured() && !user) {
      setShowAuthModal(true);
      return;
    }

    setDownloading(true);
    setError("");

    try {
      const downloadUrl = await downloadVideo(
        video.url,
        selectedFormat,
        video.platform
      );

      if (!downloadUrl || !downloadUrl.startsWith("http")) {
        throw new Error("Invalid download URL received");
      }

      if (isSupabaseConfigured()) {
        await trackDownload(
          video.platform,
          selectedFormat,
          selectedFormat.quality
        );
      }

      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${video.title || "video"}.${selectedFormat.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Download failed";
      setError(
        `${errorMessage}${retryCount < maxRetries ? " Click to retry." : ""}`
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div className="flex items-start space-x-4">
          {video.thumbnail && (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-32 h-24 object-cover rounded-md"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {video.title}
              </h3>
              <PlatformIndicator platform={video.platform} />
            </div>
            {video.duration && (
              <p className="text-sm text-gray-500">
                Duration: {video.duration}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div
            className="text-sm text-red-500 cursor-pointer"
            onClick={retryCount < maxRetries ? handleDownload : undefined}
          >
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {video.formats?.map((format) => (
              <Button
                key={`${format.quality}-${format.format}`}
                variant={selectedFormat === format ? "primary" : "outline"}
                onClick={() => setSelectedFormat(format)}
                className="justify-between"
              >
                <span>{format.quality}</span>
                {format.size && (
                  <span className="text-sm text-gray-500">{format.size}</span>
                )}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleDownload}
            disabled={downloading || !selectedFormat}
            className="w-full"
          >
            {downloading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Downloading...</span>
              </div>
            ) : (
              "Download"
            )}
          </Button>
        </div>
      </div>

      {isSupabaseConfigured() && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}
