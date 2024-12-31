import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExportControlsProps {
  recordedBlob: Blob;
}

type ExportFormat = 'webm' | 'mp4' | 'gif' | 'avi';

export const ExportControls = ({ recordedBlob }: ExportControlsProps) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('webm');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!recordedBlob) return;

    setIsExporting(true);
    try {
      // Create a MediaSource
      const mediaSource = new MediaSource();
      const url = URL.createObjectURL(mediaSource);
      const video = document.createElement('video');
      video.src = url;

      mediaSource.addEventListener('sourceopen', async () => {
        const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8,opus"');
        
        // Convert the blob to ArrayBuffer
        const arrayBuffer = await recordedBlob.arrayBuffer();
        sourceBuffer.addEventListener('updateend', () => {
          mediaSource.endOfStream();
          
          // Create a MediaRecorder with the desired format
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const stream = canvas.captureStream();
          
          const options: MediaRecorderOptions = {
            mimeType: `video/${selectedFormat}`
          };
          
          const mediaRecorder = new MediaRecorder(stream, options);
          const chunks: BlobPart[] = [];
          
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };
          
          mediaRecorder.onstop = () => {
            const exportedBlob = new Blob(chunks, { type: `video/${selectedFormat}` });
            const downloadUrl = URL.createObjectURL(exportedBlob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `recording.${selectedFormat}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
            
            setIsExporting(false);
            toast({
              title: "Export Complete",
              description: `Your video has been exported as ${selectedFormat.toUpperCase()}`
            });
          };
          
          // Start recording the converted format
          mediaRecorder.start();
          
          // Draw video frames to canvas
          video.addEventListener('play', function() {
            function drawFrame() {
              if (video.paused || video.ended) return;
              ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
              requestAnimationFrame(drawFrame);
            }
            drawFrame();
          });
          
          video.play();
          
          // Stop recording after video duration
          setTimeout(() => {
            mediaRecorder.stop();
          }, video.duration * 1000);
        });
        
        sourceBuffer.appendBuffer(arrayBuffer);
      });
    } catch (error) {
      console.error('Export error:', error);
      setIsExporting(false);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: `Failed to export as ${selectedFormat.toUpperCase()}. This format might not be supported by your browser.`
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Select
          value={selectedFormat}
          onValueChange={(value: ExportFormat) => setSelectedFormat(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="webm">WebM</SelectItem>
            <SelectItem value="mp4">MP4</SelectItem>
            <SelectItem value="gif">GIF</SelectItem>
            <SelectItem value="avi">AVI</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleExport}
          disabled={isExporting || !recordedBlob}
          variant="outline"
          className="flex-1"
        >
          <FileDown className="w-4 h-4 mr-2" />
          {isExporting ? "Exporting..." : "Export Recording"}
        </Button>
      </div>
    </div>
  );
};