import { useState } from 'react';
import { ExternalLink, Play, Sparkles, Gamepad2, Brain, Terminal, ChevronRight, Layers, Award, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ThemeId } from '../types';
import { MIND_MELD_CASE_STUDY, THEME_CONFIGS } from '../data/portfolioData';
import { soundManager } from '../utils/audio';

interface MindMeldSectionProps {
  currentTheme: ThemeId;
}

export function MindMeldSection({ currentTheme }: MindMeldSectionProps) {
  const [activeCaseTab, setActiveCaseTab] = useState<string>('idea');
  const [showIframePreview, setShowIframePreview] = useState(false);
  const themeConfig = THEME_CONFIGS[currentTheme];

  const handleLaunchGame = () => {
    soundManager.playSuccess();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch {
      // Confetti fallback
    }
    window.open(MIND_MELD_CASE_STUDY.officialUrl, '_blank', 'noopener,noreferrer');
  };

  const activeSectionData = MIND_MELD_CASE_STUDY.sections.find(s => s.id === activeCaseTab) || MIND_MELD_CASE_STUDY.sections[0];

  return (
    <section id="mind-meld" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-[#222222]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 border border-[#333333] bg-[#1A1A1A] text-[#C5A059] mb-4">
            <Gamepad2 className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-[10px] uppercase tracking-[0.35em] font-medium">Featured Case Study · Interactive AI Project</span>
          </div>
          <h2 
            className="text-4xl sm:text-6xl font-serif italic font-light text-white tracking-tight"
            style={{ fontFamily: themeConfig.fontHeadline }}
          >
            {MIND_MELD_CASE_STUDY.title}
          </h2>
          <p className="mt-3 text-base sm:text-xl font-serif italic text-[#C5A059]">
            "{MIND_MELD_CASE_STUDY.tagline}"
          </p>
          <p className="mt-4 text-sm sm:text-base text-[#999999] max-w-2xl mx-auto leading-relaxed font-light">
            {MIND_MELD_CASE_STUDY.overview}
          </p>
        </div>

        {/* Major Showcase Box */}
        <div className="bg-[#1A1A1A] border border-[#333333] shadow-2xl overflow-hidden mb-12">
          {/* Game Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 sm:px-8 py-5 border-b border-[#262626] bg-[#141414]">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 border border-[#C5A059] bg-[#1A1A1A] flex items-center justify-center text-[#C5A059] shadow-md">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-serif italic text-white block">MIND MELD 2.0</span>
                <span className="text-[10px] text-[#888888] font-mono uppercase tracking-widest">Live on GitHub Pages</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowIframePreview(!showIframePreview)}
                id="mind-meld-preview-toggle"
                className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-medium border border-[#333333] bg-[#1A1A1A] text-[#888888] hover:text-white transition-colors"
              >
                <span>{showIframePreview ? 'Hide Live Preview' : 'Preview In-Page'}</span>
              </button>

              <button
                onClick={handleLaunchGame}
                id="play-mind-meld-cta"
                className="px-6 py-2.5 text-[10px] uppercase tracking-[0.25em] font-semibold border border-[#C5A059] text-[#C5A059] bg-[#1A1A1A] hover:bg-[#C5A059] hover:text-[#0F0F0F] transition-all duration-300 shadow-lg flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PLAY MIND MELD →</span>
              </button>
            </div>
          </div>

          {/* Embedded Live Preview (Optional interactive frame) */}
          {showIframePreview && (
            <div className="p-4 bg-[#0F0F0F] border-b border-[#262626]">
              <div className="text-[10px] text-[#888888] font-mono mb-2 flex items-center justify-between">
                <span>Interactive Embedded Canvas (https://weiwei-97.github.io/MIND-MELD-2.0/)</span>
                <a 
                  href={MIND_MELD_CASE_STUDY.officialUrl} 
                  target="_blank" 
                  rel="noreferrer noopener"
                  className="text-[#C5A059] hover:underline flex items-center gap-1"
                >
                  Open in New Tab <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="w-full h-[520px] overflow-hidden border border-[#2a2a2a] bg-[#0c0d12]">
                <iframe
                  src={MIND_MELD_CASE_STUDY.officialUrl}
                  title="Mind Meld Game Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              </div>
            </div>
          )}

          {/* Interactive Case Study Content */}
          <div className="p-6 sm:p-10">
            {/* Case Study Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {MIND_MELD_CASE_STUDY.sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveCaseTab(sec.id)}
                  className={`p-4 text-left border transition-all ${
                    activeCaseTab === sec.id
                      ? 'bg-[#141414] border-[#C5A059] text-[#C5A059] shadow-md'
                      : 'bg-[#141414] border-[#2a2a2a] text-[#888888] hover:text-white hover:border-[#444444]'
                  }`}
                >
                  <div className="text-[9px] uppercase font-mono tracking-[0.25em] text-[#666666] mb-1">
                    Phase Breakdown
                  </div>
                  <div className="text-xs sm:text-sm font-serif italic truncate">
                    {sec.title}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Phase Detail */}
            <div className="p-8 bg-[#141414] border border-[#262626]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-[#222222]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C5A059]">
                    Phase: {activeSectionData.title}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif italic text-white mt-1">
                    {activeSectionData.subtitle}
                  </h3>
                </div>
                <div className="px-3 py-1 bg-[#1A1A1A] border border-[#333333] text-[#C5A059] text-[10px] font-mono uppercase tracking-wider w-fit">
                  Verified Case Study
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#999999] font-light leading-relaxed">
                {activeSectionData.content}
              </p>

              {/* Quick highlight checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#222222] text-xs text-[#CCCCCC] font-light">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#C5A059] shrink-0" />
                  <span>AI-assisted development workflow</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#C5A059] shrink-0" />
                  <span>Human-led creative direction</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#C5A059] shrink-0" />
                  <span>Playable in any modern browser</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Callout Banner */}
        <div className="p-8 bg-[#1A1A1A] border border-[#333333] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-lg font-serif italic text-white">
              Experience Mind Meld in Action
            </h4>
            <p className="text-xs sm:text-sm text-[#999999] font-light mt-1 max-w-xl leading-relaxed">
              "Mind Meld is an experimental game project developed with the assistance of AI tools. It demonstrates curiosity, experimentation, interaction design, and development ability."
            </p>
          </div>
          <button
            onClick={handleLaunchGame}
            className="shrink-0 px-6 py-3.5 text-[10px] uppercase tracking-[0.25em] font-semibold border border-[#C5A059] text-[#C5A059] bg-[#141414] hover:bg-[#C5A059] hover:text-[#0F0F0F] transition-all duration-300 flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <span>Play Mind Meld Now</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
