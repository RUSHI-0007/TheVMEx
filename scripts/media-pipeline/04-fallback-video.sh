#!/usr/bin/env bash
# 04-fallback-video.sh — Generates all-intra MP4, ambient looping MP4/WebM, and poster images

set -euo pipefail

INPUT="${1:-public/videos/Video6.MOV}"
START="${2:-0}"
DURATION="${3:-5}"

mkdir -p public/video public/img

echo "1. Generating all-intra fallback MP4 (instant scrub without decoding buffer)..."
ffmpeg -y -ss "$START" -t "$DURATION" -i "$INPUT" \
  -c:v libx264 -preset slow -crf 14 -g 1 -pix_fmt yuv420p -movflags +faststart -an \
  public/video/hero-fallback.mp4

echo "2. Generating ambient looping video (MP4 + WebM)..."
ffmpeg -y -ss "$START" -t "$DURATION" -i "$INPUT" \
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -movflags +faststart -an \
  public/video/hero-loop.mp4

ffmpeg -y -ss "$START" -t "$DURATION" -i "$INPUT" \
  -c:v libvpx -b:v 2M -crf 22 -pix_fmt yuv420p -an \
  public/video/hero-loop.webm

echo "3. Generating hero poster and blur placeholder..."
ffmpeg -y -ss "$START" -i "$INPUT" -vframes 1 -q:v 2 public/img/hero-poster.jpg
ffmpeg -y -i public/img/hero-poster.jpg -vf "scale=20:-1:flags=lanczos,boxblur=1:1" -q:v 20 public/img/hero-poster-blur.jpg

echo "=== Done! ==="
ls -lh public/video/hero-* public/img/hero-poster*
