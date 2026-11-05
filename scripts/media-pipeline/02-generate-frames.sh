#!/usr/bin/env bash
# 02-generate-frames.sh — Generates desktop (1920px @ 24fps) and mobile (1080px every 2nd frame) WebP sets

set -euo pipefail

INPUT="${1:-public/videos/Video6.MOV}"
START="${2:-0}"
DURATION="${3:-5}"
Q_DESKTOP="${4:-82}"
Q_MOBILE="${5:-80}"

OUT_DESKTOP="public/frames/desktop"
OUT_MOBILE="public/frames/mobile"
TMP_REF="/tmp/vm_hero_ref_png"

mkdir -p "$OUT_DESKTOP" "$OUT_MOBILE" "$TMP_REF"
rm -rf "${TMP_REF:?}"/*

echo "1. Extracting lossless reference PNG frames at 24fps ($START to ${DURATION}s)..."
ffmpeg -y -ss "$START" -t "$DURATION" -i "$INPUT" -vf "fps=24,scale=1920:1080:flags=lanczos" "$TMP_REF/f_%04d.png"

echo "2. Encoding Desktop WebP set ($OUT_DESKTOP, quality $Q_DESKTOP)..."
for f in "$TMP_REF"/*.png; do
  fname=$(basename "$f" .png)
  cwebp -q "$Q_DESKTOP" -m 6 -quiet "$f" -o "$OUT_DESKTOP/${fname}.webp"
done

echo "3. Encoding Mobile WebP set ($OUT_MOBILE, 1080px, every 2nd frame, quality $Q_MOBILE)..."
counter=1
for f in $(ls -1 "$TMP_REF"/*.png | sed -n '1~2p'); do
  out_name=$(printf "f_%04d.webp" "$counter")
  cwebp -resize 1080 0 -q "$Q_MOBILE" -m 6 -quiet "$f" -o "$OUT_MOBILE/$out_name"
  counter=$((counter + 1))
done

rm -rf "$TMP_REF"
echo "=== Done! ==="
du -sh "$OUT_DESKTOP" "$OUT_MOBILE"
