import { Youtube, Video, Twitter, Facebook, Instagram, Linkedin, Mail } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export type Platform = 'youtube' | 'vimeo' | 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'email' | 'gmail';

export interface PlatformConfig {
  name: string;
  icon: LucideIcon;
  description: string;
  authUrl: string;
  scope: string;
  secretKeyName: string;
  redirectUri: string;
  developerConsoleUrl: string;
}

export const platformConfigs: Record<Platform, PlatformConfig> = {
  email: {
    name: 'Email',
    icon: Mail,
    description: 'Share your video via email',
    authUrl: '',
    scope: '',
    secretKeyName: '',
    redirectUri: '',
    developerConsoleUrl: ''
  },
  gmail: {
    name: 'Gmail',
    icon: Mail,
    description: 'Share your video via Gmail',
    authUrl: '',
    scope: '',
    secretKeyName: '',
    redirectUri: '',
    developerConsoleUrl: ''
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    description: 'Share your video directly to YouTube',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'https://www.googleapis.com/auth/youtube.upload',
    secretKeyName: 'YOUTUBE_API_KEY',
    redirectUri: `${window.location.origin}/auth/youtube/callback`,
    developerConsoleUrl: 'https://console.developers.google.com/'
  },
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    description: 'Share your video on Facebook',
    authUrl: 'https://www.facebook.com/v12.0/dialog/oauth',
    scope: 'publish_video',
    secretKeyName: 'FACEBOOK_API_KEY',
    redirectUri: `${window.location.origin}/auth/facebook/callback`,
    developerConsoleUrl: 'https://developers.facebook.com/'
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    description: 'Share your video on Instagram',
    authUrl: 'https://api.instagram.com/oauth/authorize',
    scope: 'basic',
    secretKeyName: 'INSTAGRAM_API_KEY',
    redirectUri: `${window.location.origin}/auth/instagram/callback`,
    developerConsoleUrl: 'https://developers.facebook.com/'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    description: 'Share your video on LinkedIn',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    scope: 'w_member_social',
    secretKeyName: 'LINKEDIN_API_KEY',
    redirectUri: `${window.location.origin}/auth/linkedin/callback`,
    developerConsoleUrl: 'https://www.linkedin.com/developers/'
  },
  vimeo: {
    name: 'Vimeo',
    icon: Video,
    description: 'Upload your video to Vimeo',
    authUrl: 'https://api.vimeo.com/oauth/authorize',
    scope: 'upload',
    secretKeyName: 'VIMEO_API_KEY',
    redirectUri: `${window.location.origin}/auth/vimeo/callback`,
    developerConsoleUrl: 'https://developer.vimeo.com/'
  },
  twitter: {
    name: 'Twitter',
    icon: Twitter,
    description: 'Share your video on Twitter',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    scope: 'tweet.write tweet.read users.read',
    secretKeyName: 'TWITTER_API_KEY',
    redirectUri: `${window.location.origin}/auth/twitter/callback`,
    developerConsoleUrl: 'https://developer.twitter.com/en/portal/dashboard'
  }
};