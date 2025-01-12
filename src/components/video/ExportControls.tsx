import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FileDown, Loader2, Lock, Save } from 'lucide-react';
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

  const handleExport = async () => {
    if (!recordedBlob || recordedBlob.size === 0) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Invalid recording data. Please try recording again.",
      });
      return;
    }

    if (isPasswordProtected && !password) {
      toast({
        variant: "destructive",
        title: "Password required",
        description: "Please enter a password to protect your recording",
      });
      return;
    }

    setIsExporting(true);
    setProgress(0);
    
    try {
      await simulateConversion();
      
      if (isPasswordProtected) {
        try {
          // Create a copy of the blob to ensure it's valid
          const blobCopy = new Blob([await recordedBlob.arrayBuffer()], { type: recordedBlob.type });
          
          if (blobCopy.size === 0) {
            throw new Error('Invalid blob data');
          }

          const key = await generateEncryptionKey(password);
          const { encryptedData, iv } = await encryptBlob(blobCopy, key);
          
          // Ensure the encrypted data is valid
          if (!encryptedData || encryptedData.byteLength === 0) {
            throw new Error('Encryption failed - invalid data');
          }
          
          await saveEncryptedRecording(encryptedData, iv, filename);
          
          toast({
            title: "Recording encrypted and saved",
            description: "Your recording has been securely stored with password protection",
          });
        } catch (error) {
          console.error('Encryption error:', error);
          throw new Error('Failed to encrypt and save recording');
        }
      } else {
        // Create a copy of the blob to ensure it's valid
        const blobCopy = new Blob([await recordedBlob.arrayBuffer()], { type: recordedBlob.type });
        
        if (blobCopy.size === 0) {
          throw new Error('Invalid blob data');
        }

        const url = URL.createObjectURL(blobCopy);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `${filename}.${selectedFormat}`;
        
        try {
          await a.click();
          URL.revokeObjectURL(url);
          document.body.removeChild(a);

          toast({
            title: "Export successful",
            description: `Your recording has been exported as ${selectedFormat.toUpperCase()}`,
          });
        } catch (error) {
          throw new Error('Failed to trigger download');
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting your recording. Please try again.",
      });
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  const simulateConversion = async () => {
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  return (
    <div className="space-y-4">
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

      <div className="flex items-center justify-between space-x-2">
        <label className="text-sm font-medium">Password Protection & Encrypted Storage</label>
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
            placeholder="Enter password"
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
        disabled={isExporting}
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
            {isPasswordProtected ? <Save className="w-4 h-4 mr-2" /> : <FileDown className="w-4 h-4 mr-2" />}
            {isPasswordProtected ? 'Save Encrypted Recording' : 'Export Recording'}
          </>
        )}
      </Button>
    </div>
  );
};