#!/bin/bash

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install yt-dlp globally (optional)
pip install yt-dlp --upgrade 