import { createWorker } from 'tesseract.js';
import type { Worker } from 'tesseract.js';

export type SensitiveDataType = 'creditCard' | 'ssn' | 'email' | 'phone';

interface DetectedItem {
  type: SensitiveDataType;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface SensitiveDataOptions {
  enabled: boolean;
  types: SensitiveDataType[];
}

let worker: Worker | null = null;

export const initializeOCR = async () => {
  if (!worker) {
    worker = await createWorker('eng');
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
  }
  return worker;
};

export const detectSensitiveData = async (
  imageData: ImageData,
  options: SensitiveDataOptions
): Promise<DetectedItem[]> => {
  if (!options.enabled || options.types.length === 0) {
    return [];
  }

  try {
    const ocrWorker = await initializeOCR();
    if (!ocrWorker) {
      throw new Error('OCR worker not initialized');
    }

    // Convert ImageData to canvas for Tesseract
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    ctx.putImageData(imageData, 0, 0);

    const { data: { text } } = await ocrWorker.recognize(canvas);
    const detectedItems: DetectedItem[] = [];

    if (options.types.includes('creditCard')) {
      const creditCardPattern = /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g;
      const matches = text.match(creditCardPattern);
      if (matches) {
        matches.forEach(match => {
          detectedItems.push({
            type: 'creditCard',
            boundingBox: {
              x: 0,
              y: 0,
              width: 100,
              height: 20
            }
          });
        });
      }
    }

    if (options.types.includes('ssn')) {
      const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
      const matches = text.match(ssnPattern);
      if (matches) {
        matches.forEach(match => {
          detectedItems.push({
            type: 'ssn',
            boundingBox: {
              x: 0,
              y: 0,
              width: 100,
              height: 20
            }
          });
        });
      }
    }

    if (options.types.includes('email')) {
      const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      const matches = text.match(emailPattern);
      if (matches) {
        matches.forEach(match => {
          detectedItems.push({
            type: 'email',
            boundingBox: {
              x: 0,
              y: 0,
              width: 100,
              height: 20
            }
          });
        });
      }
    }

    if (options.types.includes('phone')) {
      const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
      const matches = text.match(phonePattern);
      if (matches) {
        matches.forEach(match => {
          detectedItems.push({
            type: 'phone',
            boundingBox: {
              x: 0,
              y: 0,
              width: 100,
              height: 20
            }
          });
        });
      }
    }

    return detectedItems;
  } catch (error) {
    console.error('Error detecting sensitive data:', error);
    return [];
  }
};

export const blurSensitiveAreas = (canvas: HTMLCanvasElement, detectedItems: DetectedItem[]) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  detectedItems.forEach(item => {
    const { x, y, width, height } = item.boundingBox;
    
    // Save the canvas state
    ctx.save();
    
    // Apply blur effect to the sensitive area
    ctx.filter = 'blur(10px)';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, y, width, height);
    
    // Restore the canvas state
    ctx.restore();
  });
};
