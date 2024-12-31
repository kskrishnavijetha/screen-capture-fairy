import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Scissors } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { BlurControls } from './video/BlurControls';
import { TrimControls } from './video/TrimControls';

interface VideoEditorProps {
  recordedBlob: Blob | null;
  onSave: (newBlob: Blob) => void;
}

export const VideoEditor = ({ recordedBlob, onSave }: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [trimRange, setTrimRange] = useState([0, 100]);
  const [blurRegions, setBlurRegions] = useState<Array<{ x: number, y: number, width: number, height: number }>>([]);

  useEffect(() => {
    if (videoRef.current && recordedBlob) {
      videoRef.current.src = URL.createObjectURL(recordedBlob);
      videoRef.current.onloadedmetadata = () => {
        setDuration(videoRef.current?.duration || 0);
      };
    }
  }, [recordedBlob]);

  const handleTrimRangeChange = (newRange: number[]) => {
    setTrimRange(newRange);
    if (videoRef.current && duration > 0) {
      const newTime = (newRange[0] / 100) * duration;
      if (isFinite(newTime)) {
        videoRef.current.currentTime = newTime;
      }
    }
  };

  const handleProcess = async () => {
    if (!recordedBlob || !videoRef.current) return;

    try {
      const startTime = (trimRange[0] / 100) * duration;
      const endTime = (trimRange[1] / 100) * duration;

      const outputCanvas = document.createElement('canvas');
      const outputCtx = outputCanvas.getContext('2d');
      if (!outputCtx) return;

      outputCanvas.width = videoRef.current.videoWidth;
      outputCanvas.height = videoRef.current.videoHeight;

      const mediaStream = outputCanvas.captureStream();
      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: recordedBlob.type,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const newBlob = new Blob(chunks, { type: recordedBlob.type });
        onSave(newBlob);
        toast({
          title: "Video processed successfully",
          description: "Your video has been trimmed and blurred according to your selections.",
        });
      };

      videoRef.current.currentTime = startTime;
      mediaRecorder.start();
      
      const processFrame = () => {
        if (!videoRef.current || !outputCtx) return;
        
        outputCtx.drawImage(videoRef.current, 0, 0);
        
        // Apply blur effect to selected regions
        blurRegions.forEach(region => {
          const imageData = outputCtx.getImageData(region.x, region.y, region.width, region.height);
          // Simple box blur implementation
          for (let i = 0; i < imageData.data.length; i += 4) {
            const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
            imageData.data[i] = avg;
            imageData.data[i + 1] = avg;
            imageData.data[i + 2] = avg;
          }
          outputCtx.putImageData(imageData, region.x, region.y);
        });

        if (videoRef.current.currentTime < endTime) {
          requestAnimationFrame(processFrame);
        } else {
          mediaRecorder.stop();
          videoRef.current.pause();
        }
      };

      videoRef.current.play();
      processFrame();

    } catch (error) {
      toast({
        title: "Error processing video",
        description: "There was an error while processing your video. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!recordedBlob) return null;

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto mt-6">
      <div className="relative rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="w-full"
          controls
        />
        <BlurControls
          videoRef={videoRef}
          blurRegions={blurRegions}
          setBlurRegions={setBlurRegions}
        />
      </div>

      <TrimControls
        duration={duration}
        trimRange={trimRange}
        onTrimRangeChange={handleTrimRangeChange}
      />

      <Button onClick={handleProcess} className="w-full">
        <Scissors className="w-4 h-4 mr-2" />
        Process Video
      </Button>
    </div>
  );
};