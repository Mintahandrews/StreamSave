from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
import yt_dlp
from pathlib import Path
import logging
from ratelimit import limits, sleep_and_retry
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoInfo(BaseModel):
    url: HttpUrl
    title: str
    thumbnail: Optional[str]
    duration: Optional[int]
    formats: List[dict]

# Rate limiting: 100 requests per minute
@sleep_and_retry
@limits(calls=100, period=60)
def check_rate_limit():
    pass

def get_yt_dlp_opts():
    return {
        'format': 'bestvideo+bestaudio/best',
        'extract_flat': True,
        'quiet': True,
        'no_warnings': True,
        'nocheckcertificate': True,
    }

@app.get("/api/info")
async def get_video_info(url: HttpUrl):
    try:
        check_rate_limit()
        
        with yt_dlp.YoutubeDL(get_yt_dlp_opts()) as ydl:
            info = ydl.extract_info(str(url), download=False)
            
            formats = [{
                'format': f.get('ext', 'unknown'),
                'quality': f.get('format_note', f.get('height', 'unknown')),
                'filesize': f.get('filesize', 0),
            } for f in info.get('formats', [])]
            
            return VideoInfo(
                url=url,
                title=info.get('title', ''),
                thumbnail=info.get('thumbnail', ''),
                duration=info.get('duration'),
                formats=formats
            )
    except Exception as e:
        logger.error(f"Error fetching video info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download")
async def get_download_url(url: HttpUrl, format: str, quality: str):
    try:
        check_rate_limit()
        
        format_str = f'bestvideo[height<={quality.replace("p", "")}]+bestaudio/best[height<={quality.replace("p", "")}]'
        
        ydl_opts = {
            'format': format_str,
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(str(url), download=False)
            if 'url' in info:
                return {"url": info['url']}
            raise HTTPException(status_code=404, detail="No download URL found")
            
    except Exception as e:
        logger.error(f"Error getting download URL: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/platforms")
async def get_supported_platforms():
    try:
        with yt_dlp.YoutubeDL() as ydl:
            extractors = ydl.get_extractors()
            platforms = [e.IE_NAME for e in extractors if e.IE_NAME not in ['generic']]
            return {"platforms": platforms}
    except Exception as e:
        logger.error(f"Error getting platforms: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)