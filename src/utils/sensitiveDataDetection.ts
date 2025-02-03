import { createWorker } from 'tesseract.js';

export type SensitiveDataType = 'creditCard' | 'ssn' | 'email' | 'phone';

interface DetectedItem {
  type: SensitiveDataType;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

interface DetectionOptions {
  enabled: boolean;
  types: SensitiveDataType[];
}

let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

export const initializeOCR = async () => {
  if (!worker) {
    worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
  }
};

export const detectSensitiveData = async (
  imageData: ImageData,
  options: DetectionOptions
): Promise<DetectedItem[]> => {
  if (!options.enabled || !worker) {
    return [];
  }

  try {
    const { data: { text } } = await worker.recognize(imageData);
    const detectedItems: DetectedItem[] = [];

    // Process text for sensitive data patterns
    if (options.types.includes('creditCard')) {
      const creditCardPattern = /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g;
      const matches = text.match(creditCardPattern);
      if (matches) {
        matches.forEach(match => {
          detectedItems.push({
            type: 'creditCard',
            confidence: 0.9,
            bbox: { x0: 0, y0: 0, x1: 100, y1: 100 }
          });
        });
      }
    }

    // Add more pattern matching for other sensitive data types
    return detectedItems;
  } catch (error) {
    console.error('Error detecting sensitive data:', error);
    return [];
  }
};

export const blurSensitiveAreas = (
  canvas: HTMLCanvasElement,
  detectedItems: DetectedItem[]
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  detectedItems.forEach(item => {
    const { bbox } = item;
    const width = bbox.x1 - bbox.x0;
    const height = bbox.y1 - bbox.y0;

    // Save the current canvas state
    ctx.save();

    // Apply blur effect to the sensitive area
    ctx.filter = 'blur(10px)';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(bbox.x0, bbox.y0, width, height);

    // Restore the canvas state
    ctx.restore();
  });
};