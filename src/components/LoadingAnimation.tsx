import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Code, Palette, Cpu, Sparkles, X } from 'lucide-react';

interface LoadingAnimationProps {
  url: string;
  onCancel?: () => void;
}

const PHASES = [
  {
    icon: ShieldCheck,
    title: 'Resolving Host & Establishing Handshake',
    description: 'Negotiating connection with target server and validating response protocols.',
  },
  {
    icon: Code,
    title: 'Parsing Document Object Model',
    description: 'Deconstructing semantic tags, metadata, viewport parameters, and layout nodes.',
  },
  {
    icon: Palette,
    title: 'Harvesting Stylesheets & CSS Cascades',
    description: 'Fetching remote .css bundles, keyframes, media queries, and inline styles.',
  },
  {
    icon: Cpu,
    title: 'Decompiling Script Execution & Modules',
    description: 'Extracting client-side JavaScript packages, ES modules, and event listeners.',
  },
  {
    icon: Sparkles,
    title: 'Synthesizing Production Bundle',
    description: 'Assembling clean source code, asset manifest, and standalone sandbox package.',
  },
];

export default function LoadingAnimation({ url, onCancel }: LoadingAnimationProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedMs(elapsed);

      // Dynamically step through phases based on elapsed time
      if (elapsed > 4000) {
        setPhaseIndex(4);
      } else if (elapsed > 2800) {
        setPhaseIndex(3);
      } else if (elapsed > 1600) {
        setPhaseIndex(2);
      } else if (elapsed > 700) {
        setPhaseIndex(1);
      } else {
        setPhaseIndex(0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const currentPhase = PHASES[phaseIndex];
  const Icon = currentPhase.icon;
  const progressPercent = Math.min(94, Math.floor(18 + phaseIndex * 19 + (elapsedMs % 1000) / 100));

  return (
    <div className="w-full max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Decorative ambient subtle glow */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top status bar */}
      <div className="flex items-center justify-between pb-6 border-b border-stone-800/80">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-medium">
            Active Extraction in Progress
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-mono tabular-nums text-stone-400">
            {(elapsedMs / 1000).toFixed(1)}s elapsed
          </span>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-1 rounded-md text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              title="Cancel Extraction"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Target URL banner */}
      <div className="mt-5 p-3 rounded-lg bg-stone-950/60 border border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-xs text-stone-400 uppercase tracking-wider font-mono">Target:</span>
          <span className="text-sm font-mono text-amber-200 truncate">{url}</span>
        </div>
        <span className="text-xs text-stone-300 font-mono shrink-0 pl-2">Port 443 / SSL</span>
      </div>

      {/* Classic Center Drafting Animation Visual */}
      <div className="py-10 flex flex-col items-center justify-center">
        <div className="relative w-44 h-44 flex items-center justify-center">
          {/* Outer compass ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-dashed border-amber-500/30"
          />

          {/* Middle counter-rotating ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-3 rounded-full border border-stone-700/80"
          >
            {/* Cardinal tick notches */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-stone-500 rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-stone-500 rounded-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
          </motion.div>

          {/* Inner orbit ring with glowing sweep */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-7 rounded-full border-2 border-t-amber-400 border-r-amber-500/40 border-b-transparent border-l-transparent"
          />

          {/* Central focal node with changing icon */}
          <div className="relative z-10 w-20 h-20 rounded-full bg-stone-950 border border-amber-500/40 shadow-inner shadow-amber-500/10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={phaseIndex}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="text-amber-300"
              >
                <Icon className="w-8 h-8" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Phase Narrative */}
        <div className="mt-6 text-center max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={phaseIndex}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-serif italic text-stone-100">
                {currentPhase.title}
              </h3>
              <p className="mt-1 text-xs text-stone-400 leading-relaxed">
                {currentPhase.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Bar & Phase Ticks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-stone-400">Step {phaseIndex + 1} of {PHASES.length}</span>
          <span className="text-amber-300 tabular-nums font-semibold">{progressPercent}%</span>
        </div>

        <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden p-0.5 border border-stone-800">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-200 rounded-full"
            initial={{ width: '15%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Phase milestone labels */}
        <div className="grid grid-cols-5 gap-1 pt-1">
          {PHASES.map((p, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={`w-full h-1 rounded-full transition-colors ${
                  idx <= phaseIndex ? 'bg-amber-400' : 'bg-stone-800'
                }`}
              />
              <span
                className={`text-[10px] mt-1.5 font-mono truncate max-w-full ${
                  idx === phaseIndex
                    ? 'text-amber-300 font-semibold'
                    : idx < phaseIndex
                    ? 'text-stone-400'
                    : 'text-stone-600'
                }`}
              >
                {['Init', 'HTML', 'CSS', 'JS', 'Bundle'][idx]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
