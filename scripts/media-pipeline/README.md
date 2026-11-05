# Media Pipeline Scripts

This directory contains standalone, reproducible automation scripts to process, inspect, sweep quality, and generate scrub frame sequences and gallery media for **TheVMEx** website.

## Prerequisites
- `ffmpeg` (with `libx264` and `libvpx`)
- `cwebp` (`brew install webp`)

---

## Scripts

### 1. Inspect Video
```bash
./scripts/media-pipeline/01-inspect.sh [video_path]
```
Outputs `ffprobe` stream info, frame rate, color space (`bt709` SDR check), resolution, and rotation metadata.

### 2. Generate Hero Scrub Frame Sets
```bash
./scripts/media-pipeline/02-generate-frames.sh [video_path] [start_seconds] [duration_seconds] [q_desktop] [q_mobile]
```
- Extracts lossless reference frames at 24fps.
- Encodes **Desktop set** (`public/frames/desktop/f_%04d.webp`, 1920x1080 @ quality 82).
- Encodes **Mobile set** (`public/frames/mobile/f_%04d.webp`, 1080px wide every 2nd frame @ quality 80).

### 3. Quality Sweep & SSIM Benchmark
```bash
./scripts/media-pipeline/03-quality-sweep.sh [video_path] [start_seconds] [duration_seconds]
```
Compares quality 75, 82, 88, and 92 against uncompressed PNG frames using FFmpeg's `ssim` filter.

### 4. Generate Video Fallbacks & Posters
```bash
./scripts/media-pipeline/04-fallback-video.sh [video_path] [start_seconds] [duration_seconds]
```
Generates:
- `public/video/hero-fallback.mp4`: All-intra keyframe-per-frame MP4 (`-g 1 -crf 14`) for low-tier hardware scrubbing without decode stutter.
- `public/video/hero-loop.mp4` & `.webm`: Smooth ambient video loops for reduced-data/static modes.
- `public/img/hero-poster.jpg` & `hero-poster-blur.jpg`: Frame 1 preload poster + tiny 20px blur placeholder.

### 5. Convert Gallery Videos
```bash
./scripts/media-pipeline/05-convert-gallery.sh
```
Converts raw `.MOV` files (`Video4.MOV`, `Video6.MOV`) into cross-browser web formats (`video4.mp4`, `video4.webm`, `video6.mp4`, `video6.webm`) and organizes all gallery media in `public/video/gallery/`.
