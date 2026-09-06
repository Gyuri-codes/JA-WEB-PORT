import { Award, ShieldCheck, CheckCircle2, Calendar, Building } from 'lucide-react';
import { ThemeId } from '../types';
import { CERTIFICATIONS, THEME_CONFIGS } from '../data/portfolioData';

interface CertificationsSectionProps {
  currentTheme: ThemeId;
}

export function CertificationsSection({ currentTheme }: CertificationsSectionProps) {
  const themeConfig = THEME_CONFIGS[currentTheme];

  return (
    <section id="certifications" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-[#222222]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.45em] text-[#C5A059] block mb-3 font-medium">
            Accreditation & Competency
          </span>
          <h2 
            className="text-3xl sm:text-5xl font-serif italic font-light text-white tracking-tight"
            style={{ fontFamily: themeConfig.fontHeadline }}
          >
            National Certifications (NC II)
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#999999] max-w-2xl mx-auto font-light leading-relaxed">
            Accredited qualifications verified by TESDA and Asian College, verifying multi-disciplinary technical mastery in hospitality and culinary arts.
          </p>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CERTIFICATIONS.map((cert) => (
            <div
              key={cert.id}
              className="p-8 bg-[#1A1A1A] border border-[#333333] hover:border-[#C5A059]/60 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group shadow-2xl"
            >
              <div className="absolute inset-0 bg-[#C5A059] opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
              {/* Top Row: Authority & Level */}
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#262626]">
                  <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-[#141414] border border-[#333333] text-[#C5A059] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{cert.badgeLevel}</span>
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#C5A059]" />
                    <span>{cert.date}</span>
                  </span>
                </div>

                <h3 
                  className="text-xl font-serif italic text-white mb-2 leading-snug group-hover:text-[#C5A059] transition-colors"
                  style={{ fontFamily: themeConfig.fontHeadline }}
                >
                  {cert.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-[#C5A059] font-medium mb-4">
                  <Building className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                  <span>Issuing Body: {cert.issuer}</span>
                </div>

                <p className="text-xs text-[#999999] leading-relaxed mb-6 font-light">
                  {cert.description}
                </p>
              </div>

              {/* Status footer */}
              <div className="pt-4 border-t border-[#262626] flex items-center justify-between text-[10px] relative z-10 font-mono uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-[#C5A059]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified & Current</span>
                </span>
                <span className="text-[#666666]">PHILIPPINES NC II</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
