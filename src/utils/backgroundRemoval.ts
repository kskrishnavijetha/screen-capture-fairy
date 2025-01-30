import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_DIMENSION = 640; // Balance between performance and quality

async function initializeSegmenter() {
  return await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
    device: 'webgpu',
  });
}

export async function processVideoFrame(
  inputCanvas: HTMLCanvasElement,
  outputCanvas: HTMLCanvasElement,
  segmenter: any
): Promise<void> {
  const ctx = outputCanvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  try {
    // Get the frame as base64
    const imageData = inputCanvas.toDataURL('image/jpeg', 0.8);
    
    // Process with segmentation model
    const result = await segmenter(imageData);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }

    // Draw original frame
    ctx.drawImage(inputCanvas, 0, 0, outputCanvas.width, outputCanvas.height);
    
    // Apply the mask
    const imageData2 = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = imageData2.data;
    
    // Apply mask to alpha channel
    for (let i = 0; i < result[0].mask.data.length; i++) {
      const alpha = Math.round(result[0].mask.data[i] * 255); // Keep foreground
      data[i * 4 + 3] = alpha;
    }
    
    ctx.putImageData(imageData2, 0, 0);
  } catch (error) {
    console.error('Error processing video frame:', error);
    // On error, just draw the original frame
    ctx.drawImage(inputCanvas, 0, 0, outputCanvas.width, outputCanvas.height);
  }
}