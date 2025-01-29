import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileDown, Lock, Loader2 } from 'lucide-react';
import { ExportForm } from './export/ExportForm';
import { ExportProgress } from './export/ExportProgress';
import { useExportLogic } from './export/useExportLogic';

interface ExportControlsProps {
  recordedBlob: Blob;
}

export const ExportControls = ({ recordedBlob }: ExportControlsProps) => {
  const [filename, setFilename] = useState(`recording-${Date.now()}`);
  const [selectedFormat, setSelectedFormat] = useState('webm');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');

  const {
    isExporting,
    progress,
    exportError,
    handleExport
  } = useExportLogic();

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

  const onExport = async () => {
    try {
      validateExport();
      await handleExport(recordedBlob, filename, isPasswordProtected, password, selectedFormat);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  return (
    <div className="space-y-4">
      {exportError && (
        <Alert variant="destructive">
          <AlertDescription>{exportError}</AlertDescription>
        </Alert>
      )}
      
      <ExportForm
        filename={filename}
        setFilename={setFilename}
        selectedFormat={selectedFormat}
        setSelectedFormat={setSelectedFormat}
        isPasswordProtected={isPasswordProtected}
        setIsPasswordProtected={setIsPasswordProtected}
        password={password}
        setPassword={setPassword}
        isExporting={isExporting}
      />

      {isExporting && (
        <ExportProgress
          progress={progress}
          isPasswordProtected={isPasswordProtected}
        />
      )}

      <Button
        onClick={onExport}
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