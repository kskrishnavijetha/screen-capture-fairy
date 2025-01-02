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
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFilenameChange = (newName: string) => {
    setLocalFilename(newName);
    onFilenameChange(newName);
  };

  const downloadRecording = async () => {
    if (!recordedBlob) {
      toast({
        variant: "destructive",
        title: "Download error",
        description: "No recording available to download"
      });
      return;
    }

    try {
      setIsDownloading(true);
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${localFilename}.webm`;
      
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsDownloading(false);
      }, 100);

      toast({
        title: "Download started",
        description: "Your recording is being downloaded"
      });
    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
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
        disabled={isDownloading}
      />
      <Button
        onClick={downloadRecording}
        variant="outline"
        className="w-full bg-green-500 text-white hover:bg-green-600"
        disabled={isDownloading}
      >
        <Download className="mr-2 h-5 w-5" />
        {isDownloading ? 'Downloading...' : 'Download Recording'}
      </Button>
    </div>
  );
};