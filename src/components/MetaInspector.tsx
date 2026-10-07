import { useState } from 'react';
import { Layers, Share2, Copy, Check, Globe } from 'lucide-react';

interface MetaInspectorProps {
  meta: Record<string, string>;
  title: string;
  url: string;
  detectedTech: string[];
  favicon?: string;
}

export default function MetaInspector({
  meta,
  title,
  url,
  detectedTech,
  favicon,
}: MetaInspectorProps) {
  const [copiedMeta, setCopiedMeta] = useState(false);

  const ogTitle = meta['og:title'] || title;
  const ogDescription = meta['og:description'] || meta['description'] || 'No page description provided.';
  const ogImage = meta['og:image'] || '';

  const metaEntries = Object.entries(meta);

  const handleCopyMetaTags = async () => {
    const snippet = metaEntries
      .map(([k, v]) => `  <meta name="${k}" content="${v.replace(/"/g, '&quot;')}" />`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedMeta(true);
      setTimeout(() => setCopiedMeta(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Technology Stack Detected */}
      <div className="rounded-xl bg-stone-900 border border-stone-800 p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-stone-200">
            Detected Architectural Frameworks & Libraries
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {detectedTech.map((tech) => (
            <div
              key={tech}
              className="px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-xs font-mono text-stone-200 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{tech}</span>
            </div>
          ))}
        </div>
      </div>

      {/* OpenGraph & Social Preview Card */}
      <div className="rounded-xl bg-stone-900 border border-stone-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-stone-200">
              Open Graph & Social Share Card Preview
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-400">og:title / og:description</span>
        </div>

        <div className="max-w-md rounded-xl bg-stone-950 border border-stone-800 overflow-hidden shadow-lg">
          {ogImage && (
            <div className="aspect-[1.91/1] w-full bg-stone-900 overflow-hidden">
              <img
                src={ogImage}
                alt="OG Preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-stone-400 font-mono">
              {favicon && (
                <img src={favicon} alt="favicon" className="w-3.5 h-3.5 object-contain" />
              )}
              <span className="truncate">{new URL(url).hostname}</span>
            </div>

            <h4 className="text-sm font-semibold text-stone-100 line-clamp-1">{ogTitle}</h4>
            <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">{ogDescription}</p>
          </div>
        </div>
      </div>

      {/* Meta Tags Table */}
      <div className="rounded-xl bg-stone-900 border border-stone-800 overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-stone-200">Document Meta Manifest</span>
            <span className="text-stone-400 font-mono text-[11px]">({metaEntries.length} tags)</span>
          </div>

          <button
            onClick={handleCopyMetaTags}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium transition-colors"
          >
            {copiedMeta ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-mono">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-400" />
                <span>Copy Meta HTML</span>
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-stone-950/60 border-b border-stone-800 text-stone-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4 w-1/3">Attribute / Name</th>
                <th className="py-2.5 px-4">Content</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-300">
              {metaEntries.map(([name, content], i) => (
                <tr key={i} className="hover:bg-stone-800/40 transition-colors">
                  <td className="py-2 px-4 text-amber-300/90 font-medium align-top break-all">
                    {name}
                  </td>
                  <td className="py-2 px-4 text-stone-300 break-all leading-relaxed font-mono">
                    {content}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
