import { Youtube, Video, Twitter } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export type Platform = 'youtube' | 'vimeo' | 'twitter';

export interface PlatformConfig {
  name: string;
  icon: LucideIcon;
  description: string;
  authUrl: string;
  scope: string;
  secretKeyName: string;
  redirectUri: string;
}

export const platformConfigs: Record<Platform, PlatformConfig> = {
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    description: 'Share your video directly to YouTube',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'https://www.googleapis.com/auth/youtube.upload',
    secretKeyName: 'YOUTUBE_API_KEY',
    redirectUri: `${window.location.origin}/auth/youtube/callback`
  },
  vimeo: {
    name: 'Vimeo',
    icon: Video,
    description: 'Upload your video to Vimeo',
    authUrl: 'https://api.vimeo.com/oauth/authorize',
    scope: 'upload',
    secretKeyName: 'VIMEO_API_KEY',
    redirectUri: `${window.location.origin}/auth/vimeo/callback`
  },
  twitter: {
    name: 'Twitter',
    icon: Twitter,
    description: 'Share your video on Twitter',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    scope: 'tweet.write tweet.read users.read',
    secretKeyName: 'TWITTER_API_KEY',
    redirectUri: `${window.location.origin}/auth/twitter/callback`
  }
};