export const validateVideoMetadata = (video: HTMLVideoElement | null) => {
  if (!video) {
    throw new Error('No video element provided');
  }

  // Check if video metadata is actually loaded
  if (!video.videoWidth || !video.videoHeight) {
    throw new Error('Video dimensions not available - metadata not fully loaded');
  }

  if (!isFinite(video.duration)) {
    throw new Error('Invalid video duration - metadata not fully loaded');
  }

  console.log('Validated video metadata:', {
    duration: video.duration,
    width: video.videoWidth,
    height: video.videoHeight,
    readyState: video.readyState
  });

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
  const validStart = Math.max(0, Math.min(start, duration));
  const validEnd = Math.max(validStart, Math.min(end, duration));

  if (validStart >= validEnd) {
    throw new Error('Start time must be less than end time');
  }

  console.log('Validated time range:', { start: validStart, end: validEnd, duration });

  return { start: validStart, end: validEnd };
};