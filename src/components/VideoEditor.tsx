import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Scissors } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { BlurControls } from './video/BlurControls';
import { TrimControls } from './video/TrimControls';
import { CaptionControls, type Caption } from './video/CaptionControls';
import { CloudStorageSelector } from './cloud/CloudStorageSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VideoEditorProps {
  recordedBlob: Blob | null;
  onSave: (newBlob: Blob) => void;
}

type TransitionType = 'none' | 'fade' | 'crossfade';

export const VideoEditor = ({ recordedBlob, onSave }: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [trimRange, setTrimRange] = useState([0, 100]);
  const [blurRegions, setBlurRegions] = useState<Array<{ x: number, y: number, width: number, height: number }>>([]);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [transitionType, setTransitionType] = useState<TransitionType>('none');
  const [clips, setClips] = useState<Blob[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const splitClip = async () => {
    if (!videoRef.current || !recordedBlob) return;
    
    const currentTime = videoRef.current.currentTime;
    const blob = await fetch(URL.createObjectURL(recordedBlob)).then(r => r.blob());
    
    setClips(prevClips => [...prevClips, blob]);
    toast({
      title: "Clip added",
      description: "Video clip has been added to the timeline.",
    });
  };

  const applyTransition = (ctx: CanvasRenderingContext2D, progress: number) => {
    switch (transitionType) {
      case 'fade':
        ctx.globalAlpha = progress;
        break;
      case 'crossfade':
        ctx.globalAlpha = Math.sin(progress * Math.PI / 2);
        break;
      default:
        ctx.globalAlpha = 1;
    }
  };

  const handleCloudUpload = async (provider: string) => {
    setIsUploading(true);
    try {
      // Simulated upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsUploading(false);
    } catch (error) {
      setIsUploading(false);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading to cloud storage.",
      });
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
          description: "Your video has been processed with the selected effects and transitions.",
        });
      };

      videoRef.current.currentTime = startTime;
      mediaRecorder.start();
      
      const processFrame = () => {
        if (!videoRef.current || !outputCtx) return;
        
        const progress = (videoRef.current.currentTime - startTime) / (endTime - startTime);
        applyTransition(outputCtx, progress);
        
        outputCtx.drawImage(videoRef.current, 0, 0);
        
        // Apply blur effect to selected regions
        blurRegions.forEach(region => {
          const imageData = outputCtx.getImageData(region.x, region.y, region.width, region.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
            imageData.data[i] = 0; // Set to black
            imageData.data[i + 1] = 0;
            imageData.data[i + 2] = 0;
          }
          outputCtx.putImageData(imageData, region.x, region.y);
        });

        // Add captions
        const currentTime = videoRef.current.currentTime;
        const activeCaption = captions.find(
          caption => currentTime >= caption.startTime && currentTime <= caption.endTime
        );

        if (activeCaption) {
          outputCtx.font = '24px Arial';
          outputCtx.fillStyle = 'white';
          outputCtx.strokeStyle = 'black';
          outputCtx.lineWidth = 2;
          const text = activeCaption.text;
          const textMetrics = outputCtx.measureText(text);
          const x = (outputCanvas.width - textMetrics.width) / 2;
          const y = outputCanvas.height - 50;
          
          outputCtx.strokeText(text, x, y);
          outputCtx.fillText(text, x, y);
        }

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

      <div className="space-y-2">
        <label className="text-sm font-medium">Transition Effect</label>
        <Select
          value={transitionType}
          onValueChange={(value: TransitionType) => setTransitionType(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select transition type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="fade">Fade</SelectItem>
            <SelectItem value="crossfade">Cross Fade</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={splitClip} variant="secondary" className="w-full">
        Split Clip
      </Button>

      <TrimControls
        duration={duration}
        trimRange={trimRange}
        onTrimRangeChange={handleTrimRangeChange}
      />

      <CaptionControls
        duration={duration}
        captions={captions}
        onCaptionsChange={setCaptions}
      />

      <CloudStorageSelector
        onUpload={handleCloudUpload}
        isUploading={isUploading}
      />

      <Button onClick={handleProcess} className="w-full">
        <Scissors className="w-4 h-4 mr-2" />
        Process Video
      </Button>
    </div>
  );
};
