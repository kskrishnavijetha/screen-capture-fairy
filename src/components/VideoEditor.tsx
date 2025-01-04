import React, { useRef, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { BlurControls } from './video/BlurControls';
import { TrimControls } from './video/TrimControls';
import { CaptionControls } from './video/CaptionControls';
import { ShareControls } from './video/ShareControls';
import { EmbedControls } from './video/EmbedControls';
import { ExportControls } from './video/ExportControls';
import { ProcessControls } from './video/ProcessControls';
import { AnnotationControls } from './video/AnnotationControls';
import { WatermarkControls } from './video/WatermarkControls';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVideoProcessing } from '@/hooks/useVideoProcessing';

interface VideoEditorProps {
  recordedBlob: Blob | null;
  timestamps: Array<{ time: number; label: string }>;
  onSave: (newBlob: Blob) => void;
}

type TransitionType = 'none' | 'fade' | 'crossfade';

export const VideoEditor = ({ recordedBlob, timestamps, onSave }: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [trimRange, setTrimRange] = useState([0, 100]);
  const [blurRegions, setBlurRegions] = useState<Array<{ x: number, y: number, width: number, height: number }>>([]);
  const [captions, setCaptions] = useState<Array<{ startTime: number; endTime: number; text: string }>>([]);
  const [annotations, setAnnotations] = useState<Array<{ id: string; timestamp: number; text: string; author: string }>>([]);
  const [transitionType, setTransitionType] = useState<TransitionType>('none');
  const [watermark, setWatermark] = useState<any>(null);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const { isProcessing, processVideo } = useVideoProcessing();

  useEffect(() => {
    if (videoRef.current && recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      videoRef.current.src = url;
      
      const handleMetadataLoaded = () => {
        console.log('Video metadata loaded in VideoEditor');
        setDuration(videoRef.current?.duration || 0);
        setIsMetadataLoaded(true);
      };

      videoRef.current.onloadedmetadata = handleMetadataLoaded;

      // If metadata is already loaded, call the handler immediately
      if (videoRef.current.readyState >= 1) {
        handleMetadataLoaded();
      }

      return () => {
        URL.revokeObjectURL(url);
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = null;
        }
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
    if (!recordedBlob) {
      toast({
        title: "Error",
        description: "No video to process",
        variant: "destructive",
      });
      return;
    }

    if (!isMetadataLoaded) {
      toast({
        title: "Error",
        description: "Please wait for video to load completely",
        variant: "destructive",
      });
      return;
    }

    try {
      const processedBlob = await processVideo({
        recordedBlob,
        videoRef,
        transitionType,
        blurRegions,
        captions,
        annotations,
        watermark,
        timestamps,
        trimRange,
        duration
      });

      onSave(processedBlob);
      toast({
        title: "Success",
        description: "Video processing completed",
      });
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Error processing video",
        description: error instanceof Error ? error.message : "There was an error while processing your video. Please try again.",
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

      <ProcessControls 
        onProcess={handleProcess} 
        isProcessing={isProcessing}
      />
    </div>
  );
};