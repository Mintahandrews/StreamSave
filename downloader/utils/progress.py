import sys
from typing import Dict, Any

class ProgressBar:
    def __init__(self):
        self.current_title = None
    
    def update(self, d: Dict[str, Any]) -> None:
        """Update download progress."""
        if d['status'] == 'downloading':
            if self.current_title != d.get('filename'):
                self.current_title = d.get('filename')
                print(f"\nDownloading: {self.current_title}")
            
            total = d.get('total_bytes') or d.get('total_bytes_estimate', 0)
            downloaded = d.get('downloaded_bytes', 0)
            
            if total > 0:
                percentage = (downloaded / total) * 100
                bar_length = 50
                filled_length = int(bar_length * downloaded // total)
                bar = '=' * filled_length + '-' * (bar_length - filled_length)
                
                sys.stdout.write(f'\r[{bar}] {percentage:.1f}%')
                sys.stdout.flush()
                
        elif d['status'] == 'finished':
            sys.stdout.write('\nDownload completed!\n')
            sys.stdout.flush()