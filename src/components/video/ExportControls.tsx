import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

type ExportFormat = 'webm' | 'mp4' | 'gif' | 'avi';

interface ExportControlsProps {
  recordedBlob: Blob;
}

export const ExportControls = ({ recordedBlob }: ExportControlsProps) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('webm');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);
    
    try {
      // For now, we'll simulate the conversion process
      // In a real implementation, you would use ffmpeg-wasm to convert the video
      await simulateConversion();
      
      // Create download link
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style.display = 'none';
      a.href = url;
      a.download = `recording.${selectedFormat}`;
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export successful",
        description: `Your recording has been exported as ${selectedFormat.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting your recording.",
      });
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  // Simulate conversion progress
  const simulateConversion = async () => {
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Export Format</label>
        <Select
          value={selectedFormat}
          onValueChange={(value: ExportFormat) => setSelectedFormat(value)}
          disabled={isExporting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select export format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="webm">WebM</SelectItem>
            <SelectItem value="mp4">MP4</SelectItem>
            <SelectItem value="gif">GIF</SelectItem>
            <SelectItem value="avi">AVI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isExporting && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center text-muted-foreground">
            Converting... {progress}%
          </p>
        </div>
      )}

      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full"
        variant="outline"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <FileDown className="w-4 h-4 mr-2" />
            Export Recording
          </>
        )}
      </Button>
    </div>
  );
};