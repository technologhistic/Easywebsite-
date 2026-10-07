import * as cheerio from 'cheerio';

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

export function normalizeUrl(inputUrl: string): string {
  let trimmed = inputUrl.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = 'https://' + trimmed;
  }
  return trimmed;
}

export function getFilenameFromUrl(urlStr: string, fallback: string): string {
  try {
    const parsed = new URL(urlStr);
    const pathname = parsed.pathname;
    const segment = pathname.split('/').filter(Boolean).pop();
    if (segment && segment.includes('.')) {
      return segment.split('?')[0];
    }
  } catch {
    // fallback
  }
  return fallback;
}

export function resolveAbsoluteUrl(relativeOrAbsolute: string, baseUrl: string): string {
  try {
    return new URL(relativeOrAbsolute, baseUrl).href;
  } catch {
    return relativeOrAbsolute;
  }
}

export async function safeFetch(
  url: string,
  timeoutMs = 8000,
  asText = true
): Promise<{
  ok: boolean;
  status: number;
  text?: string;
  buffer?: ArrayBuffer;
  headers: Headers;
  url: string;
  error?: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/css,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });

    clearTimeout(timer);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        headers: response.headers,
        url: response.url || url,
        error: `HTTP ${response.status} ${response.statusText}`,
      };
    }

    if (asText) {
      const text = await response.text();
      return {
        ok: true,
        status: response.status,
        text,
        headers: response.headers,
        url: response.url || url,
      };
    } else {
      const buffer = await response.arrayBuffer();
      return {
        ok: true,
        status: response.status,
        buffer,
        headers: response.headers,
        url: response.url || url,
      };
    }
  } catch (err: unknown) {
    clearTimeout(timer);
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      status: 0,
      headers: new Headers(),
      url,
      error: message.includes('abort') ? 'Connection timed out' : message,
    };
  }
}

export function formatHtml(html: string): string {
  let formatted = '';
  let indent = 0;
  const tab = '  ';

  const tokens = html.replace(/>\s*</g, '><').split(/(<[^>]+>)/g).filter(Boolean);

  const voidTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype'
  ]);

  for (const token of tokens) {
    if (token.startsWith('</')) {
      indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + token + '\n';
    } else if (token.startsWith('<') && !token.startsWith('<!')) {
      const tagNameMatch = token.match(/<([a-zA-Z0-9:-]+)/);
      const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
      const isSelfClosing = token.endsWith('/>') || voidTags.has(tagName);

      formatted += tab.repeat(indent) + token + '\n';
      if (!isSelfClosing) {
        indent++;
      }
    } else {
      const text = token.trim();
      if (text) {
        formatted += tab.repeat(indent) + text + '\n';
      }
    }
  }

  return formatted.trim() || html;
}

export function formatCss(css: string): string {
  return css
    .replace(/\s+/g, ' ')
    .replace(/\s*{\s*/g, ' {\n  ')
    .replace(/;\s*/g, ';\n  ')
    .replace(/\s*}\s*/g, '\n}\n\n')
    .replace(/,\s*/g, ', ')
    .trim();
}

export function detectTechnologies(
  html: string,
  stylesheets: StylesheetResource[],
  scripts: ScriptResource[]
): string[] {
  const techs = new Set<string>();
  const lowerHtml = html.toLowerCase();
  const allCss = stylesheets.map((s) => s.content.toLowerCase()).join(' ');
  const allJs = scripts.map((s) => s.url.toLowerCase() + ' ' + s.content.slice(0, 5000).toLowerCase()).join(' ');

  if (lowerHtml.includes('__next_data__') || allJs.includes('_next/static') || lowerHtml.includes('/_next/')) {
    techs.add('Next.js');
    techs.add('React');
  } else if (lowerHtml.includes('react') || allJs.includes('react.production') || lowerHtml.includes('data-reactroot')) {
    techs.add('React');
  }

  if (lowerHtml.includes('data-v-') || allJs.includes('vue.global') || lowerHtml.includes('__vue__')) {
    techs.add('Vue.js');
  }

  if (lowerHtml.includes('svelte-') || allJs.includes('svelte')) {
    techs.add('Svelte');
  }

  if (lowerHtml.includes('ng-version') || lowerHtml.includes('ng-app') || allJs.includes('angular')) {
    techs.add('Angular');
  }

  if (lowerHtml.includes('wp-content') || lowerHtml.includes('wp-includes')) {
    techs.add('WordPress');
  }

  if (lowerHtml.includes('shopify') || allJs.includes('shopify')) {
    techs.add('Shopify');
  }

  if (lowerHtml.includes('tailwind') || allCss.includes('tailwindcss') || (lowerHtml.includes('flex') && lowerHtml.includes('items-center') && lowerHtml.includes('justify-between'))) {
    techs.add('Tailwind CSS');
  }

  if (lowerHtml.includes('bootstrap') || allCss.includes('bootstrap') || lowerHtml.includes('container-fluid')) {
    techs.add('Bootstrap');
  }

  if (allJs.includes('jquery') || lowerHtml.includes('jquery.min.js')) {
    techs.add('jQuery');
  }

  if (lowerHtml.includes('fonts.googleapis.com')) {
    techs.add('Google Fonts');
  }

  if (lowerHtml.includes('font-awesome') || lowerHtml.includes('fa-') || allCss.includes('font awesome')) {
    techs.add('FontAwesome');
  }

  if (lowerHtml.includes('lucide') || lowerHtml.includes('feather-')) {
    techs.add('Lucide / Feather Icons');
  }

  if (techs.size === 0) {
    techs.add('Vanilla HTML5/CSS3');
  }

  return Array.from(techs);
}

