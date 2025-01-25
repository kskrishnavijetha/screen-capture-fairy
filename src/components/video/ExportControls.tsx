import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FileDown, Loader2, Lock } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { generateEncryptionKey, encryptBlob, saveEncryptedRecording } from '@/utils/encryption';

type ExportFormat = 'webm' | 'mp4' | 'gif' | 'avi';

interface ExportControlsProps {
  recordedBlob: Blob;
}

export const ExportControls = ({ recordedBlob }: ExportControlsProps) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('webm');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [filename, setFilename] = useState(`recording-${Date.now()}`);
  const [exportError, setExportError] = useState<string | null>(null);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
  };

  const resetExportState = () => {
    setIsExporting(false);
    setProgress(0);
    setExportError(null);
  };

  const handleExport = async () => {
    if (!recordedBlob || recordedBlob.size === 0) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Invalid recording data. Please try recording again.",
      });
      return;
    }

    if (isPasswordProtected) {
      try {
        validatePassword(password);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Invalid password",
          description: error instanceof Error ? error.message : "Please enter a valid password",
        });
        return;
      }
    }

    setIsExporting(true);
    setProgress(0);
    setExportError(null);
    
    try {
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);
      
      if (isPasswordProtected) {
        // Create a copy of the blob
        const blobCopy = new Blob([await recordedBlob.arrayBuffer()], { type: recordedBlob.type });
        
        if (blobCopy.size === 0) {
          throw new Error('Invalid blob data');
        }

        const key = await generateEncryptionKey(password);
        const { encryptedData, iv } = await encryptBlob(blobCopy, key);
        
        if (!encryptedData || encryptedData.byteLength === 0) {
          throw new Error('Encryption failed - invalid data');
        }
        
        await saveEncryptedRecording(encryptedData, iv, filename);
        
        clearInterval(progressInterval);
        setProgress(100);
        
        toast({
          title: "Recording encrypted and saved",
          description: "Your recording has been securely stored with password protection",
        });
      } else {
        const url = URL.createObjectURL(recordedBlob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `${filename}.${selectedFormat}`;
        
        await a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resetExportState();
        }, 100);

        clearInterval(progressInterval);
        setProgress(100);

        toast({
          title: "Export successful",
          description: `Your recording has been exported as ${selectedFormat.toUpperCase()}`,
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportError('There was an error exporting your recording. Please try again.');
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting your recording. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {exportError && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
          {exportError}
        </div>
      )}
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Filename</label>
        <Input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          disabled={isExporting}
          placeholder="Enter filename"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Export Format</label>
        <Select
          value={selectedFormat}
          onValueChange={(value: ExportFormat) => setSelectedFormat(value)}
          disabled={isExporting || isPasswordProtected}
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

      <div className="flex items-center justify-between space-x-2">
        <label className="text-sm font-medium">Password Protection</label>
        <Switch
          checked={isPasswordProtected}
          onCheckedChange={setIsPasswordProtected}
          disabled={isExporting}
        />
      </div>

      {isPasswordProtected && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            placeholder="Enter password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isExporting}
          />
        </div>
      )}

      {isExporting && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center text-muted-foreground">
            {isPasswordProtected ? 'Encrypting...' : 'Converting...'} {progress}%
          </p>
        </div>
      )}

      <Button
        onClick={handleExport}
        disabled={isExporting || (isPasswordProtected && !password)}
        className="w-full"
        variant="outline"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {isPasswordProtected ? 'Encrypting...' : 'Exporting...'}
          </>
        ) : (
          <>
            {isPasswordProtected ? <Lock className="w-4 h-4 mr-2" /> : <FileDown className="w-4 h-4 mr-2" />}
            {isPasswordProtected ? 'Save Encrypted Recording' : 'Export Recording'}
          </>
        )}
      </Button>
    </div>
  );
};