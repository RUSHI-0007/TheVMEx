#!/usr/bin/env bash
# 01-inspect.sh — Inspects source video technical characteristics with ffprobe

set -euo pipefail

INPUT="${1:-public/videos/Video6.MOV}"

if [ ! -f "$INPUT" ]; then
  echo "Error: File not found: $INPUT"
  exit 1
fi

echo "=== ffprobe stream inspection for $INPUT ==="
ffprobe -v error -show_format -show_streams -print_format json "$INPUT"
