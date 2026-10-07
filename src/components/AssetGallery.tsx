import { useState } from 'react';
import { ExtractedAsset } from '../types';
import { ExternalLink, Copy, Check, Image as ImageIcon, Sparkles, Filter } from 'lucide-react';

interface AssetGalleryProps {
  assets: ExtractedAsset[];
}

export default function AssetGallery({ assets }: AssetGalleryProps) {
  const [filter, setFilter] = useState<'all' | 'image' | 'svg' | 'icon'>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const filteredAssets = assets.filter((asset) => {
    if (filter === 'all') return true;
    return asset.type === filter;
  });

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="w-full rounded-xl bg-stone-900 border border-stone-800 flex flex-col overflow-hidden shadow-xl">
      <div className="px-4 py-3 bg-stone-950 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <span className="font-medium text-stone-200">Discovered Media & Visual Assets</span>
          <span className="text-stone-400 font-mono text-[11px]">({assets.length} items)</span>
        </div>

        <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800">
          <Filter className="w-3.5 h-3.5 text-stone-400 ml-1.5 mr-1" />
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              filter === 'all'
                ? 'bg-amber-400/20 text-amber-300 font-medium'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            All ({assets.length})
          </button>
          <button
            onClick={() => setFilter('image')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              filter === 'image'
                ? 'bg-amber-400/20 text-amber-300 font-medium'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Images ({assets.filter((a) => a.type === 'image').length})
          </button>
          <button
            onClick={() => setFilter('svg')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              filter === 'svg'
                ? 'bg-amber-400/20 text-amber-300 font-medium'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Vectors & SVGs ({assets.filter((a) => a.type === 'svg').length})
          </button>
          <button
            onClick={() => setFilter('icon')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              filter === 'icon'
                ? 'bg-amber-400/20 text-amber-300 font-medium'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Favicon ({assets.filter((a) => a.type === 'icon').length})
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 bg-stone-900">
        {filteredAssets.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-sm">
            No assets match this category filter.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredAssets.map((asset, idx) => (
              <div
                key={idx}
                className="group rounded-lg bg-stone-950 border border-stone-800 hover:border-amber-400/50 transition-all overflow-hidden flex flex-col"
              >
                <div className="aspect-square bg-stone-900 flex items-center justify-center p-3 relative overflow-hidden">
                  {asset.url ? (
                    <img
                      src={asset.url}
                      alt={asset.alt || asset.name}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className =
                            'text-stone-400 text-xs font-mono text-center flex flex-col items-center gap-1';
                          fallback.innerHTML =
                            '<span class="text-amber-400/60 font-medium">Asset Link</span><span class="text-[10px] break-all max-w-[120px]">' +
                            asset.name +
                            '</span>';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-stone-400 gap-1">
                      <Sparkles className="w-6 h-6 text-amber-400" />
                      <span className="text-[11px] font-mono">Inline Vector</span>
                    </div>
                  )}

                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-stone-900/90 border border-stone-800 text-[10px] font-mono uppercase text-stone-400">
                    {asset.type}
                  </span>
                </div>

                <div className="p-2.5 flex-1 flex flex-col justify-between border-t border-stone-800/80">
                  <div className="text-xs font-mono text-stone-300 truncate" title={asset.name}>
                    {asset.name}
                  </div>

                  {asset.alt && (
                    <div className="text-[10px] text-stone-400 truncate mt-0.5" title={asset.alt}>
                      {asset.alt}
                    </div>
                  )}

                  {asset.url && (
                    <div className="mt-2 pt-2 border-t border-stone-800/60 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleCopy(asset.url)}
                        className="flex items-center gap-1 text-stone-400 hover:text-amber-300 transition-colors text-[11px]"
                        title="Copy Asset URL"
                      >
                        {copiedUrl === asset.url ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-mono">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy URL</span>
                          </>
                        )}
                      </button>

                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-400 hover:text-stone-200 transition-colors p-1"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
