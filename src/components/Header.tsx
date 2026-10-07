interface HeaderProps {
  onSelectSample: (url: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasResult: boolean;
}

export default function Header({ onSelectSample, activeTab, setActiveTab, hasResult }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800 bg-stone-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand wordmark */}
        <a
          href="/"
          className="text-2xl font-serif italic text-stone-100 hover:text-amber-200 transition-colors tracking-tight flex items-baseline gap-1"
        >
          <span>easywebsite</span>
          <span className="text-amber-400 font-sans not-italic text-xs font-medium ml-1 px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
            PRO
          </span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-400">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-stone-100 transition-colors"
          >
            Extractor
          </button>

          {hasResult && (
            <>
              <button
                onClick={() => setActiveTab('html')}
                className={`transition-colors ${
                  activeTab === 'html' ? 'text-amber-300 font-semibold' : 'hover:text-stone-100'
                }`}
              >
                HTML
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`transition-colors ${
                  activeTab === 'css' ? 'text-amber-300 font-semibold' : 'hover:text-stone-100'
                }`}
              >
                CSS
              </button>
              <button
                onClick={() => setActiveTab('js')}
                className={`transition-colors ${
                  activeTab === 'js' ? 'text-amber-300 font-semibold' : 'hover:text-stone-100'
                }`}
              >
                JavaScript
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`transition-colors ${
                  activeTab === 'preview' ? 'text-amber-300 font-semibold' : 'hover:text-stone-100'
                }`}
              >
                Live Preview
              </button>
              <button
                onClick={() => setActiveTab('assets')}
                className={`transition-colors ${
                  activeTab === 'assets' ? 'text-amber-300 font-semibold' : 'hover:text-stone-100'
                }`}
              >
                Assets
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`transition-colors ${
                  activeTab === 'export' ? 'text-amber-300 font-semibold' : 'hover:text-stone-100'
                }`}
              >
                Combined Build
              </button>
            </>
          )}

          <a
            href="#how-it-works"
            className="hover:text-stone-100 transition-colors"
          >
            How It Works
          </a>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectSample('https://example.com')}
            className="px-3.5 py-1.5 text-xs font-medium text-amber-200 bg-amber-400/10 border border-amber-400/30 rounded-lg hover:bg-amber-400/20 hover:border-amber-400/50 transition-all whitespace-nowrap"
          >
            Try Example.com
          </button>
        </div>
      </div>
    </header>
  );
}
