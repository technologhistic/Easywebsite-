import { useState } from 'react';
import { ExtractionResult } from '../types';
import {
  generateCombinedBuildZip,
  generateProjectZip,
  downloadBlob,
  downloadText,
} from '../utils/zipExport';
import {
  PackageCheck,
  FolderArchive,
  FileCode,
  Terminal,
  CheckCircle2,
  Loader2,
  Sparkles,
  Layers,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

interface ProjectExportProps {
  data: ExtractionResult;
}

export default function ProjectExport({ data }: ProjectExportProps) {
  const [isBuildingCombined, setIsBuildingCombined] = useState(false);
  const [combinedProgressMsg, setCombinedProgressMsg] = useState('');
  const [combinedPercent, setCombinedPercent] = useState(0);
  const [combinedSuccess, setCombinedSuccess] = useState(false);

  const [isZippingStandard, setIsZippingStandard] = useState(false);
  const [standardSuccess, setStandardSuccess] = useState(false);

  // 1. Download Combined Build (.ZIP with all HTML, CSS, JS, Media)
  const handleDownloadCombinedZip = async () => {
    setIsBuildingCombined(true);
    setCombinedPercent(5);
    setCombinedProgressMsg('Preparing Combined Build...');

    try {
      const blob = await generateCombinedBuildZip(data, (msg, pct) => {
        setCombinedProgressMsg(msg);
        setCombinedPercent(pct);
      });

      const safeTitle = data.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30) || 'website';
      downloadBlob(blob, `${safeTitle}-combined-build.zip`);

      setCombinedSuccess(true);
      setTimeout(() => setCombinedSuccess(false), 4000);
    } catch (err) {
      console.error('Combined Build error:', err);
    } finally {
      setIsBuildingCombined(false);
      setCombinedProgressMsg('');
      setCombinedPercent(0);
    }
  };

  // 2. Download Combined Build (.HTML standalone)
  const handleDownloadCombinedHtml = () => {
    const safeTitle = data.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30) || 'website';
    downloadText(data.reconstructedBundleHtml, `${safeTitle}-combined-build.html`, 'text/html');
  };

  // 3. Download Standard Code-only ZIP
  const handleDownloadStandardZip = async () => {
    setIsZippingStandard(true);
    try {
      const zipBlob = await generateProjectZip(data);
      const safeTitle = data.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30) || 'website';
      downloadBlob(zipBlob, `${safeTitle}-code-export.zip`);
      setStandardSuccess(true);
      setTimeout(() => setStandardSuccess(false), 3000);
    } catch (err) {
      console.error('ZIP generation failed:', err);
    } finally {
      setIsZippingStandard(false);
    }
  };

  const validMediaCount = data.assets.filter((a) => a.url && a.url.startsWith('http')).length;

  return (
    <div className="w-full space-y-6">
      {/* FEATURED: COMBINED BUILD HERO CARD */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 border-2 border-amber-400/50 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-mono text-[11px] font-bold uppercase tracking-wider">
                Recommended
              </span>
              <span className="text-xs uppercase font-mono tracking-widest text-amber-300">
                All-Inclusive Archive
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif text-stone-100 tracking-tight">
              Combined Build
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Downloads a complete offline package containing <strong>all HTML, CSS, JavaScript, and extracted media assets</strong> (images, SVGs, and favicons). Media paths are automatically re-linked locally so the site runs 100% offline.
            </p>

            {/* Included components badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono text-stone-300">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-950/80 border border-stone-800">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exact HTML</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-950/80 border border-stone-800">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Unified CSS</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-950/80 border border-stone-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Unified JavaScript</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-950/80 border border-stone-800">
                <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>{validMediaCount} Media Assets</span>
              </span>
            </div>
          </div>

          {/* Action buttons for Combined Build */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {/* Download Combined Build ZIP */}
            <button
              onClick={handleDownloadCombinedZip}
              disabled={isBuildingCombined}
              className="px-6 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-stone-800 text-stone-950 font-bold text-sm transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-amber-400/20 cursor-pointer disabled:cursor-not-allowed"
            >
              {isBuildingCombined ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Packaging Combined Build...</span>
                </>
              ) : combinedSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-950" />
                  <span>Combined Build Downloaded!</span>
                </>
              ) : (
                <>
                  <PackageCheck className="w-5 h-5" />
                  <span>Download Combined Build (.ZIP)</span>
                </>
              )}
            </button>

            {/* Download Combined Build HTML (Single-file) */}
            <button
              onClick={handleDownloadCombinedHtml}
              className="px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-amber-400/30 hover:border-amber-400/60 font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Download Combined Build (.HTML)</span>
            </button>
          </div>
        </div>

        {/* Live progress indicator during Combined Build */}
        {isBuildingCombined && (
          <div className="mt-6 pt-5 border-t border-amber-400/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-200">{combinedProgressMsg}</span>
              <span className="text-amber-400 font-bold tabular-nums">{combinedPercent}%</span>
            </div>
            <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden p-0.5 border border-stone-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-200 rounded-full transition-all duration-300"
                style={{ width: `${combinedPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ADDITIONAL EXPORT FORMATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Standard Code Export */}
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FolderArchive className="w-4 h-4 text-stone-300" />
              <h4 className="text-sm font-semibold text-stone-200">
                Standard Code-Only Archive
              </h4>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Includes <code className="text-stone-300">index.html</code>, <code className="text-stone-300">css/style.css</code>, and <code className="text-stone-300">js/app.js</code> with original remote asset links. Smaller file size without downloading remote media files.
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-stone-800 flex items-center justify-between">
            <span className="text-xs font-mono text-stone-400">
              ~{((data.stats.htmlSizeBytes + data.stats.totalCssBytes + data.stats.totalJsBytes) / 1024).toFixed(1)} KB
            </span>
            <button
              onClick={handleDownloadStandardZip}
              disabled={isZippingStandard}
              className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-medium transition-colors flex items-center gap-2"
            >
              {isZippingStandard ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Packaging...</span>
                </>
              ) : standardSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Downloaded</span>
                </>
              ) : (
                <>
                  <FolderArchive className="w-3.5 h-3.5 text-stone-400" />
                  <span>Download Code ZIP</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Combined Build File Tree */}
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <PackageCheck className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-stone-200">
              Combined Build Directory Map
            </h4>
          </div>

          <div className="p-3.5 rounded-lg bg-stone-950 border border-stone-800/80 font-mono text-xs text-stone-300 leading-relaxed">
            <div className="text-amber-300 font-semibold mb-1">📦 combined-build/</div>
            <div className="pl-4 border-l border-stone-800 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">📄 combined-build.html</span>
                <span className="text-[10px] text-stone-400">(All-in-one standalone)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">📄 index.html</span>
                <span className="text-[10px] text-stone-400">(Modular offline HTML)</span>
              </div>
              <div className="flex items-center gap-2 text-purple-400">
                <span>📁 media/</span>
                <span className="text-[10px] text-stone-400">({validMediaCount} downloaded assets)</span>
              </div>
              <div className="text-sky-400">📁 css/combined.css</div>
              <div className="text-amber-400">📁 js/combined.js</div>
              <div className="text-stone-400">📋 media-manifest.json</div>
              <div className="text-stone-400">📝 README.md</div>
            </div>
          </div>
        </div>
      </div>

      {/* How to Run Locally Guide */}
      <div className="rounded-xl bg-stone-900 border border-stone-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-semibold text-stone-200">
            Running the Combined Build Locally
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-stone-400 leading-relaxed">
          <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
            <span className="text-stone-300 font-semibold block mb-1">Direct Offline Launch</span>
            <p>Double-click <code className="text-amber-300">combined-build.html</code> or <code className="text-amber-300">index.html</code>. No server or internet connection needed.</p>
          </div>

          <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
            <span className="text-stone-300 font-semibold block mb-1">Node.js (npx serve)</span>
            <code className="text-amber-300 font-mono block bg-stone-900/60 p-1.5 rounded mt-1">
              npx serve .
            </code>
          </div>

          <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
            <span className="text-stone-300 font-semibold block mb-1">Python HTTP Server</span>
            <code className="text-amber-300 font-mono block bg-stone-900/60 p-1.5 rounded mt-1">
              python3 -m http.server 8000
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
