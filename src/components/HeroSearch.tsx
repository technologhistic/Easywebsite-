import { FormEvent } from 'react';
import { Globe, ArrowRight, History, X } from 'lucide-react';
import { RecentExtraction } from '../types';

interface HeroSearchProps {
  url: string;
  setUrl: (url: string) => void;
  onSubmit: (e?: FormEvent) => void;
  isLoading: boolean;
  recentList: RecentExtraction[];
  onSelectRecent: (url: string) => void;
  onClearRecent: () => void;
  error?: string | null;
}

const SAMPLE_SITES = [
  { label: 'Example.com', url: 'https://example.com' },
  { label: 'Hacker News', url: 'https://news.ycombinator.com' },
  { label: 'Motherfucking Website', url: 'https://motherfuckingwebsite.com' },
  { label: 'Dan Luu Minimal', url: 'https://danluu.com' },
  { label: 'Wikipedia Web Design', url: 'https://en.wikipedia.org/wiki/Web_design' },
];

export default function HeroSearch({
  url,
  setUrl,
  onSubmit,
  isLoading,
  recentList,
  onSelectRecent,
  onClearRecent,
  error,
}: HeroSearchProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    onSubmit(e);
  };

  return (
    <section className="w-full pt-12 pb-8 border-b border-stone-800/80 bg-gradient-to-b from-stone-900/50 to-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-xs uppercase tracking-widest font-mono text-amber-400 mb-2">
          Universal Web Deconstruction Suite
        </p>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-stone-100 tracking-tight leading-tight text-balance">
          Extract exact HTML, CSS & JavaScript from any website.
        </h1>

        <p className="mt-4 text-sm sm:text-base text-stone-400 max-w-2xl mx-auto leading-relaxed">
          Paste any website URL to deconstruct its complete source code — including external stylesheets,
          embedded scripts, media assets, and a standalone single-file build bundle.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 relative max-w-2xl mx-auto">
          <div className="flex items-center rounded-xl bg-stone-900/90 border border-stone-700/80 p-1.5 shadow-2xl focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all">
            <div className="pl-3.5 pr-2 text-stone-400 flex items-center">
              <Globe className="w-5 h-5 text-amber-400" />
            </div>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste website address, e.g. https://example.com"
              disabled={isLoading}
              className="w-full bg-transparent text-stone-100 text-sm sm:text-base font-mono placeholder:font-sans placeholder:text-stone-500 focus:outline-none py-2 px-1"
            />

            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors mr-1"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-medium text-sm transition-all flex items-center gap-2 shrink-0 shadow-sm cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Extracting...' : 'Extract Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs text-left flex items-start gap-2">
              <span className="font-semibold uppercase tracking-wider text-rose-400 font-mono">Error:</span>
              <span>{error}</span>
            </div>
          )}
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-stone-400 font-mono">Quick test:</span>
          {SAMPLE_SITES.map((site) => (
            <button
              key={site.url}
              onClick={() => {
                setUrl(site.url);
                onSubmit();
              }}
              className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-200 border border-stone-800 transition-colors"
            >
              {site.label}
            </button>
          ))}
        </div>

        {recentList.length > 0 && (
          <div className="mt-6 pt-5 border-t border-stone-800/60 max-w-xl mx-auto flex items-center justify-between text-xs text-stone-400">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <History className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-stone-400 font-mono shrink-0">Recent:</span>
              <div className="flex items-center gap-2">
                {recentList.slice(0, 3).map((item) => (
                  <button
                    key={item.url}
                    onClick={() => onSelectRecent(item.url)}
                    className="truncate max-w-[140px] text-stone-400 hover:text-stone-200 underline decoration-stone-700 hover:decoration-amber-400 transition-colors"
                    title={item.url}
                  >
                    {item.title || item.url.replace(/^https?:\/\//, '')}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onClearRecent}
              className="text-stone-400 hover:text-stone-300 ml-3 text-[11px] underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
