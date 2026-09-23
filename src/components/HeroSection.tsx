import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Gamepad2, Compass, Layers, Coffee, Cpu, HeartHandshake, Ghost, Flame, Palmtree } from 'lucide-react';
import { ThemeId } from '../types';
import { PERSONAL_INFO, THEME_CONFIGS } from '../data/portfolioData';

interface HeroSectionProps {
  currentTheme: ThemeId;
  onOpenResume: () => void;
}

export function HeroSection({ currentTheme, onOpenResume }: HeroSectionProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];

  // Dynamic Experience Map pairs
  const mapPairs = [
    { hospitality: "Guest Service Care", digital: "User-Centered Experience" },
    { hospitality: "Food & Beverage Craft", digital: "AI-Assisted Prototyping" },
    { hospitality: "Front Office Operations", digital: "Interactive System Flow" },
    { hospitality: "Active Listening", digital: "Empathic Product Design" },
    { hospitality: "Operational Multitasking", digital: "Rapid Digital Iteration" }
  ];

  const [activePairIndex, setActivePairIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePairIndex((prev) => (prev + 1) % mapPairs.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [mapPairs.length]);

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMindMeld = () => {
    document.getElementById('mind-meld')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center justify-center pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto w-full text-center relative z-10">
        {/* Artistic Flair Eyebrow Header */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 border border-[#333333] bg-[#1A1A1A] mb-8">
          <div className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.45em] text-[#C5A059] font-medium">
            {themeConfig.terms.heroTag}
          </span>
        </div>

        {/* Distinctive Positioning Headline with Editorial Serif Italic */}
        <h1 
          className="text-4xl sm:text-6xl md:text-7xl font-serif font-light tracking-tight text-white mb-6 leading-[1.05] sm:leading-[0.98] max-w-4xl mx-auto"
          style={{ fontFamily: themeConfig.fontHeadline }}
        >
          I create <span className="italic font-normal text-[#C5A059]">experiences</span> people remember
        </h1>

        {/* Supporting Text with Editorial Tone */}
        <p className="text-sm sm:text-base text-[#999999] max-w-2xl mx-auto font-light leading-relaxed mb-10">
          {PERSONAL_INFO.positioningSupport}
        </p>

        {/* Primary Action Buttons - Architectural outlined gold & sleek dark */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={scrollToProjects}
            id="hero-view-work-btn"
            className="w-full sm:w-auto px-8 py-4 text-[11px] uppercase tracking-[0.3em] font-semibold border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0F0F0F] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-lg group"
          >
            <span>VIEW MY WORK</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={scrollToContact}
            id="hero-connect-btn"
            className="w-full sm:w-auto px-8 py-4 text-[11px] uppercase tracking-[0.3em] font-medium border border-[#333333] text-[#E0E0E0] bg-[#141414] hover:border-[#C5A059]/60 hover:text-[#C5A059] transition-all duration-300 cursor-pointer"
          >
            LET'S CONNECT
          </button>
        </div>

        {/* Subtle Secondary Project Links */}
        <div className="mb-14 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://gyuri-codes.github.io/Alon-Aninag/"
            target="_blank"
            rel="noopener noreferrer"
            id="hero-alon-aninag-link"
            className="inline-flex items-center gap-2 text-xs text-[#2dd4bf] hover:text-white transition-colors group px-4 py-2 border border-[#0d5257] bg-[#072427]/80 hover:bg-[#0b383c] shadow-sm cursor-pointer"
          >
            <Palmtree className="w-3.5 h-3.5 text-[#2dd4bf] transition-transform group-hover:scale-110" />
            <span className="uppercase tracking-[0.2em] font-medium">
              Featured: Alon Aninag
            </span>
            <span className="text-[#14b8a6] font-light lowercase">(resort site)</span>
          </a>

          <button
            onClick={() => document.getElementById('emberfall')?.scrollIntoView({ behavior: 'smooth' })}
            id="hero-emberfall-link"
            className="inline-flex items-center gap-2 text-xs text-[#f59e0b] hover:text-white transition-colors group px-4 py-2 border border-[#b45309]/50 bg-[#291405]/80 hover:bg-[#3d1e08] shadow-sm cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-[#f59e0b] transition-transform group-hover:scale-110" />
            <span className="uppercase tracking-[0.2em] font-medium">
              Featured: Emberfall
            </span>
            <span className="text-[#d97706] font-light lowercase">(tower defense)</span>
          </button>

          <a
            href="https://gyuri-codes.github.io/RURU/"
            target="_blank"
            rel="noopener noreferrer"
            id="hero-ruru-link"
            className="inline-flex items-center gap-2 text-xs text-[#88c0d0] hover:text-white transition-colors group px-4 py-2 border border-[#1f3a4d] bg-[#0c161f] hover:bg-[#132330] shadow-sm cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#88c0d0] transition-transform group-hover:rotate-45" />
            <span className="uppercase tracking-[0.2em] font-medium">
              Featured: RURU Night Journey
            </span>
            <span className="text-[#6d8a9e] font-light lowercase">(3D WebGL)</span>
          </a>

          <button
            onClick={() => document.getElementById('the-house')?.scrollIntoView({ behavior: 'smooth' })}
            id="hero-the-house-link"
            className="inline-flex items-center gap-2 text-xs text-[#ff9999] hover:text-white transition-colors group px-4 py-2 border border-[#442222] bg-[#1a0f0f] hover:bg-[#2a1414] shadow-sm cursor-pointer"
          >
            <Ghost className="w-3.5 h-3.5 text-[#ff6b6b] transition-transform group-hover:scale-110" />
            <span className="uppercase tracking-[0.2em] font-medium">
              The House That Remembers
            </span>
            <span className="text-[#888888] font-light lowercase">(horror web game)</span>
          </button>

          <button
            onClick={scrollToMindMeld}
            id="hero-mind-meld-link"
            className="inline-flex items-center gap-2.5 text-xs text-[#888888] hover:text-[#C5A059] transition-colors group px-4 py-2 border border-[#2a2a2a] bg-[#141414] hover:bg-[#1a1a1a] cursor-pointer"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-[#C5A059] transition-transform group-hover:rotate-12" />
            <span className="uppercase tracking-[0.2em] font-medium">
              Mind Meld 2.0
            </span>
            <span className="text-[#555555] font-light lowercase">({PERSONAL_INFO.currentProject.subtitle})</span>
          </button>
        </div>

        {/* Elegant Architectural Visual Element: Experience Translation Map */}
        <div className="max-w-2xl mx-auto p-6 bg-[#1A1A1A] border border-[#333333] shadow-2xl relative">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-[#888888] border-b border-[#262626] pb-3 mb-4">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#C5A059]" />
              <span className="text-[#C5A059]">Service × Digital Translation Map</span>
            </span>
            <span className="text-[#555555] font-mono text-[9px]">PERSPECTIVE 0{activePairIndex + 1} / 05</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center py-2">
            {/* Hospitality Foundation */}
            <div className="p-4 bg-[#141414] border border-[#2a2a2a] text-left flex items-start gap-3.5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#C5A059] opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="p-2 border border-[#333333] bg-[#1A1A1A] text-[#C5A059] shrink-0 mt-0.5">
                <Coffee className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.25em] text-[#666666]">Hospitality Discipline</div>
                <div className="text-sm font-serif italic text-white transition-all mt-0.5">
                  {mapPairs[activePairIndex].hospitality}
                </div>
              </div>
            </div>

            {/* Digital / Creative Horizon */}
            <div className="p-4 bg-[#141414] border border-[#2a2a2a] text-left flex items-start gap-3.5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#C5A059] opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="p-2 border border-[#333333] bg-[#1A1A1A] text-[#C5A059] shrink-0 mt-0.5">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.25em] text-[#666666]">Digital Architecture</div>
                <div className="text-sm font-serif italic text-[#C5A059] transition-all mt-0.5">
                  {mapPairs[activePairIndex].digital}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-[#262626]">
            {mapPairs.map((_, i) => (
              <button
                key={i}
                onClick={() => setActivePairIndex(i)}
                className={`h-1 transition-all ${
                  activePairIndex === i ? 'w-8 bg-[#C5A059]' : 'w-2 bg-[#333333] hover:bg-[#555555]'
                }`}
                aria-label={`Show experience pair ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
