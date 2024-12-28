import yt_dlp
import os
from typing import Optional, Dict, Any
from pathlib import Path
from .utils.progress import ProgressBar
from .utils.validation import validate_url
from .utils.rate_limiter import RateLimiter
from .platforms import get_platform_extractor

class VideoDownloader:
    def __init__(self, output_dir: str = "downloads"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.rate_limiter = RateLimiter()
        
    def _get_ydl_opts(self, filename_template: Optional[str] = None) -> Dict[str, Any]:
        progress_bar = ProgressBar()
        
        return {
            'format': 'bestvideo+bestaudio/best',
            'outtmpl': str(self.output_dir / (filename_template or '%(title)s.%(ext)s')),
            'progress_hooks': [progress_bar.update],
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'concurrent_fragment_downloads': 3,
        }

    def download(self, url: str, filename_template: Optional[str] = None) -> Dict[str, Any]:
        """Download video from the given URL."""
        if not validate_url(url):
            raise ValueError("Invalid URL provided")

        platform = get_platform_extractor(url)
        if not platform:
            raise ValueError("Unsupported platform")

        # Apply rate limiting based on platform
        self.rate_limiter.wait(platform)

        try:
            with yt_dlp.YoutubeDL(self._get_ydl_opts(filename_template)) as ydl:
                # Extract video metadata first
                info = ydl.extract_info(url, download=False)
                
                # Download the video
                ydl.download([url])
                
                return {
                    'title': info.get('title'),
                    'uploader': info.get('uploader'),
                    'upload_date': info.get('upload_date'),
                    'duration': info.get('duration'),
                    'view_count': info.get('view_count'),
                    'like_count': info.get('like_count'),
                    'format': info.get('format'),
                    'filepath': str(self.output_dir / f"{info['title']}.{info['ext']}")
                }
                
        except Exception as e:
            raise Exception(f"Download failed: {str(e)}")