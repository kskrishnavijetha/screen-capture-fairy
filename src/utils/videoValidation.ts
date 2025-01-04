export const validateVideoMetadata = (video: HTMLVideoElement | null) => {
  if (!video) {
    throw new Error('No video element provided');
  }

  // Wait for metadata to be loaded - readyState should be at least HAVE_METADATA (1)
  if (video.readyState < 1) {
    throw new Error('Video metadata not yet loaded');
  }

  if (!video.duration || !isFinite(video.duration)) {
    throw new Error('Invalid or missing video duration');
  }

  if (!video.videoWidth || !video.videoHeight) {
    throw new Error('Invalid video dimensions');
  }

  return {
    duration: video.duration,
    width: video.videoWidth,
    height: video.videoHeight
  };
};

export const validateTimeRange = (start: number, end: number, duration: number) => {
  if (!isFinite(start) || !isFinite(end) || !isFinite(duration)) {
    throw new Error('Invalid time values provided');
  }

  // Ensure values are within valid range
  start = Math.max(0, Math.min(start, duration));
  end = Math.max(start, Math.min(end, duration));

  if (start >= end) {
    throw new Error('Start time must be less than end time');
  }

  return { start, end };
};