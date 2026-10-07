import { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSearch from './components/HeroSearch';
import LoadingAnimation from './components/LoadingAnimation';
import CodeViewer from './components/CodeViewer';
import LivePreview from './components/LivePreview';
import AssetGallery from './components/AssetGallery';
import MetaInspector from './components/MetaInspector';
import ProjectExport from './components/ProjectExport';
import { ExtractionResult, RecentExtraction } from './types';
import { generateProjectZip, generateCombinedBuildZip, downloadBlob } from './utils/zipExport';
import {
  Code2,
  Palette,
  Cpu,
  Eye,
  Images,
  Layers,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ArrowUpRight,
  PackageCheck,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

const STORAGE_KEY = 'easywebsite_recent_extractions';

export default function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js' | 'preview' | 'assets' | 'meta' | 'export'>('html');
  const [htmlSubMode, setHtmlSubMode] = useState<'formatted' | 'bundle' | 'raw' | 'bodyOnly'>('formatted');
  const [selectedCssTab, setSelectedCssTab] = useState<string>('unified');
  const [selectedJsTab, setSelectedJsTab] = useState<string>('unified');
  const [copiedAll, setCopiedAll] = useState(false);

  // Combined Build State
  const [isBuildingCombinedTop, setIsBuildingCombinedTop] = useState(false);
  const [combinedTopMsg, setCombinedTopMsg] = useState('');
  const [combinedTopPercent, setCombinedTopPercent] = useState(0);
  const [combinedTopSuccess, setCombinedTopSuccess] = useState(false);

  // Recent searches
  const [recentList, setRecentList] = useState<RecentExtraction[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentList(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecent = (newResult: ExtractionResult) => {
    try {
      const item: RecentExtraction = {
        url: newResult.url,
        title: newResult.title,
        timestamp: Date.now(),
        techCount: newResult.detectedTech.length,
      };
      const filtered = recentList.filter((r) => r.url !== newResult.url);
      const updated = [item, ...filtered].slice(0, 8);
      setRecentList(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleClearRecent = () => {
    setRecentList([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleExtract = async (targetUrl?: string) => {
    const toExtract = targetUrl || url;
    if (!toExtract.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: toExtract }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract website code.');
      }

      setResult(data);
      saveRecent(data);
      setActiveTab('html');
      setSelectedCssTab('unified');
      setSelectedJsTab('unified');

      setTimeout(() => {
        document.getElementById('workspace-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Full Combined Build Download (HTML, CSS, JS, and Media assets)
  const handleDownloadCombinedBuild = async () => {
    if (!result || isBuildingCombinedTop) return;
    setIsBuildingCombinedTop(true);
    setCombinedTopPercent(5);
    setCombinedTopMsg('Initializing Combined Build...');

    try {
      const blob = await generateCombinedBuildZip(result, (msg, pct) => {
        setCombinedTopMsg(msg);
        setCombinedTopPercent(pct);
      });

      const safeTitle = result.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30) || 'website';
      downloadBlob(blob, `${safeTitle}-combined-build.zip`);
      setCombinedTopSuccess(true);
      setTimeout(() => setCombinedTopSuccess(false), 4000);
    } catch (err) {
      console.error('Combined Build failed:', err);
    } finally {
      setIsBuildingCombinedTop(false);
      setCombinedTopMsg('');
      setCombinedTopPercent(0);
    }
  };

  // Copy current active tab content
  const handleCopyCurrent = async () => {
    if (!result) return;
    let textToCopy = '';
    if (activeTab === 'html') {
      if (htmlSubMode === 'bundle') textToCopy = result.reconstructedBundleHtml;
      else if (htmlSubMode === 'raw') textToCopy = result.rawHtml;
      else if (htmlSubMode === 'bodyOnly') textToCopy = result.cleanedBodyHtml;
      else textToCopy = result.formattedHtml;
    } else if (activeTab === 'css') {
      if (selectedCssTab === 'unified') textToCopy = result.unifiedCss;
      else {
        const found = result.stylesheets.find((s) => s.id === selectedCssTab);
        textToCopy = found ? found.content : result.unifiedCss;
      }
    } else if (activeTab === 'js') {
      if (selectedJsTab === 'unified') textToCopy = result.unifiedJs;
      else {
        const found = result.scripts.find((s) => s.id === selectedJsTab);
        textToCopy = found ? found.content : result.unifiedJs;
      }
    }

    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      } catch {
        // fallback
      }
    }
  };

  const activeCssResource =
    selectedCssTab === 'unified'
      ? {
          name: 'unified-styles.css',
          content: result?.unifiedCss || '',
          sizeBytes: result?.stats.totalCssBytes || 0,
          url: 'All stylesheets & inline <style> combined',
          isExternal: false,
        }
      : result?.stylesheets.find((s) => s.id === selectedCssTab) || {
          name: 'stylesheet.css',
          content: '',
          sizeBytes: 0,
          url: '',
          isExternal: false,
        };

  const activeJsResource =
    selectedJsTab === 'unified'
      ? {
          name: 'unified-scripts.js',
          content: result?.unifiedJs || '',
          sizeBytes: result?.stats.totalJsBytes || 0,
          url: 'All scripts & inline <script> combined',
          isExternal: false,
        }
      : result?.scripts.find((s) => s.id === selectedJsTab) || {
          name: 'script.js',
          content: '',
          sizeBytes: 0,
          url: '',
          isExternal: false,
        };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950">
      <Header
        onSelectSample={(sampleUrl) => {
          setUrl(sampleUrl);
          handleExtract(sampleUrl);
        }}
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t as typeof activeTab)}
        hasResult={Boolean(result)}
      />

      <main className="flex-1">
        <HeroSearch
          url={url}
          setUrl={setUrl}
          onSubmit={() => handleExtract()}
          isLoading={isLoading}
          recentList={recentList}
          onSelectRecent={(recentUrl) => {
            setUrl(recentUrl);
            handleExtract(recentUrl);
          }}
          onClearRecent={handleClearRecent}
          error={error}
        />

        {isLoading && (
          <div className="px-4">
            <LoadingAnimation url={url} onCancel={() => setIsLoading(false)} />
          </div>
        )}

        {result && !isLoading && (
          <section id="workspace-results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {result.favicon && (
                    <img
                      src={result.favicon}
                      alt="Favicon"
                      className="w-5 h-5 rounded object-contain bg-stone-950 p-0.5 border border-stone-800"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                  <h2 className="text-xl sm:text-2xl font-serif text-stone-100 tracking-tight">
                    {result.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400 font-mono">
                  <a
                    href={result.finalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-300 hover:text-amber-200 underline flex items-center gap-1"
                  >
                    <span>{result.finalUrl}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                  <span aria-hidden="true">·</span>
                  <span>HTML {(result.stats.htmlSizeBytes / 1024).toFixed(1)} KB</span>
                  <span aria-hidden="true">·</span>
                  <span>CSS {(result.stats.totalCssBytes / 1024).toFixed(1)} KB ({result.stats.stylesheetCount} sheets)</span>
                  <span aria-hidden="true">·</span>
                  <span>JS {(result.stats.totalJsBytes / 1024).toFixed(1)} KB ({result.stats.scriptCount} scripts)</span>
                  <span aria-hidden="true">·</span>
                  <span>{result.stats.assetCount} media assets</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums font-semibold text-stone-300">{result.stats.responseTimeMs}ms</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-stone-400 font-mono mr-1">Stack:</span>
                  {result.detectedTech.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-[11px] font-mono text-amber-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={handleCopyCurrent}
                  className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-medium transition-colors flex items-center gap-2"
                >
                  {copiedAll ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-mono">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-stone-400" />
                      <span>Copy Current View</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('preview')}
                  className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-medium transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Interactive Preview</span>
                </button>

                <button
                  onClick={handleDownloadCombinedBuild}
                  disabled={isBuildingCombinedTop}
                  className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:bg-stone-800 text-stone-950 text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-amber-400/20 cursor-pointer disabled:cursor-not-allowed"
                  title="Download complete offline package: HTML, CSS, JS, and Media assets"
                >
                  {isBuildingCombinedTop ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                      <span>Combined Build ({combinedTopPercent}%)...</span>
                    </>
                  ) : combinedTopSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                      <span>Combined Build Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <PackageCheck className="w-4 h-4" />
                      <span>Combined Build</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {isBuildingCombinedTop && (
              <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-400/50 shadow-xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-200 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>{combinedTopMsg}</span>
                  </span>
                  <span className="text-amber-400 font-bold tabular-nums">{combinedTopPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-stone-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-200 rounded-full transition-all duration-300"
                    style={{ width: `${combinedTopPercent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-1 overflow-x-auto border-b border-stone-800 pb-px text-xs font-medium">
              <button
                onClick={() => setActiveTab('html')}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'html'
                    ? 'border-amber-400 text-amber-300 font-semibold bg-stone-900/50'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>HTML Markup</span>
                <span className="text-[10px] font-mono text-stone-400">
                  ({(result.stats.htmlSizeBytes / 1024).toFixed(1)}k)
                </span>
              </button>

              <button
                onClick={() => setActiveTab('css')}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'css'
                    ? 'border-amber-400 text-amber-300 font-semibold bg-stone-900/50'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>CSS Stylesheets</span>
                <span className="text-[10px] font-mono text-stone-400">
                  ({result.stats.stylesheetCount})
                </span>
              </button>

              <button
                onClick={() => setActiveTab('js')}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'js'
                    ? 'border-amber-400 text-amber-300 font-semibold bg-stone-900/50'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>JavaScript Scripts</span>
                <span className="text-[10px] font-mono text-stone-400">
                  ({result.stats.scriptCount})
                </span>
              </button>

              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'preview'
                    ? 'border-amber-400 text-amber-300 font-semibold bg-stone-900/50'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Live Sandbox Preview</span>
              </button>

              <button
                onClick={() => setActiveTab('assets')}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'assets'
                    ? 'border-amber-400 text-amber-300 font-semibold bg-stone-900/50'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Images className="w-4 h-4" />
                <span>Media Assets</span>
                <span className="text-[10px] font-mono text-stone-400">
                  ({result.stats.assetCount})
                </span>
              </button>

              <button
                onClick={() => setActiveTab('meta')}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'meta'
                    ? 'border-amber-400 text-amber-300 font-semibold bg-stone-900/50'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Meta & SEO Manifest</span>
              </button>

              <button
                onClick={() => setActiveTab('export')}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'export'
                    ? 'border-amber-400 text-amber-300 font-semibold bg-stone-900/50'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <PackageCheck className="w-4 h-4 text-amber-400" />
                <span>Combined Build &amp; Export</span>
              </button>
            </div>

            {activeTab === 'html' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800">
                    <button
                      onClick={() => setHtmlSubMode('formatted')}
                      className={`px-3 py-1.5 rounded transition-colors ${
                        htmlSubMode === 'formatted'
                          ? 'bg-amber-400 text-stone-950 font-medium'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Formatted HTML Document
                    </button>
                    <button
                      onClick={() => setHtmlSubMode('bundle')}
                      className={`px-3 py-1.5 rounded transition-colors ${
                        htmlSubMode === 'bundle'
                          ? 'bg-amber-400 text-stone-950 font-medium'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Self-Contained Bundle (Inlined CSS/JS)
                    </button>
                    <button
                      onClick={() => setHtmlSubMode('bodyOnly')}
                      className={`px-3 py-1.5 rounded transition-colors ${
                        htmlSubMode === 'bodyOnly'
                          ? 'bg-amber-400 text-stone-950 font-medium'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Body Markup Only
                    </button>
                    <button
                      onClick={() => setHtmlSubMode('raw')}
                      className={`px-3 py-1.5 rounded transition-colors ${
                        htmlSubMode === 'raw'
                          ? 'bg-amber-400 text-stone-950 font-medium'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Raw Server Response
                    </button>
                  </div>

                  <span className="text-xs text-stone-400 font-mono">
                    {htmlSubMode === 'bundle'
                      ? 'All external resources rewritten with absolute links & embedded styles'
                      : 'Exact semantic source document'}
                  </span>
                </div>

                <CodeViewer
                  filename={
                    htmlSubMode === 'bundle'
                      ? 'standalone-bundle.html'
                      : htmlSubMode === 'bodyOnly'
                      ? 'body-content.html'
                      : 'index.html'
                  }
                  code={
                    htmlSubMode === 'bundle'
                      ? result.reconstructedBundleHtml
                      : htmlSubMode === 'raw'
                      ? result.rawHtml
                      : htmlSubMode === 'bodyOnly'
                      ? result.cleanedBodyHtml
                      : result.formattedHtml
                  }
                  language="html"
                  sizeBytes={result.stats.htmlSizeBytes}
                  sourceUrl={result.finalUrl}
                />
              </div>
            )}

            {activeTab === 'css' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <button
                    onClick={() => setSelectedCssTab('unified')}
                    className={`px-3 py-1.5 rounded-lg border transition-colors shrink-0 flex items-center gap-1.5 ${
                      selectedCssTab === 'unified'
                        ? 'bg-amber-400 text-stone-950 border-amber-400 font-medium'
                        : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
                    }`}
                  >
                    <span>Unified CSS (All Styles)</span>
                    <span className="font-mono text-[10px] opacity-80">
                      ({(result.stats.totalCssBytes / 1024).toFixed(1)} KB)
                    </span>
                  </button>

                  {result.stylesheets.map((sheet) => (
                    <button
                      key={sheet.id}
                      onClick={() => setSelectedCssTab(sheet.id)}
                      className={`px-3 py-1.5 rounded-lg border transition-colors shrink-0 flex items-center gap-1.5 ${
                        selectedCssTab === sheet.id
                          ? 'bg-amber-400 text-stone-950 border-amber-400 font-medium'
                          : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
                      }`}
                    >
                      <span className="truncate max-w-[160px] font-mono">{sheet.name}</span>
                      <span className="font-mono text-[10px] opacity-75">
                        ({(sheet.sizeBytes / 1024).toFixed(1)}k)
                      </span>
                    </button>
                  ))}
                </div>

                <CodeViewer
                  filename={activeCssResource.name}
                  code={activeCssResource.content}
                  language="css"
                  sizeBytes={activeCssResource.sizeBytes}
                  sourceUrl={activeCssResource.url}
                  isExternal={activeCssResource.isExternal}
                />
              </div>
            )}

            {activeTab === 'js' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <button
                    onClick={() => setSelectedJsTab('unified')}
                    className={`px-3 py-1.5 rounded-lg border transition-colors shrink-0 flex items-center gap-1.5 ${
                      selectedJsTab === 'unified'
                        ? 'bg-amber-400 text-stone-950 border-amber-400 font-medium'
                        : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
                    }`}
                  >
                    <span>Unified JS (All Scripts)</span>
                    <span className="font-mono text-[10px] opacity-80">
                      ({(result.stats.totalJsBytes / 1024).toFixed(1)} KB)
                    </span>
                  </button>

                  {result.scripts.map((script) => (
                    <button
                      key={script.id}
                      onClick={() => setSelectedJsTab(script.id)}
                      className={`px-3 py-1.5 rounded-lg border transition-colors shrink-0 flex items-center gap-1.5 ${
                        selectedJsTab === script.id
                          ? 'bg-amber-400 text-stone-950 border-amber-400 font-medium'
                          : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
                      }`}
                    >
                      <span className="truncate max-w-[160px] font-mono">{script.name}</span>
                      {script.isModule && (
                        <span className="text-[9px] px-1 bg-stone-950 rounded uppercase font-mono">
                          esm
                        </span>
                      )}
                      <span className="font-mono text-[10px] opacity-75">
                        ({(script.sizeBytes / 1024).toFixed(1)}k)
                      </span>
                    </button>
                  ))}
                </div>

                <CodeViewer
                  filename={activeJsResource.name}
                  code={activeJsResource.content}
                  language="javascript"
                  sizeBytes={activeJsResource.sizeBytes}
                  sourceUrl={activeJsResource.url}
                  isExternal={activeJsResource.isExternal}
                />
              </div>
            )}

            {activeTab === 'preview' && (
              <LivePreview
                bundleHtml={result.reconstructedBundleHtml}
                rawHtml={result.rawHtml}
                title={result.title}
                sourceUrl={result.finalUrl}
              />
            )}

            {activeTab === 'assets' && <AssetGallery assets={result.assets} />}

            {activeTab === 'meta' && (
              <MetaInspector
                meta={result.meta}
                title={result.title}
                url={result.finalUrl}
                detectedTech={result.detectedTech}
                favicon={result.favicon}
              />
            )}

            {activeTab === 'export' && <ProjectExport data={result} />}
          </section>
        )}

        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-stone-900 mt-12">
          <div className="max-w-2xl mb-12">
            <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-medium">
              Extraction Architecture
            </span>
            <h2 className="text-3xl font-serif text-stone-100 mt-1">
              How easywebsite deconstructs modern websites
            </h2>
            <p className="mt-3 text-sm text-stone-400 leading-relaxed">
              Modern web pages spread their logic across minified bundles, asynchronous modules, remote CDNs,
              and inlined directives. easywebsite systematically reverses this hierarchy into clean, readable source files.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-stone-900/40 border border-stone-800/80 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-stone-200">
                01. Semantic DOM Harvesting
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Connects directly to the origin server, parses the complete HTML tree, cleans up formatting indentation,
                and isolates structural components while preserving semantic accessibility tags.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-stone-900/40 border border-stone-800/80 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-stone-200">
                02. Full Cascade Deconstruction
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Crawls and fetches all linked external CSS files, combines inline <code className="text-amber-300">&lt;style&gt;</code> blocks,
                beautifies typography and keyframes, and compiles a single unified stylesheet.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-stone-900/40 border border-stone-800/80 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-stone-200">
                03. Self-Contained Bundling &amp; Media
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Resolves relative asset paths, downloads all media into <code className="text-amber-300">media/</code>, and creates the one-click <code className="text-amber-300">Combined Build</code> package for completely offline viewing.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-stone-800 bg-stone-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-stone-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-base text-stone-200">easywebsite</span>
            <span className="text-stone-400">·</span>
            <span>The Precision Web Code &amp; Asset Extraction Engine</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px] text-stone-400">
            <span>Client-Server Architecture</span>
            <span className="text-stone-400">·</span>
            <span>Combined Build Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
