import React from 'react';
import { Progress } from "@/components/ui/progress";

interface ExportProgressProps {
  progress: number;
  isPasswordProtected: boolean;
}

export const ExportProgress = ({ progress, isPasswordProtected }: ExportProgressProps) => {
  return (
    <div className="space-y-2">
      <Progress value={progress} className="w-full" />
      <p className="text-sm text-center text-muted-foreground">
        {isPasswordProtected ? 'Encrypting...' : 'Converting...'} {progress}%
      </p>
    </div>
  );
};