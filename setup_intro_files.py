#!/usr/bin/env python3
"""Create valid MP4 video files for intro smoke test across 12 products."""

import os
import subprocess

colors = [
    "red", "green", "blue", "yellow", "cyan", "magenta",
    "orange", "purple", "pink", "teal", "lime", "indigo"
]

# Create videos directory
videos_dir = "videos"
os.makedirs(videos_dir, exist_ok=True)

# Create 12 valid MP4 files using ffmpeg
for i in range(1, 13):
    filepath = os.path.join(videos_dir, f"intro-{i}.mp4")
    color = colors[i - 1]
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", f"color=c={color}:s=640x360:d=3",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        filepath
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"Created {filepath} ({os.path.getsize(filepath)} bytes)")
    else:
        print(f"ERROR creating {filepath}: {result.stderr[-200:]}")

# Also create/update .gitignore
gitignore_path = ".gitignore"
gitignore_content = """node_modules/
*.log
*.bak
index.backup*
dist/
build/
.env
.env.local
.env.*.local
.DS_Store
Thumbs.db
.vscode/
.idea/
coverage/
preview.log"""

with open(gitignore_path, "w") as f:
    f.write(gitignore_content)
print(f"Created {gitignore_path}")

print("Setup complete!")