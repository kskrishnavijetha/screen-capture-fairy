import { createWorker, Worker } from 'tesseract.js';

// Regular expressions for sensitive data patterns
const patterns = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  phone: /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/,
  creditCard: /\b\d{4}[-. ]?\d{4}[-. ]?\d{4}[-. ]?\d{4}\b/,
  ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/
};

export type SensitiveDataType = keyof typeof patterns;

export interface DetectionSettings {
  enabled: boolean;
  types: SensitiveDataType[];
}

let worker: Worker | null = null;

export const initializeOCR = async () => {
  if (!worker) {
    worker = await createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
  }
  return worker;
};

export const detectSensitiveData = async (
  imageData: ImageData,
  settings: DetectionSettings
): Promise<{ type: SensitiveDataType; text: string; bounds: any }[]> => {
  if (!settings.enabled || settings.types.length === 0) {
    return [];
  }

  try {
    const worker = await initializeOCR();
    // Convert ImageData to a format Tesseract can handle
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
    
    ctx.putImageData(imageData, 0, 0);
    
    const { data: { text, blocks } } = await worker.recognize(canvas);

    const detectedItems: { type: SensitiveDataType; text: string; bounds: any }[] = [];

    blocks.forEach(block => {
      const blockText = block.text;
      settings.types.forEach(type => {
        const pattern = patterns[type];
        const matches = blockText.match(pattern);
        if (matches) {
          detectedItems.push({
            type,
            text: matches[0],
            bounds: block.bbox
          });
        }
      });
    });

    return detectedItems;
  } catch (error) {
    console.error('Error detecting sensitive data:', error);
    return [];
  }
};

export const blurSensitiveAreas = (
  canvas: HTMLCanvasElement,
  detectedItems: { type: SensitiveDataType; text: string; bounds: any }[]
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  detectedItems.forEach(item => {
    const { bounds } = item;
    const { x0, y0, x1, y1 } = bounds;
    
    // Save the current canvas state
    ctx.save();
    
    // Apply a blur effect to the sensitive area
    ctx.filter = 'blur(8px)';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    
    // Restore the canvas state
    ctx.restore();
  });
};