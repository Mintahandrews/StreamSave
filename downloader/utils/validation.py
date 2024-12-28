import re
from urllib.parse import urlparse

def validate_url(url: str) -> bool:
    """Validate if the provided URL is properly formatted."""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def validate_output_template(template: str) -> bool:
    """Validate the output filename template."""
    forbidden_chars = r'[<>:"/\\|?*]'
    return not bool(re.search(forbidden_chars, template))