export async function extractWebsite(rawUrl: string): Promise<ExtractionResult> {
  const startTime = Date.now();
  const normalized = normalizeUrl(rawUrl);

  const parsedUrl = new URL(normalized);
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are supported.');
  }

  const mainFetch = await safeFetch(parsedUrl.href, 12000, true);
  if (!mainFetch.ok || !mainFetch.text) {
    throw new Error(mainFetch.error || `Failed to fetch website (${mainFetch.status || 'Network Error'}).`);
  }

  const finalUrl = mainFetch.url || parsedUrl.href;
  const rawHtml = mainFetch.text;

  const $ = cheerio.load(rawHtml);

  const title = $('title').first().text().trim() || parsedUrl.hostname;
  let favicon = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').first().attr('href') || '/favicon.ico';
  favicon = resolveAbsoluteUrl(favicon, finalUrl);

  const meta: Record<string, string> = {};
  $('meta').each((_, el) => {
    const name = $(el).attr('name') || $(el).attr('property') || $(el).attr('http-equiv');
    const content = $(el).attr('content');
    if (name && content) {
      meta[name] = content;
    }
  });

  const rawStylesheets: Array<{ url?: string; isExternal: boolean; content?: string }> = [];

  $('link[rel*="stylesheet"], link[as="style"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      const absUrl = resolveAbsoluteUrl(href, finalUrl);
      rawStylesheets.push({
        url: absUrl,
        isExternal: true,
      });
    }
  });

  $('style').each((_, el) => {
    const styleContent = $(el).html() || '';
    if (styleContent.trim()) {
      rawStylesheets.push({
        isExternal: false,
        content: styleContent,
      });
    }
  });

  const rawScripts: Array<{ url?: string; isExternal: boolean; isModule: boolean; content?: string }> = [];

  $('script').each((_, el) => {
    const src = $(el).attr('src');
    const type = $(el).attr('type') || '';
    const isModule = type === 'module';

    if (src) {
      const absUrl = resolveAbsoluteUrl(src, finalUrl);
      rawScripts.push({
        url: absUrl,
        isExternal: true,
        isModule,
      });
    } else {
      const scriptContent = $(el).html() || '';
      if (scriptContent.trim()) {
        rawScripts.push({
          isExternal: false,
          isModule,
          content: scriptContent,
        });
      }
    }
  });

  const assets: ExtractedAsset[] = [];
  const seenAssets = new Set<string>();

  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('srcset');
    if (src) {
      const firstSrc = src.split(',')[0].trim().split(' ')[0];
      const abs = resolveAbsoluteUrl(firstSrc, finalUrl);
      if (!seenAssets.has(abs) && abs.startsWith('http')) {
        seenAssets.add(abs);
        assets.push({
          type: abs.endsWith('.svg') ? 'svg' : 'image',
          url: abs,
          originalSrc: firstSrc,
          alt: $(el).attr('alt') || '',
          name: getFilenameFromUrl(abs, `image-${assets.length + 1}.png`),
        });
      }
    }
  });

  if (!seenAssets.has(favicon) && favicon.startsWith('http')) {
    seenAssets.add(favicon);
    assets.push({
      type: 'icon',
      url: favicon,
      originalSrc: favicon,
      alt: 'Favicon',
      name: 'favicon.ico',
    });
  }

  $('svg').each((idx) => {
    if (idx < 10) {
      assets.push({
        type: 'svg',
        url: '',
        originalSrc: 'Inline SVG element',
        alt: `Inline SVG #${idx + 1}`,
        name: `vector-${idx + 1}.svg`,
      });
    }
  });

  const stylesheetPromises = rawStylesheets.slice(0, 15).map(async (item, index): Promise<StylesheetResource> => {
    if (!item.isExternal) {
      const formatted = formatCss(item.content || '');
      return {
        id: `css-inline-${index}`,
        name: `inline-style-${index + 1}.css`,
        url: '(inline <style>)',
        isExternal: false,
        content: formatted,
        sizeBytes: Buffer.byteLength(item.content || '', 'utf8'),
        status: 'ok',
      };
    }

    const fileUrl = item.url!;
    const filename = getFilenameFromUrl(fileUrl, `stylesheet-${index + 1}.css`);
    const fetchResult = await safeFetch(fileUrl, 6000, true);

    if (fetchResult.ok && fetchResult.text) {
      return {
        id: `css-ext-${index}`,
        name: filename,
        url: fileUrl,
        isExternal: true,
        content: formatCss(fetchResult.text),
        sizeBytes: Buffer.byteLength(fetchResult.text, 'utf8'),
        status: 'ok',
      };
    } else {
      return {
        id: `css-ext-${index}`,
        name: filename,
        url: fileUrl,
        isExternal: true,
        content: `/* Failed to retrieve remote stylesheet: ${fetchResult.error || 'Blocked by host'} */`,
        sizeBytes: 0,
        status: 'failed',
        error: fetchResult.error,
      };
    }
  });

  const scriptPromises = rawScripts.slice(0, 15).map(async (item, index): Promise<ScriptResource> => {
    if (!item.isExternal) {
      return {
        id: `js-inline-${index}`,
        name: `inline-script-${index + 1}.js`,
        url: '(inline <script>)',
        isExternal: false,
        isModule: item.isModule,
        content: item.content || '',
        sizeBytes: Buffer.byteLength(item.content || '', 'utf8'),
        status: 'ok',
      };
    }

    const fileUrl = item.url!;
    const filename = getFilenameFromUrl(fileUrl, `script-${index + 1}.js`);
    const fetchResult = await safeFetch(fileUrl, 6000, true);

    if (fetchResult.ok && fetchResult.text) {
      return {
        id: `js-ext-${index}`,
        name: filename,
        url: fileUrl,
        isExternal: true,
        isModule: item.isModule,
        content: fetchResult.text,
        sizeBytes: Buffer.byteLength(fetchResult.text, 'utf8'),
        status: 'ok',
      };
    } else {
      return {
        id: `js-ext-${index}`,
        name: filename,
        url: fileUrl,
        isExternal: true,
        isModule: item.isModule,
        content: `// Remote script could not be downloaded directly: ${fetchResult.error || 'CORS / Protected'}\n// Source: ${fileUrl}`,
        sizeBytes: 0,
        status: 'failed',
        error: fetchResult.error,
      };
    }
  });

  const [stylesheets, scripts] = await Promise.all([
    Promise.all(stylesheetPromises),
    Promise.all(scriptPromises),
  ]);

  const unifiedCss = stylesheets
    .map((s) => `/* ==========================================\n   File: ${s.name} (${s.url})\n   ========================================== */\n${s.content}\n`)
    .join('\n\n');

  const unifiedJs = scripts
    .map((s) => `// ==========================================\n// Script: ${s.name} (${s.url})\n// ==========================================\n${s.content}\n`)
    .join('\n\n');

  const $bundle = cheerio.load(rawHtml);

  $bundle('img').each((_, el) => {
    const src = $bundle(el).attr('src');
    if (src) {
      $bundle(el).attr('src', resolveAbsoluteUrl(src, finalUrl));
    }
  });

  $bundle('a').each((_, el) => {
    const href = $bundle(el).attr('href');
    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
      $bundle(el).attr('href', resolveAbsoluteUrl(href, finalUrl));
    }
  });

  $bundle('link[rel*="stylesheet"]').remove();
  $bundle('head').append(`\n  <style id="easywebsite-extracted-styles">\n${unifiedCss}\n  </style>\n`);

  const reconstructedBundleHtml = $bundle.html() || rawHtml;
  const formattedHtml = formatHtml(rawHtml);
  const cleanedBodyHtml = formatHtml($('body').html() || '');

  const detectedTech = detectTechnologies(rawHtml, stylesheets, scripts);

  const totalCssBytes = stylesheets.reduce((acc, s) => acc + s.sizeBytes, 0);
  const totalJsBytes = scripts.reduce((acc, s) => acc + s.sizeBytes, 0);

  return {
    url: parsedUrl.href,
    finalUrl,
    title,
    favicon,
    meta,
    rawHtml,
    formattedHtml,
    cleanedBodyHtml,
    stylesheets,
    unifiedCss,
    scripts,
    unifiedJs,
    assets,
    detectedTech,
    reconstructedBundleHtml,
    stats: {
      htmlSizeBytes: Buffer.byteLength(rawHtml, 'utf8'),
      totalCssBytes,
      totalJsBytes,
      stylesheetCount: stylesheets.length,
      scriptCount: scripts.length,
      assetCount: assets.length,
      extractedAt: new Date().toISOString(),
      responseTimeMs: Date.now() - startTime,
    },
  };
}
