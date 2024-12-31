import React, { useRef, useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { BlurControls } from './video/BlurControls';
import { TrimControls } from './video/TrimControls';
import { CaptionControls, type Caption } from './video/CaptionControls';
import { CloudStorageSelector } from './cloud/CloudStorageSelector';
import { ShareControls } from './video/ShareControls';
import { EmbedControls } from './video/EmbedControls';
import { ProcessControls } from './video/ProcessControls';
import { AnnotationControls, type Annotation } from './video/AnnotationControls';
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
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [transitionType, setTransitionType] = useState<TransitionType>('none');
  const [isUploading, setIsUploading] = useState(false);
  const [editedBlob, setEditedBlob] = useState<Blob | null>(null);
  const currentBlob = editedBlob || recordedBlob;

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
        
        // Apply effects
        blurRegions.forEach(region => {
          const imageData = outputCtx.getImageData(region.x, region.y, region.width, region.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = 0;
            imageData.data[i + 1] = 0;
            imageData.data[i + 2] = 0;
          }
          outputCtx.putImageData(imageData, region.x, region.y);
        });

        // Add captions and annotations
        const currentTime = videoRef.current.currentTime;
        
        // Draw captions
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

        // Draw annotations
        const activeAnnotation = annotations.find(
          annotation => Math.abs(currentTime - annotation.timestamp) < 0.5
        );

        if (activeAnnotation) {
          outputCtx.font = '18px Arial';
          outputCtx.fillStyle = 'yellow';
          outputCtx.strokeStyle = 'black';
          outputCtx.lineWidth = 1;
          const text = `${activeAnnotation.author}: ${activeAnnotation.text}`;
          const textMetrics = outputCtx.measureText(text);
          const x = (outputCanvas.width - textMetrics.width) / 2;
          const y = 30;
          
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

      <AnnotationControls
        duration={duration}
        annotations={annotations}
        onAnnotationsChange={setAnnotations}
      />

      <CloudStorageSelector
        onUpload={(provider) => {
          setIsUploading(true);
          setTimeout(() => setIsUploading(false), 1500);
        }}
        isUploading={isUploading}
      />

      <ShareControls recordedBlob={recordedBlob} />
      <EmbedControls recordedBlob={recordedBlob} />

      <ProcessControls onProcess={handleProcess} />
    </div>
  );
};