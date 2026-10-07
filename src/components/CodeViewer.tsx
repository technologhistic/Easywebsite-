import { useState, useMemo } from 'react';
import { Copy, Check, Download, Search, WrapText, FileCode2 } from 'lucide-react';
import { downloadText } from '../utils/zipExport';

interface CodeViewerProps {
  filename: string;
  code: string;
  language: 'html' | 'css' | 'javascript';
  sizeBytes: number;
  sourceUrl?: string;
  isExternal?: boolean;
}

export default function CodeViewer({
  filename,
  code,
  language,
  sizeBytes,
  sourceUrl,
  isExternal,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [wrapLines, setWrapLines] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const lines = useMemo(() => {
    return code.split('\n');
  }, [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const mimeTypes: Record<string, string> = {
      html: 'text/html',
      css: 'text/css',
      javascript: 'application/javascript',
    };
    downloadText(code, filename, mimeTypes[language] || 'text/plain');
  };

  const matchCount = useMemo(() => {
    if (!searchTerm.trim()) return 0;
    try {
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = code.match(regex);
      return matches ? matches.length : 0;
    } catch {
      return 0;
    }
  }, [code, searchTerm]);

  return (
    <div className="w-full rounded-xl bg-stone-900 border border-stone-800 flex flex-col overflow-hidden shadow-xl">
      <div className="px-4 py-3 bg-stone-950 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-medium text-stone-200">{filename}</span>
          </div>

          <div className="flex items-center gap-2 text-stone-400 font-mono text-[11px]">
            <span>·</span>
            <span>{(sizeBytes / 1024).toFixed(1)} KB</span>
            <span>·</span>
            <span className="tabular-nums">{lines.length} lines</span>
            {isExternal && (
              <>
                <span>·</span>
                <span className="text-amber-400/80">External Resource</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search code..."
              className="bg-stone-900 border border-stone-800 rounded-md pl-8 pr-7 py-1 text-xs text-stone-200 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 w-36 sm:w-48 transition-all font-mono"
            />
            {searchTerm && (
              <span className="absolute right-2 text-[10px] font-mono text-amber-400 tabular-nums">
                {matchCount}
              </span>
            )}
          </div>

          <button
            onClick={() => setWrapLines(!wrapLines)}
            className={`p-1.5 rounded border transition-colors ${
              wrapLines
                ? 'bg-amber-400/10 border-amber-400/40 text-amber-300'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title="Toggle Word Wrap"
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`px-2 py-1 rounded border text-[11px] font-mono transition-colors ${
              showLineNumbers
                ? 'bg-stone-800 border-stone-700 text-stone-300'
                : 'bg-stone-900 border-stone-800 text-stone-400'
            }`}
            title="Toggle Line Numbers"
          >
            #
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-mono">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 transition-colors"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {sourceUrl && sourceUrl.startsWith('http') && (
        <div className="px-4 py-1.5 bg-stone-950/80 border-b border-stone-800/80 text-[11px] font-mono text-stone-400 flex items-center justify-between">
          <div className="truncate max-w-2xl">
            <span className="text-stone-400">Source: </span>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300/80 hover:text-amber-200 underline"
            >
              {sourceUrl}
            </a>
          </div>
          <span className="text-stone-400 uppercase text-[10px] shrink-0">Direct Asset Link</span>
        </div>
      )}

      <div className="relative font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto max-h-[620px] overflow-y-auto selection:bg-amber-400/30 selection:text-white">
        <pre className="p-4 flex">
          {showLineNumbers && (
            <div
              className="select-none text-stone-400 text-right pr-4 border-r border-stone-800 font-mono text-xs shrink-0 tabular-nums"
              aria-hidden="true"
            >
              {lines.map((_, i) => (
                <div key={i} className="leading-relaxed">
                  {i + 1}
                </div>
              ))}
            </div>
          )}

          <div
            className={`pl-4 flex-1 ${
              wrapLines ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
            } text-stone-200 font-mono`}
          >
            {searchTerm.trim() ? (
              lines.map((line, idx) => {
                const isMatch = line.toLowerCase().includes(searchTerm.toLowerCase());
                return (
                  <div
                    key={idx}
                    className={`leading-relaxed ${
                      isMatch ? 'bg-amber-400/10 -mx-2 px-2 rounded-xs' : ''
                    }`}
                  >
                    {line}
                  </div>
                );
              })
            ) : (
              code
            )}
          </div>
        </pre>
      </div>
    </div>
  );
}
