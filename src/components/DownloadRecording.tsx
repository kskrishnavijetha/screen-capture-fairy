import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface DownloadRecordingProps {
  recordedBlob: Blob;
  filename?: string;
  onFilenameChange?: (newName: string) => void;
}

export const DownloadRecording = ({
  recordedBlob,
  filename = 'recording',
  onFilenameChange = () => {},
}: DownloadRecordingProps) => {
  const [localFilename, setLocalFilename] = useState(filename);

  const handleFilenameChange = (newName: string) => {
    setLocalFilename(newName);
    onFilenameChange(newName);
  };

  const downloadRecording = () => {
    try {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style.display = 'none';
      a.href = url;
      a.download = `${localFilename}.webm`;
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: "Download started",
        description: "Your recording is being downloaded"
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "There was an error downloading your recording"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Enter filename"
        value={localFilename}
        onChange={(e) => handleFilenameChange(e.target.value)}
        className="w-full"
      />
      <Button
        onClick={downloadRecording}
        variant="outline"
        className="w-full bg-green-500 text-white hover:bg-green-600"
      >
        <Download className="mr-2 h-5 w-5" />
        Download Recording
      </Button>
    </div>
  );
};