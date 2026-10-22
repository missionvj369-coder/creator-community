#!/usr/bin/env python3
"""Create valid MP4 video files for intro smoke test across 12 products."""

import os
import subprocess

colors = [
    "red", "green", "blue", "yellow", "cyan", "magenta",
    "orange", "purple", "pink", "teal", "lime", "indigo"
]

def create_mp4(filepath, color="blue", size="640x360", duration=3):
    """Create a valid MP4 video file using ffmpeg."""
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", f"color=c={color}:s={size}:d={duration}",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        filepath
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0

def main():
    videos_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "videos")
    os.makedirs(videos_dir, exist_ok=True)

    print("Creating valid MP4 files for intro video playback...")

    for i in range(1, 13):
        color = colors[i - 1]
        filepath = os.path.join(videos_dir, f"intro-{i}.mp4")
        if create_mp4(filepath, color):
            print(f"Created {filepath} ({os.path.getsize(filepath)} bytes)")
        else:
            print(f"ERROR creating {filepath}")

    print("MP4 files created successfully!")

if __name__ == '__main__':
    main()