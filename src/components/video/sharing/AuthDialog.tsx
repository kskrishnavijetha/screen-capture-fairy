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
} from "@/components/ui/dialog";
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share to {platform.name}</DialogTitle>
          <DialogDescription>
            {platform.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
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
          <Button onClick={onAuthenticate} className="w-full">
            Authenticate with {platform.name}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};