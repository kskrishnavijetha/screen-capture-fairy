import React, { useRef, useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { BlurControls } from './video/BlurControls';
import { TrimControls } from './video/TrimControls';
import { CaptionControls, type Caption } from './video/CaptionControls';
import { ShareControls } from './video/ShareControls';
import { EmbedControls } from './video/EmbedControls';
import { ExportControls } from './video/ExportControls';
import { ProcessControls } from './video/ProcessControls';
import { AnnotationControls, type Annotation } from './video/AnnotationControls';
import { WatermarkControls, type Watermark } from './video/WatermarkControls';
import { processVideoFrame } from './video/VideoProcessing';
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

  const [watermark, setWatermark] = useState<Watermark | null>(null);

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
      outputCanvas.width = videoRef.current.videoWidth;
      outputCanvas.height = videoRef.current.videoHeight;
      const outputCtx = outputCanvas.getContext('2d');
      if (!outputCtx) return;

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
          description: "Your video has been processed with all selected effects and tools.",
        });
      };

      videoRef.current.currentTime = startTime;
      mediaRecorder.start();
      
      // Create watermark image if needed
      let watermarkImg: HTMLImageElement | null = null;
      if (watermark) {
        watermarkImg = new Image();
        watermarkImg.src = watermark.image;
        await new Promise((resolve) => {
          watermarkImg!.onload = resolve;
        });
      }
      
      const processFrame = () => {
        if (!videoRef.current || !outputCtx) return;
        
        const progress = (videoRef.current.currentTime - startTime) / (endTime - startTime);
        
        processVideoFrame({
          videoRef,
          transitionType,
          blurRegions,
          captions,
          annotations,
          watermark: watermark ? { ...watermark, image: watermarkImg! } : null,
          timestamps: [],  // Add this from MediaPlayer component
          trimRange
        }, outputCtx, progress);

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

      <WatermarkControls
        watermark={watermark}
        onWatermarkChange={setWatermark}
      />

      <ShareControls recordedBlob={recordedBlob} />
      <EmbedControls recordedBlob={recordedBlob} />
      <ExportControls recordedBlob={recordedBlob} />

      <ProcessControls onProcess={handleProcess} />
    </div>
  );
};