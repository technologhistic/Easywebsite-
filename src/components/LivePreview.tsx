import { useState, useRef, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, RotateCcw, ExternalLink, ShieldCheck, Laptop } from 'lucide-react';

interface LivePreviewProps {
  bundleHtml: string;
  rawHtml: string;
  title: string;
  sourceUrl: string;
}

type ViewportSize = 'desktop' | 'laptop' | 'tablet' | 'mobile';

export default function LivePreview({ bundleHtml, rawHtml, title, sourceUrl }: LivePreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [useReconstructed, setUseReconstructed] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeHtml = useReconstructed ? bundleHtml : rawHtml;

  const handleOpenNewTab = () => {
    const blob = new Blob([activeHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const reloadIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  // Re-inject content on mode or key change
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(activeHtml);
        doc.close();
      }
    }
  }, [activeHtml, iframeKey]);

  const viewportWidths: Record<ViewportSize, string> = {
    desktop: 'w-full',
    laptop: 'w-[1024px]',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  return (
    <div className="w-full rounded-xl bg-stone-900 border border-stone-800 flex flex-col overflow-hidden shadow-2xl">
      {/* Top Preview Controls Bar */}
      <div className="px-4 py-3 bg-stone-950 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Viewport Toggles */}
        <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800">
          <button
            onClick={() => setViewport('desktop')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
              viewport === 'desktop'
                ? 'bg-amber-400/20 text-amber-300 font-medium'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Desktop 100%"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>

          <button
            onClick={() => setViewport('laptop')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
              viewport === 'laptop'
                ? 'bg-amber-400/20 text-amber-300 font-medium'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Laptop 1024px"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Laptop</span>
          </button>

          <button
            onClick={() => setViewport('tablet')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
              viewport === 'tablet'
                ? 'bg-amber-400/20 text-amber-300 font-medium'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Tablet 768px"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>

          <button
            onClick={() => setViewport('mobile')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
              viewport === 'mobile'
                ? 'bg-amber-400/20 text-amber-300 font-medium'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Mobile 375px"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Center: Bundle vs Raw mode */}
        <div className="flex items-center gap-2">
          <span className="text-stone-400 font-mono text-[11px]">Mode:</span>
          <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-md border border-stone-800">
            <button
              onClick={() => setUseReconstructed(true)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                useReconstructed
                  ? 'bg-amber-400 text-stone-950 font-medium'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Reconstructed Bundle
            </button>
            <button
              onClick={() => setUseReconstructed(false)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                !useReconstructed
                  ? 'bg-amber-400 text-stone-950 font-medium'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Raw HTML
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={reloadIframe}
            className="p-1.5 rounded bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 transition-colors"
            title="Reload Preview"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleOpenNewTab}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Open in Tab</span>
          </button>
        </div>
      </div>

      {/* Security sandbox bar */}
      <div className="px-4 py-1.5 bg-stone-950/60 border-b border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400 font-mono">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sandboxed Execution Preview</span>
        </div>
        <div className="truncate max-w-sm">
          <span>Cloning: {sourceUrl}</span>
        </div>
      </div>

      {/* Frame Container */}
      <div className="p-4 sm:p-6 bg-stone-950/90 flex justify-center items-center min-h-[550px] overflow-auto">
        <div
          className={`${viewportWidths[viewport]} transition-all duration-300 bg-white rounded-lg shadow-2xl border border-stone-700/60 overflow-hidden flex flex-col`}
          style={{ height: '640px' }}
        >
          {/* Mock Browser Frame Header */}
          <div className="h-7 bg-stone-200 border-b border-stone-300 px-3 flex items-center justify-between text-[11px] text-stone-600 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>

            <div className="truncate max-w-xs text-center font-mono text-[10px] text-stone-500">
              {title}
            </div>

            <div className="text-[10px] text-stone-400 font-mono">100%</div>
          </div>

          {/* Sandboxed iFrame */}
          <iframe
            key={iframeKey}
            ref={iframeRef}
            title={`Preview of ${title}`}
            sandbox="allow-scripts allow-same-origin allow-forms"
            className="w-full flex-1 border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
}
