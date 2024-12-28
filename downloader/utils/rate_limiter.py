import time
from typing import Dict
from threading import Lock

class RateLimiter:
    def __init__(self):
        self.last_request: Dict[str, float] = {}
        self.lock = Lock()
        
        # Define rate limits per platform (in seconds)
        self.rate_limits = {
            'youtube': 1.0,    # 1 request per second
            'instagram': 2.0,  # 1 request per 2 seconds
            'tiktok': 1.5,    # 1 request per 1.5 seconds
            'twitter': 1.0,    # 1 request per second
            'facebook': 2.0,   # 1 request per 2 seconds
        }
    
    def wait(self, platform: str) -> None:
        """Wait if necessary to respect rate limits."""
        with self.lock:
            if platform in self.last_request:
                elapsed = time.time() - self.last_request[platform]
                wait_time = self.rate_limits.get(platform, 1.0) - elapsed
                
                if wait_time > 0:
                    time.sleep(wait_time)
            
            self.last_request[platform] = time.time()