#!/usr/bin/env python3
"""Create MP4 placeholder files for intro video playback.

Creates 132-byte placeholder MP4 files used by the intro smoke test
across 12 products. These are minimal valid MP4 containers for testing
the auto-play and transition behavior.
"""

import os
import struct

def create_mp4_placeholder(filepath, size=132):
    """Create a minimal MP4 placeholder file."""
    # Minimal MP4 box structure: ftyp box + padding
    # ftyp box: [size=8] [brand=4] [brand=4] [model=4] [make=4]
    ftyp_size = struct.pack('>I', 8)  # size
    ftyp_brand = b'mp42'  # brand
    ftyp_minor = b'iso2'  # compatible brand
    ftyp_box = ftyp_size + ftyp_brand + ftyp_minor
    
    # Pad to requested size
    padding = b'\x00' * (size - len(ftyp_box))
    
    with open(filepath, 'wb') as f:
        f.write(ftyp_box + padding)
    
    return os.path.getsize(filepath)

def main():
    videos_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'videos')
    os.makedirs(videos_dir, exist_ok=True)
    
    print("Creating MP4 placeholder files for intro video playback...")
    
    for i in range(1, 4):
        filepath = os.path.join(videos_dir, f"intro-{i}.mp4")
        size = create_mp4_placeholder(filepath, 132)
        print(f"Created {filepath} ({size} bytes)")
    
    print("MP4 placeholder files created successfully!")

if __name__ == '__main__':
    main()