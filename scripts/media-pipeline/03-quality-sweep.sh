#!/usr/bin/env bash
# 03-quality-sweep.sh — Runs SSIM quality sweep at 75, 82, 88, 92 and measures against source reference

set -euo pipefail

INPUT="${1:-public/videos/Video6.MOV}"
START="${2:-0}"
DURATION="${3:-5}"
SWEEP_DIR="/tmp/vm_ssim_sweep"

rm -rf "$SWEEP_DIR"
mkdir -p "$SWEEP_DIR/ref" "$SWEEP_DIR/q75" "$SWEEP_DIR/q82" "$SWEEP_DIR/q88" "$SWEEP_DIR/q92"

echo "Extracting reference PNGs..."
ffmpeg -y -ss "$START" -t "$DURATION" -i "$INPUT" -vf "fps=24,scale=1920:1080:flags=lanczos" "$SWEEP_DIR/ref/f_%04d.png"

echo "Encoding quality levels..."
for f in "$SWEEP_DIR"/ref/*.png; do
  fname=$(basename "$f" .png)
  cwebp -q 75 -m 6 -quiet "$f" -o "$SWEEP_DIR/q75/${fname}.webp"
  cwebp -q 82 -m 6 -quiet "$f" -o "$SWEEP_DIR/q82/${fname}.webp"
  cwebp -q 88 -m 6 -quiet "$f" -o "$SWEEP_DIR/q88/${fname}.webp"
  cwebp -q 92 -m 6 -quiet "$f" -o "$SWEEP_DIR/q92/${fname}.webp"
done

echo "=== Total Directory Sizes ==="
du -sh "$SWEEP_DIR"/q*

echo "=== SSIM Measurements ==="
for q in q75 q82 q88 q92; do
  echo -n "$q: "
  ffmpeg -i "$SWEEP_DIR/$q/f_%04d.webp" -i "$SWEEP_DIR/ref/f_%04d.png" -lavfi ssim -f null - 2>&1 | grep "SSIM Y:"
done
