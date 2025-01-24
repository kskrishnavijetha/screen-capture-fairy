import React from 'react';
import { TaskManager } from './TaskManager';
import { IssueFlags } from './IssueFlags';
import { SegmentLocks } from './SegmentLocks';
import { FlaggedSegments } from './FlaggedSegments';
import { Separator } from "@/components/ui/separator";

interface TimelineViewProps {
  videoId: string;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const TimelineView = ({ videoId, currentTime, onSeek }: TimelineViewProps) => {
  return (
    <div className="space-y-6 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg border">
      <TaskManager videoId={videoId} currentTime={currentTime} onSeek={onSeek} />
      <Separator />
      <IssueFlags videoId={videoId} currentTime={currentTime} onSeek={onSeek} />
      <Separator />
      <FlaggedSegments videoId={videoId} currentTime={currentTime} onSeek={onSeek} />
      <Separator />
      <SegmentLocks videoId={videoId} currentTime={currentTime} onSeek={onSeek} />
    </div>
  );
};