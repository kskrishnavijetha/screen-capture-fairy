import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface DownloadRecordingProps {
  recordedBlob: Blob;
  filename: string;
  onFilenameChange: (newName: string) => void;
}

export const DownloadRecording = ({
  recordedBlob,
  filename,
  onFilenameChange,
}: DownloadRecordingProps) => {
  const downloadRecording = () => {
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = `${filename}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast({
      title: "Download started",
      description: "Your recording is being downloaded"
    });
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Enter filename"
        value={filename}
        onChange={(e) => onFilenameChange(e.target.value)}
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