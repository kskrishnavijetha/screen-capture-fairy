export const validateVideoMetadata = (video: HTMLVideoElement | null) => {
  if (!video) {
    throw new Error('No video element provided');
  }

  if (!video.duration || !isFinite(video.duration)) {
    throw new Error('Invalid video duration');
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

  if (start < 0 || end > duration || start >= end) {
    throw new Error('Invalid time range');
  }

  return { start, end };
};