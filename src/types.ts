export interface ExtractedAsset {
  type: 'image' | 'svg' | 'font' | 'icon';
  url: string;
  originalSrc: string;
  alt?: string;
  name: string;
}

export interface StylesheetResource {
  id: string;
  name: string;
  url: string;
  isExternal: boolean;
  content: string;
  sizeBytes: number;
  status: 'ok' | 'failed' | 'empty';
  error?: string;
}

export interface ScriptResource {
  id: string;
  name: string;
  url: string;
  isExternal: boolean;
  isModule: boolean;
  content: string;
  sizeBytes: number;
  status: 'ok' | 'failed' | 'empty';
  error?: string;
}

export interface ExtractionResult {
  url: string;
  finalUrl: string;
  title: string;
  favicon?: string;
  meta: Record<string, string>;
  rawHtml: string;
  formattedHtml: string;
  cleanedBodyHtml: string;
  stylesheets: StylesheetResource[];
  unifiedCss: string;
  scripts: ScriptResource[];
  unifiedJs: string;
  assets: ExtractedAsset[];
  detectedTech: string[];
  reconstructedBundleHtml: string;
  stats: {
    htmlSizeBytes: number;
    totalCssBytes: number;
    totalJsBytes: number;
    stylesheetCount: number;
    scriptCount: number;
    assetCount: number;
    extractedAt: string;
    responseTimeMs: number;
  };
}

export interface RecentExtraction {
  url: string;
  title: string;
  timestamp: number;
  techCount: number;
}
