import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoogleDrive, Dropbox, Cloud } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

type CloudProvider = 'google-drive' | 'dropbox' | 'onedrive';

interface CloudStorageSelectorProps {
  onUpload: (provider: CloudProvider) => void;
  isUploading: boolean;
}

export const CloudStorageSelector = ({ onUpload, isUploading }: CloudStorageSelectorProps) => {
  const [selectedProvider, setSelectedProvider] = React.useState<CloudProvider>('google-drive');

  const handleUpload = async () => {
    try {
      // Since we don't have backend integration yet, show a toast message
      toast({
        title: "Cloud Storage Integration",
        description: "This feature requires backend integration. Please connect your app to a backend service to enable cloud storage.",
      });
      onUpload(selectedProvider);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your recording.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Cloud Storage Provider</label>
        <Select
          value={selectedProvider}
          onValueChange={(value: CloudProvider) => setSelectedProvider(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select storage provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google-drive">
              <div className="flex items-center">
                <GoogleDrive className="w-4 h-4 mr-2" />
                Google Drive
              </div>
            </SelectItem>
            <SelectItem value="dropbox">
              <div className="flex items-center">
                <Dropbox className="w-4 h-4 mr-2" />
                Dropbox
              </div>
            </SelectItem>
            <SelectItem value="onedrive">
              <div className="flex items-center">
                <Cloud className="w-4 h-4 mr-2" />
                OneDrive
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleUpload}
        disabled={isUploading}
        className="w-full"
        variant="outline"
      >
        {isUploading ? (
          "Uploading..."
        ) : (
          <>
            <Cloud className="w-4 h-4 mr-2" />
            Upload to Cloud
          </>
        )}
      </Button>
    </div>
  );
};