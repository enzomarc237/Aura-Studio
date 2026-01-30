
import React from 'react';

export type DesignType = 'ui' | 'wireframe' | 'logo' | 'svg';
export type Platform = 'web' | 'mobile' | 'tablet';
export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface PaletteItem {
  hex: string;
  name: string;
}

export interface DesignState {
  image: string | null;
  sourceImage: {data: string, mimeType: string} | null;
  prompt: string;
  editPrompt: string;
  designType: DesignType;
  platform: Platform;
  timestamp: number;
  colorPalette: PaletteItem[] | null;
}

export interface Template {
  name: string;
  type: DesignType;
  prompt: string;
  image?: string;
  icon: React.ReactNode;
}

export interface AiSettings {
  imageModel: string;
  editModel: string;
  textModel: string;
  temperature: number;
  aspectRatio: AspectRatio;
}
