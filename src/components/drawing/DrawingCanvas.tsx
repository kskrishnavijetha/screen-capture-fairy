import React, { useEffect, useRef, useState } from 'react';
import { detectAndBlurSensitiveInfo, DetectionRule } from '@/utils/objectDetection';
import { SensitiveInfoControls } from '../video/SensitiveInfoControls';

interface DrawingCanvasProps {
  videoId: string;
  isRecording: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  videoId,
  isRecording
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rules, setRules] = useState<DetectionRule[]>([
    { type: 'email', enabled: true },
    { type: 'phone', enabled: true },
    { type: 'creditCard', enabled: true },
    { type: 'ssn', enabled: true }
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isRecording) return;

    const processFrame = async () => {
      if (rules.some(rule => rule.enabled)) {
        await detectAndBlurSensitiveInfo(canvas, rules);
      }
      requestAnimationFrame(processFrame);
    };

    processFrame();
  }, [isRecording, rules]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 50 }}
      />
      {isRecording && (
        <div className="absolute top-4 right-4 z-50">
          <SensitiveInfoControls
            rules={rules}
            onChange={setRules}
          />
        </div>
      )}
    </div>
  );
};