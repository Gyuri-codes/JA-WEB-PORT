import { Briefcase, Calendar, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ThemeId } from '../types';
import { EXPERIENCES, THEME_CONFIGS } from '../data/portfolioData';

interface ExperienceSectionProps {
  currentTheme: ThemeId;
}

export function ExperienceSection({ currentTheme }: ExperienceSectionProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];

  const demonstratedQualities = [
    "Customer Service",
    "Communication",
    "Attention to Detail",
    "Adaptability",
    "Teamwork",
    "Service Mindset"
  ];

  return (
    <section id="experience" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-[#222222]">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.45em] text-[#C5A059] block mb-3 font-medium">
            Selected Practical Record
          </span>
          <h2 
            className="text-3xl sm:text-5xl font-serif italic font-light text-white tracking-tight"
            style={{ fontFamily: themeConfig.fontHeadline }}
          >
            Verified Field Experience
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#999999] max-w-xl mx-auto leading-relaxed font-light">
            Hands-on Supervised Industry Learning (SIL) proving composure, hygiene discipline, and client-first hospitality execution.
          </p>
        </div>

        {/* Competencies Ribbon */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-16 max-w-2xl mx-auto">
          {demonstratedQualities.map((q) => (
            <span
              key={q}
              className="px-3 py-1 text-[10px] uppercase tracking-wider font-mono bg-[#1A1A1A] border border-[#333333] text-[#CCCCCC] flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 bg-[#C5A059]" />
              <span>{q}</span>
            </span>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative border-l border-[#333333] ml-4 sm:ml-8 space-y-12 pb-4">
          {EXPERIENCES.map((exp) => (
            <div key={exp.id} className="relative pl-6 sm:pl-10 group">
              {/* Timeline marker */}
              <div 
                className="absolute -left-[5px] top-2 w-2.5 h-2.5 bg-[#C5A059] transition-transform duration-300 group-hover:scale-150"
              />

              {/* Experience Card */}
              <div className="p-8 bg-[#1A1A1A] border border-[#333333] shadow-2xl transition-all duration-300 group-hover:border-[#C5A059]/60 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#C5A059] opacity-0 group-hover:opacity-5 transition-opacity" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-[#262626]">
                  <div>
                    <h3 
                      className="text-xl sm:text-2xl font-serif italic font-light text-white tracking-wide"
                      style={{ fontFamily: themeConfig.fontHeadline }}
                    >
                      {exp.company}
                    </h3>
                    <div className="text-xs uppercase tracking-[0.2em] font-medium text-[#C5A059] flex items-center gap-2 mt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{exp.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider px-3 py-1 bg-[#141414] text-[#888888] border border-[#333333]">
                      <Calendar className="w-3 h-3 text-[#C5A059]" />
                      <span>{exp.period}</span>
                    </span>
                    <span className="text-[10px] text-[#666666] font-mono hidden sm:inline uppercase tracking-widest">
                      <MapPin className="w-3 h-3 inline mr-1 text-[#C5A059]" />
                      {exp.location}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 my-5 text-xs sm:text-sm text-[#999999] font-light relative z-10">
                  {exp.responsibilities.map((resp, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-3">
                      <span className="w-1 h-1 mt-2 bg-[#C5A059] shrink-0" />
                      <span className="leading-relaxed">{resp}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-[#262626] flex flex-wrap items-center gap-2 relative z-10">
                  <span className="text-[10px] text-[#666666] font-mono uppercase tracking-widest mr-1">Skills Demonstrated:</span>
                  {exp.skillsDemonstrated.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 bg-[#141414] text-[#C5A059] border border-[#333333]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
