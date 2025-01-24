import React from 'react';
import { TaskManager } from './TaskManager';
import { IssueFlags } from './IssueFlags';
import { Separator } from "@/components/ui/separator";

interface TimelineViewProps {
  videoId: string;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const TimelineView = ({ videoId, currentTime, onSeek }: TimelineViewProps) => {
  return (
    <div className="space-y-6 p-4 bg-background/95 rounded-lg border">
      <TaskManager videoId={videoId} currentTime={currentTime} />
      <Separator />
      <IssueFlags videoId={videoId} currentTime={currentTime} onSeek={onSeek} />
    </div>
  );
};