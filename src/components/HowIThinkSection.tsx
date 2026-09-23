import { ArrowRight, Compass, Sparkles, Workflow, CheckCircle2 } from 'lucide-react';
import { ThemeId } from '../types';
import { HOW_I_THINK_STEPS, SERVICES, CREATIVE_PROCESS, THEME_CONFIGS } from '../data/portfolioData';

interface HowIThinkSectionProps {
  currentTheme: ThemeId;
}

export function HowIThinkSection({ currentTheme }: HowIThinkSectionProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-[#222222]">
      <div className="max-w-6xl mx-auto">
        {/* "How I Think" Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.45em] text-[#C5A059] block mb-3 font-medium">
            Philosophy & Convergence
          </span>
          <h2 
            className="text-3xl sm:text-5xl font-serif italic font-light text-white tracking-tight"
            style={{ fontFamily: themeConfig.fontHeadline }}
          >
            “I’m interested in what happens when different worlds meet”
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#999999] max-w-xl mx-auto font-light leading-relaxed">
            Where human empathy and digital tools elevate one another into something memorable.
          </p>
        </div>

        {/* Intersection Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-24">
          {HOW_I_THINK_STEPS.map((step, idx) => (
            <div
              key={step.worldA}
              className="p-6 bg-[#1A1A1A] border border-[#333333] hover:border-[#C5A059]/60 transition-all duration-300 relative overflow-hidden group shadow-xl flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-[#C5A059] opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
              <div className="relative z-10">
                <span className="text-[9px] font-mono text-[#C5A059] block mb-2 uppercase tracking-[0.25em]">
                  Nexus 0{idx + 1}
                </span>
                <div className="text-sm font-serif italic text-white mb-1">
                  {step.worldA}
                </div>
                <div className="text-xs uppercase tracking-wider text-[#C5A059] flex items-center gap-1.5 mb-3 font-mono">
                  <ArrowRight className="w-3 h-3 shrink-0" />
                  <span>{step.worldB}</span>
                </div>
                <p className="text-xs text-[#999999] font-light leading-relaxed">
                  {step.insight}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Services / What Jeric Brings to Clients */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[10px] uppercase tracking-[0.45em] text-[#C5A059] block mb-3 font-medium">
              {themeConfig.terms.services}
            </span>
            <h3 
              className="text-2xl sm:text-4xl font-serif italic font-light text-white tracking-tight"
              style={{ fontFamily: themeConfig.fontHeadline }}
            >
              Client & Operational Value
            </h3>
            <p className="text-xs sm:text-sm text-[#888888] mt-2 font-light">
              How Jeric applies his background to solve real challenges for organizations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((srv) => (
              <div
                key={srv.id}
                className="p-8 bg-[#1A1A1A] border border-[#333333] hover:border-[#C5A059]/60 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group shadow-2xl"
              >
                <div className="absolute inset-0 bg-[#C5A059] opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-10 h-10 border border-[#333333] bg-[#141414] flex items-center justify-center text-[#C5A059] mb-5">
                    <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  </div>
                  <h4 className="text-lg font-serif italic text-white mb-2 group-hover:text-[#C5A059] transition-colors">
                    {srv.title}
                  </h4>
                  <p className="text-xs text-[#999999] font-light leading-relaxed">
                    {srv.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Creative Process */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[10px] uppercase tracking-[0.45em] text-[#C5A059] block mb-3 font-medium">
              {themeConfig.terms.process}
            </span>
            <h3 
              className="text-2xl sm:text-4xl font-serif italic font-light text-white tracking-tight"
              style={{ fontFamily: themeConfig.fontHeadline }}
            >
              The Execution Framework
            </h3>
            <p className="text-xs sm:text-sm text-[#888888] mt-2 font-light">
              From attentive listening to polished deployment
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CREATIVE_PROCESS.map((p) => (
              <div
                key={p.step}
                className="p-5 bg-[#141414] border border-[#2a2a2a] text-center flex flex-col items-center justify-between hover:border-[#C5A059]/50 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] block mb-1">
                    {p.step}
                  </span>
                  <span className="text-sm font-serif italic text-white block mb-1.5">
                    {p.name}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-[#888888] uppercase tracking-wider leading-snug">
                  {p.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
