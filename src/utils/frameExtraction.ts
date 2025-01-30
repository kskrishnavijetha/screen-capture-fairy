export const extractFrames = async (
  video: HTMLVideoElement,
  framesPerSecond: number = 1
): Promise<string[]> => {
  const frames: string[] = [];
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) throw new Error('Could not get canvas context');
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const duration = video.duration;
  const interval = 1 / framesPerSecond;
  
  for (let time = 0; time < duration; time += interval) {
    video.currentTime = time;
    await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frameData = canvas.toDataURL('image/jpeg', 0.5);
    frames.push(frameData);
  }
  
  return frames;
};