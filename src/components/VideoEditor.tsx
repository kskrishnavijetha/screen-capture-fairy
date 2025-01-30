import React, { useRef, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch"; // Add this import
import { ShareControls } from './video/ShareControls';
import { EmbedControls } from './video/EmbedControls';
import { ExportControls } from './video/ExportControls';
import { SilenceControls } from './video/SilenceControls';
import { FillerWordControls } from './video/FillerWordControls';
import { EmotionDetection } from './video/EmotionDetection';
import { KeyMomentsView } from './video/KeyMomentsView';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';
import { Separator } from './ui/separator';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Wand2 } from 'lucide-react';

interface VideoEditorProps {
  recordedBlob: Blob | null;
  timestamps: Array<{ time: number; label: string }>;
  onSave: (newBlob: Blob) => void;
  transcription?: string;
}

export const VideoEditor = ({ 
  recordedBlob, 
  timestamps, 
  onSave,
  transcription = '' 
}: VideoEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [removeSilences, setRemoveSilences] = useState(false);
  const [removeFillerWords, setRemoveFillerWords] = useState(false);
  const [autoTransitions, setAutoTransitions] = useState(false);
  const [speedAdjustment, setSpeedAdjustment] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const { isProcessing, progress, processVideo } = useVideoProcessing();

  useEffect(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      setVideoUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [recordedBlob]);

  const handleMetadataLoaded = (videoDuration: number) => {
    setDuration(videoDuration);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleHighlightClick = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleProcessVideo = async () => {
    if (!recordedBlob) return;

    try {
      const processedBlob = await processVideo(recordedBlob, {
        removeSilences,
        removeFillerWords,
        autoTransitions,
        speedAdjustment
      });
      
      onSave(processedBlob);
      toast({
        title: "Video processed successfully",
        description: "Your video has been enhanced with AI editing features.",
      });
    } catch (error) {
      console.error('Error processing video:', error);
      toast({
        title: "Processing failed",
        description: "There was an error processing your video. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!recordedBlob) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Video Preview */}
      <div className="space-y-6">
        <Card className="p-4">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full"
              controls
              playsInline
              onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => handleMetadataLoaded(e.currentTarget.duration)}
              autoPlay={false}
              muted={false}
            />
          </div>
        </Card>
        
        <EmotionDetection
          videoId={videoUrl || ''}
          currentTime={currentTime}
          onHighlightClick={handleHighlightClick}
          transcription={transcription}
        />

        <KeyMomentsView
          videoId={videoUrl || ''}
          currentTime={currentTime}
          onHighlightClick={handleHighlightClick}
          transcription={transcription}
        />
      </div>

      {/* Controls */}
      <div className="space-y-6">
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Video Enhancement</h3>
            <div className="space-y-4">
              <SilenceControls
                enabled={removeSilences}
                onToggle={setRemoveSilences}
              />
              <FillerWordControls
                enabled={removeFillerWords}
                onToggle={setRemoveFillerWords}
              />
              
              {/* New Auto-Editing Controls */}
              <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border bg-card">
                <div className="flex items-center space-x-3">
                  <Wand2 className="h-5 w-5 text-muted-foreground" />
                  <span>Smart Transitions</span>
                </div>
                <Switch
                  checked={autoTransitions}
                  onCheckedChange={setAutoTransitions}
                />
              </div>

              <div className="flex items-center justify-between space-x-4 p-4 rounded-lg border bg-card">
                <div className="flex items-center space-x-3">
                  <Wand2 className="h-5 w-5 text-muted-foreground" />
                  <span>Dynamic Speed</span>
                </div>
                <Switch
                  checked={speedAdjustment}
                  onCheckedChange={setSpeedAdjustment}
                />
              </div>

              {/* Process Button */}
              <Button 
                className="w-full"
                onClick={handleProcessVideo}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Process Video'}
              </Button>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground text-center">
                    {progress}% complete
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Share & Export</h3>
            <div className="space-y-4">
              <ShareControls recordedBlob={recordedBlob} />
              <EmbedControls recordedBlob={recordedBlob} />
              <ExportControls recordedBlob={recordedBlob} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};