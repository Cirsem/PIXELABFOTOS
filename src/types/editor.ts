export type ScreenId = 'home' | 'gallery' | 'editor' | 'ai' | 'export';

export type ToolCategory = 'ajustes' | 'recortar' | 'filtros' | 'retoque' | 'texto' | 'fondo' | 'capas';

export interface PhotoAdjustments {
  brightness: number; // -50 to +50
  contrast: number; // -50 to +50
  saturation: number; // -50 to +50
  temperature: number; // -50 to +50
  exposure: number; // -50 to +50
  vignette: number; // 0 to 100
  blur: number; // 0 to 20
  sharpen: number; // 0 to 50
  tint: number; // -50 to +50
}

export type FilterPreset =
  | 'none'
  | 'cyber_purple'
  | 'sunset_glow'
  | 'cinematic'
  | 'vintage'
  | 'monochrome'
  | 'vibrant'
  | 'vaporwave'
  | 'emerald'
  | 'noir'
  | 'warm_glow';

export interface FilterDefinition {
  id: FilterPreset;
  name: string;
  thumbnailColor: string;
  adjustments: Partial<PhotoAdjustments>;
}

export interface LayerItem {
  id: string;
  name: string;
  type: 'image' | 'shape' | 'text' | 'sticker' | 'drawing';
  visible: boolean;
  locked: boolean;
  opacity: number; // 0 to 100
  blendMode?: string;
  x: number; // percentage or px
  y: number;
  scale: number;
  rotation: number;
  content?: string; // text string, svg path, or image data url
  color?: string;
  width?: number;
  height?: number;
  fontFamily?: string;
  fontSize?: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  thumbnail: string;
  imageSrc: string;
  lastModified: string;
  dimensions: { width: number; height: number };
  adjustments: PhotoAdjustments;
  filter: FilterPreset;
  layers: LayerItem[];
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
}

export interface ExportSettings {
  format: 'image/jpeg' | 'image/png';
  quality: number; // 0.1 to 1.0
  scale: number; // 1, 2, 4
  filename: string;
}

export type AiToolType =
  | 'object_removal'
  | 'bg_removal'
  | 'enhancement'
  | 'generative_expansion'
  | 'smart_retouch'
  | 'creative_assistant';
