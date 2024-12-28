from typing import Optional
from urllib.parse import urlparse

def get_platform_extractor(url: str) -> Optional[str]:
    """Detect the platform from the URL."""
    domain = urlparse(url).netloc.lower()
    
    if any(x in domain for x in ['youtube.com', 'youtu.be']):
        return 'youtube'
    elif 'instagram.com' in domain:
        return 'instagram'
    elif 'tiktok.com' in domain:
        return 'tiktok'
    elif 'twitter.com' in domain:
        return 'twitter'
    elif 'facebook.com' in domain:
        return 'facebook'
    
    return None