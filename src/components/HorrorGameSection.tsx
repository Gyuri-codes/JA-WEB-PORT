import { useState } from 'react';
import { ExternalLink, Play, Ghost, Skull, Eye, Volume2, Compass, ShieldAlert, Sparkles } from 'lucide-react';
import { ThemeId } from '../types';
import { HORROR_GAME_CASE_STUDY, THEME_CONFIGS } from '../data/portfolioData';
import { soundManager } from '../utils/audio';

interface HorrorGameSectionProps {
  currentTheme: ThemeId;
}

export function HorrorGameSection({ currentTheme }: HorrorGameSectionProps) {
  const [showIframePreview, setShowIframePreview] = useState(false);
  const themeConfig = THEME_CONFIGS[currentTheme];

  const handleLaunchGame = () => {
    soundManager.playSuccess();
    window.open(HORROR_GAME_CASE_STUDY.officialUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="the-house" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-[#222222]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 border border-[#442222] bg-[#1a0f0f] text-[#ff6b6b] mb-4 shadow-sm">
            <Ghost className="w-3.5 h-3.5 text-[#ff6b6b] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.35em] font-medium">New Release · Psychological Horror Web Game</span>
          </div>
          
          <h2 
            className="text-4xl sm:text-6xl font-serif italic font-light text-white tracking-tight"
            style={{ fontFamily: themeConfig.fontHeadline }}
          >
            {HORROR_GAME_CASE_STUDY.title}
          </h2>
          
          <p className="mt-3 text-base sm:text-xl font-serif italic text-[#C5A059]">
            "{HORROR_GAME_CASE_STUDY.tagline}"
          </p>
          
          <p className="mt-4 text-sm sm:text-base text-[#999999] max-w-2xl mx-auto leading-relaxed font-light">
            {HORROR_GAME_CASE_STUDY.overview}
          </p>
        </div>

        {/* Major Showcase Box */}
        <div className="bg-[#1A1A1A] border border-[#333333] shadow-2xl overflow-hidden mb-12">
          {/* Game Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 sm:px-8 py-5 border-b border-[#262626] bg-[#141414]">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 border border-[#8b2626] bg-[#1e0d0d] flex items-center justify-center text-[#ff6b6b] shadow-md">
                <Skull className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-serif italic text-white block">The House That Remembers</span>
                <span className="text-[10px] text-[#888888] font-mono uppercase tracking-widest">
                  Live on GitHub Pages · Hotel 626 Inspired
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowIframePreview(!showIframePreview)}
                id="the-house-preview-toggle"
                className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-medium border border-[#333333] bg-[#1A1A1A] text-[#888888] hover:text-white transition-colors cursor-pointer"
              >
                <span>{showIframePreview ? 'Hide Live Preview' : 'Preview In-Page'}</span>
              </button>

              <button
                type="button"
                onClick={handleLaunchGame}
                id="play-the-house-cta"
                className="px-6 py-2.5 text-[10px] uppercase tracking-[0.25em] font-semibold border border-[#ff6b6b] text-[#ff6b6b] bg-[#1a0f0f] hover:bg-[#ff6b6b] hover:text-[#0F0F0F] transition-all duration-300 shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>ENTER THE HOUSE →</span>
              </button>
            </div>
          </div>

          {/* Embedded Live Preview (Optional interactive frame) */}
          {showIframePreview && (
            <div className="p-4 bg-[#0a0a0c] border-b border-[#262626]">
              <div className="text-[10px] text-[#888888] font-mono mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#ff6b6b]">
                  <Volume2 className="w-3 h-3" />
                  <span>Headphones recommended for spatial audio immersion</span>
                </span>
                <a 
                  href={HORROR_GAME_CASE_STUDY.officialUrl} 
                  target="_blank" 
                  rel="noreferrer noopener"
                  className="text-[#C5A059] hover:underline flex items-center gap-1"
                >
                  Launch Fullscreen <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="w-full h-[560px] overflow-hidden border border-[#332222] bg-[#000000]">
                <iframe
                  src={HORROR_GAME_CASE_STUDY.officialUrl}
                  title="The House That Remembers Game Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              </div>
            </div>
          )}

          {/* Features Grid */}
          <div className="p-6 sm:p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {HORROR_GAME_CASE_STUDY.features.map((feature, idx) => (
                <div
                  key={feature.title}
                  className="p-6 bg-[#141414] border border-[#2a2a2a] hover:border-[#ff6b6b]/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ff6b6b]">
                        0{idx + 1}
                      </span>
                      {idx === 0 && <Volume2 className="w-3.5 h-3.5 text-[#888888]" />}
                      {idx === 1 && <Compass className="w-3.5 h-3.5 text-[#888888]" />}
                      {idx === 2 && <Eye className="w-3.5 h-3.5 text-[#888888]" />}
                      {idx === 3 && <Sparkles className="w-3.5 h-3.5 text-[#888888]" />}
                    </div>
                    <h3 className="text-base font-serif italic text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-[#888888] font-light leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Atmosphere Quote & Lore Strip */}
            <div className="mt-8 p-6 bg-[#121214] border border-[#222222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C5A059]">
                  Design Philosophy · Psychological Immersion
                </div>
                <p className="text-xs sm:text-sm text-[#CCCCCC] font-light italic">
                  "True horror is not what jumps at you, but what lingers in the silence before you open the next door."
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono uppercase px-2.5 py-1 bg-[#1a0f0f] text-[#ff6b6b] border border-[#8b2626]/40">
                  Genre: {HORROR_GAME_CASE_STUDY.genre}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Callout Banner */}
        <div className="p-8 bg-[#1A1A1A] border border-[#333333] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#ff6b6b] text-[10px] font-mono uppercase tracking-widest mb-1">
              <Ghost className="w-3 h-3" />
              <span>Interactive Web Experience</span>
            </div>
            <h4 className="text-lg font-serif italic text-white">
              Dare to step inside The House That Remembers?
            </h4>
            <p className="text-xs sm:text-sm text-[#999999] font-light mt-1 max-w-xl leading-relaxed">
              Experience the psychological horror browser game developed by Jeric Abestano. Zero setup needed—playable instantly on any modern browser.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLaunchGame}
            className="shrink-0 px-6 py-3.5 text-[10px] uppercase tracking-[0.25em] font-semibold border border-[#ff6b6b] text-[#ff6b6b] bg-[#141414] hover:bg-[#ff6b6b] hover:text-[#0F0F0F] transition-all duration-300 flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <span>Enter The House Now</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
