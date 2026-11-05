/**
 * Lightweight controller for auto-pausing off-screen videos
 * and enforcing max 2 playing at once.
 */

const playingVideos = new Set<HTMLVideoElement>();
const MAX_CONCURRENT_VIDEOS = 2;

export function registerManagedVideo(video: HTMLVideoElement): () => void {
  const onPlay = () => {
    playingVideos.add(video);
    if (playingVideos.size > MAX_CONCURRENT_VIDEOS) {
      // Pause the oldest video
      const oldest = playingVideos.values().next().value;
      if (oldest && oldest !== video) {
        oldest.pause();
        playingVideos.delete(oldest);
      }
    }
  };

  const onPauseOrEnded = () => {
    playingVideos.delete(video);
  };

  video.addEventListener("play", onPlay);
  video.addEventListener("pause", onPauseOrEnded);
  video.addEventListener("ended", onPauseOrEnded);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Auto-play was prevented (e.g. low power mode)
            });
          }
        } else {
          video.pause();
          playingVideos.delete(video);
        }
      });
    },
    { threshold: [0, 0.25, 0.5] }
  );

  observer.observe(video);

  return () => {
    observer.disconnect();
    video.removeEventListener("play", onPlay);
    video.removeEventListener("pause", onPauseOrEnded);
    video.removeEventListener("ended", onPauseOrEnded);
    playingVideos.delete(video);
  };
}
