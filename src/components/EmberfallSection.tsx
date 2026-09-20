import { useState } from 'react';
import { Flame, Swords, Play, ExternalLink, Eye, Zap, Shield, Sparkles, Wind, Trophy, ArrowRight, Layers, Compass } from 'lucide-react';
import { ThemeId } from '../types';
import { EMBERFALL_PROJECT_DATA, THEME_CONFIGS } from '../data/portfolioData';
import { soundManager } from '../utils/audio';

interface EmberfallSectionProps {
  currentTheme: ThemeId;
}

export function EmberfallSection({ currentTheme }: EmberfallSectionProps) {
  const [showIframePreview, setShowIframePreview] = useState(false);
  const themeConfig = THEME_CONFIGS[currentTheme];

  const handleLaunchGame = () => {
    soundManager.playSuccess();
    window.open(EMBERFALL_PROJECT_DATA.officialUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="emberfall" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-[#222222]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 border border-[#854d0e]/60 bg-[#241405]/80 text-[#f59e0b] mb-4 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-[#f59e0b] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.35em] font-medium">Featured Release · Donghua Cultivator Tower Defense</span>
          </div>

          <h2 
            className="text-4xl sm:text-6xl font-serif italic font-light text-white tracking-tight"
            style={{ fontFamily: themeConfig.fontHeadline }}
          >
            {EMBERFALL_PROJECT_DATA.title}
          </h2>

          <p className="mt-3 text-base sm:text-xl font-serif italic text-[#f59e0b]">
            "{EMBERFALL_PROJECT_DATA.tagline}"
          </p>

          <p className="mt-4 text-sm sm:text-base text-[#999999] max-w-2xl mx-auto leading-relaxed font-light">
            {EMBERFALL_PROJECT_DATA.overview}
          </p>
        </div>

        {/* Major Showcase Box */}
        <div className="bg-[#1A1A1A] border border-[#333333] shadow-2xl overflow-hidden mb-12">
          {/* Game Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 sm:px-8 py-5 border-b border-[#262626] bg-[#141414]">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 border border-[#b45309] bg-[#291405] flex items-center justify-center text-[#f59e0b] shadow-md">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-serif italic text-white block">Emberfall: Guardians of the Last Realm</span>
                <span className="text-[10px] text-[#888888] font-mono uppercase tracking-widest">
                  Live on GitHub Pages · Donghua Tower Defense
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowIframePreview(!showIframePreview)}
                id="emberfall-preview-toggle"
                className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-medium border border-[#333333] bg-[#1A1A1A] text-[#888888] hover:text-white transition-colors cursor-pointer"
              >
                <span>{showIframePreview ? 'Hide Live Preview' : 'Preview In-Page'}</span>
              </button>

              <button
                type="button"
                onClick={handleLaunchGame}
                id="play-emberfall-cta"
                className="px-6 py-2.5 text-[10px] uppercase tracking-[0.25em] font-semibold border border-[#f59e0b] text-[#f59e0b] bg-[#291405] hover:bg-[#f59e0b] hover:text-[#0F0F0F] transition-all duration-300 shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>ENTER THE REALM →</span>
              </button>
            </div>
          </div>

          {/* Interactive In-Page Frame when Toggled */}
          {showIframePreview ? (
            <div className="w-full bg-black border-b border-[#262626] relative">
              <div className="flex items-center justify-between px-6 py-2.5 bg-[#0e0e12] border-b border-[#222] text-xs">
                <div className="flex items-center gap-2 text-[#f59e0b]">
                  <Compass className="w-3.5 h-3.5 animate-spin" />
                  <span className="font-mono text-[10px] uppercase tracking-wider">Live Web Game Session</span>
                </div>
                <a
                  href={EMBERFALL_PROJECT_DATA.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-[#888] hover:text-white flex items-center gap-1 uppercase tracking-wider"
                >
                  <span>Open Fullscreen</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative w-full h-[580px] sm:h-[680px]">
                <iframe
                  src={EMBERFALL_PROJECT_DATA.officialUrl}
                  title="Emberfall Guardians Live Game"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              </div>
            </div>
          ) : (
            /* Visual Cinematic Showcase Banner */
            <div className="relative p-8 sm:p-12 bg-gradient-to-br from-[#241306] via-[#141416] to-[#0d0d10] border-b border-[#262626]">
              <div className="max-w-3xl">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#f59e0b] block mb-2">
                  Donghua Cultivation Meets Real-Time Strategy
                </span>
                <h3 
                  className="text-2xl sm:text-4xl font-serif italic text-white mb-4 leading-tight"
                  style={{ fontFamily: themeConfig.fontHeadline }}
                >
                  Command legendary cultivator guardians to protect the mortal plane from void fiends.
                </h3>
                <p className="text-xs sm:text-sm text-[#cccccc] leading-relaxed mb-6 font-light max-w-2xl">
                  Construct elemental defense formations, trigger ultimate domain expansions, harness spiritual qi paths, and level up guardians across six transcendental cultivation realms in a complete, responsive browser game.
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {EMBERFALL_PROJECT_DATA.tools.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider bg-[#100b06] text-[#f59e0b] border border-[#b45309]/40"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleLaunchGame}
                    className="px-6 py-3 text-[10px] uppercase tracking-[0.25em] font-semibold border border-[#f59e0b] text-[#0F0F0F] bg-[#f59e0b] hover:bg-white hover:text-black transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <span>Play Live on GitHub Pages</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowIframePreview(true)}
                    className="px-6 py-3 text-[10px] uppercase tracking-[0.25em] font-medium border border-[#444444] text-[#E0E0E0] bg-[#141414] hover:border-[#f59e0b] hover:text-[#f59e0b] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open In-Page Simulator</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Elemental Cultivator Guardians Grid */}
          <div className="p-8 sm:p-10">
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#262626]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#f59e0b] block mb-1">
                  Tactical Archetypes
                </span>
                <h4 
                  className="text-xl font-serif italic text-white"
                  style={{ fontFamily: themeConfig.fontHeadline }}
                >
                  Elemental Cultivator Guardians
                </h4>
              </div>
              <span className="text-xs font-mono text-[#888888] hidden sm:inline-block">
                Elemental Qi Synergies
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {EMBERFALL_PROJECT_DATA.guardians.map((g, idx) => (
                <div
                  key={g.name}
                  className="p-5 bg-[#141414] border border-[#262626] hover:border-[#f59e0b]/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#f59e0b] px-2 py-0.5 bg-[#241306] border border-[#b45309]/30">
                      {g.element}
                    </span>
                    <span className="text-[10px] font-mono text-[#666666]">0{idx + 1}</span>
                  </div>
                  <h5 className="text-sm font-serif italic text-white mb-1.5">{g.name}</h5>
                  <p className="text-xs text-[#888888] font-light leading-relaxed">
                    {g.role}
                  </p>
                </div>
              ))}
            </div>

            {/* Realm Defense Campaigns */}
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#262626]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C5A059] block mb-1">
                  Campaign Progression
                </span>
                <h4 
                  className="text-xl font-serif italic text-white"
                  style={{ fontFamily: themeConfig.fontHeadline }}
                >
                  Sanctuary Defense Realms
                </h4>
              </div>
              <span className="text-xs font-mono text-[#888888] hidden sm:inline-block">
                6 Ascending Realms
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {EMBERFALL_PROJECT_DATA.realms.map((realm) => (
                <div
                  key={realm.name}
                  className="p-5 bg-[#141414] border border-[#262626] hover:border-[#C5A059]/60 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#C5A059] block mb-2">
                      Required: {realm.power}
                    </span>
                    <h5 className="text-sm font-serif italic text-white mb-2">{realm.name}</h5>
                    <p className="text-xs text-[#888888] font-light leading-relaxed mb-4">
                      {realm.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-[#666666] uppercase tracking-wider">
                    <Shield className="w-3 h-3 text-[#f59e0b]" />
                    <span>Defend Core</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
