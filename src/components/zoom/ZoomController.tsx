import React, { useEffect, useRef, useState } from 'react';
import { pipeline } from "@huggingface/transformers";
import { useIsMobile } from "@/hooks/use-mobile";

interface ZoomControllerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isRecording: boolean;
}

export const ZoomController: React.FC<ZoomControllerProps> = ({ videoRef, isRecording }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const gestureStartRef = useRef<{ distance: number; scale: number } | null>(null);
  const isMobile = useIsMobile();
  const [objectDetector, setObjectDetector] = useState<any>(null);

  // Initialize object detection model
  useEffect(() => {
    const initObjectDetection = async () => {
      try {
        const detector = await pipeline(
          "object-detection",
          "Xenova/detr-resnet-50",
          { device: "cpu" } // Use CPU for compatibility
        );
        setObjectDetector(detector);
        console.log("Object detection model loaded");
      } catch (error) {
        console.error("Error loading object detection model:", error);
      }
    };

    if (isRecording) {
      initObjectDetection();
    }

    return () => {
      setObjectDetector(null);
    };
  }, [isRecording]);

  // Handle pinch-to-zoom gestures
  useEffect(() => {
    if (!containerRef.current || !isMobile) return;

    const container = containerRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        gestureStartRef.current = { distance, scale };
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && gestureStartRef.current) {
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const newScale = (distance / gestureStartRef.current.distance) * gestureStartRef.current.scale;
        setScale(Math.min(Math.max(newScale, 1), 3));
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      gestureStartRef.current = null;
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale, isMobile]);

  // Track mouse activity and adjust zoom
  useEffect(() => {
    if (!isRecording || !videoRef.current) return;

    const handleMouseMove = async (e: MouseEvent) => {
      if (!objectDetector || !videoRef.current) return;

      try {
        // Get mouse position relative to video
        const rect = videoRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        // Only process every few frames for performance
        if (Math.random() > 0.1) return;

        // Ensure srcObject is a MediaStream before accessing video tracks
        const mediaStream = videoRef.current.srcObject as MediaStream;
        if (!mediaStream || !mediaStream.getVideoTracks) return;

        // Capture current frame
        const videoTrack = mediaStream.getVideoTracks()[0];
        if (!videoTrack) return;

        const imageCapture = new ImageCapture(videoTrack);
        const frame = await imageCapture.grabFrame();

        // Detect objects in frame
        const results = await objectDetector(frame, {
          threshold: 0.5,
          overlap: 0.5,
        });

        // Find closest object to mouse position
        if (results && results.length > 0) {
          const closestObject = results.reduce((prev: any, curr: any) => {
            const prevDist = Math.hypot(prev.box.xmin - x, prev.box.ymin - y);
            const currDist = Math.hypot(curr.box.xmin - x, curr.box.ymin - y);
            return currDist < prevDist ? curr : prev;
          });

          // Smoothly adjust zoom and position
          const targetScale = 1.5;
          const targetX = -(closestObject.box.xmin * 100);
          const targetY = -(closestObject.box.ymin * 100);

          setScale((prev) => prev + (targetScale - prev) * 0.1);
          setPosition((prev) => ({
            x: prev.x + (targetX - prev.x) * 0.1,
            y: prev.y + (targetY - prev.y) * 0.1,
          }));
        }
      } catch (error) {
        console.error("Error processing frame:", error);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isRecording, objectDetector]);

  if (!isRecording) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        transform: `scale(${scale}) translate(${position.x}%, ${position.y}%)`,
        transition: 'transform 0.2s ease-out',
      }}
    >
      {videoRef.current && (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ transform: `scale(${1 / scale})` }}
        />
      )}
    </div>
  );
};