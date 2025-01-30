import { pipeline } from "@huggingface/transformers";
import { toast } from "@/components/ui/use-toast";

// Regular expressions for sensitive data
const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
  creditCard: /\b\d{4}[-. ]?\d{4}[-. ]?\d{4}[-. ]?\d{4}\b/,
  ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/
};

export type DetectionRule = {
  type: keyof typeof PATTERNS;
  enabled: boolean;
  customPattern?: string;
};

let detector: any = null;

export const initializeDetector = async () => {
  try {
    detector = await pipeline(
      "object-detection",
      "Xenova/detr-resnet-50",
      { device: "webgpu" }
    );
    console.log("Object detector initialized");
  } catch (error) {
    console.error("Error initializing detector:", error);
    toast({
      title: "Detection Error",
      description: "Failed to initialize object detection. Some privacy features may be unavailable.",
      variant: "destructive"
    });
  }
};

export const detectAndBlurSensitiveInfo = async (
  canvas: HTMLCanvasElement,
  rules: DetectionRule[]
) => {
  if (!detector) {
    await initializeDetector();
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Get image data for text detection
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  try {
    // Detect objects and text regions
    const detections = await detector(canvas);
    
    // Process each detected region
    for (const detection of detections) {
      const [x, y, width, height] = detection.box;
      
      // Extract text from region using canvas
      const regionCanvas = document.createElement('canvas');
      const regionCtx = regionCanvas.getContext('2d');
      if (!regionCtx) continue;
      
      regionCanvas.width = width;
      regionCanvas.height = height;
      regionCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
      
      // Check for sensitive information in the region
      const shouldBlur = rules.some(rule => {
        if (!rule.enabled) return false;
        const pattern = rule.customPattern ? 
          new RegExp(rule.customPattern) : 
          PATTERNS[rule.type];
        return pattern.test(detection.text || '');
      });
      
      if (shouldBlur) {
        // Apply blur effect to the region
        ctx.filter = 'blur(10px)';
        ctx.drawImage(canvas, x, y, width, height, x, y, width, height);
        ctx.filter = 'none';
      }
    }
  } catch (error) {
    console.error("Error in detection:", error);
  }
};