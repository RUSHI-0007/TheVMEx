#!/usr/bin/env bash
# 05-convert-gallery.sh — Re-encodes raw MOV gallery videos to web-optimized MP4 + WebM

set -euo pipefail

mkdir -p public/video/gallery

echo "1. Re-encoding Video4.MOV to MP4 and WebM..."
ffmpeg -y -i public/videos/Video4.MOV \
  -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k \
  public/video/gallery/video4.mp4

ffmpeg -y -i public/videos/Video4.MOV \
  -c:v libvpx -b:v 1.5M -crf 24 -pix_fmt yuv420p -c:a libopus -b:a 96k \
  public/video/gallery/video4.webm

echo "2. Re-encoding Video6.MOV (crowd/dance segment t=15-23s) to MP4 and WebM..."
ffmpeg -y -ss 15 -t 8 -i public/videos/Video6.MOV \
  -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k \
  public/video/gallery/video6.mp4

ffmpeg -y -ss 15 -t 8 -i public/videos/Video6.MOV \
  -c:v libvpx -b:v 1.5M -crf 24 -pix_fmt yuv420p -c:a libopus -b:a 96k \
  public/video/gallery/video6.webm

echo "3. Copying existing web MP4s..."
cp -n public/videos/video1.mp4 public/video/gallery/ || true
cp -n public/videos/video2.mp4 public/video/gallery/ || true
cp -n public/videos/video3.mp4 public/video/gallery/ || true

echo "=== Done! Gallery contents: ==="
ls -lh public/video/gallery/
