import { GraduationCap, MapPin, Heart, Flame, Sparkles, BookOpen, FileText } from 'lucide-react';
import { ThemeId } from '../types';
import { PERSONAL_INFO, UNEXPECTED_PILLARS, THEME_CONFIGS } from '../data/portfolioData';
import { ProfilePortrait } from './ProfilePortrait';

interface AboutSectionProps {
  currentTheme: ThemeId;
  onOpenResume: () => void;
}

export function AboutSection({ currentTheme, onOpenResume }: AboutSectionProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-[#222222]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.45em] text-[#C5A059] block mb-3 font-medium">
            Curriculum Vitae & Background
          </span>
          <h2 
            className="text-3xl sm:text-5xl font-serif italic font-light text-white tracking-tight"
            style={{ fontFamily: themeConfig.fontHeadline }}
          >
            Authentic Foundation. <span className="text-[#C5A059] not-italic">Driven by Curiosity.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#999999] leading-relaxed font-light">
            {PERSONAL_INFO.humblePositioning}
          </p>
        </div>

        {/* Profile Card & Credibility Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-20">
          {/* Identity Card */}
          <div className="lg:col-span-7 p-8 sm:p-10 bg-[#1A1A1A] border border-[#333333] flex flex-col justify-between relative overflow-hidden shadow-2xl group">
            <div className="absolute inset-0 bg-[#C5A059] opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
            <div className="relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                {/* Left Info Column */}
                <div className="sm:col-span-7">
                  <div className="w-14 h-14 border border-[#C5A059] bg-[#141414] flex items-center justify-center text-xl font-serif italic text-[#C5A059] mb-6 shadow-md">
                    JA
                  </div>

                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#888888] block mb-1">Undergraduate Profile</span>
                  <h3 
                    className="text-2xl sm:text-3xl font-serif italic font-light text-white mb-1"
                    style={{ fontFamily: themeConfig.fontHeadline }}
                  >
                    {PERSONAL_INFO.name}
                  </h3>
                  <div className="text-xs uppercase tracking-[0.2em] font-medium text-[#C5A059] mb-5">
                    {PERSONAL_INFO.education.degree}
                  </div>

                  <div className="space-y-3.5 text-xs text-[#999999] border-t border-[#262626] pt-5">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-4 h-4 text-[#C5A059] shrink-0" />
                      <span>{PERSONAL_INFO.education.institution} · <strong className="text-white font-medium">{PERSONAL_INFO.education.status}</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-[#C5A059] shrink-0" />
                      <span>{PERSONAL_INFO.education.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-[#C5A059] shrink-0" />
                      <span>Languages: <strong className="text-[#E0E0E0]">{PERSONAL_INFO.languages.join(' & ')}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right Portrait Column - Pristine transparent background subject */}
                <div className="sm:col-span-5 flex flex-col items-center justify-end">
                  <ProfilePortrait />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#262626] relative z-10 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onOpenResume}
                className="w-full py-3 px-4 text-[11px] uppercase tracking-[0.25em] font-semibold border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0F0F0F] transition-all duration-300 flex items-center justify-between"
              >
                <span>Open Verified Résumé</span>
                <span className="text-sm">→</span>
              </button>
            </div>
          </div>

          {/* Narrative & Grounding */}
          <div className="lg:col-span-5 p-8 sm:p-10 bg-[#141414] border border-[#333333] flex flex-col justify-center shadow-xl">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] block mb-3">Service Philosophy</span>
            <h4 className="text-xl sm:text-2xl font-serif italic text-white mb-5 leading-snug">
              Grounding in Guest Care, Reaching into Digital Craft.
            </h4>
            <div className="space-y-4 text-xs sm:text-sm text-[#999999] leading-relaxed font-light">
              <p>
                My background is solidly anchored in hospitality management at <strong className="text-white font-medium">Asian College Dumaguete</strong>. Through rigorous Supervised Industry Learning (SIL) across culinary preparation, front of house service, and dining ambiance, I have cultivated the discipline of anticipating people's needs before they speak them.
              </p>
              <p>
                Yet my creative curiosity refuses to stop at the dining room or hotel counter. In my spare hours, I immerse myself in creative technology and AI-assisted workflows—learning how to transform human hospitality principles into interactive web software, games, and engaging user interfaces.
              </p>
              <p className="text-[#C5A059] italic border-l border-[#C5A059] pl-4 py-1.5 font-serif bg-[#1A1A1A]/40">
                “I am not pretending to be a 10-year veteran engineer; I am an energetic builder and hospitality specialist exploring what happens when empathy, service excellence, and modern AI development intersect.”
              </p>
            </div>
          </div>
        </div>

        {/* The "Unexpected Combination" Section */}
        <div className="mt-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059] block mb-2 font-mono">
              Core Creative Matrix
            </span>
            <h3 
              className="text-2xl sm:text-4xl font-serif italic font-light text-white tracking-tight"
              style={{ fontFamily: themeConfig.fontHeadline }}
            >
              “Not your usual hospitality portfolio.”
            </h3>
            <p className="text-xs sm:text-sm text-[#888888] mt-2 font-light">
              Three connected pillars that shape everything Jeric creates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {UNEXPECTED_PILLARS.map((pillar, idx) => {
              const icons = [
                <Heart key="1" className="w-4 h-4 text-[#C5A059]" />,
                <Flame key="2" className="w-4 h-4 text-[#C5A059]" />,
                <Sparkles key="3" className="w-4 h-4 text-[#C5A059]" />
              ];

              return (
                <div
                  key={pillar.id}
                  className="p-8 bg-[#1A1A1A] border border-[#333333] hover:border-[#C5A059]/60 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden shadow-xl"
                >
                  <div className="absolute inset-0 bg-[#C5A059] opacity-0 group-hover:opacity-5 transition-opacity" />
                  <div className="relative z-10">
                    <div className="p-2.5 border border-[#333333] bg-[#141414] w-fit mb-5">
                      {icons[idx]}
                    </div>
                    <div className="text-[9px] font-mono text-[#666666] uppercase tracking-[0.3em] mb-1">
                      Pillar 0{idx + 1}
                    </div>
                    <h4 
                      className="text-xl font-serif italic text-white mb-1 group-hover:text-[#C5A059] transition-colors"
                      style={{ fontFamily: themeConfig.fontHeadline }}
                    >
                      {pillar.title}
                    </h4>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-[#C5A059] font-medium mb-3">
                      {pillar.subtitle}
                    </div>
                    <p className="text-xs sm:text-sm text-[#999999] leading-relaxed mb-6 font-light">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[#262626] relative z-10">
                    {pillar.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-[#141414] text-[#C5A059] border border-[#333333]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
