import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video } from 'lucide-react';
import { format } from 'date-fns';
import { Recording } from '@/types/recording';

interface RecordingsListProps {
  recordings: Recording[];
  onPreview: (recording: Recording) => void;
  onDownload: (recording: Recording) => void;
}

export const RecordingsList = ({ recordings, onPreview, onDownload }: RecordingsListProps) => {
  if (recordings.length === 0) {
    return <p className="text-muted-foreground">No recordings found.</p>;
  }

  return (
    <div className="space-y-4">
      {recordings.map((recording, index) => (
        <Card key={recording.id || index} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Video className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {format(recording.timestamp, 'PPpp')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(recording)}
              >
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(recording)}
              >
                Download
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};