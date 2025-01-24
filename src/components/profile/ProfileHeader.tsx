import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Upload } from 'lucide-react';
import { Profile } from '@/types/profile';

interface ProfileHeaderProps {
  profile: Profile | null;
  uploading: boolean;
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeader = ({ profile, uploading, onAvatarUpload }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback>
            {profile?.name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <label 
          htmlFor="avatar-upload" 
          className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer hover:bg-primary/90"
        >
          <Upload className="h-4 w-4 text-white" />
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={onAvatarUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-medium">{profile?.name || 'No name set'}</h3>
        <p className="text-sm text-muted-foreground">{profile?.email}</p>
      </div>
    </div>
  );
};