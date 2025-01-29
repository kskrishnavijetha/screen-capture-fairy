import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { generateEncryptionKey, encryptBlob } from '@/utils/encryption';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export const useExportLogic = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);

  const saveEncryptedRecording = async (
    encryptedData: ArrayBuffer,
    iv: Uint8Array,
    filename: string,
    originalBlob: Blob
  ) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Authentication required to save encrypted recordings');
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

  const handleExport = async (
    recordedBlob: Blob,
    filename: string,
    isPasswordProtected: boolean,
    password: string,
    selectedFormat: string
  ) => {
    setExportError(null);
    setIsExporting(true);
    setProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => prev < 90 ? prev + 10 : prev);
      }, 200);

      if (isPasswordProtected) {
        const blobCopy = new Blob([await recordedBlob.arrayBuffer()], { type: recordedBlob.type });
        const key = await generateEncryptionKey(password);
        const { encryptedData, iv } = await encryptBlob(blobCopy, key);
        
        if (!encryptedData || encryptedData.byteLength === 0) {
          throw new Error('Encryption failed - no data produced');
        }
        
        await saveEncryptedRecording(encryptedData, iv, filename, recordedBlob);
        clearInterval(progressInterval);
        setProgress(100);
        
        toast({
          title: "Success",
          description: "Recording encrypted and saved successfully",
        });
      } else {
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

  return {
    isExporting,
    progress,
    exportError,
    handleExport
  };
};