import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FileDown, Loader2, Lock } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateEncryptionKey, encryptBlob } from '@/utils/encryption';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

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

  const validateExport = () => {
    if (!recordedBlob || recordedBlob.size === 0) {
      throw new Error('No valid recording data found');
    }
    if (!filename.trim()) {
      throw new Error('Please enter a valid filename');
    }
    if (isPasswordProtected && password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
  };

  const resetExportState = () => {
    setIsExporting(false);
    setProgress(0);
    setExportError(null);
  };

  const saveEncryptedRecording = async (encryptedData: ArrayBuffer, iv: Uint8Array) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Authentication required to save encrypted recordings');
    }

    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .getBucket('secure_files');

    if (bucketError) {
      throw new Error('Failed to access secure storage');
    }

    const encryptedBlob = new Blob([encryptedData]);
    const filePath = `${filename}-${Date.now()}`;

    const { error: uploadError } = await supabase
      .storage
      .from('secure_files')
      .upload(filePath, encryptedBlob, {
        contentType: 'application/octet-stream',
        upsert: false
      });

    if (uploadError) {
      if (uploadError.message.includes('exceeded the quota')) {
        throw new Error('Storage quota exceeded. Please delete some files or upgrade your storage plan.');
      }
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const fileData: Database['public']['Tables']['shared_files']['Insert'] = {
      file_name: filename,
      file_path: filePath,
      file_size: encryptedBlob.size,
      mime_type: 'application/octet-stream',
      is_encrypted: true,
      encryption_key: Array.from(iv).join(','),
      owner_id: user.id
    };

    const { error: dbError } = await supabase
      .from('shared_files')
      .insert(fileData);

    if (dbError) {
      throw new Error(`Failed to save file metadata: ${dbError.message}`);
    }
  };

  const handleExport = async () => {
    resetExportState();
    
    try {
      validateExport();
      setIsExporting(true);
      
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
        try {
          const blobCopy = new Blob([await recordedBlob.arrayBuffer()], { type: recordedBlob.type });
          const key = await generateEncryptionKey(password);
          const { encryptedData, iv } = await encryptBlob(blobCopy, key);
          
          if (!encryptedData || encryptedData.byteLength === 0) {
            throw new Error('Encryption failed - no data produced');
          }
          
          await saveEncryptedRecording(encryptedData, iv);
          clearInterval(progressInterval);
          setProgress(100);
          
          toast({
            title: "Success",
            description: "Recording encrypted and saved successfully",
          });
        } catch (encryptError) {
          throw new Error(encryptError instanceof Error ? encryptError.message : 'Encryption failed unexpectedly');
        }
      } else {
        try {
          const url = URL.createObjectURL(recordedBlob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `${filename}.${selectedFormat}`;
          
          document.body.appendChild(a);
          await a.click();
          
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          clearInterval(progressInterval);
          setProgress(100);
          
          toast({
            title: "Success",
            description: `Recording exported as ${selectedFormat.toUpperCase()}`,
          });
        } catch (downloadError) {
          throw new Error(`Download failed: ${downloadError.message}`);
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed unexpectedly');
      toast({
        variant: "destructive",
        title: "Export failed",
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsExporting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="space-y-4">
      {exportError && (
        <Alert variant="destructive">
          <AlertDescription>{exportError}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Filename</label>
        <Input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          disabled={isExporting}
          placeholder="Enter filename"
          className="w-full"
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
        disabled={isExporting || (isPasswordProtected && password.length < 6)}
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
