
import React from 'react';

export interface SocialLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export interface MainAction {
  id: string;
  primaryTextLines: string[];
  primaryColor: string;
  primaryColorRgbEquivalent?: string; // e.g., "250, 204, 21"
  secondaryText?: string;
  secondaryLink?: string;
  onDesktopSecondaryClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export interface ReleaseDetail {
  id: string;
  title: string;
  spotifyEmbedUrl: string;
  youtubeEmbedUrl: string;
  hasGame?: boolean;
  gameEmbedUrl?: string;
  gameThumbnailUrl?: string; // New field for game thumbnail URL
  details: {
    credits: string;
    mastering: string;
    releaseDate: string;
    label: string;
    distribution: string;
    isrc: string;
    genre: string;
    country: string;
    notes: string;
    beatportUrl?: string;
    appleMusicUrl?: string;
    junoUrl?: string; // New field for Juno Download link
  };
}