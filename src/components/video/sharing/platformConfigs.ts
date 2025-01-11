import { Mail, Youtube, Facebook, Instagram, Linkedin } from 'lucide-react';

export type Platform = 'youtube' | 'facebook' | 'instagram' | 'linkedin' | 'email';

export const platformConfigs = {
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    developerConsoleUrl: 'https://console.developers.google.com',
  },
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    developerConsoleUrl: 'https://developers.facebook.com',
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    developerConsoleUrl: 'https://developers.facebook.com',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    developerConsoleUrl: 'https://www.linkedin.com/developers',
  },
  email: {
    name: 'Email',
    icon: Mail,
    developerConsoleUrl: '',
  },
};