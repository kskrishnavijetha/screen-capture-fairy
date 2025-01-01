import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle } from 'lucide-react';
import { Platform, platformConfigs } from './platformConfigs';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlatform: Platform;
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAuthenticate: () => void;
}

export const AuthDialog = ({
  open,
  onOpenChange,
  selectedPlatform,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onAuthenticate,
}: AuthDialogProps) => {
  const platform = platformConfigs[selectedPlatform];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Authentication Required
          </DialogTitle>
          <DialogDescription className="text-left space-y-2">
            <p>To share your video on {platform.name}, you'll need to:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Visit the {platform.name} Developer Console</li>
              <li>Create or select a project</li>
              <li>Generate API credentials</li>
              <li>Add them to your project settings</li>
            </ol>
            <p className="text-sm text-muted-foreground mt-2">
              Need help? Check out the {platform.name} documentation for detailed instructions.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Video Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter video title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Enter video description"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={() => window.open(platform.developerConsoleUrl, '_blank')}
          >
            Open Developer Console
          </Button>
          <Button onClick={onAuthenticate}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};