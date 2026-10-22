#!/usr/bin/env python3
"""Generate valid MP4 video files for intro smoke test."""

import subprocess
import os

colors = [
    "red", "green", "blue", "yellow", "cyan", "magenta",
    "orange", "purple", "pink", "teal", "lime", "indigo"
]

videos_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "videos")
os.makedirs(videos_dir, exist_ok=True)

for i in range(1, 13):
    color = colors[i - 1]
    output = os.path.join(videos_dir, f"intro-{i}.mp4")
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", f"color=c={color}:s=640x360:d=3",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        output
    ]
    print(f"Generating intro-{i}.mp4 ({color})...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ERROR: {result.stderr[-500:]}")
    else:
        print(f"  OK: {os.path.getsize(output)} bytes")

print("Done!")
